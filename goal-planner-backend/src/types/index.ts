import { z } from 'zod';

// Request schemas
export const CreateGoalSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  currentLevel: z.enum(['beginner', 'some_experience', 'intermediate', 'advanced']),
  targetDate: z.string().datetime(),
  availability: z.array(
    z.object({
      dayOfWeek: z.number().min(0).max(6),
      startTime: z.string().regex(/^\d{2}:\d{2}$/),
      endTime: z.string().regex(/^\d{2}:\d{2}$/),
    })
  ),
});

export const UpdateGoalSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  status: z.enum(['active', 'completed', 'paused', 'abandoned']).optional(),
  targetDate: z.string().datetime().optional(),
});

export const UpdateTaskSchema = z.object({
  status: z.enum(['pending', 'completed', 'missed', 'skipped']),
});

export const CheckInSchema = z.object({
  goalId: z.string().uuid(),
  weekNumber: z.number().int().positive(),
  taskResults: z.array(
    z.object({
      taskId: z.string().uuid(),
      status: z.enum(['completed', 'missed', 'skipped']),
    })
  ),
  notes: z.string().optional(),
});

export const UpdateProfileSchema = z.object({
  timezone: z.string().optional(),
  checkInDay: z.number().min(0).max(6).optional(),
});

// AI response types
export interface GeneratedTask {
  title: string;
  description: string;
  resourceUrl?: string;
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

// Inferred types from schemas
export type CreateGoalInput = z.infer<typeof CreateGoalSchema>;
export type UpdateGoalInput = z.infer<typeof UpdateGoalSchema>;
export type UpdateTaskInput = z.infer<typeof UpdateTaskSchema>;
export type CheckInInput = z.infer<typeof CheckInSchema>;
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
