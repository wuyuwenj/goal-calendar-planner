import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronRight } from 'lucide-react-native';
import Slider from '@react-native-community/slider';
import { StepIndicator } from '../../components/StepIndicator';
import { Button } from '../../components/ui/Button';
import { useGoalStore } from '../../store/goal';
import { TIMELINE_OPTIONS } from '../../constants/theme';
import type { Timeline } from '../../types';

export default function TimelineScreen() {
  const router = useRouter();
  const { onboardingData, setOnboardingData } = useGoalStore();
  const [timeline, setTimeline] = useState<Timeline>(
    onboardingData.timeline || '3months'
  );
  const [customWeeks, setCustomWeeks] = useState(onboardingData.customWeeks || 8);

  const handleNext = () => {
    setOnboardingData({ timeline, customWeeks });
    router.push('/onboarding/availability');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <StepIndicator totalSteps={4} currentStep={3} />

          <View style={styles.header}>
            <Text style={styles.title}>How long do you have?</Text>
            <Text style={styles.subtitle}>
              Choose a timeline that feels ambitious but achievable.
            </Text>
          </View>

          <View style={styles.options}>
            {TIMELINE_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                onPress={() => setTimeline(option.value)}
                style={[
                  styles.option,
                  timeline === option.value && styles.optionSelected,
                ]}
                activeOpacity={0.7}
              >
                <Text style={styles.optionLabel}>{option.label}</Text>
                {option.weeks > 0 && (
                  <Text style={styles.optionWeeks}>{option.weeks} weeks</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {timeline === 'custom' && (
            <View style={styles.customSection}>
              <Text style={styles.customLabel}>
                Custom duration: {customWeeks} weeks
              </Text>
              <Slider
                minimumValue={2}
                maximumValue={52}
                step={1}
                value={customWeeks}
                onValueChange={setCustomWeeks}
                minimumTrackTintColor="#171717"
                maximumTrackTintColor="#e5e5e5"
                thumbTintColor="#171717"
                style={styles.slider}
              />
              <View style={styles.sliderLabels}>
                <Text style={styles.sliderLabel}>2 weeks</Text>
                <Text style={styles.sliderLabel}>1 year</Text>
              </View>
            </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  },
  optionWeeks: {
    fontSize: 14,
    color: '#737373',
  },
  customSection: {
    marginTop: 8,
    padding: 16,
    backgroundColor: '#fafafa',
    borderRadius: 12,
  },
  customLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#171717',
    marginBottom: 16,
    textAlign: 'center',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sliderLabel: {
    fontSize: 12,
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
