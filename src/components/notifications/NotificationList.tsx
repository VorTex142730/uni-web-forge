import React, { useEffect, useState } from 'react';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, Timestamp, deleteDoc } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Bell, UserPlus, Check, X, Users, Trash2, Eye, EyeOff } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from '@/components/ui/use-toast';

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
  const [removingId, setRemovingId] = useState<string | null>(null);

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

  const deleteNotification = async (notificationId: string) => {
    setRemovingId(notificationId);
    try {
      await deleteDoc(doc(db, 'notifications', notificationId));
      toast({ title: 'Notification deleted' });
    } catch (error) {
      toast({ title: 'Error deleting notification', description: String(error), variant: 'destructive' });
    } finally {
      setRemovingId(null);
    }
  };

  const markAsUnread = async (notificationId: string) => {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, { read: false });
      toast({ title: 'Marked as unread' });
    } catch (error) {
      toast({ title: 'Error', description: String(error), variant: 'destructive' });
    }
  };

  const deleteAllNotifications = async () => {
    if (!window.confirm('Delete all notifications? This cannot be undone.')) return;
    try {
      for (const n of notifications) {
        await deleteDoc(doc(db, 'notifications', n.id));
      }
      toast({ title: 'All notifications deleted' });
    } catch (error) {
      toast({ title: 'Error deleting all notifications', description: String(error), variant: 'destructive' });
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
    <div className="max-w-3xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-medium text-gray-900">Notifications</h2>
        <div className="flex gap-2">
          {notifications.some(n => !n.read) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                const unreadNotifications = notifications.filter(n => !n.read);
                for (const notification of unreadNotifications) {
                  await markAsRead(notification.id);
                }
                toast({ title: 'All marked as read' });
              }}
              title="Mark all as read"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Mark all as read
            </Button>
          )}
          {notifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={deleteAllNotifications}
              title="Delete all notifications"
              className="text-sm text-red-600 hover:text-red-700"
            >
              Clear all
            </Button>
          )}
        </div>
      </div>
      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <Bell size={32} className="mb-3" />
          <div className="text-sm font-medium">You're all caught up!</div>
          <div className="text-xs">No notifications to show.</div>
        </div>
      ) : (
        <div className="space-y-1 bg-white rounded-lg border border-gray-100">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`flex items-center gap-3 px-4 py-3 transition-all duration-200 cursor-pointer group ${
                notification.read ? 'bg-white' : 'bg-blue-50/50'
              } hover:bg-gray-50 ${
                removingId === notification.id ? 'opacity-0 scale-95 pointer-events-none' : ''
              }`}
              onClick={() => handleNotificationClick(notification)}
              tabIndex={0}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleNotificationClick(notification); }}
              aria-label={notification.message}
            >
              <div className="flex-shrink-0">
                {getNotificationIcon(notification.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className={`text-sm ${!notification.read ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
                  {notification.message}
                </div>
                <div className="text-xs text-gray-400 mt-0.5">
                  {formatDistanceToNow(notification.createdAt?.toDate ? notification.createdAt.toDate() : new Date(), { addSuffix: true })}
                </div>
              </div>
              <div className="flex gap-1 items-center opacity-0 group-hover:opacity-100 transition-opacity">
                {notification.read ? (
                  <button
                    className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                    onClick={e => { e.stopPropagation(); markAsUnread(notification.id); }}
                    title="Mark as unread"
                    aria-label="Mark as unread"
                  >
                    <EyeOff className="w-4 h-4 text-gray-400" />
                  </button>
                ) : (
                  <button
                    className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                    onClick={e => { e.stopPropagation(); markAsRead(notification.id); }}
                    title="Mark as read"
                    aria-label="Mark as read"
                  >
                    <Check className="w-4 h-4 text-gray-400" />
                  </button>
                )}
                <button
                  className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                  onClick={e => { e.stopPropagation(); deleteNotification(notification.id); }}
                  title="Delete notification"
                  aria-label="Delete notification"
                >
                  <Trash2 className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationList; 