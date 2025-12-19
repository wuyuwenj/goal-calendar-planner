import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PartyPopper, Calendar, Bell, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withSequence,
  withRepeat,
  FadeIn,
  FadeInUp,
  ZoomIn,
} from 'react-native-reanimated';
import { Button } from '../../components/ui/Button';
import { useGoalStore } from '../../store/goal';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS } from '../../constants/theme';

const WHAT_HAPPENS_NEXT = [
  {
    icon: <Calendar size={20} color={COLORS.primary.forest} />,
    title: 'Weekly tasks added',
    description: 'Your personalized plan is ready',
  },
  {
    icon: <Bell size={20} color={COLORS.primary.forest} />,
    title: 'Get reminders',
    description: "We'll nudge you at the right time",
  },
  {
    icon: <CheckCircle2 size={20} color={COLORS.primary.forest} />,
    title: 'Track progress',
    description: 'See your journey unfold',
  },
];

export default function SuccessScreen() {
  const router = useRouter();
  const { onboardingData, resetOnboarding } = useGoalStore();
  const goalTitle = onboardingData.title || 'your goal';

  // Animation values
  const celebrationScale = useSharedValue(0);
  const sparkleRotation = useSharedValue(0);

  useEffect(() => {
    // Celebration icon entrance
    celebrationScale.value = withDelay(
      200,
      withSpring(1, { damping: 10, stiffness: 100 })
    );

    // Sparkle rotation
    sparkleRotation.value = withRepeat(
      withSequence(
        withSpring(15, { damping: 10 }),
        withSpring(-15, { damping: 10 })
      ),
      -1,
      true
    );
  }, []);

  const celebrationStyle = useAnimatedStyle(() => ({
    transform: [{ scale: celebrationScale.value }],
  }));

  const sparkleStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${sparkleRotation.value}deg` }],
  }));

  const handleGoToDashboard = () => {
    resetOnboarding();
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Celebration Icon */}
        <Animated.View style={[styles.celebrationContainer, celebrationStyle]}>
          <View style={styles.celebrationCircle}>
            <PartyPopper size={48} color={COLORS.primary.forest} strokeWidth={1.5} />
          </View>
          <Animated.View style={[styles.sparkle, styles.sparkleTopRight, sparkleStyle]}>
            <Sparkles size={20} color={COLORS.primary.mint} />
          </Animated.View>
          <Animated.View style={[styles.sparkle, styles.sparkleBottomLeft, sparkleStyle]}>
            <Sparkles size={16} color={COLORS.primary.sage} />
          </Animated.View>
        </Animated.View>

        {/* Success Message */}
        <Animated.View entering={FadeInUp.delay(400).duration(600)} style={styles.messageContainer}>
          <Text style={styles.congratsText}>You're all set!</Text>
          <Text style={styles.goalText}>
            Your journey to{'\n'}
            <Text style={styles.goalHighlight}>{goalTitle}</Text>
            {'\n'}starts now
          </Text>
        </Animated.View>

        {/* What Happens Next */}
        <Animated.View entering={FadeInUp.delay(600).duration(600)} style={styles.nextStepsCard}>
          <Text style={styles.nextStepsTitle}>What happens next</Text>
          {WHAT_HAPPENS_NEXT.map((item, index) => (
            <Animated.View
              key={index}
              entering={FadeIn.delay(800 + index * 150).duration(400)}
              style={styles.nextStepRow}
            >
              <View style={styles.nextStepIcon}>{item.icon}</View>
              <View style={styles.nextStepContent}>
                <Text style={styles.nextStepTitle}>{item.title}</Text>
                <Text style={styles.nextStepDescription}>{item.description}</Text>
              </View>
            </Animated.View>
          ))}
        </Animated.View>

        {/* Motivational Quote */}
        <Animated.View entering={FadeIn.delay(1200).duration(600)} style={styles.quoteContainer}>
          <Text style={styles.quoteText}>
            "The journey of a thousand miles begins with a single step."
          </Text>
          <Text style={styles.quoteAuthor}>— Lao Tzu</Text>
        </Animated.View>
      </View>

      {/* Footer */}
      <Animated.View entering={FadeInUp.delay(1400).duration(600)} style={styles.footer}>
        <Button
          onPress={handleGoToDashboard}
          size="lg"
          icon={<ArrowRight size={20} color={COLORS.white} />}
        >
          Go to Dashboard
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
  celebrationContainer: {
    position: 'relative',
    marginBottom: SPACING.xl,
  },
  celebrationCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.primary.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparkle: {
    position: 'absolute',
  },
  sparkleTopRight: {
    top: -10,
    right: -10,
  },
  sparkleBottomLeft: {
    bottom: 0,
    left: -10,
  },
  messageContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  congratsText: {
    ...TYPOGRAPHY.h1,
    color: COLORS.primary.forest,
    marginBottom: SPACING.sm,
  },
  goalText: {
    ...TYPOGRAPHY.h3,
    color: COLORS.secondary.bark,
    textAlign: 'center',
    lineHeight: 28,
  },
  goalHighlight: {
    color: COLORS.primary.forest,
    fontWeight: '700',
  },
  nextStepsCard: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.secondary.sand,
  },
  nextStepsTitle: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '600',
    color: COLORS.secondary.warm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.md,
  },
  nextStepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  nextStepIcon: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.primary.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextStepContent: {
    flex: 1,
  },
  nextStepTitle: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    color: COLORS.secondary.bark,
    marginBottom: 2,
  },
  nextStepDescription: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.secondary.warm,
  },
  quoteContainer: {
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  quoteText: {
    ...TYPOGRAPHY.body,
    fontStyle: 'italic',
    color: COLORS.secondary.warm,
    textAlign: 'center',
    lineHeight: 24,
  },
  quoteAuthor: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.secondary.warm,
    marginTop: SPACING.xs,
  },
  footer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
  },
});
