import React, { useState, useEffect, useRef } from 'react';
import { onSnapshot, doc, updateDoc, increment, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { MoreHorizontal, Heart, MessageCircle, Share2, Trash2, Edit, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
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
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    if (!user || !newPost.trim() || !isMember) {
      toast.error('Please sign in to create a post');
      return;
    }

    setIsSubmitting(true);
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
      setIsSubmitting(false);
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
    if (!user || (!isOwner && user.uid !== createdByUserId)) {
      toast.error('You do not have permission to delete this post');
      return;
    }

    try {
      await FeedService.deletePost(postId, groupId);
      toast.success('Post deleted successfully');
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    }
  };

  const handleLikePost = async (postId: string) => {
    if (!user || !isMember) {
      toast.error('Please sign in to like posts');
      return;
    }

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
        <div className="flex space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user?.photoURL || ''} alt={user?.displayName || 'User'} />
            <AvatarFallback>{user?.displayName?.[0] || 'U'}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Textarea
              placeholder="What's on your mind?"
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              className="min-h-[100px] resize-none"
            />
            <div className="flex justify-end mt-2">
              <Button 
                type="submit" 
                disabled={isSubmitting || !newPost.trim()}
                className="rounded-full"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Posting...
                  </>
                ) : (
                  'Post'
                )}
              </Button>
            </div>
          </div>
        </div>
      </form>

      {/* Posts List */}
      <div className="space-y-6">
        {posts.map((post) => (
          <div key={post.id} className="bg-white rounded-lg shadow p-4 space-y-4">
            {/* Post Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={post.createdBy.photoURL || ''} alt={post.createdBy.displayName} />
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
            <div className="flex items-center space-x-4 pt-2 border-t border-gray-100">
              <Button
                variant="ghost"
                size="sm"
                className={`flex items-center space-x-2 ${
                  post.likes?.includes(user?.uid) ? 'text-red-500' : 'text-gray-500'
                }`}
                onClick={() => handleLikePost(post.id)}
              >
                <Heart className="h-4 w-4" />
                <span>{post.likeCount || 0}</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="flex items-center space-x-2 text-gray-500"
                onClick={() => setShowComments(showComments === post.id ? null : post.id)}
              >
                <MessageCircle className="h-4 w-4" />
                <span>{post.commentCount || 0}</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="flex items-center space-x-2 text-gray-500"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success('Link copied to clipboard');
                }}
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>

            {/* Comments Section */}
            {showComments === post.id && (
              <GroupPostComments
                postId={post.id}
                groupId={groupId}
                isOwner={isOwner}
                isMember={isMember}
              />
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
            <Button
              variant="outline"
              onClick={loadMorePosts}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                'Load More'
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupFeed; 