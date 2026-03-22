import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useRemoteControl } from '../useRemoteControl';

// Mock lodash debounce to be synchronous
vi.mock('lodash', async (importOriginal) => {
  const actual = await importOriginal<typeof import('lodash')>();
  return {
    ...actual,
    debounce: vi.fn((fn: (...args: unknown[]) => void) => {
      const debounced = (...args: unknown[]) => fn(...args);
      debounced.cancel = vi.fn();
      debounced.flush = vi.fn();
      return debounced;
    }),
  };
});

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

const createMockKeyboardEvent = (key: string, isInteractive = false) => {
  const event = new KeyboardEvent('keydown', { key });
  // Mock active element if needed for interactive checks
  if (isInteractive) {
    const btn = document.createElement('button');
    document.body.appendChild(btn);
    btn.focus();
  } else {
    (document.activeElement as HTMLElement)?.blur();
  }
  return event;
};

interface MidiMessageMock {
  data: Uint8Array;
}

interface MidiInputMock {
  id: string;
  name: string;
  type: 'input';
  state: 'connected' | 'disconnected';
  onmidimessage: ((event: MidiMessageMock) => void) | null;
}

interface MidiAccessMock {
  inputs: {
    size: number;
    values: () => IterableIterator<MidiInputMock>;
  };
  addEventListener: (type: 'statechange', handler: EventListener) => void;
  removeEventListener: (type: 'statechange', handler: EventListener) => void;
  onstatechange: null;
}

