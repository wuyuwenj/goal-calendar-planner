import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronRight, X } from 'lucide-react-native';
import { StepIndicator } from '../../components/StepIndicator';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useGoalStore } from '../../store/goal';

export default function CheckInNotesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { currentGoal, submitCheckIn, isLoading } = useGoalStore();
  const [notes, setNotes] = useState('');

  const taskResults = JSON.parse((params.taskResults as string) || '[]');
  const weekNumber = parseInt(params.weekNumber as string, 10) || 1;
  const adjustment = (params.adjustment as string) || 'maintain';

  const handleSubmit = async () => {
    if (!currentGoal) return;

    try {
      await submitCheckIn(currentGoal.id, weekNumber, taskResults, notes, adjustment);
      router.replace('/checkin/complete');
    } catch (error) {
      console.error('Failed to submit check-in:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <X size={24} color="#171717" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Weekly Check-in</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          <StepIndicator totalSteps={3} currentStep={3} />

          <View style={styles.titleSection}>
            <Text style={styles.title}>Any notes?</Text>
            <Text style={styles.subtitle}>
              Share what went well, what was challenging, or any adjustments
              you'd like for next week.
            </Text>
          </View>

          <Input
            value={notes}
            onChangeText={setNotes}
            placeholder="e.g., I had more energy in the mornings, struggled with evening tasks..."
            multiline
            numberOfLines={5}
          />

          <View style={styles.promptsSection}>
            <Text style={styles.promptsTitle}>Prompts to consider:</Text>
            <Text style={styles.promptItem}>• What worked well this week?</Text>
            <Text style={styles.promptItem}>• What made tasks difficult?</Text>
            <Text style={styles.promptItem}>• Do you need more or less time?</Text>
            <Text style={styles.promptItem}>• Any schedule changes needed?</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button variant="secondary" onPress={() => router.back()}>
          Back
        </Button>
        <View style={styles.flex}>
          <Button
            onPress={handleSubmit}
            loading={isLoading}
            icon={<ChevronRight size={20} color="#fff" />}
          >
            Submit Check-in
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#171717',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  titleSection: {
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
    lineHeight: 24,
  },
  promptsSection: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#fafafa',
    borderRadius: 12,
  },
  promptsTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#525252',
    marginBottom: 8,
  },
  promptItem: {
    fontSize: 14,
    color: '#737373',
    marginBottom: 4,
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
});
