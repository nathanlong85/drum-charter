import { describe, expect, it } from 'vitest';
import { deepEqual } from './deepEqual';

describe('deepEqual', () => {
  it('compares primitives', () => {
    expect(deepEqual(1, 1)).toBe(true);
    expect(deepEqual(1, 2)).toBe(false);
  });

  it('compares Date objects by time value', () => {
    const a = new Date('2024-01-01T00:00:00Z');
    const b = new Date('2024-01-01T00:00:00Z');
    const c = new Date('2024-01-02T00:00:00Z');
    expect(deepEqual(a, b)).toBe(true);
    expect(deepEqual(a, c)).toBe(false);
  });

  it('distinguishes Date from plain object', () => {
    const date = new Date('2024-01-01T00:00:00Z');
    expect(deepEqual(date, {})).toBe(false);
    expect(deepEqual({}, date)).toBe(false);
  });

  it('differs when keys differ with undefined values', () => {
    expect(deepEqual({ a: undefined }, { b: undefined })).toBe(false);
    expect(deepEqual({ a: 1 }, { a: 1, b: undefined })).toBe(false);
  });

  it('compares nested objects and arrays', () => {
    const a = { x: [1, { y: 'z' }] };
    const b = { x: [1, { y: 'z' }] };
    const c = { x: [1, { y: 'w' }] };
    expect(deepEqual(a, b)).toBe(true);
    expect(deepEqual(a, c)).toBe(false);
  });
});
