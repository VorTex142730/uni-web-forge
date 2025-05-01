import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '@/config/firebaseConfig';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile,
  UserCredential,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface UserDetails {
  firstName: string;
  lastName: string;
  nickname: string;
  college: string;
  role: string;
  photoURL?: string;
  coverPhotoURL?: string;
  updatedAt?: string;
  createdAt?: string;
}

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
  userDetails: UserDetails | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<UserCredential>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (data: { displayName?: string; photoURL?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserDetails = async (uid: string) => {
    try {
      const userDocRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        setUserDetails(userDoc.data() as UserDetails);
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const extendedUser: User = {
          ...firebaseUser,
          username: firebaseUser.email?.split('@')[0] || '',
          unreadMessages: 0,
          unreadNotifications: 0,
          cartItems: 0,
        } as User;
        setUser(extendedUser);
        await fetchUserDetails(firebaseUser.uid);
      } else {
        setUser(null);
        setUserDetails(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await fetchUserDetails(userCredential.user.uid);
    } catch (error) {
      throw error;
    }
  };

  const register = async (email: string, password: string, displayName: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, {
        displayName,
      });
      return userCredential;
    } catch (error) {
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Check if user exists in Firestore
      const userDocRef = doc(db, 'users', result.user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        // Create user document if it doesn't exist
        await setDoc(userDocRef, {
          firstName: result.user.displayName?.split(' ')[0] || '',
          lastName: result.user.displayName?.split(' ').slice(1).join(' ') || '',
          email: result.user.email,
          createdAt: new Date().toISOString(),
        });
      }
      
      await fetchUserDetails(result.user.uid);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUserDetails(null);
    } catch (error) {
      throw error;
    }
  };

  const updateUserProfile = async (data: { displayName?: string; photoURL?: string }) => {
    if (!auth.currentUser) return;
    try {
      await updateProfile(auth.currentUser, data);
      if (user) {
        setUser({ ...user, ...data });
      }
    } catch (error) {
      throw error;
    }
  };

  const value = {
    user,
    userDetails,
    loading,
    login,
    register,
    loginWithGoogle,
    logout,
    updateUserProfile,
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
