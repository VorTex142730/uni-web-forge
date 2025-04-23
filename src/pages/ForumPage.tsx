import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Users, Globe, Lock, Search, ChevronRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getForum, joinForum, leaveForum, deleteForum, getForumMembers, type Forum, type ForumMember } from '@/lib/firebase/forums';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

const ForumPage = () => {
  const { forumId } = useParams<{ forumId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [forum, setForum] = useState<Forum | null>(null);
  const [members, setMembers] = useState<ForumMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (forumId) {
      loadForumData();
    }
  }, [forumId]);

  const loadForumData = async () => {
    try {
      if (!forumId) {
        navigate('/forums');
        return;
      }
      
      // First try to get the forum data
      let forumData;
      try {
        forumData = await getForum(forumId);
      } catch (error) {
        console.error('Forum not found:', error);
        toast.error('Forum not found');
        navigate('/forums');
        return;
      }

      // Only fetch members if we successfully got the forum
      const membersData = await getForumMembers(forumId);

      setForum(forumData);
      setMembers(membersData);
    } catch (error) {
      console.error('Error loading forum:', error);
      toast.error('Failed to load forum');
      navigate('/forums');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinForum = async () => {
    if (!forum || !user) return;
    
    setIsJoining(true);
    try {
      await joinForum(forum.id);
      toast.success('Successfully joined the forum');
      loadForumData();
    } catch (error) {
      console.error('Error joining forum:', error);
      toast.error('Failed to join forum');
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeaveForum = async () => {
    if (!forum || !user) return;
    
    setIsLeaving(true);
    try {
      await leaveForum(forum.id);
      toast.success('Successfully left the forum');
      loadForumData();
    } catch (error) {
      console.error('Error leaving forum:', error);
      toast.error('Failed to leave forum');
    } finally {
      setIsLeaving(false);
    }
  };

  const handleDeleteForum = async () => {
    if (!forum || !user) return;
    
    setIsDeleting(true);
    try {
      await deleteForum(forum.id);
      toast.success('Forum deleted successfully');
      navigate('/forums');
    } catch (error) {
      console.error('Error deleting forum:', error);
      toast.error('Failed to delete forum');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredMembers = members.filter(member =>
    member.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isUserMember = members.some(member => member.userId === user?.uid);
  const isUserAdmin = members.some(member => member.userId === user?.uid && member.role === 'admin');

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-gray-500 mt-2">Loading forum...</p>
        </div>
      </div>
    );
  }

  if (!forum) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-500">Forum not found</p>
        </div>
      </div>
    );
  }

  const formatDate = (date: Date) => {
    if (!date) return 'No activity';
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
      {/* Breadcrumb & Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <Link to="/forums" className="hover:text-gray-700">Forums</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-gray-900">{forum.title}</span>
        </div>
        
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold text-gray-900">{forum.title}</h1>
              {forum.isPrivate ? (
                <Lock className="h-5 w-5 text-gray-400" />
              ) : (
                <Globe className="h-5 w-5 text-gray-400" />
              )}
            </div>
            {forum.description && (
              <p className="text-gray-600 mt-2">{forum.description}</p>
            )}
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{forum.memberCount} members</span>
              </div>
              <div className="flex items-center gap-1">
                <span>Active {formatDate(forum.updatedAt)}</span>
              </div>
            </div>
          </div>
          
          <div className="space-x-2">
            {user && (
              <>
                {!isUserMember && (
                  <Button
                    onClick={handleJoinForum}
                    disabled={isJoining}
                  >
                    {isJoining ? 'Joining...' : 'Join Forum'}
                  </Button>
                )}
                {isUserMember && !isUserAdmin && (
                  <Button
                    variant="outline"
                    onClick={handleLeaveForum}
                    disabled={isLeaving}
                  >
                    {isLeaving ? 'Leaving...' : 'Leave Forum'}
                  </Button>
                )}
                {isUserAdmin && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">Delete Forum</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the forum
                          and remove all members.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteForum}
                          disabled={isDeleting}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          {isDeleting ? 'Deleting...' : 'Delete Forum'}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="feed" className="space-y-4">
        <TabsList className="w-full border-b pb-0">
          <TabsTrigger value="feed" className="flex-1">Feed</TabsTrigger>
          <TabsTrigger value="members" className="flex-1">Members</TabsTrigger>
          <TabsTrigger value="photos" className="flex-1">Photos</TabsTrigger>
          <TabsTrigger value="videos" className="flex-1">Videos</TabsTrigger>
          <TabsTrigger value="albums" className="flex-1">Albums</TabsTrigger>
          <TabsTrigger value="discussions" className="flex-1">Discussions</TabsTrigger>
        </TabsList>

        <TabsContent value="feed">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <p className="text-gray-500 text-center">No posts yet</p>
          </div>
        </TabsContent>

        <TabsContent value="members">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-medium text-gray-900">Members</h2>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search members..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              {filteredMembers.map((member) => (
                <div
                  key={member.userId}
                  className="flex items-center justify-between py-2"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      {member.photoURL ? (
                        <img 
                          src={member.photoURL} 
                          alt={member.displayName} 
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <span className="text-gray-600 font-medium">
                          {member.displayName?.[0]?.toUpperCase() || '?'}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {member.displayName || 'Anonymous'}
                        {member.role === 'admin' && (
                          <span className="ml-2 text-sm text-gray-500">(Admin)</span>
                        )}
                        {member.role === 'moderator' && (
                          <span className="ml-2 text-sm text-gray-500">(Moderator)</span>
                        )}
                      </p>
                      <p className="text-sm text-gray-500">
                        Joined {formatDate(member.joinedAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="photos">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <p className="text-gray-500 text-center">No photos yet</p>
          </div>
        </TabsContent>

        <TabsContent value="videos">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <p className="text-gray-500 text-center">No videos yet</p>
          </div>
        </TabsContent>

        <TabsContent value="albums">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <p className="text-gray-500 text-center">No albums yet</p>
          </div>
        </TabsContent>

        <TabsContent value="discussions">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <p className="text-gray-500 text-center">No discussions yet</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ForumPage; 