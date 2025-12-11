import React, { useMemo, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  Alarm,
  ArrowClockwise,
  MoonStars,
  Sun,
  ShieldCheck,
  MapPin,
  WifiHigh,
} from 'phosphor-react-native';
import { AppHeader } from '../components/AppHeader';
import { colors } from '../theme/colors';
import { LoginPayload } from '../services/auth';
import { DayCycleState, clearDayCycle } from '../services/dayCycle';
import { ScreenBackground } from '../components/ScreenBackground';
import { getCurrentDateTime12h } from '../services/datetime';
import { ClockWidget } from '../components/ClockWidget';

type Props = {
  user: LoginPayload;
  status: 'not-started' | 'in-progress' | 'completed';
  state: DayCycleState | null;
  loading: boolean;
  onStart: (options: {
    gpsStatus: boolean;
    latitude: number;
    longitude: number;
  }) => Promise<void>;
  onEnd: (options: {
    gpsStatus: boolean;
    latitude: number;
    longitude: number;
  }) => Promise<void>;
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
  state,
  loading,
  onStart,
  onEnd,
  onContinue,
  getStartPayload,
  getEndPayload,
}: Props) {
  const [message, setMessage] = useState<string | null>(null);

  const headline = useMemo(() => {
    if (status === 'not-started') return 'Start your day';
    if (status === 'in-progress') return 'Day in progress';
    return 'Day completed';
  }, [status]);

  const now = getCurrentDateTime12h();

  const handleStart = async () => {
    const { display, options } = await getStartPayload();
    const proceed = await new Promise<boolean>(resolve => {
      const body = `userId: ${display.userId}
gpsStatus: ${display.gpsStatus}
latitude: ${display.latitude}
longitude: ${display.longitude}
isCheckIn: ${display.isCheckIn}
isCheckOut: ${display.isCheckOut}`;
      Alert.alert('Start Day', body, [
        { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
        { text: 'Start', style: 'default', onPress: () => resolve(true) },
      ]);
    });
    if (!proceed) {
      return;
    }

    setMessage(null);
    try {
      await onStart(options);
      setMessage('Day started. Opening dashboard...');
      if (onContinue) {
        onContinue();
      }
    } catch (err: any) {
      setMessage(err?.message || 'Unable to start day.');
    }
  };

  const handleEnd = async () => {
    const { display, options } = await getEndPayload();
    const proceed = await new Promise<boolean>(resolve => {
      const body = `userId: ${display.userId}
gpsStatus: ${display.gpsStatus}
latitude: ${display.latitude}
longitude: ${display.longitude}
isCheckIn: ${display.isCheckIn}
isCheckOut: ${display.isCheckOut}`;
      Alert.alert('End Day', body, [
        { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
        { text: 'End Day', style: 'default', onPress: () => resolve(true) },
      ]);
    });
    if (!proceed) {
      return;
    }

    setMessage(null);
    try {
      await onEnd(options);
      setMessage('Day ended.');
      if (onContinue) {
        onContinue();
      }
    } catch (err: any) {
      setMessage(err?.message || 'Unable to end day.');
    }
  };

  const resetLocal = async () => {
    setMessage(null);
    await clearDayCycle(user.userId);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScreenBackground />
      <AppHeader title="Day Cycle" hideBack />
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
            Welcome, {user.personalName || user.userName}. Tap start to begin
            your route.
          </Text>
          <Text style={styles.dateClock}>
            {now.date} • {now.time}
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
              {loading && status === 'not-started'
                ? 'Starting...'
                : 'Start Day'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
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
  dateClock: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    shadowColor: colors.shadow,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
    gap: 12,
  },
  value: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  valueMuted: {
    color: colors.textMuted,
    fontSize: 12,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  statusMuted: {
    borderColor: colors.border,
    backgroundColor: '#f8fafc',
  },
  statusInfo: {
    borderColor: '#c7e3ff',
    backgroundColor: '#e5f1ff',
  },
  statusSuccess: {
    borderColor: '#bbf7d0',
    backgroundColor: '#ecfdf3',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  statusTextMuted: {
    color: colors.textMuted,
  },
  statusTextInfo: {
    color: '#1d4ed8',
  },
  statusTextSuccess: {
    color: '#15803d',
  },
  highlights: {
    gap: 10,
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  highlightText: {
    color: colors.text,
    fontSize: 14,
    flexShrink: 1,
  },
  message: {
    color: colors.textMuted,
    fontSize: 13,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
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
