import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';
import { CheckInSchema } from '../types';
import { regeneratePlan } from '../services/ai';
import { syncTasksToCalendar, deleteCalendarEvents } from '../services/calendar';
import { addDays, startOfWeek, addWeeks, differenceInWeeks } from 'date-fns';

export async function checkinRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', authMiddleware);

  // Get pending check-in for a goal
  fastify.get<{ Params: { goalId: string } }>(
    '/pending/:goalId',
    async (request, reply) => {
      const req = request as AuthenticatedRequest;
      const { goalId } = request.params;

      const goal = await prisma.goal.findFirst({
        where: {
          id: goalId,
          profileId: req.profileId,
        },
      });

      if (!goal) {
        return reply.status(404).send({ error: 'Goal not found' });
      }

      // Calculate current week
      const currentWeek = Math.max(
        1,
        differenceInWeeks(new Date(), goal.createdAt) + 1
      );

      // Get last check-in
      const lastCheckIn = await prisma.checkIn.findFirst({
        where: { goalId: goal.id },
        orderBy: { weekNumber: 'desc' },
      });

      const pendingWeek = lastCheckIn ? lastCheckIn.weekNumber + 1 : 1;

      if (pendingWeek > currentWeek) {
        return { needsCheckIn: false, message: 'No check-in needed yet' };
      }

      // Get tasks for pending week
      const tasks = await prisma.task.findMany({
        where: {
          goalId: goal.id,
          weekNumber: pendingWeek,
        },
        orderBy: { scheduledDate: 'asc' },
      });

      return {
        needsCheckIn: true,
        weekNumber: pendingWeek,
        tasks,
      };
    }
  );

  // Get check-in history for a goal
  fastify.get<{ Params: { goalId: string } }>(
    '/history/:goalId',
    async (request, reply) => {
      const req = request as AuthenticatedRequest;
      const { goalId } = request.params;

      const goal = await prisma.goal.findFirst({
        where: {
          id: goalId,
          profileId: req.profileId,
        },
      });

      if (!goal) {
        return reply.status(404).send({ error: 'Goal not found' });
      }

      const checkIns = await prisma.checkIn.findMany({
        where: { goalId: goal.id },
        orderBy: { weekNumber: 'desc' },
      });

      return { checkIns };
    }
  );

  // Submit check-in
  fastify.post('/', async (request, reply) => {
    const req = request as AuthenticatedRequest;
    const parseResult = CheckInSchema.safeParse(request.body);

    if (!parseResult.success) {
      return reply.status(400).send({ error: parseResult.error.errors });
    }

    const input = parseResult.data;

    // Verify goal belongs to user
    const goal = await prisma.goal.findFirst({
      where: {
        id: input.goalId,
        profileId: req.profileId,
      },
    });

    if (!goal) {
      return reply.status(404).send({ error: 'Goal not found' });
    }

    // Update task statuses
    const completedTasks: string[] = [];
    const missedTasks: string[] = [];

    for (const result of input.taskResults) {
      const task = await prisma.task.update({
        where: { id: result.taskId },
        data: { status: result.status },
      });

      if (result.status === 'completed') {
        completedTasks.push(task.title);
      } else if (result.status === 'missed') {
        missedTasks.push(task.title);
      }
    }

    // Create check-in record
    const checkIn = await prisma.checkIn.create({
      data: {
        goalId: input.goalId,
        weekNumber: input.weekNumber,
        completedTasks: completedTasks.length,
        totalTasks: input.taskResults.length,
        notes: input.notes,
      },
    });

    // Get profile for timezone and availability
    const profile = await prisma.profile.findUnique({
      where: { id: req.profileId },
      include: { availability: true },
    });

    if (!profile) {
      return reply.status(404).send({ error: 'Profile not found' });
    }

    // Calculate remaining weeks
    const remainingWeeks = Math.max(
      1,
      differenceInWeeks(goal.targetDate, new Date())
    );

    // Regenerate plan for remaining weeks
    const newPlan = await regeneratePlan(
      goal.title,
      goal.description,
      goal.currentLevel,
      remainingWeeks,
      completedTasks,
      missedTasks,
      profile.availability.map((a) => ({
        dayOfWeek: a.dayOfWeek,
        startTime: a.startTime,
        endTime: a.endTime,
      })),
      profile.timezone,
      input.notes
    );

    // Delete future tasks
    const futureTasks = await prisma.task.findMany({
      where: {
        goalId: goal.id,
        weekNumber: { gt: input.weekNumber },
      },
    });

    // Delete from Google Calendar
    if (goal.calendarId && profile.googleRefreshToken) {
      const eventIds = futureTasks
        .map((t) => t.googleEventId)
        .filter((id): id is string => id !== null);

      if (eventIds.length > 0) {
        try {
          await deleteCalendarEvents(req.profileId, goal.calendarId, eventIds);
        } catch (error) {
          console.warn('Failed to delete calendar events:', error);
        }
      }
    }

    // Delete from database
    await prisma.task.deleteMany({
      where: {
        goalId: goal.id,
        weekNumber: { gt: input.weekNumber },
      },
    });

    // Create new tasks
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 0 });
    const newTasks: Array<{
      id: string;
      title: string;
      description: string;
      scheduledDate: Date;
      scheduledTime: string;
      durationMinutes: number;
    }> = [];

    for (const week of newPlan.weeklyPlans) {
      for (const task of week.tasks) {
        const taskDate = addDays(addWeeks(weekStart, week.weekNumber), task.dayOfWeek);

        const createdTask = await prisma.task.create({
          data: {
            goalId: goal.id,
            title: task.title,
            description: task.description,
            scheduledDate: taskDate,
            scheduledTime: task.time,
            durationMinutes: task.durationMinutes,
            weekNumber: input.weekNumber + week.weekNumber,
          },
        });

        newTasks.push({
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
    if (goal.calendarId && profile.googleRefreshToken) {
      try {
        const eventIdMap = await syncTasksToCalendar(
          req.profileId,
          goal.calendarId,
          newTasks,
          profile.timezone
        );

        for (const [taskId, eventId] of eventIdMap) {
          await prisma.task.update({
            where: { id: taskId },
            data: { googleEventId: eventId },
          });
        }
      } catch (error) {
        console.warn('Failed to sync to Google Calendar:', error);
      }
    }

    // Update check-in with adjustments info
    await prisma.checkIn.update({
      where: { id: checkIn.id },
      data: {
        adjustments: JSON.stringify({
          tasksRescheduled: newTasks.length,
          weeklyPlans: newPlan.weeklyPlans.map((w) => w.focus),
        }),
      },
    });

    return {
      checkIn,
      adjustedPlan: newPlan,
      newTasksCount: newTasks.length,
      message: 'Check-in complete, plan adjusted for remaining weeks',
    };
  });
}
