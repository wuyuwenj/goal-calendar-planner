/**
 * Tests for subscription edge cases
 * Verifies boundary conditions and unusual scenarios
 */

import { describe, it, expect } from 'vitest';
import {
  computeSubscriptionStatus,
  ProfileSubscriptionData,
} from '../../utils/subscription';

describe('Subscription Edge Cases', () => {
  describe('Time Boundaries', () => {
    it('should handle subscription expiring in 1 second', () => {
      const now = new Date('2026-01-15T12:00:00.000Z');
      const expiresIn1Second = new Date('2026-01-15T12:00:01.000Z');

      const profile: ProfileSubscriptionData = {
        subscriptionTier: 'premium',
        subscriptionExpiresAt: expiresIn1Second,
        subscriptionProductId: 'com.trellis.monthly',
      };

      const status = computeSubscriptionStatus(profile, now);

      expect(status.tier).toBe('premium');
      expect(status.isActive).toBe(true);
    });

    it('should handle subscription expired 1 second ago', () => {
      const now = new Date('2026-01-15T12:00:01.000Z');
      const expired1SecondAgo = new Date('2026-01-15T12:00:00.000Z');

      const profile: ProfileSubscriptionData = {
        subscriptionTier: 'premium',
        subscriptionExpiresAt: expired1SecondAgo,
        subscriptionProductId: 'com.trellis.monthly',
      };

      const status = computeSubscriptionStatus(profile, now);

      expect(status.tier).toBe('expired');
      expect(status.isActive).toBe(false);
    });

    it('should handle subscription expiring in 1 millisecond', () => {
      const now = new Date('2026-01-15T12:00:00.000Z');
      const expiresIn1Ms = new Date('2026-01-15T12:00:00.001Z');

      const profile: ProfileSubscriptionData = {
        subscriptionTier: 'premium',
        subscriptionExpiresAt: expiresIn1Ms,
        subscriptionProductId: 'com.trellis.monthly',
      };

      const status = computeSubscriptionStatus(profile, now);

      expect(status.tier).toBe('premium');
      expect(status.isActive).toBe(true);
    });
  });

  describe('Extreme Dates', () => {
    it('should handle very old expiration date', () => {
      const now = new Date('2026-01-15T12:00:00Z');
      const veryOld = new Date('2020-01-01T00:00:00Z');

      const profile: ProfileSubscriptionData = {
        subscriptionTier: 'premium',
        subscriptionExpiresAt: veryOld,
        subscriptionProductId: null,
      };

      const status = computeSubscriptionStatus(profile, now);

      expect(status.tier).toBe('expired');
      expect(status.isExpired).toBe(true);
    });

    it('should handle far future expiration date', () => {
      const now = new Date('2026-01-15T12:00:00Z');
      const farFuture = new Date('2099-12-31T23:59:59Z');

      const profile: ProfileSubscriptionData = {
        subscriptionTier: 'premium',
        subscriptionExpiresAt: farFuture,
        subscriptionProductId: 'com.trellis.yearly',
      };

      const status = computeSubscriptionStatus(profile, now);

      expect(status.tier).toBe('premium');
      expect(status.isActive).toBe(true);
    });

    it('should handle Unix epoch date', () => {
      const now = new Date('2026-01-15T12:00:00Z');
      const epoch = new Date('1970-01-01T00:00:00Z');

      const profile: ProfileSubscriptionData = {
        subscriptionTier: 'premium',
        subscriptionExpiresAt: epoch,
        subscriptionProductId: null,
      };

      const status = computeSubscriptionStatus(profile, now);

      expect(status.tier).toBe('expired');
      expect(status.isExpired).toBe(true);
    });
  });

  describe('Database State vs Runtime State', () => {
    it('should compute expired status even when DB tier is premium', () => {
      // This tests the exact scenario from production:
      // DB shows tier='premium' but subscription_expires_at is in the past
      const now = new Date('2026-01-15T12:00:00Z');

      const dbProfile: ProfileSubscriptionData = {
        subscriptionTier: 'premium', // DB still says premium
        subscriptionExpiresAt: new Date('2026-01-14T16:20:49.854Z'), // Expired yesterday
        subscriptionProductId: null,
      };

      const status = computeSubscriptionStatus(dbProfile, now);

      // Runtime should correctly identify as expired
      expect(status.tier).toBe('expired');
      expect(status.isExpired).toBe(true);
      expect(status.isActive).toBe(false);
    });

    it('should compute active status for future expiration', () => {
      const now = new Date('2026-01-15T12:00:00Z');

      const dbProfile: ProfileSubscriptionData = {
        subscriptionTier: 'premium',
        subscriptionExpiresAt: new Date('2026-01-20T11:43:26.91Z'), // 5 days from now
        subscriptionProductId: null,
      };

      const status = computeSubscriptionStatus(dbProfile, now);

      expect(status.tier).toBe('premium');
      expect(status.isExpired).toBe(false);
      expect(status.isActive).toBe(true);
    });
  });

  describe('Product ID Variations', () => {
    it('should handle monthly product ID', () => {
      const now = new Date('2026-01-15T12:00:00Z');

      const profile: ProfileSubscriptionData = {
        subscriptionTier: 'premium',
        subscriptionExpiresAt: new Date('2026-02-15T12:00:00Z'),
        subscriptionProductId: 'com.trellis.monthly',
      };

      const status = computeSubscriptionStatus(profile, now);

      expect(status.tier).toBe('premium');
      expect(status.isActive).toBe(true);
    });

    it('should handle yearly product ID', () => {
      const now = new Date('2026-01-15T12:00:00Z');

      const profile: ProfileSubscriptionData = {
        subscriptionTier: 'premium',
        subscriptionExpiresAt: new Date('2027-01-15T12:00:00Z'),
        subscriptionProductId: 'com.trellis.yearly',
      };

      const status = computeSubscriptionStatus(profile, now);

      expect(status.tier).toBe('premium');
      expect(status.isActive).toBe(true);
    });

    it('should handle empty string product ID as trial', () => {
      const profile: ProfileSubscriptionData = {
        subscriptionTier: 'premium',
        subscriptionExpiresAt: new Date('2026-01-22T12:00:00Z'),
        subscriptionProductId: null,
      };

      const status = computeSubscriptionStatus(profile);

      expect(status.tier).toBe('premium');
    });
  });
});
