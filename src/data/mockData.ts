
import { User, Group, Post, Forum, Product } from '@/types';

// Mock Users
export const users: User[] = [
  {
    id: '1',
    name: 'Raviraj',
    username: 'Vortex',
    avatar: '/lovable-uploads/454f1b95-a842-4d03-9b9c-6591da540628.png',
    status: 'online',
    role: 'Student',
    joinedDate: 'Apr 2025',
    lastActive: 'now',
    profileComplete: 71,
  },
  {
    id: '2',
    name: 'Morningstar',
    username: 'Morningstar',
    avatar: '/lovable-uploads/d98e9a1b-755a-4e74-89fd-98b3601d9a8b.png',
    status: 'offline',
    role: 'Member',
    joinedDate: 'Mar 2024',
    lastActive: '2 days ago',
  },
  {
    id: '3',
    name: 'Riya',
    username: 'Riya',
    avatar: '',
    status: 'offline',
    role: 'Student',
    joinedDate: 'Apr 2025',
    lastActive: '5 days ago',
  },
  {
    id: '4',
    name: 'Neha',
    username: 'Neha',
    avatar: '',
    status: 'offline',
    role: 'Member',
    joinedDate: 'Apr 2025',
    lastActive: '5 days ago',
  },
  {
    id: '5',
    name: 'Aneesh',
    username: 'Aneesh',
    avatar: '',
    status: 'offline',
    joinedDate: 'Apr 2025',
    lastActive: '7 days ago',
  },
  {
    id: '6',
    name: 'Mubina',
    username: 'Mubina',
    avatar: '',
    status: 'offline',
    joinedDate: 'Mar 2025',
    lastActive: '5 weeks ago',
  },
];

// Mock Groups
export const groups: Group[] = [
  {
    id: '1',
    name: 'The Hotspot Community',
    description: 'Official community for all Hotspot users',
    image: '/lovable-uploads/7e62bda8-b57a-471c-8ec9-b867d2234f6d.png',
    members: 5,
    privacy: 'public',
    createdBy: 'Mubina',
    createdAt: 'Mar 2025',
    lastActive: '5 weeks ago',
  },
  {
    id: '2',
    name: 'Game development Group',
    description: 'For aspiring game developers',
    image: '/lovable-uploads/8e152ec2-dd8c-4566-9542-868ccf945eda.png',
    members: 3,
    privacy: 'private',
    createdBy: 'Morningstar',
    createdAt: 'Mar 2025',
    lastActive: '4 weeks ago',
  },
  {
    id: '3',
    name: 'Entrepreneurship Club',
    description: 'To meet the future entrepreneur in the campus',
    image: '/lovable-uploads/590ffd99-2376-46ed-a828-0233e73e8e42.png',
    members: 2,
    privacy: 'private',
    createdBy: 'Aneesh',
    createdAt: 'Mar 2025',
    lastActive: '5 weeks ago',
  },
  {
    id: '4',
    name: 'Nexora',
    description: 'Tech discussions and more',
    image: '',
    members: 4,
    privacy: 'public',
    createdBy: 'Mubina',
    createdAt: 'Mar 2025',
    lastActive: '5 weeks ago',
  },
  {
    id: '5',
    name: 'Adventure and Thrill',
    description: 'For outdoor activity enthusiasts',
    image: '',
    members: 10,
    privacy: 'public',
    createdBy: 'Mubina',
    createdAt: 'Mar 2025',
    lastActive: '5 weeks ago',
  },
];

// Mock Posts
export const posts: Post[] = [
  {
    id: '1',
    content: '',
    authorId: '6',
    groupId: '5',
    createdAt: '5 weeks ago',
    likes: 0,
    comments: 0,
  },
  {
    id: '2',
    content: '',
    authorId: '6',
    groupId: '4',
    createdAt: '5 weeks ago',
    likes: 2,
    comments: 0,
  },
];

// Mock Forums
export const forums: Forum[] = [
  {
    id: '1',
    name: 'Adventure and Thrill',
    image: '',
    lastActive: '',
    discussions: 0,
  },
  {
    id: '2',
    name: 'Private: Entrepreneurship Club',
    description: 'To meet the future entrepreneur in the campus.',
    image: '/lovable-uploads/590ffd99-2376-46ed-a828-0233e73e8e42.png',
    lastActive: '',
    discussions: 0,
  },
  {
    id: '3',
    name: 'Private: Game development Group',
    image: '/lovable-uploads/8e152ec2-dd8c-4566-9542-868ccf945eda.png',
    lastActive: '1 month ago',
    discussions: 0,
  },
  {
    id: '4',
    name: 'Nexora',
    image: '',
    lastActive: '',
    discussions: 0,
  },
  {
    id: '5',
    name: 'The Hotspot Community',
    image: '/lovable-uploads/7e62bda8-b57a-471c-8ec9-b867d2234f6d.png',
    lastActive: '',
    discussions: 0,
  },
];

// Mock Products
export const products: Product[] = [
  {
    id: '1',
    name: 'MIDNIGHT MASQUERADE',
    description: '18 APRIL 2025 - 8 PM',
    image: '/lovable-uploads/f84597d1-d5fe-4229-9f44-6a875390068c.png',
    price: {
      regular: 1649,
      sale: 700,
    },
    rating: 0,
    onSale: true,
  },
];

// Current user (simulating logged in user)
export const currentUser = users[0];
