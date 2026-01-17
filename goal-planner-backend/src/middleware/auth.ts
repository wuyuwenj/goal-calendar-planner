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
  subscriptionStatus: {
    tier: 'free' | 'premium' | 'expired';
    isExpired: boolean;
  };
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

  // Get or create profile (using upsert to avoid race conditions)
  const now = new Date();

  const profile = await prisma.profile.upsert({
    where: { supabaseUserId: user.id },
    update: {}, // No updates needed if profile exists
    create: {
      supabaseUserId: user.id,
      email: user.email!,
      // Start as free tier - App Store handles free trial when user subscribes
      subscriptionTier: 'free',
      subscriptionExpiresAt: null,
    },
  });

  // Check subscription status
  const tier = profile.subscriptionTier || 'free';

  // Free tier = always blocked
  // Premium tier = check expiration date
  const isExpired = tier === 'free' ||
                    (tier === 'premium' &&
                     !!profile.subscriptionExpiresAt &&
                     profile.subscriptionExpiresAt < now);

  (request as AuthenticatedRequest).user = {
    id: user.id,
    email: user.email!,
  };
  (request as AuthenticatedRequest).profileId = profile.id;
  (request as AuthenticatedRequest).subscriptionStatus = {
    tier: isExpired ? 'expired' : tier,
    isExpired,
  };
}

// Middleware to block expired subscriptions
// Use this on routes that require active subscription
export async function requireActiveSubscription(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const req = request as AuthenticatedRequest;

  if (req.subscriptionStatus?.isExpired) {
    return reply.status(403).send({
      error: 'Subscription expired',
      code: 'SUBSCRIPTION_EXPIRED',
      message: 'Your subscription has expired. Subscribe to continue.',
      tier: 'expired'
    });
  }
}
