import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="welcome" />
      <Stack.Screen name="intent" />
      <Stack.Screen name="goal" />
      <Stack.Screen name="level" />
      <Stack.Screen name="timeline" />
      <Stack.Screen name="availability" />
      <Stack.Screen name="success" />
      {/* Keep index for backwards compatibility */}
      <Stack.Screen name="index" />
    </Stack>
  );
}
