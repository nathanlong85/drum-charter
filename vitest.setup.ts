import '@testing-library/jest-dom';
import { vi } from 'vitest';

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

// @ts-expect-error - The test environment lacks a real AudioContext and we are assigning a mock implementation.
window.AudioContext = MockAudioContext as any;
// @ts-expect-error - The test environment lacks a real webkitAudioContext and we are assigning a mock implementation.
window.webkitAudioContext = MockAudioContext as any;

// Mock fetch for all tests
global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  status: 200,
  arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
});
