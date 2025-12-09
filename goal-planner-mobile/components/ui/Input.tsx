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
