import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Pressable, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronRight, ChevronLeft, X, TrendingDown, TrendingUp, Minus } from 'lucide-react-native';
import Animated, { FadeInUp, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { StepIndicator } from '../../components/StepIndicator';
import { Button } from '../../components/ui/Button';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS } from '../../constants/theme';

type AdjustmentOption = 'decrease' | 'maintain' | 'increase';

interface OptionConfig {
  id: AdjustmentOption;
  icon: React.ReactNode;
  title: string;
  description: string;
  example: string;
}

const OPTIONS: OptionConfig[] = [
  {
    id: 'decrease',
    icon: <TrendingDown size={24} color={COLORS.primary.forest} />,
    title: 'Ease up a bit',
    description: 'Reduce task difficulty slightly',
    example: 'e.g., 3 mile run → 2.5 mile run',
  },
  {
    id: 'maintain',
    icon: <Minus size={24} color={COLORS.primary.forest} />,
    title: 'Keep current pace',
    description: 'Tasks stay at the same level',
    example: 'e.g., 3 mile run → 3 mile run',
  },
  {
    id: 'increase',
    icon: <TrendingUp size={24} color={COLORS.primary.forest} />,
    title: 'Push harder',
    description: 'Increase task difficulty slightly',
    example: 'e.g., 3 mile run → 3.5 mile run',
  },
];

function OptionCard({
  option,
  isSelected,
  isRecommended,
  onSelect,
  index,
}: {
  option: OptionConfig;
  isSelected: boolean;
  isRecommended: boolean;
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
            styles.optionCard,
            isSelected && styles.optionCardSelected,
            isRecommended && !isSelected && styles.optionCardRecommended,
            animatedStyle,
          ]}
        >
          <View style={[styles.iconContainer, isSelected && styles.iconContainerSelected]}>
            {option.icon}
          </View>
          <View style={styles.optionContent}>
            <View style={styles.titleRow}>
              <Text style={[styles.optionTitle, isSelected && styles.optionTitleSelected]}>
                {option.title}
              </Text>
              {isRecommended && (
                <View style={styles.recommendedBadge}>
                  <Text style={styles.recommendedText}>Suggested</Text>
                </View>
              )}
            </View>
            <Text style={styles.optionDescription}>{option.description}</Text>
            <Text style={styles.optionExample}>{option.example}</Text>
          </View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

export default function CheckInAdjustScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const taskResults = JSON.parse((params.taskResults as string) || '[]');
  const weekNumber = parseInt(params.weekNumber as string, 10) || 1;
  const completionRate = parseInt(params.completionRate as string, 10) || 0;

  // Determine recommended option based on completion rate
  const getRecommendedOption = (): AdjustmentOption => {
    if (completionRate < 50) return 'decrease';
    if (completionRate === 100) return 'increase';
    return 'maintain';
  };

  const [selectedOption, setSelectedOption] = useState<AdjustmentOption>(getRecommendedOption());

  const handleNext = () => {
    router.push({
      pathname: '/checkin/notes',
      params: {
        taskResults: JSON.stringify(taskResults),
        weekNumber: weekNumber.toString(),
        adjustment: selectedOption,
      },
    });
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <X size={24} color={COLORS.secondary.bark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Weekly Check-in</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <StepIndicator totalSteps={3} currentStep={2} />

          <Animated.View entering={FadeInUp.delay(100).duration(500)} style={styles.titleSection}>
            <Text style={styles.title}>Adjust your plan?</Text>
            <Text style={styles.subtitle}>
              Based on how this week went, would you like to adjust the intensity of next week's tasks?
            </Text>
          </Animated.View>

          {/* Completion Summary */}
          <Animated.View entering={FadeInUp.delay(150).duration(500)} style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>This week's completion</Text>
            <Text style={styles.summaryValue}>{completionRate}%</Text>
          </Animated.View>

          {/* Options */}
          <View style={styles.optionsList}>
            {OPTIONS.map((option, index) => (
              <OptionCard
                key={option.id}
                option={option}
                isSelected={selectedOption === option.id}
                isRecommended={getRecommendedOption() === option.id}
                onSelect={() => setSelectedOption(option.id)}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.secondary.sand,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.secondary.bark,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  titleSection: {
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
  summaryCard: {
    backgroundColor: COLORS.primary.light,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    alignItems: 'center',
  },
  summaryLabel: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.primary.sage,
    marginBottom: SPACING.xs,
  },
  summaryValue: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.primary.forest,
  },
  optionsList: {
    gap: SPACING.md,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.secondary.sand,
    gap: SPACING.md,
  },
  optionCardSelected: {
    borderColor: COLORS.primary.forest,
    backgroundColor: COLORS.primary.light,
  },
  optionCardRecommended: {
    borderColor: COLORS.primary.sage,
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
  optionContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: 2,
  },
  optionTitle: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    color: COLORS.secondary.bark,
  },
  optionTitleSelected: {
    color: COLORS.primary.forest,
  },
  recommendedBadge: {
    backgroundColor: COLORS.primary.mint,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  recommendedText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary.forest,
    fontWeight: '600',
  },
  optionDescription: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.secondary.warm,
    marginBottom: 4,
  },
  optionExample: {
    ...TYPOGRAPHY.caption,
    color: COLORS.neutral[400],
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
