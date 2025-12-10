import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Calendar, Clock, ChevronRight } from 'lucide-react-native';
import { Checkbox } from './ui/Checkbox';
import { COLORS, SHADOWS } from '../constants/theme';
import type { Task } from '../types';
import { getDayName } from '../utils/date';

interface TaskItemProps {
  task: Task;
  onToggle: () => void;
  onPress?: () => void;
  showDay?: boolean;
}

export function TaskItem({ task, onToggle, onPress, showDay = true }: TaskItemProps) {
  const isCompleted = task.status === 'completed';
  const isMissed = task.status === 'missed';

  const dayName = getDayName(task.scheduledDate);

  const getBackgroundColor = () => {
    if (isCompleted) return COLORS.primary.light;
    if (isMissed) return COLORS.system.errorLight;
    return COLORS.white;
  };

  const getBorderColor = () => {
    if (isCompleted) return COLORS.primary.mint;
    if (isMissed) return COLORS.red[200];
    return COLORS.secondary.sand;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.container,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          opacity: isMissed ? 0.7 : 1,
        },
        !isMissed && !isCompleted && SHADOWS.sm,
      ]}
      activeOpacity={0.7}
    >
      <TouchableOpacity
        onPress={(e) => {
          e.stopPropagation?.();
          onToggle();
        }}
        style={styles.checkboxContainer}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Checkbox
          checked={isCompleted}
          onToggle={onToggle}
          variant={isCompleted ? 'success' : isMissed ? 'error' : 'default'}
        />
      </TouchableOpacity>

      <View style={styles.content}>
        <Text
          style={[
            styles.title,
            isCompleted && styles.titleCompleted,
            isMissed && styles.titleMissed,
          ]}
          numberOfLines={2}
        >
          {task.title}
        </Text>
        <View style={styles.meta}>
          {showDay && (
            <View style={styles.metaItem}>
              <Calendar size={14} color={COLORS.secondary.warm} />
              <Text style={styles.metaText}>{dayName}</Text>
            </View>
          )}
          <View style={styles.metaItem}>
            <Clock size={14} color={COLORS.secondary.warm} />
            <Text style={styles.metaText}>
              {task.scheduledTime} · {task.durationMinutes}min
            </Text>
          </View>
        </View>
      </View>

      {isMissed && (
        <View style={styles.missedBadge}>
          <Text style={styles.missedText}>Missed</Text>
        </View>
      )}

      {isCompleted && (
        <View style={styles.completedBadge}>
          <Text style={styles.completedText}>Done</Text>
        </View>
      )}

      {onPress && (
        <View style={styles.chevronContainer}>
          <ChevronRight size={20} color={COLORS.neutral[400]} />
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  checkboxContainer: {
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    color: COLORS.secondary.bark,
    marginBottom: 4,
    fontWeight: '500',
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: COLORS.primary.sage,
  },
  titleMissed: {
    color: COLORS.neutral[500],
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    color: COLORS.secondary.warm,
  },
  missedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: COLORS.red[100],
    borderRadius: 6,
  },
  missedText: {
    fontSize: 12,
    color: COLORS.system.error,
    fontWeight: '500',
  },
  completedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: COLORS.primary.mint,
    borderRadius: 6,
  },
  completedText: {
    fontSize: 12,
    color: COLORS.primary.forest,
    fontWeight: '500',
  },
  chevronContainer: {
    justifyContent: 'center',
    paddingLeft: 8,
  },
});
