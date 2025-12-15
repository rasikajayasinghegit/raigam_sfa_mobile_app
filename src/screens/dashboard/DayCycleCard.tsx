import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { PlayCircle, StopCircle } from 'phosphor-react-native';
import { DayStatus } from '../../hooks/useDayCycle';
import { StatusAlert } from '../../components/StatusAlert';
import { ColorPalette } from '../../theme/colors';
import { useThemeMode } from '../../context/ThemeContext';
import { useThemedStyles } from '../../hooks/useThemedStyles';

type Props = {
  status: DayStatus;
  statusLabel: string;
  statusHelper: string;
  startTimeText: string;
  endTimeText: string;
  message: string | null;
  onStart: () => void;
  onEnd: () => void;
  loading: boolean;
};

export function DayCycleCard({
  status,
  statusLabel,
  statusHelper,
  startTimeText,
  endTimeText,
  message,
  onStart,
  onEnd,
  loading,
}: Props) {
  const { colors } = useThemeMode();
  const styles = useThemedStyles(createStyles);

  const startDisabled = status !== 'not-started' || loading;
  const endDisabled = status !== 'in-progress' || loading;

  return (
    <View style={styles.dayCard}>
      <View style={styles.dayHeader}>
        <View>
          <Text style={styles.sectionTitle}>Day Cycle</Text>
          <Text style={styles.windowText}>{statusHelper}</Text>
        </View>
        <View
          style={[
            styles.statusPill,
            status === 'completed'
              ? styles.statusSuccess
              : status === 'in-progress'
              ? styles.statusInfo
              : styles.statusMuted,
          ]}
        >
          <Text
            style={[
              styles.statusText,
              status === 'completed'
                ? styles.statusTextSuccess
                : status === 'in-progress'
                ? styles.statusTextInfo
                : styles.statusTextMuted,
            ]}
          >
            {statusLabel}
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
            <Text style={styles.value}>{startTimeText}</Text>
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
            <Text style={styles.value}>{endTimeText}</Text>
          </View>
        </View>
      </View>
      <StatusAlert
        variant="warning"
        title="Warning"
        message="Please end your day before leaving."
      />
      {message ? <Text style={styles.dayMessage}>{message}</Text> : null}
      <View style={styles.dayActions}>
        <TouchableOpacity
          style={[
            styles.dayButton,
            styles.secondaryButton,
            startDisabled && styles.buttonDisabled,
          ]}
          onPress={onStart}
          disabled={startDisabled}
          activeOpacity={0.8}
        >
          <Text style={styles.secondaryText}>
            {loading && status === 'not-started' ? 'Starting...' : 'Start Day'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.dayButton,
            styles.primaryButton,
            endDisabled && styles.buttonDisabled,
          ]}
          onPress={onEnd}
          disabled={endDisabled}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>
            {loading && status === 'in-progress' ? 'Ending...' : 'End Day'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const createStyles = (colors: ColorPalette) =>
  StyleSheet.create({
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
    sectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 4,
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
