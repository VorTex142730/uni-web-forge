import React, { useState } from 'react';
import { Bell, ShoppingCart, ChevronDown, Mail, User, Users, Clock, MessageSquare, UserPlus, Image, Video, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link, useNavigate } from 'react-router-dom';
import { useSidebar } from '@/context/SidebarContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

const Navbar = () => {
  const { isExpanded } = useSidebar();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const { user, logout } = useAuth();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className={`h-16 bg-white flex items-center justify-between px-6 fixed top-0 right-0 transition-all duration-300 ${
      isExpanded ? 'left-64' : 'left-16'
    } z-20 border-b border-gray-200`}>
      {/* Logo */}
      <Link to="/" className="flex items-center">
        <h1 className="text-xl font-bold">HotSpoT</h1>
      </Link>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-6">
        <div className="relative">
          <Input
            type="search"
            placeholder="Search..."
            className="w-full bg-gray-100/80 border-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </form>

      {/* Actions */}
      <div className="flex items-center space-x-4">
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-gray-600 relative"
          onClick={() => handleNavigation('/messages')}
        >
          <Mail size={20} />
          {user?.unreadMessages > 0 && (
            <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
              {user.unreadMessages}
            </span>
          )}
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-gray-600 relative"
          onClick={() => handleNavigation('/notifications')}
        >
          <Bell size={20} />
          {user?.unreadNotifications > 0 && (
            <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
              {user.unreadNotifications}
            </span>
          )}
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-gray-600 relative"
          onClick={() => handleNavigation('/cart')}
        >
          <ShoppingCart size={20} />
          {user?.cartItems > 0 && (
            <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
              {user.cartItems}
            </span>
          )}
        </Button>
        
        {/* User Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center space-x-2 cursor-pointer">
              <span className="font-medium">{user?.displayName}</span>
              <ChevronDown size={16} className="text-gray-500" />
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.photoURL || ''} alt="Profile" />
                <AvatarFallback>{user?.displayName ? getInitials(user.displayName) : 'U'}</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 py-2">
            <div className="px-4 py-2 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user?.photoURL || ''} alt="Profile" />
                  <AvatarFallback>{user?.displayName ? getInitials(user.displayName) : 'U'}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-medium">{user?.displayName}</span>
                  <span className="text-sm text-gray-500">@{user?.username}</span>
                </div>
              </div>
            </div>
            
            <DropdownMenuItem 
              className="px-4 py-2.5 cursor-pointer"
              onClick={() => handleNavigation('/profile')}
            >
              <User className="mr-3 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            
            <DropdownMenuItem 
              className="px-4 py-2.5 cursor-pointer"
              onClick={() => handleNavigation('/account')}
            >
              <User className="mr-3 h-4 w-4" />
              <span>Account</span>
            </DropdownMenuItem>
            
            <DropdownMenuItem 
              className="px-4 py-2.5 cursor-pointer"
              onClick={() => handleNavigation('/timeline')}
            >
              <Clock className="mr-3 h-4 w-4" />
              <span>Timeline</span>
            </DropdownMenuItem>
            
            <DropdownMenuItem 
              className="px-4 py-2.5 cursor-pointer"
              onClick={() => handleNavigation('/notifications')}
            >
              <Bell className="mr-3 h-4 w-4" />
              <span>Notifications</span>
            </DropdownMenuItem>
            
            <DropdownMenuItem 
              className="px-4 py-2.5 cursor-pointer"
              onClick={() => handleNavigation('/messages')}
            >
              <MessageSquare className="mr-3 h-4 w-4" />
              <span>Messages</span>
            </DropdownMenuItem>
            
            <DropdownMenuItem 
              className="px-4 py-2.5 cursor-pointer"
              onClick={() => handleNavigation('/connections')}
            >
              <UserPlus className="mr-3 h-4 w-4" />
              <span>Connections</span>
            </DropdownMenuItem>
            
            <DropdownMenuItem 
              className="px-4 py-2.5 cursor-pointer"
              onClick={() => handleNavigation('/groups')}
            >
              <Users className="mr-3 h-4 w-4" />
              <span>Groups</span>
            </DropdownMenuItem>
            
            <DropdownMenuItem 
              className="px-4 py-2.5 cursor-pointer"
              onClick={() => handleNavigation('/forums')}
            >
              <MessageSquare className="mr-3 h-4 w-4" />
              <span>Forums</span>
            </DropdownMenuItem>
            
            <DropdownMenuItem 
              className="px-4 py-2.5 cursor-pointer"
              onClick={() => handleNavigation('/photos')}
            >
              <Image className="mr-3 h-4 w-4" />
              <span>Photos</span>
            </DropdownMenuItem>
            
            <DropdownMenuItem 
              className="px-4 py-2.5 cursor-pointer"
              onClick={() => handleNavigation('/videos')}
            >
              <Video className="mr-3 h-4 w-4" />
              <span>Videos</span>
            </DropdownMenuItem>
            
            <DropdownMenuItem 
              className="px-4 py-2.5 cursor-pointer"
              onClick={() => handleNavigation('/email-invites')}
            >
              <Mail className="mr-3 h-4 w-4" />
              <span>Email Invites</span>
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem 
              className="px-4 py-2.5 cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="mr-3 h-4 w-4" />
              <span>Log Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default Navbar; 