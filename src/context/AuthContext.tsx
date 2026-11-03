import React, { createContext, useContext, useState, useEffect } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { AuthService } from '../services/authService.ts';
import { testFirestoreConnection } from '../services/firebase.ts';
import type { UserProfile, BusinessProfile } from '../types/index.ts';

interface AuthContextType {
  currentUser: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  isDbConnected: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (params: {
    email: string;
    password: string;
    name: string;
    phone?: string;
    role: 'individual' | 'business';
    language: 'ckb' | 'ar' | 'en';
    businessProfile?: Partial<BusinessProfile>;
  }) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  firebaseUser: null,
  loading: true,
  isDbConnected: false,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  resetPassword: async () => {},
  updateProfile: async () => {},
  refreshProfile: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDbConnected, setIsDbConnected] = useState<boolean>(false);

  useEffect(() => {
    testFirestoreConnection().then(setIsDbConnected);

    const unsubscribe = AuthService.onAuthStateChanged(async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        try {
          const profile = await AuthService.getUserProfile(fbUser.uid);
          setCurrentUser(profile);
        } catch (e) {
          console.error('Error loading user profile from Firestore:', e);
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const res = await AuthService.login(email, pass);
      setCurrentUser(res.user);
    } finally {
      setLoading(false);
    }
  };

  const register = async (params: {
    email: string;
    password: string;
    name: string;
    phone?: string;
    role: 'individual' | 'business';
    language: 'ckb' | 'ar' | 'en';
    businessProfile?: Partial<BusinessProfile>;
  }) => {
    setLoading(true);
    try {
      const res = await AuthService.register(params);
      setCurrentUser(res.user);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await AuthService.logout();
      setCurrentUser(null);
      setFirebaseUser(null);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    await AuthService.resetPassword(email);
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!firebaseUser) throw new Error('Not authenticated');
    await AuthService.updateProfile(firebaseUser.uid, updates);
    const refreshed = await AuthService.getUserProfile(firebaseUser.uid);
    if (refreshed) setCurrentUser(refreshed);
  };

  const refreshProfile = async () => {
    if (!firebaseUser) return;
    const refreshed = await AuthService.getUserProfile(firebaseUser.uid);
    if (refreshed) setCurrentUser(refreshed);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        firebaseUser,
        loading,
        isDbConnected,
        login,
        register,
        logout,
        resetPassword,
        updateProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
