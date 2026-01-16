/**
 * Subscription status computation utilities
 * Extracted for testability
 */

export type SubscriptionTier = 'free' | 'premium';
export type EffectiveTier = 'free' | 'premium' | 'expired';

export interface SubscriptionStatus {
  tier: EffectiveTier;
  isExpired: boolean;
  isActive: boolean;
  isPremium: boolean;
}

export interface ProfileSubscriptionData {
  subscriptionTier: SubscriptionTier | null;
  subscriptionExpiresAt: Date | null;
  subscriptionProductId: string | null;
}

/**
 * Compute effective subscription status based on tier and expiration date
 */
export function computeSubscriptionStatus(
  profile: ProfileSubscriptionData,
  now: Date = new Date()
): SubscriptionStatus {
  const tier = profile.subscriptionTier || 'free';

  // Free tier = always expired/blocked
  // Premium tier = check expiration date
  const isExpired =
    tier === 'free' ||
    (tier === 'premium' &&
      !!profile.subscriptionExpiresAt &&
      profile.subscriptionExpiresAt < now);

  const effectiveTier: EffectiveTier = isExpired ? 'expired' : tier;

  return {
    tier: effectiveTier,
    isExpired,
    isActive: !isExpired,
    isPremium: effectiveTier === 'premium',
  };
}

/**
 * Calculate trial end date (7 days from now)
 */
export function calculateTrialEndDate(from: Date = new Date()): Date {
  return new Date(from.getTime() + 7 * 24 * 60 * 60 * 1000);
}

/**
 * Check if a subscription is within the trial period
 */
export function isTrialSubscription(profile: ProfileSubscriptionData): boolean {
  // Trial = premium tier with no product ID (no purchase made)
  return (
    profile.subscriptionTier === 'premium' &&
    profile.subscriptionProductId === null
  );
}
