import React from 'react';
import { Pressable, SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { ProgressBar } from '../components/ProgressBar';
import { colors } from '../theme/colors';
import { ScreenBackground } from '../components/ScreenBackground';

type Props = {
  latestVersion: string;
  message: string;
  onUpdate: () => void;
  onRetry: () => void;
};

export function UpdateRequiredScreen({ latestVersion, message, onUpdate, onRetry }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <ScreenBackground />
      <StatusBar barStyle="dark-content" />
      <View style={styles.card}>
        <Text style={styles.title}>Update required</Text>
        <Text style={styles.body}>
          A newer build is available ({latestVersion}). Please update to continue.
        </Text>
        <Text style={[styles.body, styles.muted]}>{message}</Text>
        <Pressable style={styles.primaryButton} onPress={onUpdate}>
          <Text style={styles.primaryButtonText}>Update now</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={onRetry}>
          <Text style={styles.secondaryButtonText}>Retry check</Text>
        </Pressable>
      </View>
      <View style={styles.bottomMeta}>
        <ProgressBar progress={1} />
        <Text style={styles.progressHint}>Version gate active</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 24,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 24,
    shadowColor: colors.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  body: {
    fontSize: 14,
    color: '#1f2937',
    lineHeight: 20,
    marginTop: 6,
  },
  muted: {
    color: colors.textMuted,
    marginTop: 4,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 6,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  secondaryButton: {
    borderColor: '#cbd5e1',
    borderWidth: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: colors.card,
    marginTop: 8,
  },
  secondaryButtonText: {
    color: '#111827',
    fontWeight: '600',
  },
  bottomMeta: {
    marginTop: 20,
  },
  progressHint: {
    color: colors.textMuted,
    marginTop: 6,
    fontSize: 12,
  },
});
