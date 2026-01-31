import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { DashboardLayout } from './dashboard-layout';
import { Button, ArrowLeft } from '@devbooks/ui';

interface DashboardPageHeaderProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  onBack?: () => void;
}

function DashboardPageHeader({
  icon: Icon,
  title,
  description,
  action,
  onBack,
}: DashboardPageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        {onBack && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onBack}
            title="Go back"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Button>
        )}
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <div>
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">{title}</h1>
            {action}
          </div>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
    </div>
  );
}

interface DashboardPageProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  onSignOut?: () => Promise<void>;
  onBack?: () => void;
}

export function DashboardPage({
  icon,
  title,
  description,
  action,
  children,
  onSignOut,
  onBack,
}: DashboardPageProps) {
  return (
    <DashboardLayout onSignOut={onSignOut}>
      <div className="space-y-6">
        <DashboardPageHeader
          icon={icon}
          title={title}
          description={description}
          action={action}
          onBack={onBack}
        />
        {children}
      </div>
    </DashboardLayout>
  );
}
