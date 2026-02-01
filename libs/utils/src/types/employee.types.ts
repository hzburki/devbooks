/**
 * Employee-related types and interfaces
 */

/**
 * Base employee data structure (matches database schema)
 */
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

/**
 * Input type for creating a new employee
 */
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
  documentIdsToLink?: string[]; // IDs from employee_documents table to link
  deletedDocuments?: string[]; // IDs from employee_documents table to unlink (set employee_id to NULL)
}

/**
 * Input type for updating an employee (all fields optional)
 */
export type UpdateEmployeeInput = Partial<CreateEmployeeInput> & {
  documentIdsToLink?: string[]; // IDs from employee_documents table to link
  deletedDocuments?: string[]; // IDs from employee_documents table to unlink (set employee_id to NULL)
};

/**
 * Parameters for getting all employees with pagination
 */
export interface GetAllEmployeesParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

/**
 * Paginated response specifically for employees
 * Note: This extends PaginatedResponse but uses 'employees' key for backward compatibility
 */
export interface EmployeesPaginatedResponse {
  employees: Employee[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    pageSize: number;
  };
}
