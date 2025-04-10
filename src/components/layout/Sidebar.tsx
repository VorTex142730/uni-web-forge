
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Users, MessageSquare, BookOpen, ShoppingBag, Home, User, Grid } from 'lucide-react';
import { cn } from '@/lib/utils';

const Sidebar: React.FC = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="fixed top-0 left-0 h-full w-16 bg-hotspot-sidebar flex flex-col border-r border-border">
      <Link 
        to="/" 
        className={cn(
          "sidebar-link", 
          isActive('/') ? "bg-hotspot-lightpink text-hotspot-primary" : ""
        )}
      >
        <Home className="sidebar-icon" />
      </Link>
      
      <Link 
        to="/groups" 
        className={cn(
          "sidebar-link", 
          isActive('/groups') ? "bg-hotspot-lightpink text-hotspot-primary" : ""
        )}
      >
        <Grid className="sidebar-icon" />
      </Link>
      
      <Link 
        to="/members" 
        className={cn(
          "sidebar-link", 
          isActive('/members') ? "bg-hotspot-lightpink text-hotspot-primary" : ""
        )}
      >
        <Users className="sidebar-icon" />
      </Link>
      
      <Link 
        to="/messages" 
        className={cn(
          "sidebar-link", 
          isActive('/messages') ? "bg-hotspot-lightpink text-hotspot-primary" : ""
        )}
      >
        <MessageSquare className="sidebar-icon" />
      </Link>
      
      <Link 
        to="/forums" 
        className={cn(
          "sidebar-link", 
          isActive('/forums') ? "bg-hotspot-lightpink text-hotspot-primary" : ""
        )}
      >
        <BookOpen className="sidebar-icon" />
      </Link>
      
      <Link 
        to="/profile" 
        className={cn(
          "sidebar-link", 
          isActive('/profile') ? "bg-hotspot-lightpink text-hotspot-primary" : ""
        )}
      >
        <User className="sidebar-icon" />
      </Link>
      
      <Link 
        to="/shop" 
        className={cn(
          "sidebar-link", 
          isActive('/shop') ? "bg-hotspot-lightpink text-hotspot-primary" : ""
        )}
      >
        <ShoppingBag className="sidebar-icon" />
      </Link>
    </div>
  );
};

export default Sidebar;
