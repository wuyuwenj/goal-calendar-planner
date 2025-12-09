import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="level" />
      <Stack.Screen name="availability" />
      <Stack.Screen name="timeline" />
    </Stack>
  );
}
