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

interface PendingGoalResult {
  pending: true;
  pendingId: string;
  message: string;
}

interface GoalState {
  currentGoal: Goal | null;
  goals: Goal[];
  tasks: Task[];
  checkIns: CheckIn[];
  progress: GoalProgress | null;
  isLoading: boolean;
  isInitialLoad: boolean; // True only on first load, not refreshes
  lastFetched: number | null; // Timestamp of last successful fetch
  error: string | null;
  pendingGoalId: string | null;
  deletingGoalIds: Set<string>; // Track goals being deleted to prevent race conditions

  // Onboarding
  onboardingData: Partial<OnboardingData>;
  setOnboardingData: (data: Partial<OnboardingData>) => void;
  resetOnboarding: () => void;

  // Goal actions
  fetchGoals: (options?: { background?: boolean }) => Promise<Goal[]>;
  fetchGoalById: (id: string, options?: { background?: boolean; skipIfFresh?: boolean }) => Promise<void>;
  isDataFresh: (maxAgeMs?: number) => boolean;
  createGoal: (data: OnboardingData) => Promise<Goal | PendingGoalResult>;
  checkPendingGoal: (pendingId: string) => Promise<{ status: string; goal?: Goal; error?: string }>;
  clearPendingGoal: () => void;
  deleteGoal: (id: string) => Promise<void>;

  // Task actions
  fetchTodayTasks: () => Promise<Task[]>;
  fetchUpcomingTasks: (limit?: number) => Promise<Task[]>;
  toggleTask: (taskId: string) => Promise<void>;
  completeTask: (taskId: string) => Promise<void>;
  markTaskMissed: (taskId: string) => Promise<void>;

  // Check-in actions
  submitCheckIn: (
    goalId: string,
    weekNumber: number,
    taskResults: Array<{ taskId: string; status: string }>,
    notes?: string,
    adjustment?: 'decrease' | 'maintain' | 'increase'
  ) => Promise<void>;

  // Calendar sync
  syncToCalendar: (goalId: string, force?: boolean) => Promise<{ success: boolean; needsAuth?: boolean; synced?: number; error?: string }>;

  // Reset store (called on sign out)
  reset: () => void;
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

// Data is considered fresh for 30 seconds
const DEFAULT_FRESH_DURATION = 30 * 1000;

export const useGoalStore = create<GoalState>((set, get) => ({
  currentGoal: null,
  goals: [],
  tasks: [],
  checkIns: [],
  progress: null,
  isLoading: false,
  isInitialLoad: true,
  lastFetched: null,
  error: null,
  pendingGoalId: null,
  deletingGoalIds: new Set<string>(),
  onboardingData: {},

  setOnboardingData: (data) => {
    set((state) => ({
      onboardingData: { ...state.onboardingData, ...data },
    }));
  },

  resetOnboarding: () => {
    set({ onboardingData: {} });
  },

  isDataFresh: (maxAgeMs = DEFAULT_FRESH_DURATION) => {
    const { lastFetched } = get();
    if (!lastFetched) return false;
    return Date.now() - lastFetched < maxAgeMs;
  },

  fetchGoals: async (options = {}) => {
    const { background = false } = options;
    const { isInitialLoad, deletingGoalIds } = get();

    // Only show loading spinner on initial load, not background refreshes
    if (!background && isInitialLoad) {
      set({ isLoading: true, error: null });
    }

    try {
      const response = await apiClient.get<{ goals: Goal[] }>('/api/goals');
      // Filter out any goals that are currently being deleted to prevent race conditions
      const goals = (response.goals || []).filter((g) => !deletingGoalIds.has(g.id));
      set({ goals });
      if (goals.length > 0) {
        set({ currentGoal: goals[0] });
      }
      return goals;
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch goals' });
      return [];
    } finally {
      if (!background && isInitialLoad) {
        set({ isLoading: false });
      }
    }
  },

  fetchGoalById: async (id: string, options = {}) => {
    const { background = false, skipIfFresh = false } = options;
    const { isInitialLoad, currentGoal, deletingGoalIds } = get();

    // Don't fetch a goal that's being deleted
    if (deletingGoalIds.has(id)) {
      return;
    }

    // Skip fetch if data is fresh and we have the same goal loaded
    if (skipIfFresh && currentGoal?.id === id && get().isDataFresh()) {
      return;
    }

    // Only show loading spinner on initial load, not background refreshes
    if (!background && isInitialLoad) {
      set({ isLoading: true, error: null });
    }

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
        lastFetched: Date.now(),
        isInitialLoad: false,
      });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch goal' });
    } finally {
      if (!background && isInitialLoad) {
        set({ isLoading: false });
      }
    }
  },

