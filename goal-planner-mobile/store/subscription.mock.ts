import { create } from 'zustand';

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
  initialize: () => Promise<void>;
  fetchProducts: () => Promise<void>;
  purchaseProduct: (productId: string) => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
  setSelectedProduct: (productId: string) => void;
  setIsSubscribed: (value: boolean) => void;
  clearError: () => void;
  cleanup: () => void;
}

// Mock store for Expo Go - doesn't use react-native-iap
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

  initialize: async () => {
    console.log('[Expo Go] Mock IAP initialized');
    set({ isLoading: false });
  },

  fetchProducts: async () => {
    console.log('[Expo Go] Mock fetchProducts');
  },

  purchaseProduct: async (productId: string) => {
    console.log('[Expo Go] Mock purchase:', productId);
    // In Expo Go, simulate a successful purchase for testing
    set({ isSubscribed: true, isPurchasing: false });
    return true;
  },

  restorePurchases: async () => {
    console.log('[Expo Go] Mock restore');
    return false;
  },

  setSelectedProduct: (productId: string) => {
    set({ selectedProductId: productId });
  },

  setIsSubscribed: (value: boolean) => {
    set({ isSubscribed: value });
  },

  clearError: () => set({ error: null }),

  cleanup: () => {
    console.log('[Expo Go] Mock cleanup');
  },
}));
