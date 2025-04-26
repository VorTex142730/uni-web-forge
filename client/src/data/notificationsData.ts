
export interface Notification {
  id: number;
  type: 'mention' | 'like' | 'comment' | 'friend' | 'group' | 'event' | 'system';
  user?: {
    id: number;
    name: string;
    avatar: string;
  };
  content: string;
  timestamp: string;
  isRead: boolean;
  link: string;
}

export const notifications: Notification[] = [
  {
    id: 1,
    type: 'comment',
    user: {
      id: 2,
      name: 'Morningstar',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
    },
    content: 'commented on your post: "This is really helpful, thanks for sharing!"',
    timestamp: '2 hours ago',
    isRead: false,
    link: '/forums/post/123'
  },
  {
    id: 2,
    type: 'like',
    user: {
      id: 3,
      name: 'Aneesh Kumar',
      avatar: 'https://randomuser.me/api/portraits/men/36.jpg'
    },
    content: 'liked your photo',
    timestamp: '5 hours ago',
    isRead: false,
    link: '/profile/photos/456'
  },
  {
    id: 3,
    type: 'friend',
    user: {
      id: 4,
      name: 'Neha Singh',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg'
    },
    content: 'accepted your friend request',
    timestamp: 'Yesterday',
    isRead: false,
    link: '/profile/neha'
  },
  {
    id: 4,
    type: 'group',
    user: {
      id: 5,
      name: 'Riya Patel',
      avatar: 'https://randomuser.me/api/portraits/women/67.jpg'
    },
    content: 'invited you to join the group "Web Development Club"',
    timestamp: '2 days ago',
    isRead: true,
    link: '/groups/web-development'
  },
  {
    id: 5,
    type: 'event',
    user: {
      id: 6,
      name: 'Mubina Ahmed',
      avatar: 'https://randomuser.me/api/portraits/women/22.jpg'
    },
    content: 'created an event "Coding Competition" that might interest you',
    timestamp: '3 days ago',
    isRead: true,
    link: '/events/coding-competition'
  },
  {
    id: 6,
    type: 'system',
    content: 'Welcome to HotSpoT! Complete your profile to connect with other students.',
    timestamp: '1 week ago',
    isRead: true,
    link: '/profile/edit'
  }
];
