import { db } from '@/config/firebaseConfig';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc,
  getDocs,
  query,
  orderBy,
  where,
  serverTimestamp,
  Timestamp,
  increment,
  onSnapshot,
  setDoc
} from 'firebase/firestore';

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  date: string;
  author: {
    name: string;
    avatar: string;
  };
  imageUrl: string;
  readTime: string;
  likes: number;
  comments: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface BlogComment {
  id: string;
  text: string;
  userId: string;
  userName: string;
  userAvatar: string;
  createdAt: Timestamp;
}

export class BlogService {
  static async createPost(postData: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>) {
    const postsRef = collection(db, 'blogPosts');
    const newPost = {
      ...postData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    const docRef = await addDoc(postsRef, newPost);
    return { id: docRef.id, ...newPost };
  }

  static async getPost(id: string) {
    const postRef = doc(db, 'blogPosts', id);
    const postSnap = await getDoc(postRef);
    if (!postSnap.exists()) {
      throw new Error('Post not found');
    }
    return { id: postSnap.id, ...postSnap.data() } as BlogPost;
  }

  static async getPosts() {
    const postsRef = collection(db, 'blogPosts');
    const q = query(postsRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as BlogPost[];
  }

  static async updatePost(id: string, postData: Partial<BlogPost>) {
    const postRef = doc(db, 'blogPosts', id);
    await updateDoc(postRef, {
      ...postData,
      updatedAt: serverTimestamp()
    });
  }

  static async deletePost(id: string) {
    const postRef = doc(db, 'blogPosts', id);
    await deleteDoc(postRef);
  }

  static async getPostsByCategory(category: string) {
    const postsRef = collection(db, 'blogPosts');
    const q = query(
      postsRef,
      where('category', '==', category),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as BlogPost[];
  }

  static async incrementLikes(id: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'blogPosts', id), {
        likes: increment(1)
      });
    } catch (error) {
      console.error('Error incrementing likes:', error);
      throw error;
    }
  }

  static async incrementComments(id: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'blogPosts', id), {
        comments: increment(1)
      });
    } catch (error) {
      console.error('Error incrementing comments:', error);
      throw error;
    }
  }

  // Likes (one per user)
  static async like(postId: string, userId: string, liked: boolean) {
    const likeRef = doc(db, 'blogPosts', postId, 'likes', userId);
    if (liked) {
      await setDoc(likeRef, { liked: true }, { merge: true });
    } else {
      await deleteDoc(likeRef);
    }
  }

  static listenLikes(postId: string, callback: (total: number, userLiked: boolean) => void, userId: string) {
    return onSnapshot(collection(db, 'blogPosts', postId, 'likes'), snap => {
      let total = 0;
      let userLiked = false;
      snap.forEach(doc => {
        if (doc.data().liked) {
          total++;
          if (doc.id === userId) userLiked = true;
        }
      });
      callback(total, userLiked);
    });
  }

  // Comments
  static async addComment(postId: string, comment: Omit<BlogComment, 'id' | 'createdAt'>) {
    const commentsRef = collection(db, 'blogPosts', postId, 'comments');
    const docRef = await addDoc(commentsRef, {
      ...comment,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  }

  static async editComment(postId: string, commentId: string, text: string) {
    const commentRef = doc(db, 'blogPosts', postId, 'comments', commentId);
    await updateDoc(commentRef, { text });
  }

  static async deleteComment(postId: string, commentId: string) {
    const commentRef = doc(db, 'blogPosts', postId, 'comments', commentId);
    await deleteDoc(commentRef);
  }

  static listenComments(postId: string, callback: (comments: BlogComment[]) => void) {
    return onSnapshot(query(collection(db, 'blogPosts', postId, 'comments'), orderBy('createdAt', 'asc')), snap => {
      const comments: BlogComment[] = [];
      snap.forEach(doc => {
        comments.push({ id: doc.id, ...doc.data() } as BlogComment);
      });
      callback(comments);
    });
  }
} 