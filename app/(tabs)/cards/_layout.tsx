import { Stack } from 'expo-router';
import React from 'react';

export default function CardsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen
        name="card"
        options={{
          presentation: 'modal',
          headerShown: false,
        }}
      />
    
    </Stack>
  );
}