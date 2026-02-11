import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@devbooks/utils';
import { employeesService, employeeDocumentsService } from '../../../services';
import type {
  Employee,
  UpdateEmployeeInput,
  CreateEmployeeInput,
} from '@devbooks/utils';
import type { EmployeeFormData } from '@devbooks/utils';

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
    swiftCode: yup.string().optional(),
    payoneerName: yup.string().optional(),
    payoneerEmail: yup.string().email('Invalid email address').optional(),
    payoneerCustomerId: yup.string().optional(),
    nSaveName: yup.string().optional(),
    nSaveBankName: yup.string().optional(),
    nSaveIban: yup.string().optional(),
    nSaveSwiftCode: yup.string().optional(),
    nSaveBankAddress: yup.string().optional(),
    nSaveRecipientAddress: yup.string().optional(),
    documents: yup
      .array()
      .of(
        yup.object({
          id: yup.string().optional(),
          name: yup.string().required('Document name is required'),
          file: yup.mixed<File>().optional(),
          filePath: yup.string().optional(),
          uploadProgress: yup.number().optional(),
          isUploading: yup.boolean().optional(),
          isDeleted: yup.boolean().optional(),
        }),
      )
      .test(
        'at-least-one-document',
        'At least one document is required',
        function (value) {
          if (!isEditMode) {
            const validDocuments =
              value?.filter(
                (doc) =>
                  !doc.isDeleted &&
                  (doc.id || (doc.file instanceof File && doc.file.size > 0)),
              ) || [];
            return validDocuments.length > 0;
          }
          return true;
        },
      )
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
    personalBankName: employee.personal_bank_name || '',
    bankAccountTitle: employee.bank_account_title || '',
    iban: employee.iban || '',
    swiftCode: employee.swift_code || undefined,
    payoneerName: employee.payoneer_name || '',
    payoneerEmail: employee.payoneer_email || '',
    payoneerCustomerId: employee.payoneer_customer_id || '',
    nSaveName: employee.nsave_name || '',
    nSaveBankName: employee.nsave_bank_name || '',
    nSaveIban: employee.nsave_iban || '',
    nSaveSwiftCode: employee.nsave_swift_code || '',
    nSaveBankAddress: employee.nsave_bank_address || '',
    nSaveRecipientAddress: employee.nsave_recipient_address || '',
    // Documents will be loaded separately
    documents: [],
  };
};

