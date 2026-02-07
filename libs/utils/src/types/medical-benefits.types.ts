/**
 * Medical benefits related types and interfaces
 */

export type MedicalBenefitsFor = 'self' | 'spouse' | 'parents' | 'siblings' | 'children';

export type MedicalCategory =
  | 'surgery_and_hospitalization'
  | 'maternity_care'
  | 'dental_care'
  | 'vision_care'
  | 'prescription_medicine'
  | 'labs_and_medical_tests'
  | 'consultation';

export type MedicalBenefitPaymentType = 'advance' | 'reimburse';

/**
 * Medical benefit record (claim)
 */
export interface MedicalBenefitRecord {
  id: string;
  employee_id: string;
  date: string;
  for: MedicalBenefitsFor;
  medical_category: MedicalCategory;
  description: string;
  cost_pkr: number;
  reciept: string; // Note: typo in database column name
  paid: boolean;
  payment_type: MedicalBenefitPaymentType;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  // Joined employee data
  employee?: {
    id: string;
    full_name: string;
    email: string;
  };
}

/**
 * Medical category limit
 */
export interface MedicalCategoryLimit {
  id: string;
  medical_category: MedicalCategory;
  limit: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

/**
 * Employee medical limit (usage tracking)
 */
export interface EmployeeMedicalLimit {
  id: number;
  employee_id: string;
  year: number;
  limit: number;
  remaining: number;
  medical_category: MedicalCategory;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  // Joined employee data
  employee?: {
    id: string;
    full_name: string;
    email: string;
  };
}

/**
 * Input type for creating a new medical benefit claim
 */
export interface CreateMedicalBenefitInput {
  employee_id: string;
  date: string;
  for: MedicalBenefitsFor;
  medical_category: MedicalCategory;
  description: string;
  cost_pkr: number;
  reciept: string;
  payment_type?: MedicalBenefitPaymentType; // Optional, defaults to 'reimburse' in database
}

/**
 * Input type for updating a medical benefit claim
 */
export interface UpdateMedicalBenefitInput {
  date?: string;
  for?: MedicalBenefitsFor;
  medical_category?: MedicalCategory;
  description?: string;
  cost_pkr?: number;
  reciept?: string;
  paid?: boolean;
  payment_type?: MedicalBenefitPaymentType;
}

/**
 * Input type for creating/updating medical category limit
 */
export interface CreateMedicalCategoryLimitInput {
  medical_category: MedicalCategory;
  limit: number;
}

/**
 * Employee limit summary (aggregated view)
 */
export interface EmployeeLimitSummary {
  employee_id: string;
  employee_name: string;
  year: number;
  total_used: number;
  total_limit: number;
  remaining: number;
  category_breakdown: {
    category: MedicalCategory;
    used: number;
    limit: number;
    remaining: number;
  }[];
}

/**
 * Parameters for getting medical benefit records
 */
export interface GetMedicalBenefitRecordsParams {
  page?: number;
  pageSize?: number;
  employeeId?: string;
  year?: number;
  paid?: boolean;
  category?: MedicalCategory;
}

/**
 * Paginated response for medical benefit records
 */
export interface MedicalBenefitRecordsPaginatedResponse {
  records: MedicalBenefitRecord[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    pageSize: number;
  };
}
