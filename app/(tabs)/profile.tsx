import * as WebBrowser from "expo-web-browser";
import React, { useState } from "react";
import { ActivityIndicator, Alert, Pressable, Text, View } from "react-native";

export const API_BASE = "http://192.168.1.105:8000";   // change to your machine IP or ngrok
export const NOVNC_URL = "http://http://192.168.1.105:8000:6080/vnc.html?autoconnect=true&host=http://192.168.1.105:8000&port=6080"; // same host as above


type StartLoginResp = {
  sessionId: string;
  novncUrl: string; // backend returns this; we’ll prefer NOVNC_URL from config
};

export default function PnpLoginScreen() {
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const startLogin = async () => {
    try {
      // setLoading(true);
      // const res = await fetch(`${API_BASE}/api/start-login?callback=camida://login-complete`);
      // if (!res.ok) throw new Error(await res.text());
      // const data: StartLoginResp = await res.json();
      // setSessionId(data.sessionId);

      // Open the live Chromium (noVNC). The backend also returns novncUrl,
      // but using NOVNC_URL from config avoids CORS/host mismatch issues.
      const temp = await WebBrowser.openBrowserAsync("https://login.pnp.co.za/login");
      console.log(temp)
      // User completes login & CAPTCHA in the browser UI,
      // then returns to this app and taps "I'm Done".
    } catch (e: any) {
      console.log(e)
      Alert.alert("Error", e?.message ?? "Failed to start login.");
    } finally {
      setLoading(false);
    }
  };

  const completeLogin = async () => {
    if (!sessionId) return;
    try {
      setLoading(true);
      // This captures cookies server-side and triggers the deep link back to the app
      await WebBrowser.openBrowserAsync(`${API_BASE}/complete-login/${sessionId}`);
      // The deep link "camida://login-complete?session_id=..." will be handled
      // by the listener in _layout.tsx
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "Failed to complete login.");
    } finally {
      setLoading(false);
    }
  };

  const fetchCart = async () => {
    if (!sessionId) return Alert.alert("Missing session", "Start and complete login first.");
    try {
      setLoading(true);
      // Example of using the session server-side.
      // Implement a proxy on your backend like: GET /api/pnp/cart?sessionId=...
      const res = await fetch(`${API_BASE}/api/pnp/cart?sessionId=${encodeURIComponent(sessionId)}`);
      const data = await res.json();
      Alert.alert("Cart", JSON.stringify(data, null, 2));
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "Failed to fetch cart.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 16, gap: 12, justifyContent: "center" }}>
      <Text style={{ fontSize: 22, fontWeight: "700" }}>Login to Pick n Pay</Text>
      <Text>We’ll open a secure browser so you can complete login and CAPTCHA.</Text>

      <Pressable
        onPress={startLogin}
        disabled={loading}
        style={{ backgroundColor: "#111827", padding: 14, borderRadius: 12, opacity: loading ? 0.6 : 1 }}
      >
        <Text style={{ color: "white", textAlign: "center", fontWeight: "600" }}>
          {loading ? "Starting..." : "Start Login"}
        </Text>
      </Pressable>

      {sessionId && (
        <>
          <Text style={{ marginTop: 8, fontSize: 12, color: "#6B7280" }}>Session: {sessionId}</Text>

          <Pressable
            onPress={completeLogin}
            disabled={loading}
            style={{ backgroundColor: "#2563EB", padding: 14, borderRadius: 12, opacity: loading ? 0.6 : 1 }}
          >
            <Text style={{ color: "white", textAlign: "center", fontWeight: "600" }}>
              I'm Done — Complete Login
            </Text>
          </Pressable>

          {/* Example of using the server-side session afterward */}
          <Pressable
            onPress={fetchCart}
            disabled={loading}
            style={{ backgroundColor: "#059669", padding: 14, borderRadius: 12, marginTop: 8, opacity: loading ? 0.6 : 1 }}
          >
            <Text style={{ color: "white", textAlign: "center", fontWeight: "600" }}>
              Fetch Cart (Example)
            </Text>
          </Pressable>
        </>
      )}

      {loading && (
        <View style={{ marginTop: 16 }}>
          <ActivityIndicator />
        </View>
      )}
    </View>
  );
}
