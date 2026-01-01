// Mock for react-native-nitro-modules in Expo Go
console.log('[Mock] react-native-nitro-modules loaded (Expo Go mode)');

export const NitroModules = {
  createHybridObject: () => null,
  hasHybridObject: () => false,
};

export default {
  NitroModules,
};
