import { prisma } from '../lib/prisma';
import { generatePlan } from './ai';
import { createGoalCalendar, syncTasksToCalendar } from './calendar';
import { CreateGoalInput, GeneratedPlan } from '../types';
import { addDays, startOfWeek, addWeeks, differenceInWeeks } from 'date-fns';

interface TaskToCreate {
  id: string;
  title: string;
  description: string;
  scheduledDate: Date;
  scheduledTime: string;
  durationMinutes: number;
}

/**
 * Create a new goal with AI-generated plan
 */
export async function createGoalWithPlan(
  profileId: string,
  input: CreateGoalInput
): Promise<{
  goalId: string;
  plan: GeneratedPlan;
  calendarSynced: boolean;
}> {
  // Get user profile for timezone
  const profile = await prisma.profile.findUnique({
    where: { id: profileId },
  });

  if (!profile) {
    throw new Error('Profile not found');
  }

  // Save/update availability
  await prisma.availability.deleteMany({
    where: { profileId },
  });

  await prisma.availability.createMany({
    data: input.availability.map((a) => ({
      profileId,
      dayOfWeek: a.dayOfWeek,
      startTime: a.startTime,
      endTime: a.endTime,
    })),
  });

  // Generate AI plan
  const plan = await generatePlan(input, profile.timezone);

  // Create Google Calendar for this goal (if connected)
  let calendarId: string | null = null;
  if (profile.googleRefreshToken) {
    try {
      calendarId = await createGoalCalendar(profileId, input.title);
    } catch (error) {
      console.warn('Failed to create Google Calendar:', error);
    }
  }

  // Create goal in database
  const goal = await prisma.goal.create({
    data: {
      profileId,
      title: input.title,
      description: input.description,
      currentLevel: input.currentLevel,
      targetDate: new Date(input.targetDate),
      calendarId,
    },
  });

  // Create tasks from plan
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 0 });
  const tasks: TaskToCreate[] = [];

  for (const week of plan.weeklyPlans) {
    for (const task of week.tasks) {
      const taskDate = addDays(
        addWeeks(weekStart, week.weekNumber - 1),
        task.dayOfWeek
      );

      const createdTask = await prisma.task.create({
        data: {
          goalId: goal.id,
          title: task.title,
          description: task.description,
          scheduledDate: taskDate,
          scheduledTime: task.time,
          durationMinutes: task.durationMinutes,
          weekNumber: week.weekNumber,
        },
      });

      tasks.push({
        id: createdTask.id,
        title: task.title,
        description: task.description,
        scheduledDate: taskDate,
        scheduledTime: task.time,
        durationMinutes: task.durationMinutes,
      });
    }
  }

  // Sync to Google Calendar
  let calendarSynced = false;
  if (calendarId && profile.googleRefreshToken) {
    try {
      const eventIdMap = await syncTasksToCalendar(
        profileId,
        calendarId,
        tasks,
        profile.timezone
      );

      // Update tasks with Google event IDs
      for (const [taskId, eventId] of eventIdMap) {
        await prisma.task.update({
          where: { id: taskId },
          data: { googleEventId: eventId },
        });
      }
      calendarSynced = true;
    } catch (error) {
      console.warn('Failed to sync to Google Calendar:', error);
    }
  }

  return {
    goalId: goal.id,
    plan,
    calendarSynced,
  };
}

/**
 * Get goal progress statistics
 */
export async function getGoalProgress(goalId: string): Promise<{
  totalTasks: number;
  completedTasks: number;
  missedTasks: number;
  pendingTasks: number;
  completionRate: number;
  currentWeek: number;
  totalWeeks: number;
}> {
  const goal = await prisma.goal.findUnique({
    where: { id: goalId },
    include: {
      tasks: true,
    },
  });

  if (!goal) {
    throw new Error('Goal not found');
  }

  const totalTasks = goal.tasks.length;
  const completedTasks = goal.tasks.filter((t) => t.status === 'completed').length;
  const missedTasks = goal.tasks.filter((t) => t.status === 'missed').length;
  const pendingTasks = goal.tasks.filter((t) => t.status === 'pending').length;

  const currentWeek = Math.max(1, differenceInWeeks(new Date(), goal.createdAt) + 1);
  const totalWeeks = Math.max(1, differenceInWeeks(goal.targetDate, goal.createdAt));

  return {
    totalTasks,
    completedTasks,
    missedTasks,
    pendingTasks,
    completionRate: totalTasks > 0 ? completedTasks / totalTasks : 0,
    currentWeek,
    totalWeeks,
  };
}

/**
 * Get tasks for a specific week
 */
export async function getTasksForWeek(
  goalId: string,
  weekNumber: number
): Promise<{
  tasks: Array<{
    id: string;
    title: string;
    description: string | null;
    scheduledDate: Date;
    scheduledTime: string;
    durationMinutes: number;
    status: string;
  }>;
  weekFocus: string | null;
}> {
  const tasks = await prisma.task.findMany({
    where: {
      goalId,
      weekNumber,
    },
    orderBy: [{ scheduledDate: 'asc' }, { scheduledTime: 'asc' }],
  });

  // Get the check-in for context (if exists)
  const checkIn = await prisma.checkIn.findFirst({
    where: {
      goalId,
      weekNumber: weekNumber - 1,
    },
  });

  return {
    tasks,
    weekFocus: checkIn?.adjustments || null,
  };
}

/**
 * Get upcoming tasks across all goals for a user
 */
export async function getUpcomingTasks(
  profileId: string,
  limit: number = 10
): Promise<
  Array<{
    id: string;
    title: string;
    description: string | null;
    scheduledDate: Date;
    scheduledTime: string;
    durationMinutes: number;
    status: string;
    goal: {
      id: string;
      title: string;
    };
  }>
> {
  const tasks = await prisma.task.findMany({
    where: {
      goal: {
        profileId,
        status: 'active',
      },
      status: 'pending',
      scheduledDate: {
        gte: new Date(),
      },
    },
    include: {
      goal: {
        select: {
          id: true,
          title: true,
        },
      },
    },
    orderBy: [{ scheduledDate: 'asc' }, { scheduledTime: 'asc' }],
    take: limit,
  });

  return tasks;
}

/**
 * Mark overdue tasks as missed
 */
export async function markOverdueTasks(profileId: string): Promise<number> {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(23, 59, 59, 999);

  const result = await prisma.task.updateMany({
    where: {
      goal: {
        profileId,
        status: 'active',
      },
      status: 'pending',
      scheduledDate: {
        lt: yesterday,
      },
    },
    data: {
      status: 'missed',
    },
  });

  return result.count;
}
