const lightPalette = {
  background: '#f2f4f7',
  surface: '#ffffff',
  surfaceMuted: '#f8fafc',
  surfaceAlt: '#f6f7fb',
  surfaceSoft: '#f5f7fb',
  primary: '#2563eb',
  primaryDark: '#1d4ed8',
  primarySoft: '#e0ebff',
  accent: '#5a48f7',
  accentSoft: '#ede9ff',
  secondary: '#4338ca',
  secondarySoft: '#e7e9ff',
  text: '#0f172a',
  textMuted: '#6b7280',
  textSecondary: '#475569',
  textSubtle: '#94a3b8',
  placeholder: '#9ca3af',
  heading: '#1f2937',
  border: '#e5e7eb',
  borderMuted: '#d1d5db',
  borderStrong: '#cbd5e1',
  borderAlt: '#e2e8f0',
  borderInfo: '#c7e3ff',
  borderSuccess: '#bbf7d0',
  borderWarning: '#fed7aa',
  borderDanger: '#fecdd3',
  success: '#15803d',
  successSoft: '#ecfdf3',
  warning: '#b45309',
  warningSoft: '#fff7ed',
  danger: '#b91c1c',
  dangerSoft: '#fef2f2',
  info: '#0f766e',
  infoSoft: '#e1fff4',
  infoAlt: '#1d4ed8',
  disabled: '#e2e8f0',
  divider: 'rgba(15,23,42,0.08)',
  overlay: 'rgba(15,23,42,0.35)',
  white: '#ffffff',
  black: '#000000',
  shadow: '#000000',
} as const;

export type ColorPalette = typeof lightPalette;

export type ThemeMode = 'light' | 'dark';

const darkPalette: ColorPalette = {
  background: '#020617',
  surface: '#0f172a',
  surfaceMuted: '#1e293b',
  surfaceAlt: '#111827',
  surfaceSoft: '#1c2438',
  primary: '#5b8dff',
  primaryDark: '#93b4ff',
  primarySoft: '#17254a',
  accent: '#a78bfa',
  accentSoft: '#312e81',
  secondary: '#c084fc',
  secondarySoft: '#3730a3',
  text: '#f8fafc',
  textMuted: '#cbd5f5',
  textSecondary: '#94a3b8',
  textSubtle: '#7c88a8',
  placeholder: '#7c88a8',
  heading: '#e2e8f0',
  border: '#1e293b',
  borderMuted: '#27354a',
  borderStrong: '#334155',
  borderAlt: '#273045',
  borderInfo: '#1b335f',
  borderSuccess: '#1e3a31',
  borderWarning: '#422006',
  borderDanger: '#3f1313',
  success: '#34d399',
  successSoft: '#0f2a22',
  warning: '#fb923c',
  warningSoft: '#3b2512',
  danger: '#f87171',
  dangerSoft: '#3c1717',
  info: '#38bdf8',
  infoSoft: '#10253d',
  infoAlt: '#5b8dff',
  disabled: '#334155',
  divider: 'rgba(148,163,184,0.25)',
  overlay: 'rgba(2,6,23,0.65)',
  white: '#f8fafc',
  black: '#000000',
  shadow: '#000000',
};

const lightGradients = {
  background: ['#ffffff', '#f5f7ff', '#ede9ff', '#dcd6ff', '#f8d6d6'],
  invoiceHero: ['#dfe9ff', '#f5f7fb'],
  outletHero: ['#e1fff4', '#f5fffb'],
  reportHero: ['#e9f3ff', '#f6fbff'],
  surveyHero: ['#e7e9ff', '#f7f7ff'],
};

export type GradientPalette = typeof lightGradients;

const darkGradients: GradientPalette = {
  background: ['#020617', '#0f172a', '#111b2f', '#0b1324', '#050b17'],
  invoiceHero: ['#101b33', '#10172a'],
  outletHero: ['#0f2a22', '#0c1f19'],
  reportHero: ['#101731', '#111827'],
  surveyHero: ['#121332', '#0f1025'],
};

const runtimeColors: ColorPalette = { ...lightPalette };
const runtimeGradients: GradientPalette = { ...lightGradients };

export const colors = runtimeColors;
export const gradients = runtimeGradients;

const assignPalette = <T extends Record<string, any>>(
  target: T,
  source: T,
) => {
  (Object.keys(source) as Array<keyof T>).forEach(key => {
    target[key] = source[key];
  });
};

export const getPalette = (mode: ThemeMode) =>
  mode === 'dark' ? darkPalette : lightPalette;

export const getGradients = (mode: ThemeMode) =>
  mode === 'dark' ? darkGradients : lightGradients;

export const applyThemeColors = (mode: ThemeMode) => {
  assignPalette(runtimeColors, getPalette(mode));
  assignPalette(runtimeGradients, getGradients(mode));
};
