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
  { icon: React.ReactNode; bg: string; border: string; text: string }
> = {
  info: {
    icon: <Info size={22} color="#1d4ed8" weight="duotone" />,
    bg: '#e5f1ff',
    border: '#c7e3ff',
    text: '#0f172a',
  },
  success: {
    icon: <CheckCircle size={22} color="#15803d" weight="duotone" />,
    bg: '#ecfdf3',
    border: '#bbf7d0',
    text: '#0f172a',
  },
  warning: {
    icon: <WarningCircle size={22} color="#b45309" weight="duotone" />,
    bg: '#fff7ed',
    border: '#fed7aa',
    text: '#0f172a',
  },
  error: {
    icon: <XCircle size={22} color="#b91c1c" weight="duotone" />,
    bg: '#fef2f2',
    border: '#fecdd3',
    text: '#0f172a',
  },
};

export function StatusAlert({ variant, title, message, onPress }: Props) {
  const theme = palette[variant];
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
      <View style={styles.icon}>{theme.icon}</View>
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
