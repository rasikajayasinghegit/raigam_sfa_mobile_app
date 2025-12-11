import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';

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

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.clock}>
        {ticks.map(i => {
          const isHour = i % 5 === 0;
          const angle = (i / 60) * 360;
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
                  backgroundColor: '#0f172a',
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

        <View style={[styles.handMinute, { transform: [{ rotate: `${minuteDeg}deg` }] }]} />
        <View style={[styles.handHour, { transform: [{ rotate: `${hourDeg}deg` }] }]} />
        <View style={[styles.handSecond, { transform: [{ rotate: `${secondDeg}deg` }] }]} />

        <View style={styles.centerDot} />
      </View>
      <Text style={styles.dateText}>{formatDate(now)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 8,
  },
  clock: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#f8f9fb',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  tick: {
    position: 'absolute',
    borderRadius: 6,
  },
  handHour: {
    position: 'absolute',
    width: 60,
    height: 8,
    backgroundColor: '#111',
    borderRadius: 8,
    transformOrigin: 'left center',
    left: 100,
    top: 100 - 4,
  },
  handMinute: {
    position: 'absolute',
    width: 80,
    height: 6,
    backgroundColor: '#111',
    borderRadius: 6,
    transformOrigin: 'left center',
    left: 100,
    top: 100 - 3,
  },
  handSecond: {
    position: 'absolute',
    width: 90,
    height: 2,
    backgroundColor: '#e11d48',
    borderRadius: 2,
    transformOrigin: 'left center',
    left: 100,
    top: 100 - 1,
  },
  centerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#e11d48',
  },
  dateText: {
    fontSize: 14,
    color: '#0f172a',
    fontWeight: '600',
  },
});
