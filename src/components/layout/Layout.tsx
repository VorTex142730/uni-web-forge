import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { SidebarProvider, useSidebar } from '@/context/SidebarContext';
import { useTheme } from '@/context/ThemeContext';
import { Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

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

      {/* Fixed Messages Button for Mobile */}
      <div className="fixed bottom-4 right-4 md:hidden z-50">
        <Link to="/messages">
          <Button
            variant="default"
            size="icon"
            className="rounded-full h-14 w-14 shadow-lg bg-[#0E4F52] hover:bg-[#0E4F52]/90 text-white"
          >
            <Mail size={24} />
          </Button>
        </Link>
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