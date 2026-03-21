import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { GrooveGrid } from '@/lib/types/groove';
import { GrooveGridEditor } from '../GrooveGridEditor';

// Control state for the mock hook
const mockAudioState = vi.hoisted(() => ({
  metronomeEnabled: false,
  setMetronomeEnabled: vi.fn((val: boolean) => {
    mockAudioState.metronomeEnabled = val;
  }),
  togglePlayback: vi.fn(),
}));

// Mock Radix Dialog
vi.mock('@radix-ui/react-dialog', () => ({
  Root: ({ children, open, onOpenChange }: any) =>
    open ? (
      <div data-testid="dialog-root">
        <button data-testid="trigger-close" onClick={() => onOpenChange?.(false)}>
          Close
        </button>
        {children}
      </div>
    ) : null,
  Portal: ({ children }: any) => <div data-testid="dialog-portal">{children}</div>,
  Overlay: () => <div data-testid="dialog-overlay" />,
  Content: ({ children }: any) => (
    <div data-testid="dialog-content" onClick={(e) => e.stopPropagation()}>
      {children}
    </div>
  ),
  Title: ({ children }: any) => <h2>{children}</h2>,
  Close: ({ children, asChild }: any) => {
    if (asChild) return children;
    return (
      <button onClick={() => {}} data-testid="dialog-close">
        {children}
      </button>
    );
  },
}));

// Mock SymbolPicker to verify its usage
vi.mock('../SymbolPicker', () => ({
  SymbolPicker: ({ onSelect, onVelocityChange, onClose }: any) => (
    <div data-testid="symbol-picker">
      <button onClick={() => onSelect('ghost')}>Select Ghost</button>
      <button onClick={() => onVelocityChange(0.5)}>Change Velocity</button>
      <button onClick={onClose}>Close</button>
    </div>
  ),
}));

// Mock useAudioPlayback hook
vi.mock('@/lib/hooks/useAudioPlayback', () => ({
  useAudioPlayback: () => ({
    isPlaying: false,
    togglePlayback: mockAudioState.togglePlayback,
    metronomeEnabled: mockAudioState.metronomeEnabled,
    setMetronomeEnabled: mockAudioState.setMetronomeEnabled,
    metronomeVolume: 0.5,
    setMetronomeVolume: vi.fn(),
  }),
}));

const initialGrid: GrooveGrid = {
  timeSignature: { beatsPerMeasure: 4, beatValue: 4 },
  resolution: 4,
  measures: 1,
  instruments: [
    {
      id: 'i1',
      category: 'kick',
      presetVariety: 'Kick',
      customName: 'Kick',
      notes: ['standard', 'none', 'none', 'none'],
      velocities: [0.7, 0, 0, 0],
    },
  ],
};

const TestEditor = ({ grid: initial, onChange }: { grid: GrooveGrid; onChange?: any }) => {
  const [grid, setGrid] = React.useState(initial);
  const handleChange = (newGrid: GrooveGrid) => {
    setGrid(newGrid);
    onChange?.(newGrid);
  };
  return <GrooveGridEditor initialGrid={grid} onChange={handleChange} />;
};

