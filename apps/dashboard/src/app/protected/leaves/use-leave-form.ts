import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@devbooks/utils';
import { leavesService, employeesService } from '../../../services';
import type {
  LeaveRequest,
  CreateLeaveRequestInput,
  UpdateLeaveRequestInput,
} from '@devbooks/utils';

// Form data type (camelCase)
export type LeaveFormData = {
  employeeId: string;
  leaveType: 'casual' | 'sick' | 'parental' | 'other';
  startDate: string;
  endDate: string;
  reason: string;
  partialLeave: boolean;
  deadlineExtended: boolean;
};

// Create schema
const leaveSchema = yup
  .object({
    employeeId: yup.string().required('Please select an employee'),
    leaveType: yup
      .string()
      .oneOf(['casual', 'sick', 'parental', 'other'], 'Invalid leave type')
      .required('Please select a leave type'),
    startDate: yup.string().required('Start date is required'),
    endDate: yup
      .string()
      .required('End date is required')
      .test(
        'is-after-start',
        'End date must be on or after start date',
        function (value) {
          const { startDate } = this.parent;
          if (!startDate || !value) return true;
          return new Date(value) >= new Date(startDate);
        },
      ),
    reason: yup
      .string()
      .required('Reason is required')
      .min(3, 'Reason must be at least 3 characters'),
    partialLeave: yup.boolean().default(false),
    deadlineExtended: yup.boolean().default(false),
  })
  .required();

// Helper function to map leave request (snake_case) to form data (camelCase)
const mapLeaveRequestToFormData = (
  leave: LeaveRequest,
): Partial<LeaveFormData> => {
  return {
    employeeId: leave.employee_id,
    leaveType: leave.leave_type,
    startDate: leave.start_date,
    endDate: leave.end_date,
    reason: leave.reason || '',
    partialLeave: leave.partial_leave,
    deadlineExtended: leave.deadline_extended,
  };
};

// Helper function to map form data (camelCase) to database schema (snake_case)
const mapFormDataToLeaveData = (
  data: LeaveFormData,
): CreateLeaveRequestInput => {
  return {
    employee_id: data.employeeId,
    leave_type: data.leaveType,
    start_date: data.startDate,
    end_date: data.endDate,
    reason: data.reason,
    partial_leave: data.partialLeave,
    deadline_extended: data.deadlineExtended,
  };
};

export function useLeaveForm(leaveId?: string) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditMode = !!leaveId;

  // Fetch leave request data if editing
  const {
    data: leaveRequest,
    isLoading: isLoadingLeaveRequest,
    error: leaveRequestError,
    isError: isLeaveRequestError,
  } = useQuery({
    queryKey: ['leave-request', leaveId],
    queryFn: () => {
      if (!leaveId) {
        throw new Error('Leave request ID is required');
      }
      return leavesService.getById(leaveId);
    },
    enabled: isEditMode && !!leaveId,
    retry: false,
  });

  // Fetch employees for the select dropdown
  const { data: employeesResponse } = useQuery({
    queryKey: ['employees', 'all'],
    queryFn: () => employeesService.getAll({ pageSize: 1000 }),
  });

  const employees = employeesResponse?.employees || [];

  const form = useForm<LeaveFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: yupResolver(leaveSchema) as any,
    defaultValues: {
      employeeId: '',
      leaveType: 'casual',
      startDate: '',
      endDate: '',
      reason: '',
      partialLeave: false,
      deadlineExtended: false,
    },
  });

  const { reset } = form;

  // Populate form when leave request data loads
  useEffect(() => {
    if (leaveRequest && isEditMode) {
      const formData = mapLeaveRequestToFormData(leaveRequest);
      reset(formData);
    }
  }, [leaveRequest, isEditMode, reset]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateLeaveRequestInput) => leavesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
      toast({
        variant: 'success',
        title: 'Leave Request Submitted',
        description: 'Your leave request has been submitted successfully.',
      });
      navigate('/leaves');
    },
    onError: (error: Error) => {
      toast({
        variant: 'error',
        title: 'Error',
        description:
          error.message || 'Failed to submit leave request. Please try again.',
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: UpdateLeaveRequestInput) => {
      if (!leaveId) {
        throw new Error('Leave request ID is required');
      }
      return leavesService.update(leaveId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
      queryClient.invalidateQueries({ queryKey: ['leave-request', leaveId] });
      toast({
        variant: 'success',
        title: 'Leave Request Updated',
        description: 'Leave request has been updated successfully.',
      });
      navigate('/leaves');
    },
    onError: (error: Error) => {
      toast({
        variant: 'error',
        title: 'Error',
        description:
          error.message || 'Failed to update leave request. Please try again.',
      });
    },
  });

  const onSubmit = async (data: LeaveFormData) => {
    const leaveData = mapFormDataToLeaveData(data);

    if (isEditMode) {
      await updateMutation.mutateAsync(leaveData);
    } else {
      await createMutation.mutateAsync(leaveData);
    }
  };

  return {
    form,
    onSubmit,
    isEditMode,
    isLoadingLeaveRequest,
    leaveRequestError: isLeaveRequestError ? leaveRequestError : null,
    isSubmitting:
      form.formState.isSubmitting ||
      createMutation.isPending ||
      updateMutation.isPending,
    employees,
  };
}
