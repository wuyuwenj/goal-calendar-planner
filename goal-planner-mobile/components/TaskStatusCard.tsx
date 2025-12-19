import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Check, X, Circle } from 'lucide-react-native';

type TaskStatus = 'completed' | 'missed' | 'skipped' | undefined;

interface TaskStatusCardProps {
  task: {
    id: string;
    title: string;
    durationMinutes: number;
  };
  status: TaskStatus;
  onStatusChange: (status: 'completed' | 'missed' | undefined) => void;
}

export function TaskStatusCard({
  task,
  status,
  onStatusChange,
}: TaskStatusCardProps) {
  const isCompleted = status === 'completed';
  const isMissed = status === 'missed';

  // Cycle: undefined -> completed -> missed -> undefined
  const handleTap = () => {
    if (!status || status === 'skipped') {
      onStatusChange('completed');
    } else if (status === 'completed') {
      onStatusChange('missed');
    } else {
      onStatusChange(undefined);
    }
  };

  return (
    <TouchableOpacity
      onPress={handleTap}
      style={[
        styles.taskCard,
        isCompleted && styles.taskCardCompleted,
        isMissed && styles.taskCardMissed,
      ]}
      activeOpacity={0.7}
    >
      <View style={styles.statusIndicator}>
        {isCompleted && (
          <View style={styles.completedBadge}>
            <Check size={16} color="#fff" />
          </View>
        )}
        {isMissed && (
          <View style={styles.missedBadge}>
            <X size={16} color="#fff" />
          </View>
        )}
        {!isCompleted && !isMissed && (
          <View style={styles.pendingBadge}>
            <Circle size={16} color="#d4d4d4" />
          </View>
        )}
      </View>
      <View style={styles.taskContent}>
        <Text style={[styles.taskTitle, isMissed && styles.taskTitleMissed]}>
          {task.title}
        </Text>
        <Text style={styles.taskMeta}>{task.durationMinutes}min</Text>
      </View>
      <View style={styles.statusHint}>
        <Text style={styles.statusHintText}>
          {isCompleted ? 'Done' : isMissed ? 'Missed' : 'Tap to mark'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e5e5',
    backgroundColor: '#fff',
  },
  taskCardCompleted: {
    borderColor: '#16a34a',
    backgroundColor: '#f0fdf4',
  },
  taskCardMissed: {
    borderColor: '#dc2626',
    backgroundColor: '#fef2f2',
  },
  statusIndicator: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#16a34a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  missedBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#dc2626',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pendingBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#d4d4d4',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    color: '#171717',
    marginBottom: 2,
  },
  taskTitleMissed: {
    textDecorationLine: 'line-through',
    color: '#737373',
  },
  taskMeta: {
    fontSize: 14,
    color: '#737373',
  },
  statusHint: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
  },
  statusHintText: {
    fontSize: 11,
    color: '#737373',
    fontWeight: '500',
  },
});
