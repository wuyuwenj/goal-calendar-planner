import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronRight, Check, Clock, X } from 'lucide-react-native';
import { StepIndicator } from '../../components/StepIndicator';
import { Button } from '../../components/ui/Button';
import { useGoalStore } from '../../store/goal';
import { DAYS } from '../../constants/theme';

const WEEKDAYS = DAYS.filter((d) => d.index >= 1 && d.index <= 5);
const WEEKEND = DAYS.filter((d) => d.index === 0 || d.index === 6);
const ORDERED_DAYS = [...WEEKDAYS, ...WEEKEND];

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

interface DayAvailability {
  startTime: string;
  endTime: string;
}

export default function AvailabilityScreen() {
  const router = useRouter();
  const { onboardingData, setOnboardingData, createGoal, isLoading } = useGoalStore();

  const [selectedDays, setSelectedDays] = useState<Record<number, DayAvailability>>({
    1: { startTime: '17:00', endTime: '19:00' }, // Monday: 5-7 PM
    3: { startTime: '17:00', endTime: '19:00' }, // Wednesday: 5-7 PM
    5: { startTime: '17:00', endTime: '19:00' }, // Friday: 5-7 PM
  });

  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<{
    dayIndex: number;
    field: 'startTime' | 'endTime';
  } | null>(null);

  const toggleDay = (dayIndex: number) => {
    setSelectedDays((prev) => {
      const newDays = { ...prev };
      if (newDays[dayIndex] !== undefined) {
        delete newDays[dayIndex];
      } else {
        newDays[dayIndex] = { startTime: '17:00', endTime: '19:00' };
      }
      return newDays;
    });
  };

  const openTimePicker = (dayIndex: number, field: 'startTime' | 'endTime') => {
    setPickerTarget({ dayIndex, field });
    setPickerVisible(true);
  };

  const selectTime = (time: string) => {
    if (!pickerTarget) return;

    setSelectedDays((prev) => {
      const dayData = prev[pickerTarget.dayIndex];
      if (!dayData) return prev;

      const updated = { ...dayData };
      if (pickerTarget.field === 'startTime') {
        updated.startTime = time;
        // If start time is after end time, adjust end time
        if (time >= updated.endTime) {
          const timeIndex = TIME_OPTIONS.indexOf(time);
          if (timeIndex < TIME_OPTIONS.length - 1) {
            updated.endTime = TIME_OPTIONS[timeIndex + 1];
          }
        }
      } else {
        updated.endTime = time;
        // If end time is before start time, adjust start time
        if (time <= updated.startTime) {
          const timeIndex = TIME_OPTIONS.indexOf(time);
          if (timeIndex > 0) {
            updated.startTime = TIME_OPTIONS[timeIndex - 1];
          }
        }
      }

      return { ...prev, [pickerTarget.dayIndex]: updated };
    });

    setPickerVisible(false);
    setPickerTarget(null);
  };

  const handleCreate = async () => {
    const availability = Object.entries(selectedDays).map(([day, times]) => ({
      dayOfWeek: parseInt(day),
      startTime: times.startTime,
      endTime: times.endTime,
    }));

    setOnboardingData({ availability });

    try {
      await createGoal({
        ...onboardingData,
        availability,
      } as any);
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Failed to create goal:', error);
    }
  };

  const canProceed = Object.keys(selectedDays).length > 0;

  const getFilteredTimeOptions = () => {
    if (!pickerTarget) return TIME_OPTIONS;

    const dayData = selectedDays[pickerTarget.dayIndex];
    if (!dayData) return TIME_OPTIONS;

    if (pickerTarget.field === 'endTime') {
      // For end time, only show times after start time
      const startIndex = TIME_OPTIONS.indexOf(dayData.startTime);
      return TIME_OPTIONS.slice(startIndex + 1);
    } else {
      // For start time, only show times before end time
      const endIndex = TIME_OPTIONS.indexOf(dayData.endTime);
      return TIME_OPTIONS.slice(0, endIndex);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <StepIndicator totalSteps={4} currentStep={4} />

          <View style={styles.header}>
            <Text style={styles.title}>Weekly availability</Text>
            <Text style={styles.subtitle}>
              Select days and time ranges when you can work on your goal
            </Text>
          </View>

          <View style={styles.daysList}>
            {ORDERED_DAYS.map((day) => {
              const dayData = selectedDays[day.index];
              const isSelected = dayData !== undefined;

              return (
                <View
                  key={day.index}
                  style={[styles.dayCard, isSelected && styles.dayCardSelected]}
                >
                  <TouchableOpacity
                    onPress={() => toggleDay(day.index)}
                    style={styles.dayHeader}
                  >
                    <View style={styles.dayLeft}>
                      <View
                        style={[
                          styles.checkbox,
                          isSelected && styles.checkboxSelected,
                        ]}
                      >
                        {isSelected && (
                          <Check size={12} color="#fff" strokeWidth={3} />
                        )}
                      </View>
                      <Text style={styles.dayName}>{day.name}</Text>
                    </View>
                  </TouchableOpacity>

                  {isSelected && (
                    <View style={styles.timeRangeContainer}>
                      <TouchableOpacity
                        style={styles.timeButton}
                        onPress={() => openTimePicker(day.index, 'startTime')}
                      >
                        <Clock size={14} color="#525252" />
                        <Text style={styles.timeButtonText}>
                          {formatTimeDisplay(dayData.startTime)}
                        </Text>
                      </TouchableOpacity>

                      <Text style={styles.timeSeparator}>to</Text>

                      <TouchableOpacity
                        style={styles.timeButton}
                        onPress={() => openTimePicker(day.index, 'endTime')}
                      >
                        <Clock size={14} color="#525252" />
                        <Text style={styles.timeButtonText}>
                          {formatTimeDisplay(dayData.endTime)}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button variant="secondary" onPress={() => router.back()}>
          Back
        </Button>
        <View style={styles.flex}>
          <Button
            onPress={handleCreate}
            disabled={!canProceed}
            loading={isLoading}
            icon={<ChevronRight size={20} color="#fff" />}
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
                Select {pickerTarget?.field === 'startTime' ? 'Start' : 'End'} Time
              </Text>
              <TouchableOpacity
                onPress={() => setPickerVisible(false)}
                style={styles.modalCloseButton}
              >
                <X size={24} color="#171717" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.timeList}>
              {getFilteredTimeOptions().map((time) => (
                <TouchableOpacity
                  key={time}
                  style={styles.timeOption}
                  onPress={() => selectTime(time)}
                >
                  <Text style={styles.timeOptionText}>
                    {formatTimeDisplay(time)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 48,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#171717',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#737373',
  },
  daysList: {
    gap: 12,
  },
  dayCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e5e5',
  },
  dayCardSelected: {
    borderColor: '#171717',
    backgroundColor: '#fafafa',
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dayLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#d4d4d4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#171717',
    borderColor: '#171717',
  },
  dayName: {
    fontSize: 16,
    color: '#171717',
  },
  timeRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  timeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d4d4d4',
  },
  timeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#171717',
  },
  timeSeparator: {
    fontSize: 14,
    color: '#737373',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
  },
  flex: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#171717',
  },
  modalCloseButton: {
    padding: 4,
  },
  timeList: {
    padding: 8,
  },
  timeOption: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  timeOptionText: {
    fontSize: 16,
    color: '#171717',
    textAlign: 'center',
  },
});
