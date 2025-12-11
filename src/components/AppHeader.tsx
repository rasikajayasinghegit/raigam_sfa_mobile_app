import React, { ReactNode } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, SignOut } from 'phosphor-react-native';
import { colors } from '../theme/colors';

type Props = {
  title: string;
  onBack?: () => void;
  hideBack?: boolean;
  rightIcon?: ReactNode;
  onRightPress?: () => void;
};

// Reusable top header with centered title and optional actions
export function AppHeader({ title, onBack, hideBack, rightIcon, onRightPress }: Props) {
  const insets = useSafeAreaInsets();

  const Left = hideBack ? (
    <View style={styles.iconPlaceholder} />
  ) : (
    <TouchableOpacity
      onPress={onBack}
      disabled={!onBack}
      style={[styles.iconButton, !onBack && styles.iconDisabled]}
      activeOpacity={0.7}
    >
      <ArrowLeft size={22} color={colors.text} weight="regular" />
    </TouchableOpacity>
  );

  const Right = (
    <TouchableOpacity
      onPress={onRightPress}
      disabled={!onRightPress}
      style={[styles.iconButton, !onRightPress && styles.iconDisabled]}
      activeOpacity={0.7}
    >
      {rightIcon ? rightIcon : <SignOut size={22} color={colors.text} weight="regular" />}
    </TouchableOpacity>
  );

  const paddingTop = Math.max(6, insets.top);
  const paddingBottom = 6;

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop,
          paddingBottom,
        },
      ]}
    >
      {Left}
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      {Right}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: colors.card,
  },
  title: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f6f7fb',
  },
  iconDisabled: {
    opacity: 0.6,
  },
  iconPlaceholder: {
    width: 44,
    height: 44,
  },
});