// Helper function to map form data (camelCase) to database schema (snake_case)
const mapFormDataToEmployeeData = (
  data: EmployeeFormData,
  isEditMode: boolean,
  existingDocumentIds: Set<string> = new Set(),
): CreateEmployeeInput => {
  // Extract document IDs to link and documents to unlink
  const documentIdsToLink: string[] = [];
  const deletedDocumentsSet = new Set<string>();

  // Track documents that are still in the form (not deleted)
  const currentDocumentIds = new Set<string>();

  if (data.documents) {
    data.documents.forEach((doc) => {
      if (doc.isDeleted && doc.id) {
        // Document marked as deleted - unlink it
        deletedDocumentsSet.add(doc.id);
      } else if (doc.id && !doc.isDeleted) {
        currentDocumentIds.add(doc.id);
        // Only link documents that are newly uploaded (not already linked)
        if (!existingDocumentIds.has(doc.id)) {
          documentIdsToLink.push(doc.id);
        }
      }
    });
  }

  // Also unlink documents that were previously linked but are no longer in the form
  if (isEditMode && existingDocumentIds.size > 0) {
    existingDocumentIds.forEach((docId) => {
      if (!currentDocumentIds.has(docId)) {
        // Document was previously linked but is no longer in the form - unlink it
        deletedDocumentsSet.add(docId);
      }
    });
  }

  const deletedDocuments = Array.from(deletedDocumentsSet);

  const employeeData: CreateEmployeeInput = {
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
    swift_code: data.swiftCode || null,
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

  if (isEditMode) {
    return {
      ...employeeData,
      documentIdsToLink:
        documentIdsToLink.length > 0 ? documentIdsToLink : undefined,
      deletedDocuments:
        deletedDocuments.length > 0 ? deletedDocuments : undefined,
    };
  }

  return {
    ...employeeData,
    documentIdsToLink:
      documentIdsToLink.length > 0 ? documentIdsToLink : undefined,
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
    queryFn: () => {
      if (!employeeId) {
        throw new Error('Employee ID is required');
      }
      return employeesService.getById(employeeId);
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
            {
              name: 'CNIC Front',
              isUploading: false,
              uploadProgress: 0,
              isDeleted: false,
            },
            {
              name: 'CNIC Back',
              isUploading: false,
              uploadProgress: 0,
              isDeleted: false,
            },
            {
              name: 'Resume',
              isUploading: false,
              uploadProgress: 0,
              isDeleted: false,
            },
            {
              name: 'Offer Letter',
              isUploading: false,
              uploadProgress: 0,
              isDeleted: false,
            },
          ],
    },
  });

  const { watch, setValue, reset, trigger } = form;

  // Fetch existing documents when editing
  const { data: existingDocuments, isLoading: isLoadingDocuments } = useQuery({
    queryKey: ['employee-documents', employeeId],
    queryFn: () => {
      if (!employeeId) {
        throw new Error('Employee ID is required');
      }
      return employeeDocumentsService.getByEmployeeId(employeeId);
    },
    enabled: isEditMode && !!employeeId,
    retry: false,
  });

  // Track existing document IDs for linking logic
  const existingDocumentIds = new Set(
    existingDocuments?.map((doc) => doc.id) || [],
  );

  // Populate form when employee data loads
  useEffect(() => {
    if (employee && isEditMode) {
      const formData = mapEmployeeToFormData(employee);
      reset(formData);
    }
  }, [employee, isEditMode, reset]);

  // Populate documents when they load
  useEffect(() => {
    if (existingDocuments && isEditMode) {
      const documentFormData = existingDocuments.map((doc) => ({
        id: doc.id,
        name: doc.name,
        filePath: doc.file_path,
        isDeleted: false,
        isUploading: false,
        uploadProgress: 0,
      }));
      setValue('documents', documentFormData);
    }
  }, [existingDocuments, isEditMode, setValue]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateEmployeeInput) => employeesService.create(data),
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
    mutationFn: (data: UpdateEmployeeInput) => {
      if (!employeeId) {
        throw new Error('Employee ID is required');
      }
      return employeesService.update(employeeId, data);
    },
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
        description:
          error.message || 'Failed to update employee. Please try again.',
      });
    },
  });

  const onSubmit = async (data: EmployeeFormData) => {
    // Ensure all documents are uploaded before submitting
    const documentsToUpload = data.documents?.filter(
      (doc) => !doc.id && doc.file instanceof File && !doc.isDeleted,
    );

    if (documentsToUpload && documentsToUpload.length > 0) {
      toast({
        variant: 'error',
        title: 'Upload in Progress',
        description: 'Please wait for all documents to finish uploading.',
      });
      return;
    }

    const employeeData = mapFormDataToEmployeeData(
      data,
      isEditMode,
      existingDocumentIds,
    );

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
      {
        name: '',
        isUploading: false,
        uploadProgress: 0,
        isDeleted: false,
      },
    ]);
  };

  const removeDocument = (index: number) => {
    const currentDocuments = watch('documents') || [];
    const document = currentDocuments[index];

    if (document?.id) {
      // Existing document - mark as deleted
      const updated = [...currentDocuments];
      updated[index] = {
        ...updated[index],
        isDeleted: true,
      };
      setValue('documents', updated);
    } else {
      // New document - remove from form
      setValue(
        'documents',
        currentDocuments.filter((_, i) => i !== index),
      );
    }
    trigger('documents');
  };

  const updateDocumentName = (index: number, name: string) => {
    const currentDocuments = watch('documents') || [];
    const updated = [...currentDocuments];
    updated[index] = { ...updated[index], name };
    setValue('documents', updated);
    trigger(`documents.${index}.name`);
  };

  const updateDocumentFile = async (index: number, file: File | undefined) => {
    if (!file) {
      return;
    }

    const currentDocuments = watch('documents') || [];
    const document = currentDocuments[index];

    if (!document?.name) {
      toast({
        variant: 'error',
        title: 'Document Name Required',
        description: 'Please enter a document name before uploading.',
      });
      return;
    }

    // Set uploading state
    const updated = [...currentDocuments];
    updated[index] = {
      ...updated[index],
      file,
      isUploading: true,
      uploadProgress: 0,
    };
    setValue('documents', updated);

    try {
      // Upload file immediately
      const uploadedDocument = await employeeDocumentsService.uploadDocument(
        file,
        document.name,
        (progress) => {
          // Update progress
          const currentDocs = watch('documents') || [];
          const updatedDocs = [...currentDocs];
          if (updatedDocs[index]) {
            updatedDocs[index] = {
              ...updatedDocs[index],
              uploadProgress: progress,
            };
            setValue('documents', updatedDocs);
          }
        },
      );

      // Update form with document ID and file path
      const finalDocs = watch('documents') || [];
      const finalUpdated = [...finalDocs];
      finalUpdated[index] = {
        ...finalUpdated[index],
        id: uploadedDocument.id,
        filePath: uploadedDocument.file_path,
        isUploading: false,
        uploadProgress: 100,
      };
      setValue('documents', finalUpdated);

      toast({
        variant: 'success',
        title: 'Document Uploaded',
        description: `${document.name} has been uploaded successfully.`,
      });
    } catch (error) {
      console.error('Error uploading document:', error);
      // Reset upload state on error
      const errorDocs = watch('documents') || [];
      const errorUpdated = [...errorDocs];
      errorUpdated[index] = {
        ...errorUpdated[index],
        file: undefined,
        isUploading: false,
        uploadProgress: 0,
      };
      setValue('documents', errorUpdated);

      toast({
        variant: 'error',
        title: 'Upload Failed',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to upload document. Please try again.',
      });
    }
  };

  return {
    form,
    onSubmit,
    isEditMode,
    isLoadingEmployee: isLoadingEmployee || isLoadingDocuments,
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
