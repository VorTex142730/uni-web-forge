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

  // Add admin link if user is admin
  if (userDetails?.isAdmin) {
    navItems.push({ icon: <ShoppingBag size={20} />, label: 'Admin Products', path: '/admin/products' });
  }

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300",
          isExpanded ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={toggleSidebar}
      />

      {/* Sidebar */}
      <div 
        className={cn(
          // Base styles
          "fixed top-0 left-0 h-full bg-white transition-all duration-300 z-50",
          // Mobile styles - full screen when expanded
          "w-full md:w-auto",
          // Desktop styles
          "md:z-20 md:bg-white md:border-r md:border-gray-200",
          isExpanded ? "md:w-64" : "md:w-16",
          // Mobile transform
          isExpanded ? "translate-x-0" : "-translate-x-full",
          // Desktop transform
          "md:translate-x-0"
        )}
      >
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.photoURL} />
              <AvatarFallback>{user?.displayName?.[0]}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-medium">{user?.displayName}</span>
              <span className="text-sm text-gray-500">My Account</span>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleSidebar} 
            className="text-gray-500 hover:bg-gray-100 rounded-full p-2"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:flex h-16 px-4 items-center border-b border-gray-200">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-gray-500"
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
                onClick={() => {
                  if (window.innerWidth < 768) {
                    toggleSidebar();
                  }
                }}
                className={({ isActive }) => cn(
                  "flex items-center space-x-3 px-4 py-3 mx-2 rounded-lg transition-all duration-300",
                  "text-gray-700 hover:bg-gray-100",
                  isActive && "bg-gray-100 font-medium",
                  !isExpanded && "md:justify-center md:mx-0"
                )}
              >
                <span className="text-gray-600 flex-shrink-0">{item.icon}</span>
                <span className={cn(
                  "truncate",
                  !isExpanded && "md:hidden"
                )}>{item.label}</span>
              </NavLink>
            ))}
          </div>

          {/* Logout Button - Only visible on mobile */}
          <button
            onClick={() => {
              handleLogout();
              toggleSidebar();
            }}
            className="md:hidden flex items-center space-x-3 px-4 py-3 mx-2 mb-4 rounded-lg text-gray-700 hover:bg-gray-100"
          >
            <LogOut size={20} className="text-gray-600 flex-shrink-0" />
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;