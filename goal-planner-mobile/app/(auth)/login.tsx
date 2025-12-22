import React, { ReactNode, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Sprout, Sparkles, Calendar, TreeDeciduous } from 'lucide-react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { TrellisIcon } from '../../components/TrellisIcon';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useAuthStore } from '../../store/auth';
import { COLORS } from '../../constants/theme';

export default function LoginScreen() {
  const router = useRouter();
  const { signInWithGoogle, signInWithApple, isAuthenticated, isLoading, error, clearError } =
    useAuthStore();
  const [appleAuthAvailable, setAppleAuthAvailable] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated]);

  useEffect(() => {
    // Check if Apple Authentication is available (iOS 13+)
    if (Platform.OS === 'ios') {
      AppleAuthentication.isAvailableAsync().then(setAppleAuthAvailable);
    }
  }, []);

  const handleGoogleSignIn = async () => {
    clearError();
    await signInWithGoogle();
  };

  const handleAppleSignIn = async () => {
    clearError();
    await signInWithApple();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo Section */}
        <View style={styles.logoSection}>
          <View style={styles.logoContainer}>
            <TrellisIcon size={72} color={COLORS.primary.forest} />
          </View>
          <Text style={styles.title}>Trellis</Text>
          <Text style={styles.subtitle}>
            Turn your dreams into achievable daily actions
          </Text>
        </View>

        {/* Features */}
        <View style={styles.features}>
          <FeatureItem
            icon={<Sprout size={24} color={COLORS.primary.forest} />}
            title="Plant your goals"
            description="Define what you want to achieve"
          />
          <FeatureItem
            icon={<Sparkles size={24} color={COLORS.primary.forest} />}
            title="AI-generated plans"
            description="Get personalized weekly schedules"
          />
          <FeatureItem
            icon={<Calendar size={24} color={COLORS.primary.forest} />}
            title="Calendar sync"
            description="Integrate with Google Calendar"
          />
          <FeatureItem
            icon={<TreeDeciduous size={24} color={COLORS.primary.forest} />}
            title="Watch them grow"
            description="Track progress with weekly check-ins"
          />
        </View>

        {/* Sign In */}
        <View style={styles.signInSection}>
          {error && (
            <Card variant="error" style={styles.errorCard}>
              <Text style={styles.errorText}>{error}</Text>
            </Card>
          )}
          {appleAuthAvailable && (
            <AppleAuthentication.AppleAuthenticationButton
              buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
              buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
              cornerRadius={12}
              style={styles.appleButton}
              onPress={handleAppleSignIn}
            />
          )}
          <Button onPress={handleGoogleSignIn} loading={isLoading} variant="secondary">
            Continue with Google
          </Button>
          <Text style={styles.disclaimer}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

function FeatureItem({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <View style={styles.featureItem}>
      <View style={styles.featureIconContainer}>{icon}</View>
      <View style={styles.featureText}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.secondary.cream,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingVertical: 40,
  },
  logoSection: {
    alignItems: 'center',
    paddingTop: 20,
  },
  logoContainer: {
    width: 88,
    height: 88,
    borderRadius: 24,
    backgroundColor: COLORS.primary.light,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.primary.forest,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.secondary.warm,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 24,
  },
  features: {
    gap: 20,
    paddingVertical: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  featureIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: COLORS.primary.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.secondary.bark,
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: 14,
    color: COLORS.secondary.warm,
  },
  signInSection: {
    gap: 16,
  },
  appleButton: {
    width: '100%',
    height: 50,
  },
  errorCard: {
    marginBottom: 8,
  },
  errorText: {
    color: COLORS.system.error,
    fontSize: 14,
    textAlign: 'center',
  },
  disclaimer: {
    fontSize: 12,
    color: COLORS.neutral[400],
    textAlign: 'center',
    lineHeight: 18,
  },
});
