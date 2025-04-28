import { db } from '@/config/firebaseConfig';
import {
  collection,
  addDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
  serverTimestamp,
  deleteDoc,
  or,
} from 'firebase/firestore';

// Send a connection request
export const sendConnectionRequest = async (fromId: string, toId: string) => {
  // Prevent duplicate requests
  const q = query(
    collection(db, 'connectionRequests'),
    where('from', '==', fromId),
    where('to', '==', toId),
    where('status', '==', 'pending')
  );
  const existing = await getDocs(q);
  if (!existing.empty) throw new Error('Request already sent');

  await addDoc(collection(db, 'connectionRequests'), {
    from: fromId,
    to: toId,
    status: 'pending',
    createdAt: serverTimestamp(),
  });
};

// Accept a connection request
export const acceptConnectionRequest = async (requestId: string) => {
  const requestRef = doc(db, 'connectionRequests', requestId);
  const requestSnap = await getDoc(requestRef);
  if (!requestSnap.exists()) throw new Error('Request not found');
  const { from, to } = requestSnap.data();

  // Add to connections (bi-directional)
  await addDoc(collection(db, 'connections'), {
    users: [from, to],
    createdAt: serverTimestamp(),
  });

  // Update request status
  await updateDoc(requestRef, { status: 'accepted', updatedAt: serverTimestamp() });
};

// Reject a connection request
export const rejectConnectionRequest = async (requestId: string) => {
  const requestRef = doc(db, 'connectionRequests', requestId);
  await updateDoc(requestRef, { status: 'rejected', updatedAt: serverTimestamp() });
};

// Get all accepted connections for a user
export const getConnections = async (userId: string) => {
  const q = query(collection(db, 'connections'), where('users', 'array-contains', userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Get all incoming connection requests for a user
export const getIncomingRequests = async (userId: string) => {
  const q = query(
    collection(db, 'connectionRequests'),
    where('to', '==', userId),
    where('status', '==', 'pending')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Get all outgoing connection requests for a user
export const getOutgoingRequests = async (userId: string) => {
  const q = query(
    collection(db, 'connectionRequests'),
    where('from', '==', userId),
    where('status', '==', 'pending')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Check if two users are already connected
export const areUsersConnected = async (userA: string, userB: string) => {
  const q = query(
    collection(db, 'connections'),
    where('users', 'array-contains', userA)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.some(doc => (doc.data().users as string[]).includes(userB));
};

// Check if a pending request exists between two users
export const hasPendingRequest = async (userA: string, userB: string) => {
  // Check A -> B
  const q1 = query(
    collection(db, 'connectionRequests'),
    where('from', '==', userA),
    where('to', '==', userB),
    where('status', '==', 'pending')
  );
  const snap1 = await getDocs(q1);

  // Check B -> A
  const q2 = query(
    collection(db, 'connectionRequests'),
    where('from', '==', userB),
    where('to', '==', userA),
    where('status', '==', 'pending')
  );
  const snap2 = await getDocs(q2);

  return !snap1.empty || !snap2.empty;
}; 