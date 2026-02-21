import { DashboardPage } from '@devbooks/components';
import { LayoutDashboard, Users, CalendarDays, Heart } from '@devbooks/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@devbooks/ui';
import { useSignOut } from '../../../lib/auth-handler';
import { useQuery } from '@tanstack/react-query';
import {
  medicalBenefitsService,
  employeesService,
  leavesService,
} from '../../../services';

const currentYear = new Date().getFullYear();

const Overview = () => {
  const handleSignOut = useSignOut();

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

  const totalEmployees = employeesResponse?.employees.length || 0;
  const pendingMedicalClaims =
    medicalRecordsResponse?.records.filter((r) => !r.paid).length || 0;
  const pendingLeaveRequests =
    leaveRequestsResponse?.leaveRequests.filter(
      (r) => r.leave_status === 'pending',
    ).length || 0;

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
      </div>
    </DashboardPage>
  );
};

export default Overview;
