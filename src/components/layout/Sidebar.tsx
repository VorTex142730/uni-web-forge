import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Users, MessageSquare, BookOpen, ShoppingBag, Home, User, Grid, ChevronLeft, ChevronRight, Book } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useSidebar } from '@/context/SidebarContext';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { expanded, toggleSidebar } = useSidebar();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div 
      className={cn(
        "fixed top-0 left-0 h-full bg-hotspot-sidebar flex flex-col border-r border-border transition-all duration-300 z-10",
        expanded ? "w-56" : "w-16"
      )}
    >
      <div className="pl-2 pt-4">
        <Button 
          variant="ghost" 
          size="icon" 
          className="border border-border rounded-full shadow-md hover:bg-gray-100"
          onClick={toggleSidebar}
        >
          {expanded ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </Button>
      </div>
      
      <Link 
        to="/" 
        className={cn(
          "sidebar-link flex items-center py-4 px-2", 
          isActive('/') ? "bg-hotspot-lightpink text-hotspot-primary" : ""
        )}
      >
        <Home className="sidebar-icon h-5 w-5 ml-2" />
        {expanded && <span className="ml-3 font-medium">Home</span>}
      </Link>
      
      <Link 
        to="/groups" 
        className={cn(
          "sidebar-link flex items-center py-4 px-2", 
          isActive('/groups') ? "bg-hotspot-lightpink text-hotspot-primary" : ""
        )}
      >
        <Grid className="sidebar-icon h-5 w-5 ml-2" />
        {expanded && <span className="ml-3 font-medium">Groups</span>}
      </Link>
      
      <Link 
        to="/members" 
        className={cn(
          "sidebar-link flex items-center py-4 px-2", 
          isActive('/members') ? "bg-hotspot-lightpink text-hotspot-primary" : ""
        )}
      >
        <Users className="sidebar-icon h-5 w-5 ml-2" />
        {expanded && <span className="ml-3 font-medium">Members</span>}
      </Link>
      
      <Link 
        to="/forums" 
        className={cn(
          "sidebar-link flex items-center py-4 px-2", 
          isActive('/forums') ? "bg-hotspot-lightpink text-hotspot-primary" : ""
        )}
      >
        <BookOpen className="sidebar-icon h-5 w-5 ml-2" />
        {expanded && <span className="ml-3 font-medium">Forums</span>}
      </Link>
      
      <Link 
        to="/blog" 
        className={cn(
          "sidebar-link flex items-center py-4 px-2", 
          isActive('/blog') ? "bg-hotspot-lightpink text-hotspot-primary" : ""
        )}
      >
        <Book className="sidebar-icon h-5 w-5 ml-2" />
        {expanded && <span className="ml-3 font-medium">Blog</span>}
      </Link>
      
      <Link 
        to="/shop" 
        className={cn(
          "sidebar-link flex items-center py-4 px-2", 
          isActive('/shop') ? "bg-hotspot-lightpink text-hotspot-primary" : ""
        )}
      >
        <ShoppingBag className="sidebar-icon h-5 w-5 ml-2" />
        {expanded && <span className="ml-3 font-medium">Shop</span>}
      </Link>
    </div>
  );
};

export default Sidebar;