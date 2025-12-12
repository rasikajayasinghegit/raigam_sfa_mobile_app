import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import {
  CheckCircle,
  WarningCircle,
  Info,
  XCircle,
} from 'phosphor-react-native';
import { colors } from '../theme/colors';

type Variant = 'info' | 'success' | 'warning' | 'error';

type Props = {
  variant: Variant;
  title?: string;
  message: string;
  onPress?: () => void;
};

const palette: Record<
  Variant,
  {
    Icon: typeof Info;
    iconColor: string;
    bg: string;
    border: string;
    text: string;
  }
> = {
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
};

export function StatusAlert({ variant, title, message, onPress }: Props) {
  const theme = palette[variant];
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

const styles = StyleSheet.create({
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
