export type ExperienceLevel = 'beginner' | 'some_experience' | 'intermediate' | 'advanced';
export type Timeline = '1month' | '3months' | '6months' | 'custom';
export type TaskStatus = 'pending' | 'completed' | 'missed' | 'skipped';
export type GoalStatus = 'active' | 'completed' | 'paused' | 'abandoned';

export interface Goal {
  id: string;
  title: string;
  description?: string;
  currentLevel: ExperienceLevel;
  targetDate: string;
  calendarId?: string;
  status: GoalStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  goalId: string;
  title: string;
  description?: string;
  scheduledDate: string;
  scheduledTime: string;
  durationMinutes: number;
  status: TaskStatus;
  googleEventId?: string;
  weekNumber: number;
}

export interface CheckIn {
  id: string;
  goalId: string;
  weekNumber: number;
  completedTasks: number;
  totalTasks: number;
  notes?: string;
  createdAt: string;
}

export interface Availability {
  id?: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface User {
  id: string;
  email: string;
  timezone: string;
  checkInDay: number;
  googleConnected: boolean;
}

export type GoalCategory = 'learning' | 'health' | 'career' | 'creative' | 'other';

export interface OnboardingData {
  category?: GoalCategory;
  title: string;
  description: string;
  currentLevel: ExperienceLevel;
  levelDetails: string;
  timeline: Timeline;
  customWeeks?: number;
  availability: Availability[];
  commitments: string;
}

export interface GeneratedTask {
  title: string;
  description: string;
  dayOfWeek: number;
  time: string;
  durationMinutes: number;
  weekNumber: number;
}

export interface WeeklyPlan {
  weekNumber: number;
  focus: string;
  tasks: GeneratedTask[];
}

export interface GeneratedPlan {
  totalWeeks: number;
  weeklyPlans: WeeklyPlan[];
}

export interface CreateGoalResponse {
  goal: Goal;
  plan: GeneratedPlan;
  calendarSynced: boolean;
  message: string;
}

export interface GoalProgress {
  totalTasks: number;
  completedTasks: number;
  missedTasks: number;
  pendingTasks: number;
  completionRate: number;
  currentWeek: number;
  totalWeeks: number;
}
