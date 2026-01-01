import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma';
import { authMiddleware, requireActiveSubscription, AuthenticatedRequest } from '../middleware/auth';
import { CreateGoalSchema, UpdateGoalSchema } from '../types';
import { createGoalWithPlan, getGoalProgress } from '../services/planner';
import { deleteGoalCalendar, createGoalCalendar, syncTasksToCalendar } from '../services/calendar';
import { queueGoalCreation, getPendingGoalStatus } from '../services/jobQueue';

export async function goalRoutes(fastify: FastifyInstance) {
  // Apply auth to all routes
  fastify.addHook('preHandler', authMiddleware);
  // Block expired subscriptions from all goal routes
  fastify.addHook('preHandler', requireActiveSubscription);

  // Get all goals for user
  fastify.get('/', async (request) => {
    const req = request as AuthenticatedRequest;

    const goals = await prisma.goal.findMany({
      where: { profileId: req.profileId },
      include: {
        tasks: {
          where: { status: 'pending' },
          take: 5,
          orderBy: { scheduledDate: 'asc' },
        },
        _count: {
          select: { tasks: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Add progress info to each goal
    const goalsWithProgress = await Promise.all(
      goals.map(async (goal) => {
        const progress = await getGoalProgress(goal.id);
        return {
          ...goal,
          progress,
        };
      })
    );

    return { goals: goalsWithProgress };
  });

  // Get single goal with all tasks
  fastify.get<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const req = request as AuthenticatedRequest;
    const { id } = request.params;

    const goal = await prisma.goal.findFirst({
      where: {
        id,
        profileId: req.profileId,
      },
      include: {
        tasks: {
          orderBy: [{ weekNumber: 'asc' }, { scheduledDate: 'asc' }],
        },
        checkIns: {
          orderBy: { weekNumber: 'desc' },
        },
      },
    });

    if (!goal) {
      return reply.status(404).send({ error: 'Goal not found' });
    }

    const progress = await getGoalProgress(goal.id);

    return { goal, progress };
  });

  // Get goal creation quota
  fastify.get('/quota', async (request) => {
    const req = request as AuthenticatedRequest;
    const DAILY_LIMIT = 3;
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Middleware already blocks expired users, so we know subscription is active
    const tier = req.subscriptionStatus.tier;

    // Get recent creations for rate limiting
    const recentCreations = await prisma.usageLog.findMany({
      where: {
        profileId: req.profileId,
        action: 'goal_create',
        createdAt: { gte: oneDayAgo }
      },
      orderBy: { createdAt: 'asc' }
    });

    const remaining = Math.max(0, DAILY_LIMIT - recentCreations.length);
    let resetsAt: string | null = null;

    if (recentCreations.length > 0 && remaining === 0) {
      const oldestCreation = recentCreations[0];
      resetsAt = new Date(oldestCreation.createdAt.getTime() + 24 * 60 * 60 * 1000).toISOString();
    }

    return {
      tier,
      limit: DAILY_LIMIT,
      remaining,
      used: recentCreations.length,
      resetsAt
    };
  });

  // Create new goal
  fastify.post('/', async (request, reply) => {
    const req = request as AuthenticatedRequest;
    const parseResult = CreateGoalSchema.safeParse(request.body);

    if (!parseResult.success) {
      return reply.status(400).send({ error: parseResult.error.errors });
    }

    const input = parseResult.data;

    // Middleware already blocks expired users
    // Rate limit: 3 goals per day for all active users
    const DAILY_LIMIT = 3;
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const recentCreations = await prisma.usageLog.findMany({
      where: {
        profileId: req.profileId,
        action: 'goal_create',
        createdAt: { gte: oneDayAgo }
      },
      orderBy: { createdAt: 'asc' }
    });

    if (recentCreations.length >= DAILY_LIMIT) {
      const oldestCreation = recentCreations[0];
      const resetsAt = new Date(oldestCreation.createdAt.getTime() + 24 * 60 * 60 * 1000);

      return reply.status(429).send({
        error: 'Daily goal creation limit reached',
        code: 'DAILY_LIMIT_REACHED',
        message: `You can create ${DAILY_LIMIT} goals per day. Try again later.`,
        limit: DAILY_LIMIT,
        remaining: 0,
        resetsAt: resetsAt.toISOString()
      });
    }

    try {
      console.log('Route: Creating goal with plan...');
      const result = await createGoalWithPlan(req.profileId, input);
      console.log('Route: Goal created, fetching full data...');

      const goal = await prisma.goal.findUnique({
        where: { id: result.goalId },
        include: {
          tasks: {
            orderBy: [{ weekNumber: 'asc' }, { scheduledDate: 'asc' }],
          },
        },
      });
      console.log(`Route: Sending response (goal: ${goal?.id}, tasks: ${goal?.tasks?.length})...`);

      // Log successful goal creation for rate limiting
      await prisma.usageLog.create({
        data: {
          profileId: req.profileId,
          action: 'goal_create'
        }
      });

      // Return simplified response (tasks are already in goal.tasks)
      const response = {
        goal,
        calendarSynced: result.calendarSynced,
        message: result.calendarSynced
          ? 'Goal created and synced to Google Calendar'
          : 'Goal created (Google Calendar not connected)',
      };

      console.log(`Route: Response size: ${JSON.stringify(response).length} bytes`);
      return response;
    } catch (error: any) {
      const errorMessage = error.message || 'Unknown error';
      const isRateLimited = error.status === 429 ||
                           errorMessage.toLowerCase().includes('rate') ||
                           errorMessage.toLowerCase().includes('quota') ||
                           errorMessage.toLowerCase().includes('resource exhausted');

      console.error('Failed to create goal:', errorMessage);

      // If rate limited, queue for later processing
      if (isRateLimited) {
        console.log('Route: Rate limited, queueing goal creation for later...');
        const pendingId = await queueGoalCreation(req.profileId, input);

        return reply.status(202).send({
          pending: true,
          pendingId,
          message: 'Our servers are busy. Your goal is being processed and will be ready in a few minutes.',
          code: 'QUEUED',
        });
      }

      return reply.status(500).send({
        error: errorMessage,
      });
    }
  });

  // Check pending goal status
  fastify.get<{ Params: { pendingId: string } }>('/pending/:pendingId', async (request, reply) => {
    const req = request as AuthenticatedRequest;
    const { pendingId } = request.params;

    const status = await getPendingGoalStatus(pendingId);

    if (status.status === 'not_found') {
      return reply.status(404).send({ error: 'Pending goal not found' });
    }

    // If completed, return the full goal
    if (status.status === 'completed' && status.goalId) {
      const goal = await prisma.goal.findFirst({
        where: {
          id: status.goalId,
          profileId: req.profileId,
        },
        include: {
          tasks: {
            orderBy: [{ weekNumber: 'asc' }, { scheduledDate: 'asc' }],
          },
        },
      });

      if (goal) {
        return {
          status: 'completed',
          goal,
        };
      }
    }

    return {
      status: status.status,
      error: status.error,
    };
  });

  // Update goal
  fastify.patch<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const req = request as AuthenticatedRequest;
    const { id } = request.params;
    const parseResult = UpdateGoalSchema.safeParse(request.body);

    if (!parseResult.success) {
      return reply.status(400).send({ error: parseResult.error.errors });
    }

    const goal = await prisma.goal.findFirst({
      where: {
        id,
        profileId: req.profileId,
      },
    });

    if (!goal) {
      return reply.status(404).send({ error: 'Goal not found' });
    }

    const updatedGoal = await prisma.goal.update({
      where: { id: goal.id },
      data: {
        ...parseResult.data,
        targetDate: parseResult.data.targetDate
          ? new Date(parseResult.data.targetDate)
          : undefined,
      },
    });

    return { goal: updatedGoal };
  });

  // Delete goal
  fastify.delete<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const req = request as AuthenticatedRequest;
    const { id } = request.params;

    const goal = await prisma.goal.findFirst({
      where: {
        id,
        profileId: req.profileId,
      },
    });

    if (!goal) {
      return reply.status(404).send({ error: 'Goal not found' });
    }

    // Delete Google Calendar if exists
    if (goal.calendarId) {
      try {
        await deleteGoalCalendar(req.profileId, goal.calendarId);
      } catch (error) {
        console.warn('Failed to delete Google Calendar:', error);
      }
    }

    // Delete from database (cascade will delete tasks and check-ins)
    await prisma.goal.delete({
      where: { id: goal.id },
    });

    return { success: true };
  });

  // Sync goal tasks to Google Calendar
  fastify.post<{ Params: { id: string }; Querystring: { force?: string } }>(
    '/:id/sync-calendar',
    async (request, reply) => {
      const req = request as AuthenticatedRequest;
      const { id } = request.params;
      const forceResync = request.query.force === 'true';

      // If force re-sync, clear all existing googleEventIds first
      if (forceResync) {
        console.log('Calendar sync: Force re-sync - clearing existing event IDs');
        await prisma.task.updateMany({
          where: { goal: { id, profileId: req.profileId } },
          data: { googleEventId: null },
        });
      }

      // Get goal with tasks
      const goal = await prisma.goal.findFirst({
        where: {
          id,
          profileId: req.profileId,
        },
        include: {
          tasks: {
            where: {
              googleEventId: null, // Only sync tasks not already synced
              status: { in: ['pending', 'in_progress'] },
            },
            orderBy: { scheduledDate: 'asc' },
          },
        },
      });

      if (!goal) {
        return reply.status(404).send({ error: 'Goal not found' });
      }

      // Check if user has Google Calendar connected
      const profile = await prisma.profile.findUnique({
        where: { id: req.profileId },
      });

      if (!profile?.googleRefreshToken) {
        console.log('Calendar sync failed: No googleRefreshToken for profile', req.profileId);
        return reply.status(400).send({
          error: 'Google Calendar not connected',
          code: 'CALENDAR_AUTH_REQUIRED',
        });
      }
      console.log('Calendar sync: Found googleRefreshToken, proceeding...');

      try {
        // Create calendar for goal if it doesn't exist
        let calendarId = goal.calendarId;
        if (!calendarId) {
          calendarId = await createGoalCalendar(req.profileId, goal.title);
          await prisma.goal.update({
            where: { id: goal.id },
            data: { calendarId },
          });
        }

        // Sync tasks to calendar
        const tasksToSync = goal.tasks.map((task) => ({
          id: task.id,
          title: task.title,
          description: task.description || undefined,
          scheduledDate: task.scheduledDate,
          scheduledTime: task.scheduledTime,
          durationMinutes: task.durationMinutes,
        }));

        console.log(`Calendar sync: Found ${tasksToSync.length} tasks to sync`);

        if (tasksToSync.length === 0) {
          // Debug: check why no tasks
          const allTasks = await prisma.task.findMany({
            where: { goalId: goal.id },
            select: { id: true, status: true, googleEventId: true },
          });
          console.log(`Calendar sync: Goal has ${allTasks.length} total tasks`);
          console.log(`  - With googleEventId: ${allTasks.filter(t => t.googleEventId).length}`);
          console.log(`  - Status breakdown:`, allTasks.reduce((acc, t) => {
            acc[t.status] = (acc[t.status] || 0) + 1;
            return acc;
          }, {} as Record<string, number>));

          return {
            success: true,
            synced: 0,
            created: 0,
            updated: 0,
            message: 'No new tasks to sync',
          };
        }

        const eventIdMap = await syncTasksToCalendar(
          req.profileId,
          calendarId,
          tasksToSync,
          profile.timezone || 'America/New_York'
        );

        // Update tasks with Google Event IDs
        for (const [taskId, eventId] of eventIdMap) {
          await prisma.task.update({
            where: { id: taskId },
            data: { googleEventId: eventId },
          });
        }

        return {
          success: true,
          synced: eventIdMap.size,
          created: eventIdMap.size,
          updated: 0,
        };
      } catch (error) {
        console.error('Calendar sync error:', error);
        return reply.status(500).send({
          error: error instanceof Error ? error.message : 'Failed to sync calendar',
        });
      }
    }
  );

  // Get tasks for a specific week
  fastify.get<{ Params: { id: string; weekNumber: string } }>(
    '/:id/weeks/:weekNumber',
    async (request, reply) => {
      const req = request as AuthenticatedRequest;
      const { id, weekNumber: weekNumberStr } = request.params;
      const weekNumber = parseInt(weekNumberStr, 10);

      if (isNaN(weekNumber) || weekNumber < 1) {
        return reply.status(400).send({ error: 'Invalid week number' });
      }

      const goal = await prisma.goal.findFirst({
        where: {
          id,
          profileId: req.profileId,
        },
      });

      if (!goal) {
        return reply.status(404).send({ error: 'Goal not found' });
      }

      const tasks = await prisma.task.findMany({
        where: {
          goalId: goal.id,
          weekNumber,
        },
        orderBy: [{ scheduledDate: 'asc' }, { scheduledTime: 'asc' }],
      });

      return { weekNumber, tasks };
    }
  );
}
