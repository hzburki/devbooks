import { ReactNode } from "react";
import { AppSidebar, MobileHeader } from "./app-sidebar";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <MobileHeader />
      <main className="min-h-screen md:ml-64">
        <div className="p-4 pt-18 sm:p-6 md:p-8 md:pt-8">
          {children}
        </div>
      </main>
    </div>
  );
}

