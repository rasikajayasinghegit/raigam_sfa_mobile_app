import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '../theme/colors';

type Props = {
  progress: number; // 0..1
};

export function ProgressBar({ progress }: Props) {
  const clamped = Math.max(0, Math.min(1, progress));
  return (
    <View style={styles.track}>
      <View style={[styles.bar, { width: `${Math.floor(clamped * 100)}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
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
