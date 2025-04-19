import React, { useState } from 'react';
import { Bell, ShoppingCart, MessageSquare, ChevronDown, Search } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { user, logout } = useAuth();
  
  // Generate initials for avatar fallback
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <header className="fixed top-0 left-0 w-full bg-white border-b border-gray-200 z-10">
      <div className="flex justify-between items-center h-16 px-4 pl-20 lg:pl-16">
        {/* Logo */}
        <div className="flex items-center ml-8">
          <a href="/" className="text-2xl font-bold text-gray-800">HotSpoT</a>
        </div>
        
        {/* Search Bar */}
        <div className="flex-1 max-w-xl mx-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="w-full bg-gray-100 rounded-full px-4 py-2 pl-10 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>
        
        {/* Action Icons */}
        <div className="flex items-center space-x-4">
          {/* Messages Icon */}
          <a href="/messages" className="relative">
            <MessageSquare size={20} />
          </a>
          
          {/* Notifications Icon */}
          <a href="/notifications" className="relative">
            <Bell size={20} />
            <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white">1</Badge>
          </a>
          
          {/* Cart Icon */}
          <a href="/cart" className="relative">
            <ShoppingCart size={20} />
            <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white">2</Badge>
          </a>
          
          {/* User Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center space-x-2 cursor-pointer">
                <div className="relative">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.avatar || ''} alt={user?.name || 'User'} />
                    <AvatarFallback>{user?.name ? getInitials(user.name) : 'U'}</AvatarFallback>
                  </Avatar>
                </div>
                <span className="hidden sm:inline-block">{user?.name || 'Guest'}</span>
                <ChevronDown size={16} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="flex items-center p-2">
                <Avatar className="h-10 w-10 mr-2">
                  <AvatarImage src={user?.avatar || ''} alt={user?.name || 'User'} />
                  <AvatarFallback>{user?.name ? getInitials(user.name) : 'U'}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{user?.name || 'Guest'}</p>
                  <p className="text-xs text-gray-500">@{user?.username || 'user'}</p>
                </div>
              </div>
              <DropdownMenuSeparator />
              
              <DropdownMenuItem asChild>
                <a href="/profile" className="w-full cursor-pointer">Profile</a>
              </DropdownMenuItem>
              
              <DropdownMenuItem asChild>
                <a href="/account" className="w-full cursor-pointer">Account</a>
              </DropdownMenuItem>
              
              <DropdownMenuItem asChild>
                <a href="/notifications" className="w-full cursor-pointer">Notifications</a>
              </DropdownMenuItem>
              
              <DropdownMenuItem asChild>
                <a href="/messages" className="w-full cursor-pointer">Messages</a>
              </DropdownMenuItem>
              
              <DropdownMenuItem asChild>
                <a href="/cart" className="w-full cursor-pointer">Cart</a>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem onClick={logout}>
                <button className="w-full text-left cursor-pointer">Log Out</button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;