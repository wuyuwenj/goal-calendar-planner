/**
 * Tests for trial subscription functionality
 * Verifies trial period calculation and detection
 */

import { describe, it, expect } from 'vitest';
import {
  computeSubscriptionStatus,
  calculateTrialEndDate,
  isTrialSubscription,
  ProfileSubscriptionData,
} from '../../utils/subscription';

describe('Trial Subscription', () => {
  describe('calculateTrialEndDate', () => {
    it('should return date 7 days in the future', () => {
      const now = new Date('2026-01-15T12:00:00Z');
      const trialEnd = calculateTrialEndDate(now);

      expect(trialEnd.toISOString()).toBe('2026-01-22T12:00:00.000Z');
    });

    it('should handle month boundaries', () => {
      const now = new Date('2026-01-29T12:00:00Z');
      const trialEnd = calculateTrialEndDate(now);

      expect(trialEnd.toISOString()).toBe('2026-02-05T12:00:00.000Z');
    });

    it('should handle year boundaries', () => {
      const now = new Date('2025-12-28T12:00:00Z');
      const trialEnd = calculateTrialEndDate(now);

      expect(trialEnd.toISOString()).toBe('2026-01-04T12:00:00.000Z');
    });

    it('should handle leap year', () => {
      const now = new Date('2024-02-25T12:00:00Z'); // 2024 is leap year
      const trialEnd = calculateTrialEndDate(now);

      expect(trialEnd.toISOString()).toBe('2024-03-03T12:00:00.000Z');
    });
  });

  describe('isTrialSubscription', () => {
    it('should return true for premium tier with no product ID', () => {
      const profile: ProfileSubscriptionData = {
        subscriptionTier: 'premium',
        subscriptionExpiresAt: new Date('2026-01-22'),
        subscriptionProductId: null,
      };

      expect(isTrialSubscription(profile)).toBe(true);
    });

    it('should return false for premium tier with product ID', () => {
      const profile: ProfileSubscriptionData = {
        subscriptionTier: 'premium',
        subscriptionExpiresAt: new Date('2026-12-15'),
        subscriptionProductId: 'com.trellis.yearly',
      };

      expect(isTrialSubscription(profile)).toBe(false);
    });

    it('should return false for free tier', () => {
      const profile: ProfileSubscriptionData = {
        subscriptionTier: 'free',
        subscriptionExpiresAt: null,
        subscriptionProductId: null,
      };

      expect(isTrialSubscription(profile)).toBe(false);
    });

    it('should return false for null tier', () => {
      const profile: ProfileSubscriptionData = {
        subscriptionTier: null,
        subscriptionExpiresAt: null,
        subscriptionProductId: null,
      };

      expect(isTrialSubscription(profile)).toBe(false);
    });
  });

  describe('Trial Status Computation', () => {
    it('should give active premium status during trial period', () => {
      const now = new Date('2026-01-15T12:00:00Z');
      const trialEnd = new Date('2026-01-22T12:00:00Z');

      const profile: ProfileSubscriptionData = {
        subscriptionTier: 'premium',
        subscriptionExpiresAt: trialEnd,
        subscriptionProductId: null,
      };

      const status = computeSubscriptionStatus(profile, now);

      expect(status.tier).toBe('premium');
      expect(status.isExpired).toBe(false);
      expect(status.isActive).toBe(true);
      expect(status.isPremium).toBe(true);
    });

    it('should return expired for expired trial', () => {
      const now = new Date('2026-01-15T12:00:00Z');
      const trialEnd = new Date('2026-01-08T12:00:00Z'); // 7 days ago

      const profile: ProfileSubscriptionData = {
        subscriptionTier: 'premium',
        subscriptionExpiresAt: trialEnd,
        subscriptionProductId: null,
      };

      const status = computeSubscriptionStatus(profile, now);

      expect(status.tier).toBe('expired');
      expect(status.isExpired).toBe(true);
      expect(status.isActive).toBe(false);
    });
  });
});
