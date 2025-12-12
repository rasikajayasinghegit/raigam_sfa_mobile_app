import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SignOut } from 'phosphor-react-native';
import { ColorPalette } from '../theme/colors';
import { useToast } from '../context/ToastContext';
import { useThemeMode } from '../context/ThemeContext';
import { useThemedStyles } from '../hooks/useThemedStyles';

type Props = {
  visible: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
};

const createStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: colors.overlay,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    },
    card: {
      width: '100%',
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      alignItems: 'center',
      gap: 8,
    },
    iconWrap: {
      width: 54,
      height: 54,
      borderRadius: 18,
      backgroundColor: colors.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginTop: 4,
    },
    subtitle: {
      fontSize: 14,
      color: colors.textMuted,
      textAlign: 'center',
    },
    actions: {
      marginTop: 12,
      flexDirection: 'row',
      gap: 12,
      width: '100%',
    },
    button: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 12,
      alignItems: 'center',
    },
    primary: {
      backgroundColor: colors.primary,
    },
    primaryText: {
      color: colors.white,
      fontWeight: '700',
      fontSize: 15,
    },
    secondary: {
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    secondaryText: {
      color: colors.text,
      fontWeight: '700',
      fontSize: 15,
    },
    disabled: {
      opacity: 0.6,
    },
  });

export function LogoutConfirm({ visible, onConfirm, onCancel }: Props) {
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const { colors } = useThemeMode();
  const styles = useThemedStyles(createStyles);

  const handleConfirm = async () => {
    if (!onConfirm || submitting) return;
    try {
      setSubmitting(true);
      await onConfirm();
      showToast({
        title: 'Signed out',
        message: 'You have been logged out.',
        variant: 'info',
      });
    } catch (err: any) {
      showToast({
        title: 'Logout failed',
        message: err?.message || 'Unable to sign out right now.',
        variant: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.iconWrap}>
            <SignOut size={28} color={colors.primary} weight="bold" />
          </View>
          <Text style={styles.title}>Sign out?</Text>
          <Text style={styles.subtitle}>You will need to log in again to continue.</Text>
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, styles.secondary, submitting && styles.disabled]}
              onPress={onCancel}
              disabled={submitting}
            >
              <Text style={styles.secondaryText}>Stay</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.primary, submitting && styles.disabled]}
              onPress={handleConfirm}
              disabled={submitting}
            >
              <Text style={styles.primaryText}>{submitting ? 'Logging out...' : 'Logout'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
