import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronRight, Lightbulb } from 'lucide-react-native';
import Animated, { FadeInUp, FadeIn } from 'react-native-reanimated';
import { StepIndicator } from '../../components/StepIndicator';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useGoalStore } from '../../store/goal';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS } from '../../constants/theme';
import type { GoalCategory } from '../../types';

const SUGGESTIONS: Record<GoalCategory, string[]> = {
  learning: ['Learn conversational Spanish', 'Learn Python programming', 'Play guitar songs', 'Learn portrait photography'],
  health: ['Run a 5K race', 'Lose 10 pounds through exercise', 'Build muscle with weightlifting', 'Practice daily meditation'],
  career: ['Get a promotion at work', 'Learn data science for analytics', 'Build a professional portfolio', 'Attend more industry networking events'],
  creative: ['Write a fiction novel', 'Learn watercolor painting', 'Record an original music album', 'Start a personal blog'],
  other: ['Read 12 books this year', 'Save $5000 for emergency fund', 'Learn to cook healthy meals', 'Wake up at 6 AM daily'],
};

function SuggestionChip({
  text,
  onPress,
  index,
}: {
  text: string;
  onPress: () => void;
  index: number;
}) {
  return (
    <Animated.View entering={FadeIn.delay(600 + index * 100).duration(300)}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.suggestionChip,
          pressed && styles.suggestionChipPressed,
        ]}
      >
        <Text style={styles.suggestionText}>{text}</Text>
      </Pressable>
    </Animated.View>
  );
}

export default function GoalInputScreen() {
  const router = useRouter();
  const { onboardingData, setOnboardingData } = useGoalStore();
  const [goalTitle, setGoalTitle] = useState(onboardingData.title || '');
  const [description, setDescription] = useState(onboardingData.description || '');

  const category = onboardingData.category || 'other';
  const suggestions = SUGGESTIONS[category];

  const canProceed = goalTitle.trim().length >= 3;

  const handleBack = () => {
    router.back();
  };

  const handleNext = () => {
    setOnboardingData({
      title: goalTitle.trim(),
      description: description.trim(),
    });
    router.push('/onboarding/level');
  };

  const handleSuggestionPress = (suggestion: string) => {
    setGoalTitle(suggestion);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <StepIndicator totalSteps={7} currentStep={2} />

          <Animated.View entering={FadeInUp.delay(100).duration(500)} style={styles.header}>
            <Text style={styles.title}>What's your goal?</Text>
            <Text style={styles.subtitle}>
              Be specific—the clearer your goal, the better we can help you achieve it.
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(200).duration(500)}>
            <Input
              label="I want to..."
              value={goalTitle}
              onChangeText={setGoalTitle}
              placeholder="e.g., Learn to play guitar"
              autoFocus
            />
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(300).duration(500)} style={styles.descriptionInput}>
            <Input
              label="Tell us more (optional)"
              value={description}
              onChangeText={setDescription}
              placeholder="Why is this goal important to you? Any specific outcomes?"
              multiline
              numberOfLines={3}
            />
          </Animated.View>

          {/* Suggestions Section */}
          <Animated.View entering={FadeInUp.delay(400).duration(500)} style={styles.suggestionsSection}>
            <View style={styles.suggestionsHeader}>
              <Lightbulb size={18} color={COLORS.primary.sage} />
              <Text style={styles.suggestionsTitle}>Popular goals like yours:</Text>
            </View>
            <View style={styles.suggestionsContainer}>
              {suggestions.map((suggestion, index) => (
                <SuggestionChip
                  key={suggestion}
                  text={suggestion}
                  onPress={() => handleSuggestionPress(suggestion)}
                  index={index}
                />
              ))}
            </View>
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
  descriptionInput: {
    marginTop: SPACING.md,
  },
  suggestionsSection: {
    marginTop: SPACING.xl,
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.secondary.sand,
  },
  suggestionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  suggestionsTitle: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.secondary.warm,
    fontWeight: '500',
  },
  suggestionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  suggestionChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.primary.light,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.primary.mint,
  },
  suggestionChipPressed: {
    backgroundColor: COLORS.primary.mint,
  },
  suggestionText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.primary.forest,
    fontWeight: '500',
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
