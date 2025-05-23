import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { BookOpen, Users, MessageSquare, LayoutGrid, Menu, X, LogOut, ShoppingBag, Bell, ShoppingCart } from 'lucide-react';
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

  const mobileNavItems = [
    { icon: <Bell size={20} />, label: 'Notifications', path: '/notifications' },
    { icon: <ShoppingCart size={20} />, label: 'Cart', path: '/cart' },
    ...navItems,
  ];

  return (
    <>
      {/* Mobile Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-30 w-64 bg-[#FFF4E6] shadow-lg border-r border-[#DFB6B2] rounded-tr-2xl rounded-br-2xl transform transition-transform duration-300 ease-in-out md:hidden",
        isExpanded ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Mobile Header */}
          <div className="flex flex-col items-center p-4 border-b border-[#DFB6B2]">
             <div className="flex items-center justify-between w-full mb-4">
              <h2 className="text-xl font-bold text-[#2B124C] tracking-wide">HotSpoT</h2>
               <Button 
                 variant="ghost" 
                 size="icon" 
                 className="text-[#0E4F52] hover:text-[#2B124C]"
                 onClick={toggleSidebar}
               >
                 <X className="h-6 w-6" />
               </Button>
             </div>
             {user && userDetails && (
               <NavLink to="/profile" onClick={toggleSidebar} className="flex items-center space-x-3 w-full">
                 <Avatar className="h-10 w-10">
                   <AvatarImage src={userDetails.photoURL || '/default-avatar.png'} alt="Profile" />
                   <AvatarFallback>{userDetails.firstName ? userDetails.firstName[0] : 'U'}</AvatarFallback>
                 </Avatar>
                 <div className="flex flex-col">
                   <span className="font-medium text-[#2B124C]">{userDetails.firstName || user.username}</span>
                   <span className="text-sm text-gray-600">View Profile</span>
                 </div>
               </NavLink>
             )}
           </div>

          {/* Navigation */}
          <div className="flex-1 py-4 overflow-y-auto">
            {mobileNavItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={toggleSidebar}
                className={({ isActive }) => cn(
                  "flex items-center space-x-3 px-4 py-3 mx-2 mb-1 rounded-lg transition-all duration-200",
                  "text-black hover:bg-[#0E4F52] hover:text-white",
                  isActive && "bg-[#0E4F52] text-white font-semibold shadow-sm",
                  "group"
                )}
              >
                <span className="text-[#0E4F52] [.bg-\[\#0E4F52\]_&]:text-white group-hover:text-white transition-colors duration-200 flex-shrink-0">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </NavLink>
            ))}
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 mx-2 mb-4 rounded-lg text-black hover:bg-[#0E4F52] hover:text-white transition-all duration-200 group"
          >
            <span className="text-inherit transition-colors duration-200 flex-shrink-0"><LogOut size={20} /></span>
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-20 hidden md:flex flex-col bg-[#FFF4E6] border-r border-[#DFB6B2] shadow-lg rounded-tr-2xl rounded-br-2xl transition-all duration-300",
        isExpanded ? "w-64" : "w-16"
      )}>
        {/* Desktop Header */}
        <div className="flex h-16 px-4 items-center border-b border-[#DFB6B2]">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-[#0E4F52] hover:text-[#2B124C]"
            onClick={toggleSidebar}
          >
            <Menu size={20} />
          </Button>
        </div>

        {/* Navigation */}
        <div className="flex flex-col h-[calc(100vh-64px)] overflow-y-auto">
          <div className="flex-1 py-4">
            {[...navItems].map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => cn(
                  "flex items-center space-x-3 px-4 py-3 mx-2 mb-1 rounded-lg transition-all duration-200",
                  "text-black hover:bg-[#0E4F52] hover:text-white",
                  isActive && "bg-[#0E4F52] text-white font-semibold shadow-sm",
                  !isExpanded && "md:justify-center md:mx-0",
                  "group"
                )}
              >
                <span className="text-[#0E4F52] [.bg-\[\#0E4F52\]_&]:text-white group-hover:text-white transition-colors duration-200 flex-shrink-0">{item.icon}</span>
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