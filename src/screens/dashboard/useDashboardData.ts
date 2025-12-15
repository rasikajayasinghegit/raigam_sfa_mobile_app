import { useEffect, useState } from 'react';
import { LoginPayload } from '../../services/auth';
import {
  DashboardInvoiceMetrics,
  getDashboardData,
  mapDashboardInvoices,
  mapDashboardOutlets,
} from '../../services/dashboard';

export type TargetMetrics = {
  territoryTarget: number | null;
  achievementValue: number | null;
  achievementPercentage: number | null;
  pcTarget: number | null;
  achievedPc: number | null;
  unproductiveCalls: number | null;
};

export type OutletMetrics = {
  active: number | null;
  inactive: number | null;
  visitedThisMonth: number | null;
  totalVisitsThisMonth: number | null;
};

export type InvoiceMetrics = DashboardInvoiceMetrics;

const initialTargetMetrics: TargetMetrics = {
  territoryTarget: null,
  achievementValue: null,
  achievementPercentage: null,
  pcTarget: null,
  achievedPc: null,
  unproductiveCalls: null,
};

const initialOutletMetrics: OutletMetrics = {
  active: null,
  inactive: null,
  visitedThisMonth: null,
  totalVisitsThisMonth: null,
};

const initialInvoiceMetrics: InvoiceMetrics = {
  bookingValue: null,
  bookingCount: null,
  actualValue: null,
  actualCount: null,
  cancelValue: null,
  cancelCount: null,
  lateDeliveryValue: null,
  lateDeliveryCount: null,
};

const parseNumber = (value: any) => {
  if (value === null || value === undefined) return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

const pickNumber = (source: any, keys: string[]) => {
  if (!source || typeof source !== 'object') return null;

  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      const parsed = parseNumber((source as any)[key]);
      if (parsed !== null) return parsed;
    }
  }

  const entries = Object.entries(source) as Array<[string, any]>;
  for (const [key, value] of entries) {
    if (keys.some(candidate => candidate.toLowerCase() === key.toLowerCase())) {
      const parsed = parseNumber(value);
      if (parsed !== null) return parsed;
    }
  }

  return null;
};

const parseString = (value: any) => {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'number') {
    const numeric = value > 1e12 ? value : value * 1000; // allow seconds or ms
    const parsed = new Date(numeric);
    return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
  }
  if (typeof value === 'string' && value.trim().length > 0) {
    const trimmed = value.trim();
    const numeric = Number(trimmed);
    if (Number.isFinite(numeric)) {
      const asDate = new Date(numeric > 1e12 ? numeric : numeric * 1000);
      if (!Number.isNaN(asDate.getTime())) return asDate.toISOString();
    }
    const parsed = new Date(trimmed);
    if (!Number.isNaN(parsed.getTime())) return parsed.toISOString();
    return trimmed;
  }
  return null;
};

const pickString = (source: any, keys: string[]) => {
  if (!source || typeof source !== 'object') return null;

  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      const parsed = parseString((source as any)[key]);
      if (parsed) return parsed;
    }
  }

  const entries = Object.entries(source) as Array<[string, any]>;
  for (const [key, value] of entries) {
    if (keys.some(candidate => candidate.toLowerCase() === key.toLowerCase())) {
      const parsed = parseString(value);
      if (parsed) return parsed;
    }
  }

  return null;
};

const extractTargetMetrics = (raw: any): TargetMetrics => {
  const base = Array.isArray(raw) ? raw[0] ?? {} : raw ?? {};
  const sources = [
    base,
    (base as any)?.payload,
    (base as any)?.data,
    (base as any)?.dashboard,
    (base as any)?.dashboardData,
    (base as any)?.summary,
    (base as any)?.target,
    (base as any)?.targets,
    (base as any)?.metrics,
  ].filter(Boolean);

  const pick = (keys: string[]) => {
    for (const source of sources) {
      const value = pickNumber(source, keys);
      if (value !== null) return value;
    }
    return null;
  };

  return {
    territoryTarget: pick([
      'territoryTargetForThisMonth',
      'territory_target_for_this_month',
      'territoryTarget',
      'territory_target',
      'territoryTargetValue',
      'territory_target_value',
      'territorytarget',
      'target',
      'targetValue',
    ]),
    achievementValue: pick([
      'myAchievementValue',
      'myAchievementValues',
      'achievementValue',
      'achievement_value',
      'totalActualValueForThisMonth',
      'total_actual_value_for_this_month',
      'achievedPcTargetForThisMonth',
      'achieved_pc_target_for_this_month',
      'my_achievement_value',
      'myachievementvalue',
      'achievement',
      'achieved',
    ]),
    achievementPercentage: pick([
      'achievementPercentageForThisMonth',
      'achievement_percentage_for_this_month',
      'myAchievementPercentage',
      'myAchievementPrecentage',
      'achievementPercentage',
      'my_achievement_percentage',
      'achievement_percent',
      'achievementPct',
      'achievement_pct',
      'achievement',
    ]),
    pcTarget: pick([
      'pcTargetForThisMonth',
      'pc_target_for_this_month',
      'pcTarget',
      'pc_target',
      'targetPc',
      'pcTargetValue',
    ]),
    achievedPc: pick([
      'achievedPcTargetForThisMonth',
      'achieved_pc_target_for_this_month',
      'achievedPcTargetForThisMonth',
      'achieved_pc_target_for_this_month',
      'achievedPc',
      'achieved_pc',
      'achieved',
    ]),
    unproductiveCalls: pick([
      'unproductiveCallCountForThisMonth',
      'unproductive_call_count_for_this_month',
      'unproductiveCallCount',
      'unproductive_call_count',
      'unproductiveCalls',
      'unproductive_calls',
    ]),
  };
};

