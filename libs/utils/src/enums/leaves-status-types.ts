export type LeaveStatusOption = {
  value: string;
  label: string;
};

export const LEAVE_STATUS_TYPES: LeaveStatusOption[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];
