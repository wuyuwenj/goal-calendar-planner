import { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Sprout, ChevronRight, Flame, TrendingUp } from 'lucide-react-native';
import { GoalCard } from '../../components/GoalCard';
import { TaskItem } from '../../components/TaskItem';
import { TaskDetailModal } from '../../components/TaskDetailModal';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { useGoalStore } from '../../store/goal';
import { useAuthStore } from '../../store/auth';
import { COLORS, SHADOWS } from '../../constants/theme';
import type { Task } from '../../types';

export default function Dashboard() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const {
    currentGoal,
    tasks,
    progress,
    isLoading,
    fetchGoals,
    fetchGoalById,
    toggleTask,
  } = useGoalStore();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/(auth)/login');
      return;
    }
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated, authLoading]);

  const loadData = async () => {
    const goals = await fetchGoals();
    if (goals.length === 0) {
      router.replace('/onboarding');
      return;
    }
    if (goals[0]) {
      await fetchGoalById(goals[0].id);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  if (authLoading || isLoading) {
    return <LoadingSpinner message="Loading your goals..." />;
  }

  if (!isAuthenticated) {
    return null;
  }

  if (!currentGoal) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <View style={styles.emptyIconContainer}>
            <Sprout size={48} color={COLORS.primary.sage} />
          </View>
          <Text style={styles.emptyTitle}>Start your journey</Text>
          <Text style={styles.emptySubtitle}>
            Plant the seed for your first goal and watch it grow
          </Text>
          <Button onPress={() => router.push('/onboarding')}>
            Create Goal
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  const currentWeek = progress?.currentWeek || 1;
  const totalWeeks = progress?.totalWeeks || 1;
  const currentWeekTasks = tasks.filter((t) => t.weekNumber === currentWeek);
  const completedCount = currentWeekTasks.filter(
    (t) => t.status === 'completed'
  ).length;
  const totalCount = currentWeekTasks.length;
  const isWeekComplete = completedCount === totalCount && totalCount > 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary.forest}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.logoContainer}>
              <Sprout size={20} color={COLORS.primary.forest} />
            </View>
            <Text style={styles.headerTitle}>Trellis</Text>
          </View>
        </View>

        {/* Goal Card */}
        <View style={styles.section}>
          <GoalCard
            goal={currentGoal}
            currentWeek={currentWeek}
            totalWeeks={totalWeeks}
          />
        </View>

        {/* Week Complete Banner */}
        {isWeekComplete && (
          <Card variant="success" style={styles.section}>
            <View style={styles.successContent}>
              <Text style={styles.successEmoji}>🎉</Text>
              <View>
                <Text style={styles.successTitle}>Week complete!</Text>
                <Text style={styles.successText}>
                  Great work this week. Ready for your check-in?
                </Text>
              </View>
            </View>
          </Card>
        )}

        {/* Tasks Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>This week's tasks</Text>
            <View style={styles.taskCountBadge}>
              <Text style={styles.taskCount}>
                {completedCount}/{totalCount}
              </Text>
            </View>
          </View>

          {currentWeekTasks.length === 0 ? (
            <View style={styles.emptyTasks}>
              <Sprout size={32} color={COLORS.secondary.sand} />
              <Text style={styles.emptyTasksText}>No tasks scheduled yet</Text>
            </View>
          ) : (
            <View style={styles.taskList}>
              {currentWeekTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={() => toggleTask(task.id)}
                  onPress={() => setSelectedTask(task)}
                />
              ))}
            </View>
          )}
        </View>

        {/* Check-in Button */}
        {isWeekComplete && (
          <View style={styles.section}>
            <Button
              onPress={() => router.push('/checkin')}
              icon={<ChevronRight size={20} color={COLORS.white} />}
            >
              Weekly Check-in
            </Button>
          </View>
        )}

        {/* Stats */}
        <View style={styles.statsRow}>
          <Card variant="elevated" style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Flame size={20} color={COLORS.system.warning} />
            </View>
            <Text style={styles.statLabel}>Current streak</Text>
            <Text style={styles.statValue}>{currentWeek - 1} weeks</Text>
          </Card>
          <Card variant="elevated" style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <TrendingUp size={20} color={COLORS.primary.forest} />
            </View>
            <Text style={styles.statLabel}>Total progress</Text>
            <Text style={styles.statValue}>
              {Math.round((progress?.completionRate || 0) * 100)}%
            </Text>
          </Card>
        </View>
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
    backgroundColor: COLORS.secondary.cream,
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
  logoContainer: {
    padding: 6,
    backgroundColor: COLORS.primary.light,
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.primary.forest,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.secondary.bark,
  },
  taskCountBadge: {
    backgroundColor: COLORS.primary.light,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  taskCount: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary.forest,
  },
  taskList: {
    gap: 10,
  },
  emptyTasks: {
    paddingVertical: 48,
    alignItems: 'center',
    gap: 12,
  },
  emptyTasksText: {
    color: COLORS.secondary.warm,
    fontSize: 16,
  },
  successContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  successEmoji: {
    fontSize: 32,
  },
  successTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary.forest,
    marginBottom: 2,
  },
  successText: {
    fontSize: 14,
    color: COLORS.primary.sage,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statIconContainer: {
    padding: 10,
    backgroundColor: COLORS.secondary.cream,
    borderRadius: 12,
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    color: COLORS.secondary.warm,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.secondary.bark,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 16,
  },
  emptyIconContainer: {
    padding: 20,
    backgroundColor: COLORS.primary.light,
    borderRadius: 24,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.secondary.bark,
  },
  emptySubtitle: {
    fontSize: 16,
    color: COLORS.secondary.warm,
    textAlign: 'center',
    marginBottom: 8,
    paddingHorizontal: 20,
  },
});
