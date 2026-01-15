import { DashboardPage } from '@devbooks/components';
import { Clock } from 'lucide-react';

const Overtime = () => {
  return (
    <DashboardPage
      icon={Clock}
      title="Overtime"
      description="Track and manage overtime hours"
    >
      <div className="rounded-lg border bg-card p-6">
        <p className="text-muted-foreground">
          Overtime management content will go here.
        </p>
      </div>
    </DashboardPage>
  );
};

export default Overtime;
