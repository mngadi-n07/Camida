import { GoogleSignin, isSuccessResponse } from '@react-native-google-signin/google-signin';
import * as SecureStore from 'expo-secure-store';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';

interface User {
  id: string;
  name: string;
  token: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: () => Promise<boolean>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_KEY = 'user_auth';
const Server_URL = "https://y37s25brcj.execute-api.eu-north-1.amazonaws.com/default/users";


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

    } finally {
      setIsLoading(false);
    }
  };

  const login = async (): Promise<boolean> => {
    setIsLoading(true);
    
    try {

        await GoogleSignin.hasPlayServices();
        await GoogleSignin.signOut();
        const response = await GoogleSignin.signIn();
        console.log(response)
  
        if(isSuccessResponse(response)){
          const { idToken, serverAuthCode, user } = response.data;
          const { name, email, photo } = user;

          const userData = { name : name, email: email, token: idToken }
          saveUser(email,idToken,name);
    
          await SecureStore.setItemAsync(AUTH_KEY, JSON.stringify(userData));
          setUser(userData);
          return true;
        }
      
      return false;
    } catch (error) {

      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const saveUser = async (email, idToken,name) => {

    try {
      const url = new URL(`${Server_URL}`);
      const apiResponse = await fetch(url.toString(), {
      method: "POST",
      headers: {"email": email, "Authorization": idToken},
      body : JSON.stringify({ "name" : name})
      });
      await apiResponse.json();
    } catch (error) {
      console.log(error);
    }
    
  }


  const logout = async () => {
    try {
      if (Platform.OS === 'web') {
        localStorage.removeItem(AUTH_KEY);
      } else {
        await GoogleSignin.signOut();
        await SecureStore.deleteItemAsync(AUTH_KEY);
      }
      setUser(null);
    } catch (error) {

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