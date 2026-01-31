/**
 * Employee form-specific types
 * These types are used for form handling and validation
 */

/**
 * Employee form data structure (camelCase for form handling)
 */
export interface EmployeeFormData {
  fullName: string;
  email: string;
  dateOfBirth?: string;
  designations: string;
  jobType: string;
  startDate: string;
  endDate?: string;
  employmentStatus: string;
  contactNumber?: string;
  personalEmail?: string;
  homeAddress?: string;
  relationToEmergencyContact?: string;
  emergencyContactName?: string;
  emergencyContactNumber?: string;
  personalBankName: string;
  bankAccountTitle: string;
  iban: string;
  swiftCode?: string;
  documents?: Array<{ name: string; file: File }>;
  payoneerName?: string;
  payoneerEmail?: string;
  payoneerCustomerId?: string;
  nSaveName?: string;
  nSaveBankName?: string;
  nSaveIban?: string;
  nSaveSwiftCode?: string;
  nSaveBankAddress?: string;
  nSaveRecipientAddress?: string;
}
