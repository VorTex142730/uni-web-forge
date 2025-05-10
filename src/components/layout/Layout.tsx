import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { SidebarProvider, useSidebar } from '@/context/SidebarContext';

const LayoutContent = () => {
  const { isExpanded } = useSidebar();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#fdf0eb]">
      <Sidebar />
      <div className={`transition-all duration-300 ${isExpanded ? 'pl-64' : 'pl-16'}`}>
        <Navbar />
        <main className="p-6 mt-16">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const Layout = () => {
  return (
    <SidebarProvider>
      <LayoutContent />
    </SidebarProvider>
  );
};

export default Layout;