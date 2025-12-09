import { create } from 'zustand';
import { apiClient } from '../lib/api';
import type {
  Goal,
  Task,
  OnboardingData,
  CheckIn,
  CreateGoalResponse,
  GoalProgress,
  Availability,
  Timeline,
} from '../types';

interface GoalState {
  currentGoal: Goal | null;
  goals: Goal[];
  tasks: Task[];
  checkIns: CheckIn[];
  progress: GoalProgress | null;
  isLoading: boolean;
  error: string | null;

  // Onboarding
  onboardingData: Partial<OnboardingData>;
  setOnboardingData: (data: Partial<OnboardingData>) => void;
  resetOnboarding: () => void;

  // Goal actions
  fetchGoals: () => Promise<Goal[]>;
  fetchGoalById: (id: string) => Promise<void>;
  createGoal: (data: OnboardingData) => Promise<Goal>;
  deleteGoal: (id: string) => Promise<void>;

  // Task actions
  fetchTodayTasks: () => Promise<Task[]>;
  fetchUpcomingTasks: (limit?: number) => Promise<Task[]>;
  toggleTask: (taskId: string) => Promise<void>;
  completeTask: (taskId: string) => Promise<void>;

  // Check-in actions
  submitCheckIn: (
    goalId: string,
    weekNumber: number,
    taskResults: Array<{ taskId: string; status: string }>,
    notes?: string
  ) => Promise<void>;

  // Calendar sync
  syncToCalendar: (goalId: string) => Promise<{ success: boolean; needsAuth?: boolean; synced?: number; error?: string }>;
}

function calculateTargetDate(timeline: Timeline, customWeeks?: number): string {
  const weeks =
    timeline === '1month'
      ? 4
      : timeline === '3months'
        ? 12
        : timeline === '6months'
          ? 24
          : customWeeks || 12;

  const date = new Date();
  date.setDate(date.getDate() + weeks * 7);
  return date.toISOString();
}

export const useGoalStore = create<GoalState>((set, get) => ({
  currentGoal: null,
  goals: [],
  tasks: [],
  checkIns: [],
  progress: null,
  isLoading: false,
  error: null,
  onboardingData: {},

  setOnboardingData: (data) => {
    set((state) => ({
      onboardingData: { ...state.onboardingData, ...data },
    }));
  },

  resetOnboarding: () => {
    set({ onboardingData: {} });
  },

  fetchGoals: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get<{ goals: Goal[] }>('/api/goals');
      const goals = response.goals || [];
      set({ goals });
      if (goals.length > 0) {
        set({ currentGoal: goals[0] });
      }
      return goals;
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch goals' });
      return [];
    } finally {
      set({ isLoading: false });
    }
  },

  fetchGoalById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get<{
        goal: Goal & { tasks: Task[]; checkIns: CheckIn[] };
        progress: GoalProgress;
      }>(`/api/goals/${id}`);
      set({
        currentGoal: response.goal,
        tasks: response.goal.tasks || [],
        checkIns: response.goal.checkIns || [],
        progress: response.progress,
      });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch goal' });
    } finally {
      set({ isLoading: false });
    }
  },

  createGoal: async (data: OnboardingData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post<CreateGoalResponse>('/api/goals', {
        title: data.title,
        description: data.description || data.levelDetails,
        currentLevel: data.currentLevel,
        targetDate: calculateTargetDate(data.timeline, data.customWeeks),
        availability: data.availability,
      });

      set({ currentGoal: response.goal });
      return response.goal;
    } catch (error: any) {
      set({ error: error.message || 'Failed to create goal' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteGoal: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.delete(`/api/goals/${id}`);
      set((state) => ({
        goals: state.goals.filter((g) => g.id !== id),
        currentGoal: state.currentGoal?.id === id ? null : state.currentGoal,
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to delete goal' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  fetchTodayTasks: async () => {
    try {
      const response = await apiClient.get<{ tasks: Task[] }>('/api/tasks/today');
      const tasks = response.tasks || [];
      set({ tasks });
      return tasks;
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch tasks' });
      return [];
    }
  },

  fetchUpcomingTasks: async (limit = 10) => {
    try {
      const response = await apiClient.get<{ tasks: Task[] }>(
        `/api/tasks/upcoming?limit=${limit}`
      );
      return response.tasks || [];
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch tasks' });
      return [];
    }
  },

  toggleTask: async (taskId: string) => {
    const task = get().tasks.find((t) => t.id === taskId);
    if (!task) return;

    const newStatus = task.status === 'completed' ? 'pending' : 'completed';

    // Optimistic update
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId ? { ...t, status: newStatus } : t
      ),
    }));

    try {
      await apiClient.patch(`/api/tasks/${taskId}`, { status: newStatus });
    } catch (error) {
      // Revert on error
      set((state) => ({
        tasks: state.tasks.map((t) =>
          t.id === taskId ? { ...t, status: task.status } : t
        ),
      }));
    }
  },

  completeTask: async (taskId: string) => {
    // Optimistic update
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId ? { ...t, status: 'completed' } : t
      ),
    }));

    try {
      await apiClient.post(`/api/tasks/${taskId}/complete`);
    } catch (error: any) {
      // Revert on error
      set((state) => ({
        tasks: state.tasks.map((t) =>
          t.id === taskId ? { ...t, status: 'pending' } : t
        ),
      }));
    }
  },

  submitCheckIn: async (goalId, weekNumber, taskResults, notes) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post<{
        checkIn: CheckIn;
        adjustedPlan: any;
        newTasksCount: number;
      }>('/api/checkin', {
        goalId,
        weekNumber,
        taskResults,
        notes,
      });

      // Refresh goal data
      await get().fetchGoalById(goalId);
    } catch (error: any) {
      set({ error: error.message || 'Failed to submit check-in' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  syncToCalendar: async (goalId: string, force: boolean = false) => {
    set({ isLoading: true, error: null });
    try {
      const url = force
        ? `/api/goals/${goalId}/sync-calendar?force=true`
        : `/api/goals/${goalId}/sync-calendar`;
      const response = await apiClient.post<{
        success: boolean;
        synced: number;
        created: number;
        updated: number;
      }>(url);

      // Refresh goal data to get updated googleEventIds
      await get().fetchGoalById(goalId);

      return { success: true, synced: response.synced };
    } catch (error: any) {
      console.log('Calendar sync error:', JSON.stringify(error, null, 2));
      const errorMessage = error.message || error.error || 'Failed to sync calendar';
      // Check for calendar auth required error
      const needsAuth = error.code === 'CALENDAR_AUTH_REQUIRED' ||
                        error.error === 'Google Calendar not connected' ||
                        errorMessage.includes('Calendar not connected');

      console.log('syncToCalendar error - needsAuth:', needsAuth, 'code:', error.code, 'error.error:', error.error);
      set({ error: errorMessage });
      return { success: false, needsAuth, error: errorMessage };
    } finally {
      set({ isLoading: false });
    }
  },
}));
