import { create } from 'zustand';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from '../lib/api';

// Check if we're in Expo Go
const isExpoGo = Constants.appOwnership === 'expo';

// Storage key for subscription status
const SUBSCRIPTION_STATUS_KEY = '@subscription_status';

// Product IDs - Update these to match your App Store Connect products
export const PRODUCT_IDS = {
  YEARLY: 'com.trellis.yearly',
  MONTHLY: 'com.trellis.monthly',
};

export interface Product {
  productId: string;
  title: string;
  description: string;
  price: string;
  priceAmount: number;
  currency: string;
  localizedPrice: string;
  subscriptionPeriod?: string;
}

interface SubscriptionState {
  products: Product[];
  isLoading: boolean;
  isPurchasing: boolean;
  isSubscribed: boolean;
  error: string | null;
  selectedProductId: string | null;
  purchaseListenerCleanup: (() => void) | null;
  purchaseTimeoutId: ReturnType<typeof setTimeout> | null;
  initialize: () => Promise<void>;
  fetchProducts: () => Promise<void>;
  purchaseProduct: (productId: string) => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
  setSelectedProduct: (productId: string) => void;
  setIsSubscribed: (value: boolean) => Promise<void>;
  clearError: () => void;
  cleanup: () => void;
  clearPurchaseTimeout: () => void;
}

