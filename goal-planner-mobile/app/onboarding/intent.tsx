import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronRight, Target, Dumbbell, TrendingUp, Palette, Sparkles } from 'lucide-react-native';
import Animated, { FadeInUp, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { StepIndicator } from '../../components/StepIndicator';
import { Button } from '../../components/ui/Button';
import { useGoalStore } from '../../store/goal';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS, SHADOWS } from '../../constants/theme';
import type { GoalCategory } from '../../types';

interface CategoryOption {
  id: GoalCategory;
  icon: React.ReactNode;
  title: string;
  description: string;
}

const CATEGORIES: CategoryOption[] = [
  {
    id: 'learning',
    icon: <Target size={24} color={COLORS.primary.forest} />,
    title: 'Learning a new skill',
    description: 'Guitar, coding, language, etc.',
  },
  {
    id: 'health',
    icon: <Dumbbell size={24} color={COLORS.primary.forest} />,
    title: 'Health & Fitness',
    description: 'Running, gym, diet, wellness',
  },
  {
    id: 'career',
    icon: <TrendingUp size={24} color={COLORS.primary.forest} />,
    title: 'Career Growth',
    description: 'Promotion, skills, networking',
  },
  {
    id: 'creative',
    icon: <Palette size={24} color={COLORS.primary.forest} />,
    title: 'Creative Project',
    description: 'Writing, art, music, design',
  },
  {
    id: 'other',
    icon: <Sparkles size={24} color={COLORS.primary.forest} />,
    title: 'Something else',
    description: 'Personal goals, habits, etc.',
  },
];

function CategoryCard({
  category,
  isSelected,
  onSelect,
  index,
}: {
  category: CategoryOption;
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
            styles.categoryCard,
            isSelected && styles.categoryCardSelected,
            animatedStyle,
          ]}
        >
          <View style={[styles.iconContainer, isSelected && styles.iconContainerSelected]}>
            {category.icon}
          </View>
          <View style={styles.categoryContent}>
            <Text style={[styles.categoryTitle, isSelected && styles.categoryTitleSelected]}>
              {category.title}
            </Text>
            <Text style={styles.categoryDescription}>{category.description}</Text>
          </View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

export default function IntentScreen() {
  const router = useRouter();
  const { onboardingData, setOnboardingData } = useGoalStore();
  const [selectedCategory, setSelectedCategory] = useState<GoalCategory | null>(
    onboardingData.category || null
  );

  const canProceed = selectedCategory !== null;

  const handleBack = () => {
    router.back();
  };

  const handleNext = () => {
    if (selectedCategory) {
      setOnboardingData({ category: selectedCategory });
      router.push('./goal' as any);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <StepIndicator totalSteps={6} currentStep={1} />

          <Animated.View entering={FadeInUp.delay(100).duration(500)} style={styles.header}>
            <Text style={styles.title}>What brings you to Trellis?</Text>
            <Text style={styles.subtitle}>
              This helps us personalize your experience
            </Text>
          </Animated.View>

          <View style={styles.categoriesList}>
            {CATEGORIES.map((category, index) => (
              <CategoryCard
                key={category.id}
                category={category}
                isSelected={selectedCategory === category.id}
                onSelect={() => setSelectedCategory(category.id)}
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
  },
  categoriesList: {
    gap: SPACING.md,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.secondary.sand,
    gap: SPACING.md,
  },
  categoryCardSelected: {
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
  categoryContent: {
    flex: 1,
  },
  categoryTitle: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    color: COLORS.secondary.bark,
    marginBottom: 2,
  },
  categoryTitleSelected: {
    color: COLORS.primary.forest,
  },
  categoryDescription: {
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
