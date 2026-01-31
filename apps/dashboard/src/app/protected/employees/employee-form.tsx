import { useParams, useNavigate } from 'react-router-dom';
import { DashboardPage } from '@devbooks/components';
import { Button } from '@devbooks/ui';
import { Input, TextArea, Select, DatePicker } from '@devbooks/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@devbooks/ui';
import { UserPlus, Edit, ArrowLeft, Trash2, Plus } from '@devbooks/ui';
import { useEmployeeForm } from './use-employee-form';

// Enum types from database
const DESIGNATIONS = [
  'full_stack_developer',
  'qa_engineer',
  'hr_manager',
  'devops_engineer',
  'technical_recruiter',
  'wordpress_developer',
  'react_native_developer',
  'frontend_developer',
  'backend_developer',
] as const;

const CONTRACT_TYPES = ['full_time', 'part_time', 'project_based'] as const;

const EMPLOYEE_STATUSES = [
  'current',
  'terminated',
  'resigned',
  'probation',
] as const;

const BANK_NAMES = [
  'AlBaraka Bank (Pakistan) Limited',
  'Allied Bank Limited',
  'Askari Bank Limited',
  'Bank AL Habib Limited',
  'Bank Alfalah Limited',
  'The Bank of Khyber',
  'The Bank of Punjab',
  'BankIslami Pakistan Limited',
  'Citibank N.A.',
  'Deutsche Bank AG',
  'Dubai Islamic Bank Pakistan Limited',
  'Faysal Bank Limited',
  'First Women Bank Limited',
  'Habib Bank Limited',
  'Habib Metropolitan Bank Limited',
  'Industrial and Commercial Bank of China Limited',
  'Industrial Development Bank of Pakistan',
  'JS Bank Limited',
  'Meezan Bank Limited',
  'MCB Bank Limited',
  'MCB Islamic Bank',
  'National Bank of Pakistan',
  'Punjab Provincial Cooperative Bank Ltd.',
  'Samba Bank Limited',
  'Sindh Bank Limited',
  'Easypaisa Bank Limited',
  'SME Bank Limited',
  'Soneri Bank Limited',
  'Standard Chartered Bank (Pakistan) Ltd',
  'Bank Makramah Limited',
  'The Bank of Tokyo-Mitsubishi UFJ Ltd.',
  'United Bank Limited',
  'Zarai Taraqiati Bank Ltd.',
] as const;

