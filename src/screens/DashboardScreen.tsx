import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native';
import {
  HandWaving,
  Target,
  ClipboardText,
  Storefront,
  Receipt,
  PlayCircle,
  StopCircle,
  GearSix,
} from 'phosphor-react-native';
import { LoginPayload } from '../services/auth';
import { ColorPalette } from '../theme/colors';
import { AppHeader } from '../components/AppHeader';
import { DayCycleState } from '../services/dayCycle';
import { DayStatus } from '../hooks/useDayCycle';
import { ScreenBackground } from '../components/ScreenBackground';
import { LogoutConfirm } from '../components/LogoutConfirm';
import { StatusAlert } from '../components/StatusAlert';
import { useOpenSettings } from '../hooks/useOpenSettings';
import { useToast } from '../context/ToastContext';
import { useThemeMode } from '../context/ThemeContext';
import { useThemedStyles } from '../hooks/useThemedStyles';

type Props = {
  user: LoginPayload;
  onLogout: () => Promise<void>;
  dayState: DayCycleState | null;
  dayStatus: DayStatus;
  dayLoading: boolean;
  onStartDay: () => Promise<void>;
  onEndDay: () => Promise<void>;
};

export function DashboardScreen({
  user,
  onLogout,
  dayState,
  dayStatus,
  dayLoading,
  onStartDay,
  onEndDay,
}: Props) {
  const [dayMessage, setDayMessage] = useState<string | null>(null);
  const [showLogout, setShowLogout] = useState(false);
  const openSettings = useOpenSettings();
  const { showToast } = useToast();
  const { colors } = useThemeMode();
  const styles = useThemedStyles(createStyles);

  const quickActions = [
    { label: 'Welcome', icon: <HandWaving size={24} color={colors.text} weight="regular" /> },
    {
      label: 'Target',
      icon: <Target size={24} color={colors.text} weight="regular" />,
    },
    {
      label: 'PC Target',
      icon: <ClipboardText size={24} color={colors.text} weight="regular" />,
    },
    {
      label: 'Outlets',
      icon: <Storefront size={24} color={colors.text} weight="regular" />,
    },
    {
      label: 'Invoice',
      icon: <Receipt size={24} color={colors.text} weight="regular" />,
    },
  ];

  const dayStatusLabel = useMemo(() => {
    if (dayStatus === 'not-started') return 'Not started';
    if (dayStatus === 'completed') return 'Completed';
    return 'In progress';
  }, [dayStatus]);

  const statusHelper = useMemo(() => {
    if (dayStatus === 'not-started')
      return 'Start your shift to unlock your route.';
    if (dayStatus === 'completed')
      return 'Day closed. Great work staying on track.';
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
      showToast({
        title: 'Day started',
        message: 'Route unlocked for today.',
        variant: 'success',
      });
    } catch (err: any) {
      setDayMessage(err?.message || 'Unable to start day.');
      showToast({
        title: 'Start failed',
        message: err?.message || 'Please try starting your day again.',
        variant: 'error',
      });
    }
  };

  const handleEnd = async () => {
    setDayMessage(null);
    try {
      await onEndDay();
      setDayMessage('Day ended.');
      showToast({
        title: 'Day ended',
        message: 'Great work closing the day.',
        variant: 'success',
      });
    } catch (err: any) {
      setDayMessage(err?.message || 'Unable to end day.');
      showToast({
        title: 'End day failed',
        message: err?.message || 'Please try ending your day again.',
        variant: 'error',
      });
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
        secondaryRightIcon={
          <GearSix size={22} color={colors.text} weight="regular" />
        }
        onSecondaryRightPress={openSettings}
      />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>
            {user.personalName || user.userName}
          </Text>
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
                <Text style={styles.value}>
                  {formatTime(dayState?.startTime)}
                </Text>
              </View>
            </View>
            <View style={styles.connector}>
              <View style={styles.dot} />
              <View style={styles.line} />
            </View>
            <View style={styles.timeBlock}>
              <View style={[styles.timeIcon, styles.endIcon]}>
                <StopCircle size={22} color={colors.text} weight="duotone" />
              </View>
              <View style={styles.timeText}>
                <Text style={styles.label}>Ended</Text>
                <Text style={styles.value}>
                  {formatTime(dayState?.endTime)}
                </Text>
              </View>
            </View>
          </View>

          <StatusAlert
            variant="warning"
            title="Warning"
            message="Please end your day before leaving."
          />

          {dayMessage ? (
            <Text style={styles.dayMessage}>{dayMessage}</Text>
          ) : null}

          <View style={styles.dayActions}>
            <TouchableOpacity
              style={[
                styles.dayButton,
                styles.secondaryButton,
                (dayStatus !== 'not-started' || dayLoading) &&
                  styles.buttonDisabled,
              ]}
              onPress={handleStart}
              disabled={dayStatus !== 'not-started' || dayLoading}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryText}>
                {dayLoading && dayStatus === 'not-started'
                  ? 'Starting...'
                  : 'Start Day'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.dayButton,
                styles.primaryButton,
                (dayStatus !== 'in-progress' || dayLoading) &&
                  styles.buttonDisabled,
              ]}
              onPress={handleEnd}
              disabled={dayStatus !== 'in-progress' || dayLoading}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>
                {dayLoading && dayStatus === 'in-progress'
                  ? 'Ending...'
                  : 'End Day'}
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
    maxWidth: '100%',
    textAlign: 'left',
  },
  dayCard: {
    backgroundColor: colors.surface,
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
    backgroundColor: colors.surfaceMuted,
  },
  statusInfo: {
    borderColor: colors.borderInfo,
    backgroundColor: colors.primarySoft,
  },
  statusSuccess: {
    borderColor: colors.borderSuccess,
    backgroundColor: colors.successSoft,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  statusTextMuted: {
    color: colors.textMuted,
  },
  statusTextInfo: {
    color: colors.primaryDark,
  },
  statusTextSuccess: {
    color: colors.success,
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
    backgroundColor: colors.surfaceMuted,
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
    backgroundColor: colors.borderAlt,
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
    backgroundColor: colors.surface,
  },
  primaryButtonText: {
    color: colors.white,
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
