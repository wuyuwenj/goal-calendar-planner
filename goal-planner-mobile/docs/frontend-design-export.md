# Frontend Design Code Export

This document contains all the frontend page and component code for redesign reference.

---

## TABLE OF CONTENTS

1. [Theme & Design System](#theme--design-system)
2. [UI Components](#ui-components)
3. [Feature Components](#feature-components)
4. [Auth Pages](#auth-pages)
5. [Main Tab Pages](#main-tab-pages)
6. [Onboarding Pages](#onboarding-pages)
7. [Check-in Pages](#check-in-pages)

---

## THEME & DESIGN SYSTEM

### constants/theme.ts

```typescript
import { Platform } from 'react-native';

export const COLORS = {
  // Primary palette - Nature inspired greens
  primary: {
    forest: '#2D5A3D',      // Primary buttons, headers, main accent
    sage: '#6B8E6B',        // Secondary actions, hover states
    mint: '#A8D5A2',        // Success states, highlights
    light: '#E8F5E8',       // Backgrounds, cards
  },

  // Secondary palette - Warm earth tones
  secondary: {
    bark: '#5D4037',        // Primary text
    warm: '#8D6E63',        // Secondary text
    sand: '#D7CCC8',        // Dividers, borders
    cream: '#FAF8F5',       // App background
  },

  // System colors
  system: {
    error: '#D32F2F',
    errorLight: '#FFEBEE',
    warning: '#F9A825',
    warningLight: '#FFF8E1',
    info: '#1976D2',
    infoLight: '#E3F2FD',
  },

  // Neutral scale
  neutral: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },

  // Extended greens
  green: {
    50: '#E8F5E9',
    100: '#C8E6C9',
    200: '#A5D6A7',
    300: '#81C784',
    400: '#66BB6A',
    500: '#4CAF50',
    600: '#43A047',
    700: '#388E3C',
    800: '#2E7D32',
    900: '#1B5E20',
  },

  // Extended reds for errors
  red: {
    50: '#FFEBEE',
    100: '#FFCDD2',
    200: '#EF9A9A',
    300: '#E57373',
    400: '#EF5350',
    500: '#F44336',
    600: '#E53935',
    700: '#D32F2F',
  },

  // Base
  white: '#FFFFFF',
  black: '#000000',
};

export const TYPOGRAPHY = {
  // Headings
  h1: {
    fontSize: 28,
    fontWeight: '700' as const,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 24,
    fontWeight: '600' as const,
    letterSpacing: -0.3,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
  },

  // Body
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },

  // Caption
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

export const SHADOWS = {
  sm: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    android: {
      elevation: 2,
    },
  }),
  md: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.12,
      shadowRadius: 4,
    },
    android: {
      elevation: 4,
    },
  }),
  lg: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
    },
    android: {
      elevation: 8,
    },
  }),
};
```

---

## UI COMPONENTS

### components/ui/Button.tsx

```typescript
import React, { ReactNode } from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  View,
  StyleSheet,
} from 'react-native';
import { COLORS, SHADOWS } from '../../constants/theme';

interface ButtonProps {
  onPress: () => void;
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'success' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  className?: string;
}

export function Button({
  onPress,
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'right',
  fullWidth = true,
}: ButtonProps) {
  const getBackgroundColor = () => {
    if (disabled) return COLORS.secondary.sand;
    switch (variant) {
      case 'primary':
        return COLORS.primary.forest;
      case 'secondary':
        return COLORS.white;
      case 'ghost':
        return 'transparent';
      case 'success':
        return COLORS.primary.mint;
      case 'danger':
        return COLORS.system.error;
      default:
        return COLORS.primary.forest;
    }
  };

  const getTextColor = () => {
    if (disabled) return COLORS.neutral[400];
    switch (variant) {
      case 'primary':
        return COLORS.white;
      case 'secondary':
        return COLORS.secondary.bark;
      case 'ghost':
        return COLORS.secondary.warm;
      case 'success':
        return COLORS.primary.forest;
      case 'danger':
        return COLORS.white;
      default:
        return COLORS.white;
    }
  };

  const getBorderColor = () => {
    if (disabled) return COLORS.secondary.sand;
    switch (variant) {
      case 'secondary':
        return COLORS.secondary.bark;
      case 'ghost':
        return 'transparent';
      default:
        return 'transparent';
    }
  };

  const getSize = () => {
    switch (size) {
      case 'sm':
        return { paddingVertical: 10, paddingHorizontal: 16, fontSize: 14 };
      case 'lg':
        return { paddingVertical: 18, paddingHorizontal: 32, fontSize: 18 };
      default:
        return { paddingVertical: 14, paddingHorizontal: 24, fontSize: 16 };
    }
  };

  const sizeStyles = getSize();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          borderWidth: variant === 'secondary' ? 2 : 0,
          opacity: disabled ? 0.6 : 1,
          paddingVertical: sizeStyles.paddingVertical,
          paddingHorizontal: sizeStyles.paddingHorizontal,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
        },
        variant === 'primary' && !disabled && SHADOWS.sm,
      ]}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <View style={styles.content}>
          {icon && iconPosition === 'left' && (
            <View style={styles.iconLeft}>{icon}</View>
          )}
          <Text
            style={[
              styles.text,
              { color: getTextColor(), fontSize: sizeStyles.fontSize },
            ]}
          >
            {children}
          </Text>
          {icon && iconPosition === 'right' && (
            <View style={styles.iconRight}>{icon}</View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    minHeight: 48,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  text: {
    fontWeight: '600',
  },
  iconLeft: {
    marginRight: 4,
  },
  iconRight: {
    marginLeft: 4,
  },
});
```

### components/ui/Card.tsx

```typescript
import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, SHADOWS } from '../../constants/theme';

interface CardProps {
  children: ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'success' | 'error' | 'warning' | 'primary';
  style?: ViewStyle;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({
  children,
  variant = 'default',
  style,
  padding = 'md',
}: CardProps) {
  const getBackgroundColor = () => {
    switch (variant) {
      case 'primary':
        return COLORS.primary.forest;
      case 'elevated':
        return COLORS.white;
      case 'success':
        return COLORS.primary.light;
      case 'error':
        return COLORS.system.errorLight;
      case 'warning':
        return COLORS.system.warningLight;
      case 'outlined':
        return COLORS.white;
      default:
        return COLORS.white;
    }
  };

  const getBorderColor = () => {
    switch (variant) {
      case 'success':
        return COLORS.primary.mint;
      case 'error':
        return COLORS.red[200];
      case 'warning':
        return COLORS.system.warning;
      case 'outlined':
        return COLORS.secondary.sand;
      case 'primary':
      case 'elevated':
        return 'transparent';
      default:
        return COLORS.secondary.sand;
    }
  };

  const getPadding = () => {
    switch (padding) {
      case 'none':
        return 0;
      case 'sm':
        return 12;
      case 'lg':
        return 24;
      default:
        return 16;
    }
  };

  const getShadow = () => {
    if (variant === 'elevated') return SHADOWS.md;
    if (variant === 'primary') return SHADOWS.lg;
    return {};
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          borderWidth: variant === 'elevated' || variant === 'primary' ? 0 : 1,
          padding: getPadding(),
        },
        getShadow(),
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
  },
});
```

### components/ui/Input.tsx

```typescript
import React, { useState } from 'react';
import { TextInput, View, Text, StyleSheet } from 'react-native';
import { COLORS, SHADOWS } from '../../constants/theme';

interface InputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  label?: string;
  hint?: string;
  error?: string;
  multiline?: boolean;
  numberOfLines?: number;
  autoFocus?: boolean;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  editable?: boolean;
}

export function Input({
  value,
  onChangeText,
  placeholder,
  label,
  hint,
  error,
  multiline = false,
  numberOfLines = 1,
  autoFocus = false,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  editable = true,
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const getBorderColor = () => {
    if (error) return COLORS.system.error;
    if (isFocused) return COLORS.primary.forest;
    return COLORS.secondary.sand;
  };

  const getBackgroundColor = () => {
    if (!editable) return COLORS.neutral[100];
    return COLORS.secondary.cream;
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.neutral[400]}
        multiline={multiline}
        numberOfLines={numberOfLines}
        autoFocus={autoFocus}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        editable={editable}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={[
          styles.input,
          {
            borderColor: getBorderColor(),
            backgroundColor: getBackgroundColor(),
            borderWidth: isFocused ? 2 : 1.5,
          },
          multiline && styles.multiline,
          isFocused && SHADOWS.sm,
        ]}
        textAlignVertical={multiline ? 'top' : 'center'}
      />
      {hint && !error && <Text style={styles.hint}>{hint}</Text>}
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  label: {
    color: COLORS.secondary.warm,
    marginBottom: 2,
    fontSize: 14,
    fontWeight: '500',
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 10,
    fontSize: 16,
    color: COLORS.secondary.bark,
    minHeight: 52,
  },
  multiline: {
    minHeight: 120,
    paddingTop: 14,
  },
  hint: {
    color: COLORS.neutral[500],
    fontSize: 12,
  },
  error: {
    color: COLORS.system.error,
    fontSize: 12,
  },
});
```

---

## FEATURE COMPONENTS

### components/GoalCard.tsx

```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Sprout, Target } from 'lucide-react-native';
import { ProgressBar } from './ui/ProgressBar';
import { COLORS, SHADOWS } from '../constants/theme';
import type { Goal } from '../types';

interface GoalCardProps {
  goal: Goal;
  currentWeek: number;
  totalWeeks: number;
}

export function GoalCard({ goal, currentWeek, totalWeeks }: GoalCardProps) {
  const progress = totalWeeks > 0 ? (currentWeek / totalWeeks) * 100 : 0;
  const weeksRemaining = Math.max(0, totalWeeks - currentWeek + 1);

  const getGrowthEmoji = () => {
    if (progress < 25) return '🌱';
    if (progress < 50) return '🌿';
    if (progress < 75) return '🪴';
    return '🌳';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Text style={styles.growthEmoji}>{getGrowthEmoji()}</Text>
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={2}>
            {goal.title}
          </Text>
          <Text style={styles.subtitle}>
            Week {currentWeek} of {totalWeeks} · {weeksRemaining} weeks remaining
          </Text>
        </View>
      </View>

      <ProgressBar progress={progress} variant="light" />

      <View style={styles.footer}>
        <Text style={styles.progressText}>{Math.round(progress)}% complete</Text>
        <View style={styles.badge}>
          <Sprout size={12} color={COLORS.primary.light} />
          <Text style={styles.badgeText}>Growing</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: COLORS.primary.forest,
    borderRadius: 16,
    ...SHADOWS.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
  },
  iconContainer: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 10,
  },
  growthEmoji: {
    fontSize: 20,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  progressText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: COLORS.primary.light,
    fontSize: 12,
    fontWeight: '500',
  },
});
```

### components/TaskItem.tsx

```typescript
import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Calendar, Clock, ChevronRight } from 'lucide-react-native';
import { Checkbox } from './ui/Checkbox';
import { COLORS, SHADOWS } from '../constants/theme';
import type { Task } from '../types';
import { getDayName } from '../utils/date';

interface TaskItemProps {
  task: Task;
  onToggle: () => void;
  onPress?: () => void;
  showDay?: boolean;
}

export function TaskItem({ task, onToggle, onPress, showDay = true }: TaskItemProps) {
  const isCompleted = task.status === 'completed';
  const isMissed = task.status === 'missed';

  const dayName = getDayName(task.scheduledDate);

  const getBackgroundColor = () => {
    if (isCompleted) return COLORS.primary.light;
    if (isMissed) return COLORS.system.errorLight;
    return COLORS.white;
  };

  const getBorderColor = () => {
    if (isCompleted) return COLORS.primary.mint;
    if (isMissed) return COLORS.red[200];
    return COLORS.secondary.sand;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.container,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          opacity: isMissed ? 0.7 : 1,
        },
        !isMissed && !isCompleted && SHADOWS.sm,
      ]}
      activeOpacity={0.7}
    >
      <TouchableOpacity
        onPress={(e) => {
          e.stopPropagation?.();
          onToggle();
        }}
        style={styles.checkboxContainer}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Checkbox
          checked={isCompleted}
          onToggle={onToggle}
          variant={isCompleted ? 'success' : isMissed ? 'error' : 'default'}
        />
      </TouchableOpacity>

      <View style={styles.content}>
        <Text
          style={[
            styles.title,
            isCompleted && styles.titleCompleted,
            isMissed && styles.titleMissed,
          ]}
          numberOfLines={2}
        >
          {task.title}
        </Text>
        <View style={styles.meta}>
          {showDay && (
            <View style={styles.metaItem}>
              <Calendar size={14} color={COLORS.secondary.warm} />
              <Text style={styles.metaText}>{dayName}</Text>
            </View>
          )}
          <View style={styles.metaItem}>
            <Clock size={14} color={COLORS.secondary.warm} />
            <Text style={styles.metaText}>
              {task.scheduledTime} · {task.durationMinutes}min
            </Text>
          </View>
        </View>
      </View>

      {isMissed && (
        <View style={styles.missedBadge}>
          <Text style={styles.missedText}>Missed</Text>
        </View>
      )}

      {isCompleted && (
        <View style={styles.completedBadge}>
          <Text style={styles.completedText}>Done</Text>
        </View>
      )}

      {onPress && (
        <View style={styles.chevronContainer}>
          <ChevronRight size={20} color={COLORS.neutral[400]} />
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  checkboxContainer: {
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    color: COLORS.secondary.bark,
    marginBottom: 4,
    fontWeight: '500',
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: COLORS.primary.sage,
  },
  titleMissed: {
    textDecorationLine: 'line-through',
    color: COLORS.system.error,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    color: COLORS.secondary.warm,
  },
  missedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: COLORS.red[100],
    borderRadius: 6,
  },
  missedText: {
    fontSize: 12,
    color: COLORS.system.error,
    fontWeight: '500',
  },
  completedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: COLORS.primary.mint,
    borderRadius: 6,
  },
  completedText: {
    fontSize: 12,
    color: COLORS.primary.forest,
    fontWeight: '500',
  },
  chevronContainer: {
    justifyContent: 'center',
    paddingLeft: 8,
  },
});
```

### components/TaskDetailModal.tsx

```typescript
import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  Pressable,
} from 'react-native';
import {
  X,
  XCircle,
  Clock,
  Calendar,
  ExternalLink,
  Play,
  BookOpen,
  CheckCircle,
  Info,
} from 'lucide-react-native';
import { COLORS, SHADOWS } from '../constants/theme';
import { Button } from './ui/Button';
import type { Task } from '../types';
import { getDayName, formatDate, formatTime } from '../utils/date';

interface TaskDetailModalProps {
  visible: boolean;
  task: Task | null;
  onClose: () => void;
  onToggleComplete: () => void;
  onMarkMissed: () => void;
}

export function TaskDetailModal({
  visible,
  task,
  onClose,
  onToggleComplete,
  onMarkMissed,
}: TaskDetailModalProps) {
  if (!task) return null;

  const dayName = getDayName(task.scheduledDate);
  const formattedDate = formatDate(task.scheduledDate);
  const isCompleted = task.status === 'completed';
  const isMissed = task.status === 'missed';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View
                style={[
                  styles.statusIndicator,
                  isCompleted && styles.statusCompleted,
                  isMissed && styles.statusMissed,
                ]}
              />
              <Text style={styles.headerTitle}>Task Details</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={COLORS.neutral[500]} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Task Title */}
            <Text style={styles.taskTitle}>{task.title}</Text>

            {/* Schedule Info */}
            <View style={styles.scheduleRow}>
              <View style={styles.scheduleItem}>
                <Calendar size={16} color={COLORS.secondary.warm} />
                <Text style={styles.scheduleText}>
                  {dayName}, {formattedDate}
                </Text>
              </View>
              <View style={styles.scheduleItem}>
                <Clock size={16} color={COLORS.secondary.warm} />
                <Text style={styles.scheduleText}>
                  {formatTime(task.scheduledTime)} · {task.durationMinutes} min
                </Text>
              </View>
            </View>

            {/* Description */}
            {task.description && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Info size={18} color={COLORS.primary.forest} />
                  <Text style={styles.sectionTitle}>What to Do</Text>
                </View>
                <Text style={styles.description}>{task.description}</Text>
              </View>
            )}

            {/* Week Badge */}
            <View style={styles.weekBadge}>
              <Text style={styles.weekText}>Week {task.weekNumber}</Text>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.footer}>
            {!isMissed && !isCompleted && (
              <View style={styles.buttonRow}>
                <Button
                  onPress={() => {
                    onToggleComplete();
                    onClose();
                  }}
                  variant="primary"
                  fullWidth
                >
                  Mark as Complete
                </Button>
                <TouchableOpacity
                  onPress={() => {
                    onMarkMissed();
                    onClose();
                  }}
                  style={styles.missedButton}
                >
                  <XCircle size={18} color={COLORS.system.error} />
                  <Text style={styles.missedButtonText}>Mark as Missed</Text>
                </TouchableOpacity>
              </View>
            )}
            {isCompleted && !isMissed && (
              <Button
                onPress={() => {
                  onToggleComplete();
                  onClose();
                }}
                variant="secondary"
                fullWidth
              >
                Mark as Incomplete
              </Button>
            )}
            {isMissed && (
              <View style={styles.missedMessage}>
                <XCircle size={20} color={COLORS.system.error} />
                <Text style={styles.missedMessageText}>
                  This task was missed. You can still review it during your weekly check-in.
                </Text>
              </View>
            )}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    ...SHADOWS.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.secondary.sand,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary.sage,
  },
  statusCompleted: {
    backgroundColor: COLORS.primary.forest,
  },
  statusMissed: {
    backgroundColor: COLORS.system.error,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.secondary.bark,
  },
  closeButton: {
    padding: 4,
  },
  scrollContent: {
    padding: 20,
  },
  taskTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.secondary.bark,
    marginBottom: 12,
    lineHeight: 28,
  },
  scheduleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.secondary.sand,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  scheduleText: {
    fontSize: 14,
    color: COLORS.secondary.warm,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary.forest,
  },
  description: {
    fontSize: 15,
    color: COLORS.secondary.bark,
    lineHeight: 24,
  },
  weekBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: COLORS.primary.light,
    borderRadius: 8,
    marginTop: 8,
  },
  weekText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.primary.forest,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.secondary.sand,
  },
  buttonRow: {
    gap: 12,
  },
  missedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.red[200],
    backgroundColor: COLORS.system.errorLight,
  },
  missedButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.system.error,
  },
  missedMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: COLORS.system.errorLight,
    borderRadius: 12,
  },
  missedMessageText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.system.error,
  },
});
```

### components/StepIndicator.tsx

```typescript
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS } from '../constants/theme';

interface StepIndicatorProps {
  totalSteps: number;
  currentStep: number;
}

export function StepIndicator({ totalSteps, currentStep }: StepIndicatorProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: totalSteps }).map((_, i) => {
        const isCompleted = i + 1 < currentStep;
        const isCurrent = i + 1 === currentStep;

        return (
          <View
            key={i}
            style={[
              styles.step,
              {
                backgroundColor: isCompleted
                  ? COLORS.primary.forest
                  : isCurrent
                  ? COLORS.primary.sage
                  : COLORS.secondary.sand,
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 32,
  },
  step: {
    flex: 1,
    height: 4,
    borderRadius: 100,
  },
});
```

### components/TaskStatusCard.tsx

```typescript
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Check, X, Circle } from 'lucide-react-native';

type TaskStatus = 'completed' | 'missed' | 'skipped' | undefined;

interface TaskStatusCardProps {
  task: {
    id: string;
    title: string;
    durationMinutes: number;
  };
  status: TaskStatus;
  onStatusChange: (status: 'completed' | 'missed' | undefined) => void;
}

export function TaskStatusCard({
  task,
  status,
  onStatusChange,
}: TaskStatusCardProps) {
  const isCompleted = status === 'completed';
  const isMissed = status === 'missed';

  // Cycle: undefined -> completed -> missed -> undefined
  const handleTap = () => {
    if (!status || status === 'skipped') {
      onStatusChange('completed');
    } else if (status === 'completed') {
      onStatusChange('missed');
    } else {
      onStatusChange(undefined);
    }
  };

  return (
    <TouchableOpacity
      onPress={handleTap}
      style={[
        styles.taskCard,
        isCompleted && styles.taskCardCompleted,
        isMissed && styles.taskCardMissed,
      ]}
      activeOpacity={0.7}
    >
      <View style={styles.statusIndicator}>
        {isCompleted && (
          <View style={styles.completedBadge}>
            <Check size={16} color="#fff" />
          </View>
        )}
        {isMissed && (
          <View style={styles.missedBadge}>
            <X size={16} color="#fff" />
          </View>
        )}
        {!isCompleted && !isMissed && (
          <View style={styles.pendingBadge}>
            <Circle size={16} color="#d4d4d4" />
          </View>
        )}
      </View>
      <View style={styles.taskContent}>
        <Text style={[styles.taskTitle, isMissed && styles.taskTitleMissed]}>
          {task.title}
        </Text>
        <Text style={styles.taskMeta}>{task.durationMinutes}min</Text>
      </View>
      <View style={styles.statusHint}>
        <Text style={styles.statusHintText}>
          {isCompleted ? 'Done' : isMissed ? 'Missed' : 'Tap to mark'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e5e5',
    backgroundColor: '#fff',
  },
  taskCardCompleted: {
    borderColor: '#16a34a',
    backgroundColor: '#f0fdf4',
  },
  taskCardMissed: {
    borderColor: '#dc2626',
    backgroundColor: '#fef2f2',
  },
  statusIndicator: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#16a34a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  missedBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#dc2626',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pendingBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#d4d4d4',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    color: '#171717',
    marginBottom: 2,
  },
  taskTitleMissed: {
    textDecorationLine: 'line-through',
    color: '#737373',
  },
  taskMeta: {
    fontSize: 14,
    color: '#737373',
  },
  statusHint: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
  },
  statusHintText: {
    fontSize: 11,
    color: '#737373',
    fontWeight: '500',
  },
});
```

---

## AUTH PAGES

### app/(auth)/login.tsx

```typescript
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Sprout } from 'lucide-react-native';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useAuthStore } from '../../store/auth';
import { COLORS } from '../../constants/theme';
import { useEffect } from 'react';

export default function LoginScreen() {
  const router = useRouter();
  const { signInWithGoogle, isAuthenticated, isLoading, error, clearError } =
    useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated]);

  const handleGoogleSignIn = async () => {
    clearError();
    await signInWithGoogle();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo Section */}
        <View style={styles.logoSection}>
          <View style={styles.logoContainer}>
            <Sprout size={48} color={COLORS.primary.forest} />
          </View>
          <Text style={styles.title}>Trellis</Text>
          <Text style={styles.subtitle}>
            AI-powered weekly schedules to help you achieve your goals
          </Text>
        </View>

        {/* Features */}
        <View style={styles.features}>
          <FeatureItem
            emoji="🌱"
            title="Plant your goals"
            description="Define what you want to achieve"
          />
          <FeatureItem
            emoji="🤖"
            title="AI-generated plans"
            description="Get personalized weekly schedules"
          />
          <FeatureItem
            emoji="📅"
            title="Calendar sync"
            description="Integrate with Google Calendar"
          />
          <FeatureItem
            emoji="🌳"
            title="Watch them grow"
            description="Track progress with weekly check-ins"
          />
        </View>

        {/* Sign In */}
        <View style={styles.signInSection}>
          {error && (
            <Card variant="error" style={styles.errorCard}>
              <Text style={styles.errorText}>{error}</Text>
            </Card>
          )}
          <Button onPress={handleGoogleSignIn} loading={isLoading}>
            Continue with Google
          </Button>
          <Text style={styles.disclaimer}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

function FeatureItem({
  emoji,
  title,
  description,
}: {
  emoji: string;
  title: string;
  description: string;
}) {
  return (
    <View style={styles.featureItem}>
      <Text style={styles.featureEmoji}>{emoji}</Text>
      <View style={styles.featureText}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.secondary.cream,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingVertical: 40,
  },
  logoSection: {
    alignItems: 'center',
    paddingTop: 20,
  },
  logoContainer: {
    width: 88,
    height: 88,
    borderRadius: 24,
    backgroundColor: COLORS.primary.light,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.primary.forest,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.secondary.warm,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 24,
  },
  features: {
    gap: 20,
    paddingVertical: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  featureEmoji: {
    fontSize: 28,
    width: 36,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.secondary.bark,
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: 14,
    color: COLORS.secondary.warm,
  },
  signInSection: {
    gap: 16,
  },
  errorCard: {
    marginBottom: 8,
  },
  errorText: {
    color: COLORS.system.error,
    fontSize: 14,
    textAlign: 'center',
  },
  disclaimer: {
    fontSize: 12,
    color: COLORS.neutral[400],
    textAlign: 'center',
    lineHeight: 18,
  },
});
```

---

## MAIN TAB PAGES

### app/(tabs)/index.tsx - Dashboard

```typescript
import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Plus, ChevronRight, Sparkles, Settings } from 'lucide-react-native';
import { GoalCard } from '../../components/GoalCard';
import { TaskItem } from '../../components/TaskItem';
import { TaskDetailModal } from '../../components/TaskDetailModal';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useGoalStore } from '../../store/goal';
import { useAuthStore } from '../../store/auth';
import { COLORS, SHADOWS } from '../../constants/theme';
import type { Task } from '../../types';

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const {
    currentGoal,
    tasks,
    progress,
    isLoading,
    isInitialLoad,
    fetchGoals,
    fetchGoalById,
    toggleTask,
    markTaskMissed,
  } = useGoalStore();

  const [refreshing, setRefreshing] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const currentWeek = progress?.currentWeek || 1;
  const totalWeeks = progress?.totalWeeks || 1;
  const currentWeekTasks = tasks.filter((t) => t.weekNumber === currentWeek);
  const completedCount = currentWeekTasks.filter(
    (t) => t.status === 'completed'
  ).length;
  const missedCount = currentWeekTasks.filter(
    (t) => t.status === 'missed'
  ).length;
  const totalCount = currentWeekTasks.length;
  const addressedCount = completedCount + missedCount;
  const isWeekComplete = addressedCount === totalCount && totalCount > 0;

  useFocusEffect(
    useCallback(() => {
      fetchGoals();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchGoals();
    setRefreshing(false);
  };

  const firstName = user?.displayName?.split(' ')[0] || 'there';

  // Loading skeleton
  if (isInitialLoad) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading your goals...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Empty state
  if (!currentGoal) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.header}>
            <Text style={styles.greeting}>Hi {firstName}!</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/settings')}>
              <Settings size={24} color={COLORS.secondary.bark} />
            </TouchableOpacity>
          </View>

          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Sparkles size={48} color={COLORS.primary.forest} />
            </View>
            <Text style={styles.emptyTitle}>Ready to grow?</Text>
            <Text style={styles.emptySubtitle}>
              Set your first goal and we'll create a personalized weekly plan to
              help you achieve it.
            </Text>
            <Button
              onPress={() => router.push('/onboarding/welcome')}
              icon={<Plus size={20} color={COLORS.white} />}
              iconPosition="left"
            >
              Create Your First Goal
            </Button>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hi {firstName}!</Text>
            <Text style={styles.subGreeting}>Let's make progress today</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/(tabs)/settings')}>
            <Settings size={24} color={COLORS.secondary.bark} />
          </TouchableOpacity>
        </View>

        {/* Goal Card */}
        <View style={styles.section}>
          <GoalCard
            goal={currentGoal}
            currentWeek={currentWeek}
            totalWeeks={totalWeeks}
          />
        </View>

        {/* Week Complete Banner */}
        {isWeekComplete && (
          <Card variant={missedCount > 0 ? 'default' : 'success'} style={styles.section}>
            <View style={styles.successContent}>
              <Text style={styles.successEmoji}>{missedCount > 0 ? '📋' : '🎉'}</Text>
              <View>
                <Text style={styles.successTitle}>
                  {missedCount > 0 ? 'Ready for check-in' : 'Week complete!'}
                </Text>
                <Text style={styles.successText}>
                  {missedCount > 0
                    ? `${completedCount} done, ${missedCount} missed. Time to review your week.`
                    : 'Great work this week. Ready for your check-in?'}
                </Text>
              </View>
            </View>
          </Card>
        )}

        {/* Weekly Check-in Button */}
        {isWeekComplete && (
          <View style={styles.section}>
            <Button
              onPress={() => router.push('/checkin')}
              icon={<ChevronRight size={20} color={COLORS.white} />}
            >
              Weekly Check-in
            </Button>
          </View>
        )}

        {/* This Week's Tasks */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>This Week</Text>
            <Text style={styles.sectionSubtitle}>
              {completedCount}/{totalCount} completed
            </Text>
          </View>
          <View style={styles.taskList}>
            {currentWeekTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={() => toggleTask(task.id)}
                onPress={() => setSelectedTask(task)}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Task Detail Modal */}
      <TaskDetailModal
        visible={!!selectedTask}
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onToggleComplete={() => {
          if (selectedTask) {
            toggleTask(selectedTask.id);
          }
        }}
        onMarkMissed={() => {
          if (selectedTask) {
            markTaskMissed(selectedTask.id);
          }
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.secondary.cream,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.secondary.warm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.secondary.bark,
  },
  subGreeting: {
    fontSize: 16,
    color: COLORS.secondary.warm,
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.secondary.bark,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: COLORS.secondary.warm,
  },
  taskList: {
    gap: 12,
  },
  successContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  successEmoji: {
    fontSize: 32,
  },
  successTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary.forest,
  },
  successText: {
    fontSize: 14,
    color: COLORS.secondary.warm,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingTop: 80,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.primary.light,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.secondary.bark,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: COLORS.secondary.warm,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
});
```

### app/(tabs)/settings.tsx

```typescript
import { View, Text, ScrollView, TouchableOpacity, Switch, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  User,
  Bell,
  Calendar,
  ChevronRight,
  LogOut,
  Trash2,
  Info,
  Shield,
  HelpCircle,
  Sprout,
} from 'lucide-react-native';
import { Card } from '../../components/ui/Card';
import { useAuthStore } from '../../store/auth';
import { useGoalStore } from '../../store/goal';
import { COLORS, SPACING, TYPOGRAPHY } from '../../constants/theme';

export default function SettingsScreen() {
  const router = useRouter();
  const { user, signOut } = useAuthStore();
  const { currentGoal, syncToCalendar } = useGoalStore();

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  };

  const handleSyncCalendar = async () => {
    if (!currentGoal) {
      Alert.alert('No Goal', 'Create a goal first to sync with your calendar.');
      return;
    }
    try {
      await syncToCalendar();
      Alert.alert('Success', 'Your tasks have been synced to Google Calendar!');
    } catch (error) {
      Alert.alert('Error', 'Failed to sync calendar. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>Settings</Text>

        {/* Profile Section */}
        <Card style={styles.profileCard}>
          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              <User size={28} color={COLORS.primary.forest} />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user?.displayName || 'User'}</Text>
              <Text style={styles.profileEmail}>{user?.email}</Text>
            </View>
          </View>
        </Card>

        {/* Integrations */}
        <Text style={styles.sectionTitle}>Integrations</Text>
        <Card style={styles.settingsCard}>
          <TouchableOpacity style={styles.settingRow} onPress={handleSyncCalendar}>
            <View style={styles.settingLeft}>
              <Calendar size={22} color={COLORS.primary.forest} />
              <View>
                <Text style={styles.settingLabel}>Sync to Google Calendar</Text>
                <Text style={styles.settingDescription}>
                  Add tasks to your calendar
                </Text>
              </View>
            </View>
            <ChevronRight size={20} color={COLORS.neutral[400]} />
          </TouchableOpacity>
        </Card>

        {/* Account */}
        <Text style={styles.sectionTitle}>Account</Text>
        <Card style={styles.settingsCard}>
          <TouchableOpacity style={styles.settingRow} onPress={handleSignOut}>
            <View style={styles.settingLeft}>
              <LogOut size={22} color={COLORS.system.error} />
              <Text style={[styles.settingLabel, { color: COLORS.system.error }]}>
                Sign Out
              </Text>
            </View>
          </TouchableOpacity>
        </Card>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Sprout size={24} color={COLORS.primary.sage} />
          <Text style={styles.appName}>Trellis</Text>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
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
  scrollView: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  title: {
    ...TYPOGRAPHY.h1,
    color: COLORS.secondary.bark,
    marginTop: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  profileCard: {
    marginBottom: SPACING.lg,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    color: COLORS.secondary.bark,
  },
  profileEmail: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.secondary.warm,
  },
  sectionTitle: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '600',
    color: COLORS.secondary.warm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.sm,
    marginTop: SPACING.md,
  },
  settingsCard: {
    marginBottom: SPACING.md,
    padding: 0,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.secondary.sand,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    flex: 1,
  },
  settingLabel: {
    ...TYPOGRAPHY.body,
    color: COLORS.secondary.bark,
  },
  settingDescription: {
    ...TYPOGRAPHY.caption,
    color: COLORS.secondary.warm,
    marginTop: 2,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    gap: SPACING.xs,
  },
  appName: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    color: COLORS.secondary.bark,
  },
  appVersion: {
    ...TYPOGRAPHY.caption,
    color: COLORS.secondary.warm,
  },
});
```

---

## ONBOARDING PAGES

### app/onboarding/welcome.tsx

```typescript
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Sprout, Check } from 'lucide-react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withDelay,
  FadeIn,
  FadeInUp
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS } from '../../constants/theme';

const BENEFITS = [
  'AI-powered weekly plans tailored to you',
  'Smart calendar sync keeps you on track',
  'Track progress and celebrate wins',
];

export default function WelcomeScreen() {
  const router = useRouter();
  const logoScale = useSharedValue(0.8);

  useEffect(() => {
    logoScale.value = withDelay(300, withSpring(1, { damping: 12 }));
  }, []);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
  }));

  const handleGetStarted = () => {
    router.push('./intent' as any);
  };

  const handleSkip = () => {
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo */}
        <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
          <View style={styles.logoCircle}>
            <Sprout size={48} color={COLORS.primary.forest} strokeWidth={1.5} />
          </View>
        </Animated.View>

        {/* Headline */}
        <Animated.View entering={FadeInUp.delay(400).duration(600)}>
          <Text style={styles.welcomeText}>Welcome to</Text>
          <Text style={styles.appName}>Trellis</Text>
        </Animated.View>

        {/* Value Proposition */}
        <Animated.View
          entering={FadeInUp.delay(600).duration(600)}
          style={styles.valueProposition}
        >
          <Text style={styles.tagline}>
            Turn your dreams into achievable daily actions
          </Text>
        </Animated.View>

        {/* Benefits List */}
        <Animated.View
          entering={FadeInUp.delay(800).duration(600)}
          style={styles.benefitsContainer}
        >
          {BENEFITS.map((benefit, index) => (
            <Animated.View
              key={index}
              entering={FadeIn.delay(900 + index * 150).duration(400)}
              style={styles.benefitRow}
            >
              <View style={styles.checkCircle}>
                <Check size={14} color={COLORS.white} strokeWidth={3} />
              </View>
              <Text style={styles.benefitText}>{benefit}</Text>
            </Animated.View>
          ))}
        </Animated.View>
      </View>

      {/* Footer */}
      <Animated.View
        entering={FadeInUp.delay(1200).duration(600)}
        style={styles.footer}
      >
        <Button onPress={handleGetStarted} size="lg">
          Let's Get Started
        </Button>
        <Button onPress={handleSkip} variant="ghost">
          Already have goals? Skip
        </Button>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.secondary.cream,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xxl,
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: SPACING.xl,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primary.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeText: {
    ...TYPOGRAPHY.h2,
    color: COLORS.secondary.warm,
    textAlign: 'center',
  },
  appName: {
    fontSize: 36,
    fontWeight: '700',
    color: COLORS.primary.forest,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  valueProposition: {
    marginBottom: SPACING.xl,
  },
  tagline: {
    ...TYPOGRAPHY.body,
    color: COLORS.secondary.bark,
    textAlign: 'center',
    lineHeight: 24,
  },
  benefitsContainer: {
    width: '100%',
    gap: SPACING.md,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary.forest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitText: {
    ...TYPOGRAPHY.body,
    color: COLORS.secondary.bark,
    flex: 1,
  },
  footer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    gap: SPACING.sm,
  },
});
```

### app/onboarding/intent.tsx

```typescript
import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronRight, Target, Dumbbell, TrendingUp, Palette, Sparkles } from 'lucide-react-native';
import Animated, { FadeInUp, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { StepIndicator } from '../../components/StepIndicator';
import { Button } from '../../components/ui/Button';
import { useGoalStore } from '../../store/goal';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS } from '../../constants/theme';
import type { GoalCategory } from '../../types';

const CATEGORIES = [
  {
    id: 'learning',
    icon: <Target size={24} color={COLORS.primary.forest} />,
    title: 'Learning a new skill',
    description: 'Guitar, coding, language, etc.',
  },
  {
    id: 'health',
    icon: <Dumbbell size={24} color={COLORS.primary.forest} />,
    title: 'Health & Fitness',
    description: 'Running, gym, diet, wellness',
  },
  {
    id: 'career',
    icon: <TrendingUp size={24} color={COLORS.primary.forest} />,
    title: 'Career Growth',
    description: 'Promotion, skills, networking',
  },
  {
    id: 'creative',
    icon: <Palette size={24} color={COLORS.primary.forest} />,
    title: 'Creative Project',
    description: 'Writing, art, music, design',
  },
  {
    id: 'other',
    icon: <Sparkles size={24} color={COLORS.primary.forest} />,
    title: 'Something else',
    description: 'Personal goals, habits, etc.',
  },
];

function CategoryCard({ category, isSelected, onSelect, index }) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View entering={FadeInUp.delay(200 + index * 100).duration(400)}>
      <Pressable
        onPress={onSelect}
        onPressIn={() => { scale.value = withSpring(0.98); }}
        onPressOut={() => { scale.value = withSpring(1); }}
      >
        <Animated.View
          style={[
            styles.categoryCard,
            isSelected && styles.categoryCardSelected,
            animatedStyle,
          ]}
        >
          <View style={[styles.iconContainer, isSelected && styles.iconContainerSelected]}>
            {category.icon}
          </View>
          <View style={styles.categoryContent}>
            <Text style={[styles.categoryTitle, isSelected && styles.categoryTitleSelected]}>
              {category.title}
            </Text>
            <Text style={styles.categoryDescription}>{category.description}</Text>
          </View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

export default function IntentScreen() {
  const router = useRouter();
  const { onboardingData, setOnboardingData } = useGoalStore();
  const [selectedCategory, setSelectedCategory] = useState(onboardingData.category || null);

  const handleNext = () => {
    if (selectedCategory) {
      setOnboardingData({ category: selectedCategory });
      router.push('./goal');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <StepIndicator totalSteps={6} currentStep={1} />

          <Animated.View entering={FadeInUp.delay(100).duration(500)} style={styles.header}>
            <Text style={styles.title}>What brings you to Trellis?</Text>
            <Text style={styles.subtitle}>
              This helps us personalize your experience
            </Text>
          </Animated.View>

          <View style={styles.categoriesList}>
            {CATEGORIES.map((category, index) => (
              <CategoryCard
                key={category.id}
                category={category}
                isSelected={selectedCategory === category.id}
                onSelect={() => setSelectedCategory(category.id)}
                index={index}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.backButtonWrapper}>
          <Button
            variant="ghost"
            onPress={() => router.back()}
            icon={<ChevronLeft size={20} color={COLORS.secondary.bark} />}
            iconPosition="left"
            fullWidth={false}
          >
            Back
          </Button>
        </View>
        <View style={styles.nextButtonWrapper}>
          <Button
            onPress={handleNext}
            disabled={!selectedCategory}
            icon={<ChevronRight size={20} color={COLORS.white} />}
          >
            Continue
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
  },
  header: {
    marginBottom: SPACING.lg,
  },
  title: {
    ...TYPOGRAPHY.h2,
    color: COLORS.secondary.bark,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.secondary.warm,
  },
  categoriesList: {
    gap: SPACING.md,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.secondary.sand,
    gap: SPACING.md,
  },
  categoryCardSelected: {
    borderColor: COLORS.primary.forest,
    backgroundColor: COLORS.primary.light,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.primary.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerSelected: {
    backgroundColor: COLORS.white,
  },
  categoryContent: {
    flex: 1,
  },
  categoryTitle: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    color: COLORS.secondary.bark,
    marginBottom: 2,
  },
  categoryTitleSelected: {
    color: COLORS.primary.forest,
  },
  categoryDescription: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.secondary.warm,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.secondary.sand,
    gap: SPACING.md,
  },
  backButtonWrapper: {
    flexShrink: 0,
  },
  nextButtonWrapper: {
    flex: 1,
  },
});
```

### app/onboarding/goal.tsx

```typescript
import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronRight, Lightbulb } from 'lucide-react-native';
import Animated, { FadeInUp, FadeIn } from 'react-native-reanimated';
import { StepIndicator } from '../../components/StepIndicator';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useGoalStore } from '../../store/goal';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS } from '../../constants/theme';

const SUGGESTIONS = {
  learning: ['Learn Spanish', 'Learn to code in Python', 'Play guitar', 'Learn photography'],
  health: ['Run a 5K', 'Lose 10 pounds', 'Build muscle', 'Meditate daily'],
  career: ['Get promoted', 'Learn data science', 'Build a portfolio', 'Network more'],
  creative: ['Write a novel', 'Learn to paint', 'Record an album', 'Start a blog'],
  other: ['Read 12 books', 'Save $5000', 'Learn to cook', 'Wake up at 6 AM'],
};

export default function GoalInputScreen() {
  const router = useRouter();
  const { onboardingData, setOnboardingData } = useGoalStore();
  const [goalTitle, setGoalTitle] = useState(onboardingData.title || '');
  const [description, setDescription] = useState(onboardingData.description || '');

  const category = onboardingData.category || 'other';
  const suggestions = SUGGESTIONS[category];
  const canProceed = goalTitle.trim().length >= 3;

  const handleNext = () => {
    setOnboardingData({
      title: goalTitle.trim(),
      description: description.trim(),
    });
    router.push('/onboarding/level');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          <StepIndicator totalSteps={6} currentStep={2} />

          <Animated.View entering={FadeInUp.delay(100).duration(500)} style={styles.header}>
            <Text style={styles.title}>What's your goal?</Text>
            <Text style={styles.subtitle}>
              Be specific—the clearer your goal, the better we can help you achieve it.
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(200).duration(500)}>
            <Input
              label="I want to..."
              value={goalTitle}
              onChangeText={setGoalTitle}
              placeholder="e.g., Learn to play guitar"
              autoFocus
            />
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(300).duration(500)} style={styles.descriptionInput}>
            <Input
              label="Tell us more (optional)"
              value={description}
              onChangeText={setDescription}
              placeholder="Why is this goal important to you?"
              multiline
              numberOfLines={3}
            />
          </Animated.View>

          {/* Suggestions */}
          <Animated.View entering={FadeInUp.delay(400).duration(500)} style={styles.suggestionsSection}>
            <View style={styles.suggestionsHeader}>
              <Lightbulb size={18} color={COLORS.primary.sage} />
              <Text style={styles.suggestionsTitle}>Popular goals like yours:</Text>
            </View>
            <View style={styles.suggestionsContainer}>
              {suggestions.map((suggestion, index) => (
                <Pressable
                  key={suggestion}
                  onPress={() => setGoalTitle(suggestion)}
                  style={styles.suggestionChip}
                >
                  <Text style={styles.suggestionText}>{suggestion}</Text>
                </Pressable>
              ))}
            </View>
          </Animated.View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.backButtonWrapper}>
          <Button
            variant="ghost"
            onPress={() => router.back()}
            icon={<ChevronLeft size={20} color={COLORS.secondary.bark} />}
            iconPosition="left"
            fullWidth={false}
          >
            Back
          </Button>
        </View>
        <View style={styles.nextButtonWrapper}>
          <Button
            onPress={handleNext}
            disabled={!canProceed}
            icon={<ChevronRight size={20} color={COLORS.white} />}
          >
            Continue
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
  },
  header: {
    marginBottom: SPACING.lg,
  },
  title: {
    ...TYPOGRAPHY.h2,
    color: COLORS.secondary.bark,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.secondary.warm,
    lineHeight: 24,
  },
  descriptionInput: {
    marginTop: SPACING.md,
  },
  suggestionsSection: {
    marginTop: SPACING.xl,
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.secondary.sand,
  },
  suggestionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  suggestionsTitle: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.secondary.warm,
    fontWeight: '500',
  },
  suggestionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  suggestionChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.primary.light,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.primary.mint,
  },
  suggestionText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.primary.forest,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.secondary.sand,
    gap: SPACING.md,
  },
  backButtonWrapper: {
    flexShrink: 0,
  },
  nextButtonWrapper: {
    flex: 1,
  },
});
```

### app/onboarding/success.tsx

```typescript
import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PartyPopper, Calendar, Bell, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withSequence,
  withRepeat,
  FadeIn,
  FadeInUp,
} from 'react-native-reanimated';
import { Button } from '../../components/ui/Button';
import { useGoalStore } from '../../store/goal';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS } from '../../constants/theme';

const WHAT_HAPPENS_NEXT = [
  {
    icon: <Calendar size={20} color={COLORS.primary.forest} />,
    title: 'Weekly tasks added',
    description: 'Your personalized plan is ready',
  },
  {
    icon: <Bell size={20} color={COLORS.primary.forest} />,
    title: 'Get reminders',
    description: "We'll nudge you at the right time",
  },
  {
    icon: <CheckCircle2 size={20} color={COLORS.primary.forest} />,
    title: 'Track progress',
    description: 'See your journey unfold',
  },
];

export default function SuccessScreen() {
  const router = useRouter();
  const { onboardingData, resetOnboarding } = useGoalStore();
  const goalTitle = onboardingData.title || 'your goal';

  const celebrationScale = useSharedValue(0);
  const sparkleRotation = useSharedValue(0);

  useEffect(() => {
    celebrationScale.value = withDelay(
      200,
      withSpring(1, { damping: 10, stiffness: 100 })
    );

    sparkleRotation.value = withRepeat(
      withSequence(
        withSpring(15, { damping: 10 }),
        withSpring(-15, { damping: 10 })
      ),
      -1,
      true
    );
  }, []);

  const celebrationStyle = useAnimatedStyle(() => ({
    transform: [{ scale: celebrationScale.value }],
  }));

  const sparkleStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${sparkleRotation.value}deg` }],
  }));

  const handleGoToDashboard = () => {
    resetOnboarding();
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Celebration Icon */}
        <Animated.View style={[styles.celebrationContainer, celebrationStyle]}>
          <View style={styles.celebrationCircle}>
            <PartyPopper size={48} color={COLORS.primary.forest} strokeWidth={1.5} />
          </View>
          <Animated.View style={[styles.sparkle, styles.sparkleTopRight, sparkleStyle]}>
            <Sparkles size={20} color={COLORS.primary.mint} />
          </Animated.View>
          <Animated.View style={[styles.sparkle, styles.sparkleBottomLeft, sparkleStyle]}>
            <Sparkles size={16} color={COLORS.primary.sage} />
          </Animated.View>
        </Animated.View>

        {/* Success Message */}
        <Animated.View entering={FadeInUp.delay(400).duration(600)} style={styles.messageContainer}>
          <Text style={styles.congratsText}>You're all set!</Text>
          <Text style={styles.goalText}>
            Your journey to{'\n'}
            <Text style={styles.goalHighlight}>{goalTitle}</Text>
            {'\n'}starts now
          </Text>
        </Animated.View>

        {/* What Happens Next */}
        <Animated.View entering={FadeInUp.delay(600).duration(600)} style={styles.nextStepsCard}>
          <Text style={styles.nextStepsTitle}>What happens next</Text>
          {WHAT_HAPPENS_NEXT.map((item, index) => (
            <Animated.View
              key={index}
              entering={FadeIn.delay(800 + index * 150).duration(400)}
              style={styles.nextStepRow}
            >
              <View style={styles.nextStepIcon}>{item.icon}</View>
              <View style={styles.nextStepContent}>
                <Text style={styles.nextStepTitle}>{item.title}</Text>
                <Text style={styles.nextStepDescription}>{item.description}</Text>
              </View>
            </Animated.View>
          ))}
        </Animated.View>

        {/* Quote */}
        <Animated.View entering={FadeIn.delay(1200).duration(600)} style={styles.quoteContainer}>
          <Text style={styles.quoteText}>
            "The journey of a thousand miles begins with a single step."
          </Text>
          <Text style={styles.quoteAuthor}>— Lao Tzu</Text>
        </Animated.View>
      </View>

      {/* Footer */}
      <Animated.View entering={FadeInUp.delay(1400).duration(600)} style={styles.footer}>
        <Button
          onPress={handleGoToDashboard}
          size="lg"
          icon={<ArrowRight size={20} color={COLORS.white} />}
        >
          Go to Dashboard
        </Button>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.secondary.cream,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xxl,
    alignItems: 'center',
  },
  celebrationContainer: {
    position: 'relative',
    marginBottom: SPACING.xl,
  },
  celebrationCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.primary.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparkle: {
    position: 'absolute',
  },
  sparkleTopRight: {
    top: -10,
    right: -10,
  },
  sparkleBottomLeft: {
    bottom: 0,
    left: -10,
  },
  messageContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  congratsText: {
    ...TYPOGRAPHY.h1,
    color: COLORS.primary.forest,
    marginBottom: SPACING.sm,
  },
  goalText: {
    ...TYPOGRAPHY.h3,
    color: COLORS.secondary.bark,
    textAlign: 'center',
    lineHeight: 28,
  },
  goalHighlight: {
    color: COLORS.primary.forest,
    fontWeight: '700',
  },
  nextStepsCard: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.secondary.sand,
  },
  nextStepsTitle: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '600',
    color: COLORS.secondary.warm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.md,
  },
  nextStepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  nextStepIcon: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.primary.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextStepContent: {
    flex: 1,
  },
  nextStepTitle: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    color: COLORS.secondary.bark,
    marginBottom: 2,
  },
  nextStepDescription: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.secondary.warm,
  },
  quoteContainer: {
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  quoteText: {
    ...TYPOGRAPHY.body,
    fontStyle: 'italic',
    color: COLORS.secondary.warm,
    textAlign: 'center',
    lineHeight: 24,
  },
  quoteAuthor: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.secondary.warm,
    marginTop: SPACING.xs,
  },
  footer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
  },
});
```

---

## CHECK-IN PAGES

### app/checkin/index.tsx

```typescript
import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronRight, X } from 'lucide-react-native';
import { StepIndicator } from '../../components/StepIndicator';
import { TaskStatusCard } from '../../components/TaskStatusCard';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useGoalStore } from '../../store/goal';

