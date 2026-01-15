import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { DashboardPage } from '@devbooks/components';
import { Button } from '@devbooks/ui';
import { Input } from '@devbooks/ui';
import { Label } from '@devbooks/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@devbooks/ui';
import { cn } from '@devbooks/ui';
import { useToast } from '@devbooks/hooks';
import { CalendarPlus, ArrowLeft } from 'lucide-react';

type LeaveFormData = {
  employeeId: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
};

const leaveSchema = yup
  .object({
    employeeId: yup.string().required('Please select an employee'),
    leaveType: yup.string().required('Please select a leave type'),
    startDate: yup.string().required('Start date is required'),
    endDate: yup
      .string()
      .required('End date is required')
      .test(
        'is-after-start',
        'End date must be on or after start date',
        function (value) {
          const { startDate } = this.parent;
          if (!startDate || !value) return true;
          return new Date(value) >= new Date(startDate);
        }
      ),
    reason: yup
      .string()
      .required('Reason is required')
      .min(10, 'Please provide at least 10 characters'),
  })
  .required();

// Mock employees - replace with actual data
const employees = [
  { id: '1', name: 'John Doe' },
  { id: '2', name: 'Jane Smith' },
  { id: '3', name: 'Ahmed Khan' },
  { id: '4', name: 'Sarah Ali' },
  { id: '5', name: 'Michael Brown' },
  { id: '6', name: 'Emily Johnson' },
];

const leaveTypes = [
  { value: 'sick', label: 'Sick Leave', description: 'Medical or health-related absence' },
  { value: 'vacation', label: 'Vacation', description: 'Planned time off' },
  { value: 'personal', label: 'Personal Leave', description: 'Personal matters' },
  { value: 'emergency', label: 'Emergency Leave', description: 'Urgent unforeseen circumstances' },
  { value: 'maternity', label: 'Maternity Leave', description: 'Maternity-related leave' },
  { value: 'paternity', label: 'Paternity Leave', description: 'Paternity-related leave' },
  { value: 'bereavement', label: 'Bereavement', description: 'Loss of a family member' },
  { value: 'unpaid', label: 'Unpaid Leave', description: 'Leave without pay' },
];

const AddLeave = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LeaveFormData>({
    resolver: yupResolver(leaveSchema),
  });

  const startDate = watch('startDate');
  const endDate = watch('endDate');
  const selectedLeaveType = watch('leaveType');

  // Calculate number of days
  const calculateDays = () => {
    if (!startDate || !endDate) return null;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) return null;
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const numberOfDays = calculateDays();

  const onSubmit = async (data: LeaveFormData) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    toast({
      variant: 'success',
      title: 'Leave Request Submitted',
      description: `Your ${numberOfDays}-day leave request has been submitted for approval.`,
    });

    navigate('/leaves');
  };

  return (
    <DashboardPage
      icon={CalendarPlus}
      title="Request Leave"
      description="Submit a new leave request"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Employee & Leave Type */}
        <Card>
          <CardHeader>
            <CardTitle>Leave Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Employee Selection */}
            <div className="space-y-2">
              <Label htmlFor="employeeId">
                Employee <span className="text-destructive">*</span>
              </Label>
              <select
                id="employeeId"
                {...register('employeeId')}
                className={cn(
                  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
                  errors.employeeId && 'border-destructive'
                )}
              >
                <option value="">Select an employee</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name}
                  </option>
                ))}
              </select>
              {errors.employeeId && (
                <p className="text-sm text-destructive">
                  {errors.employeeId.message}
                </p>
              )}
            </div>

            {/* Leave Type Selection */}
            <div className="space-y-3">
              <Label>
                Leave Type <span className="text-destructive">*</span>
              </Label>
              <div className="grid gap-3 sm:grid-cols-2">
                {leaveTypes.map((type) => (
                  <label
                    key={type.value}
                    className={cn(
                      'flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-all hover:bg-muted/50',
                      selectedLeaveType === type.value &&
                        'border-primary bg-primary/5 ring-1 ring-primary',
                      errors.leaveType && 'border-destructive/50'
                    )}
                  >
                    <input
                      type="radio"
                      value={type.value}
                      {...register('leaveType')}
                      className="mt-1"
                    />
                    <div>
                      <p className="font-medium">{type.label}</p>
                      <p className="text-sm text-muted-foreground">
                        {type.description}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
              {errors.leaveType && (
                <p className="text-sm text-destructive">
                  {errors.leaveType.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Date Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="startDate">
                  Start Date <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  {...register('startDate')}
                  className={cn(errors.startDate && 'border-destructive')}
                />
                {errors.startDate && (
                  <p className="text-sm text-destructive">
                    {errors.startDate.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">
                  End Date <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  min={startDate || undefined}
                  {...register('endDate')}
                  className={cn(errors.endDate && 'border-destructive')}
                />
                {errors.endDate && (
                  <p className="text-sm text-destructive">
                    {errors.endDate.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Total Days</Label>
                <div
                  className={cn(
                    'flex h-10 items-center rounded-md border bg-muted px-3 text-sm font-medium',
                    numberOfDays && numberOfDays > 0
                      ? 'text-foreground'
                      : 'text-muted-foreground'
                  )}
                >
                  {numberOfDays && numberOfDays > 0
                    ? `${numberOfDays} day${numberOfDays > 1 ? 's' : ''}`
                    : 'Select dates'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reason */}
        <Card>
          <CardHeader>
            <CardTitle>Reason</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="reason">
                Please provide a reason for your leave request{' '}
                <span className="text-destructive">*</span>
              </Label>
              <textarea
                id="reason"
                rows={4}
                placeholder="Describe the reason for your leave request..."
                {...register('reason')}
                className={cn(
                  'flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
                  errors.reason && 'border-destructive'
                )}
              />
              {errors.reason && (
                <p className="text-sm text-destructive">
                  {errors.reason.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Summary & Actions */}
        {numberOfDays && numberOfDays > 0 && startDate && endDate && (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="py-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium">Leave Summary</p>
                  <p className="text-sm text-muted-foreground">
                    {numberOfDays} day{numberOfDays > 1 ? 's' : ''} from{' '}
                    {new Date(startDate).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}{' '}
                    to{' '}
                    {new Date(endDate).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/leaves')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button type="submit" variant="gradient" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Request'}
          </Button>
        </div>
      </form>
    </DashboardPage>
  );
};

export default AddLeave;
