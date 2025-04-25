import { collection, addDoc, query, where, getDocs, updateDoc, doc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';

export interface NotificationData {
  recipientId: string;
  senderId: string;
  type: 'GROUP_JOIN_REQUEST' | 'GROUP_JOIN_ACCEPTED' | 'GROUP_JOIN_REJECTED' | 'GROUP_ROLE_UPDATED';
  groupId?: string;
  groupName?: string;
  message: string;
  read: boolean;
  createdAt: any;
}

export const createNotification = async (data: Omit<NotificationData, 'createdAt' | 'read'>) => {
  try {
    await addDoc(collection(db, 'notifications'), {
      ...data,
      read: false,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

export const markNotificationAsRead = async (notificationId: string) => {
  try {
    const notificationRef = doc(db, 'notifications', notificationId);
    await updateDoc(notificationRef, {
      read: true
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

export const deleteNotification = async (notificationId: string) => {
  try {
    await deleteDoc(doc(db, 'notifications', notificationId));
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

export const getUnreadNotificationsCount = async (userId: string) => {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('recipientId', '==', userId),
      where('read', '==', false)
    );
    const snapshot = await getDocs(q);
    return snapshot.size;
  } catch (error) {
    console.error('Error getting unread notifications count:', error);
    throw error;
  }
};

export const createGroupJoinRequestNotification = async (
  groupOwnerId: string,
  requesterId: string,
  requesterName: string,
  groupId: string,
  groupName: string
) => {
  await createNotification({
    recipientId: groupOwnerId,
    senderId: requesterId,
    type: 'GROUP_JOIN_REQUEST',
    groupId,
    groupName,
    message: `${requesterName} wants to join your group "${groupName}"`
  });
};

export const createGroupJoinResponseNotification = async (
  requesterId: string,
  groupOwnerId: string,
  groupId: string,
  groupName: string,
  accepted: boolean
) => {
  await createNotification({
    recipientId: requesterId,
    senderId: groupOwnerId,
    type: accepted ? 'GROUP_JOIN_ACCEPTED' : 'GROUP_JOIN_REJECTED',
    groupId,
    groupName,
    message: `Your request to join "${groupName}" has been ${accepted ? 'accepted' : 'rejected'}`
  });
}; 