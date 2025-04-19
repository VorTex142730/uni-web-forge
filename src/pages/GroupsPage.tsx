// GroupsPage.jsx
import React, { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, doc, arrayUnion, addDoc } from 'firebase/firestore';
import { db, auth } from '@/config/firebaseConfig';
import { LayoutGrid, List, Plus } from 'lucide-react';
import GroupCard from '@/components/groups/GroupCard';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

const GroupsPage = () => {
  const [groups, setGroups] = useState([]);
  const [view, setView] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recently-active');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    coverImage: '',
    privacy: 'public',
  });

  // Fetch groups from Firestore
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'groups'));
        const fetchedGroups = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setGroups(fetchedGroups);
      } catch (error) {
        console.error('Error fetching groups:', error);
      }
    };

    fetchGroups();
  }, []);

  // Handle group creation
  const createGroup = async (e) => {
    e.preventDefault();
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        alert('You must be logged in to create a group');
        return;
      }

      const groupData = {
        name: newGroup.name,
        description: newGroup.description,
        coverImage: newGroup.coverImage || 'https://via.placeholder.com/400x200', // Default cover image
        privacy: newGroup.privacy,
        members: [currentUser.uid],
        createdBy: currentUser.uid,
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, 'groups'), groupData);
      
      // Update groups state
      setGroups([...groups, { id: docRef.id, ...groupData }]);
      
      // Reset form and close modal
      setNewGroup({
        name: '',
        description: '',
        coverImage: '',
        privacy: 'public',
      });
      setIsCreateModalOpen(false);
      
      alert('Group created successfully!');
    } catch (error) {
      console.error('Error creating group:', error);
      alert('Failed to create group');
    }
  };

  // Handle group join
  const joinGroup = async (groupId) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        alert('You must be logged in to join a group');
        return;
      }

      const groupRef = doc(db, 'groups', groupId);
      await updateDoc(groupRef, {
        members: arrayUnion(currentUser.uid),
      });
      alert('You have joined the group!');
    } catch (error) {
      console.error('Error joining group:', error);
    }
  };

  // Filter and sort groups
  const filteredGroups = groups
    .filter(group => group.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'recently-active') {
        return new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime();
      }
      if (sortBy === 'alphabetical') {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });

  return (
    <div className="px-4 py-6">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Groups</h1>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search Groups..."
                className="border border-gray-200 rounded-lg py-2 px-4"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Create Group
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Group</DialogTitle>
                </DialogHeader>
                <form onSubmit={createGroup} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Group Name</Label>
                    <Input
                      id="name"
                      value={newGroup.name}
                      onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newGroup.description}
                      onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="coverImage">Cover Image URL</Label>
                    <Input
                      id="coverImage"
                      value={newGroup.coverImage}
                      onChange={(e) => setNewGroup({ ...newGroup, coverImage: e.target.value })}
                      placeholder="Optional: Enter image URL"
                    />
                  </div>
                  <div>
                    <Label htmlFor="privacy">Privacy</Label>
                    <select
                      id="privacy"
                      value={newGroup.privacy}
                      onChange={(e) => setNewGroup({ ...newGroup, privacy: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg py-2 px-4"
                    >
                      <option value="public">Public</option>
                      <option value="private">Private</option>
                    </select>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Create Group</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="flex justify-between items-center mb-6">
          <select
            className="border border-gray-200 rounded-lg py-2 px-4"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="recently-active">Recently Active</option>
            <option value="alphabetical">Alphabetical</option>
          </select>

          <div className="flex space-x-2">
            <button
              className={`p-2 rounded ${view === 'grid' ? 'bg-gray-100' : 'bg-white'}`}
              onClick={() => setView('grid')}
            >
              <LayoutGrid size={18} />
            </button>
            <button
              className={`p-2 rounded ${view === 'list' ? 'bg-gray-100' : 'bg-white'}`}
              onClick={() => setView('list')}
            >
              <List size={18} />
            </button>
          </div>
        </div>

        <div className={view === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6' : 'space-y-4'}>
          {filteredGroups.map(group => (
            <GroupCard key={group.id} group={group} onJoin={() => joinGroup(group.id)} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default GroupsPage;