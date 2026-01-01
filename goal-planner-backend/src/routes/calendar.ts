import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma';
import { authMiddleware, requireActiveSubscription, AuthenticatedRequest } from '../middleware/auth';
import { getAuthUrl, getTokensFromCode } from '../lib/google';
import { verifyCalendarConnection } from '../services/calendar';

export async function calendarRoutes(fastify: FastifyInstance) {
  // Get Google OAuth URL (authenticated + requires active subscription)
  fastify.get('/connect', { preHandler: [authMiddleware, requireActiveSubscription] }, async (request) => {
    const req = request as AuthenticatedRequest;
    const baseUrl = getAuthUrl();

    // Store profile ID in state for callback
    const url = new URL(baseUrl);
    url.searchParams.set('state', req.profileId);

    return { url: url.toString() };
  });

  // OAuth callback (not authenticated - Google redirects here)
  fastify.get<{
    Querystring: { code?: string; state?: string; error?: string };
  }>('/callback', async (request, reply) => {
    const { code, state: profileId, error } = request.query;

    if (error) {
      console.error('Google OAuth error:', error);
      const scheme = process.env.APP_SCHEME || 'trellis';
      return reply.redirect(`${scheme}://calendar-error?error=` + encodeURIComponent(error));
    }

    if (!code || !profileId) {
      return reply.status(400).send({ error: 'Missing code or state' });
    }

    try {
      const tokens = await getTokensFromCode(code);

      if (!tokens.refresh_token) {
        console.warn('No refresh token received - user may need to re-consent');
      }

      await prisma.profile.update({
        where: { id: profileId },
        data: { googleRefreshToken: tokens.refresh_token },
      });

      // Redirect to app success page
      const scheme = process.env.APP_SCHEME || 'trellis';
      return reply.redirect(`${scheme}://calendar-connected`);
    } catch (err) {
      console.error('Google OAuth token exchange error:', err);
      const scheme = process.env.APP_SCHEME || 'trellis';
      return reply.redirect(`${scheme}://calendar-error`);
    }
  });

  // Check connection status
  fastify.get('/status', { preHandler: authMiddleware }, async (request) => {
    const req = request as AuthenticatedRequest;

    const profile = await prisma.profile.findUnique({
      where: { id: req.profileId },
    });

    const hasToken = !!profile?.googleRefreshToken;

    // If we have a token, verify it's still valid
    let isValid = false;
    if (hasToken) {
      isValid = await verifyCalendarConnection(req.profileId);
    }

    return {
      connected: hasToken && isValid,
      hasToken,
      tokenValid: isValid,
    };
  });

  // Store Google refresh token from mobile OAuth
  fastify.post<{
    Body: { refreshToken: string };
  }>('/store-token', { preHandler: [authMiddleware, requireActiveSubscription] }, async (request, reply) => {
    const req = request as AuthenticatedRequest;
    const { refreshToken } = request.body;

    if (!refreshToken) {
      return reply.status(400).send({ error: 'Missing refreshToken' });
    }

    await prisma.profile.update({
      where: { id: req.profileId },
      data: { googleRefreshToken: refreshToken },
    });

    console.log(`Calendar: Stored Google refresh token for profile ${req.profileId}`);

    return { success: true, message: 'Google Calendar connected' };
  });

  // Disconnect Google Calendar
  fastify.post('/disconnect', { preHandler: authMiddleware }, async (request) => {
    const req = request as AuthenticatedRequest;

    await prisma.profile.update({
      where: { id: req.profileId },
      data: { googleRefreshToken: null },
    });

    return { success: true, message: 'Google Calendar disconnected' };
  });

  // Refresh connection (get new auth URL if needed)
  fastify.post('/refresh', { preHandler: [authMiddleware, requireActiveSubscription] }, async (request) => {
    const req = request as AuthenticatedRequest;

    const isConnected = await verifyCalendarConnection(req.profileId);

    if (isConnected) {
      return { needsReauth: false, message: 'Connection is still valid' };
    }

    // Clear the invalid token
    await prisma.profile.update({
      where: { id: req.profileId },
      data: { googleRefreshToken: null },
    });

    // Generate new auth URL
    const baseUrl = getAuthUrl();
    const url = new URL(baseUrl);
    url.searchParams.set('state', req.profileId);

    return {
      needsReauth: true,
      url: url.toString(),
      message: 'Please reconnect your Google Calendar',
    };
  });
}