export default function CheckInTasksScreen() {
  const router = useRouter();
  const { currentGoal, tasks, progress } = useGoalStore();
  const [taskStatuses, setTaskStatuses] = useState({});

  const currentWeek = progress?.currentWeek || 1;
  const currentWeekTasks = tasks.filter((t) => t.weekNumber === currentWeek);

  useEffect(() => {
    const initialStatuses = {};
    currentWeekTasks.forEach((task) => {
      if (task.status === 'completed') {
        initialStatuses[task.id] = 'completed';
      }
    });
    setTaskStatuses(initialStatuses);
  }, [tasks]);

  const handleStatusChange = (taskId, status) => {
    setTaskStatuses((prev) => {
      const newStatuses = { ...prev };
      if (status === undefined) {
        delete newStatuses[taskId];
      } else {
        newStatuses[taskId] = status;
      }
      return newStatuses;
    });
  };

  const handleNext = () => {
    const taskResults = currentWeekTasks.map((task) => ({
      taskId: task.id,
      status: taskStatuses[task.id] || 'missed',
    }));

    router.push({
      pathname: '/checkin/notes',
      params: {
        taskResults: JSON.stringify(taskResults),
        weekNumber: currentWeek.toString(),
      },
    });
  };

  const completedCount = Object.values(taskStatuses).filter(
    (s) => s === 'completed'
  ).length;
  const completionRate =
    currentWeekTasks.length > 0
      ? Math.round((completedCount / currentWeekTasks.length) * 100)
      : 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <X size={24} color="#171717" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Weekly Check-in</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <StepIndicator totalSteps={2} currentStep={1} />

          <View style={styles.titleSection}>
            <Text style={styles.title}>Week {currentWeek} review</Text>
            <Text style={styles.subtitle}>
              Tap to cycle: Done → Missed → Unmarked
            </Text>
          </View>

          <View style={styles.taskList}>
            {currentWeekTasks.map((task) => (
              <TaskStatusCard
                key={task.id}
                task={task}
                status={taskStatuses[task.id]}
                onStatusChange={(status) => handleStatusChange(task.id, status)}
              />
            ))}
          </View>

          <Card style={styles.statsCard}>
            <Text style={styles.statsLabel}>Completion rate</Text>
            <Text style={styles.statsValue}>{completionRate}%</Text>
            <Text style={styles.statsSubtext}>
              {completedCount} of {currentWeekTasks.length} tasks completed
            </Text>
          </Card>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          onPress={handleNext}
          icon={<ChevronRight size={20} color="#fff" />}
        >
          Continue
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#171717',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  titleSection: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#171717',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#737373',
  },
  taskList: {
    gap: 8,
    marginBottom: 24,
  },
  statsCard: {
    backgroundColor: '#fafafa',
    borderColor: 'transparent',
  },
  statsLabel: {
    fontSize: 14,
    color: '#525252',
    marginBottom: 4,
  },
  statsValue: {
    fontSize: 32,
    fontWeight: '600',
    color: '#171717',
  },
  statsSubtext: {
    fontSize: 14,
    color: '#737373',
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
  },
});
```

### app/checkin/notes.tsx

```typescript
import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronRight, X } from 'lucide-react-native';
import { StepIndicator } from '../../components/StepIndicator';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useGoalStore } from '../../store/goal';

