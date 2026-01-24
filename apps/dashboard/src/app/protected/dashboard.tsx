import { DashboardPage } from '@devbooks/components';
import { LayoutDashboard } from '@devbooks/ui';
import { useSignOut } from '../../lib/auth-handler';

const Dashboard = () => {
  const handleSignOut = useSignOut();

  return (
    <DashboardPage
      icon={LayoutDashboard}
      title="Dashboard"
      description="Welcome to your dashboard!"
      onSignOut={handleSignOut}
    >
      <div className="rounded-lg border bg-card p-6">
        <p className="text-muted-foreground">Dashboard content will go here.</p>
      </div>
    </DashboardPage>
  );
};

export default Dashboard;
