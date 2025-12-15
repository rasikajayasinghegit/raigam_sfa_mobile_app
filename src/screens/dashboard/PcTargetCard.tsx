import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ClipboardText } from 'phosphor-react-native';
import { TargetMetrics } from './useDashboardData';
import { formatPercentage } from '../../lib/formatters';
import { ColorPalette } from '../../theme/colors';
import { useThemeMode } from '../../context/ThemeContext';
import { useThemedStyles } from '../../hooks/useThemedStyles';

type Props = {
  metrics: TargetMetrics;
  pcProgress: number | null;
};

export function PcTargetCard({ metrics, pcProgress }: Props) {
  const { colors } = useThemeMode();
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.pcCard}>
      <View style={styles.pcHeader}>
        <View style={styles.sectionTitleWrap}>
          <View style={[styles.sectionIcon, styles.sectionIconSurface]}>
            <ClipboardText size={20} color={colors.primary} weight="duotone" />
          </View>
          <View>
            <Text style={styles.pcTitle}>PC Target</Text>
            <Text style={styles.pcSubtitle}>Current month performance</Text>
          </View>
        </View>
        <View style={styles.pcBadge}>
          <Text style={styles.pcBadgeText}>Live</Text>
        </View>
      </View>

      <View style={styles.pcStatsRow}>
        <View style={styles.pcStat}>
          <Text style={styles.pcLabel}>PC Target</Text>
          <Text style={styles.pcValue}>
            {metrics.pcTarget !== null ? metrics.pcTarget.toLocaleString() : '--'}
          </Text>
        </View>
        <View style={styles.pcStat}>
          <Text style={styles.pcLabel}>My Achieved PC</Text>
          <Text style={styles.pcValue}>
            {metrics.achievedPc !== null
              ? metrics.achievedPc.toLocaleString()
              : '--'}
          </Text>
        </View>
        <View style={styles.pcStat}>
          <Text style={styles.pcLabel}>Unproductive Calls</Text>
          <Text style={styles.pcValue}>
            {metrics.unproductiveCalls !== null
              ? metrics.unproductiveCalls.toLocaleString()
              : '--'}
          </Text>
        </View>
      </View>
      <View style={styles.pcProgressWrap}>
        <View style={styles.pcProgressMeta}>
          <Text style={styles.pcProgressLabel}>Progress</Text>
          <Text style={styles.pcProgressValue}>
            {formatPercentage(pcProgress, { fractionDigits: 1, fallback: '--' })}
          </Text>
        </View>
        <View style={styles.pcProgressBar}>
          <View
            style={[
              styles.pcProgressFill,
              { width: `${pcProgress ?? 0}%` },
            ]}
          />
        </View>
      </View>
    </View>
  );
}

const createStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    pcCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 16,
      gap: 12,
      borderWidth: 1,
      borderColor: colors.borderMuted,
      shadowColor: colors.shadow,
      shadowOpacity: 0.08,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 2,
    },
    pcHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    sectionTitleWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      flex: 1,
    },
    sectionIcon: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sectionIconSurface: {
      backgroundColor: colors.primarySoft,
      borderWidth: 1,
      borderColor: colors.borderInfo,
    },
    pcTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
    },
    pcSubtitle: {
      fontSize: 12,
      color: colors.textMuted,
      marginTop: 2,
    },
    pcBadge: {
      backgroundColor: colors.primarySoft,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.borderInfo,
    },
    pcBadgeText: {
      color: colors.primaryDark,
      fontWeight: '700',
      fontSize: 12,
    },
    pcStatsRow: {
      flexDirection: 'row',
      alignItems: 'stretch',
      justifyContent: 'space-between',
      gap: 12,
    },
    pcStat: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 10,
      gap: 6,
      backgroundColor: colors.surfaceMuted,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    pcLabel: {
      color: colors.textMuted,
      fontSize: 12,
    },
    pcValue: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '700',
    },
    pcProgressWrap: {
      gap: 8,
    },
    pcProgressMeta: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    pcProgressLabel: {
      color: colors.textMuted,
      fontSize: 12,
    },
    pcProgressValue: {
      color: colors.text,
      fontWeight: '700',
      fontSize: 14,
    },
    pcProgressBar: {
      height: 10,
      backgroundColor: colors.border,
      borderRadius: 999,
      overflow: 'hidden',
    },
    pcProgressFill: {
      height: '100%',
      backgroundColor: colors.primary,
      borderRadius: 999,
    },
  });