  createGoal: async (data: OnboardingData) => {
    set({ isLoading: true, error: null, pendingGoalId: null });
    try {
      const response = await apiClient.post<CreateGoalResponse | PendingGoalResult>('/api/goals', {
        title: data.title,
        description: data.description || data.levelDetails,
        currentLevel: data.currentLevel,
        targetDate: calculateTargetDate(data.timeline, data.customWeeks),
        availability: data.availability,
      });

      // Check if the goal was queued for later processing
      if ('pending' in response && response.pending) {
        set({ pendingGoalId: response.pendingId });
        return response as PendingGoalResult;
      }

      // Goal created immediately
      const goalResponse = response as CreateGoalResponse;
      set({ currentGoal: goalResponse.goal });
      return goalResponse.goal;
    } catch (error: any) {
      // Check if error response contains pending info (rate limited)
      if (error.pending && error.pendingId) {
        set({ pendingGoalId: error.pendingId });
        return error as PendingGoalResult;
      }
      set({ error: error.message || 'Failed to create goal' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  checkPendingGoal: async (pendingId: string) => {
    try {
      const response = await apiClient.get<{
        status: string;
        goal?: Goal;
        error?: string;
      }>(`/api/goals/pending/${pendingId}`);

      if (response.status === 'completed' && response.goal) {
        set({ currentGoal: response.goal, pendingGoalId: null });
      }

      return response;
    } catch (error: any) {
      return { status: 'error', error: error.message };
    }
  },

  clearPendingGoal: () => {
    set({ pendingGoalId: null });
  },

  deleteGoal: async (id: string) => {
    // Add to deletingGoalIds to prevent race conditions with concurrent fetches
    set((state) => {
      const newDeletingIds = new Set(state.deletingGoalIds);
      newDeletingIds.add(id);
      return { isLoading: true, error: null, deletingGoalIds: newDeletingIds };
    });

    try {
      await apiClient.delete(`/api/goals/${id}`);
      set((state) => ({
        goals: state.goals.filter((g) => g.id !== id),
        currentGoal: state.currentGoal?.id === id ? null : state.currentGoal,
        tasks: state.currentGoal?.id === id ? [] : state.tasks,
        lastFetched: null, // Invalidate cache to force fresh fetch next time
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to delete goal' });
      throw error;
    } finally {
      // Remove from deletingGoalIds after a delay to handle any in-flight fetches
      setTimeout(() => {
        set((state) => {
          const newDeletingIds = new Set(state.deletingGoalIds);
          newDeletingIds.delete(id);
          return { deletingGoalIds: newDeletingIds };
        });
      }, 5000); // Keep in set for 5 seconds to catch any delayed fetches
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

  markTaskMissed: async (taskId: string) => {
    const task = get().tasks.find((t) => t.id === taskId);
    if (!task) return;

    const previousStatus = task.status;

    // Optimistic update
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId ? { ...t, status: 'missed' } : t
      ),
    }));

    try {
      await apiClient.patch(`/api/tasks/${taskId}`, { status: 'missed' });
    } catch (error: any) {
      // Revert on error
      set((state) => ({
        tasks: state.tasks.map((t) =>
          t.id === taskId ? { ...t, status: previousStatus } : t
        ),
      }));
    }
  },

  submitCheckIn: async (goalId, weekNumber, taskResults, notes, adjustment) => {
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
        adjustment,
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

  reset: () => {
    set({
      currentGoal: null,
      goals: [],
      tasks: [],
      checkIns: [],
      progress: null,
      isLoading: false,
      isInitialLoad: true,
      lastFetched: null,
      error: null,
      pendingGoalId: null,
      deletingGoalIds: new Set<string>(),
      onboardingData: {},
    });
  },
}));
