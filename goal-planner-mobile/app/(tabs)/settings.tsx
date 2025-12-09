import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Settings, User, Calendar, Bell, LogOut, Trash2, ChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/auth';
import { useGoalStore } from '../../store/goal';
import { Button } from '../../components/ui/Button';

export default function SettingsScreen() {
  const router = useRouter();
  const { user, session, signOut } = useAuthStore();
  const { currentGoal, deleteGoal } = useGoalStore();

  // Use session email as fallback when profile hasn't loaded
  const displayEmail = user?.email || session?.user?.email || 'Not signed in';

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const handleDeleteGoal = () => {
    if (!currentGoal) return;

    Alert.alert(
      'Delete Goal',
      `Are you sure you want to delete "${currentGoal.title}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteGoal(currentGoal.id);
              router.replace('/onboarding');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete goal');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Settings size={20} color="#737373" />
            <Text style={styles.headerTitle}>Settings</Text>
          </View>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.card}>
            <View style={styles.accountRow}>
              <View style={styles.avatar}>
                <User size={24} color="#737373" />
              </View>
              <View style={styles.accountInfo}>
                <Text style={styles.accountEmail}>{displayEmail}</Text>
                <Text style={styles.accountLabel}>Google Account</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.card}>
            <SettingsRow
              icon={<Calendar size={20} color="#525252" />}
              label="Timezone"
              value={user?.timezone || 'America/New_York'}
            />
            <View style={styles.divider} />
            <SettingsRow
              icon={<Bell size={20} color="#525252" />}
              label="Check-in Day"
              value={['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][user?.checkInDay || 0]}
            />
          </View>
        </View>

        {/* Current Goal Section */}
        {currentGoal && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Current Goal</Text>
            <View style={styles.card}>
              <Text style={styles.goalTitle}>{currentGoal.title}</Text>
              <Text style={styles.goalStatus}>
                Status: {currentGoal.status}
              </Text>
              <TouchableOpacity
                style={styles.deleteGoalButton}
                onPress={handleDeleteGoal}
              >
                <Trash2 size={16} color="#b91c1c" />
                <Text style={styles.deleteGoalText}>Delete Goal</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Sign Out */}
        <View style={styles.section}>
          <Button variant="secondary" onPress={handleSignOut}>
            <View style={styles.signOutContent}>
              <LogOut size={18} color="#171717" />
              <Text style={styles.signOutText}>Sign Out</Text>
            </View>
          </Button>
        </View>

        {/* App Version */}
        <Text style={styles.version}>Trellis v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function SettingsRow({
  icon,
  label,
  value,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.settingsRow}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingsRowLeft}>
        {icon}
        <Text style={styles.settingsLabel}>{label}</Text>
      </View>
      <View style={styles.settingsRowRight}>
        <Text style={styles.settingsValue}>{value}</Text>
        {onPress && <ChevronRight size={16} color="#a3a3a3" />}
      </View>
    </TouchableOpacity>
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#737373',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: '#fafafa',
    borderRadius: 12,
    padding: 16,
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e5e5e5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountInfo: {
    flex: 1,
  },
  accountEmail: {
    fontSize: 16,
    fontWeight: '500',
    color: '#171717',
  },
  accountLabel: {
    fontSize: 14,
    color: '#737373',
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  settingsRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingsRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingsLabel: {
    fontSize: 16,
    color: '#171717',
  },
  settingsValue: {
    fontSize: 14,
    color: '#737373',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e5e5',
    marginVertical: 12,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#171717',
    marginBottom: 4,
  },
  goalStatus: {
    fontSize: 14,
    color: '#737373',
    marginBottom: 12,
  },
  deleteGoalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 8,
  },
  deleteGoalText: {
    fontSize: 14,
    color: '#b91c1c',
  },
  signOutContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#171717',
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: '#a3a3a3',
    marginBottom: 32,
  },
});
