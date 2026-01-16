/**
 * Tests for basic subscription status computation
 * Verifies the core logic of determining if a subscription is active/expired
 */

import { describe, it, expect } from 'vitest';
import {
  computeSubscriptionStatus,
  ProfileSubscriptionData,
} from '../../utils/subscription';

describe('Subscription Status Computation', () => {
  describe('Free Tier', () => {
    it('should return expired for free tier', () => {
      const profile: ProfileSubscriptionData = {
        subscriptionTier: 'free',
        subscriptionExpiresAt: null,
        subscriptionProductId: null,
      };

      const status = computeSubscriptionStatus(profile);

      expect(status.tier).toBe('expired');
      expect(status.isExpired).toBe(true);
      expect(status.isActive).toBe(false);
      expect(status.isPremium).toBe(false);
    });

    it('should return expired for null tier (defaults to free)', () => {
      const profile: ProfileSubscriptionData = {
        subscriptionTier: null,
        subscriptionExpiresAt: null,
        subscriptionProductId: null,
      };

      const status = computeSubscriptionStatus(profile);

      expect(status.tier).toBe('expired');
      expect(status.isExpired).toBe(true);
      expect(status.isActive).toBe(false);
    });
  });

  describe('Premium Tier - Active', () => {
    it('should return premium for active subscription', () => {
      const now = new Date('2026-01-15T12:00:00Z');
      const futureDate = new Date('2026-02-15T12:00:00Z');

      const profile: ProfileSubscriptionData = {
        subscriptionTier: 'premium',
        subscriptionExpiresAt: futureDate,
        subscriptionProductId: 'com.trellis.yearly',
      };

      const status = computeSubscriptionStatus(profile, now);

      expect(status.tier).toBe('premium');
      expect(status.isExpired).toBe(false);
      expect(status.isActive).toBe(true);
      expect(status.isPremium).toBe(true);
    });

    it('should return premium for subscription with null expiration (lifetime)', () => {
      const profile: ProfileSubscriptionData = {
        subscriptionTier: 'premium',
        subscriptionExpiresAt: null,
        subscriptionProductId: 'com.trellis.lifetime',
      };

      const status = computeSubscriptionStatus(profile);

      expect(status.tier).toBe('premium');
      expect(status.isExpired).toBe(false);
      expect(status.isActive).toBe(true);
      expect(status.isPremium).toBe(true);
    });
  });

  describe('Premium Tier - Expired', () => {
    it('should return expired for subscription with past expiration date', () => {
      const now = new Date('2026-01-15T12:00:00Z');
      const pastDate = new Date('2026-01-14T12:00:00Z');

      const profile: ProfileSubscriptionData = {
        subscriptionTier: 'premium',
        subscriptionExpiresAt: pastDate,
        subscriptionProductId: 'com.trellis.yearly',
      };

      const status = computeSubscriptionStatus(profile, now);

      expect(status.tier).toBe('expired');
      expect(status.isExpired).toBe(true);
      expect(status.isActive).toBe(false);
      expect(status.isPremium).toBe(false);
    });

    it('should NOT expire subscription at exact expiration time', () => {
      const now = new Date('2026-01-15T12:00:00Z');
      const exactlyNow = new Date('2026-01-15T12:00:00Z');

      const profile: ProfileSubscriptionData = {
        subscriptionTier: 'premium',
        subscriptionExpiresAt: exactlyNow,
        subscriptionProductId: 'com.trellis.monthly',
      };

      const status = computeSubscriptionStatus(profile, now);

      // < comparison means exactly equal is NOT expired
      expect(status.tier).toBe('premium');
      expect(status.isExpired).toBe(false);
    });
  });
});
