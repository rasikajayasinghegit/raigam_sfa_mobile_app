import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { ColorPalette } from '../theme/colors';
import { useThemeMode } from '../context/ThemeContext';
import { useThemedStyles } from '../hooks/useThemedStyles';

function getAngles(date: Date) {
  const seconds = date.getSeconds();
  const minutes = date.getMinutes() + seconds / 60;
  const hours = date.getHours() % 12 + minutes / 60;

  return {
    hourDeg: hours * 30,
    minuteDeg: minutes * 6,
    secondDeg: seconds * 6,
  };
}

function formatDate(date: Date) {
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function ClockWidget() {
  const [now, setNow] = useState(new Date());
  const { hourDeg, minuteDeg, secondDeg } = getAngles(now);
  const ticks = useMemo(() => Array.from({ length: 60 }, (_, i) => i), []);
  const { colors } = useThemeMode();
  const styles = useThemedStyles(createStyles);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.clock}>
        {ticks.map(i => {
          const isHour = i % 5 === 0;
          const angle = (i / 60) * 360 - 90;
          const radius = 92;
          const size = isHour ? 6 : 3;
          return (
            <View
              key={i}
                style={[
                  styles.tick,
                  {
                    width: size,
                    height: size,
                    backgroundColor: colors.text,
                    opacity: isHour ? 0.9 : 0.6,
                    transform: [
                      { rotate: `${angle}deg` },
                      { translateY: -radius },
                    ],
                },
              ]}
            />
          );
        })}

        <View style={[styles.handContainer, { transform: [{ rotate: `${hourDeg - 90}deg` }] }]}>
          <View style={styles.handHour} />
        </View>
        <View style={[styles.handContainer, { transform: [{ rotate: `${minuteDeg - 90}deg` }] }]}>
          <View style={styles.handMinute} />
        </View>
        <View style={[styles.handContainer, { transform: [{ rotate: `${secondDeg - 90}deg` }] }]}>
          <View style={styles.handSecond} />
        </View>

        <View style={styles.centerDot} />
      </View>
      <Text style={styles.dateText}>{formatDate(now)}</Text>
    </View>
  );
}

const createStyles = (palette: ColorPalette) =>
  StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 8,
  },
  clock: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: palette.surfaceMuted,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: palette.shadow,
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  tick: {
    position: 'absolute',
    borderRadius: 6,
  },
  handContainer: {
    position: 'absolute',
    width: 0,
    height: 0,
    left: 100,
    top: 100,
  },
  handHour: {
    position: 'absolute',
    width: 60,
    height: 8,
    backgroundColor: palette.text,
    borderRadius: 8,
    left: 0,
    top: -4,
  },
  handMinute: {
    position: 'absolute',
    width: 80,
    height: 6,
    backgroundColor: palette.text,
    borderRadius: 6,
    left: 0,
    top: -3,
  },
  handSecond: {
    position: 'absolute',
    width: 90,
    height: 2,
    backgroundColor: palette.danger,
    borderRadius: 2,
    left: 0,
    top: -1,
  },
  centerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: palette.danger,
  },
  dateText: {
    fontSize: 16,
    color: palette.text,
    fontWeight: '700',
    marginTop: 4,
  },
  });
