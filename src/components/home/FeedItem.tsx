import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ThumbsUp, MessageSquare, Share2, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Post, User, Group } from '@/types';
import { users, groups } from '@/data/mockData';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { likePost, addComment, editPost, deletePost } from '@/services/postService';
import { toast } from 'sonner';

interface FeedItemProps {
  post: Post;
  onEdit?: (postId: string, newContent: string) => void;
  onDelete?: (postId: string) => void;
}

const FeedItem: React.FC<FeedItemProps> = ({ post, onEdit, onDelete }) => {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes || 0);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(post.content);
  const [comments, setComments] = useState(post.comments || []);

  // Find author and group details
  const author = users.find(user => user.id === post.authorId);
  const group = post.groupId ? groups.find(g => g.id === post.groupId) : undefined;
  
  useEffect(() => {
    if (user && post.likedBy) {
      setIsLiked(post.likedBy.includes(user.uid));
    }
  }, [user, post.likedBy]);

  // Generate initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  const handleLike = async () => {
    if (!user) {
      toast.error('Please sign in to like posts');
      return;
    }

    try {
      const newIsLiked = await likePost(post.id, user.uid);
      setIsLiked(newIsLiked);
      setLikesCount(prev => newIsLiked ? prev + 1 : prev - 1);
    } catch (error) {
      toast.error('Failed to like post');
      console.error('Error liking post:', error);
    }
  };

  const handleComment = async () => {
    if (!user) {
      toast.error('Please sign in to comment');
      return;
    }

    if (!newComment.trim()) return;

    try {
      const comment = await addComment(post.id, {
        content: newComment,
        authorId: user.uid,
        authorName: user.displayName || 'Anonymous',
        authorAvatar: user.photoURL || undefined
      });

      setComments(prev => [...prev, comment]);
      setNewComment('');
      toast.success('Comment added successfully');
    } catch (error) {
      toast.error('Failed to add comment');
      console.error('Error adding comment:', error);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy link');
      console.error('Error sharing post:', error);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!user) {
      toast.error('Please sign in to edit posts');
      return;
    }

    if (editedContent === post.content) {
      setIsEditing(false);
      return;
    }

    try {
      await editPost(post.id, editedContent);
      if (onEdit) {
        onEdit(post.id, editedContent);
      }
      setIsEditing(false);
      toast.success('Post updated successfully');
    } catch (error) {
      toast.error('Failed to update post');
      console.error('Error editing post:', error);
    }
  };

  const handleDelete = async () => {
    if (!user) {
      toast.error('Please sign in to delete posts');
      return;
    }

    try {
      await deletePost(post.id);
      if (onDelete) {
        onDelete(post.id);
      }
      toast.success('Post deleted successfully');
    } catch (error) {
      toast.error('Failed to delete post');
      console.error('Error deleting post:', error);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm mb-4 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start mb-4">
        <Link to={`/profile/${author?.id}`}>
          <Avatar className="h-10 w-10 mr-3">
            <AvatarImage src={author?.avatar || ''} alt={author?.name || 'User'} />
            <AvatarFallback>{author?.name ? getInitials(author.name) : 'U'}</AvatarFallback>
          </Avatar>
        </Link>
        
        <div className="flex-grow">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link to={`/profile/${author?.id}`} className="font-medium hover:underline">
                {author?.name}
              </Link>
              
              {group && (
                <>
                  <span className="mx-2 text-gray-500">in</span>
                  <Link to={`/groups/${group.id}`} className="font-medium hover:underline">
                    {group.name}
                  </Link>
                </>
              )}
              
              <span className="ml-2 text-gray-500 text-sm">{post.createdAt}</span>
            </div>

            {user && user.uid === post.authorId && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleEdit}>
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          
          {isEditing ? (
            <div className="mt-2">
              <Textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="w-full"
              />
              <div className="flex justify-end mt-2 space-x-2">
                <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                <Button onClick={handleSaveEdit}>Save</Button>
              </div>
            </div>
          ) : (
            post.content && (
              <p className="mt-2 text-gray-700">{post.content}</p>
            )
          )}
        </div>
      </div>
      
      {post.image && (
        <div className="mt-4">
          <img src={post.image} alt="Post" className="rounded-lg w-full" />
        </div>
      )}
      
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex space-x-4">
          <Button 
            variant="ghost" 
            className={cn(
              "text-gray-600",
              isLiked && "text-blue-600"
            )}
            onClick={handleLike}
          >
            <ThumbsUp className="h-4 w-4 mr-2" />
            {likesCount} {likesCount === 1 ? 'Like' : 'Likes'}
          </Button>
          
          <Button 
            variant="ghost" 
            className="text-gray-600"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            {comments.length} Comments
          </Button>
          
          <Button 
            variant="ghost" 
            className="text-gray-600"
            onClick={handleShare}
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {showComments && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex space-x-2">
            <Textarea
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-grow"
            />
            <Button onClick={handleComment}>Post</Button>
          </div>
          
          <div className="mt-4 space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="flex space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={comment.authorAvatar} />
                  <AvatarFallback>{getInitials(comment.authorName)}</AvatarFallback>
                </Avatar>
                <div className="flex-grow">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="font-medium">{comment.authorName}</div>
                    <p className="text-gray-700">{comment.content}</p>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {comment.createdAt}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedItem;
