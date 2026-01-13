import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma';
import { authMiddleware, requireActiveSubscription, AuthenticatedRequest } from '../middleware/auth';
import { CheckInSchema } from '../types';
import { adjustPlanIntensity } from '../services/ai';
import { differenceInWeeks } from 'date-fns';

export async function checkinRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', authMiddleware);
  // Block expired subscriptions
  fastify.addHook('preHandler', requireActiveSubscription);

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
    const adjustment = input.adjustment || 'maintain';

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
      // Verify task belongs to the user's goal before updating
      const task = await prisma.task.findFirst({
        where: {
          id: result.taskId,
          goal: { profileId: req.profileId },
        },
      });

      if (!task) {
        return reply.status(404).send({ error: `Task ${result.taskId} not found or access denied` });
      }

      await prisma.task.update({
        where: { id: task.id },
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

    // Determine if we need to adjust the plan
    const needsAdjustment = adjustment !== 'maintain' || (input.notes && input.notes.trim().length > 0);

    let adjustedCount = 0;

    if (needsAdjustment && adjustment !== 'maintain') {
      console.log(`Check-in: User requested ${adjustment} intensity adjustment`);

      // Get current week tasks (for context)
      const currentWeekTasks = await prisma.task.findMany({
        where: {
          goalId: goal.id,
          weekNumber: input.weekNumber,
        },
        orderBy: [{ scheduledDate: 'asc' }, { scheduledTime: 'asc' }],
      });

      // Get next week tasks only (to adjust)
      const nextWeekTasks = await prisma.task.findMany({
        where: {
          goalId: goal.id,
          weekNumber: input.weekNumber + 1,
        },
        orderBy: [{ scheduledDate: 'asc' }, { scheduledTime: 'asc' }],
      });

      if (nextWeekTasks.length > 0) {
        try {
          // Call AI to adjust next week's tasks, using current week as context
          const adjustedTasks = await adjustPlanIntensity(
            goal.title,
            adjustment,
            currentWeekTasks,
            nextWeekTasks,
            input.notes
          );

          // Update tasks with adjusted values
          for (const adjusted of adjustedTasks) {
            await prisma.task.update({
              where: { id: adjusted.id },
              data: {
                title: adjusted.title,
                description: adjusted.description,
                durationMinutes: adjusted.durationMinutes,
              },
            });
            adjustedCount++;
          }

          console.log(`Check-in: Successfully adjusted ${adjustedCount} next week tasks`);
        } catch (error) {
          console.error('Failed to adjust plan intensity:', error);
          // Continue without adjustment - don't fail the check-in
        }
      } else {
        console.log('Check-in: No next week tasks to adjust');
      }
    } else {
      console.log('Check-in: No adjustment needed (maintain + no notes)');
    }

    // Update check-in with adjustment info
    await prisma.checkIn.update({
      where: { id: checkIn.id },
      data: {
        adjustments: JSON.stringify({
          type: adjustment,
          tasksAdjusted: adjustedCount,
        }),
      },
    });

    return {
      checkIn,
      adjustment,
      tasksAdjusted: adjustedCount,
      message: adjustedCount > 0
        ? `Check-in complete! Adjusted ${adjustedCount} future tasks.`
        : 'Check-in complete!',
    };
  });
}
