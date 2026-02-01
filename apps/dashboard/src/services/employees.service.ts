import { supabase } from '../lib/supabase/client';
import { buildSearchOrQuery } from '@devbooks/utils';
import { employeeDocumentsService } from './employee-documents.service';
import type {
  Employee,
  CreateEmployeeInput,
  UpdateEmployeeInput,
  GetAllEmployeesParams,
  EmployeesPaginatedResponse,
} from '@devbooks/utils';

// Re-export types for backward compatibility
export type {
  Employee,
  CreateEmployeeInput,
  UpdateEmployeeInput,
  GetAllEmployeesParams,
  EmployeesPaginatedResponse,
};

export const employeesService = {
  /**
   * Create a new employee
   */
  async create(employee: CreateEmployeeInput): Promise<Employee> {
    // Extract document IDs to link (don't send to employees table)
    const { documentIdsToLink, ...employeeData } = employee;

    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('employees')
      .insert({
        ...employeeData,
        created_at: now,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating employee:', error);
      throw new Error(`Failed to create employee: ${error.message}`);
    }

    // Link documents to employee if provided
    if (documentIdsToLink && documentIdsToLink.length > 0) {
      try {
        await employeeDocumentsService.linkDocumentsToEmployee(
          data.id,
          documentIdsToLink,
        );
      } catch (docError) {
        console.error('Error linking documents:', docError);
        // Don't fail the employee creation if document linking fails
        // The documents can be linked later
      }
    }

    return data;
  },

  /**
   * Get all employees with pagination
   */
  async getAll(
    params: GetAllEmployeesParams = {},
  ): Promise<EmployeesPaginatedResponse> {
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
      // Use helper function to build OR query for searching across multiple columns
      const searchColumns = ['full_name', 'email', 'contact_number'];
      const orQuery = buildSearchOrQuery(searchColumns, search);
      query = query.or(orQuery);
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
  async update(id: string, updates: UpdateEmployeeInput): Promise<Employee> {
    // Extract document-related fields (don't send to employees table)
    const { documentIdsToLink, deletedDocuments, ...employeeUpdates } = updates;

    const { data, error } = await supabase
      .from('employees')
      .update({ ...employeeUpdates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating employee:', error);
      throw new Error(`Failed to update employee: ${error.message}`);
    }

    // Handle document linking/unlinking
    try {
      if (documentIdsToLink && documentIdsToLink.length > 0) {
        await employeeDocumentsService.linkDocumentsToEmployee(
          id,
          documentIdsToLink,
        );
      }

      // Unlink documents from employee (set employee_id to NULL) instead of soft deleting
      if (deletedDocuments && deletedDocuments.length > 0) {
        await employeeDocumentsService.unlinkDocumentsFromEmployee(
          deletedDocuments,
        );
      }
    } catch (docError) {
      console.error('Error updating documents:', docError);
      // Don't fail the employee update if document operations fail
    }

    return data;
  },

  /**
   * Soft delete employee
   */
  async delete(id: string): Promise<void> {
    // Soft delete employee
    const now = new Date().toISOString();
    const { error } = await supabase
      .from('employees')
      .update({
        deleted_at: now,
        updated_at: now,
      })
      .eq('id', id);

    if (error) {
      console.error('Error deleting employee:', error);
      throw new Error(`Failed to delete employee: ${error.message}`);
    }

    // Soft delete all associated documents
    try {
      const documents = await employeeDocumentsService.getByEmployeeId(id);
      if (documents.length > 0) {
        const documentIds = documents.map((doc) => doc.id);
        await employeeDocumentsService.softDeleteDocuments(documentIds);
      }
    } catch (docError) {
      console.error('Error soft deleting employee documents:', docError);
      // Don't fail the employee deletion if document deletion fails
    }
  },
};
