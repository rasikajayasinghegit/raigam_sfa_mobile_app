import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ThemeMode,
  applyThemeColors,
  getPalette,
  getGradients,
} from '../theme/colors';

type ThemeContextValue = {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  colors: ReturnType<typeof getPalette>;
  gradients: ReturnType<typeof getGradients>;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = 'app.theme.mode';

type ThemeProviderProps = {
  children: React.ReactNode;
  storageKey?: string;
};

export function ThemeProvider({ children, storageKey }: ThemeProviderProps) {
  const [mode, setMode] = useState<ThemeMode>('light');
  const [hydrated, setHydrated] = useState(false);
  const key = storageKey ? `${STORAGE_KEY}:${storageKey}` : STORAGE_KEY;

  useEffect(() => {
    let isMounted = true;
    setHydrated(false);
    AsyncStorage.getItem(key)
      .then(value => {
        if (!isMounted) return;
        if (value === 'dark' || value === 'light') {
          setMode(value);
        } else {
          setMode('light');
        }
      })
      .finally(() => {
        if (isMounted) {
          setHydrated(true);
        }
      });
    return () => {
      isMounted = false;
    };
  }, [key]);

  useEffect(() => {
    applyThemeColors(mode);
  }, [mode]);

  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(key, mode).catch(() => {});
  }, [mode, key, hydrated]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      setMode,
      toggleMode: () => setMode(prev => (prev === 'light' ? 'dark' : 'light')),
      colors: getPalette(mode),
      gradients: getGradients(mode),
    }),
    [mode],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useThemeMode() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeMode must be used within ThemeProvider');
  }
  return context;
}
