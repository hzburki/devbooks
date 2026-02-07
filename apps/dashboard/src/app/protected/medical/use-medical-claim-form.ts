import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@devbooks/utils';
import {
  medicalBenefitsService,
  employeesService,
  medicalReceiptsService,
} from '../../../services';
import type {
  CreateMedicalBenefitInput,
  UpdateMedicalBenefitInput,
  MedicalBenefitsFor,
  MedicalCategory,
  MedicalBenefitRecord,
} from '@devbooks/utils';

// Receipt item type
export type ReceiptItem = {
  id?: string; // For existing receipts
  file?: File; // For new file uploads
  filePath?: string; // For existing files
  for: MedicalBenefitsFor;
  medicalCategory: MedicalCategory;
  costPkr: number;
  description: string;
  isUploading?: boolean;
  uploadProgress?: number;
  isDeleted?: boolean;
};

// Form data type (camelCase)
export type MedicalClaimFormData = {
  employeeId: string;
  date: string;
  receipts: ReceiptItem[];
};

// Create schema
const medicalClaimSchema = yup
  .object({
    employeeId: yup.string().required('Please select an employee'),
    date: yup.string().required('Date is required'),
    receipts: yup
      .array()
      .of(
        yup.object({
          for: yup
            .string()
            .oneOf(
              ['self', 'spouse', 'parents', 'siblings', 'children'],
              'Invalid beneficiary',
            )
            .required('Please select who this is for'),
          medicalCategory: yup
            .string()
            .oneOf(
              [
                'surgery_and_hospitalization',
                'maternity_care',
                'dental_care',
                'vision_care',
                'prescription_medicine',
                'labs_and_medical_tests',
                'consultation',
              ],
              'Invalid medical category',
            )
            .required('Please select a medical category'),
          costPkr: yup
            .number()
            .required('Cost is required')
            .positive('Cost must be a positive number')
            .min(1, 'Cost must be at least Rs. 1'),
          description: yup
            .string()
            .required('Description is required')
            .min(3, 'Description must be at least 3 characters'),
          file: yup.mixed().when('filePath', {
            is: (value: string) => !value,
            then: (schema) => schema.required('Please upload a receipt file'),
            otherwise: (schema) => schema.notRequired(),
          }),
        }),
      )
      .min(1, 'At least one receipt is required')
      .required('At least one receipt is required'),
  })
  .required();

// Helper function to map form data to create input (one claim per receipt)
const mapFormDataToCreateInputs = async (
  data: MedicalClaimFormData,
): Promise<CreateMedicalBenefitInput[]> => {
  const inputs: CreateMedicalBenefitInput[] = [];

  for (const receipt of data.receipts) {
    if (receipt.isDeleted) continue;

    let receiptPath = receipt.filePath || '';
    
    // Upload file if it's a new file
    if (receipt.file && !receipt.filePath) {
      receiptPath = await medicalReceiptsService.uploadReceipt(receipt.file);
    }

    inputs.push({
      employee_id: data.employeeId,
      date: data.date,
      for: receipt.for,
      medical_category: receipt.medicalCategory,
      description: receipt.description,
      cost_pkr: receipt.costPkr,
      reciept: receiptPath, // Store file path instead of reference
      // payment_type defaults to 'reimburse' in the database
    });
  }

  return inputs;
};

// Helper function to map existing record to form data
const mapRecordToFormData = (
  record: MedicalBenefitRecord,
): Partial<MedicalClaimFormData> => {
  return {
    employeeId: record.employee_id,
    date: record.date,
    receipts: [
      {
        id: record.id,
        filePath: record.reciept,
        for: record.for,
        medicalCategory: record.medical_category,
        costPkr: record.cost_pkr,
        description: record.description,
      },
    ],
  };
};

