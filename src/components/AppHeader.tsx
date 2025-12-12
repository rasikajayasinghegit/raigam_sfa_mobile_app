import React, { ReactNode, useCallback, useMemo } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  useSafeAreaInsets,
  initialWindowMetrics,
} from 'react-native-safe-area-context';
import { ArrowLeft, SignOut } from 'phosphor-react-native';
import { ColorPalette } from '../theme/colors';
import { useThemeMode } from '../context/ThemeContext';
import { useThemedStyles } from '../hooks/useThemedStyles';

type Props = {
  title: string;
  onBack?: () => void;
  hideBack?: boolean;
  rightIcon?: ReactNode;
  onRightPress?: () => void;
  secondaryRightIcon?: ReactNode;
  onSecondaryRightPress?: () => void;
};

const SIDE_WIDTH = 104;
const ICON_SIZE = 22;

const createStyles = (palette: ColorPalette) =>
  StyleSheet.create({
    shell: {
      backgroundColor: palette.surface,
      borderBottomColor: palette.divider,
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
    bar: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 10,
      minHeight: 56,
    },
    titleWrapper: {
      flex: 1,
      paddingHorizontal: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      fontSize: 17,
      fontWeight: '700',
      color: palette.text,
      textAlign: 'center',
    },
    side: {
      minWidth: SIDE_WIDTH,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'flex-start',
    },
    sideRight: {
      justifyContent: 'flex-end',
    },
    actions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    iconButton: {
      width: 42,
      height: 42,
      borderRadius: 21,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: palette.surfaceAlt,
    },
    iconDisabled: {
      opacity: 0.55,
    },
    iconPlaceholder: {
      width: 42,
      height: 42,
      borderRadius: 21,
    },
  });

export function AppHeader({
  title,
  onBack,
  hideBack,
  rightIcon,
  onRightPress,
  secondaryRightIcon,
  onSecondaryRightPress,
}: Props) {
  const { colors } = useThemeMode();
  const styles = useThemedStyles(createStyles);
  const insets = useSafeAreaInsets();
  const topInset = Math.max(insets.top, initialWindowMetrics?.insets.top ?? 0);

  const renderIconButton = useCallback(
    (icon: ReactNode, handler?: () => void) => (
      <TouchableOpacity
        onPress={handler}
        disabled={!handler}
        style={[styles.iconButton, !handler && styles.iconDisabled]}
        activeOpacity={0.85}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        {icon}
      </TouchableOpacity>
    ),
    [styles.iconButton, styles.iconDisabled],
  );

  const LeftAction = hideBack
    ? null
    : renderIconButton(
        <ArrowLeft size={ICON_SIZE} color={colors.text} weight="regular" />,
        onBack,
      );

  const finalRightIcon = useMemo(
    () =>
      rightIcon ? (
        rightIcon
      ) : (
        <SignOut size={ICON_SIZE} color={colors.text} weight="regular" />
      ),
    [rightIcon, colors.text],
  );

  const RightActions = useMemo(() => {
    if (!secondaryRightIcon && !rightIcon && !onRightPress) {
      return null;
    }
    return (
      <View style={styles.actions}>
        {secondaryRightIcon
          ? renderIconButton(secondaryRightIcon, onSecondaryRightPress)
          : null}
        {renderIconButton(finalRightIcon, onRightPress)}
      </View>
    );
  }, [
    finalRightIcon,
    onRightPress,
    renderIconButton,
    rightIcon,
    secondaryRightIcon,
    onSecondaryRightPress,
    styles.actions,
  ]);

  return (
    <SafeAreaView style={[styles.shell, { paddingTop: topInset }]}>
      <View style={styles.bar}>
        <View style={styles.side}>
          {LeftAction || <View style={styles.iconPlaceholder} />}
        </View>
        <View pointerEvents="none" style={styles.titleWrapper}>
          <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
            {title}
          </Text>
        </View>
        <View style={[styles.side, styles.sideRight]}>
          {RightActions || <View style={styles.iconPlaceholder} />}
        </View>
      </View>
    </SafeAreaView>
  );
}
