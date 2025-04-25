import React, { useState, useEffect, useRef } from 'react';
import { onSnapshot } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { MoreHorizontal, Heart, MessageCircle, Share2, Trash2, Edit } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FeedService, FeedPost } from '@/services/feedService';
import GroupPostComments from './GroupPostComments';

interface GroupFeedProps {
  groupId: string;
  isOwner: boolean;
  isMember: boolean;
}

const GroupFeed: React.FC<GroupFeedProps> = ({ groupId, isOwner, isMember }) => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingPost, setEditingPost] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [showComments, setShowComments] = useState<string | null>(null);
  const lastPostRef = useRef<any>(null);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (!groupId) return;

    const query = FeedService.getPaginatedPosts(groupId);
    const unsubscribe = onSnapshot(query, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FeedPost[];
      setPosts(postsData);
      setHasMore(snapshot.docs.length === 10);
      if (snapshot.docs.length > 0) {
        lastPostRef.current = snapshot.docs[snapshot.docs.length - 1];
      }
    });

    return () => unsubscribe();
  }, [groupId]);

  const loadMorePosts = async () => {
    if (!hasMore || !lastPostRef.current) return;

    const query = FeedService.getPaginatedPosts(groupId, lastPostRef.current);
    const snapshot = await onSnapshot(query, (snapshot) => {
      const newPosts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FeedPost[];
      setPosts(prev => [...prev, ...newPosts]);
      setHasMore(snapshot.docs.length === 10);
      if (snapshot.docs.length > 0) {
        lastPostRef.current = snapshot.docs[snapshot.docs.length - 1];
      }
    });
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newPost.trim() || !isMember) return;

    setLoading(true);
    try {
      await FeedService.createPost({
        content: newPost.trim(),
        groupId,
        createdBy: {
          userId: user.uid,
          displayName: user.displayName || 'Anonymous',
          photoURL: user.photoURL
        }
      });

      setNewPost('');
      toast.success('Post created successfully');
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePost = async (postId: string) => {
    if (!editContent.trim()) return;

    try {
      await FeedService.updatePost(postId, editContent.trim());
      setEditingPost(null);
      setEditContent('');
      toast.success('Post updated successfully');
    } catch (error) {
      console.error('Error updating post:', error);
      toast.error('Failed to update post');
    }
  };

  const handleDeletePost = async (postId: string, createdByUserId: string) => {
    if (!user || (!isOwner && user.uid !== createdByUserId)) return;

    try {
      await FeedService.deletePost(postId, groupId);
      toast.success('Post deleted successfully');
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    }
  };

  const handleLikePost = async (postId: string) => {
    if (!user || !isMember) return;

    try {
      await FeedService.toggleLike(postId, user.uid);
    } catch (error) {
      console.error('Error updating like:', error);
      toast.error('Failed to update like');
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    }).format(date);
  };

  if (!isMember) {
    return (
      <div className="text-center py-8 text-gray-500">
        You need to be a member to view posts
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Create Post Form */}
      <form onSubmit={handleCreatePost} className="space-y-4">
        <Textarea
          placeholder="What's on your mind?"
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          className="min-h-[100px]"
        />
        <Button type="submit" disabled={loading || !newPost.trim()}>
          Post
        </Button>
      </form>

      {/* Posts List */}
      <div className="space-y-6">
        {posts.map((post) => (
          <div key={post.id} className="bg-white rounded-lg shadow p-4 space-y-4">
            {/* Post Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src={post.createdBy.photoURL} alt={post.createdBy.displayName} />
                  <AvatarFallback>{post.createdBy.displayName[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{post.createdBy.displayName}</p>
                  <p className="text-sm text-gray-500">
                    {formatDate(post.createdAt)}
                    {post.isEdited && <span className="ml-2 text-gray-400">(edited)</span>}
                  </p>
                </div>
              </div>
              
              {(isOwner || user?.uid === post.createdBy.userId) && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {user?.uid === post.createdBy.userId && (
                      <DropdownMenuItem
                        onClick={() => {
                          setEditingPost(post.id);
                          setEditContent(post.content);
                        }}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Post
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => handleDeletePost(post.id, post.createdBy.userId)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Post
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {/* Post Content */}
            {editingPost === post.id ? (
              <div className="space-y-2">
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="min-h-[100px]"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleUpdatePost(post.id)}
                    disabled={!editContent.trim()}
                  >
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingPost(null);
                      setEditContent('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
            )}

            {/* Post Actions */}
            <div className="flex items-center space-x-6 pt-2">
              <button
                onClick={() => handleLikePost(post.id)}
                className={`flex items-center space-x-2 ${
                  post.likes.includes(user?.uid || '') ? 'text-red-500' : 'text-gray-500'
                } hover:text-red-500 transition-colors`}
              >
                <Heart className="h-5 w-5" />
                <span>{post.likes.length}</span>
              </button>
              
              <button
                onClick={() => setShowComments(showComments === post.id ? null : post.id)}
                className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition-colors"
              >
                <MessageCircle className="h-5 w-5" />
                <span>{post.comments}</span>
              </button>
              
              <button className="flex items-center space-x-2 text-gray-500 hover:text-green-500 transition-colors">
                <Share2 className="h-5 w-5" />
              </button>
            </div>

            {/* Comments Section */}
            {showComments === post.id && (
              <div className="mt-4 pt-4 border-t">
                <GroupPostComments
                  postId={post.id}
                  groupId={groupId}
                  isOwner={isOwner}
                  isMember={isMember}
                />
              </div>
            )}
          </div>
        ))}

        {posts.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No posts yet. Be the first to post!
          </div>
        )}

        {hasMore && (
          <div className="text-center">
            <Button variant="outline" onClick={loadMorePosts}>
              Load More Posts
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupFeed; 