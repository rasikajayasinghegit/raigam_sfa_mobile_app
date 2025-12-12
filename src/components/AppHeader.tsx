import React, { ReactNode } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMemo } from 'react';
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

// Reusable top header with centered title and optional actions
const createStyles = (palette: ColorPalette) =>
  StyleSheet.create({
    safeArea: {
      backgroundColor: palette.surface,
    },
    container: {
      position: 'relative',
      minHeight: 40,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 18,
      paddingVertical: 8,
      backgroundColor: palette.surface,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: palette.divider,
    },
    titleWrapper: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      paddingHorizontal: 80,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      fontSize: 16,
      fontWeight: '700',
      color: palette.text,
      textAlign: 'center',
      backgroundColor: 'transparent',
    },
    actions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    iconButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: palette.surfaceAlt,
    },
    iconDisabled: {
      opacity: 0.6,
    },
    iconPlaceholder: {
      width: 44,
      height: 44,
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

  const finalRightIcon = useMemo(
    () =>
      rightIcon ? (
        rightIcon
      ) : (
        <SignOut size={22} color={colors.text} weight="regular" />
      ),
    [rightIcon, colors.text],
  );

  const renderAction = React.useCallback(
    (icon: ReactNode, handler?: () => void) => (
      <TouchableOpacity
        onPress={handler}
        disabled={!handler}
        style={[styles.iconButton, !handler && styles.iconDisabled]}
        activeOpacity={0.7}
      >
        {icon}
      </TouchableOpacity>
    ),
    [styles.iconButton, styles.iconDisabled],
  );

  const Right = useMemo(() => {
    if (secondaryRightIcon || onRightPress || rightIcon) {
      return (
        <View style={styles.actions}>
          {secondaryRightIcon
            ? renderAction(secondaryRightIcon, onSecondaryRightPress)
            : null}
          {renderAction(finalRightIcon, onRightPress)}
        </View>
      );
    }
    return <View style={styles.iconPlaceholder} />;
  }, [
    styles.actions,
    styles.iconPlaceholder,
    secondaryRightIcon,
    onSecondaryRightPress,
    finalRightIcon,
    onRightPress,
    renderAction,
    rightIcon,
  ]);

  const paddingBottom = 6;

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View
        style={[
          styles.container,
          {
            paddingBottom,
          },
        ]}
      >
        {Left}
        {Right}
        <View pointerEvents="none" style={styles.titleWrapper}>
          <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
            {title}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
