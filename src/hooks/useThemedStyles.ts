import { useMemo } from 'react';
import { useThemeMode } from '../context/ThemeContext';
import { ColorPalette } from '../theme/colors';

export function useThemedStyles<T>(factory: (palette: ColorPalette) => T): T {
  const { colors } = useThemeMode();
  return useMemo(() => factory(colors), [colors, factory]);
}

export function useThemeColors() {
  const { colors } = useThemeMode();
  return colors;
}
