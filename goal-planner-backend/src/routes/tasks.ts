import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma';
import { authMiddleware, requireActiveSubscription, AuthenticatedRequest } from '../middleware/auth';
import { UpdateTaskSchema } from '../types';
import { getUpcomingTasks, markOverdueTasks } from '../services/planner';

export async function taskRoutes(fastify: FastifyInstance) {
  // Apply auth to all routes
  fastify.addHook('preHandler', authMiddleware);
  // Block expired subscriptions
  fastify.addHook('preHandler', requireActiveSubscription);

  // Get all upcoming tasks across all goals
  fastify.get('/upcoming', async (request) => {
    const req = request as AuthenticatedRequest;
    const limit = parseInt((request.query as { limit?: string }).limit || '10', 10);

    const tasks = await getUpcomingTasks(req.profileId, Math.min(limit, 50));

    return { tasks };
  });

  // Get tasks for today
  fastify.get('/today', async (request) => {
    const req = request as AuthenticatedRequest;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const tasks = await prisma.task.findMany({
      where: {
        goal: {
          profileId: req.profileId,
          status: 'active',
        },
        scheduledDate: {
          gte: today,
          lt: tomorrow,
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
      orderBy: { scheduledTime: 'asc' },
    });

    return { tasks };
  });

  // Get a single task
  fastify.get<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const req = request as AuthenticatedRequest;
    const { id } = request.params;

    const task = await prisma.task.findFirst({
      where: {
        id,
        goal: {
          profileId: req.profileId,
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
    });

    if (!task) {
      return reply.status(404).send({ error: 'Task not found' });
    }

    return { task };
  });

  // Update task status
  fastify.patch<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const req = request as AuthenticatedRequest;
    const { id } = request.params;
    const parseResult = UpdateTaskSchema.safeParse(request.body);

    if (!parseResult.success) {
      return reply.status(400).send({ error: parseResult.error.errors });
    }

    const task = await prisma.task.findFirst({
      where: {
        id,
        goal: {
          profileId: req.profileId,
        },
      },
    });

    if (!task) {
      return reply.status(404).send({ error: 'Task not found' });
    }

    const updatedTask = await prisma.task.update({
      where: { id: task.id },
      data: { status: parseResult.data.status },
    });

    return { task: updatedTask };
  });

  // Mark task as completed (convenience endpoint)
  fastify.post<{ Params: { id: string } }>('/:id/complete', async (request, reply) => {
    const req = request as AuthenticatedRequest;
    const { id } = request.params;

    const task = await prisma.task.findFirst({
      where: {
        id,
        goal: {
          profileId: req.profileId,
        },
      },
    });

    if (!task) {
      return reply.status(404).send({ error: 'Task not found' });
    }

    const updatedTask = await prisma.task.update({
      where: { id: task.id },
      data: { status: 'completed' },
    });

    return { task: updatedTask };
  });

  // Mark task as skipped (convenience endpoint)
  fastify.post<{ Params: { id: string } }>('/:id/skip', async (request, reply) => {
    const req = request as AuthenticatedRequest;
    const { id } = request.params;

    const task = await prisma.task.findFirst({
      where: {
        id,
        goal: {
          profileId: req.profileId,
        },
      },
    });

    if (!task) {
      return reply.status(404).send({ error: 'Task not found' });
    }

    const updatedTask = await prisma.task.update({
      where: { id: task.id },
      data: { status: 'skipped' },
    });

    return { task: updatedTask };
  });

  // Mark overdue tasks as missed (admin/cron endpoint)
  fastify.post('/mark-overdue', async (request) => {
    const req = request as AuthenticatedRequest;

    const count = await markOverdueTasks(req.profileId);

    return { markedAsMissed: count };
  });
}
