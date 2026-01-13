import { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, ScrollView, FlatList, Pressable, StyleSheet, Modal, ActivityIndicator, NativeSyntheticEvent, NativeScrollEvent, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronRight, Clock, X, Trash2 } from 'lucide-react-native';
import Animated, { FadeInUp, FadeInRight, FadeOutRight, useAnimatedStyle, useSharedValue, withSpring, Layout } from 'react-native-reanimated';
import { StepIndicator } from '../../components/StepIndicator';
import { Button } from '../../components/ui/Button';
import { PaywallScreen } from '../../components/PaywallScreen';
import { useGoalStore } from '../../store/goal';
import { useSubscriptionStore } from '../../store/subscription';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS } from '../../constants/theme';

const ITEM_HEIGHT = 50;
const VISIBLE_ITEMS = 5;

// Wheel Picker Component
function WheelPicker({
  options,
  selectedValue,
  onValueChange,
  formatLabel,
}: {
  options: string[];
  selectedValue: string;
  onValueChange: (value: string) => void;
  formatLabel: (value: string) => string;
}) {
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(options.indexOf(selectedValue));

  const selectedIndex = options.indexOf(selectedValue);

  useEffect(() => {
    // Scroll to selected value on mount
    if (flatListRef.current && selectedIndex >= 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({
          index: selectedIndex,
          animated: false,
        });
        setCurrentIndex(selectedIndex);
      }, 100);
    }
  }, [selectedIndex]);

  const handleScrollEnd = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = event.nativeEvent.contentOffset.y;
    const index = Math.round(y / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(index, options.length - 1));

    setCurrentIndex(clampedIndex);
    if (options[clampedIndex] !== selectedValue) {
      onValueChange(options[clampedIndex]);
    }
  }, [options, selectedValue, onValueChange]);

  const handleViewableItemsChanged = useCallback(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      // Find the center item
      const centerItem = viewableItems.find((item: any) => item.index !== null);
      if (centerItem) {
        setCurrentIndex(centerItem.index);
      }
    }
  }, []);

  const getItemLayout = useCallback((_: any, index: number) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  }), []);

  const renderItem = useCallback(({ item, index }: { item: string; index: number }) => {
    const isCenter = index === currentIndex;
    const distance = Math.abs(index - currentIndex);
    const opacity = distance === 0 ? 1 : distance === 1 ? 0.5 : 0.3;

    return (
      <View style={[wheelStyles.item, { opacity }]}>
        <Text style={[
          wheelStyles.itemText,
          isCenter && wheelStyles.itemTextSelected,
        ]}>
          {formatLabel(item)}
        </Text>
      </View>
    );
  }, [currentIndex, formatLabel]);

  return (
    <View style={wheelStyles.container}>
      {/* Selection indicator - behind everything */}
      <View style={wheelStyles.selectionIndicator} pointerEvents="none" />

      <FlatList
        ref={flatListRef}
        data={options}
        renderItem={renderItem}
        keyExtractor={(item) => item}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        getItemLayout={getItemLayout}
        onMomentumScrollEnd={handleScrollEnd}
        onScrollEndDrag={handleScrollEnd}
        contentContainerStyle={{
          paddingVertical: ITEM_HEIGHT * 2,
        }}
        initialScrollIndex={selectedIndex >= 0 ? selectedIndex : 0}
        onScrollToIndexFailed={(info) => {
          setTimeout(() => {
            flatListRef.current?.scrollToIndex({
              index: info.index,
              animated: false,
            });
          }, 100);
        }}
      />
    </View>
  );
}

const wheelStyles = StyleSheet.create({
  container: {
    height: ITEM_HEIGHT * VISIBLE_ITEMS,
    overflow: 'hidden',
    position: 'relative',
  },
  selectionIndicator: {
    position: 'absolute',
    top: ITEM_HEIGHT * 2,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    backgroundColor: COLORS.primary.light,
    borderRadius: RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.primary.mint,
  },
  item: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemText: {
    ...TYPOGRAPHY.body,
    fontSize: 18,
    color: COLORS.secondary.warm,
  },
  itemTextSelected: {
    color: COLORS.primary.forest,
    fontWeight: '700',
    fontSize: 20,
  },
});

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

