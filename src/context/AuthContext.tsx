import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile
} from 'firebase/auth';

interface User extends FirebaseUser {
  displayName: string | null;
  username: string;
  photoURL: string | null;
  unreadMessages: number;
  unreadNotifications: number;
  cartItems: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (data: { displayName?: string; photoURL?: string }) => Promise<void>;
  devLogin: () => void; // Development only function
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user data for development
const mockUser: User = {
  uid: 'mock-user-id',
  email: 'test@example.com',
  displayName: 'Test User',
  username: 'testuser',
  photoURL: 'https://api.dicebear.com/7.x/avatars/svg?seed=testuser',
  unreadMessages: 3,
  unreadNotifications: 5,
  cartItems: 2,
  emailVerified: true,
  isAnonymous: false,
  metadata: {},
  providerData: [],
  refreshToken: '',
  tenantId: null,
  delete: async () => {},
  getIdToken: async () => '',
  getIdTokenResult: async () => ({
    token: '',
    authTime: '',
    issuedAtTime: '',
    expirationTime: '',
    signInProvider: null,
    claims: {},
  }),
  reload: async () => {},
  toJSON: () => ({}),
  phoneNumber: null,
  providerId: 'mock',
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only set up Firebase auth listener if we're not in development mode or user is null
    if (import.meta.env.DEV && user) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const extendedUser: User = {
          ...firebaseUser,
          username: firebaseUser.email?.split('@')[0] || '',
          unreadMessages: 0,
          unreadNotifications: 0,
          cartItems: 0,
        } as User;
        setUser(extendedUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      throw error;
    }
  };

  const register = async (email: string, password: string, username: string) => {
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(user, {
        displayName: username,
      });
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (import.meta.env.DEV) {
        setUser(null);
        return;
      }
      await signOut(auth);
    } catch (error) {
      throw error;
    }
  };

  const updateUserProfile = async (data: { displayName?: string; photoURL?: string }) => {
    if (!auth.currentUser && !import.meta.env.DEV) return;
    try {
      if (import.meta.env.DEV) {
        setUser(user ? { ...user, ...data } : null);
        return;
      }
      await updateProfile(auth.currentUser!, data);
      if (user) {
        setUser({ ...user, ...data });
      }
    } catch (error) {
      throw error;
    }
  };

  // Development only function to set mock user
  const devLogin = () => {
    if (import.meta.env.DEV) {
      console.log('Development mode: Setting mock user');
      setUser(mockUser);
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUserProfile,
    devLogin,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
