import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { supabase } from '../../lib/supabase';

export default function AuthCallbackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    handleCallback();
  }, []);

  const handleCallback = async () => {
    try {
      const access_token = params.access_token as string;
      const refresh_token = params.refresh_token as string;

      if (access_token && refresh_token) {
        await supabase.auth.setSession({
          access_token,
          refresh_token,
        });
        router.replace('/(tabs)');
      } else {
        // Check if we already have a session
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          router.replace('/(tabs)');
        } else {
          router.replace('/(auth)/login');
        }
      }
    } catch (error) {
      console.error('Auth callback error:', error);
      router.replace('/(auth)/login');
    }
  };

  return (
    <View style={styles.container}>
      <LoadingSpinner message="Signing you in..." />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