// Per-day availability type
interface DayAvailability {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

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

// Component for each day's time row
function DayTimeRow({
  day,
  availability,
  onUpdateTime,
  onRemove,
}: {
  day: { index: number; short: string; name: string };
  availability: DayAvailability;
  onUpdateTime: (field: 'startTime' | 'endTime') => void;
  onRemove: () => void;
}) {
  return (
    <Animated.View
      entering={FadeInRight.duration(300)}
      exiting={FadeOutRight.duration(200)}
      layout={Layout.springify()}
      style={styles.dayTimeRow}
    >
      <View style={styles.dayTimeRowLeft}>
        <Text style={styles.dayTimeRowName}>{day.name}</Text>
      </View>
      <View style={styles.dayTimeRowRight}>
        <Pressable
          style={styles.timeChip}
          onPress={() => onUpdateTime('startTime')}
        >
          <Text style={styles.timeChipText}>{formatTimeDisplay(availability.startTime)}</Text>
        </Pressable>
        <Text style={styles.timeChipSeparator}>-</Text>
        <Pressable
          style={styles.timeChip}
          onPress={() => onUpdateTime('endTime')}
        >
          <Text style={styles.timeChipText}>{formatTimeDisplay(availability.endTime)}</Text>
        </Pressable>
        <Pressable style={styles.removeButton} onPress={onRemove}>
          <Trash2 size={18} color={COLORS.secondary.warm} />
        </Pressable>
      </View>
    </Animated.View>
  );
}

export default function AvailabilityScreen() {
  const router = useRouter();
  const { onboardingData, setOnboardingData, createGoal, checkPendingGoal, clearPendingGoal, isLoading } = useGoalStore();
  const { isSubscribed, setIsSubscribed } = useSubscriptionStore();

  // Paywall state
  const [showPaywall, setShowPaywall] = useState(false);

  // Per-day availability state
  const [dayAvailabilities, setDayAvailabilities] = useState<DayAvailability[]>([
    { dayOfWeek: 1, startTime: '20:00', endTime: '21:00' }, // Monday
    { dayOfWeek: 3, startTime: '20:00', endTime: '21:00' }, // Wednesday
    { dayOfWeek: 5, startTime: '20:00', endTime: '21:00' }, // Friday
  ]);

  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<{
    dayOfWeek: number;
    field: 'startTime' | 'endTime';
  } | null>(null);
  const [pickerValue, setPickerValue] = useState('20:00');

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

  // Get selected day indices from availabilities
  const selectedDays = dayAvailabilities.map(a => a.dayOfWeek);

  const toggleDay = (dayIndex: number) => {
    setDayAvailabilities((prev) => {
      const existing = prev.find(a => a.dayOfWeek === dayIndex);
      if (existing) {
        // Remove the day
        return prev.filter((a) => a.dayOfWeek !== dayIndex);
      } else {
        // Add with default time (8-9 PM)
        return [...prev, { dayOfWeek: dayIndex, startTime: '20:00', endTime: '21:00' }];
      }
    });
  };

  const removeDay = (dayIndex: number) => {
    setDayAvailabilities((prev) => prev.filter((a) => a.dayOfWeek !== dayIndex));
  };

  const openTimePicker = (dayOfWeek: number, field: 'startTime' | 'endTime') => {
    const dayAvail = dayAvailabilities.find(a => a.dayOfWeek === dayOfWeek);
    if (dayAvail) {
      setPickerValue(field === 'startTime' ? dayAvail.startTime : dayAvail.endTime);
    }
    setPickerTarget({ dayOfWeek, field });
    setPickerVisible(true);
  };

  const confirmTimeSelection = () => {
    if (!pickerTarget) return;

    setDayAvailabilities((prev) => {
      return prev.map((a) => {
        if (a.dayOfWeek !== pickerTarget.dayOfWeek) return a;

        if (pickerTarget.field === 'startTime') {
          // If new start time >= end time, adjust end time
          let newEndTime = a.endTime;
          if (pickerValue >= a.endTime) {
            const timeIndex = TIME_OPTIONS.indexOf(pickerValue);
            if (timeIndex < TIME_OPTIONS.length - 1) {
              newEndTime = TIME_OPTIONS[timeIndex + 1];
            }
          }
          return { ...a, startTime: pickerValue, endTime: newEndTime };
        } else {
          // If new end time <= start time, adjust start time
          let newStartTime = a.startTime;
          if (pickerValue <= a.startTime) {
            const timeIndex = TIME_OPTIONS.indexOf(pickerValue);
            if (timeIndex > 0) {
              newStartTime = TIME_OPTIONS[timeIndex - 1];
            }
          }
          return { ...a, startTime: newStartTime, endTime: pickerValue };
        }
      });
    });

    setPickerVisible(false);
    setPickerTarget(null);
  };

  const handleBack = () => {
    router.back();
  };

  const proceedWithGoalCreation = async () => {
    const availability = dayAvailabilities;
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
      } else if (error.code === 'SUBSCRIPTION_EXPIRED' || error.code === 'SUBSCRIPTION_REQUIRED') {
        // Subscription expired or not found - update local state and show paywall
        await setIsSubscribed(false);
        setShowPaywall(true);
      } else if (error.code === 'DAILY_LIMIT_REACHED') {
        // Handle rate limit error with reset time
        let errorMessage = 'You\'ve reached your daily limit of 2 goals.';
        if (error.resetsAt) {
          const resetDate = new Date(error.resetsAt);
          const hoursUntilReset = Math.ceil((resetDate.getTime() - Date.now()) / (1000 * 60 * 60));
          errorMessage += ` Try again in ${hoursUntilReset} hour${hoursUntilReset !== 1 ? 's' : ''}.`;
        }
        setPendingState((prev) => ({
          ...prev,
          error: errorMessage,
        }));
      } else {
        setPendingState((prev) => ({
          ...prev,
          error: error.message || 'Failed to create goal. Please try again.',
        }));
      }
    }
  };

  const handleCreate = () => {
    // Use the per-day availabilities directly
    const availability = dayAvailabilities;
    setOnboardingData({ availability });

    // If user is already subscribed, proceed directly
    if (isSubscribed) {
      proceedWithGoalCreation();
    } else {
      // Show paywall
      setShowPaywall(true);
    }
  };

  const handlePaywallClose = () => {
    setShowPaywall(false);
  };

  const handlePaywallSubscribed = () => {
    setShowPaywall(false);
    proceedWithGoalCreation();
  };

  const handleRetry = () => {
    setPendingState({ isPending: false, pendingId: null, pollCount: 0, error: null });
  };

  const canProceed = dayAvailabilities.length > 0;

  const getFilteredTimeOptions = () => {
    if (!pickerTarget) return TIME_OPTIONS;

    const dayAvail = dayAvailabilities.find(a => a.dayOfWeek === pickerTarget.dayOfWeek);
    if (!dayAvail) return TIME_OPTIONS;

    if (pickerTarget.field === 'endTime') {
      const startIndex = TIME_OPTIONS.indexOf(dayAvail.startTime);
      return TIME_OPTIONS.slice(startIndex + 1);
    } else {
      const endIndex = TIME_OPTIONS.indexOf(dayAvail.endTime);
      return TIME_OPTIONS.slice(0, endIndex);
    }
  };

  // Sort availabilities by day order (Monday first)
  const sortedAvailabilities = [...dayAvailabilities].sort((a, b) => {
    const orderA = DAYS.findIndex(d => d.index === a.dayOfWeek);
    const orderB = DAYS.findIndex(d => d.index === b.dayOfWeek);
    return orderA - orderB;
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <StepIndicator totalSteps={7} currentStep={6} />

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
          </Animated.View>

          {/* Per-Day Time Rows */}
          {sortedAvailabilities.length > 0 && (
            <Animated.View entering={FadeInUp.delay(400).duration(500)} style={styles.timeSection}>
              <Text style={styles.sectionLabel}>Set times for each day</Text>
              <View style={styles.dayTimeRows}>
                {sortedAvailabilities.map((avail) => {
                  const day = DAYS.find(d => d.index === avail.dayOfWeek)!;
                  return (
                    <DayTimeRow
                      key={avail.dayOfWeek}
                      day={day}
                      availability={avail}
                      onUpdateTime={(field) => openTimePicker(avail.dayOfWeek, field)}
                      onRemove={() => removeDay(avail.dayOfWeek)}
                    />
                  );
                })}
              </View>
            </Animated.View>
          )}

          {/* Summary Card */}
          {sortedAvailabilities.length > 0 && (
            <Animated.View entering={FadeInUp.delay(500).duration(500)} style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Your schedule</Text>
              <Text style={styles.summaryText}>
                {sortedAvailabilities.length} day{sortedAvailabilities.length > 1 ? 's' : ''} per week
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
          <View style={styles.wheelModalContent}>
            <View style={styles.modalHeader}>
              <Pressable
                onPress={() => setPickerVisible(false)}
                style={styles.modalCancelButton}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
              <Text style={styles.modalTitle}>
                {pickerTarget?.field === 'startTime' ? 'Start' : 'End'} Time
              </Text>
              <Pressable
                onPress={confirmTimeSelection}
                style={styles.modalDoneButton}
              >
                <Text style={styles.modalDoneText}>Done</Text>
              </Pressable>
            </View>
            <Text style={styles.modalSubtitle}>
              {pickerTarget && DAYS.find(d => d.index === pickerTarget.dayOfWeek)?.name}
            </Text>
            <View style={styles.wheelContainer}>
              <WheelPicker
                key={`${pickerTarget?.dayOfWeek}-${pickerTarget?.field}`}
                options={getFilteredTimeOptions()}
                selectedValue={pickerValue}
                onValueChange={setPickerValue}
                formatLabel={formatTimeDisplay}
              />
            </View>
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

      {/* Paywall Modal */}
      <Modal
        visible={showPaywall}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <PaywallScreen
          onClose={handlePaywallClose}
          onSubscribed={handlePaywallSubscribed}
        />
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
  dayTimeRows: {
    gap: SPACING.sm,
  },
  dayTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.secondary.cream,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  dayTimeRowLeft: {
    flex: 1,
  },
  dayTimeRowName: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    color: COLORS.secondary.bark,
  },
  dayTimeRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  timeChip: {
    backgroundColor: COLORS.primary.light,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.primary.mint,
  },
  timeChipText: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '600',
    color: COLORS.primary.forest,
  },
  timeChipSeparator: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.secondary.warm,
  },
  removeButton: {
    padding: SPACING.xs,
    marginLeft: SPACING.xs,
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
  wheelModalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    paddingBottom: SPACING.xl,
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
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    color: COLORS.secondary.bark,
  },
  modalSubtitle: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.secondary.warm,
    textAlign: 'center',
    paddingTop: SPACING.sm,
  },
  modalCancelButton: {
    padding: SPACING.xs,
  },
  modalCancelText: {
    ...TYPOGRAPHY.body,
    color: COLORS.secondary.warm,
  },
  modalDoneButton: {
    padding: SPACING.xs,
  },
  modalDoneText: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    color: COLORS.primary.forest,
  },
  wheelContainer: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.md,
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
