import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS } from '../constants/theme';

interface StepIndicatorProps {
  totalSteps: number;
  currentStep: number;
}

export function StepIndicator({ totalSteps, currentStep }: StepIndicatorProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: totalSteps }).map((_, i) => {
        const isCompleted = i + 1 < currentStep;
        const isCurrent = i + 1 === currentStep;
        const isUpcoming = i + 1 > currentStep;

        return (
          <View
            key={i}
            style={[
              styles.step,
              {
                backgroundColor: isCompleted
                  ? COLORS.primary.forest
                  : isCurrent
                  ? COLORS.primary.sage
                  : COLORS.secondary.sand,
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 32,
  },
  step: {
    flex: 1,
    height: 4,
    borderRadius: 100,
  },
});
