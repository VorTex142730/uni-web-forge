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
} from 'firebase/firestore';

// Send a connection request (writes to recipient's subcollection)
export const sendConnectionRequest = async (fromId: string, toId: string) => {
  // Prevent duplicate requests
  const q = query(
    collection(db, 'users', toId, 'connectionRequests'),
    where('from', '==', fromId),
    where('status', '==', 'pending')
  );
  const existing = await getDocs(q);
  if (!existing.empty) throw new Error('Request already sent');

  await addDoc(collection(db, 'users', toId, 'connectionRequests'), {
    from: fromId,
    status: 'pending',
    createdAt: serverTimestamp(),
  });
};

// Accept a connection request (writes to both users' connections subcollections)
export const acceptConnectionRequest = async (userId: string, requestId: string) => {
  const requestRef = doc(db, 'users', userId, 'connectionRequests', requestId);
  const requestSnap = await getDoc(requestRef);
  if (!requestSnap.exists()) throw new Error('Request not found');
  const { from } = requestSnap.data();

  // Add to both users' connections subcollections
  await addDoc(collection(db, 'users', userId, 'connections'), {
    otherUserId: from,
    createdAt: serverTimestamp(),
  });
  await addDoc(collection(db, 'users', from, 'connections'), {
    otherUserId: userId,
    createdAt: serverTimestamp(),
  });

  // Update request status
  await updateDoc(requestRef, { status: 'accepted', updatedAt: serverTimestamp() });
};

// Reject a connection request
export const rejectConnectionRequest = async (userId: string, requestId: string) => {
  const requestRef = doc(db, 'users', userId, 'connectionRequests', requestId);
  await updateDoc(requestRef, { status: 'rejected', updatedAt: serverTimestamp() });
};

// Get all accepted connections for a user
export const getConnections = async (userId: string) => {
  const q = query(collection(db, 'users', userId, 'connections'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Get all incoming connection requests for a user
export const getIncomingRequests = async (userId: string) => {
  const q = query(
    collection(db, 'users', userId, 'connectionRequests'),
    where('status', '==', 'pending')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Get all outgoing connection requests for a user
export const getOutgoingRequests = async (userId: string) => {
  // Outgoing requests are those where the user is the sender (from)
  // Need to scan all users' connectionRequests subcollections
  // For efficiency, you may want to index or cache this in production
  // Here, we scan all users (not scalable for huge user base, but works for demo)
  // In production, consider a cloud function or denormalized data
  const usersSnapshot = await getDocs(collection(db, 'users'));
  let outgoing: any[] = [];
  for (const userDoc of usersSnapshot.docs) {
    const reqsSnapshot = await getDocs(collection(db, 'users', userDoc.id, 'connectionRequests'));
    reqsSnapshot.forEach(reqDoc => {
      const data = reqDoc.data();
      if (data.from === userId && data.status === 'pending') {
        outgoing.push({ id: reqDoc.id, ...data, to: userDoc.id });
      }
    });
  }
  return outgoing;
};

// Check if two users are already connected
export const areUsersConnected = async (userA: string, userB: string) => {
  const q = query(collection(db, 'users', userA, 'connections'), where('otherUserId', '==', userB));
  const snapshot = await getDocs(q);
  return !snapshot.empty;
};

// Check if a pending request exists between two users
export const hasPendingRequest = async (userA: string, userB: string) => {
  // Check A -> B (outgoing)
  const q1 = query(
    collection(db, 'users', userB, 'connectionRequests'),
    where('from', '==', userA),
    where('status', '==', 'pending')
  );
  const snap1 = await getDocs(q1);
  // Check B -> A (incoming)
  const q2 = query(
    collection(db, 'users', userA, 'connectionRequests'),
    where('from', '==', userB),
    where('status', '==', 'pending')
  );
  const snap2 = await getDocs(q2);
  return !snap1.empty || !snap2.empty;
};

// Fetch user details by user ID
export const getUserDetailsById = async (userId: string) => {
  const userDoc = await getDoc(doc(db, 'users', userId));
  if (!userDoc.exists()) return null;
  return { id: userDoc.id, ...userDoc.data() };
}; 