import React from 'react';
import { StyleSheet, View } from 'react-native';

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
    backgroundColor: '#e5e7eb',
    borderRadius: 999,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    backgroundColor: '#2563eb',
  },
});
