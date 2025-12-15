import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import LinearGradient from 'react-native-linear-gradient';
import {
  CalendarBlank,
  FunnelSimple,
  GearSix,
  Receipt,
} from 'phosphor-react-native';
import { AppHeader } from '../components/AppHeader';
import { ScreenBackground } from '../components/ScreenBackground';
import { useTabStyles } from './tabStyles';
import { LoginPayload } from '../services/auth';
import { useThemeMode } from '../context/ThemeContext';
import { useOpenSettings } from '../hooks/useOpenSettings';
import { RootStackParamList } from '../navigation/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ColorPalette } from '../theme/colors';
import { getAllActiveInvoices } from '../services/reports';
import { formatCurrency, formatInvoiceNumber } from '../lib/formatters';

type Props = {
  user: LoginPayload;
  onLogout: () => Promise<void>;
};

type Invoice = {
  id: string;
  customer: string;
  amount: number;
  status: string;
  date: string;
  channel: string;
  invoiceNo: string;
  outletId?: number | string;
  routeName?: string;
  invoiceType?: string;
  discountValue?: number;
  freeValue?: number;
  valueLabel?: string;
  isBook?: boolean;
  isActual?: boolean;
  isLateDelivery?: boolean;
  unproductiveCalls?: number;
  bookingFinalValue?: number;
  actualFinalValue?: number;
};

