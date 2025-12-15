import { apiFetch } from './http';

export type DashboardPayload = Record<string, any>;

export type DashboardResponse<T = DashboardPayload> = {
  code?: number;
  message?: string;
  payload: T;
};

export type DashboardOutlets = {
  activeOutletCount: number | null;
  inactiveOutletCount: number | null;
  visitedOutletCountForThisMonth: number | null;
  visitCountForThisMonth: number | null;
};

export type DashboardInvoiceMetrics = {
  bookingValue: number | null;
  bookingCount: number | null;
  actualValue: number | null;
  actualCount: number | null;
  cancelValue: number | null;
  cancelCount: number | null;
  lateDeliveryValue: number | null;
  lateDeliveryCount: number | null;
};

const toNumberOrNull = (value: any): number | null => {
  if (value === null || value === undefined) return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

const pickNumber = (source: any, keys: string[]): number | null => {
  if (!source || typeof source !== 'object') return null;
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      const val = toNumberOrNull((source as any)[key]);
      if (val !== null) return val;
    }
  }
  const entries = Object.entries(source) as Array<[string, any]>;
  for (const [key, value] of entries) {
    if (keys.some(candidate => candidate.toLowerCase() === key.toLowerCase())) {
      const val = toNumberOrNull(value);
      if (val !== null) return val;
    }
  }
  return null;
};

const flattenDashboardSources = (raw: any) => {
  const base = Array.isArray(raw) ? raw[0] ?? {} : raw ?? {};
  return [
    base,
    (base as any)?.payload,
    (base as any)?.data,
    (base as any)?.dashboard,
    (base as any)?.dashboardData,
    (base as any)?.summary,
    (base as any)?.payload?.dashboard,
    (base as any)?.payload?.dashboardData,
    (base as any)?.payload?.summary,
    (base as any)?.data?.dashboard,
    (base as any)?.data?.dashboardData,
    (base as any)?.data?.summary,
    (base as any)?.dashboard?.summary,
    (base as any)?.dashboardData?.summary,
    (base as any)?.outletSummary,
    (base as any)?.outlets,
  ].filter(Boolean);
};

// Extracts outlet metrics from dashboard payload while being resilient to shape changes.
export function mapDashboardOutlets(raw: any): DashboardOutlets {
  const sources = flattenDashboardSources(raw);
  const pick = (keys: string[]) => {
    for (const source of sources) {
      const val = pickNumber(source, keys);
      if (val !== null) return val;
    }
    return null;
  };

  return {
    activeOutletCount: pick(['activeOutletCount', 'active_outlet_count', 'activeOutlets']),
    inactiveOutletCount: pick([
      'inactiveOutletCount',
      'inactive_outlet_count',
      'closedOutletCount',
      'closed_outlet_count',
    ]),
    visitedOutletCountForThisMonth: pick([
      'visitedOutletCountForThisMonth',
      'visited_outlet_count_for_this_month',
      'visitedOutletThisMonth',
    ]),
    visitCountForThisMonth: pick([
      'visitCountForThisMonth',
      'visit_count_for_this_month',
      'totalVisitCountForThisMonth',
    ]),
  };
}

// Extracts invoice metrics while being resilient to API shape variations.
export function mapDashboardInvoices(raw: any): DashboardInvoiceMetrics {
  const sources = flattenDashboardSources(raw);
  const pick = (keys: string[]) => {
    for (const source of sources) {
      const val = pickNumber(source, keys);
      if (val !== null) return val;
    }
    return null;
  };

  return {
    bookingValue: pick([
      'totalBookingValueForThisMonth',
      'total_booking_value_for_this_month',
      'bookingValueForThisMonth',
      'booking_value_for_this_month',
      'bookingValue',
      'booking_value',
    ]),
    bookingCount: pick([
      'bookingInvoicesCountForThisMonth',
      'booking_invoices_count_for_this_month',
      'bookingInvoiceCount',
      'booking_invoice_count',
      'bookingCount',
    ]),
    actualValue: pick([
      'totalActualValueForThisMonth',
      'total_actual_value_for_this_month',
      'actualValueForThisMonth',
      'actual_value_for_this_month',
      'actualValue',
      'actual_value',
    ]),
    actualCount: pick([
      'actualInvoicesCountForThisMonth',
      'actual_invoices_count_for_this_month',
      'actualInvoiceCount',
      'actual_invoice_count',
      'actualCount',
    ]),
    cancelValue: pick([
      'totalCancelValueForThisMonth',
      'total_cancel_value_for_this_month',
      'cancelValueForThisMonth',
      'cancel_value_for_this_month',
      'cancelValue',
      'cancel_value',
      'cancelledValue',
      'cancelled_value',
    ]),
    cancelCount: pick([
      'cancelInvoicesCountForThisMonth',
      'cancel_invoices_count_for_this_month',
      'cancelInvoiceCount',
      'cancel_invoice_count',
      'cancelledInvoiceCount',
      'cancelled_invoices_count',
    ]),
    lateDeliveryValue: pick([
      'totalLateDeliveryValueForThisMonth',
      'total_late_delivery_value_for_this_month',
      'lateDeliveryValueForThisMonth',
      'late_delivery_value_for_this_month',
      'lateDeliveryValue',
      'late_delivery_value',
      'lateDeliveredValue',
    ]),
    lateDeliveryCount: pick([
      'lateDeliveryInvoicesCountForThisMonth',
      'late_delivery_invoices_count_for_this_month',
      'lateDeliveryInvoiceCount',
      'late_delivery_invoice_count',
      'lateDeliveredInvoices',
      'late_delivered_invoices',
    ]),
  };
}

// Fetches dashboard metrics for the given territory/user.
export async function getDashboardData<T = DashboardPayload>(
  territoryId: number,
  userId: number,
  status = true,
): Promise<T> {
  const path = `/api/v1/reports/dashboardReport/dashboardReportWithRequiredArguments/${encodeURIComponent(
    territoryId,
  )}/${encodeURIComponent(userId)}?status=${encodeURIComponent(String(status))}`;

  const response = await apiFetch<DashboardResponse<T>>(path);

  if (!response?.payload) {
    throw new Error('Dashboard response missing payload');
  }

  return response.payload;
}
