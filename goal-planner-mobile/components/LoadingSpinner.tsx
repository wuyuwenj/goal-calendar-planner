import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { Sprout } from 'lucide-react-native';
import { COLORS } from '../constants/theme';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'large';
  variant?: 'default' | 'branded';
}

export function LoadingSpinner({
  message,
  size = 'large',
  variant = 'default',
}: LoadingSpinnerProps) {
  return (
    <View style={styles.container}>
      {variant === 'branded' ? (
        <View style={styles.brandedContainer}>
          <View style={styles.iconContainer}>
            <Sprout size={32} color={COLORS.primary.forest} />
          </View>
          <ActivityIndicator size={size} color={COLORS.primary.sage} />
        </View>
      ) : (
        <ActivityIndicator size={size} color={COLORS.primary.forest} />
      )}
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: COLORS.secondary.cream,
  },
  brandedContainer: {
    alignItems: 'center',
    gap: 16,
  },
  iconContainer: {
    padding: 16,
    backgroundColor: COLORS.primary.light,
    borderRadius: 20,
    marginBottom: 8,
  },
  message: {
    marginTop: 16,
    color: COLORS.secondary.warm,
    textAlign: 'center',
    fontSize: 16,
  },
});