export function InvoiceListScreen({ onLogout, user }: Props) {
  const tabStyles = useTabStyles();
  const { colors } = useThemeMode();
  const openSettings = useOpenSettings();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const getDefaultStart = () => {
    const d = new Date();
    d.setDate(1);
    return d;
  };
  const getToday = () => new Date();
  const [startDate, setStartDate] = useState<Date>(getDefaultStart());
  const [endDate, setEndDate] = useState<Date>(getToday());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [applying, setApplying] = useState(false);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  const stats = useMemo(() => {
    const toNumber = (val: any) => {
      const n = Number(val);
      return Number.isFinite(n) ? n : 0;
    };
    const total = invoices.length;
    const bookingsList = invoices.filter(
      inv => inv.isBook && !inv.isActual && !inv.isLateDelivery,
    );
    const actualList = invoices.filter(inv => inv.isActual);
    const bookings = bookingsList.length;
    const actuals = actualList.length;
    const bookingValue = bookingsList.reduce((sum, inv) => {
      const base = inv.bookingFinalValue ?? inv.amount;
      return sum + toNumber(base);
    }, 0);
    const actualValue = actualList.reduce((sum, inv) => {
      const base = inv.actualFinalValue ?? inv.amount;
      return sum + toNumber(base);
    }, 0);
    const unproductiveCalls = invoices.reduce(
      (sum, inv) => sum + toNumber(inv.unproductiveCalls),
      0,
    );
    const totalValue = bookingValue + actualValue;
    return {
      total,
      totalValue,
      bookings,
      actuals,
      bookingValue,
      actualValue,
      unproductiveCalls,
    };
  }, [invoices]);

  const styles = useMemo(() => createStyles(colors), [colors]);

  const formatMoney = (value: number) =>
    formatCurrency(value, { prefix: 'LKR' });

  const formatDate = (date: Date) => date.toISOString().split('T')[0];

  const handleStartChange = (event: DateTimePickerEvent, date?: Date) => {
    setShowStartPicker(false);
    if (event.type === 'set' && date) {
      setStartDate(date);
    }
  };

  const handleEndChange = (event: DateTimePickerEvent, date?: Date) => {
    setShowEndPicker(false);
    if (event.type === 'set' && date) {
      setEndDate(date);
    }
  };

  const handleApplyRange = async (showSuccessAlert = true) => {
    if (!user?.territoryId) {
      Alert.alert('Missing territory', 'Territory ID is required to fetch invoices.');
      return;
    }

    if (startDate > endDate) {
      Alert.alert('Invalid range', 'Start date must be before end date.');
      return;
    }

    const start = formatDate(startDate);
    const end = formatDate(endDate);

    setApplying(true);
    try {
      const payload = await getAllActiveInvoices({
        territoryId: Number(user.territoryId),
        startDate: start,
        endDate: end,
      });

      const listSource = Array.isArray(payload)
        ? payload
        : Array.isArray((payload as any)?.payload)
        ? (payload as any).payload
        : [];

      const normalized: Invoice[] = listSource.map((item: any, idx: number) => ({
        id:
          item?.invoiceNumber ||
          item?.invoiceNo ||
          item?.id ||
          `INV-${idx + 1}`,
        customer: item?.customerName || item?.outletName || 'Unknown outlet',
        amount:
          Number(
            item?.totalValue ??
              item?.invoiceValue ??
              item?.actualValue ??
              item?.bookingValue ??
              item?.amount,
          ) || 0,
        invoiceNo: item?.invoiceNo || item?.invoiceNumber || String(item?.id || ''),
        outletId: item?.outletId,
        routeName: item?.routeName,
        invoiceType: item?.invoiceType,
        discountValue: Number(item?.totalDiscountValue ?? item?.discountValue) || 0,
        freeValue: Number(item?.totalFreeValue ?? item?.freeValue) || 0,
        valueLabel: item?.isActual ? 'Actual value' : 'Booking value',
        bookingFinalValue:
          Number(
            item?.totalBookFinalValue ??
              item?.bookingValue ??
              item?.totalValue ??
              item?.amount,
          ) || 0,
        actualFinalValue:
          Number(
            item?.totalActualValue ??
              item?.actualValue ??
              item?.totalValue ??
              item?.amount,
          ) || 0,
        status:
          item?.status ||
          (item?.isActual
            ? 'Paid'
            : item?.isLateDelivery
            ? 'Overdue'
            : 'Pending'),
        date:
          item?.invoiceDate ||
          item?.createdDate ||
          item?.date ||
          formatDate(new Date()),
        channel: item?.paymentType || item?.channel || 'N/A',
        isBook: Boolean(item?.isBook),
        isActual: Boolean(item?.isActual),
        isLateDelivery: Boolean(item?.isLateDelivery),
        unproductiveCalls:
          Number(item?.unproductiveCalls ?? item?.unproductive_call) || 0,
      }));

      setInvoices(normalized);

      if (showSuccessAlert) {
        const summary =
          typeof payload === 'string'
            ? payload
            : JSON.stringify(payload, null, 2);
        Alert.alert('Invoices fetched', summary.slice(0, 800));
      }
    } catch (error: any) {
      Alert.alert('Fetch failed', error?.message || 'Unable to fetch invoices.');
    } finally {
      setApplying(false);
    }
  };

  useEffect(() => {
    // Load current month-to-date on mount
    handleApplyRange(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SafeAreaView style={tabStyles.container}>
      <ScreenBackground />
      <AppHeader
        title="Invoice list"
        onBack={() => navigation.goBack()}
        hideBack={false}
        onRightPress={() => onLogout()}
        secondaryRightIcon={
          <GearSix size={22} color={colors.text} weight="regular" />
        }
        onSecondaryRightPress={openSettings}
      />
      <ScrollView
        contentContainerStyle={tabStyles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.filterCard}>
          <View style={styles.filterHeader}>
            <View style={styles.filterTitleWrap}>
              <FunnelSimple
                size={18}
                color={colors.primary}
                weight="duotone"
              />
              <Text style={styles.filterTitle}>Filters</Text>
            </View>
          </View>

          <View style={styles.filterRow}>
            <TouchableOpacity
              style={styles.dateField}
              activeOpacity={0.9}
              onPress={() => setShowStartPicker(true)}
            >
              <View style={styles.dateIconWrap}>
                <CalendarBlank
                  size={18}
                  color={colors.textMuted}
                  weight="duotone"
                />
              </View>
              <View style={styles.dateCopy}>
                <Text style={styles.dateLabel}>Start date</Text>
                <Text style={styles.dateValue}>{formatDate(startDate)}</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dateField}
              activeOpacity={0.9}
              onPress={() => setShowEndPicker(true)}
            >
              <View style={styles.dateIconWrap}>
                <CalendarBlank
                  size={18}
                  color={colors.textMuted}
                  weight="duotone"
                />
              </View>
              <View style={styles.dateCopy}>
                <Text style={styles.dateLabel}>End date</Text>
                <Text style={styles.dateValue}>{formatDate(endDate)}</Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.filterActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.actionGhost]}
              activeOpacity={0.9}
              onPress={() => {
                setStartDate(getDefaultStart());
                setEndDate(getToday());
              }}
            >
              <Text style={styles.actionGhostText}>Clear</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.actionPrimary]}
              activeOpacity={0.9}
              onPress={handleApplyRange}
              disabled={applying}
            >
              <Text style={styles.actionPrimaryText}>
                {applying ? 'Applying...' : 'Apply range'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={tabStyles.card}>
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <View style={styles.headerIcon}>
                <Receipt size={24} color={colors.primary} weight="duotone" />
              </View>
              <View>
                <Text style={styles.title}>Invoices summary</Text>
                <Text style={styles.subtitle}>
                  Recent documents for {user.territoryName || 'your territory'}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.metricGrid}>
            {[
              {
                label: 'Total invoices',
                value: stats.total,
                color: colors.primary,
                bg: colors.primarySoft,
                border: colors.primary,
              },
              {
                label: 'Total invoice value',
                value: formatMoney(stats.totalValue),
                color: colors.primary,
                bg: colors.primarySoft,
                border: colors.primary,
              },
              {
                label: 'Bookings',
                value: stats.bookings,
                color: colors.warning,
                bg: colors.warningSoft,
                border: colors.warning,
              },
              {
                label: 'Booking value',
                value: formatMoney(stats.bookingValue),
                color: colors.warning,
                bg: colors.warningSoft,
                border: colors.warning,
              },
              {
                label: 'Actuals',
                value: stats.actuals,
                color: colors.success,
                bg: colors.successSoft,
                border: colors.success,
              },
              {
                label: 'Actual value',
                value: formatMoney(stats.actualValue),
                color: colors.success,
                bg: colors.successSoft,
                border: colors.success,
              },
              {
                label: 'Unproductive calls',
                value: stats.unproductiveCalls,
                color: colors.danger,
                bg: colors.dangerSoft,
                border: colors.danger,
              },
            ].map(item => {
              return (
                <View
                  key={item.label}
                  style={[
                    styles.metricTile,
                    { backgroundColor: item.bg, borderColor: item.border },
                  ]}
                >
                  <View style={styles.metricCopy}>
                    <Text style={[styles.metricLabel, { color: item.color }]}>
                      {item.label}
                    </Text>
                    <Text style={[styles.metricValue, { color: item.color }]}>
                      {item.value}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        <View style={tabStyles.card}>
          <View style={tabStyles.cardHeader}>
            <Text style={tabStyles.cardTitle}>Invoices</Text>
            <Text style={tabStyles.cardSubtitle}>{stats.total} total</Text>
          </View>

          <View style={styles.invoiceList}>
            {invoices.map(invoice => {
              return (
                <TouchableOpacity
                  key={invoice.id}
                  style={[
                    styles.invoiceItem,
                    invoice.isActual
                      ? styles.invoiceItemActual
                      : invoice.isBook
                      ? styles.invoiceItemBooking
                      : null,
                  ]}
                  activeOpacity={0.9}
                >
                  <View style={styles.invoiceHeader}>
                    <Text style={styles.invoiceId}>
                      {formatInvoiceNumber(invoice.invoiceNo || invoice.id)}
                    </Text>
                    <View style={styles.pillRow}>
                      <View style={[styles.pillSoft, { backgroundColor: colors.surfaceSoft }]}>
                        <Text style={[styles.pillText, { color: colors.text }]}>
                          {invoice.invoiceType || 'Invoice'}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.pillSoft,
                          {
                            backgroundColor: invoice.isActual
                              ? colors.successSoft
                              : invoice.isBook
                              ? colors.warningSoft
                              : colors.surface,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.pillText,
                            {
                              color: invoice.isActual
                                ? colors.success
                                : invoice.isBook
                                ? colors.warning
                                : colors.textMuted,
                            },
                          ]}
                        >
                          {invoice.isActual ? 'Actual' : invoice.isBook ? 'Booking' : 'Pending'}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.invoiceBody}>
                    <View style={styles.infoRow}>
                      <Text style={styles.label}>Outlet</Text>
                      <Text style={styles.value}>
                        {invoice.outletId ?? '--'} Â· {invoice.customer}
                      </Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.label}>Route</Text>
                      <Text style={styles.value}>{invoice.routeName || 'N/A'}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.label}>Discount</Text>
                      <Text style={styles.value}>{formatMoney(invoice.discountValue || 0)}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.label}>Free issue</Text>
                      <Text style={styles.value}>{formatMoney(invoice.freeValue || 0)}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.label}>Date</Text>
                      <Text style={styles.value}>{invoice.date}</Text>
                    </View>
                  </View>

                  <View style={styles.valueFooter}>
                    <View style={styles.valueLeft}>
                      <Text style={styles.label}>{invoice.valueLabel || 'Value'}</Text>
                      <Text style={styles.valueStrong}>{formatMoney(invoice.amount)}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {showStartPicker && (
          <DateTimePicker
            value={startDate}
            mode="date"
            display="default"
            onChange={handleStartChange}
          />
        )}

        {showEndPicker && (
          <DateTimePicker
            value={endDate}
            mode="date"
            display="default"
            onChange={handleEndChange}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    filterCard: {
      backgroundColor: colors.surface,
      borderRadius: 14,
      padding: 14,
      gap: 12,
      borderWidth: 1,
      borderColor: colors.borderAlt,
      shadowColor: colors.shadow,
      shadowOpacity: 0.05,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 3 },
      elevation: 1,
    },
    filterHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    filterTitleWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    filterTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.text,
    },
    filterRow: {
      flexDirection: 'row',
      gap: 10,
    },
    dateField: {
      flex: 1,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.borderMuted,
      backgroundColor: colors.surfaceSoft,
      padding: 12,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    dateIconWrap: {
      width: 38,
      height: 38,
      borderRadius: 10,
      backgroundColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center',
    },
    dateCopy: {
      flex: 1,
      gap: 4,
    },
    dateLabel: {
      fontSize: 12,
      color: colors.textMuted,
    },
    dateValue: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
      letterSpacing: 0.2,
    },
    filterActions: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 2,
    },
    actionButton: {
      flex: 1,
      borderRadius: 12,
      paddingVertical: 10,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
    },
    actionGhost: {
      borderColor: colors.borderMuted,
      backgroundColor: colors.surface,
    },
    actionGhostText: {
      color: colors.text,
      fontWeight: '700',
      fontSize: 13,
    },
    actionPrimary: {
      borderColor: colors.primary,
      backgroundColor: colors.primary,
    },
    actionPrimaryText: {
      color: colors.white,
      fontWeight: '700',
      fontSize: 13,
      letterSpacing: 0.2,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 12,
    },
    headerLeft: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    headerIcon: {
      width: 46,
      height: 46,
      borderRadius: 14,
      backgroundColor: colors.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
    },
    subtitle: {
      fontSize: 13,
      color: colors.textMuted,
    },
    metricGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
      marginTop: 14,
    },
    metricTile: {
      flexBasis: '48%',
      flexGrow: 1,
      borderRadius: 14,
      padding: 12,
      borderWidth: 1,
      borderColor: colors.borderAlt,
      backgroundColor: colors.surfaceSoft,
      gap: 6,
    },
    metricCopy: {
      flex: 1,
      gap: 2,
    },
    metricLabel: {
      color: colors.textMuted,
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 0.2,
    },
    metricValue: {
      color: colors.text,
      fontSize: 15,
      fontWeight: '800',
      letterSpacing: 0.2,
    },
    invoiceList: {
      gap: 12,
      marginTop: 4,
    },
    invoiceItem: {
      gap: 12,
      backgroundColor: colors.surfaceSoft,
      borderRadius: 14,
      padding: 14,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.borderAlt,
    },
    invoiceItemActual: {
      borderColor: colors.success,
    },
    invoiceItemBooking: {
      borderColor: colors.warning,
    },
    invoiceHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 10,
    },
    invoiceId: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '800',
      letterSpacing: 0.3,
    },
    pillRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    pillSoft: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.borderAlt,
    },
    pillText: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.textMuted,
      letterSpacing: 0.2,
    },
    invoiceBody: {
      gap: 6,
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    label: {
      color: colors.textMuted,
      fontSize: 12,
      fontWeight: '600',
    },
    value: {
      color: colors.text,
      fontSize: 13,
      fontWeight: '700',
      textAlign: 'right',
    },
    valueStrong: {
      color: colors.primary,
      fontSize: 16,
      fontWeight: '800',
      letterSpacing: 0.2,
    },
    valueFooter: {
      marginTop: 6,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 10,
    },
    valueLeft: {
      flex: 1,
      gap: 2,
    },
  });
