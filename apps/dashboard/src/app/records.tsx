import { DashboardPage } from '@devbooks/components';
import { FolderOpen } from 'lucide-react';

const Records = () => {
  return (
    <DashboardPage
      icon={FolderOpen}
      title="Records"
      description="Access and manage company records"
    >
      <div className="rounded-lg border bg-card p-6">
        <p className="text-muted-foreground">
          Records management content will go here.
        </p>
      </div>
    </DashboardPage>
  );
};

export default Records;
