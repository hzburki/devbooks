import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@devbooks/utils';
import { employeesService, type Employee } from '../../../services';

// Employee form data type
export type EmployeeFormData = {
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
  swiftCode: string;
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
};

// Create schema - documents are required for new employees
const createEmployeeSchema = (isEditMode: boolean) => {
  const baseSchema = {
    fullName: yup.string().required('Full name is required'),
    email: yup
      .string()
      .required('Email is required')
      .email('Invalid email address'),
    dateOfBirth: yup.string().optional(),
    designations: yup.string().required('Designation is required'),
    jobType: yup.string().required('Job type is required'),
    startDate: yup.string().required('Start date is required'),
    endDate: yup.string().optional(),
    employmentStatus: yup.string().required('Employment status is required'),
    contactNumber: yup.string().optional(),
    personalEmail: yup.string().email('Invalid email address').optional(),
    homeAddress: yup.string().optional(),
    relationToEmergencyContact: yup.string().optional(),
    emergencyContactName: yup.string().optional(),
    emergencyContactNumber: yup.string().optional(),
    personalBankName: yup.string().required('Bank name is required'),
    bankAccountTitle: yup.string().required('Account title is required'),
    iban: yup.string().required('IBAN is required'),
    swiftCode: yup.string().required('Swift code is required'),
    payoneerName: yup.string().optional(),
    payoneerEmail: yup.string().email('Invalid email address').optional(),
    payoneerCustomerId: yup.string().optional(),
    nSaveName: yup.string().optional(),
    nSaveBankName: yup.string().optional(),
    nSaveIban: yup.string().optional(),
    nSaveSwiftCode: yup.string().optional(),
    nSaveBankAddress: yup.string().optional(),
    nSaveRecipientAddress: yup.string().optional(),
    documents: isEditMode
      ? yup
          .array()
          .of(
            yup.object({
              name: yup.string().optional(),
              file: yup.mixed<File>().optional(),
            }),
          )
          .optional()
      : yup
          .array()
          .of(
            yup.object({
              name: yup.string().required('Document name is required'),
              file: yup
                .mixed<File>()
                .required('Document file is required')
                .test('file-required', 'Document file is required', (value) => {
                  return value instanceof File && value.size > 0;
                }),
            }),
          )
          .min(1, 'At least one document is required')
          .default([]),
  };

  return yup.object(baseSchema).required();
};

// Helper function to map employee (snake_case) to form data (camelCase)
const mapEmployeeToFormData = (
  employee: Employee,
): Partial<EmployeeFormData> => {
  return {
    fullName: employee.full_name,
    email: employee.email,
    dateOfBirth: employee.date_of_birth || '',
    designations: employee.designations,
    jobType: employee.job_type,
    startDate: employee.start_date,
    endDate: employee.end_date || '',
    employmentStatus: employee.employment_status,
    contactNumber: employee.contact_number || '',
    personalEmail: employee.personal_email || '',
    homeAddress: employee.home_address || '',
    emergencyContactName: employee.emergency_contact_name || '',
    relationToEmergencyContact: employee.relation_to_emergency_contact || '',
    emergencyContactNumber: employee.emergency_contact_number || '',
    personalBankName: employee.personal_bank_name,
    bankAccountTitle: employee.bank_account_title,
    iban: employee.iban,
    swiftCode: employee.swift_code,
    payoneerName: employee.payoneer_name || '',
    payoneerEmail: employee.payoneer_email || '',
    payoneerCustomerId: employee.payoneer_customer_id || '',
    nSaveName: employee.nsave_name || '',
    nSaveBankName: employee.nsave_bank_name || '',
    nSaveIban: employee.nsave_iban || '',
    nSaveSwiftCode: employee.nsave_swift_code || '',
    nSaveBankAddress: employee.nsave_bank_address || '',
    nSaveRecipientAddress: employee.nsave_recipient_address || '',
    // Documents are optional when editing - don't populate them
    documents: [],
  };
};

// Helper function to map form data (camelCase) to database schema (snake_case)
const mapFormDataToEmployeeData = (
  data: EmployeeFormData,
): Parameters<typeof employeesService.create>[0] => {
  return {
    full_name: data.fullName,
    email: data.email,
    date_of_birth: data.dateOfBirth || null,
    designations: data.designations,
    job_type: data.jobType,
    start_date: data.startDate,
    end_date: data.endDate || null,
    employment_status: data.employmentStatus,
    contact_number: data.contactNumber || null,
    personal_email: data.personalEmail || null,
    home_address: data.homeAddress || null,
    emergency_contact_name: data.emergencyContactName || null,
    relation_to_emergency_contact: data.relationToEmergencyContact || null,
    emergency_contact_number: data.emergencyContactNumber || null,
    personal_bank_name: data.personalBankName,
    bank_account_title: data.bankAccountTitle,
    iban: data.iban,
    swift_code: data.swiftCode,
    payoneer_name: data.payoneerName || null,
    payoneer_email: data.payoneerEmail || null,
    payoneer_customer_id: data.payoneerCustomerId || null,
    nsave_name: data.nSaveName || null,
    nsave_bank_name: data.nSaveBankName || null,
    nsave_iban: data.nSaveIban || null,
    nsave_swift_code: data.nSaveSwiftCode || null,
    nsave_bank_address: data.nSaveBankAddress || null,
    nsave_recipient_address: data.nSaveRecipientAddress || null,
    user_type: 'employee' as const,
  };
};

