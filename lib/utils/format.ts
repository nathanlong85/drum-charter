/**
 * Safely formats a timestamp string or null to a localized date string.
 * Returns a fallback string if the timestamp is missing or invalid.
 */
export function formatTimestamp(
  value: string | null | undefined,
  options: Intl.DateTimeFormatOptions = { dateStyle: 'medium' },
  fallback: string = '—',
): string {
  if (!value) return fallback;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    console.warn(`Invalid date encountered: ${value}`);
    return fallback;
  }

  return date.toLocaleString(undefined, options);
}

/**
 * Specifically for short date formatting (e.g. in lists/cards).
 */
export function formatDate(value: string | null | undefined, fallback: string = '—'): string {
  return formatTimestamp(value, { dateStyle: 'medium' }, fallback);
}

/**
 * Specifically for full date/time formatting (e.g. in view pages).
 */
export function formatDateTime(value: string | null | undefined, fallback: string = '—'): string {
  return formatTimestamp(
    value,
    {
      dateStyle: 'medium',
      timeStyle: 'short',
    },
    fallback,
  );
}
