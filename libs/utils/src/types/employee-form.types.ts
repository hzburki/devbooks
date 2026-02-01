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
  documents?: Array<{
    id?: string; // For existing documents (from employee_documents table)
    name: string;
    file?: File; // For new uploads (before upload completes)
    filePath?: string; // For existing documents (from storage)
    uploadProgress?: number; // 0-100 for upload progress
    isUploading?: boolean; // Upload in progress
    isDeleted?: boolean; // Track if marked for deletion
  }>;
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
