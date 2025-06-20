export interface User {
  id: string;
  name: string;
  username?: string;
  avatar?: string;
  status?: 'online' | 'offline';
  role?: 'Student' | 'Member' | 'Admin';
  joinedDate?: string;
  lastActive?: string;
  profileComplete?: number;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  image?: string;
  memberCount: number;
  privacy: 'public' | 'private';
  createdBy: {
    userId: string;
    displayName?: string;
    photoURL?: string;
  };
  createdAt?: string;
  lastActive?: string;
}

export interface Post {
  id: string;
  content: string;
  authorId: string;
  author?: User;
  groupId?: string;
  createdAt: string;
  likes: number;
  comments: number;
}

export interface Forum {
  id: string;
  name: string;
  description?: string;
  image?: string;
  lastActive?: string;
  discussions?: number;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  image: string;
  price: {
    regular: number;
    sale?: number;
  };
  rating?: number;
  onSale?: boolean;
}
