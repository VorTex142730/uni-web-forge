
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, ShoppingCart, MessageSquare, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/context/AuthContext';
import { Badge } from '@/components/ui/badge';

const Header: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { user, logout } = useAuth();
  
  // Generate initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <header className="fixed top-0 left-0 w-full bg-white border-b border-border z-10">
      <div className="flex justify-between items-center p-3 px-4 pl-20 lg:pl-60">
        <div className="flex items-center">
          <Link to="/" className="text-2xl font-bold">HotSpoT</Link>
        </div>
        
        <div className="flex-1 mx-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="w-full bg-gray-100 rounded-full px-4 py-2 pl-10 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <Link to="/messages" className="p-2 rounded-full hover:bg-gray-100 relative">
            <MessageSquare size={20} />
            <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0">1</Badge>
          </Link>
          
          <Link to="/notifications" className="p-2 rounded-full hover:bg-gray-100 relative">
            <Bell size={20} />
            <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0">3</Badge>
          </Link>
          
          <Link to="/cart" className="p-2 rounded-full hover:bg-gray-100 relative">
            <ShoppingCart size={20} />
            <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0">1</Badge>
          </Link>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center space-x-2 cursor-pointer">
                <div className="relative">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.avatar || ''} alt={user?.name || 'User'} />
                    <AvatarFallback>{user?.name ? getInitials(user.name) : 'U'}</AvatarFallback>
                  </Avatar>
                  {user?.status === 'online' && (
                    <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border-2 border-white"></span>
                  )}
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
                <Link to="/profile" className="w-full cursor-pointer">Profile</Link>
              </DropdownMenuItem>
              
              <DropdownMenuItem asChild>
                <Link to="/account" className="w-full cursor-pointer">Account</Link>
              </DropdownMenuItem>
              
              <DropdownMenuItem asChild>
                <Link to="/notifications" className="w-full cursor-pointer">Notifications</Link>
              </DropdownMenuItem>
              
              <DropdownMenuItem asChild>
                <Link to="/messages" className="w-full cursor-pointer">Messages</Link>
              </DropdownMenuItem>
              
              <DropdownMenuItem asChild>
                <Link to="/cart" className="w-full cursor-pointer">Cart</Link>
              </DropdownMenuItem>
              
              <DropdownMenuItem asChild>
                <Link to="/blog" className="w-full cursor-pointer">Blog</Link>
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
