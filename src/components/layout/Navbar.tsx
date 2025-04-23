import React from 'react';
import { Bell, ShoppingCart, ChevronDown, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import { useSidebar } from '@/context/SidebarContext';

const Navbar = () => {
  const { isExpanded } = useSidebar();

  return (
    <div className={`h-16 bg-white flex items-center justify-between px-6 fixed top-0 right-0 transition-all duration-300 ${
      isExpanded ? 'left-64' : 'left-16'
    } z-20`}>
      {/* Logo */}
      <Link to="/" className="flex items-center">
        <h1 className="text-xl font-bold">HotSpoT</h1>
      </Link>

      {/* Search */}
      <div className="flex-1 max-w-2xl mx-6">
        <div className="relative">
          <Input
            type="search"
            placeholder="Search..."
            className="w-full bg-gray-100/80 border-none"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" className="text-gray-600 relative">
          <Mail size={20} />
        </Button>
        <Button variant="ghost" size="icon" className="text-gray-600 relative">
          <Bell size={20} />
          <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
            1
          </span>
        </Button>
        <Button variant="ghost" size="icon" className="text-gray-600 relative">
          <ShoppingCart size={20} />
          <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
            2
          </span>
        </Button>
        
        {/* User Profile */}
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-full bg-gray-200 overflow-hidden">
            <img 
              src="/placeholder-avatar.png" 
              alt="Profile" 
              className="h-full w-full object-cover"
            />
          </div>
          <span className="font-medium">Raviraj</span>
          <ChevronDown size={16} className="text-gray-500" />
        </div>
      </div>
    </div>
  );
};

export default Navbar; 