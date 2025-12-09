import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';
import { UpdateProfileSchema } from '../types';

export async function profileRoutes(fastify: FastifyInstance) {
  // Apply auth to all routes
  fastify.addHook('preHandler', authMiddleware);

  // Get current user profile
  fastify.get('/', async (request) => {
    const req = request as AuthenticatedRequest;

    const profile = await prisma.profile.findUnique({
      where: { id: req.profileId },
      include: {
        availability: true,
        goals: {
          where: { status: 'active' },
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
    });

    if (!profile) {
      return { error: 'Profile not found' };
    }

    return {
      id: profile.id,
      email: profile.email,
      timezone: profile.timezone,
      checkInDay: profile.checkInDay,
      googleConnected: !!profile.googleRefreshToken,
      availability: profile.availability,
      activeGoals: profile.goals.length,
      createdAt: profile.createdAt,
    };
  });

  // Update profile settings
  fastify.patch('/', async (request, reply) => {
    const req = request as AuthenticatedRequest;
    const parseResult = UpdateProfileSchema.safeParse(request.body);

    if (!parseResult.success) {
      return reply.status(400).send({ error: parseResult.error.errors });
    }

    const updatedProfile = await prisma.profile.update({
      where: { id: req.profileId },
      data: parseResult.data,
    });

    return {
      id: updatedProfile.id,
      email: updatedProfile.email,
      timezone: updatedProfile.timezone,
      checkInDay: updatedProfile.checkInDay,
      googleConnected: !!updatedProfile.googleRefreshToken,
    };
  });

  // Update availability
  fastify.put('/availability', async (request, reply) => {
    const req = request as AuthenticatedRequest;
    const { availability } = request.body as {
      availability: Array<{
        dayOfWeek: number;
        startTime: string;
        endTime: string;
      }>;
    };

    if (!availability || !Array.isArray(availability)) {
      return reply.status(400).send({ error: 'Invalid availability data' });
    }

    // Delete existing availability
    await prisma.availability.deleteMany({
      where: { profileId: req.profileId },
    });

    // Create new availability
    await prisma.availability.createMany({
      data: availability.map((a) => ({
        profileId: req.profileId,
        dayOfWeek: a.dayOfWeek,
        startTime: a.startTime,
        endTime: a.endTime,
      })),
    });

    const updated = await prisma.availability.findMany({
      where: { profileId: req.profileId },
    });

    return { availability: updated };
  });

  // Delete account
  fastify.delete('/', async (request) => {
    const req = request as AuthenticatedRequest;

    // This will cascade delete goals, tasks, check-ins, and availability
    await prisma.profile.delete({
      where: { id: req.profileId },
    });

    return { success: true, message: 'Account deleted' };
  });
}
