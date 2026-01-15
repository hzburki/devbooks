import { DashboardPage } from '@devbooks/components';
import { Calendar } from 'lucide-react';

const Leaves = () => {
  return (
    <DashboardPage
      icon={Calendar}
      title="Leaves"
      description="Manage leave requests and approvals"
    >
      <div className="rounded-lg border bg-card p-6">
        <p className="text-muted-foreground">
          Leave management content will go here.
        </p>
      </div>
    </DashboardPage>
  );
};

export default Leaves;
