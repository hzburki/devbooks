import { Column } from '@devbooks/components';
import { LeaveRequest, LeaveStatus } from '@devbooks/utils';
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

// Define table columns
export const leaveTableColumns: Column<LeaveRequest>[] = [
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
    render: (leave) => `${leave.num_days} day${leave.num_days > 1 ? 's' : ''}`,
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
