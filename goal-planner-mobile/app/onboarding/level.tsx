import { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronRight, Sprout, Leaf, TreeDeciduous, Trophy } from 'lucide-react-native';
import Animated, { FadeInUp, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { StepIndicator } from '../../components/StepIndicator';
import { Button } from '../../components/ui/Button';
import { useGoalStore } from '../../store/goal';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS } from '../../constants/theme';
import type { ExperienceLevel } from '../../types';

interface LevelOption {
  value: ExperienceLevel;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const LEVEL_OPTIONS: LevelOption[] = [
  {
    value: 'beginner',
    label: 'Complete Beginner',
    description: 'Never tried this before',
    icon: <Sprout size={24} color={COLORS.primary.forest} />,
  },
  {
    value: 'some_experience',
    label: 'Some Experience',
    description: 'Tried a few times',
    icon: <Leaf size={24} color={COLORS.primary.forest} />,
  },
  {
    value: 'intermediate',
    label: 'Intermediate',
    description: 'Comfortable with basics',
    icon: <TreeDeciduous size={24} color={COLORS.primary.forest} />,
  },
  {
    value: 'advanced',
    label: 'Advanced',
    description: 'Looking to master',
    icon: <Trophy size={24} color={COLORS.primary.forest} />,
  },
];

function LevelCard({
  option,
  isSelected,
  onSelect,
  index,
}: {
  option: LevelOption;
  isSelected: boolean;
  onSelect: () => void;
  index: number;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <Animated.View entering={FadeInUp.delay(200 + index * 100).duration(400)}>
      <Pressable
        onPress={onSelect}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Animated.View
          style={[
            styles.levelCard,
            isSelected && styles.levelCardSelected,
            animatedStyle,
          ]}
        >
          <View style={[styles.iconContainer, isSelected && styles.iconContainerSelected]}>
            {option.icon}
          </View>
          <View style={styles.levelContent}>
            <Text style={[styles.levelLabel, isSelected && styles.levelLabelSelected]}>
              {option.label}
            </Text>
            <Text style={styles.levelDescription}>{option.description}</Text>
          </View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

export default function LevelScreen() {
  const router = useRouter();
  const { onboardingData, setOnboardingData } = useGoalStore();
  const [level, setLevel] = useState<ExperienceLevel | null>(
    onboardingData.currentLevel || null
  );

  const goalTitle = onboardingData.title || 'this goal';

  const handleBack = () => {
    router.back();
  };

  const handleNext = () => {
    if (level) {
      setOnboardingData({ currentLevel: level });
      // Skip level-details for beginners, go straight to timeline
      if (level === 'beginner') {
        router.push('/onboarding/timeline');
      } else {
        router.push('/onboarding/level-details');
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <StepIndicator totalSteps={7} currentStep={3} />

          <Animated.View entering={FadeInUp.delay(100).duration(500)} style={styles.header}>
            <Text style={styles.title}>
              What's your experience with{'\n'}
              <Text style={styles.goalHighlight}>{goalTitle}</Text>?
            </Text>
            <Text style={styles.subtitle}>
              This helps us create the perfect plan for you
            </Text>
          </Animated.View>

          <View style={styles.levelsList}>
            {LEVEL_OPTIONS.map((option, index) => (
              <LevelCard
                key={option.value}
                option={option}
                isSelected={level === option.value}
                onSelect={() => setLevel(option.value)}
                index={index}
              />
            ))}
          </View>
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
            disabled={!level}
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
    lineHeight: 32,
  },
  goalHighlight: {
    color: COLORS.primary.forest,
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.secondary.warm,
  },
  levelsList: {
    gap: SPACING.md,
  },
  levelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.secondary.sand,
    gap: SPACING.md,
  },
  levelCardSelected: {
    borderColor: COLORS.primary.forest,
    backgroundColor: COLORS.primary.light,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.primary.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerSelected: {
    backgroundColor: COLORS.white,
  },
  levelContent: {
    flex: 1,
  },
  levelLabel: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    color: COLORS.secondary.bark,
    marginBottom: 2,
  },
  levelLabelSelected: {
    color: COLORS.primary.forest,
  },
  levelDescription: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.secondary.warm,
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
