import "../global.css";
import { useEffect, ReactNode } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '../store/auth';
import { useSubscriptionStore } from '../store/subscription';

// Conditionally import Superwall to handle Expo Go
let SuperwallProvider: React.ComponentType<{ apiKeys: { ios: string }; children: ReactNode }> | null = null;
try {
  SuperwallProvider = require('expo-superwall').SuperwallProvider;
} catch {
  // Superwall not available (running in Expo Go)
}

function SuperwallWrapper({ children }: { children: ReactNode }) {
  if (SuperwallProvider) {
    return (
      <SuperwallProvider apiKeys={{ ios: "pk_FAx9e-d6O32Ee-uIf41-N" }}>
        {children}
      </SuperwallProvider>
    );
  }
  // Fallback for Expo Go - just render children
  return <>{children}</>;
}

export default function RootLayout() {
  const initializeAuth = useAuthStore((s) => s.initialize);
  const initializeSubscription = useSubscriptionStore((s) => s.initialize);

  useEffect(() => {
    initializeAuth();
    // Initialize subscription store to check for existing subscriptions
    initializeSubscription();
  }, []);

  return (
    <SuperwallWrapper>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="checkin" />
      </Stack>
    </SuperwallWrapper>
  );
}
