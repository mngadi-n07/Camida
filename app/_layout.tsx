import { Inter_400Regular, Inter_600SemiBold, Inter_700Bold, useFonts } from '@expo-google-fonts/inter';
import * as Linking from "expo-linking";
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from "react";
import { Alert } from "react-native";
import 'react-native-reanimated';

import { AuthProvider } from '@/contexts/AuthContext';

export default function RootLayout() {
  const router = useRouter();
  useEffect(() => {
    const sub = Linking.addEventListener("url", ({ url }) => {
      const { path, queryParams } = Linking.parse(url);
      if (path === "login-complete" && queryParams?.session_id) {
        const sessionId = String(queryParams.session_id);
        Alert.alert("Login Complete", `Session: ${sessionId}`);
        // Navigate or store the session id somewhere central if you need it here.
        router.replace("/profile"); // or to a screen that uses the session
      }
    });
    return () => sub.remove();
  }, [router]);

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }


  return (
    <>
      <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </AuthProvider>
    </>
  );
}




