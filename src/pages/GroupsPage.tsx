// GroupsPage.jsx
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LayoutGrid, List } from 'lucide-react';
import GroupCard from '@/components/groups/GroupCard';
import CreateGroup from '@/components/groups/CreateGroup';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';

const GroupsPage = () => {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recently-active');
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchGroups = async () => {
    try {
      const groupsQuery = query(collection(db, 'groups'), orderBy('lastActive', 'desc'));
      const querySnapshot = await getDocs(groupsQuery);
      const groupsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setGroups(groupsData);
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleGroupCreated = () => {
    setShowCreateGroup(false);
    fetchGroups(); // Refresh the groups list
  };

  if (showCreateGroup) {
    return <CreateGroup onCancel={() => setShowCreateGroup(false)} onSuccess={handleGroupCreated} />;
  }

  const filteredGroups = groups.filter(group => 
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Groups</h1>
        <div className="flex items-center space-x-4">
          <Input
            type="search"
            placeholder="Search Groups..."
            className="w-64"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Tabs and Actions */}
      <div className="flex justify-between items-center mb-8 border-b pb-4">
        <div className="flex items-center space-x-6">
          <button
            className={`text-sm font-medium relative ${
              !showCreateGroup ? 'text-blue-600' : 'text-gray-600'
            }`}
            onClick={() => setShowCreateGroup(false)}
          >
            All Groups
            <span className="ml-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
              {filteredGroups.length}
            </span>
            {!showCreateGroup && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
            )}
          </button>
          <button
            className={`text-sm font-medium relative ${
              showCreateGroup ? 'text-blue-600' : 'text-gray-600'
            }`}
            onClick={() => setShowCreateGroup(true)}
          >
            Create a Group
            {showCreateGroup && (
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

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {/* Groups Grid */}
          <div className={`grid ${
            view === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1'
          } gap-6`}>
            {sortedGroups.map((group) => (
              <GroupCard key={group.id} group={group} onJoin={() => {}} />
            ))}
          </div>

          {/* Footer */}
          <div className="mt-6 text-sm text-gray-500">
            Viewing {sortedGroups.length} {sortedGroups.length === 1 ? 'group' : 'groups'}
          </div>
        </>
      )}
    </div>
  );
};

export default GroupsPage;