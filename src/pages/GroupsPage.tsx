// GroupsPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LayoutGrid, List, Search } from 'lucide-react';
import GroupCard from '@/components/groups/GroupCard';
import CreateGroup from '@/components/groups/CreateGroup';
import { collection, getDocs, query, orderBy, where, addDoc } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

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
    try {
      setLoading(true);
      // Fetch all groups
      const groupsQuery = query(collection(db, 'groups'), orderBy('lastActive', 'desc'));
      const groupsSnapshot = await getDocs(groupsQuery);
      const groupsData = groupsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Group[];
      setGroups(groupsData);

      // Fetch user's groups if logged in
      if (user) {
        const myGroupsQuery = query(
          collection(db, 'groupMembers'),
          where('userId', '==', user.uid)
        );
        const myGroupsSnapshot = await getDocs(myGroupsQuery);
        const myGroupIds = myGroupsSnapshot.docs.map(doc => doc.data().groupId);
        const myGroupsData = groupsData.filter(group => myGroupIds.includes(group.id));
        setMyGroups(myGroupsData);
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
      toast.error('Failed to load groups');
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

      // Add join request
      await addDoc(collection(db, 'groupJoinRequests'), {
        groupId,
        userId: user.uid,
        status: 'pending',
        createdAt: new Date().toISOString(),
        displayName: user.displayName || 'Anonymous',
        photoURL: user.photoURL
      });

      toast.success('Join request sent successfully');
    } catch (error) {
      console.error('Error joining group:', error);
      toast.error('Failed to send join request');
    }
  };

  const displayedGroups = activeTab === 'my' ? myGroups : groups;
  const filteredGroups = displayedGroups.filter(group => 
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Groups</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            type="search"
            placeholder="Search Groups..."
            className="pl-10 w-64"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex justify-between items-center mb-8 border-b pb-4">
        <div className="flex items-center space-x-6">
          <button
            className={`text-sm font-medium relative ${
              activeTab === 'all' ? 'text-blue-600' : 'text-gray-600'
            }`}
            onClick={() => setActiveTab('all')}
          >
            All Groups
            <span className="ml-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
              {groups.length}
            </span>
            {activeTab === 'all' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
            )}
          </button>
          <button
            className={`text-sm font-medium relative ${
              activeTab === 'my' ? 'text-blue-600' : 'text-gray-600'
            }`}
            onClick={() => setActiveTab('my')}
          >
            My Groups
            <span className="ml-2 bg-gray-200 text-gray-600 text-xs px-1.5 py-0.5 rounded-full">
              {myGroups.length}
            </span>
            {activeTab === 'my' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
            )}
          </button>
          <button
            className={`text-sm font-medium relative ${
              activeTab === 'create' ? 'text-blue-600' : 'text-gray-600'
            }`}
            onClick={() => setActiveTab('create')}
          >
            Create a Group
            {activeTab === 'create' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
            )}
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <select
            className="text-sm border rounded-lg py-2 px-3"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="recently-active">Recently Active</option>
            <option value="newest">Newest</option>
            <option value="alphabetical">Alphabetical</option>
          </select>

          <div className="flex items-center border rounded-lg p-1">
            <button
              className={`p-2 rounded ${view === 'grid' ? 'bg-gray-100' : ''}`}
              onClick={() => setView('grid')}
            >
              <LayoutGrid size={18} />
            </button>
            <button
              className={`p-2 rounded ${view === 'list' ? 'bg-gray-100' : ''}`}
              onClick={() => setView('list')}
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'create' ? (
        <CreateGroup onSuccess={() => {
          setActiveTab('all');
          fetchGroups();
        }} />
      ) : (
        <>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              <div className={`grid ${
                view === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1'
              } gap-6`}>
                {filteredGroups.map((group) => (
                  <GroupCard
                    key={group.id}
                    group={group}
                    onJoin={() => handleJoinGroup(group.id)}
                    onView={() => navigate(`/groups/${group.id}`)}
                  />
                ))}
              </div>

              {filteredGroups.length === 0 && (
                <div className="text-center text-gray-500 py-12">
                  No groups found matching your search.
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default GroupsPage;