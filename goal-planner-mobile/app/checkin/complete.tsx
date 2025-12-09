import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CheckCircle, ArrowRight } from 'lucide-react-native';
import { Button } from '../../components/ui/Button';
import { useGoalStore } from '../../store/goal';

export default function CheckInCompleteScreen() {
  const router = useRouter();
  const { progress } = useGoalStore();

  const handleDone = () => {
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <CheckCircle size={64} color="#16a34a" />
        </View>

        <Text style={styles.title}>Check-in complete!</Text>
        <Text style={styles.subtitle}>
          Great job reflecting on your week. Your plan has been adjusted based
          on your feedback.
        </Text>

        <View style={styles.statsCard}>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Week completed</Text>
            <Text style={styles.statValue}>{progress?.currentWeek || 1}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Overall progress</Text>
            <Text style={styles.statValue}>
              {Math.round((progress?.completionRate || 0) * 100)}%
            </Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>What's next?</Text>
          <Text style={styles.infoText}>
            Your schedule for next week has been updated based on your progress.
            Check out your new tasks on the dashboard.
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          onPress={handleDone}
          icon={<ArrowRight size={20} color="#fff" />}
        >
          Back to Dashboard
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#171717',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#737373',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    maxWidth: 300,
  },
  statsCard: {
    width: '100%',
    backgroundColor: '#fafafa',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 16,
    color: '#525252',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '600',
    color: '#171717',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e5e5',
    marginVertical: 16,
  },
  infoCard: {
    width: '100%',
    backgroundColor: '#f0fdf4',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#14532d',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#15803d',
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
});
