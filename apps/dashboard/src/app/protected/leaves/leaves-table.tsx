import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DashboardPage,
  TableSearchBar,
  DataTable,
  type Column,
} from '@devbooks/components';
import { Button, Select, Dialog } from '@devbooks/ui';
import { leavesService } from '../../../services';
import type { LeaveRequest, LeaveStatus } from '@devbooks/utils';
import { useToast } from '@devbooks/utils';
import { CalendarPlus, Edit, Check, X, CalendarDays } from '@devbooks/ui';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { cn } from '@devbooks/ui';

// Helper function to get status badge styling
const getStatusBadgeClass = (status: LeaveStatus): string => {
  switch (status) {
    case 'approved':
      return 'bg-success/10 text-success border-success/20';
    case 'rejected':
      return 'bg-destructive/10 text-destructive border-destructive/20';
    case 'pending':
      return 'bg-warning/10 text-warning border-warning/20';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

// Helper function to get leave type label
const getLeaveTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    casual: 'Casual',
    sick: 'Sick',
    parental: 'Parental',
    other: 'Other',
  };
  return labels[type] || type;
};

const LeavesTable = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [statusFilter, setStatusFilter] = useState<LeaveStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedLeaveId, setSelectedLeaveId] = useState<string | null>(null);

  // Fetch leave requests
  const {
    data: response,
    error,
    isLoading,
  } = useQuery({
    queryKey: ['leave-requests', statusFilter, searchQuery],
    queryFn: () =>
      leavesService.getAll({
        status: statusFilter === 'all' ? undefined : statusFilter,
        search: searchQuery || undefined,
      }),
  });

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: (id: string) => leavesService.approve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
      setApproveDialogOpen(false);
      setSelectedLeaveId(null);
      toast({
        variant: 'success',
        title: 'Leave Request Approved',
        description: 'The leave request has been approved successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        variant: 'error',
        title: 'Error',
        description: error.message || 'Failed to approve leave request.',
      });
    },
  });

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: (id: string) => leavesService.reject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
      setRejectDialogOpen(false);
      setSelectedLeaveId(null);
      toast({
        variant: 'success',
        title: 'Leave Request Rejected',
        description: 'The leave request has been rejected successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        variant: 'error',
        title: 'Error',
        description: error.message || 'Failed to reject leave request.',
      });
    },
  });

  const handleApproveClick = (id: string) => {
    setSelectedLeaveId(id);
    setApproveDialogOpen(true);
  };

  const handleRejectClick = (id: string) => {
    setSelectedLeaveId(id);
    setRejectDialogOpen(true);
  };

  const handleApproveConfirm = () => {
    if (selectedLeaveId) {
      approveMutation.mutate(selectedLeaveId);
    }
  };

  const handleRejectConfirm = () => {
    if (selectedLeaveId) {
      rejectMutation.mutate(selectedLeaveId);
    }
  };

  const leaveRequests: LeaveRequest[] = response?.leaveRequests || [];

  // Define table columns
  const columns: Column<LeaveRequest>[] = [
    {
      header: 'Employee',
      render: (leave) => leave.employee?.full_name || '-',
    },
    {
      header: 'Leave Type',
      render: (leave) => getLeaveTypeLabel(leave.leave_type),
    },
    {
      header: 'Start Date',
      render: (leave) => format(new Date(leave.start_date), 'MMM d, yyyy'),
    },
    {
      header: 'End Date',
      render: (leave) => format(new Date(leave.end_date), 'MMM d, yyyy'),
    },
    {
      header: 'Days',
      render: (leave) =>
        `${leave.num_days} day${leave.num_days > 1 ? 's' : ''}`,
    },
    {
      header: 'Status',
      render: (leave) => (
        <span
          className={cn(
            'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize',
            getStatusBadgeClass(leave.leave_status),
          )}
        >
          {leave.leave_status}
        </span>
      ),
    },
    {
      header: 'Requested At',
      render: (leave) => format(new Date(leave.created_at), 'MMM d, yyyy'),
    },
  ];

  const statusOptions = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
  ];

  return (
    <DashboardPage
      icon={CalendarDays}
      title="Leaves"
      description="Manage leave requests and approvals"
    >
      <div className="space-y-4">
        {/* Search and Filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-center">
            <TableSearchBar
              placeholder="Search leave requests..."
              value={searchQuery}
              onChange={(value) => {
                setSearchQuery(value);
              }}
              className="flex-1"
            />
            <div className="w-full sm:w-[180px]">
              <Select
                value={statusFilter}
                onChange={(value) =>
                  setStatusFilter(value as LeaveStatus | 'all')
                }
                options={statusOptions}
                placeholder="Filter by status"
                className="bg-white"
              />
            </div>
          </div>
          <Button onClick={() => navigate('/leaves/add')} variant="gradient">
            <CalendarPlus className="mr-2 h-4 w-4" />
            Apply for Leave
          </Button>
        </div>

        {/* Table */}
        <DataTable
          data={leaveRequests}
          columns={columns}
          loading={isLoading}
          loadingText="Loading leave requests..."
          noDataText="No leave requests found matching your search."
          emptyState={{
            icon: CalendarDays,
            title: 'No leave requests yet',
            description: 'Get started by submitting your first leave request.',
            action: (
              <Button
                onClick={() => navigate('/leaves/add')}
                variant="gradient"
              >
                <CalendarPlus className="mr-2 h-4 w-4" />
                Apply for Leave
              </Button>
            ),
          }}
          actions={(leave) => (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => navigate(`/leaves/edit/${leave.id}`)}
                title="Edit Leave Request"
              >
                <Edit className="h-4 w-4" />
                <span className="sr-only">Edit</span>
              </Button>
              {leave.leave_status === 'pending' && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-success hover:bg-success hover:text-success-foreground"
                    onClick={() => handleApproveClick(leave.id)}
                    title="Approve Leave Request"
                    disabled={
                      approveMutation.isPending || rejectMutation.isPending
                    }
                  >
                    <Check className="h-4 w-4" />
                    <span className="sr-only">Approve</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => handleRejectClick(leave.id)}
                    title="Reject Leave Request"
                    disabled={
                      approveMutation.isPending || rejectMutation.isPending
                    }
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Reject</span>
                  </Button>
                </>
              )}
            </>
          )}
          getRowId={(leave) => leave.id}
        />

        {/* Confirmation Dialogs */}
        <Dialog
          open={approveDialogOpen}
          onOpenChange={setApproveDialogOpen}
          title="Approve Leave Request"
          description="Are you sure you want to approve this leave request?"
          confirmText="Approve"
          cancelText="Cancel"
          confirmVariant="success"
          onConfirm={handleApproveConfirm}
          isLoading={approveMutation.isPending}
          loadingText="Approving..."
        />

        <Dialog
          open={rejectDialogOpen}
          onOpenChange={setRejectDialogOpen}
          title="Reject Leave Request"
          description="Are you sure you want to reject this leave request?"
          confirmText="Reject"
          cancelText="Cancel"
          confirmVariant="destructive"
          onConfirm={handleRejectConfirm}
          isLoading={rejectMutation.isPending}
          loadingText="Rejecting..."
        />
      </div>
    </DashboardPage>
  );
};

export default LeavesTable;
