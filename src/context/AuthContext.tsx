
import React, { createContext, useState, useContext, useEffect } from 'react';
import { User } from '@/types';
import { users } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, remember?: boolean) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  nickname?: string;
  college?: string;
  role?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check for saved user in localStorage
    const savedUser = localStorage.getItem('hotspot_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error("Error parsing saved user", error);
        localStorage.removeItem('hotspot_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string, remember: boolean = false): Promise<boolean> => {
    setLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simple validation (in a real app, this would be a backend API call)
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please enter email and password",
        variant: "destructive",
      });
      setLoading(false);
      return false;
    }
    
    // For demo purposes, any valid email/password combination works
    const foundUser = users[0]; // Just use the first mock user
    
    if (foundUser) {
      setUser(foundUser);
      if (remember) {
        localStorage.setItem('hotspot_user', JSON.stringify(foundUser));
      }
      toast({
        title: "Success",
        description: "You have been logged in",
      });
      setLoading(false);
      return true;
    } else {
      toast({
        title: "Error",
        description: "Invalid email or password",
        variant: "destructive",
      });
      setLoading(false);
      return false;
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    setLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simple validation (in a real app, this would be a backend API call)
    if (!userData.email || !userData.password || !userData.firstName || !userData.lastName) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      setLoading(false);
      return false;
    }
    
    // Create a new user (in a real app, this would be done by the backend)
    const newUser: User = {
      id: Date.now().toString(),
      name: `${userData.firstName} ${userData.lastName}`,
      username: userData.nickname || userData.firstName,
      status: 'online',
      role: userData.role as 'Student' | 'Member' | undefined,
      joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    };
    
    setUser(newUser);
    localStorage.setItem('hotspot_user', JSON.stringify(newUser));
    
    toast({
      title: "Success",
      description: "Your account has been created",
    });
    
    setLoading(false);
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('hotspot_user');
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        loading,
      }}
    >
      {children}
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
