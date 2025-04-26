import React, { useEffect, useState } from 'react';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Bell, UserPlus, Check, X, Users } from 'lucide-react';

interface Notification {
  id: string;
  type: 'GROUP_JOIN_REQUEST' | 'GROUP_JOIN_ACCEPTED' | 'GROUP_JOIN_REJECTED' | 'OTHER';
  recipientId: string;
  senderId: string;
  message: string;
  read: boolean;
  createdAt: Timestamp;
  groupId?: string;
  groupName?: string;
  senderName?: string;
  senderPhoto?: string;
}

const NotificationList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('recipientId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
      const notificationData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Notification[];
      setNotifications(notificationData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const markAsRead = async (notificationId: string) => {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, {
        read: true
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    
    if (notification.type === 'GROUP_JOIN_REQUEST' && notification.groupId) {
      navigate(`/groups/${notification.groupId}?tab=requests`);
    } else if (
      (notification.type === 'GROUP_JOIN_ACCEPTED' || 
       notification.type === 'GROUP_JOIN_REJECTED') && 
      notification.groupId
    ) {
      navigate(`/groups/${notification.groupId}`);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'GROUP_JOIN_REQUEST':
        return <UserPlus className="text-blue-500" size={20} />;
      case 'GROUP_JOIN_ACCEPTED':
        return <Check className="text-green-500" size={20} />;
      case 'GROUP_JOIN_REJECTED':
        return <X className="text-red-500" size={20} />;
      default:
        return <Bell className="text-gray-500" size={20} />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-2xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Notifications</h2>
        {notifications.some(n => !n.read) && (
          <Button
            variant="outline"
            onClick={async () => {
              const unreadNotifications = notifications.filter(n => !n.read);
              for (const notification of unreadNotifications) {
                await markAsRead(notification.id);
              }
            }}
          >
            Mark all as read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No notifications</h3>
          <p className="mt-1 text-sm text-gray-500">You're all caught up!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`flex items-start gap-4 p-4 rounded-lg cursor-pointer transition-colors ${
                notification.read 
                  ? 'bg-white hover:bg-gray-50' 
                  : 'bg-blue-50 hover:bg-blue-100'
              }`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="flex-shrink-0">
                {getNotificationIcon(notification.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${notification.read ? 'text-gray-900' : 'text-blue-900 font-medium'}`}>
                  {notification.message}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {notification.createdAt?.toDate().toLocaleDateString()} at{' '}
                  {notification.createdAt?.toDate().toLocaleTimeString()}
                </p>
              </div>
              {!notification.read && (
                <div className="flex-shrink-0">
                  <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationList; 