import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Linking,
  Alert,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Check, Sparkles } from 'lucide-react-native';
import { COLORS, SHADOWS, SPACING, RADIUS } from '../constants/theme';
import { useSubscriptionStore, PRODUCT_IDS } from '../store/subscription';
import { Button } from './ui/Button';
import { getCrossedOutPriceByCurrency } from '../utils/pricingUtils';

// Conditionally import Superwall hook
let useSuperwall: () => { setSubscriptionStatus: (status: any) => Promise<void> };
try {
  useSuperwall = require('expo-superwall').useSuperwall;
} catch {
  // Fallback for Expo Go
  useSuperwall = () => ({
    setSubscriptionStatus: async () => {},
  });
}

interface PaywallScreenProps {
  onClose: () => void;
  onSubscribed: () => void;
}

const BENEFITS = [
  'Unlimited goal creation',
  'AI-powered personalized plans',
  'Daily motivation & smart reminders',
  'Detailed progress insights',
];

export function PaywallScreen({ onClose, onSubscribed }: PaywallScreenProps) {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const contentMaxWidth = isTablet ? 500 : undefined;
  const horizontalPadding = isTablet ? SPACING.xxl : SPACING.lg;

  const {
    products,
    isLoading,
    isPurchasing,
    isSubscribed,
    error,
    selectedProductId,
    initialize,
    purchaseProduct,
    restorePurchases,
    setSelectedProduct,
    clearError,
  } = useSubscriptionStore();

  const { setSubscriptionStatus } = useSuperwall();

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    if (isSubscribed) {
      // Sync with Superwall
      setSubscriptionStatus({
        status: 'ACTIVE',
        entitlements: [{ id: 'pro', type: 'SERVICE_LEVEL' }],
      });
      onSubscribed();
    }
  }, [isSubscribed]);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error, [{ text: 'OK', onPress: clearError }]);
    }
  }, [error]);

  const yearlyProduct = products.find((p) => p.productId === PRODUCT_IDS.YEARLY);
  const monthlyProduct = products.find((p) => p.productId === PRODUCT_IDS.MONTHLY);

  const handlePurchase = async () => {
    if (!selectedProductId) return;
    const success = await purchaseProduct(selectedProductId);
    if (success) {
      onSubscribed();
    }
  };

  const handleRestore = async () => {
    const hasSubscription = await restorePurchases();
    if (hasSubscription) {
      // Sync with Superwall
      await setSubscriptionStatus({
        status: 'ACTIVE',
        entitlements: [{ id: 'pro', type: 'SERVICE_LEVEL' }],
      });
      Alert.alert('Success', 'Your subscription has been restored!', [
        { text: 'OK', onPress: onSubscribed },
      ]);
    } else {
      // Sync inactive status with Superwall
      await setSubscriptionStatus({
        status: 'INACTIVE',
      });
      Alert.alert('No Subscription Found', 'We could not find any active subscriptions for your account.');
    }
  };

  const openTerms = () => {
    Linking.openURL('https://trellisgoal.vercel.app/terms');
  };

  const openPrivacy = () => {
    Linking.openURL('https://trellisgoal.vercel.app/privacy');
  };

  // Calculate savings
  const calculateMonthlySavings = () => {
    if (!yearlyProduct || !monthlyProduct) return null;
    const yearlyMonthly = yearlyProduct.priceAmount / 12;
    const savings = Math.round((1 - yearlyMonthly / monthlyProduct.priceAmount) * 100);
    return savings;
  };

  const savings = calculateMonthlySavings();

  if (isLoading && products.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary.forest} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Close Button */}
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <X size={24} color={COLORS.secondary.bark} />
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingHorizontal: horizontalPadding },
          isTablet && styles.scrollContentTablet,
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[isTablet && { maxWidth: contentMaxWidth, alignSelf: 'center', width: '100%' }]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Sparkles size={40} color={COLORS.primary.forest} />
          </View>
          <Text style={styles.headline}>Achieve Your Goals Faster</Text>
          <Text style={styles.subheadline}>
            Unlock all features and start your journey to success
          </Text>
        </View>

        {/* Benefits */}
        <View style={styles.benefitsContainer}>
          {BENEFITS.map((benefit, index) => (
            <View key={index} style={styles.benefitRow}>
              <View style={styles.checkContainer}>
                <Check size={18} color={COLORS.white} />
              </View>
              <Text style={styles.benefitText}>{benefit}</Text>
            </View>
          ))}
        </View>

        {/* Pricing Options */}
        <View style={styles.pricingContainer}>
          {/* Yearly Option */}
          <TouchableOpacity
            style={[
              styles.planCard,
              selectedProductId === PRODUCT_IDS.YEARLY && styles.planCardSelected,
            ]}
            onPress={() => setSelectedProduct(PRODUCT_IDS.YEARLY)}
            activeOpacity={0.8}
          >
            <View style={styles.badge}>
              <Text style={styles.badgeText}>50% OFF</Text>
            </View>
            <View style={styles.planHeader}>
              <View style={styles.radioOuter}>
                {selectedProductId === PRODUCT_IDS.YEARLY && (
                  <View style={styles.radioInner} />
                )}
              </View>
              <View style={styles.planInfo}>
                <Text style={styles.planName}>Yearly</Text>
                <View style={styles.priceRow}>
                  <Text style={styles.originalPrice}>
                    {yearlyProduct?.currency
                      ? getCrossedOutPriceByCurrency(yearlyProduct.currency, 'yearly')?.formatted || '$59.99'
                      : '$59.99'}
                  </Text>
                  <Text style={styles.planPrice}>
                    {yearlyProduct?.localizedPrice || '$29.99'}/year
                  </Text>
                </View>
                <Text style={styles.planSubprice}>
                  Just {yearlyProduct ? (() => {
                    const priceInfo = getCrossedOutPriceByCurrency(yearlyProduct.currency, 'yearly');
                    const symbol = priceInfo?.symbol || '$';
                    const monthlyAmount = yearlyProduct.priceAmount / 12;
                    // Currencies without decimals
                    const noDecimals = ['JPY', 'KRW', 'CLP', 'COP', 'HUF', 'IDR', 'VND', 'KZT', 'TWD'];
                    const formatted = noDecimals.includes(yearlyProduct.currency)
                      ? Math.round(monthlyAmount).toLocaleString()
                      : monthlyAmount.toFixed(2);
                    return `${symbol}${formatted}`;
                  })() : '$2.49'}/month
                </Text>
              </View>
              <View style={styles.bestValueBadge}>
                <Text style={styles.bestValueText}>Best Value</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Monthly Option */}
          <TouchableOpacity
            style={[
              styles.planCard,
              selectedProductId === PRODUCT_IDS.MONTHLY && styles.planCardSelected,
            ]}
            onPress={() => setSelectedProduct(PRODUCT_IDS.MONTHLY)}
            activeOpacity={0.8}
          >
            <View style={styles.badge}>
              <Text style={styles.badgeText}>50% OFF</Text>
            </View>
            <View style={styles.planHeader}>
              <View style={styles.radioOuter}>
                {selectedProductId === PRODUCT_IDS.MONTHLY && (
                  <View style={styles.radioInner} />
                )}
              </View>
              <View style={styles.planInfo}>
                <Text style={styles.planName}>Monthly</Text>
                <View style={styles.priceRow}>
                  <Text style={styles.originalPrice}>
                    {monthlyProduct?.currency
                      ? getCrossedOutPriceByCurrency(monthlyProduct.currency, 'monthly')?.formatted || '$9.99'
                      : '$9.99'}
                  </Text>
                  <Text style={styles.planPrice}>
                    {monthlyProduct?.localizedPrice || '$4.99'}/month
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* CTA Button */}
        <View style={styles.ctaContainer}>
          <Button
            onPress={handlePurchase}
            variant="primary"
            size="lg"
            loading={isPurchasing}
            disabled={isPurchasing || !selectedProductId}
          >
            Start 7-Day Free Trial
          </Button>
        </View>

        {/* Trust Signals */}
        <View style={styles.trustContainer}>
          <Text style={styles.trustText}>Cancel anytime · No commitment</Text>
          <TouchableOpacity onPress={handleRestore}>
            <Text style={styles.restoreText}>Restore purchases</Text>
          </TouchableOpacity>
        </View>

        {/* Legal Links */}
        <View style={styles.legalContainer}>
          <TouchableOpacity onPress={openTerms}>
            <Text style={styles.legalLink}>Terms of Service</Text>
          </TouchableOpacity>
          <Text style={styles.legalDivider}>|</Text>
          <TouchableOpacity onPress={openPrivacy}>
            <Text style={styles.legalLink}>Privacy Policy</Text>
          </TouchableOpacity>
        </View>

        {/* Legal Disclosure */}
        <Text style={styles.legalDisclosure}>
          Payment will be charged to your Apple ID account at confirmation of purchase.
          Subscription automatically renews unless canceled at least 24 hours before
          the end of the current period.
        </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.secondary.cream,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: 16,
    color: COLORS.secondary.bark,
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    right: SPACING.md,
    zIndex: 10,
    padding: SPACING.sm,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xxl,
    paddingBottom: SPACING.xl,
  },
  scrollContentTablet: {
    alignItems: 'center',
    paddingTop: SPACING.xxl * 1.5,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary.light,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  headline: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.secondary.bark,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  subheadline: {
    fontSize: 16,
    color: COLORS.secondary.warm,
    textAlign: 'center',
    lineHeight: 24,
  },
  benefitsContainer: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.md,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  checkContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary.forest,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  benefitText: {
    fontSize: 16,
    color: COLORS.secondary.bark,
    flex: 1,
  },
  pricingContainer: {
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  planCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 2,
    borderColor: COLORS.secondary.sand,
    ...SHADOWS.sm,
    position: 'relative',
    overflow: 'hidden',
  },
  planCardSelected: {
    borderColor: COLORS.primary.forest,
    backgroundColor: COLORS.primary.light,
  },
  badge: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: COLORS.primary.mint,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderBottomRightRadius: RADIUS.sm,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary.forest,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.secondary.warm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  radioInner: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.primary.forest,
  },
  planInfo: {
    flex: 1,
  },
  planName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.secondary.bark,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  originalPrice: {
    fontSize: 14,
    color: COLORS.secondary.warm,
    textDecorationLine: 'line-through',
  },
  planPrice: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.secondary.bark,
  },
  planSubprice: {
    fontSize: 14,
    color: COLORS.secondary.warm,
    marginTop: 2,
  },
  bestValueBadge: {
    backgroundColor: COLORS.primary.forest,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
  },
  bestValueText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.white,
  },
  ctaContainer: {
    marginBottom: SPACING.md,
  },
  trustContainer: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  trustText: {
    fontSize: 14,
    color: COLORS.secondary.warm,
    marginBottom: SPACING.sm,
  },
  restoreText: {
    fontSize: 14,
    color: COLORS.primary.forest,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  legalContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  legalLink: {
    fontSize: 12,
    color: COLORS.secondary.warm,
  },
  legalDivider: {
    fontSize: 12,
    color: COLORS.secondary.sand,
    marginHorizontal: SPACING.sm,
  },
  legalDisclosure: {
    fontSize: 11,
    color: COLORS.secondary.warm,
    textAlign: 'center',
    lineHeight: 16,
  },
});
