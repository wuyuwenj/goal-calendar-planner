import { prisma } from '../lib/prisma';
import { createGoalWithPlan } from './planner';
import { CreateGoalInput } from '../types';

const MAX_RETRIES = 3;
const PROCESS_INTERVAL_MS = 60000; // Check every minute
const RETRY_DELAY_MS = 120000; // Wait 2 minutes between retries

let isProcessing = false;

/**
 * Queue a goal creation request for later processing
 */
export async function queueGoalCreation(
  profileId: string,
  input: CreateGoalInput
): Promise<string> {
  const pendingGoal = await prisma.pendingGoal.create({
    data: {
      profileId,
      requestData: JSON.stringify(input),
      status: 'pending',
    },
  });

  console.log(`JobQueue: Queued goal creation for profile ${profileId}, pendingId: ${pendingGoal.id}`);
  return pendingGoal.id;
}

/**
 * Check status of a pending goal
 */
export async function getPendingGoalStatus(pendingId: string): Promise<{
  status: string;
  goalId?: string;
  error?: string;
}> {
  const pending = await prisma.pendingGoal.findUnique({
    where: { id: pendingId },
  });

  if (!pending) {
    return { status: 'not_found' };
  }

  return {
    status: pending.status,
    goalId: pending.goalId || undefined,
    error: pending.error || undefined,
  };
}

/**
 * Process a single pending goal
 */
async function processPendingGoal(pendingId: string): Promise<boolean> {
  const pending = await prisma.pendingGoal.findUnique({
    where: { id: pendingId },
  });

  if (!pending || pending.status === 'completed') {
    return true;
  }

  // Mark as processing
  await prisma.pendingGoal.update({
    where: { id: pendingId },
    data: { status: 'processing' },
  });

  try {
    const input: CreateGoalInput = JSON.parse(pending.requestData);
    console.log(`JobQueue: Processing pending goal ${pendingId} for profile ${pending.profileId}`);

    const result = await createGoalWithPlan(pending.profileId, input);

    // Mark as completed
    await prisma.pendingGoal.update({
      where: { id: pendingId },
      data: {
        status: 'completed',
        goalId: result.goalId,
      },
    });

    console.log(`JobQueue: Successfully created goal ${result.goalId} from pending ${pendingId}`);
    return true;
  } catch (error: any) {
    const errorMessage = error.message || 'Unknown error';
    const isRateLimited = error.status === 429 || errorMessage.includes('rate') || errorMessage.includes('quota');

    console.error(`JobQueue: Failed to process pending goal ${pendingId}:`, errorMessage);

    // Update retry count and status
    const newRetryCount = pending.retryCount + 1;

    if (newRetryCount >= MAX_RETRIES && !isRateLimited) {
      // Max retries reached for non-rate-limit errors
      await prisma.pendingGoal.update({
        where: { id: pendingId },
        data: {
          status: 'failed',
          error: errorMessage,
          retryCount: newRetryCount,
        },
      });
      console.log(`JobQueue: Pending goal ${pendingId} failed after ${MAX_RETRIES} retries`);
    } else {
      // Put back in queue for retry
      await prisma.pendingGoal.update({
        where: { id: pendingId },
        data: {
          status: 'pending',
          error: errorMessage,
          retryCount: newRetryCount,
        },
      });
      console.log(`JobQueue: Pending goal ${pendingId} will be retried (attempt ${newRetryCount})`);
    }

    return false;
  }
}

/**
 * Process all pending goals in the queue
 */
async function processQueue(): Promise<void> {
  if (isProcessing) {
    console.log('JobQueue: Already processing, skipping...');
    return;
  }

  isProcessing = true;

  try {
    // Get pending goals that haven't been retried recently
    const pendingGoals = await prisma.pendingGoal.findMany({
      where: {
        status: 'pending',
        updatedAt: {
          lt: new Date(Date.now() - RETRY_DELAY_MS),
        },
      },
      orderBy: { createdAt: 'asc' },
      take: 5, // Process up to 5 at a time
    });

    if (pendingGoals.length === 0) {
      return;
    }

    console.log(`JobQueue: Processing ${pendingGoals.length} pending goals...`);

    for (const pending of pendingGoals) {
      await processPendingGoal(pending.id);
      // Add small delay between processing to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  } catch (error) {
    console.error('JobQueue: Error processing queue:', error);
  } finally {
    isProcessing = false;
  }
}

/**
 * Start the background job processor
 */
export function startJobProcessor(): void {
  console.log('JobQueue: Starting background job processor...');

  // Process queue immediately on start
  processQueue();

  // Then process periodically
  setInterval(() => {
    processQueue();
  }, PROCESS_INTERVAL_MS);
}

/**
 * Clean up old completed/failed pending goals (older than 7 days)
 */
export async function cleanupOldPendingGoals(): Promise<number> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const result = await prisma.pendingGoal.deleteMany({
    where: {
      status: { in: ['completed', 'failed'] },
      createdAt: { lt: sevenDaysAgo },
    },
  });

  if (result.count > 0) {
    console.log(`JobQueue: Cleaned up ${result.count} old pending goals`);
  }

  return result.count;
}
