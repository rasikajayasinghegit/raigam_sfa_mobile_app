import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { ColorPalette } from '../theme/colors';
import { useThemedStyles } from '../hooks/useThemedStyles';
import { useThemeMode } from '../context/ThemeContext';

type Props = {
  label: string;
  icon: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  iconBackgroundColor?: string;
};

const createStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    card: {
      flexBasis: '48%',
      backgroundColor: colors.surface,
      borderRadius: 14,
      padding: 14,
      shadowColor: colors.shadow,
      shadowOpacity: 0.05,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 3 },
      elevation: 2,
      alignItems: 'flex-start',
      gap: 8,
    },
    icon: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    label: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
    },
  });

export function QuickActionCard({
  label,
  icon,
  onPress,
  style,
  iconBackgroundColor,
}: Props) {
  const { colors } = useThemeMode();
  const styles = useThemedStyles(createStyles);

  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.85 : 1}
      onPress={onPress}
      style={[styles.card, style]}
    >
      <View
        style={[
          styles.icon,
          { backgroundColor: iconBackgroundColor ?? colors.primarySoft },
        ]}
      >
        {icon}
      </View>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
}