export default function CheckInNotesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { currentGoal, submitCheckIn, isLoading } = useGoalStore();
  const [notes, setNotes] = useState('');

  const taskResults = JSON.parse((params.taskResults as string) || '[]');
  const weekNumber = parseInt(params.weekNumber as string, 10) || 1;

  const handleSubmit = async () => {
    if (!currentGoal) return;

    try {
      await submitCheckIn(currentGoal.id, weekNumber, taskResults, notes);
      router.replace('/checkin/complete');
    } catch (error) {
      console.error('Failed to submit check-in:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <X size={24} color="#171717" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Weekly Check-in</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          <StepIndicator totalSteps={2} currentStep={2} />

          <View style={styles.titleSection}>
            <Text style={styles.title}>Any notes?</Text>
            <Text style={styles.subtitle}>
              Share what went well, what was challenging, or any adjustments
              you'd like for next week.
            </Text>
          </View>

          <Input
            value={notes}
            onChangeText={setNotes}
            placeholder="e.g., I had more energy in the mornings..."
            multiline
            numberOfLines={5}
          />

          <View style={styles.promptsSection}>
            <Text style={styles.promptsTitle}>Prompts to consider:</Text>
            <Text style={styles.promptItem}>• What worked well this week?</Text>
            <Text style={styles.promptItem}>• What made tasks difficult?</Text>
            <Text style={styles.promptItem}>• Do you need more or less time?</Text>
            <Text style={styles.promptItem}>• Any schedule changes needed?</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button variant="secondary" onPress={() => router.back()}>
          Back
        </Button>
        <View style={styles.flex}>
          <Button
            onPress={handleSubmit}
            loading={isLoading}
            icon={<ChevronRight size={20} color="#fff" />}
          >
            Submit Check-in
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#171717',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  titleSection: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#171717',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#737373',
    lineHeight: 24,
  },
  promptsSection: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#fafafa',
    borderRadius: 12,
  },
  promptsTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#525252',
    marginBottom: 8,
  },
  promptItem: {
    fontSize: 14,
    color: '#737373',
    marginBottom: 4,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
  },
  flex: {
    flex: 1,
  },
});
```

### app/checkin/complete.tsx

```typescript
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CheckCircle, ArrowRight } from 'lucide-react-native';
import { Button } from '../../components/ui/Button';
import { useGoalStore } from '../../store/goal';

