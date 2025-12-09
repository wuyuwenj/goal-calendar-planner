import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Sprout, Target } from 'lucide-react-native';
import { ProgressBar } from './ui/ProgressBar';
import { COLORS, SHADOWS } from '../constants/theme';
import type { Goal } from '../types';

interface GoalCardProps {
  goal: Goal;
  currentWeek: number;
  totalWeeks: number;
}

export function GoalCard({ goal, currentWeek, totalWeeks }: GoalCardProps) {
  const progress = totalWeeks > 0 ? (currentWeek / totalWeeks) * 100 : 0;
  const weeksRemaining = Math.max(0, totalWeeks - currentWeek + 1);

  // Determine growth stage based on progress
  const getGrowthEmoji = () => {
    if (progress < 25) return '🌱';
    if (progress < 50) return '🌿';
    if (progress < 75) return '🪴';
    return '🌳';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Text style={styles.growthEmoji}>{getGrowthEmoji()}</Text>
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={2}>
            {goal.title}
          </Text>
          <Text style={styles.subtitle}>
            Week {currentWeek} of {totalWeeks} · {weeksRemaining} weeks remaining
          </Text>
        </View>
      </View>

      <ProgressBar progress={progress} variant="light" />

      <View style={styles.footer}>
        <Text style={styles.progressText}>{Math.round(progress)}% complete</Text>
        <View style={styles.badge}>
          <Sprout size={12} color={COLORS.primary.light} />
          <Text style={styles.badgeText}>Growing</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: COLORS.primary.forest,
    borderRadius: 16,
    ...SHADOWS.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
  },
  iconContainer: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 10,
  },
  growthEmoji: {
    fontSize: 20,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  progressText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: COLORS.primary.light,
    fontSize: 12,
    fontWeight: '500',
  },
});
