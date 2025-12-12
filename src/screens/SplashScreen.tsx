import React, { useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Logo } from '../components/Logo';
import { ProgressBar } from '../components/ProgressBar';
import { PULSE_DURATION_MS } from '../config/appConfig';
import { ColorPalette } from '../theme/colors';
import { ScreenBackground } from '../components/ScreenBackground';
import { useThemeMode } from '../context/ThemeContext';
import { useThemedStyles } from '../hooks/useThemedStyles';

type Props = {
  title?: string;
  subtitle?: string;
  statusMessage: string;
  progress: number;
  appVersion: string;
};

export function SplashScreen({
  title = 'Raigam SFA',
  subtitle = 'Preparing your workspace…',
  statusMessage,
  progress,
  appVersion,
}: Props) {
  const pulse = useRef(new Animated.Value(0)).current;
  const { colors } = useThemeMode();
  const styles = useThemedStyles(createStyles);

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: PULSE_DURATION_MS / 2,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: PULSE_DURATION_MS / 2,
          useNativeDriver: true,
          easing: Easing.in(Easing.ease),
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [pulse]);

  return (
    <SafeAreaView style={styles.container}>
      <ScreenBackground />
      <StatusBar barStyle="dark-content" />
      <View style={styles.centerContent}>
        <Animated.View
          style={[
            styles.logoWrapper,
            {
              transform: [
                {
                  scale: pulse.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.08],
                  }),
                },
              ],
            },
          ]}
        >
          <Logo />
        </Animated.View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
        <Text style={styles.version}>Version {appVersion}</Text>
        <ActivityIndicator size="large" color={colors.primary} style={styles.spinner} />
      </View>
      <View style={styles.progressWrapper}>
        <ProgressBar progress={progress} />
        <Text style={styles.progressLabel}>{statusMessage}</Text>
        <Text style={styles.progressHint}>Checking version and configuration</Text>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (colors: ColorPalette) =>
  StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 24,
    justifyContent: 'center',
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  logoWrapper: {
    width: 160,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    color: colors.text,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  version: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 12,
  },
  spinner: {
    marginTop: 12,
  },
  progressWrapper: {
    marginTop: 'auto',
  },
  progressLabel: {
    marginTop: 8,
    color: colors.text,
    fontWeight: '600',
  },
  progressHint: {
    color: colors.textMuted,
    marginTop: 2,
    fontSize: 12,
  },
  });
