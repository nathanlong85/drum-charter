import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAudioPlayback } from '../useAudioPlayback';
import { GrooveGrid, DrumSymbol } from '@/lib/types/groove';

// Mock AudioContext
const mockSetValueAtTime = vi.fn();
const mockConnect = vi.fn();
const mockStart = vi.fn();

class MockAudioContext {
  currentTime = 0;
  state = 'running';
  decodeAudioData = vi.fn().mockResolvedValue({});
  createBufferSource = vi.fn().mockReturnValue({
    buffer: null,
    connect: mockConnect,
    start: mockStart,
  });
  createGain = vi.fn().mockReturnValue({
    gain: {
      setValueAtTime: mockSetValueAtTime,
    },
    connect: mockConnect,
  });
  destination = {};
  resume = vi.fn();
  close = vi.fn();
}

global.AudioContext = vi.fn().mockImplementation(function() {
  return new MockAudioContext();
});
global.fetch = vi.fn().mockResolvedValue({
  arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(8)),
});

describe('useAudioPlayback', () => {
  const mockGrid: GrooveGrid = {
    measures: 1,
    resolution: 16,
    timeSignature: { beatsPerMeasure: 4, beatValue: 4 },
    instruments: [
      {
        instrumentId: 'kick',
        label: 'Kick',
        notes: new Array(16).fill('none'),
      }
    ]
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockSetValueAtTime.mockClear();
    vi.useFakeTimers();
  });

  it('initializes with isPlaying as false', () => {
    const { result } = renderHook(() => useAudioPlayback({ grid: mockGrid, bpm: 120 }));
    expect(result.current.isPlaying).toBe(false);
  });

  it('toggles isPlaying state', () => {
    const { result } = renderHook(() => useAudioPlayback({ grid: mockGrid, bpm: 120 }));
    
    act(() => {
      result.current.togglePlayback();
    });
    expect(result.current.isPlaying).toBe(true);

    act(() => {
      result.current.togglePlayback();
    });
    expect(result.current.isPlaying).toBe(false);
  });

  it('calls onStepChange when playing', () => {
    const onStepChange = vi.fn();
    const { result } = renderHook(() => useAudioPlayback({ 
      grid: mockGrid, 
      bpm: 120,
      onStepChange
    }));

    act(() => {
      result.current.togglePlayback();
    });

    // Advance time to trigger scheduler
    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(onStepChange).toHaveBeenCalled();
  });

  it('scales volume based on velocity', async () => {
    const gridWithVel: GrooveGrid = {
      ...mockGrid,
      instruments: [
        {
          instrumentId: 'kick',
          label: 'Kick',
          notes: ['standard', 'none', 'none', 'none'],
          velocities: [0.5, 0, 0, 0]
        }
      ]
    };

    const { result } = renderHook(() => useAudioPlayback({ 
      grid: gridWithVel, 
      bpm: 120 
    }));

    // Wait for samples to "load"
    await act(async () => {
      await vi.runAllTimersAsync();
    });

    act(() => {
      result.current.togglePlayback();
    });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    // Check if setValueAtTime was called with the calculated gain
    // 0.5 ^ 1.5 = 0.35355...
    expect(mockSetValueAtTime).toHaveBeenCalledWith(
      expect.closeTo(0.35355, 5), 
      expect.any(Number)
    );
  });

  it('handles metronome toggling and volume', () => {
    const { result } = renderHook(() => useAudioPlayback({ 
      grid: mockGrid, 
      bpm: 120,
      initialMetronomeEnabled: true,
      initialMetronomeVolume: 0.8
    }));

    expect(result.current.metronomeEnabled).toBe(true);
    expect(result.current.metronomeVolume).toBe(0.8);

    act(() => {
      result.current.setMetronomeEnabled(false);
    });
    expect(result.current.metronomeEnabled).toBe(false);

    act(() => {
      result.current.setMetronomeVolume(0.2);
    });
    expect(result.current.metronomeVolume).toBe(0.2);
  });

  it('schedules metronome clicks correctly', async () => {
    // 4/4 grid at 16th resolution = 4 steps per beat
    const { result } = renderHook(() => useAudioPlayback({ 
      grid: mockGrid, 
      bpm: 120,
      initialMetronomeEnabled: true 
    }));

    // Wait for samples
    await act(async () => {
      await vi.runAllTimersAsync();
    });

    act(() => {
      result.current.togglePlayback();
    });

    // Advance to trigger first note (Step 0 - Beat 1)
    act(() => {
      vi.advanceTimersByTime(50);
    });

    // Metronome click should be scheduled
    expect(mockStart).toHaveBeenCalled();
  });
});