// Helper function to format enum values for display
const formatEnumValue = (value: string): string => {
  return value
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const EmployeeForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    form,
    onSubmit,
    isEditMode,
    isLoadingEmployee,
    employeeError,
    isSubmitting,
    documents,
    addDocument,
    removeDocument,
    updateDocumentName,
    updateDocumentFile,
  } = useEmployeeForm(id);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = form;

  // Show loading state when fetching employee data in edit mode
  if (isEditMode && isLoadingEmployee) {
    return (
      <DashboardPage
        icon={Edit}
        title="Edit Employee"
        description="Loading employee data..."
      >
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </DashboardPage>
    );
  }

  // Show error state if employee data failed to load
  if (isEditMode && employeeError) {
    return (
      <DashboardPage
        icon={Edit}
        title="Edit Employee"
        description="Error loading employee data"
      >
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-destructive mb-4 text-center">
            {employeeError instanceof Error
              ? employeeError.message
              : 'Failed to load employee data. Please try again.'}
          </p>
          <Button onClick={() => navigate('/employees')} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Employees
          </Button>
        </div>
      </DashboardPage>
    );
  }

  return (
    <DashboardPage
      icon={isEditMode ? Edit : UserPlus}
      title={isEditMode ? 'Edit Employee' : 'Add New Employee'}
      description={
        isEditMode
          ? 'Update employee details below'
          : 'Fill in the employee details below'
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Work Details */}
        <Card>
          <CardHeader>
            <CardTitle>Work Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Input
                id="fullName"
                label={
                  <>
                    Full Name <span className="text-destructive">*</span>
                  </>
                }
                placeholder="Enter full name"
                {...register('fullName')}
                error={errors.fullName?.message}
              />

              <Input
                id="email"
                type="email"
                label={
                  <>
                    Email <span className="text-destructive">*</span>
                  </>
                }
                placeholder="Enter email address"
                {...register('email')}
                error={errors.email?.message}
              />

              <DatePicker
                id="dateOfBirth"
                label="Date of Birth"
                placeholder="Select date of birth"
                value={watch('dateOfBirth')}
                onChange={(value: string) => setValue('dateOfBirth', value)}
                onBlur={() => trigger('dateOfBirth')}
                error={errors.dateOfBirth?.message}
                toYear={new Date().getFullYear() - 16}
              />

              <Select
                id="designations"
                label={
                  <>
                    Designation <span className="text-destructive">*</span>
                  </>
                }
                placeholder="Select designation"
                options={DESIGNATIONS.map((value) => ({
                  value,
                  label: formatEnumValue(value),
                }))}
                value={watch('designations')}
                onChange={(value) => setValue('designations', value)}
                onBlur={() => trigger('designations')}
                error={errors.designations?.message}
              />

              <Select
                id="jobType"
                label={
                  <>
                    Job Type <span className="text-destructive">*</span>
                  </>
                }
                placeholder="Select job type"
                options={CONTRACT_TYPES.map((value) => ({
                  value,
                  label: formatEnumValue(value),
                }))}
                value={watch('jobType')}
                onChange={(value) => setValue('jobType', value)}
                onBlur={() => trigger('jobType')}
                error={errors.jobType?.message}
              />

              <Select
                id="employmentStatus"
                label={
                  <>
                    Employment Status{' '}
                    <span className="text-destructive">*</span>
                  </>
                }
                placeholder="Select employment status"
                options={EMPLOYEE_STATUSES.map((value) => ({
                  value,
                  label: formatEnumValue(value),
                }))}
                value={watch('employmentStatus')}
                onChange={(value) => setValue('employmentStatus', value)}
                onBlur={() => trigger('employmentStatus')}
                error={errors.employmentStatus?.message}
              />

              <DatePicker
                id="startDate"
                label={
                  <>
                    Start Date <span className="text-destructive">*</span>
                  </>
                }
                placeholder="Select start date"
                value={watch('startDate')}
                onChange={(value: string) => setValue('startDate', value)}
                onBlur={() => trigger('startDate')}
                error={errors.startDate?.message}
              />

              <DatePicker
                id="endDate"
                label="End Date"
                placeholder="Select end date"
                value={watch('endDate')}
                onChange={(value: string) => setValue('endDate', value)}
                onBlur={() => trigger('endDate')}
                error={errors.endDate?.message}
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Input
                id="contactNumber"
                type="tel"
                label="Contact Number"
                placeholder="Enter contact number"
                {...register('contactNumber')}
                error={errors.contactNumber?.message}
              />

              <Input
                id="personalEmail"
                type="email"
                label="Personal Email"
                placeholder="Enter personal email"
                {...register('personalEmail')}
                error={errors.personalEmail?.message}
              />

              <div className="md:col-span-2">
                <TextArea
                  id="homeAddress"
                  label="Home Address"
                  placeholder="Enter home address"
                  {...register('homeAddress')}
                  error={errors.homeAddress?.message}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contact */}
        <Card>
          <CardHeader>
            <CardTitle>Emergency Contact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Input
                id="relationToEmergencyContact"
                label="Relation to Emergency Contact"
                placeholder="e.g., Father, Mother, Spouse"
                {...register('relationToEmergencyContact')}
                error={errors.relationToEmergencyContact?.message}
              />

              <Input
                id="emergencyContactName"
                label="Emergency Contact Name"
                placeholder="Enter emergency contact name"
                {...register('emergencyContactName')}
                error={errors.emergencyContactName?.message}
              />

              <Input
                id="emergencyContactNumber"
                type="tel"
                label="Emergency Contact Number"
                placeholder="Enter emergency contact number"
                {...register('emergencyContactNumber')}
                error={errors.emergencyContactNumber?.message}
              />
            </div>
          </CardContent>
        </Card>

        {/* Personal Bank Details */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Bank Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Select
                id="personalBankName"
                label={
                  <>
                    Bank Name <span className="text-destructive">*</span>
                  </>
                }
                placeholder="Select bank"
                options={BANK_NAMES.map((bank) => ({
                  value: bank,
                  label: bank,
                }))}
                value={watch('personalBankName')}
                onChange={(value) => setValue('personalBankName', value)}
                onBlur={() => trigger('personalBankName')}
                error={errors.personalBankName?.message}
              />

              <Input
                id="bankAccountTitle"
                label={
                  <>
                    Account Title <span className="text-destructive">*</span>
                  </>
                }
                placeholder="Enter account title"
                {...register('bankAccountTitle')}
                error={errors.bankAccountTitle?.message}
              />

              <Input
                id="iban"
                label={
                  <>
                    IBAN <span className="text-destructive">*</span>
                  </>
                }
                placeholder="Enter IBAN"
                {...register('iban')}
                error={errors.iban?.message}
              />

              <Input
                id="swiftCode"
                label={
                  <>
                    Swift Code <span className="text-destructive">*</span>
                  </>
                }
                placeholder="Enter SWIFT code"
                {...register('swiftCode')}
                error={errors.swiftCode?.message}
              />
            </div>
          </CardContent>
        </Card>

        {/* Payoneer Details */}
        <Card>
          <CardHeader>
            <CardTitle>Payoneer Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Input
                id="payoneerName"
                label="Name"
                placeholder="Enter exact name on Payoneer"
                {...register('payoneerName')}
                error={errors.payoneerName?.message}
              />

              <Input
                id="payoneerEmail"
                type="email"
                label="Email"
                placeholder="Enter email on Payoneer"
                {...register('payoneerEmail')}
                error={errors.payoneerEmail?.message}
              />

              <div className="md:col-span-2">
                <Input
                  id="payoneerCustomerId"
                  label="Customer ID"
                  placeholder="Enter Payoneer customer ID"
                  {...register('payoneerCustomerId')}
                  error={errors.payoneerCustomerId?.message}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* nSave Details */}
        <Card>
          <CardHeader>
            <CardTitle>nSave Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Input
                id="nSaveName"
                label="Name"
                placeholder="Enter exact name on nSave"
                {...register('nSaveName')}
                error={errors.nSaveName?.message}
              />

              <Input
                id="nSaveBankName"
                label="Bank Name"
                placeholder="Enter nSave bank name"
                {...register('nSaveBankName')}
                error={errors.nSaveBankName?.message}
              />

              <Input
                id="nSaveIban"
                label="IBAN"
                placeholder="Enter nSave IBAN"
                {...register('nSaveIban')}
                error={errors.nSaveIban?.message}
              />

              <Input
                id="nSaveSwiftCode"
                label="Swift Code"
                placeholder="Enter nSave SWIFT code"
                {...register('nSaveSwiftCode')}
                error={errors.nSaveSwiftCode?.message}
              />

              <div className="md:col-span-2">
                <TextArea
                  id="nSaveBankAddress"
                  label="Bank Address"
                  placeholder="Enter exact bank address on nSave"
                  {...register('nSaveBankAddress')}
                  error={errors.nSaveBankAddress?.message}
                />
              </div>

              <div className="md:col-span-2">
                <TextArea
                  id="nSaveRecipientAddress"
                  label="Recipient Address"
                  placeholder="Enter exact recipient address on nSave"
                  {...register('nSaveRecipientAddress')}
                  error={errors.nSaveRecipientAddress?.message}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documents */}
        <Card>
          <CardHeader>
            <CardTitle>Documents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              {documents.map((document, index) => (
                <div
                  key={index}
                  className="flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-start"
                >
                  <div className="flex-1">
                    <Input
                      id={`document-name-${index}`}
                      label={
                        index === 0 ? (
                          <>
                            Document Name{' '}
                            <span className="text-destructive">*</span>
                          </>
                        ) : (
                          'Document Name'
                        )
                      }
                      placeholder="Enter document name"
                      value={document.name || ''}
                      onChange={(e) =>
                        updateDocumentName(index, e.target.value)
                      }
                      onBlur={() => trigger(`documents.${index}.name`)}
                      error={errors.documents?.[index]?.name?.message as string}
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      id={`document-file-${index}`}
                      type="file"
                      label={
                        <>
                          Upload Document{' '}
                          <span className="text-destructive">*</span>
                        </>
                      }
                      accept="*/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        updateDocumentFile(index, file);
                        trigger(`documents.${index}.file`);
                      }}
                      onBlur={() => trigger(`documents.${index}.file`)}
                      className="cursor-pointer"
                      error={errors.documents?.[index]?.file?.message as string}
                    />
                  </div>
                  {documents.length > 1 && (
                    <div className="flex shrink-0 items-center sm:mt-7">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeDocument(index)}
                        className="h-10 w-10"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Remove document</span>
                      </Button>
                    </div>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addDocument}
                className="w-full sm:w-auto"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Document
              </Button>
            </div>
            {errors.documents &&
              typeof errors.documents.message === 'string' && (
                <p className="text-sm text-destructive">
                  {errors.documents.message}
                </p>
              )}
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/employees')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button type="submit" variant="gradient" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Employee'}
          </Button>
        </div>
      </form>
    </DashboardPage>
  );
};

export default EmployeeForm;
