import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  DayCycleState,
  DayActionOptions,
  endDay as endDayService,
  loadDayCycle,
  msUntilColomboEndOfDay,
  startDay as startDayService,
} from '../services/dayCycle';

export type DayStatus = 'not-started' | 'in-progress' | 'completed';

export function useDayCycle(userId?: number) {
  const [state, setState] = useState<DayCycleState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const autoEndTimer = useRef<NodeJS.Timeout | null>(null);

  const status: DayStatus = useMemo(() => {
    if (!state?.startTime) return 'not-started';
    if (state.endTime) return 'completed';
    return 'in-progress';
  }, [state]);

  const refresh = useCallback(async () => {
    if (!userId) {
      setState(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { state: current } = await loadDayCycle(userId);
      setState(current);
    } catch (err: any) {
      setError(err?.message || 'Unable to load day state.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const startDay = useCallback(async (options: DayActionOptions = {}) => {
    if (!userId) throw new Error('Missing user id');
    setLoading(true);
    setError(null);
    try {
      const next = await startDayService(userId, options);
      setState(next);
      return next;
    } catch (err: any) {
      setError(err?.message || 'Unable to start day.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const endDay = useCallback(async (options: DayActionOptions = {}) => {
    if (!userId) throw new Error('Missing user id');
    setLoading(true);
    setError(null);
    try {
      const next = await endDayService(userId, options);
      setState(next);
      return next;
    } catch (err: any) {
      setError(err?.message || 'Unable to end day.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (autoEndTimer.current) {
      clearTimeout(autoEndTimer.current);
      autoEndTimer.current = null;
    }
    if (status === 'in-progress') {
      const ms = msUntilColomboEndOfDay();
      autoEndTimer.current = setTimeout(() => {
        endDay({ gpsStatus: false, latitude: 0, longitude: 0 }).catch(() => {});
      }, ms);
    }
    return () => {
      if (autoEndTimer.current) {
        clearTimeout(autoEndTimer.current);
        autoEndTimer.current = null;
      }
    };
  }, [status, endDay]);

  return {
    state,
    status,
    loading,
    error,
    refresh,
    startDay,
    endDay,
  };
}
