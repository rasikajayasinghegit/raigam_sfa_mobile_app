import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Storefront } from 'phosphor-react-native';
import { OutletMetrics } from './useDashboardData';
import { ColorPalette } from '../../theme/colors';
import { useThemeMode } from '../../context/ThemeContext';
import { useThemedStyles } from '../../hooks/useThemedStyles';

type Props = {
  metrics: OutletMetrics;
  formatCount: (value: number | null) => string;
};

export function OutletCoverageCard({ metrics, formatCount }: Props) {
  const { colors } = useThemeMode();
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.outletCard}>
      <View style={styles.outletHeader}>
        <View style={styles.sectionTitleWrap}>
          <View style={[styles.sectionIcon, styles.sectionIconSurface]}>
            <Storefront size={20} color={colors.primary} weight="duotone" />
          </View>
          <View>
            <Text style={styles.outletTitle}>Outlet coverage</Text>
            <Text style={styles.outletSubtitle}>
              Route health and productivity
            </Text>
          </View>
        </View>
        <View style={styles.outletBadge}>
          <Text style={styles.outletBadgeText}>This month</Text>
        </View>
      </View>
      <View style={styles.outletGrid}>
        <View style={[styles.outletTile, styles.outletTileSuccess]}>
          <Text style={styles.outletLabel}>Active Outlets</Text>
          <Text style={styles.outletValue}>{formatCount(metrics.active)}</Text>
        </View>
        <View style={[styles.outletTile, styles.outletTileMuted]}>
          <Text style={styles.outletLabel}>Closed Outlets</Text>
          <Text style={styles.outletValue}>{formatCount(metrics.inactive)}</Text>
        </View>
        <View style={[styles.outletTile, styles.outletTileInfo]}>
          <Text style={styles.outletLabel}>Visited Outlets</Text>
          <Text style={styles.outletValue}>
            {formatCount(metrics.visitedThisMonth)}
          </Text>
          <Text style={styles.outletHint}>(This Month)</Text>
        </View>
        <View style={[styles.outletTile, styles.outletTilePrimary]}>
          <Text style={styles.outletLabel}>Total Visits</Text>
          <Text style={styles.outletValue}>
            {formatCount(metrics.totalVisitsThisMonth)}
          </Text>
          <Text style={styles.outletHint}>(This Month)</Text>
        </View>
      </View>
    </View>
  );
}

const createStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    outletCard: {
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
    outletHeader: {
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
    outletTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
    },
    outletSubtitle: {
      fontSize: 12,
      color: colors.textMuted,
      marginTop: 2,
    },
    outletBadge: {
      backgroundColor: colors.primarySoft,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.borderInfo,
    },
    outletBadgeText: {
      color: colors.primaryDark,
      fontWeight: '700',
      fontSize: 12,
    },
    outletGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    outletTile: {
      flexBasis: '48%',
      padding: 12,
      borderRadius: 12,
      backgroundColor: colors.surfaceMuted,
      gap: 6,
      borderWidth: 1,
      borderColor: colors.border,
    },
    outletTileSuccess: {
      borderColor: colors.borderSuccess,
      backgroundColor: colors.successSoft,
    },
    outletTileMuted: {
      borderColor: colors.borderMuted,
      backgroundColor: colors.surfaceMuted,
    },
    outletTileInfo: {
      borderColor: colors.borderInfo,
      backgroundColor: colors.primarySoft,
    },
    outletTilePrimary: {
      borderColor: colors.primary,
      backgroundColor: colors.surfaceAlt,
    },
    outletLabel: {
      fontSize: 12,
      color: colors.textMuted,
    },
    outletValue: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
    },
    outletHint: {
      fontSize: 11,
      color: colors.textSubtle,
    },
  });
