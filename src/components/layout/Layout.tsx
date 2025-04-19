import React from 'react';
import { Outlet } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import Header from './Header';
import Sidebar from './Sidebar';
import { useAuth } from '@/context/AuthContext';
import { SidebarProvider, useSidebar } from '@/context/SidebarContext';
import { cn } from '@/lib/utils';

const LayoutContent: React.FC = () => {
  const { loading } = useAuth();
  const { expanded } = useSidebar();

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Sidebar />
      <main className={cn(
        "pt-16 transition-all duration-300",
        expanded ? "pl-56" : "pl-16"
      )}>
        <div className="container py-4">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

const Layout: React.FC = () => {
  return (
    <SidebarProvider>
      <LayoutContent />
    </SidebarProvider>
  );
};

export default Layout;