const extractOutletMetrics = (raw: any): OutletMetrics => {
  const base = Array.isArray(raw) ? raw[0] ?? {} : raw ?? {};
  const sources = [
    base,
    (base as any)?.payload,
    (base as any)?.data,
    (base as any)?.dashboard,
    (base as any)?.dashboardData,
    (base as any)?.outlets,
    (base as any)?.outletSummary,
  ].filter(Boolean);

  const pick = (keys: string[]) => {
    for (const source of sources) {
      const value = pickNumber(source, keys);
      if (value !== null) return value;
    }
    return null;
  };

  return {
    active: pick(['activeOutletCount', 'active_outlet_count', 'activeOutlets']),
    inactive: pick([
      'inactiveOutletCount',
      'inactive_outlet_count',
      'closedOutletCount',
      'closed_outlet_count',
    ]),
    visitedThisMonth: pick([
      'visitedOutletCountForThisMonth',
      'visited_outlet_count_for_this_month',
      'visitedOutletThisMonth',
    ]),
    totalVisitsThisMonth: pick([
      'visitCountForThisMonth',
      'visit_count_for_this_month',
      'totalVisitCountForThisMonth',
    ]),
  };
};

const extractCheckInTime = (raw: any): string | null => {
  const base = Array.isArray(raw) ? raw[0] ?? {} : raw ?? {};
  const sources = [
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
    (base as any)?.dayCycle,
    (base as any)?.day_cycle,
    (base as any)?.daycycle,
  ].filter(Boolean);

  const pick = (keys: string[]) => {
    for (const source of sources) {
      const value = pickString(source, keys);
      if (value) return value;
    }
    return null;
  };

  return pick(['checkInTime', 'check_in_time', 'checkIn', 'check_in', 'checkintime']);
};

export const deriveAchievementPercentage = (
  metrics: TargetMetrics,
): number | null => {
  if (metrics.achievementPercentage !== null) {
    return metrics.achievementPercentage;
  }

  if (
    metrics.achievementValue !== null &&
    metrics.territoryTarget !== null &&
    metrics.territoryTarget !== 0
  ) {
    return (metrics.achievementValue / metrics.territoryTarget) * 100;
  }

  return null;
};

export const calculatePcProgress = (metrics: TargetMetrics): number | null => {
  if (metrics.pcTarget && metrics.pcTarget > 0 && metrics.achievedPc !== null) {
    return Math.max(
      0,
      Math.min(100, (metrics.achievedPc / metrics.pcTarget) * 100),
    );
  }
  return null;
};

export const calculateInvoiceConversion = (
  invoice: InvoiceMetrics,
): number | null => {
  if (invoice.bookingValue && invoice.bookingValue > 0 && invoice.actualValue !== null) {
    return (invoice.actualValue / invoice.bookingValue) * 100;
  }
  return null;
};

export const formatDashboardTime = (value?: string | null) => {
  if (!value) return '-';
  const timeOnlyMatch = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(value.trim());
  if (timeOnlyMatch) {
    const [, h, m, s] = timeOnlyMatch;
    const d = new Date();
    d.setHours(Number(h), Number(m), Number(s ?? 0), 0);
    return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
};

export const formatDashboardCount = (value: number | null) =>
  value !== null ? value.toLocaleString() : '--';

export function useDashboardData(user: LoginPayload) {
  const [targetMetrics, setTargetMetrics] =
    useState<TargetMetrics>(initialTargetMetrics);
  const [outletMetrics, setOutletMetrics] =
    useState<OutletMetrics>(initialOutletMetrics);
  const [invoiceMetrics, setInvoiceMetrics] =
    useState<InvoiceMetrics>(initialInvoiceMetrics);
  const [checkInTime, setCheckInTime] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    const fetchDashboard = async () => {
      try {
        const data = await getDashboardData(user.territoryId, user.userId);
        console.log('Dashboard data', data);

        if (isCancelled) return;

        const metrics = extractTargetMetrics(data);
        setTargetMetrics(metrics);

        const outletFromApi = mapDashboardOutlets(data);
        const hasDirectOutlets =
          outletFromApi.activeOutletCount !== null ||
          outletFromApi.inactiveOutletCount !== null ||
          outletFromApi.visitedOutletCountForThisMonth !== null ||
          outletFromApi.visitCountForThisMonth !== null;
        const outlets = hasDirectOutlets
          ? {
              active: outletFromApi.activeOutletCount,
              inactive: outletFromApi.inactiveOutletCount,
              visitedThisMonth: outletFromApi.visitedOutletCountForThisMonth,
              totalVisitsThisMonth: outletFromApi.visitCountForThisMonth,
            }
          : extractOutletMetrics(data);
        setOutletMetrics(outlets);

        const invoiceFromApi = mapDashboardInvoices(data);
        setInvoiceMetrics(invoiceFromApi);

        const startTime = extractCheckInTime(data);
        setCheckInTime(startTime);
      } catch (error) {
        if (!isCancelled) {
          console.error('Failed to load dashboard data', error);
        }
      }
    };

    fetchDashboard();

    return () => {
      isCancelled = true;
    };
  }, [user.territoryId, user.userId]);

  return { targetMetrics, outletMetrics, invoiceMetrics, checkInTime };
}
