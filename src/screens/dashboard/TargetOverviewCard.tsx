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
  const { colors, mode } = useThemeMode();
  const styles = useThemedStyles(createStyles);
  const isDark = mode === 'dark';

  const gradientColors = isDark
    ? [colors.surfaceAlt, colors.surfaceMuted]
    : [colors.primary, colors.accent];

  const textOnCard = isDark ? colors.text : colors.white;

  return (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.targetCard}
    >
      <View style={styles.targetHeader}>
        <View style={styles.sectionTitleWrap}>
          <View style={[styles.sectionIcon, styles.sectionIconOnGradient]}>
            <Target size={20} color={textOnCard} weight="duotone" />
          </View>
          <View>
            <Text style={[styles.targetTitle, { color: textOnCard }]}>
              Target overview
            </Text>
            <Text
              style={[styles.targetSubtitle, { color: textOnCard, opacity: 0.8 }]}
            >
              Territory performance snapshot
            </Text>
          </View>
        </View>
        <View style={styles.targetBadge}>
          <Text style={[styles.targetBadgeText, { color: textOnCard }]}>
            Territory
          </Text>
          <Text style={[styles.targetBadgeValue, { color: textOnCard }]}>
            #{territoryId || '-'}
          </Text>
        </View>
      </View>

      <View style={styles.targetStatFull}>
        <Text style={[styles.targetLabel, { color: textOnCard, opacity: 0.85 }]}>
          Territory Target
        </Text>
        <Text style={[styles.targetValue, { color: textOnCard }]}>
          {formatCurrency(metrics.territoryTarget, { fallback: '--' })}
        </Text>
      </View>

      <View style={styles.targetStatsRow}>
        <View style={styles.targetStat}>
          <Text style={[styles.targetLabel, { color: textOnCard, opacity: 0.85 }]}>
            My Achievement
          </Text>
          <Text style={[styles.targetValue, { color: textOnCard }]}>
            {formatCurrency(metrics.achievementValue, { fallback: '--' })}
          </Text>
        </View>
        <View style={styles.targetStat}>
          <Text style={[styles.targetLabel, { color: textOnCard, opacity: 0.85 }]}>
            Achievement %
          </Text>
          <Text style={[styles.targetValue, { color: textOnCard }]}>
            {percentageText}
          </Text>
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
      <Text style={[styles.progressHint, { color: textOnCard, opacity: 0.85 }]}>
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
      fontSize: 17,
      fontWeight: '700',
    },
    targetSubtitle: {
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
      fontSize: 12,
    },
    targetBadgeValue: {
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
      fontSize: 12,
    },
    targetValue: {
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
      fontSize: 12,
    },
  });
