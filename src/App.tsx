import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Linking, StatusBar, Platform } from 'react-native';
import {
  SafeAreaProvider,
  initialWindowMetrics,
} from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { DayCycleScreen } from './screens/DayCycleScreen';
import { LoginScreen } from './screens/LoginScreen';
import { SplashScreen } from './screens/SplashScreen';
import { UpdateRequiredScreen } from './screens/UpdateRequiredScreen';
import { ErrorScreen } from './screens/ErrorScreen';
import { useVersionGate } from './hooks/useVersionGate';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useDayCycle } from './hooks/useDayCycle';
import { getCurrentLocation } from './services/location';
import { getDashboardData } from './services/dashboard';
import { MainTabs } from './navigation/MainTabs';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SettingsScreen } from './screens/SettingsScreen';
import { RootStackParamList } from './navigation/types';
import { ThemeProvider, useThemeMode } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { disableImmersiveMode, enableImmersiveMode } from './utils/immersive';

const RootStack = createNativeStackNavigator<RootStackParamList>();

function AppBody(): React.JSX.Element {
  const { status, statusMessage, progress, versionInfo, retry, appVersion } =
    useVersionGate();
  const {
    login,
    logout,
    loading: authLoading,
    error: authError,
    remember,
    session,
  } = useAuth();
  if (__DEV__ && session) {
    // eslint-disable-next-line no-console
    //console.log('Logged in user session', session);
  }
  const {
    state: dayState,
    status: dayStatus,
    loading: dayLoading,
    startDay,
    endDay,
  } = useDayCycle(session?.userId);
  const [remoteCheckInTime, setRemoteCheckInTime] = useState<
    string | null | undefined
  >(undefined);
  const [remoteCheckInLoading, setRemoteCheckInLoading] = useState(false);

  const extractCheckInTime = useCallback((raw: any): string | null => {
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

    const pickString = (source: any, keys: string[]) => {
      if (!source || typeof source !== 'object') return null;
      for (const key of keys) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          const val = (source as any)[key];
          if (val !== undefined && val !== null) return String(val);
        }
      }
      const entries = Object.entries(source) as Array<[string, any]>;
      for (const [key, value] of entries) {
        if (
          keys.some(candidate => candidate.toLowerCase() === key.toLowerCase())
        ) {
          if (value !== undefined && value !== null) return String(value);
        }
      }
      return null;
    };

    for (const source of sources) {
      const value = pickString(source, [
        'checkInTime',
        'check_in_time',
        'checkIn',
        'check_in',
        'checkintime',
      ]);
      if (value) return value;
    }

    return null;
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchCheckIn = async () => {
      if (!session?.userId || !session?.territoryId) {
        if (isMounted) {
          setRemoteCheckInTime(undefined);
          setRemoteCheckInLoading(false);
        }
        return;
      }
      if (isMounted) {
        setRemoteCheckInLoading(true);
        setRemoteCheckInTime(undefined);
      }
      try {
        const data = await getDashboardData(
          session.territoryId,
          session.userId,
        );
        if (!isMounted) return;
        const time = extractCheckInTime(data);
        setRemoteCheckInTime(time ?? null);
      } catch {
        if (isMounted) setRemoteCheckInTime(null);
      } finally {
        if (isMounted) setRemoteCheckInLoading(false);
      }
    };
    fetchCheckIn();
    return () => {
      isMounted = false;
    };
  }, [extractCheckInTime, session?.territoryId, session?.userId]);

  const hasRemoteStart = useMemo(() => {
    if (!remoteCheckInTime) return false;
    const trimmed = remoteCheckInTime.trim();
    if (!trimmed) return false;
    const digits = trimmed.replace(/\D/g, '');
    if (!digits) return false;
    return !/^0+$/.test(digits);
  }, [remoteCheckInTime]);

  const derivedRemoteState = useMemo(() => {
    if (!hasRemoteStart || !remoteCheckInTime) return null;
    const trimmed = remoteCheckInTime.trim();
    const timeMatch = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(trimmed);
    if (timeMatch) {
      const [, h, m, s] = timeMatch;
      const d = new Date();
      d.setHours(Number(h), Number(m), Number(s ?? 0), 0);
      return {
        date: d.toISOString().slice(0, 10),
        startTime: d.toISOString(),
        endTime: null,
      };
    }
    const parsed = new Date(trimmed);
    if (!Number.isNaN(parsed.getTime())) {
      return {
        date: parsed.toISOString().slice(0, 10),
        startTime: parsed.toISOString(),
        endTime: null,
      };
    }
    return null;
  }, [hasRemoteStart, remoteCheckInTime]);

  const effectiveDayStatus = useMemo(() => {
    if (dayStatus !== 'not-started') return dayStatus;
    if (hasRemoteStart) return 'in-progress';
    return dayStatus;
  }, [dayStatus, hasRemoteStart]);

  const effectiveDayState = useMemo(
    () => dayState ?? derivedRemoteState,
    [dayState, derivedRemoteState],
  );
  const buildPayload = useCallback(
    async (isStart: boolean) => {
      const loc = await getCurrentLocation();
      const gpsStatus = loc.status === 'enabled';
      return {
        display: {
          userId: session?.userId ?? 0,
          gpsStatus,
          latitude: loc.latitude,
          longitude: loc.longitude,
          isCheckIn: isStart,
          isCheckOut: !isStart,
        },
        options: {
          gpsStatus,
          latitude: loc.latitude,
          longitude: loc.longitude,
        },
      };
    },
    [session?.userId],
  );

  const startWithLocation = useCallback(async () => {
    const { options } = await buildPayload(true);
    return startDay(options);
  }, [buildPayload, startDay]);

  const endWithLocation = useCallback(async () => {
    const { options } = await buildPayload(false);
    const overrides =
      derivedRemoteState && dayStatus === 'not-started'
        ? {
            startTimeOverride: derivedRemoteState.startTime,
            dateOverride: derivedRemoteState.date,
          }
        : {};
    return endDay({ ...options, ...overrides });
  }, [buildPayload, dayStatus, derivedRemoteState, endDay]);

  const handleUpdatePress = useCallback(() => {
    const link =
      versionInfo.updateUrl ||
      'https://play.google.com/store/search?q=Raigam%20SFA&c=apps';
    Linking.openURL(link).catch(() => {
      retry();
    });
  }, [retry, versionInfo.updateUrl]);

  if (status === 'loading') {
    return (
      <SplashScreen
        statusMessage={statusMessage}
        progress={progress}
        appVersion={appVersion}
      />
    );
  }

  if (status === 'blocked') {
    return (
      <UpdateRequiredScreen
        latestVersion={versionInfo.version || 'latest'}
        message={statusMessage}
        onUpdate={handleUpdatePress}
        onRetry={retry}
      />
    );
  }

  if (status === 'error') {
    return <ErrorScreen message={statusMessage} onRetry={retry} />;
  }

  const waitingForRemoteCheckIn =
    session &&
    dayStatus === 'not-started' &&
    (remoteCheckInLoading || remoteCheckInTime === undefined);

  if (waitingForRemoteCheckIn) {
    return (
      <SplashScreen
        statusMessage="Loading day status..."
        progress={progress}
        appVersion={appVersion}
      />
    );
  }

  if (session && effectiveDayStatus === 'not-started') {
    return (
      <DayCycleScreen
        user={session}
        status={effectiveDayStatus}
        state={effectiveDayState}
        loading={dayLoading}
        onStart={options => startDay(options)}
        onEnd={options => endDay(options)}
        onLogout={logout}
        getStartPayload={() => buildPayload(true)}
        getEndPayload={() => buildPayload(false)}
      />
    );
  }

  if (session) {
    return (
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        <RootStack.Screen name="MainTabs">
          {() => (
            <MainTabs
              user={session}
              onLogout={logout}
              dayState={effectiveDayState}
              dayStatus={effectiveDayStatus}
              dayLoading={dayLoading}
              onStartDay={startWithLocation}
              onEndDay={endWithLocation}
            />
          )}
        </RootStack.Screen>
        <RootStack.Screen name="Settings">
          {() => <SettingsScreen user={session} onLogout={logout} />}
        </RootStack.Screen>
      </RootStack.Navigator>
    );
  }

  return (
    <LoginScreen
      onSubmit={login}
      onLogout={logout}
      loading={authLoading}
      error={authError}
      rememberMe={remember}
      sessionUserName={session?.userName}
    />
  );
}

export default function App(): React.JSX.Element {
  useEffect(() => {
    enableImmersiveMode();
    return () => {
      disableImmersiveMode();
    };
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <NavigationContainer>
          <AuthProvider>
            <ThemeContainer>
              <AppBody />
            </ThemeContainer>
          </AuthProvider>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function ThemeContainer({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  const storageKey = session ? `user-${session.userId}` : undefined;
  return (
    <ThemeProvider storageKey={storageKey}>
      <AppStatusBar />
      <ToastProvider>{children}</ToastProvider>
    </ThemeProvider>
  );
}

function AppStatusBar() {
  const { mode } = useThemeMode();
  return (
    <StatusBar
      animated
      translucent={Platform.OS === 'ios'}
      backgroundColor="#ffffff"
      barStyle={mode === 'dark' ? 'light-content' : 'dark-content'}
    />
  );
}
