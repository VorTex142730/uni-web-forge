import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  DocumentReference,
} from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';

export interface Forum {
  id: string;
  title: string;
  description?: string;
  isPrivate: boolean;
  createdAt: Date;
  updatedAt: Date;
  memberCount: number;
  createdBy: string;
  members: string[];
}

export interface ForumMember {
  id: string;
  userId: string;
  forumId: string;
  role: 'admin' | 'moderator' | 'member';
  joinedAt: Date;
  displayName: string;
  photoURL?: string;
}

// Create a new forum
export const createForum = async (data: Omit<Forum, 'id' | 'createdAt' | 'updatedAt' | 'memberCount' | 'createdBy' | 'members'>) => {
  if (!auth.currentUser) throw new Error('Must be logged in to create a forum');

  const forumData = {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    memberCount: 1,
    createdBy: auth.currentUser.uid,
    members: [auth.currentUser.uid],
  };

  const forumRef = await addDoc(collection(db, 'forums'), forumData);
  
  // Add creator as admin member
  await addDoc(collection(db, 'forumMembers'), {
    userId: auth.currentUser.uid,
    forumId: forumRef.id,
    role: 'admin',
    joinedAt: serverTimestamp(),
    displayName: auth.currentUser.displayName || 'Anonymous',
    photoURL: auth.currentUser.photoURL,
  });

  return forumRef;
};

// Get all forums
export const getForums = async () => {
  const forumsSnap = await getDocs(collection(db, 'forums'));
  return forumsSnap.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as Forum[];
};

// Get a single forum by ID
export const getForum = async (forumId: string) => {
  const forumDoc = await getDoc(doc(db, 'forums', forumId));
  
  if (!forumDoc.exists()) {
    throw new Error('Forum not found');
  }
  
  const forumData = forumDoc.data();
  return { 
    id: forumDoc.id, 
    ...forumData,
    createdAt: forumData?.createdAt?.toDate(),
    updatedAt: forumData?.updatedAt?.toDate(),
  } as Forum;
};

// Get forum members
export const getForumMembers = async (forumId: string) => {
  const membersSnap = await getDocs(
    query(collection(db, 'forumMembers'), where('forumId', '==', forumId))
  );
  return membersSnap.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as ForumMember[];
};

// Join a forum
export const joinForum = async (forumId: string) => {
  if (!auth.currentUser) throw new Error('Must be logged in to join a forum');

  const forumRef = doc(db, 'forums', forumId);
  const forumDoc = await getDoc(forumRef);
  
  if (!forumDoc.exists()) throw new Error('Forum not found');
  
  const forumData = forumDoc.data() as Forum;
  
  // Check if user is already a member
  if (forumData.members.includes(auth.currentUser.uid)) {
    throw new Error('Already a member of this forum');
  }

  // Add user to forum members
  await updateDoc(forumRef, {
    members: [...forumData.members, auth.currentUser.uid],
    memberCount: forumData.memberCount + 1,
    updatedAt: serverTimestamp(),
  });

  // Add member record
  await addDoc(collection(db, 'forumMembers'), {
    userId: auth.currentUser.uid,
    forumId: forumId,
    role: 'member',
    joinedAt: serverTimestamp(),
    displayName: auth.currentUser.displayName || 'Anonymous',
    photoURL: auth.currentUser.photoURL,
  });
};

// Leave a forum
export const leaveForum = async (forumId: string) => {
  if (!auth.currentUser) throw new Error('Must be logged in to leave a forum');

  const forumRef = doc(db, 'forums', forumId);
  const forumDoc = await getDoc(forumRef);
  
  if (!forumDoc.exists()) throw new Error('Forum not found');
  
  const forumData = forumDoc.data() as Forum;
  
  // Check if user is a member
  if (!forumData.members.includes(auth.currentUser.uid)) {
    throw new Error('Not a member of this forum');
  }

  // Remove user from forum members
  await updateDoc(forumRef, {
    members: forumData.members.filter(id => id !== auth.currentUser.uid),
    memberCount: forumData.memberCount - 1,
    updatedAt: serverTimestamp(),
  });

  // Remove member record
  const memberQuery = query(
    collection(db, 'forumMembers'),
    where('forumId', '==', forumId),
    where('userId', '==', auth.currentUser.uid)
  );
  
  const memberDocs = await getDocs(memberQuery);
  memberDocs.forEach(async (doc) => {
    await deleteDoc(doc.ref);
  });
};

// Delete a forum
export const deleteForum = async (forumId: string) => {
  if (!auth.currentUser) throw new Error('Must be logged in to delete a forum');

  const forumRef = doc(db, 'forums', forumId);
  const forumDoc = await getDoc(forumRef);
  
  if (!forumDoc.exists()) throw new Error('Forum not found');
  
  const forumData = forumDoc.data() as Forum;
  
  // Check if user is the creator
  if (forumData.createdBy !== auth.currentUser.uid) {
    throw new Error('Only the forum creator can delete it');
  }

  // Delete all forum members
  const membersQuery = query(
    collection(db, 'forumMembers'),
    where('forumId', '==', forumId)
  );
  
  const memberDocs = await getDocs(membersQuery);
  memberDocs.forEach(async (doc) => {
    await deleteDoc(doc.ref);
  });

  // Delete the forum
  await deleteDoc(forumRef);
}; 