import React, { useMemo, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Alarm, MoonStars, Sun } from 'phosphor-react-native';
import { AppHeader } from '../components/AppHeader';
import { colors } from '../theme/colors';
import { LoginPayload } from '../services/auth';
import { DayCycleState } from '../services/dayCycle';
import { ScreenBackground } from '../components/ScreenBackground';
import { ClockWidget } from '../components/ClockWidget';
import { LogoutConfirm } from '../components/LogoutConfirm';

type Props = {
  user: LoginPayload;
  status: 'not-started' | 'in-progress' | 'completed';
  state: DayCycleState | null;
  loading: boolean;
  onStart: (options: { gpsStatus: boolean; latitude: number; longitude: number }) => Promise<void>;
  onEnd: (options: { gpsStatus: boolean; latitude: number; longitude: number }) => Promise<void>;
  onLogout?: () => void | Promise<void>;
  onContinue?: () => void;
  getStartPayload: () => Promise<{
    display: {
      userId: number;
      gpsStatus: boolean;
      latitude: number;
      longitude: number;
      isCheckIn: boolean;
      isCheckOut: boolean;
    };
    options: { gpsStatus: boolean; latitude: number; longitude: number };
  }>;
  getEndPayload: () => Promise<{
    display: {
      userId: number;
      gpsStatus: boolean;
      latitude: number;
      longitude: number;
      isCheckIn: boolean;
      isCheckOut: boolean;
    };
    options: { gpsStatus: boolean; latitude: number; longitude: number };
  }>;
};

export function DayCycleScreen({
  user,
  status,
  state: _state,
  loading,
  onStart,
  onEnd: _onEnd,
  onLogout,
  onContinue,
  getStartPayload,
  getEndPayload: _getEndPayload,
}: Props) {
  const [message, setMessage] = useState<string | null>(null);
  const [showLogout, setShowLogout] = useState(false);

  const headline = useMemo(() => {
    if (status === 'not-started') return 'Start your day';
    if (status === 'in-progress') return 'Day in progress';
    return 'Day completed';
  }, [status]);

  const handleStart = async () => {
    const { options } = await getStartPayload();

    setMessage(null);
    try {
      await onStart(options);
      setMessage('Day started. Opening dashboard...');
      onContinue?.();
    } catch (err: any) {
      setMessage(err?.message || 'Unable to start day.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScreenBackground />
      <AppHeader
        title="Day Cycle"
        hideBack
        onRightPress={() => {
          if (!onLogout) return;
          setShowLogout(true);
        }}
      />
      <View style={styles.body}>
        <View style={styles.hero}>
          <ClockWidget />
          <View style={styles.badge}>
            {status === 'in-progress' ? (
              <Sun size={28} color={colors.primary} weight="duotone" />
            ) : status === 'completed' ? (
              <MoonStars size={28} color="#0f172a" weight="duotone" />
            ) : (
              <Alarm size={28} color={colors.primary} weight="duotone" />
            )}
          </View>
          <Text style={styles.title}>{headline}</Text>
          <Text style={styles.subtitle}>
            Welcome, {user.personalName || user.userName}. Tap start to begin your route.
          </Text>
        </View>

        {message ? <Text style={styles.message}>{message}</Text> : null}

        <View style={styles.actions}>
          <TouchableOpacity
            style={[
              styles.button,
              styles.primary,
              (status !== 'not-started' || loading) && styles.disabled,
            ]}
            onPress={handleStart}
            disabled={status !== 'not-started' || loading}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryText}>
              {loading && status === 'not-started' ? 'Starting...' : 'Start Day'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <LogoutConfirm
        visible={showLogout}
        onConfirm={() => {
          setShowLogout(false);
          onLogout?.();
        }}
        onCancel={() => setShowLogout(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  body: {
    flex: 1,
    padding: 20,
    gap: 20,
    justifyContent: 'center',
  },
  hero: {
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginTop: 8,
  },
  subtitle: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 15,
  },
  message: {
    color: colors.textMuted,
    fontSize: 13,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
    paddingBottom: 24,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 180,
    marginTop: 20,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  primaryText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  secondaryText: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 15,
  },
  disabled: {
    opacity: 0.6,
  },
});
