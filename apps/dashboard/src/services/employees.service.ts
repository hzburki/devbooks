import { supabase } from '../lib/supabase/client';

export interface CreateEmployeeInput {
  full_name: string;
  email: string;
  date_of_birth?: string | null;
  designations: string;
  job_type: string;
  start_date: string;
  end_date?: string | null;
  employment_status: string;
  contact_number?: string | null;
  personal_email?: string | null;
  home_address?: string | null;
  emergency_contact_name?: string | null;
  relation_to_emergency_contact?: string | null;
  emergency_contact_number?: string | null;
  personal_bank_name?: string | null;
  bank_account_title?: string | null;
  iban?: string | null;
  swift_code?: string | null;
  payoneer_name?: string | null;
  payoneer_email?: string | null;
  payoneer_customer_id?: string | null;
  nsave_name?: string | null;
  nsave_bank_name?: string | null;
  nsave_iban?: string | null;
  nsave_swift_code?: string | null;
  nsave_bank_address?: string | null;
  nsave_recipient_address?: string | null;
  user_type: 'owner' | 'employee';
}

export interface Employee {
  id: string;
  full_name: string;
  email: string;
  date_of_birth?: string | null;
  designations: string;
  job_type: string;
  start_date: string;
  end_date?: string | null;
  employment_status: string;
  contact_number?: string | null;
  personal_email?: string | null;
  home_address?: string | null;
  emergency_contact_name?: string | null;
  relation_to_emergency_contact?: string | null;
  emergency_contact_number?: string | null;
  personal_bank_name?: string | null;
  bank_account_title?: string | null;
  iban?: string | null;
  swift_code?: string | null;
  payoneer_name?: string | null;
  payoneer_email?: string | null;
  payoneer_customer_id?: string | null;
  nsave_name?: string | null;
  nsave_bank_name?: string | null;
  nsave_iban?: string | null;
  nsave_swift_code?: string | null;
  nsave_bank_address?: string | null;
  nsave_recipient_address?: string | null;
  user_type: 'owner' | 'employee';
  created_at: string;
  updated_at?: string | null;
  deleted_at?: string | null;
}

export interface PaginatedResponse<T> {
  employees: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    pageSize: number;
  };
}

export interface GetAllEmployeesParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

export const employeesService = {
  /**
   * Create a new employee
   */
  async create(employee: CreateEmployeeInput): Promise<Employee> {
    const { data, error } = await supabase
      .from('employees')
      .insert(employee)
      .select()
      .single();

    if (error) {
      console.error('Error creating employee:', error);
      throw new Error(`Failed to create employee: ${error.message}`);
    }

    return data;
  },

  /**
   * Get all employees with pagination
   */
  async getAll(
    params: GetAllEmployeesParams = {},
  ): Promise<PaginatedResponse<Employee>> {
    const { page = 1, pageSize = 10, search } = params;

    // Build the query
    let query = supabase
      .from('employees')
      .select(
        'id, full_name, email, contact_number, designations, job_type, start_date, employment_status',
        { count: 'exact' },
      )
      .is('deleted_at', null);

    // Apply search filter if provided
    if (search) {
      query = query.or(
        `full_name.ilike.%${search}%,email.ilike.%${search}%,contact_number.ilike.%${search}%,designations.ilike.%${search}%`,
      );
    }

    // Apply ordering
    query = query.order('created_at', { ascending: false });

    // Calculate pagination range
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // Apply pagination
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching employees:', error);
      throw new Error(`Failed to fetch employees: ${error.message}`);
    }

    const totalCount = count ?? 0;
    const totalPages = Math.ceil(totalCount / pageSize);

    return {
      employees: (data as Employee[]) ?? [],
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        pageSize,
      },
    };
  },

  /**
   * Get employee by ID
   */
  async getById(id: string): Promise<Employee> {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error) {
      console.error('Error fetching employee:', error);
      throw new Error(`Failed to fetch employee: ${error.message}`);
    }

    return data;
  },

  /**
   * Update employee
   */
  async update(
    id: string,
    updates: Partial<CreateEmployeeInput>,
  ): Promise<Employee> {
    const { data, error } = await supabase
      .from('employees')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating employee:', error);
      throw new Error(`Failed to update employee: ${error.message}`);
    }

    return data;
  },

  /**
   * Soft delete employee
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('employees')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Error deleting employee:', error);
      throw new Error(`Failed to delete employee: ${error.message}`);
    }
  },
};
