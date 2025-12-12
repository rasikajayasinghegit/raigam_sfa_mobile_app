import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ColorPalette } from '../theme/colors';
import { useThemedStyles } from '../hooks/useThemedStyles';

type Props = {
  progress: number; // 0..1
};

export function ProgressBar({ progress }: Props) {
  const clamped = Math.max(0, Math.min(1, progress));
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.track}>
      <View style={[styles.bar, { width: `${Math.floor(clamped * 100)}%` }]} />
    </View>
  );
}

const createStyles = (colors: ColorPalette) =>
  StyleSheet.create({
  track: {
    height: 10,
    backgroundColor: colors.border,
    borderRadius: 999,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  });
