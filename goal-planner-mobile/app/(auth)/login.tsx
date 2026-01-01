import React, { ReactNode, useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Platform, Pressable, TextInput, Modal, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Sprout, Sparkles, Calendar, TreeDeciduous, X } from 'lucide-react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { TrellisIcon } from '../../components/TrellisIcon';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useAuthStore } from '../../store/auth';
import { COLORS } from '../../constants/theme';

export default function LoginScreen() {
  const router = useRouter();
  const { signInWithGoogle, signInWithApple, signInWithEmail, isAuthenticated, isLoading, error, clearError } =
    useAuthStore();
  const [appleAuthAvailable, setAppleAuthAvailable] = useState(false);

  // Hidden demo login state
  const [tapCount, setTapCount] = useState(0);
  const [showDemoLogin, setShowDemoLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const tapTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      // Close demo login modal if open
      if (showDemoLogin) {
        setShowDemoLogin(false);
      }
      router.replace('/(tabs)');
    }
  }, [isAuthenticated]);

  useEffect(() => {
    // Check if Apple Authentication is available (iOS 13+)
    if (Platform.OS === 'ios') {
      AppleAuthentication.isAvailableAsync().then(setAppleAuthAvailable);
    }
  }, []);

  const handleLogoTap = () => {
    // Reset tap count after 2 seconds of no taps
    if (tapTimeoutRef.current) {
      clearTimeout(tapTimeoutRef.current);
    }

    const newCount = tapCount + 1;
    setTapCount(newCount);

    if (newCount >= 5) {
      setShowDemoLogin(true);
      setTapCount(0);
    } else {
      tapTimeoutRef.current = setTimeout(() => {
        setTapCount(0);
      }, 2000);
    }
  };

  const handleGoogleSignIn = async () => {
    clearError();
    await signInWithGoogle();
  };

  const handleAppleSignIn = async () => {
    clearError();
    await signInWithApple();
  };

  const handleEmailSignIn = async () => {
    clearError();
    if (!email || !password) {
      return;
    }
    await signInWithEmail(email, password);
  };

  const closeDemoLogin = () => {
    setShowDemoLogin(false);
    setEmail('');
    setPassword('');
    clearError();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo Section - Tap 5 times to reveal demo login */}
        <View style={styles.logoSection}>
          <Pressable onPress={handleLogoTap}>
            <View style={styles.logoContainer}>
              <TrellisIcon size={72} color={COLORS.primary.forest} />
            </View>
          </Pressable>
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

      {/* Hidden Demo Login Modal */}
      <Modal
        visible={showDemoLogin}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeDemoLogin}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <SafeAreaView style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Demo Login</Text>
              <Pressable onPress={closeDemoLogin} style={styles.closeButton}>
                <X size={24} color={COLORS.neutral[600]} />
              </Pressable>
            </View>

            {error && (
              <Card variant="error" style={styles.errorCard}>
                <Text style={styles.errorText}>{error}</Text>
              </Card>
            )}

            <View style={styles.formContainer}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="demo@trellis.app"
                placeholderTextColor={COLORS.neutral[400]}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
              />

              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter password"
                placeholderTextColor={COLORS.neutral[400]}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />

              <Button
                onPress={handleEmailSignIn}
                loading={isLoading}
                style={styles.signInButton}
              >
                Sign In
              </Button>
            </View>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </Modal>
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
  // Demo login modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.secondary.cream,
  },
  modalContent: {
    flex: 1,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.secondary.bark,
  },
  closeButton: {
    padding: 8,
  },
  formContainer: {
    gap: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.secondary.bark,
    marginBottom: 4,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: COLORS.neutral[300],
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: COLORS.secondary.bark,
    backgroundColor: COLORS.neutral[50],
  },
  signInButton: {
    marginTop: 8,
  },
});
