import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { COLORS } from '../../constants/theme';

interface ProgressBarProps {
  progress: number; // 0-100
  height?: number;
  variant?: 'default' | 'light' | 'gradient';
  showAnimation?: boolean;
  backgroundColor?: string;
  progressColor?: string;
}

export function ProgressBar({
  progress,
  height = 8,
  variant = 'default',
  backgroundColor,
  progressColor,
}: ProgressBarProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  const getBackgroundColor = () => {
    if (backgroundColor) return backgroundColor;
    switch (variant) {
      case 'light':
        return 'rgba(255, 255, 255, 0.2)';
      case 'gradient':
        return COLORS.secondary.sand;
      default:
        return COLORS.secondary.sand;
    }
  };

  const getProgressColor = () => {
    if (progressColor) return progressColor;
    switch (variant) {
      case 'light':
        return COLORS.white;
      case 'gradient':
        // For gradient effect, we use mint for low progress, forest for high
        return clampedProgress > 50 ? COLORS.primary.forest : COLORS.primary.mint;
      default:
        return COLORS.primary.forest;
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          height,
          backgroundColor: getBackgroundColor(),
        },
      ]}
    >
      <View
        style={[
          styles.progress,
          {
            width: `${clampedProgress}%`,
            backgroundColor: getProgressColor(),
          },
        ]}
      />
    </View>
  );
}

// Animated version for smoother transitions
interface AnimatedProgressBarProps extends ProgressBarProps {
  duration?: number;
}

export function AnimatedProgressBar({
  progress,
  height = 8,
  variant = 'default',
  duration = 500,
  backgroundColor,
  progressColor,
}: AnimatedProgressBarProps) {
  const animatedWidth = React.useRef(new Animated.Value(0)).current;
  const clampedProgress = Math.min(100, Math.max(0, progress));

  React.useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: clampedProgress,
      duration,
      useNativeDriver: false,
    }).start();
  }, [clampedProgress, duration]);

  const getBackgroundColor = () => {
    if (backgroundColor) return backgroundColor;
    switch (variant) {
      case 'light':
        return 'rgba(255, 255, 255, 0.2)';
      default:
        return COLORS.secondary.sand;
    }
  };

  const getProgressColor = () => {
    if (progressColor) return progressColor;
    switch (variant) {
      case 'light':
        return COLORS.white;
      default:
        return COLORS.primary.forest;
    }
  };

  const widthInterpolation = animatedWidth.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View
      style={[
        styles.container,
        {
          height,
          backgroundColor: getBackgroundColor(),
        },
      ]}
    >
      <Animated.View
        style={[
          styles.progress,
          {
            width: widthInterpolation,
            backgroundColor: getProgressColor(),
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 100,
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
    borderRadius: 100,
  },
});
