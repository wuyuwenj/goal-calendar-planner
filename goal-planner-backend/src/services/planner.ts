import { prisma } from '../lib/prisma';
import { generatePlan } from './ai';
import { createGoalCalendar, syncTasksToCalendar } from './calendar';
import { CreateGoalInput, GeneratedPlan } from '../types';
import { addDays, startOfWeek, addWeeks, differenceInWeeks } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

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
  console.log('Planner: Generating AI plan...');
  const plan = await generatePlan(input, profile.timezone);
  console.log('Planner: AI plan generated successfully');

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
  console.log('Planner: Creating goal in database...');
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
  console.log('Planner: Goal created');

  // Create tasks from plan (batch insert for performance)
  // Use user's timezone to calculate the correct week start
  const userNow = toZonedTime(new Date(), profile.timezone);
  const weekStart = startOfWeek(userNow, { weekStartsOn: 0 });

  // Get today's date in user's timezone (to avoid scheduling in the past)
  const todayInUserTz = new Date(userNow.getFullYear(), userNow.getMonth(), userNow.getDate());

  const taskDataList: Array<{
    goalId: string;
    title: string;
    description: string;
    resourceUrl?: string;
    scheduledDate: Date;
    scheduledTime: string;
    durationMinutes: number;
    weekNumber: number;
  }> = [];

  for (const week of plan.weeklyPlans) {
    for (const task of week.tasks) {
      // Calculate the task date in user's timezone
      let localTaskDate = addDays(
        addWeeks(weekStart, week.weekNumber - 1),
        task.dayOfWeek
      );

      // If the task date is in the past (before today), push it forward by a week
      // This handles the case where user creates a goal mid-week
      if (week.weekNumber === 1 && localTaskDate < todayInUserTz) {
        localTaskDate = addDays(localTaskDate, 7);
      }

      // Store as UTC midnight for that logical date
      // This ensures "Tuesday Dec 10" stays as Dec 10 regardless of timezone
      const utcDate = new Date(Date.UTC(
        localTaskDate.getFullYear(),
        localTaskDate.getMonth(),
        localTaskDate.getDate()
      ));

      taskDataList.push({
        goalId: goal.id,
        title: task.title,
        description: task.description,
        resourceUrl: task.resourceUrl,
        scheduledDate: utcDate,
        scheduledTime: task.time,
        durationMinutes: task.durationMinutes,
        weekNumber: week.weekNumber,
      });
    }
  }

  // Batch create all tasks at once
  console.log(`Planner: Creating ${taskDataList.length} tasks...`);
  await prisma.task.createMany({ data: taskDataList });

  // Fetch created tasks for calendar sync
  const createdTasks = await prisma.task.findMany({
    where: { goalId: goal.id },
    orderBy: [{ weekNumber: 'asc' }, { scheduledDate: 'asc' }],
  });
  console.log('Planner: Tasks created, mapping for response...');

  const tasks: TaskToCreate[] = createdTasks.map(t => ({
    id: t.id,
    title: t.title,
    description: t.description || '',
    scheduledDate: t.scheduledDate,
    scheduledTime: t.scheduledTime,
    durationMinutes: t.durationMinutes,
  }));

  // Sync to Google Calendar (async, don't wait)
  let calendarSynced = false;
  if (calendarId && profile.googleRefreshToken) {
    // Don't await - sync in background to avoid timeout
    console.log('Planner: Starting calendar sync in background...');
    syncTasksToCalendar(profileId, calendarId, tasks, profile.timezone)
      .then(async (eventIdMap) => {
        // Batch update with event IDs
        const updates = Array.from(eventIdMap.entries()).map(([taskId, eventId]) =>
          prisma.task.update({ where: { id: taskId }, data: { googleEventId: eventId } })
        );
        await Promise.all(updates);
        console.log('Planner: Calendar sync completed');
      })
      .catch((error) => {
        console.warn('Failed to sync to Google Calendar:', error);
      });
    calendarSynced = true; // Optimistic
  }

  console.log('Planner: Returning response...');
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
