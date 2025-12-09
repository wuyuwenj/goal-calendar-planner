import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Check } from 'lucide-react-native';
import { COLORS } from '../../constants/theme';

interface CheckboxProps {
  checked: boolean;
  onToggle: () => void;
  variant?: 'default' | 'success' | 'error';
  size?: number;
}

export function Checkbox({
  checked,
  onToggle,
  variant = 'default',
  size = 22,
}: CheckboxProps) {
  const getBackgroundColor = () => {
    if (!checked) return 'transparent';
    if (variant === 'success') return COLORS.primary.sage;
    return COLORS.primary.forest;
  };

  const getBorderColor = () => {
    if (checked) {
      if (variant === 'success') return COLORS.primary.sage;
      return COLORS.primary.forest;
    }
    if (variant === 'error') return COLORS.red[200];
    return COLORS.secondary.sand;
  };

  return (
    <TouchableOpacity
      onPress={onToggle}
      style={[
        styles.checkbox,
        {
          width: size,
          height: size,
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
        },
      ]}
      activeOpacity={0.7}
      // Accessibility: ensure minimum touch target
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      {checked && <Check size={size - 8} color={COLORS.white} strokeWidth={3} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  checkbox: {
    borderWidth: 2,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
