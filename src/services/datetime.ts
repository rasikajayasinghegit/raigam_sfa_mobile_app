export type DateTime12h = {
  date: string; // e.g., 12/11/2025 or locale format
  time: string; // e.g., 11:48 AM
  iso: string; // ISO string for storage/audit
};

// Returns the current local date/time in 12h format plus ISO.
export function getCurrentDateTime12h(): DateTime12h {
  const now = new Date();
  const date = now.toLocaleDateString(undefined, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const time = now.toLocaleTimeString(undefined, {
    hour12: true,
    hour: '2-digit',
    minute: '2-digit',
  });

  return {
    date,
    time,
    iso: now.toISOString(),
  };
}
