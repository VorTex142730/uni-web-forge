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
  orderBy,
  setDoc,
} from 'firebase/firestore';

// Send a connection request
export const sendConnectionRequest = async (fromId: string, toId: string) => {
  // Check if users are already connected
  const alreadyConnected = await areUsersConnected(fromId, toId);
  if (alreadyConnected) throw new Error('Users are already connected');

  // Check for existing requests in both directions
  const existingRequests = await hasPendingRequest(fromId, toId);
  if (existingRequests) throw new Error('A connection request already exists');

  // Create a unique ID for the request to avoid duplicates
  const requestId = `${fromId}_${toId}`;
  
  // Create new request with a fixed ID for easier querying
  await setDoc(doc(db, 'connectionRequests', requestId), {
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
  
  if (!requestSnap.exists()) {
    throw new Error('Request not found');
  }

  const requestData = requestSnap.data();
  const { from, to, status } = requestData;

  // Check if request is already processed
  if (status !== 'pending') {
    throw new Error('Request has already been processed');
  }

  // Check if users are already connected
  const alreadyConnected = await areUsersConnected(from, to);
  if (alreadyConnected) {
    // Update request status to accepted even though they're already connected
    await updateDoc(requestRef, { 
      status: 'accepted', 
      updatedAt: serverTimestamp() 
    });
    return;
  }

  // Create a unique ID for the connection to avoid duplicates
  const connectionId = [from, to].sort().join('_');
  
  // Create the connection with a fixed ID for easier querying
  await setDoc(doc(db, 'connections', connectionId), {
    user1: from,
    user2: to,
    createdAt: serverTimestamp(),
  });

  // Update request status
  await updateDoc(requestRef, { 
    status: 'accepted', 
    updatedAt: serverTimestamp() 
  });
};

// Reject a connection request
export const rejectConnectionRequest = async (requestId: string) => {
  const requestRef = doc(db, 'connectionRequests', requestId);
  const requestSnap = await getDoc(requestRef);
  
  if (!requestSnap.exists()) {
    throw new Error('Request not found');
  }

  const { status } = requestSnap.data();
  
  // Check if request is already processed
  if (status !== 'pending') {
    throw new Error('Request has already been processed');
  }

  await updateDoc(requestRef, { 
    status: 'rejected', 
    updatedAt: serverTimestamp() 
  });
};

// Get all accepted connections for a user
export const getConnections = async (userId: string) => {
  // Query for connections where the user is either user1 or user2
  const q1 = query(
    collection(db, 'connections'), 
    where('user1', '==', userId)
  );
  
  const q2 = query(
    collection(db, 'connections'), 
    where('user2', '==', userId)
  );
  
  const [snapshot1, snapshot2] = await Promise.all([
    getDocs(q1),
    getDocs(q2)
  ]);
  
  // Combine and sort the results
  const allConnections = [
    ...snapshot1.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || new Date()
    })),
    ...snapshot2.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || new Date()
    }))
  ];
  
  // Sort by creation date (newest first)
  return allConnections.sort((a, b) => 
    b.createdAt.getTime() - a.createdAt.getTime()
  );
};

// Get all incoming connection requests for a user
export const getIncomingRequests = async (userId: string) => {
  // Query for requests where the user is the recipient
  const q = query(
    collection(db, 'connectionRequests'),
    where('to', '==', userId),
    where('status', '==', 'pending')
  );
  
  const snapshot = await getDocs(q);
  const requests = snapshot.docs.map(doc => ({ 
    id: doc.id, 
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate?.() || new Date()
  }));
  
  // Sort by creation date (newest first)
  return requests.sort((a, b) => 
    b.createdAt.getTime() - a.createdAt.getTime()
  );
};

// Get all outgoing connection requests for a user
export const getOutgoingRequests = async (userId: string) => {
  // Query for requests where the user is the sender
  const q = query(
    collection(db, 'connectionRequests'),
    where('from', '==', userId),
    where('status', '==', 'pending')
  );
  
  const snapshot = await getDocs(q);
  const requests = snapshot.docs.map(doc => ({ 
    id: doc.id, 
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate?.() || new Date()
  }));
  
  // Sort by creation date (newest first)
  return requests.sort((a, b) => 
    b.createdAt.getTime() - a.createdAt.getTime()
  );
};

// Check if two users are already connected
export const areUsersConnected = async (userA: string, userB: string) => {
  // Create a sorted connection ID to check if the connection exists
  const connectionId = [userA, userB].sort().join('_');
  const connectionRef = doc(db, 'connections', connectionId);
  const connectionSnap = await getDoc(connectionRef);
  
  return connectionSnap.exists();
};

// Check if a pending request exists between two users
export const hasPendingRequest = async (userA: string, userB: string) => {
  // Check A -> B
  const requestId1 = `${userA}_${userB}`;
  const requestRef1 = doc(db, 'connectionRequests', requestId1);
  const requestSnap1 = await getDoc(requestRef1);
  
  // Check B -> A
  const requestId2 = `${userB}_${userA}`;
  const requestRef2 = doc(db, 'connectionRequests', requestId2);
  const requestSnap2 = await getDoc(requestRef2);
  
  // Check if either request exists and is pending
  return (requestSnap1.exists() && requestSnap1.data().status === 'pending') || 
         (requestSnap2.exists() && requestSnap2.data().status === 'pending');
}; 