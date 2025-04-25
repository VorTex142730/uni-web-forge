import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, doc, deleteDoc, updateDoc, Timestamp, increment } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Trash2, Loader2, MoreHorizontal, Reply, Heart } from 'lucide-react';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FeedService } from '@/services/feedService';

interface Comment {
  id: string;
  content: string;
  createdAt: Timestamp;
  createdBy: {
    userId: string;
    displayName: string;
    photoURL: string | null;
  };
  postId: string;
  likes: string[];
  likeCount: number;
}

interface GroupPostCommentsProps {
  postId: string;
  groupId: string;
  isOwner: boolean;
  isMember: boolean;
}

const GroupPostComments: React.FC<GroupPostCommentsProps> = ({
  postId,
  groupId,
  isOwner,
  isMember
}) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!postId) return;

    const commentsQuery = query(
      collection(db, 'groupPostComments'),
      where('postId', '==', postId),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(commentsQuery, (snapshot) => {
      const commentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Comment[];
      setComments(commentsData);
    });

    return () => unsubscribe();
  }, [postId]);

  const handleCreateComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim() || !isMember) {
      toast.error('Please sign in to comment');
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'groupPostComments'), {
        content: newComment.trim(),
        createdAt: serverTimestamp(),
        createdBy: {
          userId: user.uid,
          displayName: user.displayName || 'Anonymous',
          photoURL: user.photoURL
        },
        postId,
        groupId
      });

      const postRef = doc(db, 'groupPosts', postId);
      await updateDoc(postRef, {
        commentCount: increment(1)
      });

      setNewComment('');
      toast.success('Comment added successfully');
    } catch (error) {
      console.error('Error creating comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string, createdByUserId: string) => {
    if (!user || (!isOwner && user.uid !== createdByUserId)) {
      toast.error('You do not have permission to delete this comment');
      return;
    }

    try {
      await deleteDoc(doc(db, 'groupPostComments', commentId));

      const postRef = doc(db, 'groupPosts', postId);
      await updateDoc(postRef, {
        commentCount: increment(-1)
      });

      toast.success('Comment deleted successfully');
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
    }
  };

  const formatDate = (timestamp: Timestamp) => {
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

  const handleLikeComment = async (commentId: string) => {
    if (!user || !isMember) {
      toast.error('Please sign in to like comments');
      return;
    }

    try {
      await FeedService.toggleCommentLike(commentId, user.uid);
    } catch (error) {
      console.error('Error liking comment:', error);
      toast.error('Failed to like comment');
    }
  };

  if (!isMember) {
    return null;
  }

  return (
    <div className="mt-4 pt-4 border-t border-gray-100">
      {/* Comments List */}
      <div className="space-y-4 mb-4">
        {comments.map((comment) => (
          <div key={comment.id} className="flex space-x-3 group">
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarImage src={comment.createdBy.photoURL || ''} alt={comment.createdBy.displayName} />
              <AvatarFallback>{comment.createdBy.displayName[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="bg-gray-50 rounded-2xl px-4 py-2.5">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-sm">{comment.createdBy.displayName}</span>
                    <span className="text-xs text-gray-500">{formatDate(comment.createdAt)}</span>
                  </div>
                  {(isOwner || user?.uid === comment.createdBy.userId) && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDeleteComment(comment.id, comment.createdBy.userId)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
                <p className="text-gray-800 text-sm whitespace-pre-wrap break-words">{comment.content}</p>
              </div>
              <div className="flex items-center space-x-4 mt-1 ml-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={`h-6 text-xs ${
                    comment.likes?.includes(user?.uid || '') 
                      ? 'text-red-500 hover:text-red-600' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => handleLikeComment(comment.id)}
                >
                  <Heart className="h-3 w-3 mr-1" />
                  {comment.likeCount || 0}
                </Button>
                <Button variant="ghost" size="sm" className="h-6 text-xs text-gray-500 hover:text-gray-700">
                  <Reply className="h-3 w-3 mr-1" />
                  Reply
                </Button>
              </div>
            </div>
          </div>
        ))}

        {comments.length === 0 && (
          <div className="text-center py-4 text-gray-500 text-sm">
            No comments yet. Be the first to comment!
          </div>
        )}
      </div>

      {/* Create Comment Form */}
      <form onSubmit={handleCreateComment} className="mt-4">
        <div className="flex space-x-3">
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarImage src={user?.photoURL || ''} alt={user?.displayName || 'User'} />
            <AvatarFallback>{user?.displayName?.[0] || 'U'}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="relative">
              <Textarea
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[40px] max-h-[120px] resize-none pr-20 rounded-2xl bg-gray-50 border-gray-200 focus:border-gray-300"
              />
              <div className="absolute right-2 bottom-2">
                <Button 
                  type="submit" 
                  variant="ghost" 
                  size="sm"
                  disabled={isSubmitting || !newComment.trim()}
                  className="h-8 px-3 rounded-full"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Post'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default GroupPostComments; 