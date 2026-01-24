import { ReactNode } from "react";
import { AppSidebar, MobileHeader } from "./app-sidebar";

interface DashboardLayoutProps {
  children: ReactNode;
  onSignOut?: () => Promise<void>;
}

export function DashboardLayout({ children, onSignOut }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar onSignOut={onSignOut} />
      <MobileHeader onSignOut={onSignOut} />
      <main className="min-h-screen md:ml-64">
        <div className="p-4 pt-18 sm:p-6 md:p-8 md:pt-8">
          {children}
        </div>
      </main>
    </div>
  );
}

