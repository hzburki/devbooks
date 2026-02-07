import { DashboardPage } from '@devbooks/components';
import { Package } from '@devbooks/ui';
import { useSignOut } from '../../../lib/auth-handler';

const Inventory = () => {
  const handleSignOut = useSignOut();

  return (
    <DashboardPage
      icon={Package}
      title="Inventory"
      description="Manage office inventory and supplies"
      onSignOut={handleSignOut}
    >
      <div className="rounded-lg border bg-card p-6">
        <p className="text-muted-foreground">Inventory management content will go here.</p>
      </div>
    </DashboardPage>
  );
};

export default Inventory;
