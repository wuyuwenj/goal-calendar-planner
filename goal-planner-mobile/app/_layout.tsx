import "../global.css";
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SuperwallProvider } from 'expo-superwall';
import { useAuthStore } from '../store/auth';

export default function RootLayout() {
  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => {
    initialize();
  }, []);

  return (
    <SuperwallProvider
      apiKeys={{
        ios: "pk_FAx9e-d6O32Ee-uIf41-N",
      }}
    >
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="checkin" />
      </Stack>
    </SuperwallProvider>
  );
}
