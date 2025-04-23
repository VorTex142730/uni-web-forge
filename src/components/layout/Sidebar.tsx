import React from 'react';
import { NavLink } from 'react-router-dom';
import { BookOpen, Users, MessageSquare, ShoppingBag, LayoutGrid, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSidebar } from '@/context/SidebarContext';
import { cn } from '@/lib/utils';

const Sidebar = () => {
  const { isExpanded, toggleSidebar } = useSidebar();

  const navItems = [
    { icon: <LayoutGrid size={20} />, label: 'Groups', path: '/groups' },
    { icon: <Users size={20} />, label: 'Members', path: '/members' },
    { icon: <MessageSquare size={20} />, label: 'Forums', path: '/forums' },
    { icon: <BookOpen size={20} />, label: 'Blog page', path: '/blog' },
    { icon: <ShoppingBag size={20} />, label: 'Shop', path: '/shop' },
  ];

  return (
    <div 
      className={cn(
        "min-h-screen bg-pink-50 fixed left-0 top-0 z-30 border-r border-gray-100 transition-all duration-300",
        isExpanded ? "w-64" : "w-16"
      )}
    >
      {/* Menu Toggle */}
      <div className="h-16 px-4 flex items-center border-b border-gray-100">
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-gray-500 hover:bg-pink-100"
          onClick={toggleSidebar}
        >
          <Menu size={20} />
        </Button>
      </div>

      {/* Navigation */}
      <div className="py-4">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center space-x-3 px-4 py-2.5 mx-2 rounded-lg transition-all duration-300",
              "text-gray-700 hover:bg-pink-100/80",
              isActive && "bg-pink-100 font-medium",
              !isExpanded && "justify-center mx-0"
            )}
          >
            <span className="text-gray-600 flex-shrink-0">{item.icon}</span>
            {isExpanded && <span className="truncate">{item.label}</span>}
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;