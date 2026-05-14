import '@testing-library/jest-dom';
import type React from 'react';
import { vi } from 'vitest';

// Mock ViewTransition for Vitest
vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>();
  return {
    ...actual,
    ViewTransition: ({ children }: { children: React.ReactNode }) => children,
  };
});

// Mock ResizeObserver for Radix UI components
class MockResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

(window as unknown as typeof window).ResizeObserver = MockResizeObserver;

// Mock AudioContext for all tests
class MockAudioContext {
  createGain() {
    return {
      gain: { value: 0, setValueAtTime: vi.fn() },
      connect: vi.fn(),
    };
  }
  createBufferSource() {
    return {
      buffer: null,
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      onended: null,
    };
  }
  decodeAudioData() {
    return Promise.resolve({});
  }
  resume() {
    return Promise.resolve();
  }
  close() {
    return Promise.resolve();
  }
  currentTime = 0;
  destination = {};
}

(window as unknown as typeof window).AudioContext = MockAudioContext;
(window as unknown as typeof window).webkitAudioContext = MockAudioContext;

// Mock fetch for all tests
global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  status: 200,
  arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
});

// Mock window methods not implemented in JSDOM
if (typeof window !== 'undefined') {
  window.alert = vi.fn();
  window.confirm = vi.fn(() => true);

  // Mock crypto for JSDOM
  if (!window.crypto) {
    (window as unknown as typeof window).crypto = {
      randomUUID: () => `test-uuid-${Math.random().toString(36).slice(2, 9)}`,
    };
  }
}
