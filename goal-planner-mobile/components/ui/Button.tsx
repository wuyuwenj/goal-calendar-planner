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
    minHeight: 48, // Accessibility: minimum touch target
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
