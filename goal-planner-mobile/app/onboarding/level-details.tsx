import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { StepIndicator } from '../../components/StepIndicator';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useGoalStore } from '../../store/goal';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS } from '../../constants/theme';

const LEVEL_PLACEHOLDERS: Record<string, string> = {
  some_experience: 'e.g., I tried learning guitar a few years ago but stopped after a month...',
  intermediate: 'e.g., I play guitar regularly and know basic chords, but want to learn fingerpicking...',
  advanced: 'e.g., I\'ve been playing for 5 years and can play most songs, but want to master jazz improvisation...',
};

const LEVEL_PROMPTS: Record<string, string> = {
  some_experience: 'What have you tried before? What stopped you from continuing?',
  intermediate: 'What do you already know? What specific areas do you want to improve?',
  advanced: 'What\'s your current skill level? What mastery looks like for you?',
};

export default function LevelDetailsScreen() {
  const router = useRouter();
  const { onboardingData, setOnboardingData } = useGoalStore();
  const [details, setDetails] = useState(onboardingData.levelDetails || '');

  const level = onboardingData.currentLevel || 'some_experience';
  const goalTitle = onboardingData.title || 'this goal';
  const placeholder = LEVEL_PLACEHOLDERS[level] || LEVEL_PLACEHOLDERS.some_experience;
  const prompt = LEVEL_PROMPTS[level] || LEVEL_PROMPTS.some_experience;

  const canProceed = details.trim().length >= 10;

  const handleBack = () => {
    router.back();
  };

  const handleNext = () => {
    setOnboardingData({ levelDetails: details });
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
              Tell us about your experience
            </Text>
            <Text style={styles.subtitle}>
              {prompt}
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(200).duration(500)} style={styles.goalContext}>
            <Text style={styles.goalLabel}>Your goal:</Text>
            <Text style={styles.goalTitle}>{goalTitle}</Text>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(300).duration(500)}>
            <Input
              value={details}
              onChangeText={setDetails}
              placeholder={placeholder}
              multiline
              numberOfLines={6}
              style={styles.input}
            />
            <Text style={styles.hint}>
              The more detail you provide, the better we can personalize your plan
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
        <View style={styles.nextButtonWrapper}>
          <Button
            onPress={handleNext}
            disabled={!canProceed}
            icon={<ChevronRight size={20} color={COLORS.white} />}
          >
            Continue
          </Button>
        </View>
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
    minHeight: 150,
    textAlignVertical: 'top',
  },
  hint: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.secondary.warm,
    marginTop: SPACING.sm,
    fontStyle: 'italic',
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
