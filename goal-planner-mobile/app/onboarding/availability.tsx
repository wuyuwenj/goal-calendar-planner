import { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Modal, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronRight, Clock, X } from 'lucide-react-native';
import Animated, { FadeInUp, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { StepIndicator } from '../../components/StepIndicator';
import { Button } from '../../components/ui/Button';
import { useGoalStore } from '../../store/goal';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS } from '../../constants/theme';

// Days starting from Monday
const DAYS = [
  { index: 1, short: 'M', name: 'Monday' },
  { index: 2, short: 'T', name: 'Tuesday' },
  { index: 3, short: 'W', name: 'Wednesday' },
  { index: 4, short: 'T', name: 'Thursday' },
  { index: 5, short: 'F', name: 'Friday' },
  { index: 6, short: 'S', name: 'Saturday' },
  { index: 0, short: 'S', name: 'Sunday' },
];

// Generate time options from 5:00 AM to 11:00 PM in 30-minute increments
const TIME_OPTIONS: string[] = [];
for (let hour = 5; hour <= 23; hour++) {
  TIME_OPTIONS.push(`${String(hour).padStart(2, '0')}:00`);
  if (hour < 23) {
    TIME_OPTIONS.push(`${String(hour).padStart(2, '0')}:30`);
  }
}

