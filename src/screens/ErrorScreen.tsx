import React from 'react';
import { Pressable, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ColorPalette } from '../theme/colors';
import { ScreenBackground } from '../components/ScreenBackground';
import { useThemedStyles } from '../hooks/useThemedStyles';

type Props = {
  message: string;
  onRetry: () => void;
};

const createStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: 24,
      justifyContent: 'center',
    },
    card: {
      backgroundColor: colors.surface,
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
      marginBottom: 4,
      color: colors.text,
    },
    body: {
      fontSize: 14,
      color: colors.heading,
      lineHeight: 20,
    },
    primaryButton: {
      backgroundColor: colors.primary,
      paddingVertical: 12,
      borderRadius: 10,
      alignItems: 'center',
      marginTop: 6,
    },
    primaryButtonText: {
      color: colors.white,
      fontWeight: '700',
    },
  });

export function ErrorScreen({ message, onRetry }: Props) {
  const styles = useThemedStyles(createStyles);
  return (
    <SafeAreaView style={styles.container}>
      <ScreenBackground />
      <StatusBar barStyle="dark-content" />
      <View style={styles.card}>
        <Text style={styles.title}>Connection issue</Text>
        <Text style={styles.body}>{message}</Text>
        <Pressable style={styles.primaryButton} onPress={onRetry}>
          <Text style={styles.primaryButtonText}>Retry</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
