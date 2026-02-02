/**
 * Leave request-related types and interfaces
 */

/**
 * Leave status enum
 */
export type LeaveStatus = 'pending' | 'approved' | 'rejected';

/**
 * Leave type enum
 */
export type LeaveType = 'casual' | 'sick' | 'parental' | 'other';

/**
 * Base leave request data structure (matches database schema)
 */
export interface LeaveRequest {
  id: string;
  employee_id: string;
  leave_status: LeaveStatus;
  reason: string | null;
  start_date: string;
  end_date: string;
  num_days: number;
  partial_leave: boolean;
  deadline_extended: boolean;
  leave_type: LeaveType;
  decided_at: string | null;
  updated_at: string;
  deleted_at: string | null;
  created_at: string;
  // Joined employee data
  employee?: {
    id: string;
    full_name: string;
    email: string;
  };
}

/**
 * Input type for creating a new leave request
 */
export interface CreateLeaveRequestInput {
  employee_id: string;
  leave_type: LeaveType;
  start_date: string;
  end_date: string;
  reason: string;
  partial_leave?: boolean;
  deadline_extended?: boolean;
  num_days?: number; // Will be calculated automatically if not provided
}

/**
 * Input type for updating a leave request (all fields optional)
 */
export interface UpdateLeaveRequestInput {
  employee_id?: string;
  leave_type?: LeaveType;
  start_date?: string;
  end_date?: string;
  reason?: string;
  partial_leave?: boolean;
  deadline_extended?: boolean;
  num_days?: number;
}

/**
 * Parameters for getting all leave requests with optional filtering
 */
export interface GetAllLeaveRequestsParams {
  status?: LeaveStatus;
  page?: number;
  pageSize?: number;
  search?: string;
}

/**
 * Paginated response for leave requests
 */
export interface LeaveRequestsPaginatedResponse {
  leaveRequests: LeaveRequest[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    pageSize: number;
  };
}
