import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { DashboardPage } from '@devbooks/components';
import { Button } from '@devbooks/ui';
import { Input } from '@devbooks/ui';
import { Label } from '@devbooks/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@devbooks/ui';
import { useToast } from '@devbooks/hooks';
import { UserPlus, ArrowLeft } from 'lucide-react';

type EmployeeFormData = {
  // Work Details
  fullName: string;
  fatherName: string;
  cnic: string;
  dateOfBirth: string;
  designation: string;
  type: string;
  startDate: string;
  endDate?: string;
  exp?: string;
  
  // Contact Info
  phone: string;
  email: string;
  address: string;
  
  // Emergency Contact
  emergencyRelationship: string;
  emergencyName: string;
  emergencyNumber: string;
  
  // Personal Bank Details
  bankName?: string;
  accountTitle?: string;
  iban?: string;
  swiftCode?: string;
  bankNameFull?: string;
  
  // Payoneer Details
  payoneerName?: string;
  payoneerIban?: string;
  payoneerBicSwift?: string;
  payoneerBank?: string;
  payoneerBankAddress?: string;
  payoneerRecipientAddress?: string;
  payoneerCustomerName?: string;
  payoneerCustomerId?: string;
  payoneerEmail?: string;
};

const employeeSchema = yup
  .object({
    // Work Details
    fullName: yup.string().required('Full name is required'),
    fatherName: yup.string().required('Father name is required'),
    cnic: yup
      .string()
      .required('CNIC is required')
      .matches(/^\d{5}-\d{7}-\d{1}$/, 'CNIC must be in format XXXXX-XXXXXXX-X'),
    dateOfBirth: yup.string().required('Date of birth is required'),
    designation: yup.string().required('Designation is required'),
    type: yup.string().required('Type is required'),
    startDate: yup.string().required('Start date is required'),
    endDate: yup.string(),
    exp: yup.string(),
    
    // Contact Info
    phone: yup
      .string()
      .required('Phone is required')
      .matches(/^\+?[\d\s-]+$/, 'Invalid phone number format'),
    email: yup
      .string()
      .required('Email is required')
      .email('Invalid email address'),
    address: yup.string().required('Address is required'),
    
    // Emergency Contact
    emergencyRelationship: yup.string().required('Emergency relationship is required'),
    emergencyName: yup.string().required('Emergency contact name is required'),
    emergencyNumber: yup
      .string()
      .required('Emergency contact number is required')
      .matches(/^\+?[\d\s-]+$/, 'Invalid phone number format'),
    
    // Personal Bank Details (optional)
    bankName: yup.string(),
    accountTitle: yup.string(),
    iban: yup.string(),
    swiftCode: yup.string(),
    bankNameFull: yup.string(),
    
    // Payoneer Details (optional)
    payoneerName: yup.string(),
    payoneerIban: yup.string(),
    payoneerBicSwift: yup.string(),
    payoneerBank: yup.string(),
    payoneerBankAddress: yup.string(),
    payoneerRecipientAddress: yup.string(),
    payoneerCustomerName: yup.string(),
    payoneerCustomerId: yup.string(),
    payoneerEmail: yup.string().email('Invalid email address'),
  })
  .required();

