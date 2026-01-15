import { DashboardPage } from '@devbooks/components';
import { LayoutDashboard } from 'lucide-react';

const Dashboard = () => {
  return (
    <DashboardPage
      icon={LayoutDashboard}
      title="Dashboard"
      description="Welcome to your dashboard!"
    >
      <div className="rounded-lg border bg-card p-6">
        <p className="text-muted-foreground">Dashboard content will go here.</p>
      </div>
    </DashboardPage>
  );
};

export default Dashboard;
