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

// @ts-expect-error
window.AudioContext = MockAudioContext;
// @ts-expect-error
window.webkitAudioContext = MockAudioContext;

// Mock fetch for all tests
global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  status: 200,
  arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
});
