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
