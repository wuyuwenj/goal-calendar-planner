const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Only mock native modules during local development (not EAS builds)
// EAS_BUILD is set during eas build, CI is set in most CI environments
const isProductionBuild = process.env.EAS_BUILD === 'true' || process.env.CI === 'true';
const shouldMockNativeModules = !isProductionBuild;

// Mock native modules that don't work in Expo Go
if (shouldMockNativeModules) {
  config.resolver.extraNodeModules = {
    ...config.resolver.extraNodeModules,
    'react-native-iap': path.resolve(__dirname, 'mocks/react-native-iap.js'),
    'react-native-nitro-modules': path.resolve(__dirname, 'mocks/react-native-nitro-modules.js'),
  };
}

module.exports = withNativeWind(config, { input: './global.css' });
