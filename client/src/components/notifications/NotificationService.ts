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
    console.log('Creating notification:', data);
    const docRef = await addDoc(collection(db, 'notifications'), {
      ...data,
      read: false,
      createdAt: serverTimestamp()
    });
    console.log('Notification created successfully with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

export const markNotificationAsRead = async (notificationId: string) => {
  try {
    console.log('Marking notification as read:', notificationId);
    const notificationRef = doc(db, 'notifications', notificationId);
    await updateDoc(notificationRef, {
      read: true,
      updatedAt: serverTimestamp()
    });
    console.log('Notification marked as read successfully');
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

export const deleteNotification = async (notificationId: string) => {
  try {
    console.log('Deleting notification:', notificationId);
    await deleteDoc(doc(db, 'notifications', notificationId));
    console.log('Notification deleted successfully');
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

export const getUnreadNotificationsCount = async (userId: string) => {
  try {
    console.log('Getting unread notifications count for user:', userId);
    const q = query(
      collection(db, 'notifications'),
      where('recipientId', '==', userId),
      where('read', '==', false)
    );
    const snapshot = await getDocs(q);
    console.log('Unread notifications count:', snapshot.size);
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
  try {
    console.log('Creating group join request notification:', {
      groupOwnerId,
      requesterId,
      requesterName,
      groupId,
      groupName
    });
    await createNotification({
      recipientId: groupOwnerId,
      senderId: requesterId,
      type: 'GROUP_JOIN_REQUEST',
      groupId,
      groupName,
      message: `${requesterName} wants to join your group "${groupName}"`
    });
    console.log('Group join request notification created successfully');
  } catch (error) {
    console.error('Error creating group join request notification:', error);
    throw error;
  }
};

export const createGroupJoinResponseNotification = async (
  requesterId: string,
  groupOwnerId: string,
  groupId: string,
  groupName: string,
  accepted: boolean
) => {
  try {
    console.log('Creating group join response notification:', {
      requesterId,
      groupOwnerId,
      groupId,
      groupName,
      accepted
    });
    await createNotification({
      recipientId: requesterId,
      senderId: groupOwnerId,
      type: accepted ? 'GROUP_JOIN_ACCEPTED' : 'GROUP_JOIN_REJECTED',
      groupId,
      groupName,
      message: `Your request to join "${groupName}" has been ${accepted ? 'accepted' : 'rejected'}`
    });
    console.log('Group join response notification created successfully');
  } catch (error) {
    console.error('Error creating group join response notification:', error);
    throw error;
  }
}; 