export function useMedicalClaimForm(claimId?: string) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditMode = !!claimId;

  // Fetch claim data if editing
  const {
    data: claimRecord,
    isLoading: isLoadingClaim,
    error: claimError,
  } = useQuery({
    queryKey: ['medical-benefit-record', claimId],
    queryFn: () => {
      if (!claimId) {
        throw new Error('Claim ID is required');
      }
      return medicalBenefitsService.getRecordById(claimId);
    },
    enabled: isEditMode && !!claimId,
    retry: false,
  });

  // Fetch employees for the select dropdown
  const { data: employeesResponse } = useQuery({
    queryKey: ['employees', 'all'],
    queryFn: () => employeesService.getAll({ pageSize: 1000 }),
  });

  const employees = employeesResponse?.employees || [];

  const form = useForm<MedicalClaimFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: yupResolver(medicalClaimSchema) as any,
    defaultValues: {
      employeeId: '',
      date: new Date().toISOString().split('T')[0],
      receipts: [
        {
          for: 'self',
          medicalCategory: 'consultation',
          costPkr: 0,
          description: '',
        },
      ],
    },
  });

  const { reset } = form;

  // Populate form when claim data loads
  useEffect(() => {
    if (claimRecord && isEditMode) {
      const formData = mapRecordToFormData(claimRecord);
      reset(formData);
    }
  }, [claimRecord, isEditMode, reset]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (inputs: CreateMedicalBenefitInput[]) => {
      // Create each claim sequentially
      const results = [];
      for (const input of inputs) {
        const result = await medicalBenefitsService.createRecord(input);
        results.push(result);
      }
      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medical-benefit-records'] });
      queryClient.invalidateQueries({ queryKey: ['employee-medical-limits'] });
      toast({
        variant: 'success',
        title: 'Medical Claim(s) Submitted',
        description: 'Medical claim(s) have been submitted successfully.',
      });
      navigate('/medical');
    },
    onError: (error: Error) => {
      toast({
        variant: 'error',
        title: 'Error',
        description:
          error.message || 'Failed to submit medical claim(s). Please try again.',
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: UpdateMedicalBenefitInput) => {
      if (!claimId) {
        throw new Error('Claim ID is required');
      }
      return medicalBenefitsService.updateRecord(claimId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medical-benefit-records'] });
      queryClient.invalidateQueries({ queryKey: ['employee-medical-limits'] });
      queryClient.invalidateQueries({ queryKey: ['medical-benefit-record', claimId] });
      toast({
        variant: 'success',
        title: 'Medical Claim Updated',
        description: 'Medical claim has been updated successfully.',
      });
      navigate('/medical');
    },
    onError: (error: Error) => {
      toast({
        variant: 'error',
        title: 'Error',
        description:
          error.message || 'Failed to update medical claim. Please try again.',
      });
    },
  });

  const onSubmit = async (data: MedicalClaimFormData) => {
    if (isEditMode) {
      // For edit mode, update the single claim
      const receipt = data.receipts[0];
      if (!receipt || receipt.isDeleted) {
        toast({
          variant: 'error',
          title: 'Error',
          description: 'At least one receipt is required.',
        });
        return;
      }

      let receiptPath = receipt.filePath || '';
      
      // Upload new file if provided
      if (receipt.file && !receipt.filePath) {
        receiptPath = await medicalReceiptsService.uploadReceipt(receipt.file);
      }

      const updateData: UpdateMedicalBenefitInput = {
        date: data.date,
        for: receipt.for,
        medical_category: receipt.medicalCategory,
        description: receipt.description,
        cost_pkr: receipt.costPkr,
        reciept: receiptPath,
        // payment_type defaults to 'reimburse' in the database
      };

      await updateMutation.mutateAsync(updateData);
    } else {
      // For create mode, create one claim per receipt
      const inputs = await mapFormDataToCreateInputs(data);
      await createMutation.mutateAsync(inputs);
    }
  };

  return {
    form,
    onSubmit,
    isEditMode,
    isLoadingClaim,
    claimError,
    isSubmitting: form.formState.isSubmitting || createMutation.isPending || updateMutation.isPending,
    employees,
  };
}
