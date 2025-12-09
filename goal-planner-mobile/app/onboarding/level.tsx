import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronRight } from 'lucide-react-native';
import { StepIndicator } from '../../components/StepIndicator';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useGoalStore } from '../../store/goal';
import { EXPERIENCE_LEVELS } from '../../constants/theme';
import type { ExperienceLevel } from '../../types';

export default function LevelScreen() {
  const router = useRouter();
  const { onboardingData, setOnboardingData } = useGoalStore();
  const [level, setLevel] = useState<ExperienceLevel>(
    onboardingData.currentLevel || 'beginner'
  );
  const [details, setDetails] = useState(onboardingData.levelDetails || '');

  const handleNext = () => {
    setOnboardingData({ currentLevel: level, levelDetails: details });
    router.push('/onboarding/timeline');
  };

  const selectedLevel = EXPERIENCE_LEVELS.find((l) => l.value === level);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          <StepIndicator totalSteps={4} currentStep={2} />

          <View style={styles.header}>
            <Text style={styles.title}>What's your current level?</Text>
            <Text style={styles.subtitle}>
              Select your experience level, then describe where you are now.
            </Text>
          </View>

          <View style={styles.options}>
            {EXPERIENCE_LEVELS.map((option) => (
              <TouchableOpacity
                key={option.value}
                onPress={() => setLevel(option.value)}
                style={[
                  styles.option,
                  level === option.value && styles.optionSelected,
                ]}
                activeOpacity={0.7}
              >
                <Text style={styles.optionLabel}>{option.label}</Text>
                <Text style={styles.optionDesc}>{option.desc}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {selectedLevel && (
            <Input
              value={details}
              onChangeText={setDetails}
              placeholder={selectedLevel.placeholder}
              multiline
              numberOfLines={3}
            />
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button variant="secondary" onPress={() => router.back()}>
          Back
        </Button>
        <View style={styles.flex}>
          <Button
            onPress={handleNext}
            icon={<ChevronRight size={20} color="#fff" />}
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
  options: {
    gap: 12,
    marginBottom: 24,
  },
  option: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e5e5',
  },
  optionSelected: {
    borderColor: '#171717',
    backgroundColor: '#fafafa',
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#171717',
    marginBottom: 2,
  },
  optionDesc: {
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
});
