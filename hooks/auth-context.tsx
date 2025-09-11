import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithCredential,
  signInAnonymously,
  linkWithCredential
} from 'firebase/auth';
import { auth } from '@/firebase.config';
import { crashLogger } from '@/utils/crash-logger';
import { exportPreferencesManager } from '@/utils/export-preferences';
import { securityManager } from '@/utils/security';

export interface AuthUser extends User {
  isAnonymous: boolean;
  hasCompletedOnboarding?: boolean;
}

export interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInAsGuest: () => Promise<void>;
  upgradeAnonymousAccount: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (data: { displayName?: string; photoURL?: string }) => Promise<void>;
  deleteAccount: () => Promise<void>;
  
  // Sync related
  hasLocalData: boolean;
  shouldPromptForSync: boolean;
  dismissSyncPrompt: () => void;
  enableSync: () => Promise<void>;
  disableSync: () => Promise<void>;
  syncEnabled: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps): React.JSX.Element {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasLocalData, setHasLocalData] = useState(false);
  const [shouldPromptForSync, setShouldPromptForSync] = useState(false);
  const [syncEnabled, setSyncEnabled] = useState(false);

  useEffect(() => {
    checkLocalData();
    loadSyncSettings();

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const authUser: AuthUser = {
          ...firebaseUser,
          isAnonymous: firebaseUser.isAnonymous,
          hasCompletedOnboarding: await checkOnboardingStatus(firebaseUser.uid)
        };
        
        setUser(authUser);
        
        // Set up crash logger and export preferences with user info
        crashLogger.setUserInfo(firebaseUser.uid);
        exportPreferencesManager.setUserInfo(firebaseUser.uid);
        
        // Check if we should prompt for sync
        if (hasLocalData && !firebaseUser.isAnonymous && !syncEnabled) {
          setShouldPromptForSync(true);
        }
      } else {
        setUser(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, [hasLocalData, syncEnabled]);

  const checkLocalData = async () => {
    try {
      // Check AsyncStorage for existing worlds/data
      const worlds = await AsyncStorage.getItem('worlds');
      const characters = await AsyncStorage.getItem('characters');
      const locations = await AsyncStorage.getItem('locations');
      
      const hasData = !!(worlds || characters || locations);
      setHasLocalData(hasData);
    } catch (error) {
      console.error('Error checking local data:', error);
    }
  };

  const loadSyncSettings = async () => {
    try {
      const enabled = await AsyncStorage.getItem('syncEnabled');
      const isEnabled = enabled === 'true';
      setSyncEnabled(isEnabled);
      
      // Enable sync for crash logs and export preferences if sync is enabled
      if (isEnabled) {
        crashLogger.enableSync(true);
        exportPreferencesManager.enableSync(true);
      }
    } catch (error) {
      console.error('Error loading sync settings:', error);
    }
  };

  const checkOnboardingStatus = async (userId: string): Promise<boolean> => {
    try {
      const status = await AsyncStorage.getItem(`onboarding_${userId}`);
      return status === 'completed';
    } catch (error) {
      return false;
    }
  };

  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      
      // Check if user is locked due to too many failed attempts
      if (await securityManager.isUserLocked(email)) {
        throw new Error('Account temporarily locked due to too many failed attempts. Please try again later.');
      }
      
      await signInWithEmailAndPassword(auth, email, password);
      
      // Clear failed attempts on successful sign in
      securityManager.clearFailedAttempts(email);
    } catch (error: any) {
      // Record failed attempt
      const isLocked = await securityManager.recordFailedAttempt(email);
      if (isLocked) {
        throw new Error('Too many failed attempts. Account locked temporarily.');
      }
      throw new Error(error.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, displayName?: string): Promise<void> => {
    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      if (displayName && userCredential.user) {
        await updateProfile(userCredential.user, { displayName });
      }
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async (): Promise<void> => {
    try {
      setLoading(true);
      // Note: Google Sign-In implementation depends on platform
      // This is a placeholder for the actual implementation
      throw new Error('Google Sign-In not implemented yet');
    } catch (error: any) {
      throw new Error(error.message || 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  const signInAsGuest = async (): Promise<void> => {
    try {
      setLoading(true);
      await signInAnonymously(auth);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to sign in as guest');
    } finally {
      setLoading(false);
    }
  };

  const upgradeAnonymousAccount = async (email: string, password: string): Promise<void> => {
    try {
      if (!user || !user.isAnonymous) {
        throw new Error('No anonymous user to upgrade');
      }

      setLoading(true);
      const credential = GoogleAuthProvider.credential(email, password);
      await linkWithCredential(user, credential);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to upgrade account');
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
      // Clear sync settings on logout
      await AsyncStorage.removeItem('syncEnabled');
      setSyncEnabled(false);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to sign out');
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to send reset email');
    }
  };

  const updateUserProfile = async (data: { displayName?: string; photoURL?: string }): Promise<void> => {
    try {
      if (!user) throw new Error('No user signed in');
      await updateProfile(user, data);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update profile');
    }
  };

  const deleteAccount = async (): Promise<void> => {
    try {
      if (!user) throw new Error('No user signed in');
      await user.delete();
      
      // Clear all local data
      await AsyncStorage.clear();
    } catch (error: any) {
      throw new Error(error.message || 'Failed to delete account');
    }
  };

  const dismissSyncPrompt = () => {
    setShouldPromptForSync(false);
  };

  const enableSync = async (): Promise<void> => {
    try {
      await AsyncStorage.setItem('syncEnabled', 'true');
      setSyncEnabled(true);
      setShouldPromptForSync(false);
      
      // Enable sync for crash logs and export preferences
      crashLogger.enableSync(true);
      exportPreferencesManager.enableSync(true);
    } catch (error) {
      throw new Error('Failed to enable sync');
    }
  };

  const disableSync = async (): Promise<void> => {
    try {
      await AsyncStorage.setItem('syncEnabled', 'false');
      setSyncEnabled(false);
      
      // Disable sync for crash logs and export preferences
      crashLogger.enableSync(false);
      exportPreferencesManager.enableSync(false);
    } catch (error) {
      throw new Error('Failed to disable sync');
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signInAsGuest,
    upgradeAnonymousAccount,
    logout,
    resetPassword,
    updateUserProfile,
    deleteAccount,
    hasLocalData,
    shouldPromptForSync,
    dismissSyncPrompt,
    enableSync,
    disableSync,
    syncEnabled
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook for checking if user needs onboarding
export function useOnboarding() {
  const { user } = useAuth();
  
  const completeOnboarding = async () => {
    if (user) {
      await AsyncStorage.setItem(`onboarding_${user.uid}`, 'completed');
    }
  };

  return {
    needsOnboarding: user && !user.hasCompletedOnboarding,
    completeOnboarding
  };
}