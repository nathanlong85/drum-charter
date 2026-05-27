import { describe, expect, it } from 'vitest';
import { generateId } from './id';

describe('generateId', () => {
  it('returns unique string ids', () => {
    const a = generateId();
    const b = generateId();
    expect(typeof a).toBe('string');
    expect(a.length).toBeGreaterThan(0);
    expect(a).not.toBe(b);
  });
});