export function useEmployeeForm(employeeId?: string) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditMode = !!employeeId;

  // Fetch employee data if editing
  const {
    data: employee,
    isLoading: isLoadingEmployee,
    error: employeeError,
    isError: isEmployeeError,
  } = useQuery({
    queryKey: ['employee', employeeId],
    queryFn: async () => {
      if (!employeeId) {
        throw new Error('Employee ID is required');
      }
      return await employeesService.getById(employeeId);
    },
    enabled: isEditMode && !!employeeId,
    retry: false,
  });

  const form = useForm<EmployeeFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: yupResolver(createEmployeeSchema(isEditMode)) as any,
    defaultValues: {
      jobType: 'full_time',
      employmentStatus: 'probation',
      documents: isEditMode
        ? []
        : [
            { name: 'CNIC Front', file: new File([], '') },
            { name: 'CNIC Back', file: new File([], '') },
            { name: 'Resume', file: new File([], '') },
            { name: 'Offer Letter', file: new File([], '') },
          ],
    },
  });

  const { watch, setValue, reset, trigger } = form;

  // Populate form when employee data loads
  useEffect(() => {
    if (employee && isEditMode) {
      const formData = mapEmployeeToFormData(employee);
      reset(formData);
    }
  }, [employee, isEditMode, reset]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: Parameters<typeof employeesService.create>[0]) =>
      employeesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast({
        variant: 'success',
        title: 'Employee Added',
        description: 'Employee has been added successfully.',
      });
      navigate('/employees');
    },
    onError: (error: Error) => {
      toast({
        variant: 'error',
        title: 'Error',
        description:
          error.message || 'Failed to add employee. Please try again.',
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: Parameters<typeof employeesService.update>[1]) =>
      employeesService.update(employeeId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['employee', employeeId] });
      toast({
        variant: 'success',
        title: 'Employee Updated',
        description: 'Employee has been updated successfully.',
      });
      navigate('/employees');
    },
    onError: (error: Error) => {
      toast({
        variant: 'error',
        title: 'Error',
        description: error.message || 'Failed to update employee. Please try again.',
      });
    },
  });

  const onSubmit = async (data: EmployeeFormData) => {
    const employeeData = mapFormDataToEmployeeData(data);

    if (isEditMode) {
      await updateMutation.mutateAsync(employeeData);
    } else {
      await createMutation.mutateAsync(employeeData);
    }
  };

  // Document handlers
  const documents = watch('documents') || [];

  const addDocument = () => {
    const currentDocuments = watch('documents') || [];
    setValue('documents', [
      ...currentDocuments,
      { name: '', file: new File([], '') },
    ]);
  };

  const removeDocument = (index: number) => {
    const currentDocuments = watch('documents') || [];
    setValue(
      'documents',
      currentDocuments.filter((_, i) => i !== index),
    );
    trigger('documents');
  };

  const updateDocumentName = (index: number, name: string) => {
    const currentDocuments = watch('documents') || [];
    const updated = [...currentDocuments];
    updated[index] = { ...updated[index], name };
    setValue('documents', updated);
    trigger(`documents.${index}.name`);
  };

  const updateDocumentFile = (index: number, file: File | undefined) => {
    const currentDocuments = watch('documents') || [];
    const updated = [...currentDocuments];
    updated[index] = {
      ...updated[index],
      file: file || new File([], ''),
    };
    setValue('documents', updated);
  };

  // Handle query errors
  useEffect(() => {
    if (isEmployeeError && employeeError && isEditMode) {
      console.error('Error loading employee:', employeeError);
      toast({
        variant: 'error',
        title: 'Failed to load employee',
        description:
          employeeError instanceof Error
            ? employeeError.message
            : 'Failed to load employee data. Please try again.',
      });
    }
  }, [isEmployeeError, employeeError, isEditMode, toast]);

  return {
    form,
    onSubmit,
    isEditMode,
    isLoadingEmployee,
    employeeError: isEmployeeError ? employeeError : null,
    isSubmitting:
      form.formState.isSubmitting ||
      createMutation.isPending ||
      updateMutation.isPending,
    documents,
    addDocument,
    removeDocument,
    updateDocumentName,
    updateDocumentFile,
  };
}
