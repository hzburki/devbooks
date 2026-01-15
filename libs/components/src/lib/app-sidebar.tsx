import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FileText,
  Calendar,
  LogOut,
  Building2,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@devbooks/ui';
import { Button } from '@devbooks/ui';
import { Sheet, SheetContent, SheetTrigger } from '@devbooks/ui';
import { useState } from 'react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Employees', href: '/employees', icon: Users },
  { name: 'Invoices', href: '/invoices', icon: FileText },
  { name: 'Leaves', href: '/leaves', icon: Calendar },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation();

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="border-sidebar-border flex h-16 items-center gap-3 border-b px-6">
        <div className="gradient-primary flex h-9 w-9 items-center justify-center rounded-lg">
          <Building2 className="text-primary-foreground h-5 w-5" />
        </div>
        <div>
          <h1 className="text-sidebar-foreground text-lg font-semibold">
            Devbooks
          </h1>
          <p className="text-sidebar-foreground/60 text-xs">
            Office Management System
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={onNavigate}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-75',
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-glow'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground',
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-sidebar-border border-t p-3">
        <button className="text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors">
          <LogOut className="h-5 w-5" />
          Sign Out
        </button>
      </div>
    </div>
  );
}

export function MobileHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="gradient-sidebar border-sidebar-border fixed left-0 right-0 top-0 z-50 flex h-14 items-center gap-3 border-b px-4 md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="text-sidebar-foreground hover:bg-sidebar-accent"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="gradient-sidebar border-sidebar-border w-72 p-0"
        >
          <SidebarContent onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
      <div className="flex items-center gap-2">
        <div className="gradient-primary flex h-8 w-8 items-center justify-center rounded-lg">
          <Building2 className="text-primary-foreground h-4 w-4" />
        </div>
        <span className="text-sidebar-foreground text-base font-semibold">
          TeamFlow
        </span>
      </div>
    </header>
  );
}

export function AppSidebar() {
  return (
    <aside className="gradient-sidebar border-sidebar-border fixed left-0 top-0 z-40 hidden h-screen w-64 border-r md:block">
      <SidebarContent />
    </aside>
  );
}
