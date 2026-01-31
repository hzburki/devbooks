export type ContractTypeOption = {
  value: string;
  label: string;
};

export const CONTRACT_TYPES: ContractTypeOption[] = [
  { value: 'full_time', label: 'Full Time' },
  { value: 'part_time', label: 'Part Time' },
  { value: 'project_based', label: 'Project Based' },
];
