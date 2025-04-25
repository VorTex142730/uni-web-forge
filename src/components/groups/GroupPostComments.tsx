import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, doc, deleteDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar } from '@/components/ui/avatar';
import { Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

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
    if (!user || !newComment.trim() || !isMember) return;

    setLoading(true);
    try {
      // Add the comment
      await addDoc(collection(db, 'groupPostComments'), {
        content: newComment.trim(),
        createdAt: serverTimestamp(),
        createdBy: {
          userId: user.uid,
          displayName: user.displayName,
          photoURL: user.photoURL
        },
        postId,
        groupId
      });

      // Update the post's comment count
      const postRef = doc(db, 'groupPosts', postId);
      await updateDoc(postRef, {
        comments: comments.length + 1
      });

      setNewComment('');
      toast.success('Comment added successfully');
    } catch (error) {
      console.error('Error creating comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: string, createdByUserId: string) => {
    if (!user || (!isOwner && user.uid !== createdByUserId)) return;

    try {
      // Delete the comment
      await deleteDoc(doc(db, 'groupPostComments', commentId));

      // Update the post's comment count
      const postRef = doc(db, 'groupPosts', postId);
      await updateDoc(postRef, {
        comments: comments.length - 1
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

  if (!isMember) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Create Comment Form */}
      <form onSubmit={handleCreateComment} className="space-y-4">
        <Textarea
          placeholder="Write a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="min-h-[80px]"
        />
        <Button type="submit" variant="secondary" disabled={loading || !newComment.trim()}>
          Comment
        </Button>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="flex space-x-3 group">
            <Avatar src={comment.createdBy.photoURL} alt={comment.createdBy.displayName} />
            <div className="flex-1 bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{comment.createdBy.displayName}</p>
                  <p className="text-sm text-gray-500">{formatDate(comment.createdAt)}</p>
                </div>
                {(isOwner || user?.uid === comment.createdBy.userId) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteComment(comment.id, comment.createdBy.userId)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                )}
              </div>
              <p className="mt-2 text-gray-800">{comment.content}</p>
            </div>
          </div>
        ))}

        {comments.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            No comments yet. Be the first to comment!
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupPostComments; 