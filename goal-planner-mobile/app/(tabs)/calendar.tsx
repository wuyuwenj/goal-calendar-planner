import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar as CalendarIcon, RefreshCw } from 'lucide-react-native';
import { TaskItem } from '../../components/TaskItem';
import { TaskDetailModal } from '../../components/TaskDetailModal';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { useGoalStore } from '../../store/goal';
import { useAuthStore } from '../../store/auth';
import { DAYS } from '../../constants/theme';
import type { Task } from '../../types';

export default function CalendarScreen() {
  const { tasks, currentGoal, fetchGoalById, toggleTask, isLoading, syncToCalendar } =
    useGoalStore();
  const { signInWithCalendarAccess, isLoading: authLoading } = useAuthStore();
  const [groupedTasks, setGroupedTasks] = useState<Record<string, Task[]>>({});
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  useEffect(() => {
    if (currentGoal) {
      fetchGoalById(currentGoal.id);
    }
  }, [currentGoal?.id]);

  useEffect(() => {
    // Group tasks by date
    const grouped = tasks.reduce(
      (acc, task) => {
        const dateKey = task.scheduledDate.split('T')[0];
        if (!acc[dateKey]) {
          acc[dateKey] = [];
        }
        acc[dateKey].push(task);
        return acc;
      },
      {} as Record<string, Task[]>
    );

    // Sort tasks within each day by time
    Object.keys(grouped).forEach((key) => {
      grouped[key].sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));
    });

    setGroupedTasks(grouped);
  }, [tasks]);

  if (isLoading) {
    return <LoadingSpinner message="Loading calendar..." />;
  }

  const sortedDates = Object.keys(groupedTasks).sort();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (dateString === today.toISOString().split('T')[0]) {
      return 'Today';
    }
    if (dateString === tomorrow.toISOString().split('T')[0]) {
      return 'Tomorrow';
    }

    const dayName = DAYS[date.getDay()]?.name || '';
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const day = date.getDate();

    return `${dayName}, ${month} ${day}`;
  };

  const handleSyncCalendar = async (forceResync: boolean = false) => {
    if (!currentGoal || isSyncing) return;

    setIsSyncing(true);
    try {
      const result = await syncToCalendar(currentGoal.id, forceResync);

      if (result.success) {
        if (result.synced === 0 && !forceResync) {
          // No new tasks to sync - offer force resync
          Alert.alert(
            'Already Synced',
            'All tasks are already synced. Would you like to force re-sync all events?',
            [
              { text: 'No', style: 'cancel' },
              { text: 'Yes, Re-sync', onPress: () => handleSyncCalendar(true) },
            ]
          );
        } else {
          Alert.alert(
            'Calendar Synced',
            `Successfully synced ${result.synced} events to Google Calendar.`
          );
        }
      } else if (result.needsAuth) {
        Alert.alert(
          'Calendar Access Required',
          'To sync your tasks to Google Calendar, we need calendar access. Would you like to grant access now?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Grant Access',
              onPress: async () => {
                const success = await signInWithCalendarAccess();
                if (success) {
                  // Force sync after granting access (old event IDs are stale)
                  const retryResult = await syncToCalendar(currentGoal.id, true);
                  if (retryResult.success) {
                    Alert.alert(
                      'Calendar Synced',
                      `Successfully synced ${retryResult.synced} events to Google Calendar.`
                    );
                  } else {
                    Alert.alert('Sync Failed', retryResult.error || 'Failed to sync calendar.');
                  }
                }
              },
            },
          ]
        );
      } else {
        Alert.alert('Sync Failed', result.error || 'Failed to sync calendar.');
      }
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <CalendarIcon size={20} color="#737373" />
            <Text style={styles.headerTitle}>Calendar</Text>
          </View>
          <TouchableOpacity
            style={[styles.syncButton, (isSyncing || authLoading) && styles.syncButtonDisabled]}
            onPress={handleSyncCalendar}
            disabled={isSyncing || authLoading || !currentGoal}
          >
            <RefreshCw
              size={16}
              color={(isSyncing || authLoading) ? '#a3a3a3' : '#171717'}
              style={isSyncing ? styles.spinning : undefined}
            />
            <Text style={[styles.syncButtonText, (isSyncing || authLoading) && styles.syncButtonTextDisabled]}>
              {isSyncing ? 'Syncing...' : 'Sync Calendar'}
            </Text>
          </TouchableOpacity>
        </View>

        {sortedDates.length === 0 ? (
          <View style={styles.emptyState}>
            <CalendarIcon size={48} color="#a3a3a3" />
            <Text style={styles.emptyTitle}>No tasks scheduled</Text>
            <Text style={styles.emptySubtitle}>
              Your scheduled tasks will appear here
            </Text>
          </View>
        ) : (
          sortedDates.map((dateKey) => (
            <View key={dateKey} style={styles.daySection}>
              <Text style={styles.dateHeader}>{formatDate(dateKey)}</Text>
              <View style={styles.taskList}>
                {groupedTasks[dateKey].map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggle={() => toggleTask(task.id)}
                    onPress={() => setSelectedTask(task)}
                    showDay={false}
                  />
                ))}
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Task Detail Modal */}
      <TaskDetailModal
        visible={!!selectedTask}
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onToggleComplete={() => {
          if (selectedTask) {
            toggleTask(selectedTask.id);
          }
        }}
      />
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
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 16,
    color: '#737373',
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  syncButtonDisabled: {
    opacity: 0.6,
  },
  syncButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#171717',
  },
  syncButtonTextDisabled: {
    color: '#a3a3a3',
  },
  spinning: {
    // Note: React Native doesn't support CSS animations directly
    // The icon color change provides visual feedback instead
  },
  daySection: {
    marginBottom: 24,
  },
  dateHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#171717',
    marginBottom: 12,
  },
  taskList: {
    gap: 8,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#171717',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#737373',
  },
});
