// Mock for react-native-iap in Expo Go
console.log('[Mock] react-native-iap loaded (Expo Go mode)');

export const initConnection = async () => {
  console.log('[Mock] initConnection');
  return true;
};

export const endConnection = async () => {
  console.log('[Mock] endConnection');
};

export const fetchProducts = async () => {
  console.log('[Mock] fetchProducts');
  return [];
};

export const requestPurchase = async () => {
  console.log('[Mock] requestPurchase');
  return {};
};

export const getAvailablePurchases = async () => {
  console.log('[Mock] getAvailablePurchases');
  return [];
};

export const finishTransaction = async () => {
  console.log('[Mock] finishTransaction');
};

export const purchaseUpdatedListener = (callback) => {
  console.log('[Mock] purchaseUpdatedListener');
  return { remove: () => {} };
};

export const purchaseErrorListener = (callback) => {
  console.log('[Mock] purchaseErrorListener');
  return { remove: () => {} };
};

export default {
  initConnection,
  endConnection,
  fetchProducts,
  requestPurchase,
  getAvailablePurchases,
  finishTransaction,
  purchaseUpdatedListener,
  purchaseErrorListener,
};
