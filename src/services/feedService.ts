import {
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  Timestamp,
  increment,
  DocumentReference,
  DocumentData,
  Query,
  arrayUnion,
  arrayRemove,
  getDoc
} from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';

export interface FeedPost {
  id: string;
  content: string;
  createdAt: Timestamp;
  createdBy: {
    userId: string;
    displayName: string;
    photoURL: string | null;
  };
  likes: string[];
  likeCount: number;
  comments: number;
  commentCount: number;
  groupId: string;
  imageData?: string; // Base64 string for image data
  lastActivity?: Timestamp;
  isEdited?: boolean;
}

export interface FeedComment {
  id: string;
  content: string;
  createdAt: Timestamp;
  createdBy: {
    userId: string;
    displayName: string;
    photoURL: string | null;
  };
  postId: string;
  groupId: string;
  isEdited?: boolean;
}

export interface Comment {
  id: string;
  content: string;
  createdAt: Timestamp;
  createdBy: {
    userId: string;
    displayName: string;
    photoURL: string | null;
  };
  postId: string;
  groupId: string;
  likes: string[];
  likeCount: number;
  replies: Comment[];
  replyCount: number;
  parentCommentId?: string;
  isEdited?: boolean;
}

const POSTS_PER_PAGE = 10;
const COMMENTS_PER_PAGE = 20;

export class FeedService {
  // Posts
  static async createPost(data: Omit<FeedPost, 'id' | 'createdAt' | 'comments' | 'likes' | 'likeCount' | 'commentCount'>): Promise<string> {
    try {
      const postRef = await addDoc(collection(db, 'groupPosts'), {
        ...data,
        createdAt: serverTimestamp(),
        lastActivity: serverTimestamp(),
        comments: 0,
        likes: [],
        likeCount: 0,
        commentCount: 0,
        isEdited: false
      });

      // Update group's lastActivity
      await updateDoc(doc(db, 'groups', data.groupId), {
        lastActivity: serverTimestamp()
      });

      return postRef.id;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  }

  static async updatePost(postId: string, content: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'groupPosts', postId), {
        content,
        isEdited: true,
        lastActivity: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating post:', error);
      throw error;
    }
  }

  static async deletePost(postId: string, groupId: string): Promise<void> {
    try {
      // Delete all comments first
      const commentsQuery = query(
        collection(db, 'groupPostComments'),
        where('postId', '==', postId)
      );
      const commentsSnapshot = await getDocs(commentsQuery);
      const deleteComments = commentsSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deleteComments);

      // Delete the post
      await deleteDoc(doc(db, 'groupPosts', postId));

      // Update group's lastActivity
      await updateDoc(doc(db, 'groups', groupId), {
        lastActivity: serverTimestamp()
      });
    } catch (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
  }

  static async toggleLike(postId: string, userId: string): Promise<boolean> {
    try {
      const postRef = doc(db, 'groupPosts', postId);
      const postDoc = await getDoc(postRef);
      
      if (!postDoc.exists()) {
        throw new Error('Post not found');
      }

      const postData = postDoc.data();
      const likes = postData.likes || [];
      const isLiked = likes.includes(userId);

      await updateDoc(postRef, {
        likes: isLiked ? arrayRemove(userId) : arrayUnion(userId),
        likeCount: increment(isLiked ? -1 : 1),
        lastActivity: serverTimestamp()
      });

      return !isLiked;
    } catch (error) {
      console.error('Error toggling like:', error);
      throw error;
    }
  }

  static getPaginatedPosts(groupId: string, lastDoc?: any) {
    let q = query(
      collection(db, 'groupPosts'),
      where('groupId', '==', groupId),
      orderBy('createdAt', 'desc'),
      limit(10)
    );

    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    return q;
  }

  // Comments
  static async createComment(data: Omit<FeedComment, 'id' | 'createdAt'>): Promise<string> {
    try {
      // Add comment
      const commentRef = await addDoc(collection(db, 'groupPostComments'), {
        ...data,
        createdAt: serverTimestamp(),
        isEdited: false
      });

      // Update post's comment count and lastActivity
      await updateDoc(doc(db, 'groupPosts', data.postId), {
        comments: increment(1),
        lastActivity: serverTimestamp()
      });

      // Update group's lastActivity
      await updateDoc(doc(db, 'groups', data.groupId), {
        lastActivity: serverTimestamp()
      });

      return commentRef.id;
    } catch (error) {
      console.error('Error creating comment:', error);
      throw error;
    }
  }

  static async updateComment(commentId: string, content: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'groupPostComments', commentId), {
        content,
        isEdited: true
      });
    } catch (error) {
      console.error('Error updating comment:', error);
      throw error;
    }
  }

  static async deleteComment(commentId: string, postId: string, groupId: string): Promise<void> {
    try {
      // Delete the comment
      await deleteDoc(doc(db, 'groupPostComments', commentId));

      // Update post's comment count
      await updateDoc(doc(db, 'groupPosts', postId), {
        comments: increment(-1),
        lastActivity: serverTimestamp()
      });

      // Update group's lastActivity
      await updateDoc(doc(db, 'groups', groupId), {
        lastActivity: serverTimestamp()
      });
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  }

  static getPaginatedComments(postId: string, lastComment?: DocumentReference<DocumentData>): Query<DocumentData> {
    return lastComment
      ? query(
          collection(db, 'groupPostComments'),
          where('postId', '==', postId),
          orderBy('createdAt', 'asc'),
          startAfter(lastComment),
          limit(COMMENTS_PER_PAGE)
        )
      : query(
          collection(db, 'groupPostComments'),
          where('postId', '==', postId),
          orderBy('createdAt', 'asc'),
          limit(COMMENTS_PER_PAGE)
        );
  }

  static async createReply(replyData: Omit<Comment, 'id' | 'createdAt' | 'likes' | 'likeCount' | 'replies' | 'replyCount'>) {
    const replyRef = await collection(db, 'groupPostComments').add({
      ...replyData,
      createdAt: serverTimestamp(),
      likes: [],
      likeCount: 0,
      replies: [],
      replyCount: 0
    });

    // Update parent comment's reply count
    if (replyData.parentCommentId) {
      const parentCommentRef = doc(db, 'groupPostComments', replyData.parentCommentId);
      await updateDoc(parentCommentRef, {
        replyCount: increment(1)
      });
    }

    return replyRef.id;
  }

  static async toggleCommentLike(commentId: string, userId: string): Promise<boolean> {
    try {
      const commentRef = doc(db, 'groupPostComments', commentId);
      const commentDoc = await getDoc(commentRef);
      
      if (!commentDoc.exists()) {
        throw new Error('Comment not found');
      }

      const commentData = commentDoc.data();
      const likes = commentData.likes || [];
      const isLiked = likes.includes(userId);

      await updateDoc(commentRef, {
        likes: isLiked ? arrayRemove(userId) : arrayUnion(userId),
        likeCount: increment(isLiked ? -1 : 1)
      });

      return !isLiked;
    } catch (error) {
      console.error('Error toggling comment like:', error);
      throw error;
    }
  }
}