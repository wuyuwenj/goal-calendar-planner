import pricingData from '../constants/pricing.json';

interface PricingEntry {
  country: string;
  currency: string;
  symbol: string;
  price: number;
  crossedOutPrice: number;
}

type PlanType = 'monthly' | 'yearly';

/**
 * Get crossed-out price by currency code from StoreKit.
 * Since multiple countries can share the same currency, we find the first match.
 */
export function getCrossedOutPriceByCurrency(
  currency: string,
  planType: PlanType
): { price: number; symbol: string; formatted: string } | null {
  const planData = pricingData[planType] as Record<string, PricingEntry>;

  // Find the first country entry that matches the currency
  const match = Object.values(planData).find(
    (entry) => entry.currency === currency
  );

  if (!match) {
    return null;
  }

  return {
    price: match.crossedOutPrice,
    symbol: match.symbol,
    formatted: formatPrice(match.crossedOutPrice, match.symbol, currency),
  };
}

/**
 * Format price with currency symbol.
 * Handles different currency formatting conventions.
 */
function formatPrice(price: number, symbol: string, currency: string): string {
  // Currencies that don't use decimal places
  const noDecimalCurrencies = ['JPY', 'KRW', 'CLP', 'COP', 'HUF', 'IDR', 'VND', 'KZT', 'TWD'];

  if (noDecimalCurrencies.includes(currency)) {
    return `${symbol}${price.toLocaleString()}`;
  }

  // Most currencies use 2 decimal places
  const formattedPrice = price.toFixed(2);

  // Some currencies put symbol after the number
  const symbolAfterCurrencies = ['SEK', 'NOK', 'DKK', 'PLN', 'CZK', 'HUF'];
  if (symbolAfterCurrencies.includes(currency)) {
    return `${formattedPrice} ${symbol}`;
  }

  return `${symbol}${formattedPrice}`;
}

/**
 * Get actual price by currency code (for display alongside crossed-out price).
 */
export function getActualPriceByCurrency(
  currency: string,
  planType: PlanType
): { price: number; symbol: string; formatted: string } | null {
  const planData = pricingData[planType] as Record<string, PricingEntry>;

  const match = Object.values(planData).find(
    (entry) => entry.currency === currency
  );

  if (!match) {
    return null;
  }

  return {
    price: match.price,
    symbol: match.symbol,
    formatted: formatPrice(match.price, match.symbol, currency),
  };
}
