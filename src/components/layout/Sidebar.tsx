import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { BookOpen, Users, MessageSquare, LayoutGrid, Menu, X, LogOut, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSidebar } from '@/context/SidebarContext';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const Sidebar = () => {
  const { isExpanded, toggleSidebar } = useSidebar();
  const { user, logout, userDetails } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const navItems = [
    { icon: <LayoutGrid size={20} />, label: 'Groups', path: '/groups' },
    { icon: <Users size={20} />, label: 'Members', path: '/members' },
    { icon: <MessageSquare size={20} />, label: 'Forums', path: '/forums' },
    { icon: <BookOpen size={20} />, label: 'Blog page', path: '/blog' },
    { icon: <ShoppingBag size={20} />, label: 'Shop', path: '/shop' },
  ];

  // Add admin link if user has admin role
  if (userDetails?.role === 'Admin') {
    navItems.push({ icon: <ShoppingBag size={20} />, label: 'Admin Products', path: '/admin/products' });
  }

  return (
    <>
      {/* Mobile Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-30 w-64 bg-white transform transition-transform duration-300 ease-in-out md:hidden",
        isExpanded ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Mobile Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">HotSpoT</h2>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-gray-500 hover:text-gray-700"
              onClick={toggleSidebar}
            >
              <X className="h-6 w-6" />
            </Button>
          </div>

          {/* Navigation */}
          <div className="flex-1 py-4 overflow-y-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={toggleSidebar}
                className={({ isActive }) => cn(
                  "flex items-center space-x-3 px-4 py-3 mx-2 rounded-lg transition-all duration-300",
                  "text-gray-700 hover:bg-purple-50 hover:text-purple-600",
                  isActive && "bg-purple-50 text-purple-600 font-medium",
                  "group"
                )}
              >
                <span className={cn(
                  "text-gray-600 group-hover:text-purple-600 transition-colors duration-300",
                  "flex-shrink-0"
                )}>{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </NavLink>
            ))}
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 mx-2 mb-4 rounded-lg text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-all duration-300 group"
          >
            <LogOut size={20} className="text-gray-600 group-hover:text-purple-600 transition-colors duration-300 flex-shrink-0" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-20 hidden md:flex flex-col bg-white border-r border-gray-200 transition-all duration-300",
        isExpanded ? "w-64" : "w-16"
      )}>
        {/* Desktop Header */}
        <div className="flex h-16 px-4 items-center border-b border-gray-200">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-gray-500 hover:text-gray-700"
            onClick={toggleSidebar}
          >
            <Menu size={20} />
          </Button>
        </div>

        {/* Navigation */}
        <div className="flex flex-col h-[calc(100vh-64px)] overflow-y-auto">
          <div className="flex-1 py-4">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => cn(
                  "flex items-center space-x-3 px-4 py-3 mx-2 rounded-lg transition-all duration-300",
                  "text-gray-700 hover:bg-purple-50 hover:text-purple-600",
                  isActive && "bg-purple-50 text-purple-600 font-medium",
                  !isExpanded && "md:justify-center md:mx-0",
                  "group"
                )}
              >
                <span className={cn(
                  "text-gray-600 group-hover:text-purple-600 transition-colors duration-300",
                  "flex-shrink-0"
                )}>{item.icon}</span>
                <span className={cn(
                  "truncate font-medium",
                  !isExpanded && "md:hidden"
                )}>{item.label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;