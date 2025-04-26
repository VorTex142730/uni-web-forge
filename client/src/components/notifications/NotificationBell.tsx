import React, { useEffect, useState } from 'react';
import { Bell, UserPlus, Check, X } from 'lucide-react';
import { collection, query, where, orderBy, onSnapshot, Timestamp, limit } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import { markNotificationAsRead } from './NotificationService';
import { NotificationData } from './NotificationService';

const NotificationBell = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<(NotificationData & { id: string })[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    // First, get unread notifications count
    const unreadQuery = query(
      collection(db, 'notifications'),
      where('recipientId', '==', user.uid),
      where('read', '==', false)
    );

    const unreadUnsubscribe = onSnapshot(unreadQuery, (snapshot) => {
      setUnreadCount(snapshot.size);
    });

    // Then, get recent notifications (limited to 5)
    const recentQuery = query(
      collection(db, 'notifications'),
      where('recipientId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(5)
    );

    const recentUnsubscribe = onSnapshot(recentQuery, (snapshot) => {
      const notificationData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as (NotificationData & { id: string })[];
      setNotifications(notificationData);
    });

    return () => {
      unreadUnsubscribe();
      recentUnsubscribe();
    };
  }, [user]);

  const handleNotificationClick = async (notification: NotificationData & { id: string }) => {
    if (!notification.read) {
      await markNotificationAsRead(notification.id);
    }
    
    switch (notification.type) {
      case 'GROUP_JOIN_REQUEST':
        navigate(`/groups/${notification.groupId}?tab=requests`);
        break;
      case 'GROUP_JOIN_ACCEPTED':
      case 'GROUP_JOIN_REJECTED':
        navigate(`/groups/${notification.groupId}`);
        break;
      default:
        navigate('/notifications');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'GROUP_JOIN_REQUEST':
        return <UserPlus className="text-blue-500" size={16} />;
      case 'GROUP_JOIN_ACCEPTED':
        return <Check className="text-green-500" size={16} />;
      case 'GROUP_JOIN_REJECTED':
        return <X className="text-red-500" size={16} />;
      default:
        return <Bell className="text-gray-500" size={16} />;
    }
  };

  const handleViewAll = () => {
    navigate('/notifications');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-4 py-2 border-b">
          <span className="font-medium">Notifications</span>
          {unreadCount > 0 && (
            <span className="text-xs text-blue-600">{unreadCount} new</span>
          )}
        </div>
        <div className="max-h-[400px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-gray-500">
              No notifications
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`px-4 py-3 cursor-pointer flex items-start gap-3 ${
                  !notification.read ? 'bg-blue-50' : ''
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {notification.createdAt?.toDate().toLocaleDateString()} at{' '}
                    {notification.createdAt?.toDate().toLocaleTimeString()}
                  </p>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </div>
        <div className="p-2 border-t">
          <Button
            variant="outline"
            className="w-full"
            onClick={handleViewAll}
          >
            View all notifications
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationBell; 