import { db } from '@/config/firebaseConfig';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  arrayUnion, 
  arrayRemove,
  increment,
  serverTimestamp,
  getDoc,
  query,
  where,
  getDocs
} from 'firebase/firestore';

export interface Post {
  id: string;
  content: string;
  authorId: string;
  createdAt: string;
  likes: number;
  likedBy: string[];
  comments: Comment[];
  image?: string;
  groupId?: string;
}

export interface Comment {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  createdAt: string;
}

// Create a new post
export const createPost = async (postData: Omit<Post, 'id' | 'createdAt' | 'likes' | 'likedBy' | 'comments'>) => {
  try {
    const postRef = await addDoc(collection(db, 'posts'), {
      ...postData,
      createdAt: serverTimestamp(),
      likes: 0,
      likedBy: [],
      comments: []
    });
    return postRef.id;
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
};

// Like a post
export const likePost = async (postId: string, userId: string) => {
  try {
    const postRef = doc(db, 'posts', postId);
    const postDoc = await getDoc(postRef);
    
    if (!postDoc.exists()) {
      throw new Error('Post not found');
    }

    const postData = postDoc.data();
    const isLiked = postData.likedBy.includes(userId);

    if (isLiked) {
      // Unlike
      await updateDoc(postRef, {
        likes: increment(-1),
        likedBy: arrayRemove(userId)
      });
    } else {
      // Like
      await updateDoc(postRef, {
        likes: increment(1),
        likedBy: arrayUnion(userId)
      });
    }

    return !isLiked;
  } catch (error) {
    console.error('Error liking post:', error);
    throw error;
  }
};

// Add a comment to a post
export const addComment = async (postId: string, commentData: Omit<Comment, 'id' | 'createdAt'>) => {
  try {
    const postRef = doc(db, 'posts', postId);
    const comment = {
      id: Date.now().toString(),
      ...commentData,
      createdAt: serverTimestamp()
    };

    await updateDoc(postRef, {
      comments: arrayUnion(comment)
    });

    return comment;
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
};

// Edit a post
export const editPost = async (postId: string, newContent: string) => {
  try {
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      content: newContent
    });
  } catch (error) {
    console.error('Error editing post:', error);
    throw error;
  }
};

// Delete a post
export const deletePost = async (postId: string) => {
  try {
    const postRef = doc(db, 'posts', postId);
    await deleteDoc(postRef);
  } catch (error) {
    console.error('Error deleting post:', error);
    throw error;
  }
};

// Get all posts
export const getPosts = async () => {
  try {
    const postsQuery = query(collection(db, 'posts'));
    const querySnapshot = await getDocs(postsQuery);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Post[];
  } catch (error) {
    console.error('Error getting posts:', error);
    throw error;
  }
};

// Get posts by user
export const getUserPosts = async (userId: string) => {
  try {
    const postsQuery = query(
      collection(db, 'posts'),
      where('authorId', '==', userId)
    );
    const querySnapshot = await getDocs(postsQuery);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Post[];
  } catch (error) {
    console.error('Error getting user posts:', error);
    throw error;
  }
}; 