import React, { useCallback } from 'react';
import { Linking } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DashboardScreen } from './screens/DashboardScreen';
import { DayCycleScreen } from './screens/DayCycleScreen';
import { LoginScreen } from './screens/LoginScreen';
import { SplashScreen } from './screens/SplashScreen';
import { UpdateRequiredScreen } from './screens/UpdateRequiredScreen';
import { ErrorScreen } from './screens/ErrorScreen';
import { useVersionGate } from './hooks/useVersionGate';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useDayCycle } from './hooks/useDayCycle';
import { getCurrentLocation } from './services/location';

function AppBody(): React.JSX.Element {
  const { status, statusMessage, progress, versionInfo, retry, appVersion } = useVersionGate();
  const { login, logout, loading: authLoading, error: authError, remember, session } = useAuth();
  if (__DEV__ && session) {
    // eslint-disable-next-line no-console
    console.log('Logged in user session', session);
  }
  const {
    state: dayState,
    status: dayStatus,
    loading: dayLoading,
    startDay,
    endDay,
  } = useDayCycle(session?.userId);
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
    return endDay(options);
  }, [buildPayload, endDay]);

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

  if (session && dayStatus === 'not-started') {
    return (
      <DayCycleScreen
        user={session}
        status={dayStatus}
        state={dayState}
        loading={dayLoading}
        onStart={options => startDay(options)}
        onEnd={options => endDay(options)}
        getStartPayload={() => buildPayload(true)}
        getEndPayload={() => buildPayload(false)}
      />
    );
  }

  if (session) {
    return (
      <DashboardScreen
        user={session}
        onLogout={logout}
        loading={authLoading}
        dayState={dayState}
        dayStatus={dayStatus}
        dayLoading={dayLoading}
        onStartDay={startWithLocation}
        onEndDay={endWithLocation}
      />
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
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppBody />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
