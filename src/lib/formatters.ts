// Common formatting helpers for displaying numbers consistently across the app.
type PercentageOptions = {
  fractionDigits?: number;
  fallback?: string;
};

type CurrencyOptions = {
  locale?: string;
  prefix?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  fallback?: string;
};

export const formatPercentage = (
  num: number | null | undefined,
  { fractionDigits = 2, fallback = 'N/A' }: PercentageOptions = {},
): string => {
  if (num === null || num === undefined || !Number.isFinite(num)) {
    return fallback;
  }
  return `${num.toFixed(fractionDigits)}%`;
};

export const formatCurrency = (
  num: number | null | undefined,
  {
    locale = 'en-LK',
    prefix = 'Rs.',
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
    fallback = 'N/A',
  }: CurrencyOptions = {},
): string => {
  if (num === null || num === undefined || !Number.isFinite(num)) {
    return fallback;
  }

  const formatted = num.toLocaleString(locale, {
    minimumFractionDigits,
    maximumFractionDigits,
  });

  return `${prefix} ${formatted}`;
};
