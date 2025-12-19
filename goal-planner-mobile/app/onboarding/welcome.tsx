import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Check } from 'lucide-react-native';
import { TrellisIcon } from '../../components/TrellisIcon';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withDelay,
  FadeIn,
  FadeInUp
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS } from '../../constants/theme';

const BENEFITS = [
  'AI-powered weekly plans tailored to you',
  'Smart calendar sync keeps you on track',
  'Track progress and celebrate wins',
];

export default function WelcomeScreen() {
  const router = useRouter();
  const logoScale = useSharedValue(0.8);

  useEffect(() => {
    logoScale.value = withDelay(300, withSpring(1, { damping: 12 }));
  }, []);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
  }));

  const handleGetStarted = () => {
    router.push('./intent' as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo */}
        <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
          <View style={styles.logoCircle}>
            <TrellisIcon size={72} color={COLORS.primary.forest} />
          </View>
        </Animated.View>

        {/* Headline */}
        <Animated.View entering={FadeInUp.delay(400).duration(600)}>
          <Text style={styles.welcomeText}>Welcome to</Text>
          <Text style={styles.appName}>Trellis</Text>
        </Animated.View>

        {/* Value Proposition */}
        <Animated.View
          entering={FadeInUp.delay(600).duration(600)}
          style={styles.valueProposition}
        >
          <Text style={styles.tagline}>
            Turn your dreams into achievable daily actions
          </Text>
        </Animated.View>

        {/* Benefits List */}
        <Animated.View
          entering={FadeInUp.delay(800).duration(600)}
          style={styles.benefitsContainer}
        >
          {BENEFITS.map((benefit, index) => (
            <Animated.View
              key={index}
              entering={FadeIn.delay(900 + index * 150).duration(400)}
              style={styles.benefitRow}
            >
              <View style={styles.checkCircle}>
                <Check size={14} color={COLORS.white} strokeWidth={3} />
              </View>
              <Text style={styles.benefitText}>{benefit}</Text>
            </Animated.View>
          ))}
        </Animated.View>
      </View>

      {/* Footer */}
      <Animated.View
        entering={FadeInUp.delay(1200).duration(600)}
        style={styles.footer}
      >
        <Button onPress={handleGetStarted} size="lg">
          Let's Get Started
        </Button>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.secondary.cream,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xxl,
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: SPACING.xl,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primary.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeText: {
    ...TYPOGRAPHY.h2,
    color: COLORS.secondary.warm,
    textAlign: 'center',
  },
  appName: {
    fontSize: 36,
    fontWeight: '700',
    color: COLORS.primary.forest,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  valueProposition: {
    marginBottom: SPACING.xl,
  },
  tagline: {
    ...TYPOGRAPHY.body,
    color: COLORS.secondary.bark,
    textAlign: 'center',
    lineHeight: 24,
  },
  benefitsContainer: {
    width: '100%',
    gap: SPACING.md,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary.forest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitText: {
    ...TYPOGRAPHY.body,
    color: COLORS.secondary.bark,
    flex: 1,
  },
  footer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    gap: SPACING.sm,
  },
});
