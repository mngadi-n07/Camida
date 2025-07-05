import { Stack } from 'expo-router';
import React = require('react');

export default function ExploreLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      
    </Stack>
  );
}