import { DashboardPage } from '@devbooks/components';
import { FileText } from 'lucide-react';

const Invoices = () => {
  return (
    <DashboardPage
      icon={FileText}
      title="Invoices"
      description="View and manage invoices"
    >
      <div className="rounded-lg border bg-card p-6">
        <p className="text-muted-foreground">Invoice management content will go here.</p>
      </div>
    </DashboardPage>
  );
};

export default Invoices;
