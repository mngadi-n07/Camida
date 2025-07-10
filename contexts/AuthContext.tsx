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
  getValidAccessToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_KEY = 'user_auth';
const Server_URL = "https://y37s25brcj.execute-api.eu-north-1.amazonaws.com/default/users";
const refresh_url = "https://1xmkdwpm9a.execute-api.eu-north-1.amazonaws.com/getRefresh";


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
        console.log("New Tokens",response,Date.now().toLocaleString())
  
        if(isSuccessResponse(response)){
          const { idToken, serverAuthCode, user } = response.data;
          const { name, email, photo } = user;

          const userData = { name : name, email: email, token: idToken }
          saveUser(email,idToken,name);
          getRefreshToken(serverAuthCode);
  
          await SecureStore.setItemAsync("access_token", idToken);
    
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
      console.log(apiResponse)
    } catch (error) {
      console.log(error);
    }
    
  }

  const getRefreshToken = async (serverAuthCode) => {
    try {
      const url = new URL(`${refresh_url}/getRefresh`);
      const apiResponse = await fetch(url.toString(), {
      method: "POST",
      body : JSON.stringify({ "auth_code" : serverAuthCode})
      });
      const tokens = await apiResponse.json()

      await SecureStore.setItemAsync("refresh_token",  tokens["refresh_token"]);

      console.log("THIS SHOULD BE THE REFRESH TOKEN: ",tokens)
    } catch (error) {
      console.log(error);
    }
  }

// Set 5-minute buffer before expiry
const TOKEN_EXPIRY_BUFFER_MS = 5 * 60 * 1000;

const getValidAccessToken = async (): Promise<string | null> => {
  const accessToken = await SecureStore.getItemAsync('access_token');
  const refreshToken = await SecureStore.getItemAsync('refresh_token');

  if (!accessToken) return null;

  const decoded = decodeJWT(accessToken);
  const exp = decoded?.exp ? decoded.exp * 1000 : 0; // JWT exp is in seconds

  const now = Date.now();
  const shouldRefresh = now >= (exp - TOKEN_EXPIRY_BUFFER_MS);

  if (!shouldRefresh) {
    return accessToken;
  }

  console.log("here")
  if (!refreshToken) return null;

  try {
    const url = new URL(`${refresh_url}/getAccess`);
    const tokenResponse = await fetch(url.toString(), {
    method: "POST",
    body : JSON.stringify({ "refresh_token" : refreshToken})
    });

    const tokenData = await tokenResponse.json();

    if (!tokenData.access_token) {
      console.error('Token refresh failed:', tokenData);
      return null;
    }

    await SecureStore.setItemAsync('access_token', tokenData.access_token);
    return tokenData.access_token;
  } catch (error) {
    console.error('Token refresh error:', error);
    return null;
  }
};

const decodeJWT = (token: string): any => {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    return decoded;
  } catch (err) {
    return null;
  }
};

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
    <AuthContext.Provider value={{ user, login, logout, isLoading, getValidAccessToken }}>
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