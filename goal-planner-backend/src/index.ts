import Fastify from 'fastify';
import cors from '@fastify/cors';
import { goalRoutes } from './routes/goals';
import { taskRoutes } from './routes/tasks';
import { checkinRoutes } from './routes/checkin';
import { calendarRoutes } from './routes/calendar';
import { profileRoutes } from './routes/profile';

// Load environment variables in development
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const fastify = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    transport:
      process.env.NODE_ENV !== 'production'
        ? {
            target: 'pino-pretty',
            options: {
              colorize: true,
            },
          }
        : undefined,
  },
});

async function main() {
  // Register CORS
  await fastify.register(cors, {
    origin: true,
    credentials: true,
  });

  // Register routes
  fastify.register(profileRoutes, { prefix: '/api/profile' });
  fastify.register(goalRoutes, { prefix: '/api/goals' });
  fastify.register(taskRoutes, { prefix: '/api/tasks' });
  fastify.register(checkinRoutes, { prefix: '/api/checkin' });
  fastify.register(calendarRoutes, { prefix: '/api/calendar' });

  // Health check endpoint
  fastify.get('/health', async () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  }));

  // Root endpoint
  fastify.get('/', async () => ({
    name: 'Trellis API',
    version: '1.0.0',
    endpoints: {
      profile: '/api/profile',
      goals: '/api/goals',
      tasks: '/api/tasks',
      checkin: '/api/checkin',
      calendar: '/api/calendar',
      health: '/health',
    },
  }));

  // Global error handler
  fastify.setErrorHandler((error, request, reply) => {
    fastify.log.error(error);

    const statusCode = error.statusCode || 500;
    const message =
      process.env.NODE_ENV === 'production' && statusCode === 500
        ? 'Internal Server Error'
        : error.message;

    reply.status(statusCode).send({
      error: message,
      statusCode,
    });
  });

  // Start server
  const port = Number(process.env.PORT) || 3000;
  const host = process.env.HOST || '0.0.0.0';

  try {
    await fastify.listen({ port, host });
    console.log(`🚀 Server running on http://${host}:${port}`);
    console.log(`📋 API Documentation: http://${host}:${port}/`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

// Handle graceful shutdown
const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];

signals.forEach((signal) => {
  process.on(signal, async () => {
    console.log(`\n${signal} received, shutting down gracefully...`);
    await fastify.close();
    process.exit(0);
  });
});

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