const AddEmployee = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EmployeeFormData>({
    resolver: yupResolver(employeeSchema),
  });

  const onSubmit = async (data: EmployeeFormData) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    toast({
      variant: 'success',
      title: 'Employee Added',
      description: 'Employee has been added successfully.',
    });

    navigate('/employees');
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
              <div className="space-y-2">
                <Label htmlFor="fullName">
                  Full Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="fullName"
                  {...register('fullName')}
                  className={errors.fullName ? 'border-destructive' : ''}
                />
                {errors.fullName && (
                  <p className="text-destructive text-sm">
                    {errors.fullName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="fatherName">
                  Father Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="fatherName"
                  {...register('fatherName')}
                  className={errors.fatherName ? 'border-destructive' : ''}
                />
                {errors.fatherName && (
                  <p className="text-destructive text-sm">
                    {errors.fatherName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cnic">
                  CNIC <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="cnic"
                  placeholder="XXXXX-XXXXXXX-X"
                  {...register('cnic')}
                  className={errors.cnic ? 'border-destructive' : ''}
                />
                {errors.cnic && (
                  <p className="text-destructive text-sm">
                    {errors.cnic.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">
                  Date of Birth <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  {...register('dateOfBirth')}
                  className={errors.dateOfBirth ? 'border-destructive' : ''}
                />
                {errors.dateOfBirth && (
                  <p className="text-destructive text-sm">
                    {errors.dateOfBirth.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="designation">
                  Designation <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="designation"
                  {...register('designation')}
                  className={errors.designation ? 'border-destructive' : ''}
                />
                {errors.designation && (
                  <p className="text-destructive text-sm">
                    {errors.designation.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">
                  Type <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="type"
                  {...register('type')}
                  className={errors.type ? 'border-destructive' : ''}
                />
                {errors.type && (
                  <p className="text-destructive text-sm">
                    {errors.type.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="startDate">
                  Start Date <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  {...register('startDate')}
                  className={errors.startDate ? 'border-destructive' : ''}
                />
                {errors.startDate && (
                  <p className="text-destructive text-sm">
                    {errors.startDate.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  {...register('endDate')}
                  className={errors.endDate ? 'border-destructive' : ''}
                />
                {errors.endDate && (
                  <p className="text-destructive text-sm">
                    {errors.endDate.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="exp">Experience</Label>
                <Input
                  id="exp"
                  {...register('exp')}
                  className={errors.exp ? 'border-destructive' : ''}
                />
                {errors.exp && (
                  <p className="text-destructive text-sm">
                    {errors.exp.message}
                  </p>
                )}
              </div>
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
              <div className="space-y-2">
                <Label htmlFor="phone">
                  Phone <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  {...register('phone')}
                  className={errors.phone ? 'border-destructive' : ''}
                />
                {errors.phone && (
                  <p className="text-destructive text-sm">
                    {errors.phone.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  className={errors.email ? 'border-destructive' : ''}
                />
                {errors.email && (
                  <p className="text-destructive text-sm">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">
                  Address <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="address"
                  {...register('address')}
                  className={errors.address ? 'border-destructive' : ''}
                />
                {errors.address && (
                  <p className="text-destructive text-sm">
                    {errors.address.message}
                  </p>
                )}
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
              <div className="space-y-2">
                <Label htmlFor="emergencyRelationship">
                  Relationship <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="emergencyRelationship"
                  {...register('emergencyRelationship')}
                  className={
                    errors.emergencyRelationship ? 'border-destructive' : ''
                  }
                />
                {errors.emergencyRelationship && (
                  <p className="text-destructive text-sm">
                    {errors.emergencyRelationship.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergencyName">
                  Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="emergencyName"
                  {...register('emergencyName')}
                  className={errors.emergencyName ? 'border-destructive' : ''}
                />
                {errors.emergencyName && (
                  <p className="text-destructive text-sm">
                    {errors.emergencyName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergencyNumber">
                  Number <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="emergencyNumber"
                  type="tel"
                  {...register('emergencyNumber')}
                  className={
                    errors.emergencyNumber ? 'border-destructive' : ''
                  }
                />
                {errors.emergencyNumber && (
                  <p className="text-destructive text-sm">
                    {errors.emergencyNumber.message}
                  </p>
                )}
              </div>
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
              <div className="space-y-2">
                <Label htmlFor="bankName">Bank Name</Label>
                <Input
                  id="bankName"
                  {...register('bankName')}
                  className={errors.bankName ? 'border-destructive' : ''}
                />
                {errors.bankName && (
                  <p className="text-destructive text-sm">
                    {errors.bankName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountTitle">Account Title</Label>
                <Input
                  id="accountTitle"
                  {...register('accountTitle')}
                  className={errors.accountTitle ? 'border-destructive' : ''}
                />
                {errors.accountTitle && (
                  <p className="text-destructive text-sm">
                    {errors.accountTitle.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="iban">IBAN</Label>
                <Input
                  id="iban"
                  {...register('iban')}
                  className={errors.iban ? 'border-destructive' : ''}
                />
                {errors.iban && (
                  <p className="text-destructive text-sm">
                    {errors.iban.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="swiftCode">Swift Code</Label>
                <Input
                  id="swiftCode"
                  {...register('swiftCode')}
                  className={errors.swiftCode ? 'border-destructive' : ''}
                />
                {errors.swiftCode && (
                  <p className="text-destructive text-sm">
                    {errors.swiftCode.message}
                  </p>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="bankNameFull">Bank Name (Full)</Label>
                <Input
                  id="bankNameFull"
                  {...register('bankNameFull')}
                  className={errors.bankNameFull ? 'border-destructive' : ''}
                />
                {errors.bankNameFull && (
                  <p className="text-destructive text-sm">
                    {errors.bankNameFull.message}
                  </p>
                )}
              </div>
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
              <div className="space-y-2">
                <Label htmlFor="payoneerName">Name</Label>
                <Input
                  id="payoneerName"
                  {...register('payoneerName')}
                  className={errors.payoneerName ? 'border-destructive' : ''}
                />
                {errors.payoneerName && (
                  <p className="text-destructive text-sm">
                    {errors.payoneerName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="payoneerIban">IBAN</Label>
                <Input
                  id="payoneerIban"
                  {...register('payoneerIban')}
                  className={errors.payoneerIban ? 'border-destructive' : ''}
                />
                {errors.payoneerIban && (
                  <p className="text-destructive text-sm">
                    {errors.payoneerIban.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="payoneerBicSwift">BIC/SWIFT Code</Label>
                <Input
                  id="payoneerBicSwift"
                  {...register('payoneerBicSwift')}
                  className={
                    errors.payoneerBicSwift ? 'border-destructive' : ''
                  }
                />
                {errors.payoneerBicSwift && (
                  <p className="text-destructive text-sm">
                    {errors.payoneerBicSwift.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="payoneerBank">Bank</Label>
                <Input
                  id="payoneerBank"
                  {...register('payoneerBank')}
                  className={errors.payoneerBank ? 'border-destructive' : ''}
                />
                {errors.payoneerBank && (
                  <p className="text-destructive text-sm">
                    {errors.payoneerBank.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="payoneerBankAddress">Bank Address</Label>
                <Input
                  id="payoneerBankAddress"
                  {...register('payoneerBankAddress')}
                  className={
                    errors.payoneerBankAddress ? 'border-destructive' : ''
                  }
                />
                {errors.payoneerBankAddress && (
                  <p className="text-destructive text-sm">
                    {errors.payoneerBankAddress.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="payoneerRecipientAddress">
                  Recipient Address
                </Label>
                <Input
                  id="payoneerRecipientAddress"
                  {...register('payoneerRecipientAddress')}
                  className={
                    errors.payoneerRecipientAddress ? 'border-destructive' : ''
                  }
                />
                {errors.payoneerRecipientAddress && (
                  <p className="text-destructive text-sm">
                    {errors.payoneerRecipientAddress.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="payoneerCustomerName">Customer Name</Label>
                <Input
                  id="payoneerCustomerName"
                  {...register('payoneerCustomerName')}
                  className={
                    errors.payoneerCustomerName ? 'border-destructive' : ''
                  }
                />
                {errors.payoneerCustomerName && (
                  <p className="text-destructive text-sm">
                    {errors.payoneerCustomerName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="payoneerCustomerId">Customer ID</Label>
                <Input
                  id="payoneerCustomerId"
                  {...register('payoneerCustomerId')}
                  className={
                    errors.payoneerCustomerId ? 'border-destructive' : ''
                  }
                />
                {errors.payoneerCustomerId && (
                  <p className="text-destructive text-sm">
                    {errors.payoneerCustomerId.message}
                  </p>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="payoneerEmail">Email</Label>
                <Input
                  id="payoneerEmail"
                  type="email"
                  {...register('payoneerEmail')}
                  className={errors.payoneerEmail ? 'border-destructive' : ''}
                />
                {errors.payoneerEmail && (
                  <p className="text-destructive text-sm">
                    {errors.payoneerEmail.message}
                  </p>
                )}
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

export default AddEmployee;
