import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LayoutGrid, List, Search, Users, Filter, ArrowUpDown, Camera } from 'lucide-react';
import { collection, query, orderBy, getDocs, where, Timestamp, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';
import { useAuth } from '@/context/AuthContext';
import { Badge } from '@/components/ui/badge';
import { getFirestore } from 'firebase/firestore';

interface Group {
  id: string;
  name: string;
  description?: string;
  memberCount?: number;
  bannerUrl?: string;
  lastActive?: string;
  createdAt?: string;
  createdBy?: {
    userId: string;
    displayName?: string;
    photoURL?: string;
  };
  privacy?: string;
  tags?: string[];
}

const safeTimestampToISO = (timestamp: any): string => {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate().toISOString();
  }
  if (timestamp && typeof timestamp.toDate === 'function') {
    try {
      return timestamp.toDate().toISOString();
    } catch (e) {
      console.warn("Error converting timestamp:", e);
      return new Date().toISOString();
    }
  }
  if (typeof timestamp === 'string') {
    if (!isNaN(Date.parse(timestamp))) {
      return timestamp;
    }
  }
  console.warn("Timestamp field was not a valid Firestore Timestamp or compatible object:", timestamp);
  return new Date().toISOString();
};

const MyGroupsPage: React.FC = () => {
  const { user } = useAuth();
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recently-active');
  const [myGroups, setMyGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [profilePhotoURL, setProfilePhotoURL] = useState<string | null>(null);

  const fetchProfilePhoto = async () => {
    if (!user) return;
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setProfilePhotoURL(data.photoURL || null);
      }
    } catch (error) {
      console.error('Error fetching profile photo:', error);
    }
  };

  useEffect(() => {
    fetchProfilePhoto();
  }, [user]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    if (file.size > 1000000) {
      alert('Image must be smaller than 1MB');
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64String = reader.result as string;

      try {
        const db = getFirestore();
        await updateDoc(doc(db, 'users', user.uid), {
          photoURL: base64String
        });
        setProfilePhotoURL(base64String);
        alert('Profile picture updated successfully');
      } catch (error) {
        console.error('Error updating profile picture:', error);
        alert('Error updating profile picture');
      }
    };
    reader.onerror = () => {
      alert('Error reading file');
    };
  };

  const fetchMyGroups = async () => {
    if (!user) {
      setMyGroups([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const groupsQuery = query(
        collection(db, 'groups'),
        orderBy('lastActive', 'desc')
      );
      const groupsSnapshot = await getDocs(groupsQuery);
      const allGroupsData = groupsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || 'Unnamed Group',
          description: data.description || '',
          memberCount: data.memberCount || 0,
          bannerUrl: data.bannerUrl || null,
          lastActive: safeTimestampToISO(data.lastActive),
          createdAt: safeTimestampToISO(data.createdAt),
          createdBy: {
            userId: data.createdBy?.userId || '',
            displayName: data.createdBy?.displayName || 'Unknown',
            photoURL: data.createdBy?.photoURL || null,
          },
          privacy: data.privacy || 'public',
          tags: data.tags || [],
        } as Group;
      });

      const membershipQuery = query(
        collection(db, 'groupMembers'),
        where('userId', '==', user.uid)
      );
      const membershipSnapshot = await getDocs(membershipQuery);
      const myGroupIds = new Set(membershipSnapshot.docs.map(doc => doc.data().groupId));

      const userGroupsData = allGroupsData.filter(group => myGroupIds.has(group.id));
      setMyGroups(userGroupsData);
    } catch (error) {
      console.error('Error fetching user groups:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyGroups();
  }, [user]);

  const filteredGroups = myGroups.filter(group =>
    (group.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (group.description?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  const sortedGroups = [...filteredGroups].sort((a, b) => {
    try {
      switch (sortBy) {
        case 'recently-active':
          return new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime();
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'alphabetical':
          return (a.name || '').localeCompare(b.name || '');
        default:
          return 0;
      }
    } catch (e) {
      console.error("Error during sorting:", e, a, b);
      return 0;
    }
  });

  const renderGroupCard = (group: Group, variant: 'grid' | 'list') => {
    const isGrid = variant === 'grid';

    return (
      <div
        key={group.id}
        className={`bg-white rounded-xl shadow-sm border border-gray-200 transition-all duration-200 hover:shadow-md w-full max-w-md mx-auto ${
          isGrid ? 'flex flex-col' : 'flex flex-col sm:flex-row sm:items-center'
        }`}
      >
        {/* Banner Image */}
        <div
          className={`relative w-full ${isGrid ? 'h-32 sm:h-40' : 'h-32 sm:h-24 sm:w-32'} rounded-t-xl sm:rounded-tl-xl sm:rounded-tr-none overflow-hidden`}
        >
          {group.bannerUrl ? (
            <img
              src={group.bannerUrl}
              alt={`${group.name} banner`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-indigo-100 to-blue-100 flex items-center justify-center">
              <Users className="h-8 w-8 text-indigo-500" />
            </div>
          )}
        </div>

        {/* Card Content */}
        <div
          className={`p-4 flex flex-col w-full ${
            isGrid ? 'flex-1' : 'sm:flex-row sm:items-center sm:flex-1'
          }`}
        >
          {/* Group Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-800 truncate">{group.name}</h3>
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{group.description || 'No description available'}</p>
            <div className="flex flex-wrap items-center mt-2 gap-2">
              <Badge variant="secondary" className="text-xs">
                {group.privacy}
              </Badge>
              <span className="text-xs text-gray-500 flex items-center">
                <Users className="h-4 w-4 mr-1" />
                {group.memberCount} members
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1 truncate">
              Last active: {new Date(group.lastActive).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>

          {/* Action Button */}
          <div className={`${isGrid ? 'mt-4' : 'mt-4 sm:ml-4 sm:mt-0'} flex-shrink-0`}>
            <Button
              variant="outline"
              size="sm"
              className="w-full sm:w-auto"
              onClick={() => window.location.href = `/groups/${group.id}`}
            >
              View Group
            </Button>
          </div>
        </div>
      </div>
    );
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdf0eb]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row lg:space-x-8">
        <div className="flex flex-col w-full lg:w-80">
          <div className="bg-white shadow-sm rounded-xl p-6 mb-4">
            <div className="relative group">
              <div className="w-16 h-16 rounded-full border-2 border-white shadow-md overflow-hidden relative mx-auto">
                {profilePhotoURL ? (
                  <img 
                    src={profilePhotoURL} 
                    alt={user.displayName || ''} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img 
                    src={'/default-avatar.png'}
                    alt="Default Avatar"
                    className="w-full h-full object-cover"
                  />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="avatarUpload"
                />
                <label
                  htmlFor="avatarUpload"
                  className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <Camera className="w-4 h-4 text-white" />
                </label>
              </div>
              <div className="absolute bottom-0 right-8 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
            </div>
            <div className="mt-2 text-center">
              <h1 className="text-lg font-bold text-gray-800">{user.displayName || 'User'}</h1>
              <div className="mt-1 text-xs text-gray-500">
                @{user.displayName?.toLowerCase().replace(/\s/g, '') || 'user'} • Joined {new Date(user.metadata.creationTime).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </div>
              <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
                Member
              </span>
            </div>
          </div>

          <nav className="bg-white rounded-xl shadow-sm p-6 sticky top-8">
            <button onClick={() => window.location.href = '/profile'} className={`w-full block px-4 py-3 rounded-lg text-base font-medium text-left transition-colors duration-200 ${window.location.pathname === '/profile' ? 'bg-[#0E4F52] text-white' : 'text-[#2A363B] hover:bg-[#0E4F52]/20 hover:text-[#0E4F52]'}`}>Profile</button>
            <button onClick={() => window.location.href = '/connections'} className={`w-full block px-4 py-3 rounded-lg text-base font-medium text-left transition-colors duration-200 ${window.location.pathname === '/connections' ? 'bg-[#0E4F52] text-white' : 'text-[#2A363B] hover:bg-[#0E4F52]/20 hover:text-[#0E4F52]'}`}>Connections</button>
            <button onClick={() => window.location.href = '/profilegroups'} className={`w-full block px-4 py-3 rounded-lg text-base font-medium text-left transition-colors duration-200 ${window.location.pathname === '/profilegroups' ? 'bg-[#0E4F52] text-white' : 'text-[#2A363B] hover:bg-[#0E4F52]/20 hover:text-[#0E4F52]'}`}>Groups</button>
            <button onClick={() => window.location.href = '/forums'} className={`w-full block px-4 py-3 rounded-lg text-base font-medium text-left transition-colors duration-200 ${window.location.pathname === '/forums' ? 'bg-[#0E4F52] text-white' : 'text-[#2A363B] hover:bg-[#0E4F52]/20 hover:text-[#0E4F52]'}`}>Forums</button>
            <div className="w-full block px-4 py-3 rounded-lg text-base font-medium text-left text-[#2A363B] opacity-60 cursor-default select-none bg-transparent">My Activity</div>
          </nav>
        </div>

        <div className="flex-1 mt-6 lg:mt-0">
          <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">My Groups</h1>

            <div className="mb-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-lg">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    type="search"
                    placeholder="Search my groups by name or description..."
                    className="pl-10 w-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center"
                    onClick={() => setShowFilters(!showFilters)}
                    aria-expanded={showFilters}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Sort / Filter
                  </Button>
                  <div className="flex items-center border rounded-md p-0.5 bg-gray-100">
                    <Button
                      variant={view === 'grid' ? 'secondary' : 'ghost'}
                      size="sm"
                      className={`p-1.5 h-auto rounded-sm transition-colors ${view === 'grid' ? '' : 'text-gray-600 hover:bg-gray-200'}`}
                      onClick={() => setView('grid')}
                      aria-label="Grid view"
                    >
                      <LayoutGrid size={18} />
                    </Button>
                    <Button
                      variant={view === 'list' ? 'secondary' : 'ghost'}
                      size="sm"
                      className={`p-1.5 h-auto rounded-sm transition-colors ${view === 'list' ? '' : 'text-gray-600 hover:bg-gray-200'}`}
                      onClick={() => setView('list')}
                      aria-label="List view"
                    >
                      <List size={18} />
                    </Button>
                  </div>
                </div>
              </div>

              {showFilters && (
                <div className="mt-4 pt-4 border-t">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <Button
                      variant={sortBy === 'recently-active' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSortBy('recently-active')}
                      className="justify-start text-left"
                    >
                      Recently Active
                    </Button>
                    <Button
                      variant={sortBy === 'newest' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSortBy('newest')}
                      className="justify-start text-left"
                    >
                      Newest
                    </Button>
                    <Button
                      variant={sortBy === 'alphabetical' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSortBy('alphabetical')}
                      className="justify-start text-left"
                    >
                      Alphabetical (A-Z)
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div>
                {sortedGroups.length === 0 ? (
                  <div className="text-center py-16 px-6 bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      {searchQuery
                        ? 'No groups match your search'
                        : "You haven't joined any groups yet"}
                    </h3>
                    <p className="text-gray-500">
                      {searchQuery
                        ? 'Try adjusting your search query or clearing the filter.'
                        : 'Explore and join groups to connect with others!'}
                    </p>
                    {searchQuery && (
                      <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => setSearchQuery('')}
                      >
                        Clear Search
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className={view === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6'
                    : 'space-y-4 sm:space-y-6'}
                  >
                    {sortedGroups.map((group) => renderGroupCard(group, view))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyGroupsPage;