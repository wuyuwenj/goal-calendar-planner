import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Sprout } from 'lucide-react-native';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useAuthStore } from '../../store/auth';
import { COLORS } from '../../constants/theme';
import { useEffect } from 'react';

export default function LoginScreen() {
  const router = useRouter();
  const { signInWithGoogle, isAuthenticated, isLoading, error, clearError } =
    useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated]);

  const handleGoogleSignIn = async () => {
    clearError();
    await signInWithGoogle();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo Section */}
        <View style={styles.logoSection}>
          <View style={styles.logoContainer}>
            <Sprout size={48} color={COLORS.primary.forest} />
          </View>
          <Text style={styles.title}>Trellis</Text>
          <Text style={styles.subtitle}>
            AI-powered weekly schedules to help you achieve your goals
          </Text>
        </View>

        {/* Features */}
        <View style={styles.features}>
          <FeatureItem
            emoji="🌱"
            title="Plant your goals"
            description="Define what you want to achieve"
          />
          <FeatureItem
            emoji="🤖"
            title="AI-generated plans"
            description="Get personalized weekly schedules"
          />
          <FeatureItem
            emoji="📅"
            title="Calendar sync"
            description="Integrate with Google Calendar"
          />
          <FeatureItem
            emoji="🌳"
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
          <Button onPress={handleGoogleSignIn} loading={isLoading}>
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
  emoji,
  title,
  description,
}: {
  emoji: string;
  title: string;
  description: string;
}) {
  return (
    <View style={styles.featureItem}>
      <Text style={styles.featureEmoji}>{emoji}</Text>
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
  featureEmoji: {
    fontSize: 28,
    width: 36,
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
