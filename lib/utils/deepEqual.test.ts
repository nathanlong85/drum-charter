import { describe, expect, it } from 'vitest';
import { deepEqual } from './deepEqual';

describe('deepEqual', () => {
  it('compares primitives', () => {
    expect(deepEqual(1, 1)).toBe(true);
    expect(deepEqual(1, 2)).toBe(false);
  });

  it('compares nested objects and arrays', () => {
    const a = { x: [1, { y: 'z' }] };
    const b = { x: [1, { y: 'z' }] };
    const c = { x: [1, { y: 'w' }] };
    expect(deepEqual(a, b)).toBe(true);
    expect(deepEqual(a, c)).toBe(false);
  });
});
