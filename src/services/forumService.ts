import { collection, getDocs, getDoc, doc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';

// Define the ForumThread interface
export interface ForumThread {
  id: string;
  title: string;
  author: {
    name: string;
    id: string;
  };
  createdAt: Timestamp | Date;
  category?: string;
  excerpt: string;
  imageUrl?: string;
  content: string;
}

export class ForumService {
  // Get all forum threads
  static async getThreads(): Promise<ForumThread[]> {
    try {
      const threadsCollection = collection(db, 'forumThreads');
      const threadsSnapshot = await getDocs(threadsCollection);
      const threads: ForumThread[] = threadsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as ForumThread));
      return threads;
    } catch (error) {
      console.error('Error fetching forum threads:', error);
      throw new Error('Unable to fetch forum threads');
    }
  }

  // Get a single forum thread by ID
  static async getThreadById(id: string): Promise<ForumThread | null> {
    try {
      const threadDoc = doc(db, 'forumThreads', id);
      const threadSnapshot = await getDoc(threadDoc);
      if (threadSnapshot.exists()) {
        return {
          id: threadSnapshot.id,
          ...threadSnapshot.data(),
        } as ForumThread;
      }
      return null;
    } catch (error) {
      console.error(`Error fetching forum thread with ID ${id}:`, error);
      throw new Error('Unable to fetch forum thread');
    }
  }

  // Create a new forum thread
  static async createThread(thread: ForumThread, user: { uid: string; displayName: string | null }): Promise<void> {
    try {
      const threadRef = doc(collection(db, 'forumThreads'));
      const threadData = {
        ...thread,
        id: threadRef.id,
        author: {
          name: user.displayName || "User",
          id: user.uid,
        },
        createdAt: thread.createdAt instanceof Date ? Timestamp.fromDate(thread.createdAt) : thread.createdAt,
      };
      await setDoc(threadRef, threadData);
    } catch (error) {
      console.error('Error creating forum thread:', error);
      throw new Error('Unable to create forum thread');
    }
  }
}