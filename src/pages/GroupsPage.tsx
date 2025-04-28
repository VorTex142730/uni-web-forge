// GroupsPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LayoutGrid, List, Search, Plus, Users, Filter, ArrowUpDown } from 'lucide-react';
import GroupCard from '@/components/groups/GroupCard';
import CreateGroup from '@/components/groups/CreateGroup';
import { collection, query, orderBy, getDocs, where, addDoc, getDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { createGroupJoinRequestNotification } from '@/components/notifications/NotificationService';
import { Group } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

const GroupsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState<'all' | 'my' | 'create'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recently-active');
  const [groups, setGroups] = useState<Group[]>([]);
  const [myGroups, setMyGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      // Fetch all groups
      const groupsQuery = query(
        collection(db, 'groups'),
        orderBy('lastActive', 'desc')
      );
      const groupsSnapshot = await getDocs(groupsQuery);
      const groupsData = groupsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          lastActive: data.lastActive?.toDate?.().toISOString() || new Date().toISOString(),
          createdAt: data.createdAt?.toDate?.().toISOString() || new Date().toISOString(),
          createdBy: {
            userId: data.createdBy?.userId || '',
            displayName: data.createdBy?.displayName,
            photoURL: data.createdBy?.photoURL
          }
        } as Group;
      });
      setGroups(groupsData);

      // Fetch user's groups if logged in
      if (user) {
        const membershipQuery = query(
          collection(db, 'groupMembers'),
          where('userId', '==', user.uid)
        );
        const membershipSnapshot = await getDocs(membershipQuery);
        const groupIds = membershipSnapshot.docs.map(doc => doc.data().groupId);
        
        const myGroupsData = groupsData.filter(group => groupIds.includes(group.id));
        setMyGroups(myGroupsData);
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, [user]);

  const handleJoinGroup = async (groupId: string) => {
    if (!user) {
      toast.error('Please log in to join groups');
      return;
    }

    try {
      // Check if user is already a member
      const membersQuery = query(
        collection(db, 'groupMembers'),
        where('groupId', '==', groupId),
        where('userId', '==', user.uid)
      );
      const membersSnapshot = await getDocs(membersQuery);
      
      if (!membersSnapshot.empty) {
        toast.error('You are already a member of this group');
        return;
      }

      // Get group details to create notification
      const groupDoc = await getDoc(doc(db, 'groups', groupId));
      if (!groupDoc.exists()) {
        toast.error('Group not found');
        return;
      }
      const groupData = groupDoc.data();

      // Add join request
      await addDoc(collection(db, 'groupJoinRequests'), {
        groupId,
        userId: user.uid,
        status: 'pending',
        createdAt: serverTimestamp(),
        displayName: user.displayName || 'Anonymous',
        photoURL: user.photoURL
      });

      // Create notification for group owner if createdBy exists
      if (groupData.createdBy?.userId) {
        await createGroupJoinRequestNotification(
          groupData.createdBy.userId,
          user.uid,
          user.displayName || 'Anonymous',
          groupId,
          groupData.name
        );
      }

      toast.success('Join request sent successfully');
    } catch (error) {
      console.error('Error joining group:', error);
      toast.error('Failed to send join request');
    }
  };

  const handleCreateSuccess = () => {
    setActiveTab('all');
    fetchGroups();
  };

  const displayedGroups = activeTab === 'my' ? myGroups : groups;
  const filteredGroups = displayedGroups.filter(group => 
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort groups based on selected option
  const sortedGroups = [...filteredGroups].sort((a, b) => {
    switch (sortBy) {
      case 'recently-active':
        return new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime();
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'alphabetical':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Tabs */}
          <Tabs defaultValue={activeTab} className="w-full" onValueChange={(value) => setActiveTab(value as 'all' | 'my' | 'create')}>
            <div className="border-b">
              <div className="px-4">
                <TabsList className="w-full justify-start">
                  <TabsTrigger value="all" className="flex items-center">
                    All Groups
                    <Badge variant="secondary" className="ml-2">{groups.length}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="my" className="flex items-center">
                    My Groups
                    <Badge variant="secondary" className="ml-2">{myGroups.length}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="create">Create a Group</TabsTrigger>
                </TabsList>
              </div>
            </div>

            <TabsContent value="create" className="p-6">
              <CreateGroup 
                onSuccess={handleCreateSuccess} 
                onCancel={() => setActiveTab('all')} 
              />
            </TabsContent>

            <TabsContent value="all" className="p-0">
              <div className="p-4 border-b">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                      type="search"
                      placeholder="Search groups..."
                      className="pl-10 w-full"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center"
                      onClick={() => setShowFilters(!showFilters)}
                    >
                      <Filter className="h-4 w-4 mr-2" />
                      Filters
                    </Button>
                    <div className="flex items-center border rounded-lg p-1 bg-white">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`p-2 rounded transition-colors ${view === 'grid' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                        onClick={() => setView('grid')}
                      >
                        <LayoutGrid size={18} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`p-2 rounded transition-colors ${view === 'list' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                        onClick={() => setView('list')}
                      >
                        <List size={18} />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Filters Panel */}
                {showFilters && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">Sort By</h3>
                      <Button variant="ghost" size="sm" className="h-8">
                        <ArrowUpDown className="h-4 w-4 mr-1" />
                        {sortBy === 'recently-active' ? 'Recently Active' : 
                         sortBy === 'newest' ? 'Newest' : 'Alphabetical'}
                      </Button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <Button 
                        variant={sortBy === 'recently-active' ? 'default' : 'outline'} 
                        size="sm"
                        onClick={() => setSortBy('recently-active')}
                      >
                        Recently Active
                      </Button>
                      <Button 
                        variant={sortBy === 'newest' ? 'default' : 'outline'} 
                        size="sm"
                        onClick={() => setSortBy('newest')}
                      >
                        Newest
                      </Button>
                      <Button 
                        variant={sortBy === 'alphabetical' ? 'default' : 'outline'} 
                        size="sm"
                        onClick={() => setSortBy('alphabetical')}
                      >
                        Alphabetical
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="p-4">
                  {sortedGroups.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="h-8 w-8 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900">No groups found</h3>
                      <p className="mt-2 text-sm text-gray-500">
                        {searchQuery 
                          ? "No groups match your search criteria. Try adjusting your search."
                          : "There are no groups available at the moment."}
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
                      ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' 
                      : 'space-y-4'}>
                      {sortedGroups.map((group) => (
                        <GroupCard
                          key={group.id}
                          group={group}
                          variant={view}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="my" className="p-0">
              <div className="p-4 border-b">
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    type="search"
                    placeholder="Search my groups..."
                    className="pl-10 w-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="p-4">
                  {myGroups.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="h-8 w-8 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900">You haven't joined any groups yet</h3>
                      <p className="mt-2 text-sm text-gray-500">
                        Browse and join groups to connect with others who share your interests.
                      </p>
                      <Button 
                        className="mt-4"
                        onClick={() => setActiveTab('all')}
                      >
                        Browse Groups
                      </Button>
                    </div>
                  ) : (
                    <div className={view === 'grid' 
                      ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' 
                      : 'space-y-4'}>
                      {sortedGroups.map((group) => (
                        <GroupCard
                          key={group.id}
                          group={group}
                          variant={view}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

// Helper functions
const generateGradient = (text: string) => {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const h1 = hash % 360;
  const h2 = (h1 + 40) % 360;
  return `from-[hsl(${h1},70%,60%)] to-[hsl(${h2},70%,50%)]`;
};

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase();
};

export default GroupsPage;