import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Receipt } from 'phosphor-react-native';
import { InvoiceMetrics } from './useDashboardData';
import { formatCurrency } from '../../lib/formatters';
import { ColorPalette } from '../../theme/colors';
import { useThemeMode } from '../../context/ThemeContext';
import { useThemedStyles } from '../../hooks/useThemedStyles';

type Props = {
  metrics: InvoiceMetrics;
  invoiceConversionText: string;
  invoiceProgressPercent: number;
  formatCount: (value: number | null) => string;
};

export function InvoicePerformanceCard({
  metrics,
  invoiceConversionText,
  invoiceProgressPercent,
  formatCount,
}: Props) {
  const { colors, gradients } = useThemeMode();
  const styles = useThemedStyles(createStyles);

  return (
    <LinearGradient
      colors={gradients.invoiceHero}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.invoiceCard}
    >
      <View style={styles.invoiceHeader}>
        <View style={styles.invoiceTitleWrap}>
          <View style={styles.invoiceIcon}>
            <Receipt size={20} color={colors.primary} weight="duotone" />
          </View>
          <View>
            <Text style={styles.invoiceTitle}>Invoice performance</Text>
            <Text style={styles.invoiceSubtitle}>
              Booking to delivery outlook (MTD)
            </Text>
          </View>
        </View>
        <View style={styles.invoiceBadge}>
          <Text style={styles.invoiceBadgeText}>Live</Text>
          <Text style={styles.invoiceBadgeSub}>MTD</Text>
        </View>
      </View>

      <View style={styles.invoiceValueRow}>
        <View style={[styles.invoiceValueCard, styles.invoiceValuePrimary]}>
          <Text style={styles.invoiceValueLabel}>Booking Value</Text>
          <Text style={[styles.invoiceValue, styles.invoiceValueInfo]}>
            {formatCurrency(metrics.bookingValue, { fallback: '--' })}
          </Text>
          <Text style={[styles.invoiceMetaText, styles.invoiceMetaInfo]}>
            Bookings: {formatCount(metrics.bookingCount)}
          </Text>
        </View>
        <View style={[styles.invoiceValueCard, styles.invoiceValueAccent]}>
          <Text style={styles.invoiceValueLabel}>Actual Value</Text>
          <Text style={[styles.invoiceValue, styles.invoiceValuePositive]}>
            {formatCurrency(metrics.actualValue, { fallback: '--' })}
          </Text>
          <Text style={[styles.invoiceMetaText, styles.invoiceMetaPositive]}>
            Fulfilled: {formatCount(metrics.actualCount)}
          </Text>
        </View>
      </View>
      <View style={styles.invoiceProgressWrap}>
        <View style={styles.invoiceProgressMeta}>
          <Text style={styles.invoiceProgressLabel}>Value conversion</Text>
          <Text style={styles.invoiceProgressValue}>{invoiceConversionText}</Text>
        </View>
        <View style={styles.invoiceProgressBar}>
          <View
            style={[
              styles.invoiceProgressFill,
              { width: `${invoiceProgressPercent}%` },
            ]}
          />
        </View>
        <Text style={styles.invoiceProgressHint}>
          Actual vs booking value this month.
        </Text>
      </View>

      <View style={styles.invoiceGrid}>
        <View style={[styles.invoiceTile, styles.invoiceTileDanger]}>
          <Text style={styles.invoiceTileLabel}>Cancelled Value</Text>
          <Text style={[styles.invoiceTileValue, styles.invoiceTileValueDanger]}>
            {formatCurrency(metrics.cancelValue, { fallback: '--' })}
          </Text>
          <Text style={[styles.invoiceTileHint, styles.invoiceTileHintDanger]}>
            Count: {formatCount(metrics.cancelCount)}
          </Text>
        </View>
        <View style={[styles.invoiceTile, styles.invoiceTileWarning]}>
          <Text style={styles.invoiceTileLabel}>Late Delivery Value</Text>
          <Text style={[styles.invoiceTileValue, styles.invoiceTileValueWarning]}>
            {formatCurrency(metrics.lateDeliveryValue, { fallback: '--' })}
          </Text>
          <Text style={[styles.invoiceTileHint, styles.invoiceTileHintWarning]}>
            Bills: {formatCount(metrics.lateDeliveryCount)}
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const createStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    invoiceCard: {
      borderRadius: 18,
      padding: 16,
      gap: 12,
      shadowColor: colors.shadow,
      shadowOpacity: 0.08,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
      elevation: 2,
      borderWidth: 1,
      borderColor: colors.borderMuted,
    },
    invoiceHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 12,
    },
    invoiceTitleWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      flex: 1,
    },
    invoiceIcon: {
      width: 42,
      height: 42,
      borderRadius: 12,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: colors.shadow,
      shadowOpacity: 0.06,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 3 },
    },
    invoiceTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
    },
    invoiceSubtitle: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
    },
    invoiceBadge: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 12,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'flex-end',
      gap: 2,
    },
    invoiceBadgeText: {
      color: colors.text,
      fontWeight: '700',
      fontSize: 12,
    },
    invoiceBadgeSub: {
      color: colors.textMuted,
      fontSize: 11,
    },
    invoiceValueRow: {
      flexDirection: 'row',
      gap: 12,
    },
    invoiceValueCard: {
      flex: 1,
      padding: 14,
      borderRadius: 14,
      backgroundColor: colors.surface,
      gap: 6,
      borderWidth: 1,
      borderColor: colors.borderMuted,
    },
    invoiceValuePrimary: {
      backgroundColor: colors.primarySoft,
      borderColor: colors.borderInfo,
    },
    invoiceValueAccent: {
      backgroundColor: colors.successSoft,
      borderColor: colors.borderSuccess,
    },
    invoiceValueLabel: {
      color: colors.textMuted,
      fontSize: 12,
    },
    invoiceValue: {
      color: colors.text,
      fontSize: 18,
      fontWeight: '700',
      letterSpacing: 0.2,
    },
    invoiceValuePositive: {
      color: colors.success,
    },
    invoiceValueInfo: {
      color: colors.primaryDark,
    },
    invoiceMetaText: {
      color: colors.textSecondary,
      fontSize: 12,
    },
    invoiceMetaPositive: {
      color: colors.success,
    },
    invoiceMetaInfo: {
      color: colors.primaryDark,
    },
    invoiceProgressWrap: {
      gap: 8,
    },
    invoiceProgressMeta: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    invoiceProgressLabel: {
      color: colors.textMuted,
      fontSize: 12,
    },
    invoiceProgressValue: {
      color: colors.text,
      fontWeight: '700',
      fontSize: 14,
    },
    invoiceProgressBar: {
      height: 10,
      backgroundColor: colors.border,
      borderRadius: 999,
      overflow: 'hidden',
    },
    invoiceProgressFill: {
      height: '100%',
      backgroundColor: colors.primary,
      borderRadius: 999,
    },
    invoiceProgressHint: {
      color: colors.textSecondary,
      fontSize: 12,
    },
    invoiceGrid: {
      flexDirection: 'row',
      gap: 12,
    },
    invoiceTile: {
      flex: 1,
      padding: 12,
      borderRadius: 12,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 6,
    },
    invoiceTileDanger: {
      borderColor: colors.borderDanger,
      backgroundColor: colors.dangerSoft,
    },
    invoiceTileWarning: {
      borderColor: colors.borderWarning,
      backgroundColor: colors.warningSoft,
    },
    invoiceTileLabel: {
      color: colors.textMuted,
      fontSize: 12,
    },
    invoiceTileValue: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '700',
    },
    invoiceTileValueDanger: {
      color: colors.danger,
    },
    invoiceTileValueWarning: {
      color: colors.warning,
    },
    invoiceTileHint: {
      color: colors.textSecondary,
      fontSize: 12,
    },
    invoiceTileHintDanger: {
      color: colors.danger,
    },
    invoiceTileHintWarning: {
      color: colors.warning,
    },
  });
