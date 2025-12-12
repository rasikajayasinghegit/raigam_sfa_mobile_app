import React, { useCallback, useEffect } from 'react';
import { Linking, StatusBar, Platform } from 'react-native';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
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
              dayState={dayState}
              dayStatus={dayStatus}
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