describe('useRemoteControl', () => {
  const mockOnAction = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    // Reset DOM
    document.body.innerHTML = '';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('loads default config if no local storage exists', () => {
    const { result } = renderHook(() =>
      useRemoteControl({ onAction: mockOnAction, isActive: true }),
    );
    expect(result.current.config.keyboard.arrowright).toContain('next_section');
  });

  it('loads config from local storage and deep merges with defaults', () => {
    const customConfig = {
      keyboard: { j: ['next_section'] },
      midi: { '144:36': ['prev_section'] },
    };
    localStorage.setItem('drumcharter_remote_config', JSON.stringify(customConfig));

    const { result } = renderHook(() =>
      useRemoteControl({ onAction: mockOnAction, isActive: true }),
    );

    // Custom mapping exists
    expect(result.current.config.keyboard.j).toContain('next_section');
    expect(result.current.config.midi['144:36']).toContain('prev_section');

    // Default mapping still exists (deep merge)
    expect(result.current.config.keyboard.arrowright).toContain('next_section');
  });

  it('filters invalid actions when loading from local storage', () => {
    const corruptedConfig = {
      keyboard: {
        j: ['next_section', 'invalid_action' as any],
        k: 'invalid_string' as any,
      },
    };
    localStorage.setItem('drumcharter_remote_config', JSON.stringify(corruptedConfig));

    const { result } = renderHook(() =>
      useRemoteControl({ onAction: mockOnAction, isActive: true }),
    );

    // Valid action preserved
    expect(result.current.config.keyboard.j).toEqual(['next_section']);
    // Invalid action filtered out, default preserved
    expect(result.current.config.keyboard.arrowright).toContain('next_section');
  });

  it('triggers onAction for default mapped keys', () => {
    renderHook(() => useRemoteControl({ onAction: mockOnAction, isActive: true }));

    act(() => {
      window.dispatchEvent(createMockKeyboardEvent('ArrowRight'));
    });

    expect(mockOnAction).toHaveBeenCalledWith('next_section');
  });

  it('does not trigger onAction if isActive is false', () => {
    renderHook(() => useRemoteControl({ onAction: mockOnAction, isActive: false }));

    act(() => {
      window.dispatchEvent(createMockKeyboardEvent('ArrowRight'));
    });

    expect(mockOnAction).not.toHaveBeenCalled();
  });

  it('does not trigger onAction if focused on interactive element (unless escape)', () => {
    renderHook(() => useRemoteControl({ onAction: mockOnAction, isActive: true }));

    act(() => {
      // Simulate focus on a button
      window.dispatchEvent(createMockKeyboardEvent('ArrowRight', true));
    });

    expect(mockOnAction).not.toHaveBeenCalled();

    act(() => {
      // Escape should still work
      window.dispatchEvent(createMockKeyboardEvent('Escape', true));
    });

    expect(mockOnAction).toHaveBeenCalledWith('exit_live_mode');
  });

  it('maps a new keyboard key when listening', () => {
    const { result } = renderHook(() =>
      useRemoteControl({ onAction: mockOnAction, isActive: true }),
    );

    act(() => {
      result.current.listenForMap('next_section');
    });

    expect(result.current.isListeningForMap).toBe('next_section');

    act(() => {
      window.dispatchEvent(createMockKeyboardEvent('k'));
    });

    expect(result.current.isListeningForMap).toBe(null);
    expect(result.current.config.keyboard.k).toContain('next_section');
    expect(result.current.lastEventMsg).toBe('Keyboard: k');

    // Original arrowright should still exist (multi-value list)
    expect(result.current.config.keyboard.arrowright).toContain('next_section');

    // Check local storage
    const stored = JSON.parse(localStorage.getItem('drumcharter_remote_config') || '{}');
    expect(stored.keyboard.k).toContain('next_section');
  });

  it('resets config to default', () => {
    const { result } = renderHook(() =>
      useRemoteControl({ onAction: mockOnAction, isActive: true }),
    );

    act(() => {
      result.current.listenForMap('next_section');
    });

    act(() => {
      window.dispatchEvent(createMockKeyboardEvent('k'));
    });

    act(() => {
      result.current.resetConfig();
    });

    expect(result.current.config.keyboard.arrowright).toContain('next_section');
    expect(result.current.config.keyboard.k).toBeUndefined();
  });

  describe('Web MIDI', () => {
    let mockInputs: Map<string, MidiInputMock>;
    let mockMidiAccess: MidiAccessMock;

    beforeEach(() => {
      vi.useRealTimers();
      mockInputs = new Map();
      const mockInput: MidiInputMock = {
        id: 'input1',
        name: 'Mock MIDI Input',
        type: 'input',
        state: 'connected',
        onmidimessage: null,
      };
      mockInputs.set('input1', mockInput);

      mockMidiAccess = {
        inputs: {
          get size() {
            return mockInputs.size;
          },
          values: vi.fn(() => mockInputs.values()),
        },
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        onstatechange: null,
      };

      Object.defineProperty(navigator, 'requestMIDIAccess', {
        writable: true,
        value: vi.fn().mockResolvedValue(mockMidiAccess),
      });
    });

    it('sets up MIDI listeners and handles messages', async () => {
      const { result } = renderHook(() =>
        useRemoteControl({ onAction: mockOnAction, isActive: true }),
      );

      // Verify midiSupported is true (async state update)
      await waitFor(() => {
        expect(result.current.midiSupported).toBe(true);
      });

      const mockInput = mockInputs.get('input1')!;
      await waitFor(() => {
        expect(mockInput.onmidimessage).toBeInstanceOf(Function);
      });

      expect(result.current.midiConnected).toBe(true);

      // Simulate mapping a MIDI event
      act(() => {
        result.current.listenForMap('next_section');
      });

      // Simulate Note On (144) for Note 36 with velocity 100
      act(() => {
        mockInput.onmidimessage!({
          data: new Uint8Array([144, 36, 100]),
        });
      });

      expect(result.current.isListeningForMap).toBe(null);
      expect(result.current.config.midi['144:36']).toContain('next_section');

      // Now trigger the action via MIDI
      act(() => {
        mockInput.onmidimessage!({
          data: new Uint8Array([144, 36, 127]), // Same note, different velocity
        });
      });

      expect(mockOnAction).toHaveBeenCalledWith('next_section');
    });

    it('ignores Note Off and release-side messages', async () => {
      const { result } = renderHook(() =>
        useRemoteControl({ onAction: mockOnAction, isActive: true }),
      );

      const mockInput = mockInputs.get('input1')!;
      await waitFor(() => {
        expect(mockInput.onmidimessage).toBeInstanceOf(Function);
      });

      act(() => {
        result.current.listenForMap('next_section');
      });

      // 1. Simulate Note Off (128)
      act(() => {
        mockInput.onmidimessage!({
          data: new Uint8Array([128, 36, 0]),
        });
      });
      expect(result.current.isListeningForMap).toBe('next_section');

      // 2. Simulate Note On with velocity 0 (144)
      act(() => {
        mockInput.onmidimessage!({
          data: new Uint8Array([144, 36, 0]),
        });
      });
      expect(result.current.isListeningForMap).toBe('next_section');

      // 3. Simulate CC release/value 0 (176)
      act(() => {
        mockInput.onmidimessage!({
          data: new Uint8Array([176, 64, 0]),
        });
      });
      expect(result.current.isListeningForMap).toBe('next_section');
    });

    it('updates midiConnected and rewires on statechange', async () => {
      const { result } = renderHook(() =>
        useRemoteControl({ onAction: mockOnAction, isActive: true }),
      );

      await waitFor(() => {
        expect(mockMidiAccess.addEventListener).toHaveBeenCalledWith(
          'statechange',
          expect.any(Function),
        );
      });

      const stateChangeHandler = vi.mocked(mockMidiAccess.addEventListener).mock.calls[0][1] as (
        e: any,
      ) => void;

      // Simulate device disconnection
      mockInputs.clear();
      act(() => {
        stateChangeHandler({
          port: { id: 'input1', type: 'input', state: 'disconnected' },
        });
      });

      expect(result.current.midiConnected).toBe(false);

      // Simulate device connection
      const newInput: MidiInputMock = {
        id: 'input2',
        name: 'New Input',
        type: 'input',
        state: 'connected',
        onmidimessage: null,
      };
      mockInputs.set('input2', newInput);

      act(() => {
        stateChangeHandler({
          port: newInput,
        });
      });

      expect(result.current.midiConnected).toBe(true);
      expect(newInput.onmidimessage).toBeInstanceOf(Function);
    });
  });
});
