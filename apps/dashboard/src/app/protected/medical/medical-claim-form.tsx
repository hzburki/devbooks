import { useParams, useNavigate } from 'react-router-dom';
import { DashboardPage } from '@devbooks/components';
import {
  Button,
  Input,
  Select,
  DatePicker,
  TextArea,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@devbooks/ui';
import {
  Heart,
  Edit,
  ArrowLeft,
  Trash2,
  Plus,
  CheckCircle2,
  Download,
} from '@devbooks/ui';
import { useMedicalClaimForm, type ReceiptItem } from './use-medical-claim-form';
import { medicalReceiptsService } from '../../../services';
import type {
  MedicalBenefitsFor,
  MedicalCategory,
} from '@devbooks/utils';

const medicalCategories = [
  {
    value: 'surgery_and_hospitalization',
    label: 'Surgery & Hospitalization',
  },
  { value: 'maternity_care', label: 'Maternity Care' },
  { value: 'dental_care', label: 'Dental Care' },
  { value: 'vision_care', label: 'Vision Care' },
  { value: 'prescription_medicine', label: 'Prescription Medicine' },
  { value: 'labs_and_medical_tests', label: 'Labs & Medical Tests' },
  { value: 'consultation', label: 'Consultation' },
];

const beneficiaries = [
  { value: 'self', label: 'Self' },
  { value: 'spouse', label: 'Spouse' },
  { value: 'parents', label: 'Parents' },
  { value: 'siblings', label: 'Siblings' },
  { value: 'children', label: 'Children' },
];

const MedicalClaimForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    form,
    onSubmit,
    isEditMode,
    isLoadingClaim,
    claimError,
    isSubmitting,
    employees,
  } = useMedicalClaimForm(id);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = form;

  const receipts = watch('receipts') || [];

  // Show loading state when fetching claim data in edit mode
  if (isEditMode && isLoadingClaim) {
    return (
      <DashboardPage
        icon={Edit}
        title="Edit Medical Claim"
        description="Loading medical claim data..."
      >
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </DashboardPage>
    );
  }

  // Show error state if claim data failed to load
  if (isEditMode && claimError) {
    return (
      <DashboardPage
        icon={Edit}
        title="Edit Medical Claim"
        description="Error loading medical claim data"
      >
        <div className="flex flex-col items-center justify-center py-12">
          <p className="mb-4 text-center text-destructive">
            {claimError instanceof Error
              ? claimError.message
              : 'Failed to load medical claim data. Please try again.'}
          </p>
          <Button onClick={() => navigate('/medical')} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Medical
          </Button>
        </div>
      </DashboardPage>
    );
  }

  // Convert employees to Select options
  const employeeOptions = employees.map((emp) => ({
    value: emp.id,
    label: emp.full_name,
  }));

  const addReceipt = () => {
    const currentReceipts = watch('receipts') || [];
    setValue('receipts', [
      ...currentReceipts,
      {
        for: 'self',
        medicalCategory: 'consultation',
        costPkr: 0,
        description: '',
      },
    ]);
  };

  const removeReceipt = (index: number) => {
    const currentReceipts = watch('receipts') || [];
    const receipt = currentReceipts[index];
    
    if (receipt.id) {
      // Mark as deleted for existing receipts
      const updated = [...currentReceipts];
      updated[index] = { ...receipt, isDeleted: true };
      setValue('receipts', updated);
    } else {
      // Remove new receipts
      const updated = currentReceipts.filter((_, i) => i !== index);
      setValue('receipts', updated);
    }
    
    trigger('receipts');
  };

  const updateReceiptField = (
    index: number,
    field: keyof ReceiptItem,
    value: unknown,
  ) => {
    const currentReceipts = watch('receipts') || [];
    const updated = [...currentReceipts];
    updated[index] = { ...updated[index], [field]: value };
    setValue('receipts', updated);
    trigger(`receipts.${index}.${field}`);
  };

  const handleFileChange = (index: number, file: File | null) => {
    if (file) {
      updateReceiptField(index, 'file', file);
      trigger(`receipts.${index}.file`);
    }
  };

  const removeFile = (index: number) => {
    const currentReceipts = watch('receipts') || [];
    const receipt = currentReceipts[index];
    
    // Clear file and filePath to allow re-upload
    const updated = [...currentReceipts];
    updated[index] = {
      ...receipt,
      file: undefined,
      filePath: undefined,
    };
    setValue('receipts', updated);
    trigger(`receipts.${index}.file`);
  };

  // Filter out deleted receipts for display
  const visibleReceipts = receipts.filter((r) => !r.isDeleted);

  return (
    <DashboardPage
      icon={isEditMode ? Edit : Heart}
      title={isEditMode ? 'Edit Medical Claim' : 'Add Medical Claim'}
      description={
        isEditMode
          ? 'Update medical claim details below'
          : 'Submit medical benefit claim(s). Each receipt will be a separate claim.'
      }
      onBack={() => navigate('/medical')}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Claim Information */}
        <Card>
          <CardHeader>
            <CardTitle>Claim Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Employee Selection */}
              <div className="space-y-2">
                <Select
                  label={
                    <>
                      Employee <span className="text-destructive">*</span>
                    </>
                  }
                  id="employeeId"
                  value={watch('employeeId')}
                  onChange={(value) => setValue('employeeId', value)}
                  options={employeeOptions}
                  placeholder="Select an employee"
                  error={errors.employeeId?.message}
                />
              </div>

              {/* Date */}
              <div className="space-y-2">
                <DatePicker
                  label={
                    <>
                      Date <span className="text-destructive">*</span>
                    </>
                  }
                  id="date"
                  value={watch('date')}
                  onChange={(value) => setValue('date', value || '')}
                  error={errors.date?.message}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Receipts */}
        <Card>
          <CardHeader>
            <CardTitle>
              Receipts{' '}
              <span className="text-sm font-normal text-muted-foreground">
                (Each receipt will be a separate claim)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              {visibleReceipts.map((receipt, index) => {
                const actualIndex = receipts.findIndex(
                  (r, i) => !r.isDeleted && i === index,
                );
                const isUploading = receipt.isUploading;
                const hasFile = receipt.id || receipt.filePath || receipt.file;
                const fileUrl = receipt.filePath
                  ? medicalReceiptsService.getPublicUrl(receipt.filePath)
                  : null;

                return (
                  <div
                    key={receipt.id || `new-${actualIndex}`}
                    className="relative flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-start"
                  >
                    {/* Loading Overlay */}
                    {isUploading && (
                      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-lg bg-background/80 backdrop-blur-sm">
                        <div className="w-full max-w-md space-y-2 px-4">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                              Uploading...
                            </span>
                            <span className="text-muted-foreground">
                              {receipt.uploadProgress || 0}%
                            </span>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full bg-primary transition-all duration-300"
                              style={{
                                width: `${receipt.uploadProgress || 0}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Left Section - Receipt Fields */}
                    <div className="flex-1 space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        {/* For (Beneficiary) */}
                        <div className="space-y-2">
                          <Select
                            label={
                              <>
                                For <span className="text-destructive">*</span>
                              </>
                            }
                            id={`receipt-for-${actualIndex}`}
                            value={receipt.for || 'self'}
                            onChange={(value) =>
                              updateReceiptField(
                                actualIndex,
                                'for',
                                value as MedicalBenefitsFor,
                              )
                            }
                            options={beneficiaries}
                            placeholder="Select beneficiary"
                            error={
                              errors.receipts?.[actualIndex]?.for?.message as string
                            }
                            disabled={isUploading}
                          />
                        </div>

                        {/* Medical Category */}
                        <div className="space-y-2">
                          <Select
                            label={
                              <>
                                Category <span className="text-destructive">*</span>
                              </>
                            }
                            id={`receipt-category-${actualIndex}`}
                            value={receipt.medicalCategory || 'consultation'}
                            onChange={(value) =>
                              updateReceiptField(
                                actualIndex,
                                'medicalCategory',
                                value as MedicalCategory,
                              )
                            }
                            options={medicalCategories}
                            placeholder="Select category"
                            error={
                              errors.receipts?.[actualIndex]?.medicalCategory
                                ?.message as string
                            }
                            disabled={isUploading}
                          />
                        </div>
                      </div>

                      {/* Description */}
                      <div className="space-y-2">
                        <TextArea
                          label={
                            <>
                              Description{' '}
                              <span className="text-destructive">*</span>
                            </>
                          }
                          id={`receipt-description-${actualIndex}`}
                          placeholder="Describe the medical expense..."
                          value={receipt.description || ''}
                          onChange={(e) =>
                            updateReceiptField(
                              actualIndex,
                              'description',
                              e.target.value,
                            )
                          }
                          onBlur={() =>
                            trigger(`receipts.${actualIndex}.description`)
                          }
                          error={
                            errors.receipts?.[actualIndex]?.description
                              ?.message as string
                          }
                          rows={2}
                          disabled={isUploading}
                        />
                      </div>

                      {/* Cost */}
                      <div className="space-y-2">
                        <Input
                          label={
                            <>
                              Cost (PKR){' '}
                              <span className="text-destructive">*</span>
                            </>
                          }
                          id={`receipt-cost-${actualIndex}`}
                          type="number"
                          min="1"
                          step="1"
                          placeholder="0"
                          value={receipt.costPkr || 0}
                          onChange={(e) =>
                            updateReceiptField(
                              actualIndex,
                              'costPkr',
                              Number(e.target.value),
                            )
                          }
                          onBlur={() =>
                            trigger(`receipts.${actualIndex}.costPkr`)
                          }
                          error={
                            errors.receipts?.[actualIndex]?.costPkr
                              ?.message as string
                          }
                          disabled={isUploading}
                        />
                      </div>
                    </div>

                    {/* Right Section - File Upload */}
                    <div className="flex-1 space-y-2">
                      {!hasFile ? (
                        <Input
                          id={`receipt-file-${actualIndex}`}
                          type="file"
                          label={
                            <>
                              Upload Receipt{' '}
                              <span className="text-destructive">*</span>
                            </>
                          }
                          accept="image/*,.pdf"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleFileChange(actualIndex, file);
                            }
                          }}
                          onBlur={() =>
                            trigger(`receipts.${actualIndex}.file`)
                          }
                          className="cursor-pointer"
                          disabled={isUploading}
                          error={
                            errors.receipts?.[actualIndex]?.file
                              ?.message as string
                          }
                        />
                      ) : (
                        <div>
                          <div className="pt-7">
                            <div className="text-sm text-muted-foreground">
                              File uploaded
                            </div>
                          </div>
                          {hasFile && !isUploading && (
                            <div className="mt-2 flex flex-col gap-2">
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <CheckCircle2 className="h-4 w-4 text-success" />
                                <span>Receipt uploaded</span>
                                {fileUrl && (
                                  <a
                                    href={fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="ml-2 flex items-center gap-1 text-primary hover:underline"
                                  >
                                    <Download className="h-3 w-3" />
                                    View
                                  </a>
                                )}
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeFile(actualIndex)}
                                className="w-fit text-xs"
                                disabled={isUploading}
                              >
                                Remove & Re-upload
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Delete Receipt Button - Top Right */}
                    <div className="flex shrink-0 items-start sm:mt-0">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeReceipt(actualIndex)}
                        className="h-10 w-10 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                        disabled={isUploading}
                        title="Delete receipt"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Remove receipt</span>
                      </Button>
                    </div>
                  </div>
                );
              })}

              {!isEditMode && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={addReceipt}
                  className="w-full sm:w-auto"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Another Receipt
                </Button>
              )}
            </div>
            {errors.receipts &&
              typeof errors.receipts.message === 'string' && (
                <p className="text-sm text-destructive">
                  {errors.receipts.message}
                </p>
              )}
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/medical')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button type="submit" variant="gradient" disabled={isSubmitting}>
            {isSubmitting
              ? 'Submitting...'
              : isEditMode
                ? 'Update Claim'
                : 'Submit Claim(s)'}
          </Button>
        </div>
      </form>
    </DashboardPage>
  );
};

export default MedicalClaimForm;
