import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

interface User {
  id: string;
  username: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_KEY = 'user_auth';

// Mock user database - in a real app, this would be an API call
const MOCK_USERS = [
  { id: '1', username: 'admin', password: 'admin123' },
  { id: '2', username: 'user', password: 'password' },
  { id: '3', username: 'demo', password: 'demo123' },
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing auth on app start
  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      let authData;
      if (Platform.OS === 'web') {
        // Use localStorage for web
        authData = localStorage.getItem(AUTH_KEY);
      } else {
        // Use SecureStore for native platforms
        authData = await SecureStore.getItemAsync(AUTH_KEY);
      }
      
      if (authData) {
        const userData = JSON.parse(authData);
        setUser(userData);
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check credentials against mock database
      const foundUser = MOCK_USERS.find(
        u => u.username === username && u.password === password
      );
      
      if (foundUser) {
        const userData = { id: foundUser.id, username: foundUser.username };
        
        // Store auth data
        if (Platform.OS === 'web') {
          localStorage.setItem(AUTH_KEY, JSON.stringify(userData));
        } else {
          await SecureStore.setItemAsync(AUTH_KEY, JSON.stringify(userData));
        }
        
        setUser(userData);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (Platform.OS === 'web') {
        localStorage.removeItem(AUTH_KEY);
      } else {
        await SecureStore.deleteItemAsync(AUTH_KEY);
      }
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}