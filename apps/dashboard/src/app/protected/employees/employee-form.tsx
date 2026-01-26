import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { DashboardPage } from '@devbooks/components';
import { Button } from '@devbooks/ui';
import { Input, TextArea, Select, DatePicker } from '@devbooks/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@devbooks/ui';
import { useToast } from '@devbooks/utils';
import { employeesService } from '../../../services';
import { UserPlus, ArrowLeft } from '@devbooks/ui';

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

const employeeSchema = yup
  .object({
    // Work Details
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

    // Contact Info
    contactNumber: yup.string().optional(),
    personalEmail: yup.string().email('Invalid email address').optional(),
    homeAddress: yup.string().optional(),

    // Emergency Contact
    relationToEmergencyContact: yup.string().optional(),
    emergencyContactName: yup.string().optional(),
    emergencyContactNumber: yup.string().optional(),

    // Personal Bank Details
    personalBankName: yup.string().optional(),
    bankAccountTitle: yup.string().optional(),
    iban: yup.string().optional(),
    swiftCode: yup.string().optional(),

    // Payoneer Details
    payoneerName: yup.string().optional(),
    payoneerEmail: yup.string().email('Invalid email address').optional(),
    payoneerCustomerId: yup.string().optional(),

    // nSave Details
    nSaveName: yup.string().optional(),
    nSaveBankName: yup.string().optional(),
    nSaveIban: yup.string().optional(),
    nSaveSwiftCode: yup.string().optional(),
    nSaveBankAddress: yup.string().optional(),
    nSaveRecipientAddress: yup.string().optional(),
  })
  .required();

type EmployeeFormData = yup.InferType<typeof employeeSchema>;

const EmployeeForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<EmployeeFormData>({
    resolver: yupResolver(employeeSchema),
    defaultValues: {
      jobType: 'full_time',
      employmentStatus: 'probation',
    },
  });

  const onSubmit = async (data: EmployeeFormData) => {
    try {
      // Map form data (camelCase) to database schema (snake_case)
      const employeeData = {
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
        personal_bank_name: data.personalBankName || null,
        bank_account_title: data.bankAccountTitle || null,
        iban: data.iban || null,
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

      await employeesService.create(employeeData);

      toast({
        variant: 'success',
        title: 'Employee Added',
        description: 'Employee has been added successfully.',
      });

      navigate('/employees');
    } catch (error) {
      console.error('Error creating employee:', error);
      toast({
        variant: 'error',
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to add employee. Please try again.',
      });
    }
  };

  return (
    <DashboardPage
      icon={UserPlus}
      title="Add New Employee"
      description="Fill in the employee details below"
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
                label="Bank Name"
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
                label="Account Title"
                placeholder="Enter account title"
                {...register('bankAccountTitle')}
                error={errors.bankAccountTitle?.message}
              />

              <Input
                id="iban"
                label="IBAN"
                placeholder="Enter IBAN"
                {...register('iban')}
                error={errors.iban?.message}
              />

              <Input
                id="swiftCode"
                label="Swift Code"
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
