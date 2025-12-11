import React, { useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import {
  HandWaving,
  Target,
  ClipboardText,
  Storefront,
  Receipt,
  PlayCircle,
  StopCircle,
  Clock,
} from 'phosphor-react-native';
import { LoginPayload } from '../services/auth';
import { colors } from '../theme/colors';
import { AppHeader } from '../components/AppHeader';
import { DayCycleState } from '../services/dayCycle';
import { DayStatus } from '../hooks/useDayCycle';
import { ScreenBackground } from '../components/ScreenBackground';
import { LogoutConfirm } from '../components/LogoutConfirm';

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
  const [showLogout, setShowLogout] = useState(false);

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

  const statusHelper = useMemo(() => {
    if (dayStatus === 'not-started') return 'Start your shift to unlock your route.';
    if (dayStatus === 'completed') return 'Day closed. Great work staying on track.';
    return 'Day running. Remember to end before you finish.';
  }, [dayStatus]);

  const formatTime = (value?: string | null) => {
    if (!value) return '-';
    const d = new Date(value);
    return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
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
      <AppHeader
        title="Dashboard"
        hideBack
        onRightPress={() => {
          setShowLogout(true);
        }}
      />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>{user.personalName || user.userName}</Text>
        </View>

        <View style={styles.dayCard}>
          <View style={styles.dayHeader}>
            <View>
              <Text style={styles.sectionTitle}>Day Cycle</Text>
              <Text style={styles.windowText}>{statusHelper}</Text>
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

          <View style={styles.timeline}>
            <View style={styles.timeBlock}>
              <View style={styles.timeIcon}>
                <PlayCircle size={22} color={colors.primary} weight="duotone" />
              </View>
              <View style={styles.timeText}>
                <Text style={styles.label}>Started</Text>
                <Text style={styles.value}>{formatTime(dayState?.startTime)}</Text>
              </View>
            </View>
            <View style={styles.connector}>
              <View style={styles.dot} />
              <View style={styles.line} />
            </View>
            <View style={styles.timeBlock}>
              <View style={[styles.timeIcon, styles.endIcon]}>
                <StopCircle size={22} color="#1e293b" weight="duotone" />
              </View>
              <View style={styles.timeText}>
                <Text style={styles.label}>Ended</Text>
                <Text style={styles.value}>{formatTime(dayState?.endTime)}</Text>
              </View>
            </View>
          </View>

          <View style={styles.tip}>
            <Clock size={18} color={colors.text} weight="duotone" />
            <Text style={styles.tipText}>
              Warning: Please end your day before leaving. Auto-close runs at 23:59.
            </Text>
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

        <View style={styles.quickGrid}>
          {quickActions.map(item => (
            <View key={item.label} style={styles.quickCard}>
              <View style={styles.quickIcon}>{item.icon}</View>
              <Text style={styles.quickLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
      <LogoutConfirm
        visible={showLogout}
        onConfirm={() => {
          setShowLogout(false);
          onLogout();
        }}
        onCancel={() => setShowLogout(false)}
      />
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
  timeline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
  },
  timeBlock: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
  },
  timeIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  endIcon: {
    backgroundColor: '#e2e8f0',
  },
  timeText: {
    flex: 1,
  },
  connector: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  line: {
    width: 2,
    height: 28,
    backgroundColor: colors.border,
  },
  tip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
  },
  tipText: {
    color: colors.text,
    fontSize: 13,
    flex: 1,
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
});
