import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronRight, X } from 'lucide-react-native';
import { StepIndicator } from '../../components/StepIndicator';
import { Checkbox } from '../../components/ui/Checkbox';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useGoalStore } from '../../store/goal';

export default function CheckInTasksScreen() {
  const router = useRouter();
  const { currentGoal, tasks, progress } = useGoalStore();
  const [taskStatuses, setTaskStatuses] = useState<Record<string, 'completed' | 'missed' | 'skipped'>>({});

  const currentWeek = progress?.currentWeek || 1;
  const currentWeekTasks = tasks.filter((t) => t.weekNumber === currentWeek);

  useEffect(() => {
    // Initialize statuses from current task states
    const initialStatuses: Record<string, 'completed' | 'missed' | 'skipped'> = {};
    currentWeekTasks.forEach((task) => {
      if (task.status === 'completed') {
        initialStatuses[task.id] = 'completed';
      }
    });
    setTaskStatuses(initialStatuses);
  }, [tasks]);

  const toggleTask = (taskId: string) => {
    setTaskStatuses((prev) => {
      const newStatuses = { ...prev };
      if (newStatuses[taskId] === 'completed') {
        delete newStatuses[taskId];
      } else {
        newStatuses[taskId] = 'completed';
      }
      return newStatuses;
    });
  };

  const markAsMissed = (taskId: string) => {
    setTaskStatuses((prev) => ({
      ...prev,
      [taskId]: 'missed',
    }));
  };

  const handleNext = () => {
    // Build task results
    const taskResults = currentWeekTasks.map((task) => ({
      taskId: task.id,
      status: taskStatuses[task.id] || 'missed',
    }));

    router.push({
      pathname: '/checkin/notes',
      params: {
        taskResults: JSON.stringify(taskResults),
        weekNumber: currentWeek.toString(),
      },
    });
  };

  const completedCount = Object.values(taskStatuses).filter(
    (s) => s === 'completed'
  ).length;
  const completionRate =
    currentWeekTasks.length > 0
      ? Math.round((completedCount / currentWeekTasks.length) * 100)
      : 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <X size={24} color="#171717" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Weekly Check-in</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <StepIndicator totalSteps={2} currentStep={1} />

          <View style={styles.titleSection}>
            <Text style={styles.title}>Week {currentWeek} review</Text>
            <Text style={styles.subtitle}>
              Mark the tasks you completed this week
            </Text>
          </View>

          <View style={styles.taskList}>
            {currentWeekTasks.map((task) => {
              const status = taskStatuses[task.id];
              const isCompleted = status === 'completed';
              const isMissed = status === 'missed';

              return (
                <TouchableOpacity
                  key={task.id}
                  onPress={() => toggleTask(task.id)}
                  style={[
                    styles.taskCard,
                    isCompleted && styles.taskCardCompleted,
                    isMissed && styles.taskCardMissed,
                  ]}
                  activeOpacity={0.7}
                >
                  <View style={styles.taskCheckbox}>
                    <Checkbox
                      checked={isCompleted}
                      onToggle={() => toggleTask(task.id)}
                      variant={isCompleted ? 'success' : 'default'}
                    />
                  </View>
                  <View style={styles.taskContent}>
                    <Text style={styles.taskTitle}>{task.title}</Text>
                    <Text style={styles.taskMeta}>{task.durationMinutes}min</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          <Card style={styles.statsCard}>
            <Text style={styles.statsLabel}>Completion rate</Text>
            <Text style={styles.statsValue}>{completionRate}%</Text>
            <Text style={styles.statsSubtext}>
              {completedCount} of {currentWeekTasks.length} tasks completed
            </Text>
          </Card>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          onPress={handleNext}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#171717',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  titleSection: {
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
  taskList: {
    gap: 8,
    marginBottom: 24,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
    borderColor: '#fecaca',
    backgroundColor: '#fef2f2',
    opacity: 0.6,
  },
  taskCheckbox: {
    marginTop: 2,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    color: '#171717',
    marginBottom: 2,
  },
  taskMeta: {
    fontSize: 14,
    color: '#737373',
  },
  statsCard: {
    backgroundColor: '#fafafa',
    borderColor: 'transparent',
  },
  statsLabel: {
    fontSize: 14,
    color: '#525252',
    marginBottom: 4,
  },
  statsValue: {
    fontSize: 32,
    fontWeight: '600',
    color: '#171717',
  },
  statsSubtext: {
    fontSize: 14,
    color: '#737373',
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
  },
});
