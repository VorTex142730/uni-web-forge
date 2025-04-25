// GroupsPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LayoutGrid, List, Search } from 'lucide-react';
import GroupCard from '@/components/groups/GroupCard';
import CreateGroup from '@/components/groups/CreateGroup';
import { collection, query, orderBy, getDocs, where, addDoc, getDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { createGroupJoinRequestNotification } from '@/components/notifications/NotificationService';

interface Group {
  id: string;
  name: string;
  description?: string;
  privacy: 'public' | 'private';
  coverImage?: string;
  lastActive: string;
  createdAt: string;
  memberCount: number;
  createdBy: string;
}

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

  const fetchGroups = async () => {
    setLoading(true);
    try {
      // Fetch all groups
      const groupsQuery = query(
        collection(db, 'groups'),
        orderBy('lastActive', 'desc')
      );
      const groupsSnapshot = await getDocs(groupsQuery);
      const groupsData = groupsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        lastActive: doc.data().lastActive?.toDate?.().toISOString() || new Date().toISOString(),
        createdAt: doc.data().createdAt?.toDate?.().toISOString() || new Date().toISOString()
      })) as Group[];
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

      // Create notification for group owner
      await createGroupJoinRequestNotification(
        groupData.createdBy.userId,
        user.uid,
        user.displayName || 'Anonymous',
        groupId,
        groupData.name
      );

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
    <div className="max-w-[1440px] mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold">Groups</h1>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            type="search"
            placeholder="Search Groups..."
            className="pl-10 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex justify-between items-center border-b border-gray-200 mb-6">
        <div className="flex -mb-px">
          <button
            className={`inline-flex items-center px-4 py-3 border-b-2 font-medium text-sm ${
              activeTab === 'all'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('all')}
          >
            All Groups
            <span className="ml-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
              {groups.length}
            </span>
          </button>
          <button
            className={`inline-flex items-center px-4 py-3 border-b-2 font-medium text-sm ${
              activeTab === 'my'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('my')}
          >
            My Groups
            <span className="ml-2 bg-gray-200 text-gray-600 text-xs px-1.5 py-0.5 rounded-full">
              {myGroups.length}
            </span>
          </button>
          <button
            className={`inline-flex items-center px-4 py-3 border-b-2 font-medium text-sm ${
              activeTab === 'create'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('create')}
          >
            Create a Group
          </button>
        </div>

        <div className="flex items-center gap-4">
          <select
            className="text-sm border rounded-lg py-2 px-3 bg-white"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="recently-active">Recently Active</option>
            <option value="newest">Newest</option>
            <option value="alphabetical">Alphabetical</option>
          </select>

          <div className="flex items-center border rounded-lg p-1 bg-white">
            <button
              className={`p-2 rounded transition-colors ${view === 'grid' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
              onClick={() => setView('grid')}
            >
              <LayoutGrid size={18} />
            </button>
            <button
              className={`p-2 rounded transition-colors ${view === 'list' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
              onClick={() => setView('list')}
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="min-h-[calc(100vh-240px)]">
        {activeTab === 'create' ? (
          <CreateGroup 
            onSuccess={handleCreateSuccess} 
            onCancel={() => setActiveTab('all')} 
          />
        ) : (
          <>
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <>
                <div className={`grid gap-6 ${
                  view === 'grid' 
                    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                    : 'grid-cols-1 max-w-3xl mx-auto'
                }`}>
                  {sortedGroups.map((group) => (
                    <GroupCard
                      key={group.id}
                      group={group}
                    />
                  ))}
                </div>

                {sortedGroups.length === 0 && (
                  <div className="text-center text-gray-500 py-12">
                    No groups found matching your search.
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default GroupsPage;