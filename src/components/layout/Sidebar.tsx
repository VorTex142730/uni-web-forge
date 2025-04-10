
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Users, MessageSquare, BookOpen, ShoppingBag, Home, User, Grid, ChevronLeft, ChevronRight, Book } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const [expanded, setExpanded] = useState(true);
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const toggleSidebar = () => {
    setExpanded(!expanded);
  };

  return (
    <div 
      className={cn(
        "fixed top-0 left-0 h-full bg-hotspot-sidebar flex flex-col border-r border-border transition-all duration-300 z-10",
        expanded ? "w-56" : "w-16"
      )}
    >
      <Button 
        variant="ghost" 
        size="icon" 
        className="absolute -right-4 top-20 bg-white border border-border rounded-full shadow-md hover:bg-gray-100 z-20"
        onClick={toggleSidebar}
      >
        {expanded ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </Button>
      
      <Link 
        to="/" 
        className={cn(
          "sidebar-link flex items-center py-4 px-6", 
          isActive('/') ? "bg-hotspot-lightpink text-hotspot-primary" : ""
        )}
      >
        <Home className="sidebar-icon h-5 w-5" />
        {expanded && <span className="ml-3 font-medium">Home</span>}
      </Link>
      
      <Link 
        to="/groups" 
        className={cn(
          "sidebar-link flex items-center py-4 px-6", 
          isActive('/groups') ? "bg-hotspot-lightpink text-hotspot-primary" : ""
        )}
      >
        <Grid className="sidebar-icon h-5 w-5" />
        {expanded && <span className="ml-3 font-medium">Groups</span>}
      </Link>
      
      <Link 
        to="/members" 
        className={cn(
          "sidebar-link flex items-center py-4 px-6", 
          isActive('/members') ? "bg-hotspot-lightpink text-hotspot-primary" : ""
        )}
      >
        <Users className="sidebar-icon h-5 w-5" />
        {expanded && <span className="ml-3 font-medium">Members</span>}
      </Link>
      
      <Link 
        to="/messages" 
        className={cn(
          "sidebar-link flex items-center py-4 px-6", 
          isActive('/messages') ? "bg-hotspot-lightpink text-hotspot-primary" : ""
        )}
      >
        <MessageSquare className="sidebar-icon h-5 w-5" />
        {expanded && <span className="ml-3 font-medium">Messages</span>}
      </Link>
      
      <Link 
        to="/forums" 
        className={cn(
          "sidebar-link flex items-center py-4 px-6", 
          isActive('/forums') ? "bg-hotspot-lightpink text-hotspot-primary" : ""
        )}
      >
        <BookOpen className="sidebar-icon h-5 w-5" />
        {expanded && <span className="ml-3 font-medium">Forums</span>}
      </Link>
      
      <Link 
        to="/blog" 
        className={cn(
          "sidebar-link flex items-center py-4 px-6", 
          isActive('/blog') ? "bg-hotspot-lightpink text-hotspot-primary" : ""
        )}
      >
        <Book className="sidebar-icon h-5 w-5" />
        {expanded && <span className="ml-3 font-medium">Blog</span>}
      </Link>
      
      <Link 
        to="/profile" 
        className={cn(
          "sidebar-link flex items-center py-4 px-6", 
          isActive('/profile') ? "bg-hotspot-lightpink text-hotspot-primary" : ""
        )}
      >
        <User className="sidebar-icon h-5 w-5" />
        {expanded && <span className="ml-3 font-medium">Profile</span>}
      </Link>
      
      <Link 
        to="/shop" 
        className={cn(
          "sidebar-link flex items-center py-4 px-6", 
          isActive('/shop') ? "bg-hotspot-lightpink text-hotspot-primary" : ""
        )}
      >
        <ShoppingBag className="sidebar-icon h-5 w-5" />
        {expanded && <span className="ml-3 font-medium">Shop</span>}
      </Link>
    </div>
  );
};

export default Sidebar;
