import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Target } from 'phosphor-react-native';
import { TargetMetrics } from './useDashboardData';
import { formatCurrency } from '../../lib/formatters';
import { ColorPalette } from '../../theme/colors';
import { useThemeMode } from '../../context/ThemeContext';
import { useThemedStyles } from '../../hooks/useThemedStyles';

type Props = {
  metrics: TargetMetrics;
  territoryId: number | string | null;
  percentageText: string;
  progressPercent: number;
  hasTargetData: boolean;
};

export function TargetOverviewCard({
  metrics,
  territoryId,
  percentageText,
  progressPercent,
  hasTargetData,
}: Props) {
  const { colors } = useThemeMode();
  const styles = useThemedStyles(createStyles);

  return (
    <LinearGradient
      colors={[colors.primary, colors.accent]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.targetCard}
    >
      <View style={styles.targetHeader}>
        <View style={styles.sectionTitleWrap}>
          <View style={[styles.sectionIcon, styles.sectionIconOnGradient]}>
            <Target size={20} color={colors.white} weight="duotone" />
          </View>
          <View>
            <Text style={styles.targetTitle}>Target overview</Text>
            <Text style={styles.targetSubtitle}>
              Territory performance snapshot
            </Text>
          </View>
        </View>
        <View style={styles.targetBadge}>
          <Text style={styles.targetBadgeText}>Territory</Text>
          <Text style={styles.targetBadgeValue}>#{territoryId || '-'}</Text>
        </View>
      </View>

      <View style={styles.targetStatFull}>
        <Text style={styles.targetLabel}>Territory Target</Text>
        <Text style={styles.targetValue}>
          {formatCurrency(metrics.territoryTarget, { fallback: '--' })}
        </Text>
      </View>

      <View style={styles.targetStatsRow}>
        <View style={styles.targetStat}>
          <Text style={styles.targetLabel}>My Achievement</Text>
          <Text style={styles.targetValue}>
            {formatCurrency(metrics.achievementValue, { fallback: '--' })}
          </Text>
        </View>
        <View style={styles.targetStat}>
          <Text style={styles.targetLabel}>Achievement %</Text>
          <Text style={styles.targetValue}>{percentageText}</Text>
        </View>
      </View>
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${progressPercent}%`,
            },
          ]}
        />
      </View>
      <Text style={styles.progressHint}>
        {hasTargetData
          ? 'Keep pushing to hit the target and close strong.'
          : 'Target data not available yet. Sync to refresh.'}
      </Text>
    </LinearGradient>
  );
}

const createStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    targetCard: {
      borderRadius: 18,
      padding: 16,
      gap: 12,
      shadowColor: colors.shadow,
      shadowOpacity: 0.12,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 6 },
      elevation: 3,
    },
    targetHeader: {
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
    sectionIconOnGradient: {
      backgroundColor: 'rgba(255,255,255,0.16)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.25)',
    },
    targetTitle: {
      color: colors.white,
      fontSize: 17,
      fontWeight: '700',
    },
    targetSubtitle: {
      color: colors.white,
      opacity: 0.85,
      marginTop: 2,
      fontSize: 13,
    },
    targetBadge: {
      backgroundColor: 'rgba(255,255,255,0.12)',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 12,
      alignItems: 'flex-end',
      gap: 2,
    },
    targetBadgeText: {
      color: colors.white,
      opacity: 0.7,
      fontSize: 12,
    },
    targetBadgeValue: {
      color: colors.white,
      fontWeight: '700',
      fontSize: 14,
    },
    targetStatsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 12,
    },
    targetStatFull: {
      width: '100%',
      backgroundColor: 'rgba(255,255,255,0.12)',
      padding: 12,
      borderRadius: 12,
      gap: 6,
    },
    targetStat: {
      flex: 1,
      backgroundColor: 'rgba(255,255,255,0.12)',
      padding: 12,
      borderRadius: 12,
      gap: 6,
    },
    targetLabel: {
      color: colors.white,
      opacity: 0.8,
      fontSize: 12,
    },
    targetValue: {
      color: colors.white,
      fontSize: 18,
      fontWeight: '700',
      letterSpacing: 0.2,
    },
    progressBar: {
      height: 10,
      backgroundColor: 'rgba(255,255,255,0.15)',
      borderRadius: 999,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      backgroundColor: colors.white,
      borderRadius: 999,
    },
    progressHint: {
      color: colors.white,
      opacity: 0.9,
      fontSize: 12,
    },
  });
