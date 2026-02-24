import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardPage, TableSearchBar, DataTable } from '@devbooks/components';
import { Button, Select } from '@devbooks/ui';
import { leavesService } from '../../../../services';
import {
  LEAVE_STATUS_TYPES,
  type LeaveRequest,
  type LeaveStatus,
  type LeaveStatusOption,
} from '@devbooks/utils';
import { CalendarPlus, Edit, Check, X, CalendarDays } from '@devbooks/ui';
import { useQuery } from '@tanstack/react-query';
import { leaveTableColumns } from './leaves-columns';
import ApproveLeaveDialogue from './approve-leave-dialouge';
import RejectLeaveDialogue from './reject-leave-dialouge';

const LeavesTable = () => {
  const navigate = useNavigate();

  const [statusFilter, setStatusFilter] = useState<LeaveStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedLeaveId, setSelectedLeaveId] = useState<string | null>(null);

  // Fetch leave requests
  const { data: response, isLoading } = useQuery({
    queryKey: ['leave-requests', statusFilter, searchQuery],
    queryFn: () =>
      leavesService.getAll({
        status: statusFilter === 'all' ? undefined : statusFilter,
        search: searchQuery || undefined,
      }),
  });

  const leaveRequests: LeaveRequest[] = response?.leaveRequests || [];

  const handleApproveClick = (id: string) => {
    setSelectedLeaveId(id);
    setApproveDialogOpen(true);
  };

  const handleApproveOpenChange = (open: boolean) => {
    setApproveDialogOpen(open);
    if (!open) setSelectedLeaveId(null);
  };

  const handleRejectClick = (id: string) => {
    setSelectedLeaveId(id);
    setRejectDialogOpen(true);
  };

  const handleRejectOpenChange = (open: boolean) => {
    setRejectDialogOpen(open);
    if (!open) setSelectedLeaveId(null);
  };

  const leavesStatusOptions: LeaveStatusOption[] = LEAVE_STATUS_TYPES;

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
                options={leavesStatusOptions}
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
          columns={leaveTableColumns}
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
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-success hover:bg-success hover:text-success-foreground"
                onClick={() => handleApproveClick(leave.id)}
                title="Approve Leave Request"
                disabled={
                  leave.leave_status !== 'pending' ||
                  approveDialogOpen ||
                  rejectDialogOpen
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
                  leave.leave_status !== 'pending' ||
                  approveDialogOpen ||
                  rejectDialogOpen
                }
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Reject</span>
              </Button>
            </>
          )}
          getRowId={(leave) => leave.id}
        />

        {/* Confirmation Dialogs */}
        <ApproveLeaveDialogue
          open={approveDialogOpen}
          onOpenChange={handleApproveOpenChange}
          leaveId={selectedLeaveId}
        />

        <RejectLeaveDialogue
          open={rejectDialogOpen}
          onOpenChange={handleRejectOpenChange}
          leaveId={selectedLeaveId}
        />
      </div>
    </DashboardPage>
  );
};

export default LeavesTable;
