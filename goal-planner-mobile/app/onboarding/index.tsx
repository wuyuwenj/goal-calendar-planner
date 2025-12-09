import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronRight } from 'lucide-react-native';
import { StepIndicator } from '../../components/StepIndicator';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useGoalStore } from '../../store/goal';

export default function GoalInputScreen() {
  const router = useRouter();
  const { onboardingData, setOnboardingData } = useGoalStore();
  const [goalName, setGoalName] = useState(onboardingData.title || '');

  const canProceed = goalName.trim().length > 0;

  const handleNext = () => {
    setOnboardingData({ title: goalName });
    router.push('/onboarding/level');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          <StepIndicator totalSteps={4} currentStep={1} />

          <View style={styles.header}>
            <Text style={styles.title}>What do you want to achieve?</Text>
            <Text style={styles.subtitle}>
              Be as specific as possible. Include measurable outcomes or skills
              you want to develop.
            </Text>
          </View>

          <Card style={styles.examplesCard}>
            <Text style={styles.examplesTitle}>Examples:</Text>
            <Text style={styles.exampleItem}>• "Run a 42 km marathon"</Text>
            <Text style={styles.exampleItem}>
              • "Learn Python until I can code a web app"
            </Text>
            <Text style={styles.exampleItem}>
              • "Play guitar well enough to perform 5 songs"
            </Text>
            <Text style={styles.exampleItem}>
              • "Speak conversational Spanish"
            </Text>
          </Card>

          <Input
            value={goalName}
            onChangeText={setGoalName}
            placeholder="e.g., Run a 42 km marathon"
            autoFocus
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          onPress={handleNext}
          disabled={!canProceed}
          icon={<ChevronRight size={20} color="#fff" />}
        >
          Continue
        </Button>
      </View>
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
    lineHeight: 24,
  },
  examplesCard: {
    marginBottom: 24,
    backgroundColor: '#fafafa',
    borderColor: '#e5e5e5',
  },
  examplesTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#525252',
    marginBottom: 8,
  },
  exampleItem: {
    fontSize: 14,
    color: '#404040',
    marginBottom: 4,
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
  },
});
