import React, { useState, useEffect, useRef } from 'react';
import { Bell, ShoppingCart, ChevronDown, Mail, User, Users, Clock, MessageSquare, UserPlus, Image, Video, LogOut, Users2, Settings, Search, Menu } from 'lucide-react';
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
import { useAuth } from '@/context/AuthContext'; // Assuming useAuth provides userDetails
import { toast } from 'sonner';
import { collection, getDocs, query, where, limit, or } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';
import { useDebounce } from '@/hooks/useDebounce';
import NotificationBell from '@/components/notifications/NotificationBell';
import { useCart } from '@/context/CartContext';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface QuickSearchResult {
  id: string;
  type: 'user' | 'group' | 'forum';
  title: string;
  imageUrl?: string;
}

const Navbar = () => {
  console.log('Navbar component rendering');
  const { isExpanded, toggleSidebar } = useSidebar();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [quickResults, setQuickResults] = useState<QuickSearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Destructure userDetails from useAuth
  const { user, userDetails, logout } = useAuth();
  const { cartCount } = useCart();
  console.log("Navbar: user state", user);
  console.log("Navbar: userDetails state", userDetails);


  useEffect(() => {
    console.log('Navbar useEffect: Setting up handleClickOutside');
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        console.log('handleClickOutside: Click outside search results, hiding results');
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      console.log('Navbar useEffect: Cleaning up handleClickOutside');
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    console.log('Navbar useEffect: Debounced search term changed', debouncedSearch);
    const performQuickSearch = async () => {
      if (!debouncedSearch.trim()) {
        console.log('performQuickSearch: Debounced search term is empty, clearing results');
        setQuickResults([]);
        return;
      }

      console.log('performQuickSearch: Starting quick search for:', debouncedSearch);
      setLoading(true);
      try {
        const results: QuickSearchResult[] = [];
        const searchTerm = debouncedSearch.toLowerCase();

        // Search users
        try {
          console.log('performQuickSearch: Searching users for:', searchTerm);
          const usersQuery = query(
            collection(db, 'users'),
            or(
              where('firstName', '>=', searchTerm),
              where('lastName', '>=', searchTerm),
              where('nickname', '>=', searchTerm)
            ),
            limit(3)
          );
          const usersSnapshot = await getDocs(usersQuery);
          console.log('performQuickSearch: Users snapshot received', usersSnapshot.docs.length);
          usersSnapshot.forEach(doc => {
            const userData = doc.data();
            if (userData.photoURL) {
                console.log('performQuickSearch: Fetched User PhotoURL:', userData.photoURL);
            }
            if (
              userData.firstName?.toLowerCase().includes(searchTerm) ||
              userData.lastName?.toLowerCase().includes(searchTerm) ||
              userData.nickname?.toLowerCase().includes(searchTerm)
            ) {
              results.push({
                id: doc.id,
                type: 'user',
                title: `${userData.firstName || ''} ${userData.lastName || ''}`,
                imageUrl: userData.photoURL // Use photoURL from user document
              });
            }
          });
          console.log('performQuickSearch: User results found:', results.filter(r => r.type === 'user').length);
        } catch (error) {
          console.error('Error searching users:', error);
        }

        // Search groups
        try {
          console.log('performQuickSearch: Searching groups for:', searchTerm);
          const groupsQuery = query(
            collection(db, 'groups'),
            where('name', '>=', searchTerm),
            limit(3)
          );
          const groupsSnapshot = await getDocs(groupsQuery);
          console.log('performQuickSearch: Groups snapshot received', groupsSnapshot.docs.length);
          groupsSnapshot.forEach(doc => {
            const groupData = doc.data();
            if (groupData.photoURL) {
                 console.log('performQuickSearch: Fetched Group PhotoURL:', groupData.photoURL);
            }
            if (groupData.name?.toLowerCase().includes(searchTerm)) {
              results.push({
                id: doc.id,
                type: 'group',
                title: groupData.name,
                imageUrl: groupData.photoURL // Use photoURL from group document
              });
            }
          });
          console.log('performQuickSearch: Group results found:', results.filter(r => r.type === 'group').length);
        } catch (error) {
          console.error('Error searching groups:', error);
        }

        // Search forums
        try {
          console.log('performQuickSearch: Searching forums for:', searchTerm);
          const forumsQuery = query(
            collection(db, 'forums'),
            where('title', '>=', searchTerm),
            limit(3)
          );
          const forumsSnapshot = await getDocs(forumsQuery);
          console.log('performQuickSearch: Forums snapshot received', forumsSnapshot.docs.length);
          forumsSnapshot.forEach(doc => {
            const forumData = doc.data();
            if (forumData.title?.toLowerCase().includes(searchTerm)) {
              results.push({
                id: doc.id,
                type: 'forum',
                title: forumData.title
                // Forums don't seem to have imageUrl in the interface or current logic
              });
            }
          });
          console.log('performQuickSearch: Forum results found:', results.filter(r => r.type === 'forum').length);
        } catch (error) {
          console.error('Error searching forums:', error);
        }

        console.log('performQuickSearch: Setting quick search results:', results);
        setQuickResults(results);
      } catch (error) {
        console.error('Quick search error:', error);
        toast.error('Search failed. Please try again.');
      } finally {
        console.log('performQuickSearch: Search loading finished');
        setLoading(false);
      }
    };

    performQuickSearch();
  }, [debouncedSearch]);

  const handleNavigation = (path: string) => {
    console.log('handleNavigation: Navigating to', path);
    navigate(path);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('handleSearch: Performing full search for', searchQuery);
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setShowResults(false);
      console.log('handleSearch: Full search initiated, hiding results');
    } else {
      console.log('handleSearch: Search query is empty, not navigating');
    }
  };

  const handleResultClick = (result: QuickSearchResult) => {
    console.log('handleResultClick: Navigating to result', result);
    navigate(`/${result.type}s/${result.id}`);
    setShowResults(false);
    setSearchQuery('');
    console.log('handleResultClick: Navigated, hiding results and clearing search query');
  };

  const getResultIcon = (type: string) => {
    console.log('getResultIcon: Getting icon for type', type);
    switch (type) {
      case 'user':
        return <Users className="h-4 w-4" />;
      case 'group':
        return <Users2 className="h-4 w-4" />;
      case 'forum':
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <Search className="h-4 w-4" />;
    }
  };

  const handleLogout = async () => {
    console.log('handleLogout: Initiating logout');
    try {
      await logout();
      console.log('handleLogout: Logout successful, navigating to login');
      navigate('/login');
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('handleLogout: Logout failed', error);
      toast.error('Failed to logout');
    }
  };

  const getInitials = (name: string) => {
    console.log('getInitials: Getting initials for name', name);
    // Use display name or try userDetails names if displayName is null
    const nameToUse = name || userDetails?.firstName || userDetails?.lastName || 'U';
     if (typeof nameToUse !== 'string' || nameToUse.trim() === '') {
        return 'U';
     }
    return nameToUse
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  // Calculate the photo URL to use, use only userDetails.photoURL, fallback to default
  const userPhotoUrl = userDetails?.photoURL || '/default-avatar.png';
  const userDisplayName = user?.displayName || userDetails?.firstName || user?.username || 'User';
  console.log("Navbar: Calculated userPhotoUrl:", userPhotoUrl);
  console.log("Navbar: Calculated userDisplayName:", userDisplayName);


  console.log('Navbar component rendering JSX');
  return (
    <div className={`h-16 bg-gradient-to-r from-purple-400 to-indigo-500 flex items-center justify-between px-4 md:px-6 fixed top-0 right-0 transition-all duration-300 ${
      isExpanded ? 'md:left-64' : 'md:left-16'
    } left-0 z-20 shadow-lg`}>
      <div className="flex items-center">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden mr-2 text-white hover:bg-white/10"
          onClick={() => {
            console.log('Mobile Menu Button clicked');
            toggleSidebar();
          }}
        >
          <Menu className="h-6 w-6" />
        </Button>

        {/* Logo */}
        <Link to="/" className="flex items-center" onClick={() => console.log('Logo clicked, navigating to home')}>
          <h1 className="text-xl font-bold text-white">HotSpoT</h1>
        </Link>
      </div>

      {/* Search */}
      <div className="flex-1 max-w-2xl mx-4 relative">
        <form onSubmit={handleSearch}>
          <div className="relative">
            <Input
              type="search"
              placeholder="Search..."
              className="w-full bg-white/10 border-none pl-10 text-white placeholder:text-white/70 focus:bg-white/20 focus:ring-2 focus:ring-white/30"
              value={searchQuery}
              onChange={(e) => {
                console.log('Search input changed:', e.target.value);
                setSearchQuery(e.target.value);
                setShowResults(true);
                console.log('Setting showResults to true on input change');
              }}
              onFocus={() => {
                console.log('Search input focused');
                setShowResults(true);
                console.log('Setting showResults to true on input focus');
              }}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70 h-4 w-4" />
          </div>
        </form>

        {/* Quick Results Dropdown */}
        {showResults && (searchQuery.trim() || loading) && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2">Searching...</p>
              </div>
            ) : quickResults.length > 0 ? (
              <div className="py-2">
                {quickResults.map((result) => (
                  <button
                    key={`${result.type}-${result.id}`}
                    className="w-full px-4 py-2 hover:bg-gray-50 flex items-center space-x-3 text-left transition-colors duration-150"
                    onClick={() => handleResultClick(result)}
                  >
                    {result.imageUrl ? (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={result.imageUrl} alt={result.title} />
                        <AvatarFallback>{result.title[0]}</AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                        {getResultIcon(result.type)}
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{result.title}</p>
                      <p className="text-sm text-gray-500 capitalize">{result.type}</p>
                    </div>
                  </button>
                ))}
                <div className="px-4 py-2 border-t border-gray-100">
                  <button
                    className="w-full text-center text-blue-600 hover:text-blue-700 font-medium"
                    onClick={handleSearch}
                  >
                    View all results
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500">
                No results found
              </div>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-2 md:space-x-4">
        {/* Mobile Search Button */}
        <Button variant="ghost" size="icon" className="md:hidden text-white hover:bg-white/10" onClick={() => console.log('Mobile Search Button clicked')}>
          <Search className="h-5 w-5" />
        </Button>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10 relative"
                onClick={() => handleNavigation('/messages')}
              >
                <Mail size={20} />
                {user?.unreadMessages > 0 && (
                  <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center animate-pulse">
                    {user.unreadMessages}
                  </span>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Messages</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10 relative"
                onClick={() => handleNavigation('/notifications')}
              >
                <Bell size={20} />
                {user?.unreadNotifications > 0 && (
                  <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center animate-pulse">
                    {user.unreadNotifications}
                  </span>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Notifications</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10 relative"
                onClick={() => handleNavigation('/cart')}
              >
                <ShoppingCart size={20} />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center animate-pulse">
                    {cartCount}
                  </span>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Cart</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* User Profile Dropdown - Hide on mobile */}
        <div className="hidden md:block">
          <DropdownMenu onOpenChange={(open) => console.log('User Profile Dropdown open state changed:', open)}>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center space-x-2 cursor-pointer bg-white/10 hover:bg-white/20 rounded-full px-2 py-1 transition-colors duration-150">
                <span className="font-medium text-white">{userDisplayName}</span>
                <ChevronDown size={16} className="text-white/70" />
                <Avatar className="h-8 w-8 border-2 border-white/20">
                  <AvatarImage src={userPhotoUrl} alt="Profile" />
                  <AvatarFallback>{getInitials(userDisplayName)}</AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 py-2">
              <div className="px-4 py-2 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={userPhotoUrl} alt="Profile" />
                    <AvatarFallback>{getInitials(userDisplayName)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-medium">{userDisplayName}</span>
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
                onClick={() => handleNavigation('/timeline')}
              >
                <Clock className="mr-3 h-4 w-4" />
                <span>Timeline</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                className="px-4 py-2.5 cursor-pointer"
                onClick={() => handleNavigation('/connections')}
              >
                <Users className="mr-3 h-4 w-4" />
                <span>Connections</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                className="px-4 py-2.5 cursor-pointer"
                onClick={() => handleNavigation('/groups')}
              >
                <Users2 className="mr-3 h-4 w-4" />
                <span>Groups</span>
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
                onClick={() => handleNavigation('/forums')}
              >
                <MessageSquare className="mr-3 h-4 w-4" />
                <span>Forums</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                className="px-4 py-2.5 cursor-pointer"
                onClick={() => handleNavigation('/account')}
              >
                <Settings className="mr-3 h-4 w-4" />
                <span>Account Settings</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                className="px-4 py-2.5 cursor-pointer text-red-600 hover:text-red-700"
                onClick={handleLogout}
              >
                <LogOut className="mr-3 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default Navbar;