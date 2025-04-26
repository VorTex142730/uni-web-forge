
export interface Message {
  id: number;
  senderId: number;
  recipientId: number;
  text: string;
  timestamp: string;
  isRead: boolean;
}

export interface Conversation {
  id: number;
  participants: number[];
  lastMessage: {
    text: string;
    timestamp: string;
    senderId: number;
  };
  isRead: boolean;
}

export interface User {
  id: number;
  name: string;
  username: string;
  avatar: string;
  status: 'online' | 'offline' | 'away';
  lastActive?: string;
}

export const users: User[] = [
  {
    id: 1,
    name: 'Raviraj',
    username: 'raviraj',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    status: 'online'
  },
  {
    id: 2,
    name: 'Morningstar',
    username: 'morningstar',
    avatar: 'https://randomuser.me/api/portraits/men/36.jpg',
    status: 'online'
  },
  {
    id: 3,
    name: 'Riya Patel',
    username: 'riya',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    status: 'offline',
    lastActive: '3 hours ago'
  },
  {
    id: 4,
    name: 'Neha Singh',
    username: 'neha',
    avatar: 'https://randomuser.me/api/portraits/women/67.jpg',
    status: 'offline',
    lastActive: '1 day ago'
  },
  {
    id: 5,
    name: 'Aneesh Kumar',
    username: 'aneesh',
    avatar: 'https://randomuser.me/api/portraits/men/22.jpg',
    status: 'away',
    lastActive: '20 minutes ago'
  }
];

export const conversations: Conversation[] = [
  {
    id: 1,
    participants: [1, 2],
    lastMessage: {
      text: 'hi',
      timestamp: 'Saturday',
      senderId: 1
    },
    isRead: true
  },
  {
    id: 2,
    participants: [1, 3],
    lastMessage: {
      text: 'Can you share the notes from yesterday\'s class?',
      timestamp: 'Yesterday',
      senderId: 3
    },
    isRead: false
  },
  {
    id: 3,
    participants: [1, 4],
    lastMessage: {
      text: 'Looking forward to the group project!',
      timestamp: '2 days ago',
      senderId: 4
    },
    isRead: true
  },
  {
    id: 4,
    participants: [1, 5],
    lastMessage: {
      text: 'Thanks for your help with the assignment.',
      timestamp: 'Last week',
      senderId: 5
    },
    isRead: true
  }
];

export const messages: Record<number, Message[]> = {
  1: [
    {
      id: 1,
      senderId: 2,
      recipientId: 1,
      text: 'Hi!',
      timestamp: 'Saturday 6:05 AM',
      isRead: true
    },
    {
      id: 2,
      senderId: 1,
      recipientId: 2,
      text: 'hi',
      timestamp: 'Saturday 6:06 AM',
      isRead: true
    }
  ],
  2: [
    {
      id: 3,
      senderId: 3,
      recipientId: 1,
      text: 'Hi Raviraj, how are you doing?',
      timestamp: 'Yesterday 3:30 PM',
      isRead: true
    },
    {
      id: 4,
      senderId: 1,
      recipientId: 3,
      text: 'I\'m good, thanks! How about you?',
      timestamp: 'Yesterday 3:45 PM',
      isRead: true
    },
    {
      id: 5,
      senderId: 3,
      recipientId: 1,
      text: 'Can you share the notes from yesterday\'s class?',
      timestamp: 'Yesterday 4:00 PM',
      isRead: false
    }
  ],
  3: [
    {
      id: 6,
      senderId: 4,
      recipientId: 1,
      text: 'Hey, have you thought about the group project topic?',
      timestamp: '2 days ago 10:15 AM',
      isRead: true
    },
    {
      id: 7,
      senderId: 1,
      recipientId: 4,
      text: 'Yes, I think we should focus on renewable energy. What do you think?',
      timestamp: '2 days ago 11:30 AM',
      isRead: true
    },
    {
      id: 8,
      senderId: 4,
      recipientId: 1,
      text: 'That sounds great! Looking forward to the group project!',
      timestamp: '2 days ago 12:45 PM',
      isRead: true
    }
  ],
  4: [
    {
      id: 9,
      senderId: 1,
      recipientId: 5,
      text: 'Do you need any help with the programming assignment?',
      timestamp: 'Last week 9:00 AM',
      isRead: true
    },
    {
      id: 10,
      senderId: 5,
      recipientId: 1,
      text: 'Yes, I\'m having trouble with the recursion part. Can you explain it?',
      timestamp: 'Last week 9:15 AM',
      isRead: true
    },
    {
      id: 11,
      senderId: 1,
      recipientId: 5,
      text: 'Sure, recursion is when a function calls itself. Let me show you an example...',
      timestamp: 'Last week 9:30 AM',
      isRead: true
    },
    {
      id: 12,
      senderId: 5,
      recipientId: 1,
      text: 'Thanks for your help with the assignment.',
      timestamp: 'Last week 10:45 AM',
      isRead: true
    }
  ]
};
