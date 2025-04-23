import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Users, Clock, Lock, Globe, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { getForums, createForum, type Forum } from '@/lib/firebase/forums';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

const ForumsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [forums, setForums] = useState<Forum[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newForumData, setNewForumData] = useState({
    title: '',
    description: '',
    isPrivate: false,
  });
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadForums();
  }, []);

  const loadForums = async () => {
    try {
      const forumsData = await getForums();
      setForums(forumsData);
    } catch (error) {
      toast.error('Failed to load forums');
      console.error('Error loading forums:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateForum = async () => {
    try {
      if (!newForumData.title.trim()) {
        toast.error('Please enter a forum title');
        return;
      }

      const forumRef = await createForum({
        title: newForumData.title,
        description: newForumData.description,
        isPrivate: newForumData.isPrivate,
      });

      toast.success('Forum created successfully');
      setIsCreateDialogOpen(false);
      setNewForumData({ title: '', description: '', isPrivate: false });
      
      // Force a fresh load of forums
      setForums([]); // Clear current forums
      setLoading(true); // Show loading state
      await loadForums(); // Reload forums from Firebase
      
      // Navigate to the newly created forum
      navigate(`/forums/${forumRef.id}`);
    } catch (error) {
      console.error('Error creating forum:', error);
      toast.error('Failed to create forum');
    }
  };

  const filteredForums = forums.filter(forum =>
    forum.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'No activity';
    
    // Convert Firestore timestamp to JS Date
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);

    if (days < 1) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (weeks < 4) return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    return `${months} month${months > 1 ? 's' : ''} ago`;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Forums</h1>
        <div className="flex items-center gap-4">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Search forums..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-white"
            />
          </div>
          {user && (
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Forum
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Forum</DialogTitle>
                  <DialogDescription>
                    Create a new forum to start discussions with other members.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={newForumData.title}
                      onChange={(e) =>
                        setNewForumData({ ...newForumData, title: e.target.value })
                      }
                      placeholder="Enter forum title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={newForumData.description}
                      onChange={(e) =>
                        setNewForumData({ ...newForumData, description: e.target.value })
                      }
                      placeholder="Enter forum description"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="private">Private Forum</Label>
                    <Switch
                      id="private"
                      checked={newForumData.isPrivate}
                      onCheckedChange={(checked) =>
                        setNewForumData({ ...newForumData, isPrivate: checked })
                      }
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateForum}>Create Forum</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-gray-500 mt-2">Loading forums...</p>
        </div>
      ) : filteredForums.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No forums found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredForums.map((forum) => (
            <Link
              key={forum.id}
              to={`/forums/${forum.id}`}
              className="block group"
            >
              <div className="bg-white rounded-lg p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900 group-hover:text-blue-600">
                        {forum.title}
                      </h3>
                      {forum.isPrivate ? (
                        <Lock className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Globe className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                    {forum.description && (
                      <p className="text-gray-600 text-sm mt-1">
                        {forum.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{forum.memberCount} members</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>Active {formatDate(forum.updatedAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default ForumsPage;
