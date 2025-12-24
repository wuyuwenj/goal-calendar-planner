import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { StepIndicator } from '../../components/StepIndicator';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useGoalStore } from '../../store/goal';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS } from '../../constants/theme';

const LEVEL_PLACEHOLDERS: Record<string, string> = {
  some_experience: 'e.g., current level, what you\'ve tried before, specific goals...',
  intermediate: 'e.g., what you already know, areas to improve, target outcomes...',
  advanced: 'e.g., current abilities, what mastery looks like for you...',
};

export default function LevelDetailsScreen() {
  const router = useRouter();
  const { onboardingData, setOnboardingData } = useGoalStore();
  const [details, setDetails] = useState(onboardingData.levelDetails || '');

  const level = onboardingData.currentLevel || 'some_experience';
  const goalTitle = onboardingData.title || 'this goal';
  const placeholder = LEVEL_PLACEHOLDERS[level] || LEVEL_PLACEHOLDERS.some_experience;

  const handleBack = () => {
    router.back();
  };

  const handleSkip = () => {
    setOnboardingData({ levelDetails: '' });
    router.push('/onboarding/timeline');
  };

  const handleNext = () => {
    setOnboardingData({ levelDetails: details.trim() });
    router.push('/onboarding/timeline');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <StepIndicator totalSteps={7} currentStep={4} />

          <Animated.View entering={FadeInUp.delay(100).duration(500)} style={styles.header}>
            <Text style={styles.title}>
              Help us personalize your plan
            </Text>
            <Text style={styles.subtitle}>
              Share any details that might help us create the perfect plan for you
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(200).duration(500)} style={styles.goalContext}>
            <Text style={styles.goalLabel}>Your goal:</Text>
            <Text style={styles.goalTitle}>{goalTitle}</Text>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(300).duration(500)}>
            <Input
              label="Tell us more (optional)"
              value={details}
              onChangeText={setDetails}
              placeholder={placeholder}
              multiline
              numberOfLines={5}
              style={styles.input}
            />
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(400).duration(500)} style={styles.benefitCard}>
            <Sparkles size={20} color={COLORS.primary.forest} />
            <Text style={styles.benefitText}>
              The more you share, the better we can tailor your weekly tasks
            </Text>
          </Animated.View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.backButtonWrapper}>
          <Button
            variant="ghost"
            onPress={handleBack}
            icon={<ChevronLeft size={20} color={COLORS.secondary.bark} />}
            iconPosition="left"
            fullWidth={false}
          >
            Back
          </Button>
        </View>
        {details.trim().length === 0 ? (
          <View style={styles.nextButtonWrapper}>
            <Button
              variant="secondary"
              onPress={handleSkip}
              icon={<ChevronRight size={20} color={COLORS.secondary.bark} />}
            >
              Skip
            </Button>
          </View>
        ) : (
          <View style={styles.nextButtonWrapper}>
            <Button
              onPress={handleNext}
              icon={<ChevronRight size={20} color={COLORS.white} />}
            >
              Continue
            </Button>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
  },
  header: {
    marginBottom: SPACING.lg,
  },
  title: {
    ...TYPOGRAPHY.h2,
    color: COLORS.secondary.bark,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.secondary.warm,
    lineHeight: 24,
  },
  goalContext: {
    backgroundColor: COLORS.primary.light,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.lg,
  },
  goalLabel: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.primary.sage,
    marginBottom: SPACING.xs,
  },
  goalTitle: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    color: COLORS.primary.forest,
  },
  input: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  benefitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.primary.light,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginTop: SPACING.lg,
  },
  benefitText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.primary.forest,
    flex: 1,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.secondary.sand,
    gap: SPACING.md,
  },
  backButtonWrapper: {
    flexShrink: 0,
  },
  nextButtonWrapper: {
    flex: 1,
  },
});
