import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiFetch } from './http';

export type DayCycleState = {
  date: string; // yyyy-mm-dd (Asia/Colombo)
  startTime: string; // ISO
  endTime?: string | null; // ISO
};

export type DayActionOptions = {
  latitude?: number;
  longitude?: number;
  gpsStatus?: boolean;
  startTimeOverride?: string;
  dateOverride?: string;
};

function storageKey(userId: number) {
  return `@dayCycle:${userId}`;
}

// Asia/Colombo helpers (UTC+05:30)
function colomboDate() {
  const now = new Date();
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
  const offsetMs = 5.5 * 60 * 60000;
  return new Date(utcMs + offsetMs);
}

function todayString() {
  const d = colomboDate();
  const yyyy = d.getFullYear();
  const mm = d.getMonth() + 1;
  const dd = d.getDate();
  return `${yyyy}-${String(mm).padStart(2, '0')}-${String(dd).padStart(2, '0')}`;
}

function isSameDay(date: string) {
  return date === todayString();
}

export function msUntilColomboEndOfDay() {
  const now = colomboDate();
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  return Math.max(0, end.getTime() - now.getTime());
}

export type DayCycleLoadResult = {
  state: DayCycleState | null;
  autoEnded?: boolean;
};

async function clearState(userId: number) {
  await AsyncStorage.removeItem(storageKey(userId));
}

export async function loadDayCycle(userId: number): Promise<DayCycleLoadResult> {
  const raw = await AsyncStorage.getItem(storageKey(userId));
  if (!raw) return { state: null };
  try {
    const parsed = JSON.parse(raw) as DayCycleState;
    if (!parsed?.date || !parsed?.startTime) {
      await clearState(userId);
      return { state: null };
    }
    if (!isSameDay(parsed.date)) {
      const staleOpen = !!parsed.startTime && !parsed.endTime;
      if (staleOpen) {
        try {
          await apiFetch('/api/v1/auth/dayEnd', {
            method: 'POST',
            body: {
              userId,
              gpsStatus: 'false',
              latitude: 0,
              longitude: 0,
              isCheckIn: false,
              isCheckOut: true,
            },
          });
        } catch {
          // ignore auto-end failure; rely on next attempt
        }
      }
      await clearState(userId);
      return { state: null, autoEnded: staleOpen };
    }
    return { state: parsed };
  } catch {
    await clearState(userId);
    return { state: null };
  }
}

async function persist(userId: number, state: DayCycleState | null) {
  if (!state) {
    await AsyncStorage.removeItem(storageKey(userId));
    return;
  }
  await AsyncStorage.setItem(storageKey(userId), JSON.stringify(state));
}

export async function startDay(
  userId: number,
  options: DayActionOptions = {},
): Promise<DayCycleState> {
  const { state: current } = await loadDayCycle(userId);

  if (current?.startTime && !current.endTime) {
    return current; // idempotent
  }
  if (current?.endTime) {
    throw new Error('Day already completed.');
  }

  await apiFetch('/api/v1/auth/dayStart', {
    method: 'POST',
    body: {
      userId,
      gpsStatus: String(options.gpsStatus ?? true),
      latitude: options.latitude ?? 0,
      longitude: options.longitude ?? 0,
      isCheckIn: true,
      isCheckOut: false,
    },
  });

  const state: DayCycleState = {
    date: todayString(),
    startTime: colomboDate().toISOString(),
    endTime: null,
  };
  await persist(userId, state);
  return state;
}

export async function endDay(
  userId: number,
  options: DayActionOptions = {},
): Promise<DayCycleState> {
  const now = new Date();
  const { state: stored } = await loadDayCycle(userId);
  const current =
    stored ||
    (options.startTimeOverride
      ? {
          date: options.dateOverride ?? todayString(),
          startTime: options.startTimeOverride,
          endTime: null,
        }
      : null);

  if (!current?.startTime) {
    throw new Error('Start your day before ending it.');
  }
  if (current.endTime) {
    return current; // idempotent
  }

  const start = new Date(current.startTime);
  const elapsed = now.getTime() - start.getTime();
  if (elapsed > 24 * 60 * 60 * 1000) {
    await persist(userId, null);
    throw new Error('Day window expired. Start a new day.');
  }

  await apiFetch('/api/v1/auth/dayEnd', {
    method: 'POST',
    body: {
      userId,
      gpsStatus: String(options.gpsStatus ?? false),
      latitude: options.latitude ?? 0,
      longitude: options.longitude ?? 0,
      isCheckIn: false,
      isCheckOut: true,
    },
  });

  const updated: DayCycleState = {
    ...current,
    endTime: colomboDate().toISOString(),
  };

  await persist(userId, updated);
  return updated;
}

export async function clearDayCycle(userId: number) {
  await persist(userId, null);
}
