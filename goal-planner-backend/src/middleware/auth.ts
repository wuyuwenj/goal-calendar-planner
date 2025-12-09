import { FastifyRequest, FastifyReply } from 'fastify';
import { createClient } from '@supabase/supabase-js';
import { prisma } from '../lib/prisma';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export interface AuthenticatedRequest extends FastifyRequest {
  user: {
    id: string;
    email: string;
  };
  profileId: string;
}

export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const authHeader = request.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return reply.status(401).send({ error: 'Missing authorization header' });
  }

  const token = authHeader.replace('Bearer ', '');

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) {
    return reply.status(401).send({ error: 'Invalid token' });
  }

  // Get or create profile
  let profile = await prisma.profile.findUnique({
    where: { supabaseUserId: user.id },
  });

  if (!profile) {
    profile = await prisma.profile.create({
      data: {
        supabaseUserId: user.id,
        email: user.email!,
      },
    });
  }

  (request as AuthenticatedRequest).user = {
    id: user.id,
    email: user.email!,
  };
  (request as AuthenticatedRequest).profileId = profile.id;
}
