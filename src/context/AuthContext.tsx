import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setUnauthorizedCallback } from '../services/api';
import { connectSocket, disconnectSocket } from '../services/socketService';

export type AuthContextType = {
  isLoggedIn: boolean;
  token: string | null;
  userId: string | null;
  userRole: 'seeker' | 'provider' | null;
  login: (token: string, userId: string, role: 'seeker' | 'provider' | null) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<'seeker' | 'provider' | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from AsyncStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const savedToken = await AsyncStorage.getItem('authToken');
        const savedUserId = await AsyncStorage.getItem('userId');
        const savedRole = await AsyncStorage.getItem('userRole');

        if (savedToken && savedUserId) {
          setToken(savedToken);
          setUserId(savedUserId);
          setUserRole((savedRole as 'seeker' | 'provider') || null);
          setIsLoggedIn(true);
          connectSocket(savedUserId);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (newToken: string, newUserId: string, role: 'seeker' | 'provider' | null) => {
    try {
      setToken(newToken);
      setUserId(newUserId);
      setUserRole(role);
      setIsLoggedIn(true);

      await AsyncStorage.setItem('authToken', newToken);
      await AsyncStorage.setItem('userId', newUserId);
      if (role) {
        await AsyncStorage.setItem('userRole', role);
      } else {
        await AsyncStorage.removeItem('userRole');
      }
      connectSocket(newUserId);
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  };

  const logout = useCallback(async () => {
    try {
      setToken(null);
      setUserId(null);
      setUserRole(null);
      setIsLoggedIn(false);

      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userId');
      await AsyncStorage.removeItem('userRole');
      await AsyncStorage.removeItem('userReligion');
      disconnectSocket();
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  }, []);

  useEffect(() => {
    setUnauthorizedCallback(logout);
    return () => {
      setUnauthorizedCallback(null);
    };
  }, [logout]);

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        token,
        userId,
        userRole,
        login,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