export default function CheckInCompleteScreen() {
  const router = useRouter();
  const { progress } = useGoalStore();

  const handleDone = () => {
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <CheckCircle size={64} color="#16a34a" />
        </View>

        <Text style={styles.title}>Check-in complete!</Text>
        <Text style={styles.subtitle}>
          Great job reflecting on your week. Your plan has been adjusted based
          on your feedback.
        </Text>

        <View style={styles.statsCard}>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Week completed</Text>
            <Text style={styles.statValue}>{progress?.currentWeek || 1}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Overall progress</Text>
            <Text style={styles.statValue}>
              {Math.round((progress?.completionRate || 0) * 100)}%
            </Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>What's next?</Text>
          <Text style={styles.infoText}>
            Your schedule for next week has been updated based on your progress.
            Check out your new tasks on the dashboard.
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          onPress={handleDone}
          icon={<ArrowRight size={20} color="#fff" />}
        >
          Back to Dashboard
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#171717',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#737373',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    maxWidth: 300,
  },
  statsCard: {
    width: '100%',
    backgroundColor: '#fafafa',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 16,
    color: '#525252',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '600',
    color: '#171717',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e5e5',
    marginVertical: 16,
  },
  infoCard: {
    width: '100%',
    backgroundColor: '#f0fdf4',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#14532d',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#15803d',
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
});
```

---

## END OF EXPORT

This document contains the complete frontend design code for:
- Theme & design system
- 3 UI components (Button, Card, Input)
- 5 feature components (GoalCard, TaskItem, TaskDetailModal, StepIndicator, TaskStatusCard)
- 1 auth page (Login)
- 3 main tab pages (Dashboard, Calendar, Settings)
- 6 onboarding pages (Welcome, Intent, Goal, Level, Timeline, Availability, Success)
- 3 check-in pages (Tasks, Notes, Complete)
