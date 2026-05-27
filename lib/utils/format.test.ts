import { describe, expect, it, vi } from 'vitest';
import { formatDate, formatDateTime, formatTimestamp } from './format';

describe('formatTimestamp', () => {
  it('returns fallback for nullish values', () => {
    expect(formatTimestamp(null)).toBe('—');
    expect(formatTimestamp(undefined, {}, 'N/A')).toBe('N/A');
  });

  it('returns fallback for invalid dates', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(formatTimestamp('not-a-date')).toBe('—');
    warn.mockRestore();
  });

  it('formats valid ISO strings', () => {
    const result = formatTimestamp('2024-06-15T12:00:00.000Z', { dateStyle: 'short' });
    expect(result).not.toBe('—');
    expect(result.length).toBeGreaterThan(0);
  });
});

describe('formatDate', () => {
  it('delegates to formatTimestamp', () => {
    expect(formatDate(null)).toBe('—');
  });
});

describe('formatDateTime', () => {
  it('delegates to formatTimestamp', () => {
    expect(formatDateTime(null)).toBe('—');
  });
});
