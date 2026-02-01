/**
 * Employee document-related types and interfaces
 */

/**
 * Base employee document data structure (matches database schema)
 */
export interface EmployeeDocument {
  id: string;
  employee_id?: string | null;
  file_path: string;
  name: string;
  meta_data?: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

/**
 * Input type for creating a new employee document
 */
export interface CreateEmployeeDocumentInput {
  file_path: string;
  name: string;
  meta_data?: Record<string, unknown> | null;
  employee_id?: string | null;
}

/**
 * Input type for updating an employee document (all fields optional)
 */
export interface UpdateEmployeeDocumentInput {
  employee_id?: string | null;
  name?: string;
  meta_data?: Record<string, unknown> | null;
  deleted_at?: string | null;
}
