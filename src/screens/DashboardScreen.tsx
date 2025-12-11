import React, { useMemo, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import {
  HandWaving,
  Target,
  ClipboardText,
  Storefront,
  Receipt,
} from 'phosphor-react-native';
import { LoginPayload } from '../services/auth';
import { colors } from '../theme/colors';
import { AppHeader } from '../components/AppHeader';
import { DayCycleState } from '../services/dayCycle';
import { DayStatus } from '../hooks/useDayCycle';
import { ScreenBackground } from '../components/ScreenBackground';

type Props = {
  user: LoginPayload;
  onLogout: () => Promise<void>;
  loading: boolean;
  dayState: DayCycleState | null;
  dayStatus: DayStatus;
  dayLoading: boolean;
  onStartDay: () => Promise<void>;
  onEndDay: () => Promise<void>;
};

export function DashboardScreen({
  user,
  onLogout,
  loading,
  dayState,
  dayStatus,
  dayLoading,
  onStartDay,
  onEndDay,
}: Props) {
  const [dayMessage, setDayMessage] = useState<string | null>(null);

  const quickActions = [
    { label: 'Welcome', icon: <HandWaving size={24} color={colors.text} weight="regular" /> },
    { label: 'Target', icon: <Target size={24} color={colors.text} weight="regular" /> },
    { label: 'PC Target', icon: <ClipboardText size={24} color={colors.text} weight="regular" /> },
    { label: 'Outlets', icon: <Storefront size={24} color={colors.text} weight="regular" /> },
    { label: 'Invoice', icon: <Receipt size={24} color={colors.text} weight="regular" /> },
  ];

  const details: Array<{ label: string; value: string | number | boolean }> = [
    { label: 'User Name', value: user.userName },
    { label: 'Name', value: user.personalName },
    { label: 'Role', value: `${user.role} (${user.roleId})` },
    { label: 'Sub Role', value: `${user.subRole} (${user.subRoleId})` },
    { label: 'User Type', value: `${user.userType} (${user.userTypeId})` },
    { label: 'Territory', value: `${user.territoryName} (${user.territoryId})` },
    { label: 'Agency', value: user.agencyCode },
    { label: 'Range', value: `${user.range} (${user.rangeId})` },
    { label: 'GPS Status', value: user.gpsStatus },
    { label: 'Server Time', value: user.serverTime },
    { label: 'User Id', value: user.userId },
    { label: 'User Agency Id', value: user.userAgencyId },
  ];

  const dayStatusLabel = useMemo(() => {
    if (dayStatus === 'not-started') return 'Not started';
    if (dayStatus === 'completed') return 'Completed';
    return 'In progress';
  }, [dayStatus]);

  const windowText = 'Start window: 00:00 - 12:00 • 24h validity';

  const formatTime = (value?: string | null) => {
    if (!value) return '-';
    const d = new Date(value);
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
  };

  const handleStart = async () => {
    setDayMessage(null);
    try {
      await onStartDay();
      setDayMessage('Day started.');
    } catch (err: any) {
      setDayMessage(err?.message || 'Unable to start day.');
    }
  };

  const handleEnd = async () => {
    setDayMessage(null);
    try {
      await onEndDay();
      setDayMessage('Day ended.');
    } catch (err: any) {
      setDayMessage(err?.message || 'Unable to end day.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScreenBackground />
      <AppHeader title="Dashboard" hideBack />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>{user.personalName || user.userName}</Text>
        </View>

        <View style={styles.quickGrid}>
          {quickActions.map(item => (
            <View key={item.label} style={styles.quickCard}>
              <View style={styles.quickIcon}>{item.icon}</View>
              <Text style={styles.quickLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.dayCard}>
          <View style={styles.dayHeader}>
            <View>
              <Text style={styles.sectionTitle}>Day Cycle</Text>
              <Text style={styles.windowText}>{windowText}</Text>
            </View>
            <View
              style={[
                styles.statusPill,
                dayStatus === 'completed'
                  ? styles.statusSuccess
                  : dayStatus === 'in-progress'
                    ? styles.statusInfo
                    : styles.statusMuted,
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  dayStatus === 'completed'
                    ? styles.statusTextSuccess
                    : dayStatus === 'in-progress'
                      ? styles.statusTextInfo
                      : styles.statusTextMuted,
                ]}
              >
                {dayStatusLabel}
              </Text>
            </View>
          </View>

          <View style={styles.dayGrid}>
            <View style={styles.dayItem}>
              <Text style={styles.label}>Start Time</Text>
              <Text style={styles.value}>{formatTime(dayState?.startTime)}</Text>
            </View>
            <View style={styles.dayItem}>
              <Text style={styles.label}>End Time</Text>
              <Text style={styles.value}>{formatTime(dayState?.endTime)}</Text>
            </View>
          </View>

          {dayMessage ? <Text style={styles.dayMessage}>{dayMessage}</Text> : null}

          <View style={styles.dayActions}>
            <TouchableOpacity
              style={[
                styles.dayButton,
                styles.secondaryButton,
                (dayStatus !== 'not-started' || dayLoading) && styles.buttonDisabled,
              ]}
              onPress={handleStart}
              disabled={dayStatus !== 'not-started' || dayLoading}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryText}>
                {dayLoading && dayStatus === 'not-started' ? 'Starting...' : 'Start Day'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.dayButton,
                styles.primaryButton,
                (dayStatus !== 'in-progress' || dayLoading) && styles.buttonDisabled,
              ]}
              onPress={handleEnd}
              disabled={dayStatus !== 'in-progress' || dayLoading}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>
                {dayLoading && dayStatus === 'in-progress' ? 'Ending...' : 'End Day'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Session Details</Text>
          {details.map(item => (
            <View key={item.label} style={styles.row}>
              <Text style={styles.label}>{item.label}</Text>
              <Text style={styles.value}>{String(item.value)}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.logoutButton, loading && styles.logoutButtonDisabled]}
          onPress={onLogout}
          disabled={loading}
          activeOpacity={0.8}
        >
          <Text style={styles.logoutText}>{loading ? 'Signing out...' : 'Logout'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    padding: 20,
    gap: 16,
  },
  header: {
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textMuted,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickCard: {
    flexBasis: '48%',
    backgroundColor: colors.card,
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
  quickIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    shadowColor: colors.shadow,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  label: {
    color: colors.textMuted,
    fontSize: 14,
  },
  value: {
    color: colors.text,
    fontSize: 14,
    maxWidth: '60%',
    textAlign: 'right',
  },
  logoutButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  dayCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    shadowColor: colors.shadow,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
    gap: 12,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  windowText: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  statusPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  statusMuted: {
    borderColor: colors.border,
    backgroundColor: '#f8fafc',
  },
  statusInfo: {
    borderColor: '#c7e3ff',
    backgroundColor: '#e5f1ff',
  },
  statusSuccess: {
    borderColor: '#bbf7d0',
    backgroundColor: '#ecfdf3',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  statusTextMuted: {
    color: colors.textMuted,
  },
  statusTextInfo: {
    color: '#1d4ed8',
  },
  statusTextSuccess: {
    color: '#15803d',
  },
  dayGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  dayItem: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
  },
  dayMessage: {
    color: colors.textMuted,
    fontSize: 13,
  },
  dayActions: {
    flexDirection: 'row',
    gap: 12,
  },
  dayButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 15,
  },
  secondaryText: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 15,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  logoutButtonDisabled: {
    opacity: 0.7,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
