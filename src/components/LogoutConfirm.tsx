import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SignOut } from 'phosphor-react-native';
import { colors } from '../theme/colors';

type Props = {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function LogoutConfirm({ visible, onConfirm, onCancel }: Props) {
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
            <TouchableOpacity style={[styles.button, styles.secondary]} onPress={onCancel}>
              <Text style={styles.secondaryText}>Stay</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.primary]} onPress={onConfirm}>
              <Text style={styles.primaryText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
});
