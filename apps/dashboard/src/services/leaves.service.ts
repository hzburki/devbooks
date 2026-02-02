import { supabase } from '../lib/supabase/client';
import type {
  LeaveRequest,
  CreateLeaveRequestInput,
  UpdateLeaveRequestInput,
  GetAllLeaveRequestsParams,
  LeaveRequestsPaginatedResponse,
  LeaveStatus,
} from '@devbooks/utils';

/**
 * Calculate number of days between two dates (inclusive)
 */
const calculateNumDays = (startDate: string, endDate: string): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays;
};

export const leavesService = {
  /**
   * Get all leave requests with optional filtering and pagination
   */
  async getAll(
    params: GetAllLeaveRequestsParams = {},
  ): Promise<LeaveRequestsPaginatedResponse> {
    const { status, page = 1, pageSize = 10, search } = params;

    // Build the query with employee join
    let query = supabase
      .from('leave_requests')
      .select(
        `
        *,
        employees!leave_requests_employee_id_fkey (
          id,
          full_name,
          email
        )
      `,
        { count: 'exact' },
      )
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    // Apply status filter if provided
    if (status) {
      query = query.eq('leave_status', status);
    }

    // Apply search filter if provided
    if (search) {
      query = query.or(
        `reason.ilike.%${search}%,employees.full_name.ilike.%${search}%`,
      );
    }

    // Calculate pagination range
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // Apply pagination
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching leave requests:', error);
      throw new Error(`Failed to fetch leave requests: ${error.message}`);
    }

    // Transform the data to include employee info
    const leaveRequests: LeaveRequest[] =
      (data as any[])?.map((item) => ({
        ...item,
        employee: item.employees
          ? {
              id: item.employees.id,
              full_name: item.employees.full_name,
              email: item.employees.email,
            }
          : undefined,
      })) || [];

    const totalCount = count ?? 0;
    const totalPages = Math.ceil(totalCount / pageSize);

    return {
      leaveRequests,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        pageSize,
      },
    };
  },

  /**
   * Get leave request by ID
   */
  async getById(id: string): Promise<LeaveRequest> {
    const { data, error } = await supabase
      .from('leave_requests')
      .select(
        `
        *,
        employees!leave_requests_employee_id_fkey (
          id,
          full_name,
          email
        )
      `,
      )
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error) {
      console.error('Error fetching leave request:', error);
      throw new Error(`Failed to fetch leave request: ${error.message}`);
    }

    // Transform the data to include employee info
    const leaveRequest: LeaveRequest = {
      ...data,
      employee: (data as any).employees
        ? {
            id: (data as any).employees.id,
            full_name: (data as any).employees.full_name,
            email: (data as any).employees.email,
          }
        : undefined,
    };

    return leaveRequest;
  },

  /**
   * Create a new leave request
   */
  async create(leave: CreateLeaveRequestInput): Promise<LeaveRequest> {
    const now = new Date().toISOString();

    // Calculate num_days if not provided
    const numDays =
      leave.num_days ?? calculateNumDays(leave.start_date, leave.end_date);

    const { data, error } = await supabase
      .from('leave_requests')
      .insert({
        employee_id: leave.employee_id,
        leave_status: 'pending',
        leave_type: leave.leave_type,
        start_date: leave.start_date,
        end_date: leave.end_date,
        reason: leave.reason,
        num_days: numDays,
        partial_leave: leave.partial_leave ?? false,
        deadline_extended: leave.deadline_extended ?? false,
        created_at: now,
        updated_at: now,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating leave request:', error);
      throw new Error(`Failed to create leave request: ${error.message}`);
    }

    // Fetch with employee join
    return this.getById(data.id);
  },

  /**
   * Update leave request
   */
  async update(
    id: string,
    updates: UpdateLeaveRequestInput,
  ): Promise<LeaveRequest> {
    const updateData: any = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    // Recalculate num_days if dates are being updated
    if (updates.start_date || updates.end_date) {
      const existing = await this.getById(id);
      const startDate = updates.start_date ?? existing.start_date;
      const endDate = updates.end_date ?? existing.end_date;
      updateData.num_days = calculateNumDays(startDate, endDate);
    }

    const { data, error } = await supabase
      .from('leave_requests')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating leave request:', error);
      throw new Error(`Failed to update leave request: ${error.message}`);
    }

    // Fetch with employee join
    return this.getById(data.id);
  },

  /**
   * Approve leave request
   */
  async approve(id: string): Promise<LeaveRequest> {
    const now = new Date().toISOString(); // UTC timestamp

    const { data, error } = await supabase
      .from('leave_requests')
      .update({
        leave_status: 'approved',
        decided_at: now,
        updated_at: now,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error approving leave request:', error);
      throw new Error(`Failed to approve leave request: ${error.message}`);
    }

    // Fetch with employee join
    return this.getById(data.id);
  },

  /**
   * Reject leave request
   */
  async reject(id: string): Promise<LeaveRequest> {
    const now = new Date().toISOString(); // UTC timestamp

    const { data, error } = await supabase
      .from('leave_requests')
      .update({
        leave_status: 'rejected',
        decided_at: now,
        updated_at: now,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error rejecting leave request:', error);
      throw new Error(`Failed to reject leave request: ${error.message}`);
    }

    // Fetch with employee join
    return this.getById(data.id);
  },

  /**
   * Soft delete leave request
   */
  async delete(id: string): Promise<void> {
    const now = new Date().toISOString();
    const { error } = await supabase
      .from('leave_requests')
      .update({
        deleted_at: now,
        updated_at: now,
      })
      .eq('id', id);

    if (error) {
      console.error('Error deleting leave request:', error);
      throw new Error(`Failed to delete leave request: ${error.message}`);
    }
  },
};
