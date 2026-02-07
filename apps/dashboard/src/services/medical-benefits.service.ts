import { supabase } from '../lib/supabase/client';
import type {
  MedicalBenefitRecord,
  MedicalCategoryLimit,
  EmployeeMedicalLimit,
  CreateMedicalBenefitInput,
  UpdateMedicalBenefitInput,
  CreateMedicalCategoryLimitInput,
  GetMedicalBenefitRecordsParams,
  MedicalBenefitRecordsPaginatedResponse,
  EmployeeLimitSummary,
} from '@devbooks/utils';

const ANNUAL_LIMIT_PKR = 400000; // Rs. 400,000 per year per employee

export const medicalBenefitsService = {
  /**
   * Get all medical benefit records with pagination
   */
  async getAllRecords(
    params: GetMedicalBenefitRecordsParams = {},
  ): Promise<MedicalBenefitRecordsPaginatedResponse> {
    const { page = 1, pageSize = 10, employeeId, year, paid, category } = params;

    let query = supabase
      .from('medical_benefit_records')
      .select(
        `
        *,
        employee:employees!medical_benefit_records_employee_id_fkey(id, full_name, email)
      `,
        { count: 'exact' },
      )
      .is('deleted_at', null);

    // Apply filters
    if (employeeId) {
      query = query.eq('employee_id', employeeId);
    }

    if (year) {
      const startDate = `${year}-01-01`;
      const endDate = `${year}-12-31`;
      query = query.gte('date', startDate).lte('date', endDate);
    }

    if (paid !== undefined) {
      query = query.eq('paid', paid);
    }

    if (category) {
      query = query.eq('medical_category', category);
    }

    // Order by date descending
    query = query.order('date', { ascending: false });

    // Calculate pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching medical benefit records:', error);
      throw new Error(`Failed to fetch records: ${error.message}`);
    }

    const totalCount = count ?? 0;
    const totalPages = Math.ceil(totalCount / pageSize);

    return {
      records: (data as MedicalBenefitRecord[]) ?? [],
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        pageSize,
      },
    };
  },

  /**
   * Get a single medical benefit record by ID
   */
  async getRecordById(id: string): Promise<MedicalBenefitRecord> {
    const { data, error } = await supabase
      .from('medical_benefit_records')
      .select(
        `
        *,
        employee:employees!medical_benefit_records_employee_id_fkey(id, full_name, email)
      `,
      )
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error) {
      console.error('Error fetching medical benefit record:', error);
      throw new Error(`Failed to fetch record: ${error.message}`);
    }

    return data;
  },

  /**
   * Create a new medical benefit claim
   * Validates annual limit before creating
   */
  async createRecord(
    input: CreateMedicalBenefitInput,
  ): Promise<MedicalBenefitRecord> {
    const currentYear = new Date(input.date).getFullYear();

    // Check annual limit
    const annualTotal = await this.getEmployeeAnnualTotal(
      input.employee_id,
      currentYear,
    );

    if (annualTotal + input.cost_pkr > ANNUAL_LIMIT_PKR) {
      throw new Error(
        `Claim amount (Rs. ${input.cost_pkr.toLocaleString()}) would exceed annual limit. ` +
          `Employee has already used Rs. ${annualTotal.toLocaleString()} of Rs. ${ANNUAL_LIMIT_PKR.toLocaleString()} limit.`,
      );
    }

    // Check category limit
    const categoryLimit = await this.getCategoryLimit(input.medical_category);
    if (categoryLimit) {
      const categoryUsed = await this.getEmployeeCategoryTotal(
        input.employee_id,
        currentYear,
        input.medical_category,
      );

      if (categoryUsed + input.cost_pkr > categoryLimit.limit) {
        throw new Error(
          `Claim amount (Rs. ${input.cost_pkr.toLocaleString()}) would exceed category limit. ` +
            `Employee has already used Rs. ${categoryUsed.toLocaleString()} of Rs. ${categoryLimit.limit.toLocaleString()} limit for ${input.medical_category}.`,
        );
      }
    }

    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('medical_benefit_records')
      .insert({
        ...input,
        payment_type: input.payment_type || 'reimburse',
        created_at: now,
        updated_at: now,
      })
      .select(
        `
        *,
        employee:employees!medical_benefit_records_employee_id_fkey(id, full_name, email)
      `,
      )
      .single();

    if (error) {
      console.error('Error creating medical benefit record:', error);
      throw new Error(`Failed to create record: ${error.message}`);
    }

    // Update employee medical limits
    await this.updateEmployeeLimits(input.employee_id, currentYear);

    return data;
  },

  /**
   * Update a medical benefit record
   */
  async updateRecord(
    id: string,
    updates: UpdateMedicalBenefitInput,
  ): Promise<MedicalBenefitRecord> {
    const record = await this.getRecordById(id);
    const currentYear = new Date(record.date).getFullYear();

    // If amount or category changed, validate limits
    if (updates.cost_pkr !== undefined || updates.medical_category) {
      const newAmount = updates.cost_pkr ?? record.cost_pkr;
      const newCategory = updates.medical_category ?? record.medical_category;

      // Recalculate without this record
      const annualTotal =
        (await this.getEmployeeAnnualTotal(record.employee_id, currentYear)) -
        record.cost_pkr;

      if (annualTotal + newAmount > ANNUAL_LIMIT_PKR) {
        throw new Error(
          `Updated amount would exceed annual limit. Employee has already used Rs. ${annualTotal.toLocaleString()} of Rs. ${ANNUAL_LIMIT_PKR.toLocaleString()} limit.`,
        );
      }

      // Check category limit
      const categoryLimit = await this.getCategoryLimit(newCategory);
      if (categoryLimit) {
        const categoryUsed =
          (await this.getEmployeeCategoryTotal(
            record.employee_id,
            currentYear,
            newCategory,
          )) - (updates.medical_category ? 0 : record.cost_pkr);

        if (categoryUsed + newAmount > categoryLimit.limit) {
          throw new Error(
            `Updated amount would exceed category limit for ${newCategory}.`,
          );
        }
      }
    }

    const { data, error } = await supabase
      .from('medical_benefit_records')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select(
        `
        *,
        employee:employees!medical_benefit_records_employee_id_fkey(id, full_name, email)
      `,
      )
      .single();

    if (error) {
      console.error('Error updating medical benefit record:', error);
      throw new Error(`Failed to update record: ${error.message}`);
    }

    // Update employee medical limits
    await this.updateEmployeeLimits(record.employee_id, currentYear);

    return data;
  },

  /**
   * Mark a record as paid/unpaid
   */
  async updatePaymentStatus(
    id: string,
    paid: boolean,
  ): Promise<MedicalBenefitRecord> {
    return this.updateRecord(id, { paid });
  },

  /**
   * Soft delete a medical benefit record
   */
  async deleteRecord(id: string): Promise<void> {
    const record = await this.getRecordById(id);
    const currentYear = new Date(record.date).getFullYear();

    const now = new Date().toISOString();
    const { error } = await supabase
      .from('medical_benefit_records')
      .update({
        deleted_at: now,
        updated_at: now,
      })
      .eq('id', id);

    if (error) {
      console.error('Error deleting medical benefit record:', error);
      throw new Error(`Failed to delete record: ${error.message}`);
    }

    // Update employee medical limits
    await this.updateEmployeeLimits(record.employee_id, currentYear);
  },

  /**
   * Get all medical category limits
   */
  async getCategoryLimits(): Promise<MedicalCategoryLimit[]> {
    const { data, error } = await supabase
      .from('medical_category_limits')
      .select('*')
      .is('deleted_at', null)
      .order('medical_category');

    if (error) {
      console.error('Error fetching category limits:', error);
      throw new Error(`Failed to fetch category limits: ${error.message}`);
    }

    return data ?? [];
  },

  /**
   * Get limit for a specific category
   */
  async getCategoryLimit(
    category: string,
  ): Promise<MedicalCategoryLimit | null> {
    const { data, error } = await supabase
      .from('medical_category_limits')
      .select('*')
      .eq('medical_category', category)
      .is('deleted_at', null)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No record found
        return null;
      }
      console.error('Error fetching category limit:', error);
      throw new Error(`Failed to fetch category limit: ${error.message}`);
    }

    return data;
  },

  /**
   * Create or update a medical category limit
   */
  async upsertCategoryLimit(
    input: CreateMedicalCategoryLimitInput,
  ): Promise<MedicalCategoryLimit> {
    // Check if limit exists
    const existing = await this.getCategoryLimit(input.medical_category);

    if (existing) {
      // Update existing
      const { data, error } = await supabase
        .from('medical_category_limits')
        .update({
          limit: input.limit,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating category limit:', error);
        throw new Error(`Failed to update category limit: ${error.message}`);
      }

      return data;
    } else {
      // Create new
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('medical_category_limits')
        .insert({
          medical_category: input.medical_category,
          limit: input.limit,
          created_at: now,
          updated_at: now,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating category limit:', error);
        throw new Error(`Failed to create category limit: ${error.message}`);
      }

      return data;
    }
  },

  /**
   * Get employee medical limits for a specific year
   */
  async getEmployeeLimits(
    employeeId: string,
    year: number,
  ): Promise<EmployeeMedicalLimit[]> {
    const { data, error } = await supabase
      .from('employee_medical_limits')
      .select(
        `
        *,
        employee:employees!employee_medical_limits_employee_id_fkey(id, full_name, email)
      `,
      )
      .eq('employee_id', employeeId)
      .eq('year', year)
      .is('deleted_at', null)
      .order('medical_category');

    if (error) {
      console.error('Error fetching employee limits:', error);
      throw new Error(`Failed to fetch employee limits: ${error.message}`);
    }

    return data ?? [];
  },

  /**
   * Get employee limit summary for a year
   */
  async getEmployeeLimitSummary(
    employeeId: string,
    year: number,
  ): Promise<EmployeeLimitSummary> {
    // Get all records for the employee in the year
    const response = await this.getAllRecords({
      employeeId,
      year,
      pageSize: 10000, // Get all records
    });
    const records = response.records || [];

    // Get category limits
    const categoryLimits = await this.getCategoryLimits();
    const categoryLimitMap = new Map(
      categoryLimits.map((cl) => [cl.medical_category, cl.limit]),
    );

    // Calculate totals
    const categoryTotals = new Map<string, number>();
    let totalUsed = 0;

    records.forEach((record) => {
      const category = record.medical_category;
      const current = categoryTotals.get(category) || 0;
      categoryTotals.set(category, current + record.cost_pkr);
      totalUsed += record.cost_pkr;
    });

    // Build category breakdown
    const categoryBreakdown = Array.from(categoryTotals.entries()).map(
      ([category, used]) => ({
        category: category as any,
        used,
        limit: categoryLimitMap.get(category) || 0,
        remaining: Math.max(0, (categoryLimitMap.get(category) || 0) - used),
      }),
    );

    const employee = records[0]?.employee;
    if (!employee) {
      // Fetch employee if no records exist
      const { data } = await supabase
        .from('employees')
        .select('id, full_name, email')
        .eq('id', employeeId)
        .single();
      if (data) {
        return {
          employee_id: employeeId,
          employee_name: data.full_name,
          year,
          total_used: 0,
          total_limit: ANNUAL_LIMIT_PKR,
          remaining: ANNUAL_LIMIT_PKR,
          category_breakdown: [],
        };
      }
      throw new Error('Employee not found');
    }

    return {
      employee_id: employeeId,
      employee_name: employee.full_name,
      year,
      total_used: totalUsed,
      total_limit: ANNUAL_LIMIT_PKR,
      remaining: Math.max(0, ANNUAL_LIMIT_PKR - totalUsed),
      category_breakdown,
    };
  },

  /**
   * Get total amount used by an employee in a year
   */
  async getEmployeeAnnualTotal(
    employeeId: string,
    year: number,
  ): Promise<number> {
    const response = await this.getAllRecords({
      employeeId,
      year,
      pageSize: 10000,
    });
    const records = response.records || [];

    return records.reduce((sum, record) => sum + record.cost_pkr, 0);
  },

  /**
   * Get total amount used by an employee in a category for a year
   */
  async getEmployeeCategoryTotal(
    employeeId: string,
    year: number,
    category: string,
  ): Promise<number> {
    const response = await this.getAllRecords({
      employeeId,
      year,
      category: category as any,
      pageSize: 10000,
    });
    const records = response.records || [];

    return records.reduce((sum, record) => sum + record.cost_pkr, 0);
  },

  /**
   * Update employee medical limits based on current records
   * This should be called after creating/updating/deleting records
   */
  async updateEmployeeLimits(
    employeeId: string,
    year: number,
  ): Promise<void> {
    // Get category limits
    const categoryLimits = await this.getCategoryLimits();
    const categoryLimitMap = new Map(
      categoryLimits.map((cl) => [cl.medical_category, cl.limit]),
    );

    // Get all records for the employee in the year
    const response = await this.getAllRecords({
      employeeId,
      year,
      pageSize: 10000,
    });
    const records = response.records || [];

    // Calculate totals per category
    const categoryTotals = new Map<string, number>();
    records.forEach((record) => {
      const category = record.medical_category;
      const current = categoryTotals.get(category) || 0;
      categoryTotals.set(category, current + record.cost_pkr);
    });

    // Update or create limits for each category
    const now = new Date().toISOString();
    for (const [category, used] of categoryTotals.entries()) {
      const limit = categoryLimitMap.get(category) || 0;
      const remaining = Math.max(0, limit - used);

      // Check if limit record exists
      const existing = await supabase
        .from('employee_medical_limits')
        .select('id')
        .eq('employee_id', employeeId)
        .eq('year', year)
        .eq('medical_category', category)
        .is('deleted_at', null)
        .single();

      if (existing.data) {
        // Update existing
        await supabase
          .from('employee_medical_limits')
          .update({
            limit,
            remaining,
            updated_at: now,
          })
          .eq('id', existing.data.id);
      } else {
        // Create new
        await supabase.from('employee_medical_limits').insert({
          employee_id: employeeId,
          year,
          limit,
          remaining,
          medical_category: category,
          created_at: now,
          updated_at: now,
        });
      }
    }
  },

  /**
   * Get all employee limit summaries for a year
   */
  async getAllEmployeeLimitSummaries(
    year: number,
  ): Promise<EmployeeLimitSummary[]> {
    // Get all employees
    const { data: employees } = await supabase
      .from('employees')
      .select('id, full_name')
      .is('deleted_at', null);

    if (!employees) {
      return [];
    }

    // Get summaries for each employee
    const summaries = await Promise.all(
      employees.map((emp) =>
        this.getEmployeeLimitSummary(emp.id, year).catch(() => ({
          employee_id: emp.id,
          employee_name: emp.full_name,
          year,
          total_used: 0,
          total_limit: ANNUAL_LIMIT_PKR,
          remaining: ANNUAL_LIMIT_PKR,
          category_breakdown: [],
        })),
      ),
    );

    return summaries;
  },
};
