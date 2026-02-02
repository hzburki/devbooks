import { useParams, useNavigate } from 'react-router-dom';
import { DashboardPage } from '@devbooks/components';
import {
  Button,
  Label,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Select,
  DatePicker,
  TextArea,
  Switch,
} from '@devbooks/ui';
import { CalendarPlus, ArrowLeft, Edit } from '@devbooks/ui';
import { cn } from '@devbooks/ui';
import { format } from 'date-fns';
import { useLeaveForm } from './use-leave-form';

const leaveTypes = [
  { value: 'casual', label: 'Casual Leave' },
  { value: 'sick', label: 'Sick Leave' },
  { value: 'parental', label: 'Parental Leave' },
  { value: 'other', label: 'Other' },
];

const LeaveForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    form,
    onSubmit,
    isEditMode,
    isLoadingLeaveRequest,
    leaveRequestError,
    isSubmitting,
    employees,
  } = useLeaveForm(id);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = form;

  const startDate = watch('startDate');
  const endDate = watch('endDate');
  const partialLeave = watch('partialLeave');
  const deadlineExtended = watch('deadlineExtended');

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

  // Show loading state when fetching leave request data in edit mode
  if (isEditMode && isLoadingLeaveRequest) {
    return (
      <DashboardPage
        icon={Edit}
        title="Edit Leave Request"
        description="Loading leave request data..."
      >
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </DashboardPage>
    );
  }

  // Show error state if leave request data failed to load
  if (isEditMode && leaveRequestError) {
    return (
      <DashboardPage
        icon={Edit}
        title="Edit Leave Request"
        description="Error loading leave request data"
      >
        <div className="flex flex-col items-center justify-center py-12">
          <p className="mb-4 text-center text-destructive">
            {leaveRequestError instanceof Error
              ? leaveRequestError.message
              : 'Failed to load leave request data. Please try again.'}
          </p>
          <Button onClick={() => navigate('/leaves')} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Leaves
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

  return (
    <DashboardPage
      icon={isEditMode ? Edit : CalendarPlus}
      title={isEditMode ? 'Edit Leave Request' : 'Request Leave'}
      description={
        isEditMode
          ? 'Update leave request details below'
          : 'Submit a new leave request'
      }
      onBack={() => navigate('/leaves')}
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

            {/* Leave Type Selection */}
            <div className="space-y-2">
              <Select
                label={
                  <>
                    Leave Type <span className="text-destructive">*</span>
                  </>
                }
                id="leaveType"
                value={watch('leaveType')}
                onChange={(value) =>
                  setValue(
                    'leaveType',
                    value as 'casual' | 'sick' | 'parental' | 'other',
                  )
                }
                options={leaveTypes}
                placeholder="Select a leave type"
                error={errors.leaveType?.message}
              />
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
                <DatePicker
                  label={
                    <>
                      Start Date <span className="text-destructive">*</span>
                    </>
                  }
                  id="startDate"
                  value={startDate}
                  onChange={(value) => setValue('startDate', value || '')}
                  error={errors.startDate?.message}
                />
              </div>

              <div className="space-y-2">
                <DatePicker
                  label={
                    <>
                      End Date <span className="text-destructive">*</span>
                    </>
                  }
                  id="endDate"
                  value={endDate}
                  onChange={(value) => setValue('endDate', value || '')}
                  error={errors.endDate?.message}
                  fromYear={new Date(startDate || new Date()).getFullYear()}
                />
              </div>

              <div className="space-y-2">
                <Label>Total Days</Label>
                <div
                  className={cn(
                    'flex h-10 items-center rounded-md border bg-muted px-3 text-sm font-medium',
                    numberOfDays && numberOfDays > 0
                      ? 'text-foreground'
                      : 'text-muted-foreground',
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
              <TextArea
                label={
                  <>
                    Please provide a reason for your leave request{' '}
                    <span className="text-destructive">*</span>
                  </>
                }
                id="reason"
                placeholder="Describe the reason for your leave request..."
                {...register('reason')}
                error={errors.reason?.message}
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Options */}
        <Card>
          <CardHeader>
            <CardTitle>Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Switch
              id="partialLeave"
              checked={partialLeave}
              onCheckedChange={(checked) => setValue('partialLeave', checked)}
              label="Partial Leave"
            />
            <Switch
              id="deadlineExtended"
              checked={deadlineExtended}
              onCheckedChange={(checked) =>
                setValue('deadlineExtended', checked)
              }
              label="Deadline Extended"
            />
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
                    {format(new Date(startDate), 'EEE, MMM d')} to{' '}
                    {format(new Date(endDate), 'EEE, MMM d')}
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
            {isSubmitting
              ? 'Submitting...'
              : isEditMode
                ? 'Update Request'
                : 'Submit Request'}
          </Button>
        </div>
      </form>
    </DashboardPage>
  );
};

export default LeaveForm;
