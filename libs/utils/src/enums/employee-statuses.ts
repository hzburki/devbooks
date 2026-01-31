export type EmployeeStatusOption = {
  value: string;
  label: string;
};

export const EMPLOYEE_STATUSES: EmployeeStatusOption[] = [
  { value: 'current', label: 'Current' },
  { value: 'terminated', label: 'Terminated' },
  { value: 'resigned', label: 'Resigned' },
  { value: 'probation', label: 'Probation' },
];
