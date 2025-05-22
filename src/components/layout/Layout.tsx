import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { SidebarProvider, useSidebar } from '@/context/SidebarContext';
import { useTheme } from '@/context/ThemeContext';

const LayoutContent = () => {
  const { isExpanded } = useSidebar();
  const location = useLocation();
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#001F1F]' : 'bg-[#fdf0eb]'}`}>
      <Sidebar />
      <div className={`pt-16 ${isExpanded ? 'md:pl-64' : 'md:pl-16'} transition-all duration-300`}>
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