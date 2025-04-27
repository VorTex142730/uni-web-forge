import { db } from '../config/firebaseConfig';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  doc, 
  getDoc, 
  updateDoc, 
  serverTimestamp, 
  getDocs, 
  DocumentData,
  setDoc // Ensure setDoc is imported
} from 'firebase/firestore';

export interface Message {
  id: string;
  text: string;
  senderId: string;
  senderName?: string;
  senderPhotoURL?: string;
  createdAt: {
    seconds: number;
    nanoseconds: number;
  };
}

export interface Chat {
  id: string;
  participants: string[];
  participantNames?: Record<string, string>;
  participantPhotos?: Record<string, string>;
  lastMessage?: string;
  lastMessageDate?: {
    seconds: number;
    nanoseconds: number;
  };
}

export interface ChatUser {
  id: string;
  displayName: string;
  photoURL?: string;
  email?: string;
}

// Fetch all chats for a user
export const getUserChats = (userId: string, callback: (chats: Chat[]) => void) => {
  const q = query(
    collection(db, "chats"),
    where("participants", "array-contains", userId)
  );

  return onSnapshot(q, async (querySnapshot) => {
    const chatList: Chat[] = [];
    
    const chatPromises = querySnapshot.docs.map(async (docSnapshot) => {
      const chatData = docSnapshot.data();
      const chat: Chat = { 
        id: docSnapshot.id, 
        participants: chatData.participants,
        participantNames: chatData.participantNames || {},
        participantPhotos: chatData.participantPhotos || {},
        lastMessage: chatData.lastMessage,
        lastMessageDate: chatData.lastMessageDate
      };
      
      return chat;
    });
    
    const resolvedChats = await Promise.all(chatPromises);
    callback(resolvedChats);
  });
};

// Get or create a chat between two users
export const getOrCreateChat = async (currentUserId: string, otherUserId: string) => {
  const user1Ref = doc(db, 'users', currentUserId);
  const user2Ref = doc(db, 'users', otherUserId);

  // Check if both users exist
  const [user1Snap, user2Snap] = await Promise.all([
    getDoc(user1Ref),
    getDoc(user2Ref)
  ]);

  if (!user1Snap.exists() || !user2Snap.exists()) {
    console.error('Missing users:', {
      user1Exists: user1Snap.exists(),
      user2Exists: user2Snap.exists(),
      currentUserId,
      otherUserId
    });
    throw new Error('One or both users do not exist');
  }

  const chatId = [currentUserId, otherUserId].sort().join('_');
  const chatRef = doc(db, 'chats', chatId);
  const chatDoc = await getDoc(chatRef);

  if (!chatDoc.exists()) {
    await setDoc(chatRef, {
      participants: [currentUserId, otherUserId],
      createdAt: serverTimestamp()
    });
  }

  return chatId;
};

// Get chat messages
export const getChatMessages = (chatId: string, callback: (messages: Message[]) => void) => {
  const q = query(
    collection(db, `chats/${chatId}/messages`),
    orderBy("createdAt", "asc")
  );

  return onSnapshot(q, (querySnapshot) => {
    const messageList: Message[] = [];
    querySnapshot.forEach((doc) => {
      messageList.push({ id: doc.id, ...doc.data() } as Message);
    });
    callback(messageList);
  });
};

// Send a message
export const sendMessage = async (
  chatId: string, 
  senderId: string, 
  text: string, 
  senderName?: string,
  senderPhotoURL?: string
) => {
  try {
    // Add message to the chat
    await addDoc(collection(db, `chats/${chatId}/messages`), {
      text,
      senderId,
      senderName,
      senderPhotoURL,
      createdAt: serverTimestamp()
    });

    // Update last message in chat document
    const chatRef = doc(db, "chats", chatId);
    await updateDoc(chatRef, {
      lastMessage: text,
      lastMessageDate: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error("Error sending message:", error);
    return false;
  }
};

// Get all users for chat
export const getAllUsers = async (currentUserId: string): Promise<ChatUser[]> => {
  try {
    const usersSnapshot = await getDocs(collection(db, "users"));
    const users: ChatUser[] = [];
    
    usersSnapshot.forEach((doc) => {
      // Exclude current user
      if (doc.id !== currentUserId) {
        const userData = doc.data();
        users.push({
          id: doc.id,
          displayName: userData.displayName || userData.email,
          photoURL: userData.photoURL,
          email: userData.email
        });
      }
    });
    
    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
};

// Check if chat exists between users
export const checkChatExists = async (userId1: string, userId2: string): Promise<string | null> => {
  const chatId = [userId1, userId2].sort().join('_');
  const chatRef = doc(db, "chats", chatId);
  const chatDoc = await getDoc(chatRef);
  
  return chatDoc.exists() ? chatId : null;
};