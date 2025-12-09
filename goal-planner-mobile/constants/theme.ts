// Trellis Design System - Color Palette
export const COLORS = {
  // Primary Colors (Green - Nature, Growth)
  primary: {
    forest: '#2D5A3D',      // Primary buttons, headers, key actions
    sage: '#6B8E6B',        // Secondary actions, icons
    mint: '#A8D5A2',        // Success states, progress indicators
    light: '#E8F5E8',       // Backgrounds, cards
  },
  // Secondary Colors (Brown - Earth, Stability)
  secondary: {
    bark: '#5D4037',        // Text, navigation icons
    warm: '#8D6E63',        // Secondary text, borders
    sand: '#D7CCC8',        // Dividers, disabled states
    cream: '#FAF8F5',       // App background
  },
  // System Colors
  system: {
    error: '#D32F2F',       // Errors, destructive actions
    errorLight: '#FFEBEE',  // Error backgrounds
    warning: '#F9A825',     // Warnings, pending states
    warningLight: '#FFF8E1',// Warning backgrounds
    info: '#1976D2',        // Information, tips
    infoLight: '#E3F2FD',   // Info backgrounds
  },
  // Neutral colors (for compatibility)
  neutral: {
    50: '#FAF8F5',          // Cream background
    100: '#F5F0EB',
    200: '#E8E0D8',
    300: '#D7CCC8',         // Sand
    400: '#A69B94',
    500: '#8D6E63',         // Warm brown
    600: '#6D5B52',
    700: '#5D4037',         // Bark brown
    800: '#3E2723',
    900: '#2D1F1A',
  },
  // Green shades (for success states)
  green: {
    50: '#E8F5E8',
    100: '#C8E6C9',
    200: '#A8D5A2',         // Mint
    300: '#81C784',
    400: '#6B8E6B',         // Sage
    500: '#4CAF50',
    600: '#43A047',
    700: '#2D5A3D',         // Forest
    800: '#1B5E20',
    900: '#1A3A24',
  },
  // Red shades (for error states)
  red: {
    50: '#FFEBEE',
    100: '#FFCDD2',
    200: '#EF9A9A',
    500: '#F44336',
    700: '#D32F2F',
  },
  white: '#FFFFFF',
  black: '#000000',
};

// Typography Scale (following 16px minimum for accessibility)
export const TYPOGRAPHY = {
  h1: { fontSize: 28, fontWeight: '700' as const },
  h2: { fontSize: 24, fontWeight: '600' as const },
  h3: { fontSize: 20, fontWeight: '600' as const },
  body: { fontSize: 16, fontWeight: '400' as const },
  bodySmall: { fontSize: 14, fontWeight: '400' as const },
  caption: { fontSize: 12, fontWeight: '400' as const },
};

// Spacing Scale (base unit: 8px)
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Border Radius
export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

// Shadows
export const SHADOWS = {
  sm: {
    shadowColor: '#5D4037',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#5D4037',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#5D4037',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
};

export const DAYS = [
  { index: 0, name: 'Sunday', short: 'Sun' },
  { index: 1, name: 'Monday', short: 'Mon' },
  { index: 2, name: 'Tuesday', short: 'Tue' },
  { index: 3, name: 'Wednesday', short: 'Wed' },
  { index: 4, name: 'Thursday', short: 'Thu' },
  { index: 5, name: 'Friday', short: 'Fri' },
  { index: 6, name: 'Saturday', short: 'Sat' },
];

export const EXPERIENCE_LEVELS = [
  {
    value: 'beginner' as const,
    label: 'Beginner',
    desc: 'Starting from scratch',
    placeholder: 'e.g., I have never done this before',
  },
  {
    value: 'some_experience' as const,
    label: 'Some experience',
    desc: 'Know the basics',
    placeholder: 'e.g., I have tried a few times',
  },
  {
    value: 'intermediate' as const,
    label: 'Intermediate',
    desc: 'Comfortable with fundamentals',
    placeholder: 'e.g., I do this regularly',
  },
  {
    value: 'advanced' as const,
    label: 'Advanced',
    desc: 'Looking to master skills',
    placeholder: 'e.g., I have significant experience',
  },
];

export const TIMELINE_OPTIONS = [
  { value: '1month' as const, label: '1 Month', weeks: 4 },
  { value: '3months' as const, label: '3 Months', weeks: 12 },
  { value: '6months' as const, label: '6 Months', weeks: 24 },
  { value: 'custom' as const, label: 'Custom', weeks: 0 },
];
