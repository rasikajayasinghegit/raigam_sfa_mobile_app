import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import {
  CheckCircle,
  WarningCircle,
  Info,
  XCircle,
} from 'phosphor-react-native';
import { ColorPalette } from '../theme/colors';
import { useThemedStyles } from '../hooks/useThemedStyles';
import { useThemeMode } from '../context/ThemeContext';

type Variant = 'info' | 'success' | 'warning' | 'error';

type Props = {
  variant: Variant;
  title?: string;
  message: string;
  onPress?: () => void;
};

const getVariantTokens = (colors: ColorPalette) =>
  ({
    info: {
      Icon: Info,
      iconColor: colors.primaryDark,
      bg: colors.primarySoft,
      border: colors.borderInfo,
      text: colors.text,
    },
    success: {
      Icon: CheckCircle,
      iconColor: colors.success,
      bg: colors.successSoft,
      border: colors.borderSuccess,
      text: colors.text,
    },
    warning: {
      Icon: WarningCircle,
      iconColor: colors.warning,
      bg: colors.warningSoft,
      border: colors.borderWarning,
      text: colors.text,
    },
    error: {
      Icon: XCircle,
      iconColor: colors.danger,
      bg: colors.dangerSoft,
      border: colors.borderDanger,
      text: colors.text,
    },
  }) as const;

const createStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      borderRadius: 14,
      borderWidth: 1,
      padding: 12,
      gap: 10,
    },
    icon: {
      width: 28,
      alignItems: 'center',
      paddingTop: 2,
    },
    texts: {
      flex: 1,
      gap: 2,
    },
    title: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.text,
    },
    message: {
      fontSize: 14,
      color: colors.textMuted,
    },
  });

export function StatusAlert({ variant, title, message, onPress }: Props) {
  const { colors } = useThemeMode();
  const styles = useThemedStyles(createStyles);
  const theme = getVariantTokens(colors)[variant];
  const Icon = theme.Icon;
  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.85 : 1}
      onPress={onPress}
      style={[
        styles.container,
        {
          backgroundColor: theme.bg,
          borderColor: theme.border,
        },
      ]}
    >
      <View style={styles.icon}>
        <Icon size={22} color={theme.iconColor} weight="duotone" />
      </View>
      <View style={styles.texts}>
        {title ? <Text style={[styles.title, { color: theme.text }]}>{title}</Text> : null}
        <Text style={[styles.message, { color: theme.text }]}>{message}</Text>
      </View>
    </TouchableOpacity>
  );
}
