import crypto from 'crypto';

/**
 * Secure OAuth state management
 *
 * Prevents CSRF attacks by using unpredictable, single-use, time-limited tokens
 * instead of exposing profileId directly in the OAuth state parameter.
 *
 * For multi-instance deployments, replace this with Redis or database storage.
 */

interface StateEntry {
  profileId: string;
  expiresAt: number;
}

// In-memory store (use Redis/DB for multi-instance deployments)
const stateStore = new Map<string, StateEntry>();

// TTL: 10 minutes
const STATE_TTL_MS = 10 * 60 * 1000;

// Cleanup interval: every 5 minutes
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;

/**
 * Generate a secure random state token and store the profileId mapping
 */
export function createOAuthState(profileId: string): string {
  const state = crypto.randomBytes(32).toString('hex');

  stateStore.set(state, {
    profileId,
    expiresAt: Date.now() + STATE_TTL_MS,
  });

  return state;
}

/**
 * Validate state and retrieve the associated profileId
 * Returns null if state is invalid, expired, or already used
 *
 * State is deleted after retrieval (single-use)
 */
export function validateAndConsumeState(state: string): string | null {
  const entry = stateStore.get(state);

  if (!entry) {
    return null;
  }

  // Delete immediately (single-use)
  stateStore.delete(state);

  // Check expiration
  if (Date.now() > entry.expiresAt) {
    return null;
  }

  return entry.profileId;
}

/**
 * Clean up expired states (called periodically)
 */
function cleanupExpiredStates(): void {
  const now = Date.now();
  let cleaned = 0;

  for (const [state, entry] of stateStore.entries()) {
    if (now > entry.expiresAt) {
      stateStore.delete(state);
      cleaned++;
    }
  }

  if (cleaned > 0) {
    console.log(`OAuth state cleanup: removed ${cleaned} expired states`);
  }
}

// Start cleanup interval
setInterval(cleanupExpiredStates, CLEANUP_INTERVAL_MS);
