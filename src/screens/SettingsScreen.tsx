import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppHeader } from '../components/AppHeader';
import { ScreenBackground } from '../components/ScreenBackground';
import { LogoutConfirm } from '../components/LogoutConfirm';
import { ColorPalette, ThemeMode } from '../theme/colors';
import { LoginPayload } from '../services/auth';
import { RootStackParamList } from '../navigation/types';
import { useThemeMode } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { useThemedStyles } from '../hooks/useThemedStyles';

type Props = {
  user: LoginPayload;
  onLogout: () => Promise<void>;
};

export function SettingsScreen({ user, onLogout }: Props) {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [showLogout, setShowLogout] = useState(false);
  const { mode, setMode, colors } = useThemeMode();
  const { showToast } = useToast();
  const styles = useThemedStyles(createStyles);
  const notificationsEnabled = false;
  const biometricsEnabled = false;

  const profileName = user.personalName || user.userName;

  return (
    <SafeAreaView style={styles.container}>
      <ScreenBackground />
      <AppHeader
        title="Settings"
        onBack={() => navigation.goBack()}
        onRightPress={() => setShowLogout(true)}
      />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Name</Text>
            <Text style={styles.infoValue}>{profileName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>User ID</Text>
            <Text style={styles.infoValue}>{user.userId}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Territory</Text>
            <Text style={styles.infoValue}>
              {user.territoryName || 'Not assigned'}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.themeHeader}>
            <View>
              <Text style={styles.toggleTitle}>Appearance</Text>
              <Text style={styles.toggleSubtitle}>
                Choose a light or dark experience.
              </Text>
            </View>
            <View style={styles.themeOptions}>
              {(['light', 'dark'] as ThemeMode[]).map(option => {
                const isActive = mode === option;
                return (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.themeOption,
                      isActive && styles.themeOptionActive,
                    ]}
                    activeOpacity={0.85}
                    onPress={() => {
                      if (mode === option) return;
                      setMode(option);
                      showToast({
                        title: 'Appearance updated',
                        message:
                          option === 'light'
                            ? 'Light mode enabled'
                            : 'Dark mode enabled',
                        variant: 'info',
                      });
                    }}
                  >
                    <Text
                      style={[
                        styles.themeOptionText,
                        isActive && styles.themeOptionTextActive,
                      ]}
                    >
                      {option === 'light' ? 'Light' : 'Dark'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
          <View style={styles.toggleRow}>
            <View>
              <Text style={styles.toggleTitle}>Push notifications</Text>
              <Text style={styles.toggleSubtitle}>
                Receive reminders for day cycle actions (coming soon).
              </Text>
            </View>
            <Switch
              value={notificationsEnabled}
              thumbColor={notificationsEnabled ? colors.primary : colors.white}
              trackColor={{
                true: colors.primarySoft,
                false: colors.borderMuted,
              }}
              disabled
            />
          </View>
          <View style={styles.toggleRow}>
            <View>
              <Text style={styles.toggleTitle}>Biometric login</Text>
              <Text style={styles.toggleSubtitle}>
                Use device biometrics where supported (coming soon).
              </Text>
            </View>
            <Switch
              value={biometricsEnabled}
              thumbColor={biometricsEnabled ? colors.primary : colors.white}
              trackColor={{
                true: colors.primarySoft,
                false: colors.borderMuted,
              }}
              disabled
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <Text style={styles.supportText}>
            For assistance contact your supervisor or support@raigamsfa.com.
          </Text>
        </View>

      </ScrollView>
      <LogoutConfirm
        visible={showLogout}
        onConfirm={async () => {
          setShowLogout(false);
          await onLogout();
        }}
        onCancel={() => setShowLogout(false)}
      />
    </SafeAreaView>
  );
}

const createStyles = (colors: ColorPalette) =>
  StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    padding: 20,
    gap: 16,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    gap: 12,
    shadowColor: colors.shadow,
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  infoLabel: {
    color: colors.textMuted,
    fontSize: 14,
  },
  infoValue: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  themeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  themeOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  themeOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
  },
  themeOptionActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  themeOptionText: {
    color: colors.textMuted,
    fontWeight: '600',
    fontSize: 13,
  },
  themeOptionTextActive: {
    color: colors.primary,
  },
  toggleTitle: {
    color: colors.text,
    fontWeight: '600',
  },
  toggleSubtitle: {
    color: colors.textMuted,
    fontSize: 12,
  },
  supportText: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  });
