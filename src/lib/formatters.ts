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

// Formats invoice numbers: keeps first 2 chars as prefix, trims leading zeros on the numeric part,
// and pads the numeric segment to at least 8 digits (or keeps full length if already longer).
export const formatInvoiceNumber = (invoiceId?: string): string => {
  if (!invoiceId || invoiceId.length < 3) return 'Invalid ID';
  const prefix = invoiceId.slice(0, 2);
  const numericPart = invoiceId.slice(2);
  const numericValue = numericPart.replace(/^0+/, '') || '0';
  const displayPart =
    numericValue.length > 8 ? numericValue : numericValue.padStart(8, '0');
  return `${prefix}${displayPart}`;
};