const formatTimeDisplay = (time: string): string => {
  const [hourStr, minute] = time.split(':');
  const hour = parseInt(hourStr);
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${displayHour}:${minute} ${period}`;
};

function DayPill({
  day,
  isSelected,
  onPress,
  index,
}: {
  day: { index: number; short: string; name: string };
  isSelected: boolean;
  onPress: () => void;
  index: number;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.9);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <Animated.View entering={FadeInUp.delay(200 + index * 50).duration(300)}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Animated.View
          style={[
            styles.dayPill,
            isSelected && styles.dayPillSelected,
            animatedStyle,
          ]}
        >
          <Text style={[styles.dayPillText, isSelected && styles.dayPillTextSelected]}>
            {day.short}
          </Text>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

export default function AvailabilityScreen() {
  const router = useRouter();
  const { onboardingData, setOnboardingData, createGoal, checkPendingGoal, clearPendingGoal, isLoading } = useGoalStore();

  const [selectedDays, setSelectedDays] = useState<number[]>([1, 3, 5]); // Mon, Wed, Fri default
  const [startTime, setStartTime] = useState('17:00');
  const [endTime, setEndTime] = useState('19:00');

  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<'startTime' | 'endTime' | null>(null);

  // Pending goal state
  const [pendingState, setPendingState] = useState<{
    isPending: boolean;
    pendingId: string | null;
    pollCount: number;
    error: string | null;
  }>({ isPending: false, pendingId: null, pollCount: 0, error: null });

  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const MAX_POLL_COUNT = 30;

  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  const startPolling = (pendingId: string) => {
    setPendingState({ isPending: true, pendingId, pollCount: 0, error: null });

    pollIntervalRef.current = setInterval(async () => {
      setPendingState((prev) => {
        if (prev.pollCount >= MAX_POLL_COUNT) {
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
          }
          return {
            ...prev,
            isPending: false,
            error: 'Goal creation is taking longer than expected. Please check your goals later.',
          };
        }
        return { ...prev, pollCount: prev.pollCount + 1 };
      });

      try {
        const result = await checkPendingGoal(pendingId);

        if (result.status === 'completed') {
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
          }
          clearPendingGoal();
          router.replace('./success' as any);
        } else if (result.status === 'failed') {
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
          }
          setPendingState((prev) => ({
            ...prev,
            isPending: false,
            error: result.error || 'Failed to create goal. Please try again.',
          }));
        }
      } catch (error) {
        console.error('Error polling pending goal:', error);
      }
    }, 10000);
  };

  const toggleDay = (dayIndex: number) => {
    setSelectedDays((prev) => {
      if (prev.includes(dayIndex)) {
        return prev.filter((d) => d !== dayIndex);
      } else {
        return [...prev, dayIndex];
      }
    });
  };

  const openTimePicker = (field: 'startTime' | 'endTime') => {
    setPickerTarget(field);
    setPickerVisible(true);
  };

  const selectTime = (time: string) => {
    if (!pickerTarget) return;

    if (pickerTarget === 'startTime') {
      setStartTime(time);
      if (time >= endTime) {
        const timeIndex = TIME_OPTIONS.indexOf(time);
        if (timeIndex < TIME_OPTIONS.length - 1) {
          setEndTime(TIME_OPTIONS[timeIndex + 1]);
        }
      }
    } else {
      setEndTime(time);
      if (time <= startTime) {
        const timeIndex = TIME_OPTIONS.indexOf(time);
        if (timeIndex > 0) {
          setStartTime(TIME_OPTIONS[timeIndex - 1]);
        }
      }
    }

    setPickerVisible(false);
    setPickerTarget(null);
  };

  const handleBack = () => {
    router.back();
  };

  const handleCreate = async () => {
    const availability = selectedDays.map((dayIndex) => ({
      dayOfWeek: dayIndex,
      startTime,
      endTime,
    }));

    setOnboardingData({ availability });
    setPendingState({ isPending: false, pendingId: null, pollCount: 0, error: null });

    try {
      const result = await createGoal({
        ...onboardingData,
        availability,
      } as any);

      if (result && 'pending' in result && result.pending) {
        startPolling(result.pendingId);
      } else {
        router.replace('./success' as any);
      }
    } catch (error: any) {
      console.error('Failed to create goal:', error);
      if (error.pending && error.pendingId) {
        startPolling(error.pendingId);
      } else {
        setPendingState((prev) => ({
          ...prev,
          error: error.message || 'Failed to create goal. Please try again.',
        }));
      }
    }
  };

  const handleRetry = () => {
    setPendingState({ isPending: false, pendingId: null, pollCount: 0, error: null });
  };

  const canProceed = selectedDays.length > 0;

  const getFilteredTimeOptions = () => {
    if (!pickerTarget) return TIME_OPTIONS;

    if (pickerTarget === 'endTime') {
      const startIndex = TIME_OPTIONS.indexOf(startTime);
      return TIME_OPTIONS.slice(startIndex + 1);
    } else {
      const endIndex = TIME_OPTIONS.indexOf(endTime);
      return TIME_OPTIONS.slice(0, endIndex);
    }
  };

  const selectedDayNames = selectedDays
    .map((i) => DAYS.find((d) => d.index === i)?.name)
    .filter(Boolean)
    .join(', ');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <StepIndicator totalSteps={6} currentStep={5} />

          <Animated.View entering={FadeInUp.delay(100).duration(500)} style={styles.header}>
            <Text style={styles.title}>When can you practice?</Text>
            <Text style={styles.subtitle}>
              Pick the days and time that work best for you
            </Text>
          </Animated.View>

          {/* Day Pills Row */}
          <Animated.View entering={FadeInUp.delay(200).duration(500)} style={styles.daysSection}>
            <Text style={styles.sectionLabel}>Select days</Text>
            <View style={styles.daysRow}>
              {DAYS.map((day, index) => (
                <DayPill
                  key={day.index}
                  day={day}
                  isSelected={selectedDays.includes(day.index)}
                  onPress={() => toggleDay(day.index)}
                  index={index}
                />
              ))}
            </View>
            {selectedDays.length > 0 && (
              <Text style={styles.selectedDaysText}>
                {selectedDayNames}
              </Text>
            )}
          </Animated.View>

          {/* Time Range */}
          <Animated.View entering={FadeInUp.delay(400).duration(500)} style={styles.timeSection}>
            <Text style={styles.sectionLabel}>Preferred time</Text>
            <View style={styles.timeRangeContainer}>
              <Pressable
                style={styles.timeButton}
                onPress={() => openTimePicker('startTime')}
              >
                <Clock size={18} color={COLORS.primary.forest} />
                <Text style={styles.timeButtonText}>{formatTimeDisplay(startTime)}</Text>
              </Pressable>

              <Text style={styles.timeSeparator}>to</Text>

              <Pressable
                style={styles.timeButton}
                onPress={() => openTimePicker('endTime')}
              >
                <Clock size={18} color={COLORS.primary.forest} />
                <Text style={styles.timeButtonText}>{formatTimeDisplay(endTime)}</Text>
              </Pressable>
            </View>
          </Animated.View>

          {/* Summary Card */}
          {selectedDays.length > 0 && (
            <Animated.View entering={FadeInUp.delay(500).duration(500)} style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Your schedule</Text>
              <Text style={styles.summaryText}>
                {selectedDays.length} day{selectedDays.length > 1 ? 's' : ''} per week, {formatTimeDisplay(startTime)} - {formatTimeDisplay(endTime)}
              </Text>
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
            onPress={handleCreate}
            disabled={!canProceed}
            loading={isLoading}
            icon={<ChevronRight size={20} color={COLORS.white} />}
          >
            Create Goal
          </Button>
        </View>
      </View>

      {/* Time Picker Modal */}
      <Modal
        visible={pickerVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPickerVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Select {pickerTarget === 'startTime' ? 'Start' : 'End'} Time
              </Text>
              <Pressable
                onPress={() => setPickerVisible(false)}
                style={styles.modalCloseButton}
              >
                <X size={24} color={COLORS.secondary.bark} />
              </Pressable>
            </View>
            <ScrollView style={styles.timeList}>
              {getFilteredTimeOptions().map((time) => (
                <Pressable
                  key={time}
                  style={({ pressed }) => [
                    styles.timeOption,
                    pressed && styles.timeOptionPressed,
                  ]}
                  onPress={() => selectTime(time)}
                >
                  <Text style={styles.timeOptionText}>
                    {formatTimeDisplay(time)}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Processing/Pending Modal */}
      <Modal
        visible={pendingState.isPending || !!pendingState.error}
        transparent
        animationType="fade"
      >
        <View style={styles.pendingOverlay}>
          <View style={styles.pendingContent}>
            {pendingState.isPending ? (
              <>
                <ActivityIndicator size="large" color={COLORS.primary.forest} />
                <Text style={styles.pendingTitle}>Creating your plan...</Text>
                <Text style={styles.pendingSubtitle}>
                  Our AI is crafting a personalized plan just for you.
                </Text>
                <Text style={styles.pendingHint}>
                  This may take a moment. Please don't close the app.
                </Text>
              </>
            ) : pendingState.error ? (
              <>
                <View style={styles.errorIcon}>
                  <X size={32} color={COLORS.system.error} />
                </View>
                <Text style={styles.pendingTitle}>Something went wrong</Text>
                <Text style={styles.pendingSubtitle}>{pendingState.error}</Text>
                <View style={styles.retryButton}>
                  <Button onPress={handleRetry}>Try Again</Button>
                </View>
              </>
            ) : null}
          </View>
        </View>
      </Modal>
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
    marginBottom: SPACING.xl,
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
  daysSection: {
    marginBottom: SPACING.xl,
  },
  sectionLabel: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '600',
    color: COLORS.secondary.bark,
    marginBottom: SPACING.md,
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayPill: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.secondary.cream,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.secondary.sand,
  },
  dayPillSelected: {
    backgroundColor: COLORS.primary.forest,
    borderColor: COLORS.primary.forest,
  },
  dayPillText: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    color: COLORS.secondary.bark,
  },
  dayPillTextSelected: {
    color: COLORS.white,
  },
  selectedDaysText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.secondary.warm,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  timeSection: {
    marginBottom: SPACING.xl,
  },
  timeRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  timeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.primary.light,
    borderRadius: RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.primary.mint,
  },
  timeButtonText: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    color: COLORS.primary.forest,
  },
  timeSeparator: {
    ...TYPOGRAPHY.body,
    color: COLORS.secondary.warm,
  },
  summaryCard: {
    backgroundColor: COLORS.primary.light,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.primary.mint,
  },
  summaryTitle: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '600',
    color: COLORS.primary.forest,
    marginBottom: SPACING.xs,
  },
  summaryText: {
    ...TYPOGRAPHY.body,
    color: COLORS.secondary.bark,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    maxHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.secondary.sand,
  },
  modalTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.secondary.bark,
  },
  modalCloseButton: {
    padding: SPACING.xs,
  },
  timeList: {
    padding: SPACING.sm,
  },
  timeOption: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[100],
  },
  timeOptionPressed: {
    backgroundColor: COLORS.primary.light,
  },
  timeOptionText: {
    ...TYPOGRAPHY.body,
    color: COLORS.secondary.bark,
    textAlign: 'center',
  },
  pendingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  pendingContent: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
  },
  pendingTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.secondary.bark,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  pendingSubtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.secondary.warm,
    textAlign: 'center',
    lineHeight: 22,
  },
  pendingHint: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.secondary.warm,
    textAlign: 'center',
    marginTop: SPACING.md,
    fontStyle: 'italic',
  },
  errorIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.system.errorLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryButton: {
    marginTop: SPACING.lg,
    width: '100%',
  },
});
