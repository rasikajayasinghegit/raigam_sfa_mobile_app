import React, { useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { GearSix } from 'phosphor-react-native';
import { LoginPayload } from '../services/auth';
import { ColorPalette } from '../theme/colors';
import { AppHeader } from '../components/AppHeader';
import { DayCycleState } from '../services/dayCycle';
import { DayStatus } from '../hooks/useDayCycle';
import { ScreenBackground } from '../components/ScreenBackground';
import { LogoutConfirm } from '../components/LogoutConfirm';
import { useOpenSettings } from '../hooks/useOpenSettings';
import { useToast } from '../context/ToastContext';
import { useThemeMode } from '../context/ThemeContext';
import { useThemedStyles } from '../hooks/useThemedStyles';
import { formatPercentage } from '../lib/formatters';
import {
  calculateInvoiceConversion,
  calculatePcProgress,
  deriveAchievementPercentage,
  formatDashboardCount,
  formatDashboardTime,
  useDashboardData,
} from './dashboard/useDashboardData';
import { DayCycleCard } from './dashboard/DayCycleCard';
import { TargetOverviewCard } from './dashboard/TargetOverviewCard';
import { OutletCoverageCard } from './dashboard/OutletCoverageCard';
import { InvoicePerformanceCard } from './dashboard/InvoicePerformanceCard';
import { PcTargetCard } from './dashboard/PcTargetCard';

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

  const { targetMetrics, outletMetrics, invoiceMetrics, checkInTime } =
    useDashboardData(user);

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

  const derivedAchievementPercentage = useMemo(
    () => deriveAchievementPercentage(targetMetrics),
    [targetMetrics],
  );

  const hasTargetData = useMemo(
    () =>
      targetMetrics.territoryTarget !== null ||
      targetMetrics.achievementValue !== null ||
      derivedAchievementPercentage !== null,
    [
      derivedAchievementPercentage,
      targetMetrics.achievementValue,
      targetMetrics.territoryTarget,
    ],
  );

  const percentageText = formatPercentage(
    derivedAchievementPercentage !== null
      ? Math.min(999, Math.max(0, derivedAchievementPercentage))
      : null,
    { fractionDigits: 1, fallback: '--' },
  );

  const progressPercent = Math.max(
    0,
    Math.min(100, derivedAchievementPercentage ?? 0),
  );

  const pcProgress = useMemo(
    () => calculatePcProgress(targetMetrics),
    [targetMetrics],
  );

  const invoiceConversion = useMemo(
    () => calculateInvoiceConversion(invoiceMetrics),
    [invoiceMetrics],
  );

  const invoiceProgressPercent = Math.max(
    0,
    Math.min(100, invoiceConversion ?? 0),
  );

  const invoiceConversionText = formatPercentage(invoiceConversion, {
    fractionDigits: 1,
    fallback: '--',
  });

  const startTimeText = useMemo(
    () => formatDashboardTime(checkInTime ?? dayState?.startTime),
    [checkInTime, dayState?.startTime],
  );

  const endTimeText = useMemo(
    () => formatDashboardTime(dayState?.endTime),
    [dayState?.endTime],
  );

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

        <DayCycleCard
          status={dayStatus}
          statusLabel={dayStatusLabel}
          statusHelper={statusHelper}
          startTimeText={startTimeText}
          endTimeText={endTimeText}
          message={dayMessage}
          loading={dayLoading}
          onStart={handleStart}
          onEnd={handleEnd}
        />

        <TargetOverviewCard
          metrics={targetMetrics}
          territoryId={user.territoryId}
          percentageText={percentageText}
          progressPercent={progressPercent}
          hasTargetData={hasTargetData}
        />

        <OutletCoverageCard
          metrics={outletMetrics}
          formatCount={formatDashboardCount}
        />

        <InvoicePerformanceCard
          metrics={invoiceMetrics}
          invoiceConversionText={invoiceConversionText}
          invoiceProgressPercent={invoiceProgressPercent}
          formatCount={formatDashboardCount}
        />

        <PcTargetCard metrics={targetMetrics} pcProgress={pcProgress} />

        <View style={styles.footerSpacer} />
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
    footerSpacer: {
      height: 40,
    },
  });