// For Expo Go, we use a mock store
// For development/production builds, this file should be replaced or react-native-iap will be used
export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  products: [
    {
      productId: PRODUCT_IDS.YEARLY,
      title: 'Yearly Subscription',
      description: 'Full access for a year',
      price: '$29.99',
      priceAmount: 29.99,
      currency: 'USD',
      localizedPrice: '$29.99',
      subscriptionPeriod: 'year',
    },
    {
      productId: PRODUCT_IDS.MONTHLY,
      title: 'Monthly Subscription',
      description: 'Full access monthly',
      price: '$4.99',
      priceAmount: 4.99,
      currency: 'USD',
      localizedPrice: '$4.99',
      subscriptionPeriod: 'month',
    },
  ],
  isLoading: false,
  isPurchasing: false,
  isSubscribed: false,
  error: null,
  selectedProductId: PRODUCT_IDS.YEARLY,
  purchaseListenerCleanup: null,
  purchaseTimeoutId: null,

  clearPurchaseTimeout: () => {
    const { purchaseTimeoutId } = get();
    if (purchaseTimeoutId) {
      clearTimeout(purchaseTimeoutId);
      set({ purchaseTimeoutId: null });
    }
  },

  initialize: async () => {
    set({ isLoading: true, error: null });

    // First, load cached subscription status from local storage
    try {
      const cachedStatus = await AsyncStorage.getItem(SUBSCRIPTION_STATUS_KEY);
      if (cachedStatus === 'true') {
        set({ isSubscribed: true });
        console.log('Loaded cached subscription status: subscribed');
      }
    } catch (e) {
      console.log('Failed to load cached subscription status');
    }

    if (isExpoGo) {
      console.log('[Expo Go] Mock IAP initialized - purchases will be simulated');
      set({ isLoading: false });
      return;
    }

    // In dev builds, dynamically import and use react-native-iap
    if (Platform.OS !== 'ios') {
      console.log('IAP only supported on iOS');
      set({ isLoading: false });
      return;
    }

    try {
      const RNIap = require('react-native-iap');
      await RNIap.initConnection();
      console.log('IAP connection initialized');

      await get().fetchProducts();

      const purchaseUpdateSubscription = RNIap.purchaseUpdatedListener(
        async (purchase: any) => {
          console.log('Purchase updated:', purchase);
          // Clear timeout on any purchase update
          get().clearPurchaseTimeout();
          if (purchase.transactionId) {
            try {
              await RNIap.finishTransaction({ purchase, isConsumable: false });
              // Persist subscription status locally
              await AsyncStorage.setItem(SUBSCRIPTION_STATUS_KEY, 'true');
              set({ isSubscribed: true, isPurchasing: false });
              console.log('Purchase completed successfully');

              // Notify backend immediately (backup to webhook)
              try {
                await apiClient.post('/api/profile/subscription', {
                  tier: 'premium',
                  productId: purchase.productId,
                  transactionId: purchase.transactionId,
                  // Subscription typically expires in 1 month or 1 year
                  expiresAt: purchase.expirationDate || null,
                });
                console.log('Backend notified of purchase');
              } catch (backendError) {
                // Non-critical - webhook will handle it
                console.warn('Failed to notify backend:', backendError);
              }
            } catch (error) {
              console.error('Error finishing transaction:', error);
            }
          }
        }
      );

      const purchaseErrorSubscription = RNIap.purchaseErrorListener(
        (error: any) => {
          console.error('Purchase error:', error);
          // Clear timeout on error
          get().clearPurchaseTimeout();
          set({
            error: error.message || 'Purchase failed',
            isPurchasing: false,
          });
        }
      );

      set({
        purchaseListenerCleanup: () => {
          purchaseUpdateSubscription.remove();
          purchaseErrorSubscription.remove();
        },
      });

      // Verify subscription status with Apple (source of truth)
      await get().restorePurchases();
    } catch (error: any) {
      console.error('IAP initialization error:', error);
      set({ error: error.message || 'Failed to initialize purchases' });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchProducts: async () => {
    if (isExpoGo) {
      console.log('[Expo Go] Mock fetchProducts');
      return;
    }

    try {
      const RNIap = require('react-native-iap');
      const productIds = Object.values(PRODUCT_IDS);
      const iapProducts = await RNIap.fetchProducts({
        skus: productIds,
        type: 'subs',
      });

      if (!iapProducts || iapProducts.length === 0) {
        console.log('No products found');
        set({ products: [] });
        return;
      }

      const products: Product[] = iapProducts.map((product: any) => ({
        productId: product.id,
        title: product.title || product.id,
        description: product.description || '',
        price: product.displayPrice || '0',
        priceAmount: product.price ?? 0,
        currency: product.currency || 'USD',
        localizedPrice: product.displayPrice || '0',
        subscriptionPeriod: product.subscriptionPeriodUnitIOS ?? undefined,
      }));

      set({ products });
      console.log('Products fetched:', products);
    } catch (error: any) {
      console.error('Error fetching products:', error);
      set({ error: error.message || 'Failed to load products' });
    }
  },

  purchaseProduct: async (productId: string) => {
    if (isExpoGo) {
      console.log('[Expo Go] Mock purchase:', productId);
      // Persist mock subscription status
      await AsyncStorage.setItem(SUBSCRIPTION_STATUS_KEY, 'true');
      set({ isSubscribed: true, isPurchasing: false });

      // Notify backend (for testing)
      try {
        const oneYearFromNow = new Date();
        oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
        await apiClient.post('/api/profile/subscription', {
          tier: 'premium',
          productId,
          expiresAt: oneYearFromNow.toISOString(),
        });
        console.log('[Expo Go] Backend notified of mock purchase');
      } catch (e) {
        console.warn('[Expo Go] Failed to notify backend:', e);
      }
      return true;
    }

    // Clear any existing timeout
    get().clearPurchaseTimeout();
    set({ isPurchasing: true, error: null });

    // Set a timeout to prevent infinite loading (60 seconds)
    const timeoutId = setTimeout(() => {
      const { isPurchasing } = get();
      if (isPurchasing) {
        console.warn('Purchase timeout - resetting state');
        set({
          isPurchasing: false,
          error: 'Purchase timed out. Please try again.',
          purchaseTimeoutId: null,
        });
      }
    }, 60000);
    set({ purchaseTimeoutId: timeoutId });

    try {
      const RNIap = require('react-native-iap');
      console.log('Requesting purchase for:', productId);

      await RNIap.requestPurchase({
        request: {
          ios: {
            sku: productId,
          },
        },
        type: 'subs',
      });

      return true;
    } catch (error: any) {
      console.error('Purchase request error:', error);
      get().clearPurchaseTimeout();

      if (error.code === 'E_USER_CANCELLED' || error.code === 'user-cancelled') {
        set({ isPurchasing: false });
        return false;
      }

      // Handle "item already owned" - restore to finish pending transactions
      if (error.code === 'E_ALREADY_OWNED' || error.message?.includes('already owned')) {
        console.log('Item already owned - attempting restore');
        const restored = await get().restorePurchases();
        set({ isPurchasing: false });
        return restored;
      }

      set({
        error: error.message || 'Purchase failed',
        isPurchasing: false,
      });
      return false;
    }
  },

  restorePurchases: async () => {
    if (isExpoGo) {
      console.log('[Expo Go] Mock restore');
      return false;
    }

    set({ isLoading: true, error: null });

    try {
      const RNIap = require('react-native-iap');
      const purchases = await RNIap.getAvailablePurchases({});
      console.log('Available purchases:', purchases);

      // Finish any pending transactions to clear "item already owned" errors
      for (const purchase of purchases) {
        try {
          await RNIap.finishTransaction({ purchase, isConsumable: false });
          console.log('Finished transaction for:', purchase.productId);
        } catch (e) {
          console.warn('Failed to finish transaction:', e);
        }
      }

      const hasActiveSubscription = purchases.some((purchase: any) =>
        Object.values(PRODUCT_IDS).includes(purchase.productId)
      );

      // Persist subscription status to local storage
      await AsyncStorage.setItem(SUBSCRIPTION_STATUS_KEY, hasActiveSubscription ? 'true' : 'false');
      set({ isSubscribed: hasActiveSubscription });

      return hasActiveSubscription;
    } catch (error: any) {
      console.error('Restore error:', error);
      set({ error: error.message || 'Failed to restore purchases' });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  setSelectedProduct: (productId: string) => {
    set({ selectedProductId: productId });
  },

  setIsSubscribed: async (value: boolean) => {
    await AsyncStorage.setItem(SUBSCRIPTION_STATUS_KEY, value ? 'true' : 'false');
    set({ isSubscribed: value });
  },

  clearError: () => set({ error: null }),

  cleanup: () => {
    // Clear any pending purchase timeout
    get().clearPurchaseTimeout();

    if (isExpoGo) {
      console.log('[Expo Go] Mock cleanup');
      return;
    }

    const { purchaseListenerCleanup } = get();
    if (purchaseListenerCleanup) {
      purchaseListenerCleanup();
    }
    try {
      const RNIap = require('react-native-iap');
      RNIap.endConnection();
    } catch (e) {
      // Ignore
    }
  },
}));
