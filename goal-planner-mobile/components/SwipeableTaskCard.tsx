import React, { useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Swipeable, RectButton } from 'react-native-gesture-handler';
import { Check, X } from 'lucide-react-native';

type TaskStatus = 'completed' | 'missed' | 'skipped' | undefined;

interface SwipeableTaskCardProps {
  task: {
    id: string;
    title: string;
    durationMinutes: number;
  };
  status: TaskStatus;
  onComplete: () => void;
  onMiss: () => void;
}

export function SwipeableTaskCard({
  task,
  status,
  onComplete,
  onMiss,
}: SwipeableTaskCardProps) {
  const swipeableRef = useRef<Swipeable>(null);

  const isCompleted = status === 'completed';
  const isMissed = status === 'missed';

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    const scale = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });

    return (
      <RectButton
        style={styles.rightAction}
        onPress={() => {
          onMiss();
          swipeableRef.current?.close();
        }}
      >
        <Animated.View style={[styles.actionContent, { transform: [{ scale }] }]}>
          <X size={24} color="#fff" />
          <Text style={styles.actionText}>Missed</Text>
        </Animated.View>
      </RectButton>
    );
  };

  const renderLeftActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    const scale = dragX.interpolate({
      inputRange: [0, 100],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    });

    return (
      <RectButton
        style={styles.leftAction}
        onPress={() => {
          onComplete();
          swipeableRef.current?.close();
        }}
      >
        <Animated.View style={[styles.actionContent, { transform: [{ scale }] }]}>
          <Check size={24} color="#fff" />
          <Text style={styles.actionText}>Done</Text>
        </Animated.View>
      </RectButton>
    );
  };

  return (
    <Swipeable
      ref={swipeableRef}
      friction={2}
      leftThreshold={80}
      rightThreshold={80}
      renderLeftActions={renderLeftActions}
      renderRightActions={renderRightActions}
      onSwipeableOpen={(direction) => {
        if (direction === 'left') {
          onComplete();
        } else if (direction === 'right') {
          onMiss();
        }
        swipeableRef.current?.close();
      }}
    >
      <View
        style={[
          styles.taskCard,
          isCompleted && styles.taskCardCompleted,
          isMissed && styles.taskCardMissed,
        ]}
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
            <View style={styles.pendingBadge} />
          )}
        </View>
        <View style={styles.taskContent}>
          <Text style={[styles.taskTitle, isMissed && styles.taskTitleMissed]}>
            {task.title}
          </Text>
          <Text style={styles.taskMeta}>{task.durationMinutes}min</Text>
        </View>
        <View style={styles.swipeHint}>
          <Text style={styles.swipeHintText}>← →</Text>
        </View>
      </View>
    </Swipeable>
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
  swipeHint: {
    opacity: 0.3,
  },
  swipeHintText: {
    fontSize: 12,
    color: '#737373',
  },
  leftAction: {
    backgroundColor: '#16a34a',
    justifyContent: 'center',
    alignItems: 'flex-end',
    borderRadius: 12,
    marginRight: -12,
    paddingRight: 24,
  },
  rightAction: {
    backgroundColor: '#dc2626',
    justifyContent: 'center',
    alignItems: 'flex-start',
    borderRadius: 12,
    marginLeft: -12,
    paddingLeft: 24,
  },
  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
  },
  actionText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});
