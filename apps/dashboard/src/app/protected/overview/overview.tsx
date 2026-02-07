import { DashboardPage, DataTable, type Column } from '@devbooks/components';
import { LayoutDashboard, Users, CalendarDays, Heart } from '@devbooks/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@devbooks/ui';
import { useSignOut } from '../../../lib/auth-handler';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@devbooks/utils';
import {
  medicalBenefitsService,
  employeesService,
  leavesService,
} from '../../../services';
import type { EmployeeLimitSummary } from '@devbooks/utils';
import { format } from 'date-fns';
import { useEffect } from 'react';

const currentYear = new Date().getFullYear();

const medicalCategoriesLabels: Record<string, string> = {
  surgery_and_hospitalization: 'Surgery & Hospitalization',
  maternity_care: 'Maternity Care',
  dental_care: 'Dental Care',
  vision_care: 'Vision Care',
  prescription_medicine: 'Prescription Medicine',
  labs_and_medical_tests: 'Labs & Medical Tests',
  consultation: 'Consultation',
};

const Overview = () => {
  const handleSignOut = useSignOut();
  const { toast } = useToast();

  // Fetch statistics
  const { data: employeesResponse } = useQuery({
    queryKey: ['employees', 'all'],
    queryFn: () => employeesService.getAll({ pageSize: 1000 }),
  });

  const { data: medicalRecordsResponse } = useQuery({
    queryKey: ['medical-benefit-records', 'pending'],
    queryFn: () =>
      medicalBenefitsService.getAllRecords({
        paid: false,
        year: currentYear,
        pageSize: 10000,
      }),
  });

  const { data: leaveRequestsResponse } = useQuery({
    queryKey: ['leave-requests', 'pending'],
    queryFn: () => leavesService.getAll({ status: 'pending' }),
  });

  const { data: limitSummaries, error: limitsError } = useQuery({
    queryKey: ['employee-medical-limits', currentYear],
    queryFn: () =>
      medicalBenefitsService.getAllEmployeeLimitSummaries(currentYear),
  });

  useEffect(() => {
    if (limitsError) {
      toast({
        variant: 'error',
        title: 'Error Loading Limits',
        description: limitsError.message,
      });
    }
  }, [limitsError, toast]);

  const totalEmployees = employeesResponse?.employees.length || 0;
  const pendingMedicalClaims =
    medicalRecordsResponse?.records.filter((r) => !r.paid).length || 0;
  const pendingLeaveRequests =
    leaveRequestsResponse?.leaveRequests.filter(
      (r) => r.leave_status === 'pending',
    ).length || 0;

  // Define table columns for employee limits
  const limitColumns: Column<EmployeeLimitSummary>[] = [
    {
      header: 'Employee',
      accessor: 'employee_name',
    },
    {
      header: 'Total Used',
      render: (summary) => (
        <span className="font-medium">
          Rs. {summary.total_used.toLocaleString()}
        </span>
      ),
    },
    {
      header: 'Total Limit',
      render: (summary) => (
        <span className="text-muted-foreground">
          Rs. {summary.total_limit.toLocaleString()}
        </span>
      ),
    },
    {
      header: 'Remaining',
      render: (summary) => (
        <span
          className={`font-medium ${
            summary.remaining < summary.total_limit * 0.1
              ? 'text-destructive'
              : summary.remaining < summary.total_limit * 0.3
                ? 'text-warning'
                : 'text-success'
          }`}
        >
          Rs. {summary.remaining.toLocaleString()}
        </span>
      ),
    },
    {
      header: 'Pending Claims',
      render: (summary) => {
        const pending = medicalRecordsResponse?.records.filter(
          (r) => r.employee_id === summary.employee_id && !r.paid,
        ).length || 0;
        return (
          <span className={pending > 0 ? 'text-warning font-medium' : ''}>
            {pending}
          </span>
        );
      },
    },
  ];

  return (
    <DashboardPage
      icon={LayoutDashboard}
      title="Overview"
      description="Welcome to your dashboard!"
      onSignOut={handleSignOut}
    >
      <div className="space-y-6">
        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Employees
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalEmployees}</div>
              <p className="text-xs text-muted-foreground">
                Current active employees
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Medical Claims
              </CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingMedicalClaims}</div>
              <p className="text-xs text-muted-foreground">
                Unpaid medical claims
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Leave Requests
              </CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingLeaveRequests}</div>
              <p className="text-xs text-muted-foreground">
                Leave requests awaiting approval
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Employee Limits Table */}
        <Card>
          <CardHeader>
            <CardTitle>Employee Medical Limits ({currentYear})</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              data={limitSummaries || []}
              columns={limitColumns}
              loading={!limitSummaries}
              loadingText="Loading employee limits..."
              noDataText="No employee limits found."
              emptyState={{
                icon: Users,
                title: 'No employee limits',
                description:
                  'Employee limits will appear here once medical claims are submitted.',
              }}
              getRowId={(summary) => summary.employee_id}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardPage>
  );
};

export default Overview;
