import { FastifyInstance } from 'fastify';
import { Webhook } from 'svix';
import { prisma } from '../lib/prisma';

interface SuperwallEvent {
  type: string;
  data: {
    // User identification
    userId?: string;           // Your app's user ID (set via Superwall.identify)
    aliasId?: string;          // Superwall's internal ID

    // Product info
    productId?: string;        // e.g., "com.trellis.yearly"

    // Subscription details
    periodType?: 'TRIAL' | 'INTRO' | 'NORMAL';
    expiresAt?: string;        // ISO date string

    // Event-specific
    price?: number;            // Negative for refunds
    cancelReason?: string;
    expirationReason?: string;
    isTrialConversion?: boolean;
  };
}

export async function webhookRoutes(fastify: FastifyInstance) {
  // Add custom content type parser to capture raw body for signature verification
  fastify.addContentTypeParser(
    'application/json',
    { parseAs: 'string' },
    (req, body, done) => {
      try {
        // Store raw body for signature verification
        (req as any).rawBody = body;
        const json = JSON.parse(body as string);
        done(null, json);
      } catch (err: any) {
        done(err, undefined);
      }
    }
  );

  // Superwall webhook endpoint
  fastify.post('/superwall', async (request, reply) => {
    const secret = process.env.SUPERWALL_WEBHOOK_SECRET;

    // Verify webhook signature if secret is configured
    if (secret) {
      const svixId = request.headers['svix-id'] as string;
      const svixTimestamp = request.headers['svix-timestamp'] as string;
      const svixSignature = request.headers['svix-signature'] as string;

      if (!svixId || !svixTimestamp || !svixSignature) {
        console.warn('Webhook: Missing Svix headers');
        return reply.status(400).send({ error: 'Missing webhook signature headers' });
      }

      try {
        const wh = new Webhook(secret);
        const rawBody = (request.raw as any).rawBody || (request as any).rawBody || JSON.stringify(request.body);
        wh.verify(rawBody, {
          'svix-id': svixId,
          'svix-timestamp': svixTimestamp,
          'svix-signature': svixSignature,
        });
      } catch (err) {
        console.error('Webhook: Signature verification failed', err);
        return reply.status(400).send({ error: 'Invalid webhook signature' });
      }
    }

    const event = request.body as SuperwallEvent;
    console.log(`Webhook: Received ${event.type} event`, JSON.stringify(event.data, null, 2));

    // Get user ID from event
    const userId = event.data.userId;
    if (!userId) {
      console.warn('Webhook: No userId in event, skipping');
      return { received: true, skipped: true, reason: 'no_user_id' };
    }

    // Find profile by supabaseUserId (that's what we set in Superwall.identify)
    const profile = await prisma.profile.findUnique({
      where: { supabaseUserId: userId },
    });

    if (!profile) {
      console.warn(`Webhook: Profile not found for userId ${userId}`);
      return { received: true, skipped: true, reason: 'profile_not_found' };
    }

    try {
      switch (event.type) {
        // Initial purchase or renewal - extend subscription
        case 'initial_purchase':
        case 'renewal':
        case 'trial_conversion': {
          const expiresAt = event.data.expiresAt ? new Date(event.data.expiresAt) : null;

          await prisma.profile.update({
            where: { id: profile.id },
            data: {
              subscriptionTier: 'premium',
              subscriptionProductId: event.data.productId || null,
              subscriptionExpiresAt: expiresAt,
            },
          });

          console.log(`Webhook: Updated subscription for ${profile.id} - premium, expires: ${expiresAt}`);
          break;
        }

        // Cancellation - subscription will expire at expiresAt
        // No action needed, middleware will block after expiration
        case 'cancellation': {
          console.log(`Webhook: User ${profile.id} cancelled subscription. Reason: ${event.data.cancelReason}`);
          break;
        }

        // Expiration - subscription has ended
        case 'expiration': {
          console.log(`Webhook: Subscription expired for ${profile.id}. Reason: ${event.data.expirationReason}`);
          // Set to free tier
          await prisma.profile.update({
            where: { id: profile.id },
            data: {
              subscriptionTier: 'free',
            },
          });
          break;
        }

        // Billing issue - payment failed
        case 'billing_issue': {
          console.log(`Webhook: Billing issue for ${profile.id}`);
          break;
        }

        // Refund - revoke access immediately
        case 'refund': {
          const refundAmount = event.data.price ? Math.abs(event.data.price) : 0;
          console.log(`Webhook: Refund of ${refundAmount} for ${profile.id}`);

          await prisma.profile.update({
            where: { id: profile.id },
            data: {
              subscriptionTier: 'free',
              subscriptionExpiresAt: new Date(), // Expire now
            },
          });
          break;
        }

        // Uncancellation - user reactivated
        case 'uncancellation': {
          console.log(`Webhook: User ${profile.id} reactivated subscription`);
          break;
        }

        default:
          console.log(`Webhook: Unhandled event type: ${event.type}`);
      }

      return { received: true, processed: true };
    } catch (error) {
      console.error(`Webhook: Error processing ${event.type}:`, error);
      return reply.status(500).send({ error: 'Failed to process webhook' });
    }
  });
}
