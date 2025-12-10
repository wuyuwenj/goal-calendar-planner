import { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronRight, Zap, Target, Mountain, Settings2 } from 'lucide-react-native';
import Slider from '@react-native-community/slider';
import Animated, { FadeInUp, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { StepIndicator } from '../../components/StepIndicator';
import { Button } from '../../components/ui/Button';
import { useGoalStore } from '../../store/goal';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS } from '../../constants/theme';
import type { Timeline } from '../../types';

interface TimelineOption {
  value: Timeline;
  label: string;
  weeks: number;
  description: string;
  icon: React.ReactNode;
  recommended?: boolean;
}

const TIMELINE_OPTIONS: TimelineOption[] = [
  {
    value: '1month',
    label: '1 Month',
    weeks: 4,
    description: 'Quick sprint • Best for simple goals',
    icon: <Zap size={24} color={COLORS.primary.forest} />,
  },
  {
    value: '3months',
    label: '3 Months',
    weeks: 12,
    description: 'Balanced approach • Most popular choice',
    icon: <Target size={24} color={COLORS.primary.forest} />,
    recommended: true,
  },
  {
    value: '6months',
    label: '6 Months',
    weeks: 24,
    description: 'Deep commitment • For ambitious goals',
    icon: <Mountain size={24} color={COLORS.primary.forest} />,
  },
  {
    value: 'custom',
    label: 'Custom',
    weeks: 0,
    description: 'Choose your own timeline',
    icon: <Settings2 size={24} color={COLORS.primary.forest} />,
  },
];

function TimelineCard({
  option,
  isSelected,
  onSelect,
  index,
}: {
  option: TimelineOption;
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
            styles.timelineCard,
            isSelected && styles.timelineCardSelected,
            option.recommended && !isSelected && styles.timelineCardRecommended,
            animatedStyle,
          ]}
        >
          <View style={[styles.iconContainer, isSelected && styles.iconContainerSelected]}>
            {option.icon}
          </View>
          <View style={styles.timelineContent}>
            <View style={styles.labelRow}>
              <Text style={[styles.timelineLabel, isSelected && styles.timelineLabelSelected]}>
                {option.label}
              </Text>
              {option.recommended && (
                <View style={styles.recommendedBadge}>
                  <Text style={styles.recommendedText}>Recommended</Text>
                </View>
              )}
            </View>
            <Text style={styles.timelineDescription}>{option.description}</Text>
          </View>
          {option.weeks > 0 && (
            <Text style={[styles.weeksText, isSelected && styles.weeksTextSelected]}>
              {option.weeks}w
            </Text>
          )}
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

export default function TimelineScreen() {
  const router = useRouter();
  const { onboardingData, setOnboardingData } = useGoalStore();
  const [timeline, setTimeline] = useState<Timeline>(
    onboardingData.timeline || '3months'
  );
  const [customWeeks, setCustomWeeks] = useState(onboardingData.customWeeks || 8);

  const handleBack = () => {
    router.back();
  };

  const handleNext = () => {
    setOnboardingData({ timeline, customWeeks });
    router.push('/onboarding/availability');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <StepIndicator totalSteps={6} currentStep={4} />

          <Animated.View entering={FadeInUp.delay(100).duration(500)} style={styles.header}>
            <Text style={styles.title}>How long do you want to work on this?</Text>
            <Text style={styles.subtitle}>
              We'll break it into weekly milestones you can actually hit
            </Text>
          </Animated.View>

          <View style={styles.timelineList}>
            {TIMELINE_OPTIONS.map((option, index) => (
              <TimelineCard
                key={option.value}
                option={option}
                isSelected={timeline === option.value}
                onSelect={() => setTimeline(option.value)}
                index={index}
              />
            ))}
          </View>

          {timeline === 'custom' && (
            <Animated.View entering={FadeInUp.duration(300)} style={styles.customSection}>
              <Text style={styles.customLabel}>
                Custom duration: <Text style={styles.customValue}>{customWeeks} weeks</Text>
              </Text>
              <Slider
                minimumValue={2}
                maximumValue={52}
                step={1}
                value={customWeeks}
                onValueChange={setCustomWeeks}
                minimumTrackTintColor={COLORS.primary.forest}
                maximumTrackTintColor={COLORS.secondary.sand}
                thumbTintColor={COLORS.primary.forest}
                style={styles.slider}
              />
              <View style={styles.sliderLabels}>
                <Text style={styles.sliderLabel}>2 weeks</Text>
                <Text style={styles.sliderLabel}>1 year</Text>
              </View>
            </Animated.View>
          )}
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
  timelineList: {
    gap: SPACING.md,
  },
  timelineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.secondary.sand,
    gap: SPACING.md,
  },
  timelineCardSelected: {
    borderColor: COLORS.primary.forest,
    backgroundColor: COLORS.primary.light,
  },
  timelineCardRecommended: {
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
  timelineContent: {
    flex: 1,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: 2,
  },
  timelineLabel: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    color: COLORS.secondary.bark,
  },
  timelineLabelSelected: {
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
  timelineDescription: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.secondary.warm,
  },
  weeksText: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    color: COLORS.secondary.warm,
  },
  weeksTextSelected: {
    color: COLORS.primary.forest,
  },
  customSection: {
    marginTop: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: COLORS.primary.light,
    borderRadius: RADIUS.md,
  },
  customLabel: {
    ...TYPOGRAPHY.body,
    color: COLORS.secondary.bark,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  customValue: {
    fontWeight: '700',
    color: COLORS.primary.forest,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -SPACING.xs,
  },
  sliderLabel: {
    ...TYPOGRAPHY.caption,
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
