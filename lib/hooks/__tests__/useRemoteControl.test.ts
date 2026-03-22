import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useRemoteControl } from '../useRemoteControl';

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
    expect(result.current.config.keyboard.arrowright).toBe('next_section');
  });

  it('loads config from local storage and deep merges with defaults', () => {
    const customConfig = {
      keyboard: { j: 'next_section' },
      midi: { '144:36': 'prev_section' },
    };
    localStorage.setItem('drumcharter_remote_config', JSON.stringify(customConfig));

    const { result } = renderHook(() =>
      useRemoteControl({ onAction: mockOnAction, isActive: true }),
    );

    // Custom mapping exists
    expect(result.current.config.keyboard.j).toBe('next_section');
    expect(result.current.config.midi['144:36']).toBe('prev_section');

    // Default mapping still exists (deep merge)
    expect(result.current.config.keyboard.arrowright).toBe('next_section');
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
    expect(result.current.config.keyboard.k).toBe('next_section');
    expect(result.current.lastEventMsg).toBe('Keyboard: k');

    // Original arrowright should have been removed since it was remapped?
    // Actually the logic removes the action from other keys.
    expect(result.current.config.keyboard.arrowright).toBeUndefined();

    // Check local storage
    const stored = JSON.parse(localStorage.getItem('drumcharter_remote_config') || '{}');
    expect(stored.keyboard.k).toBe('next_section');
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

    expect(result.current.config.keyboard.arrowright).toBe('next_section');
    expect(result.current.config.keyboard.k).toBeUndefined();
  });

  describe('Web MIDI', () => {
    let mockInputs: Map<string, any>;
    let mockMidiAccess: any;

    beforeEach(() => {
      vi.useRealTimers();
      mockInputs = new Map();
      const mockInput = {
        onmidimessage: null,
      };
      mockInputs.set('input1', mockInput);

      mockMidiAccess = {
        inputs: {
          values: vi.fn(() => mockInputs.values()),
        },
        set onstatechange(_cb: (...args: any[]) => void) {
          // just mock setter
        },
      };

      Object.defineProperty(navigator, 'requestMIDIAccess', {
        writable: true,
        value: vi.fn().mockReturnValue({
          // biome-ignore lint/suspicious/noThenProperty: Manual thenable is required for synchronous MIDI mock in tests.
          then: (resolve: (access: any) => void) => {
            resolve(mockMidiAccess);
            return { catch: vi.fn() };
          },
        }),
      });
    });

    it('sets up MIDI listeners and handles messages', async () => {
      const { result } = renderHook(() =>
        useRemoteControl({ onAction: mockOnAction, isActive: true }),
      );

      const mockInput = mockInputs.get('input1');
      await waitFor(() => {
        expect(mockInput.onmidimessage).toBeInstanceOf(Function);
      });

      expect(result.current.midiSupported).toBe(true);
      expect(result.current.midiConnected).toBe(true);

      // Simulate mapping a MIDI event
      act(() => {
        result.current.listenForMap('next_section');
      });

      // Simulate Note On (144) for Note 36 with velocity 100
      act(() => {
        mockInput.onmidimessage({
          data: new Uint8Array([144, 36, 100]),
        });
      });

      expect(result.current.isListeningForMap).toBe(null);
      expect(result.current.config.midi['144:36']).toBe('next_section');

      // Now trigger the action via MIDI
      act(() => {
        mockInput.onmidimessage({
          data: new Uint8Array([144, 36, 127]), // Same note, different velocity
        });
      });

      expect(mockOnAction).toHaveBeenCalledWith('next_section');
    });

    it('ignores Note Off messages for mapping', async () => {
      const { result } = renderHook(() =>
        useRemoteControl({ onAction: mockOnAction, isActive: true }),
      );

      const mockInput = mockInputs.get('input1');
      await waitFor(() => {
        expect(mockInput.onmidimessage).toBeInstanceOf(Function);
      });

      act(() => {
        result.current.listenForMap('next_section');
      });

      // Simulate Note Off (velocity 0)
      act(() => {
        mockInput.onmidimessage({
          data: new Uint8Array([144, 36, 0]),
        });
      });

      // Should still be listening, Note Off was ignored
      expect(result.current.isListeningForMap).toBe('next_section');
    });
  });
});