describe('GrooveGridEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAudioState.metronomeEnabled = false;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders correctly', () => {
    render(<TestEditor grid={initialGrid} />);
    expect(screen.getByTestId('groove-grid')).toBeInTheDocument();
    expect(screen.getByText('Kick')).toBeInTheDocument();
  });

  it('toggles playback', () => {
    render(<TestEditor grid={initialGrid} />);
    const playBtn = screen.getByRole('button', { name: /Play/i });
    fireEvent.click(playBtn);
    expect(mockAudioState.togglePlayback).toHaveBeenCalled();
  });

  it('adds an instrument', async () => {
    const onChange = vi.fn();
    render(<TestEditor grid={initialGrid} onChange={onChange} />);

    fireEvent.click(screen.getByTitle('Edit Instruments'));
    fireEvent.click(screen.getByTestId('add-instrument-button'));

    await waitFor(() => {
      expect(screen.queryByText('New Instrument')).toBeInTheDocument();
    });
    expect(onChange).toHaveBeenCalled();
  });

  it('removes an instrument', async () => {
    const onChange = vi.fn();
    render(<TestEditor grid={initialGrid} onChange={onChange} />);

    fireEvent.click(screen.getByTitle('Edit Instruments'));
    fireEvent.click(screen.getByTitle('Edit Settings'));

    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const deleteBtn = screen.getByRole('button', { name: /Delete Row/i });
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(screen.queryByTestId('instrument-row-kick')).not.toBeInTheDocument();
    });
    expect(onChange).toHaveBeenCalled();
  });

  it('updates grid settings', async () => {
    const onChange = vi.fn();
    render(<TestEditor grid={initialGrid} onChange={onChange} />);

    fireEvent.click(screen.getByTitle('Increase measures'));
    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ measures: 2 }));
    });

    fireEvent.click(screen.getByRole('button', { name: '8' }));
    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ resolution: 8 }));
    });

    const sigBeats = screen.getAllByRole('spinbutton')[1];
    fireEvent.change(sigBeats, { target: { value: '3' } });
    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          timeSignature: expect.objectContaining({ beatsPerMeasure: 3 }),
        }),
      );
    });
  });

  it('toggles optional hits', async () => {
    const onChange = vi.fn();
    render(<TestEditor grid={initialGrid} onChange={onChange} />);

    fireEvent.click(screen.getByTitle(/Hide Optional Hits/));
    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({ playbackOptionalHits: false }),
      );
    });
  });

  it('handles note interactions and symbol picker', async () => {
    const onChange = vi.fn();
    render(<TestEditor grid={initialGrid} onChange={onChange} />);

    const cells = screen.getAllByTestId('note-cell');

    fireEvent.click(cells[1]);
    await waitFor(() => {
      expect(onChange).toHaveBeenCalled();
    });

    fireEvent.contextMenu(cells[0]);
    expect(screen.getByTestId('symbol-picker')).toBeDefined();

    fireEvent.click(screen.getByText('Select Ghost'));
    await waitFor(() => {
      expect(onChange).toHaveBeenCalled();
    });

    fireEvent.click(screen.getByText('Change Velocity'));
    await waitFor(() => {
      expect(onChange).toHaveBeenCalled();
    });

    fireEvent.click(screen.getByText('Close'));
    expect(screen.queryByTestId('symbol-picker')).toBeNull();
  });

  it('syncs with initialGrid when it changes', async () => {
    const { rerender } = render(<TestEditor grid={initialGrid} />);

    const newGrid = { ...initialGrid, resolution: 8 as any };
    rerender(<TestEditor grid={newGrid} />);

    expect(screen.getByRole('button', { name: '8' })).toBeInTheDocument();
  });

  it('positions the symbol picker correctly on context menu', async () => {
    render(<TestEditor grid={initialGrid} />);
    const cells = screen.getAllByTestId('note-cell');

    const mockRect = { top: 100, left: 200, height: 32, width: 32 };
    cells[0].getBoundingClientRect = vi.fn(() => mockRect as DOMRect);

    fireEvent.contextMenu(cells[0]);
    expect(screen.getByTestId('symbol-picker')).toBeInTheDocument();
  });

  it('handles playback toggling with metronome state', async () => {
    const { rerender } = render(<TestEditor grid={initialGrid} />);
    const metroToggle = screen.getByLabelText(/Enable Metronome/i);

    fireEvent.click(metroToggle);
    expect(mockAudioState.setMetronomeEnabled).toHaveBeenCalledWith(true);

    // Rerender to pick up new state from mock hook
    rerender(<TestEditor grid={initialGrid} />);
    expect(screen.getByLabelText(/Disable Metronome/i)).toBeInTheDocument();
  });
});
