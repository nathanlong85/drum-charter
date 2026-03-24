import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { DrumSymbol, GrooveGrid } from '@/lib/types/groove';
import { GrooveGridEditor } from '../GrooveGridEditor';

// Control state for the mock hook
const mockAudioState = vi.hoisted(() => ({
  metronomeEnabled: false,
  setMetronomeEnabled: vi.fn((val: boolean) => {
    mockAudioState.metronomeEnabled = val;
  }),
  togglePlayback: vi.fn(),
}));

interface DialogProps {
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  asChild?: boolean;
}

// Mock Radix Dialog
vi.mock('@radix-ui/react-dialog', () => ({
  Root: ({ children, open, onOpenChange }: DialogProps) =>
    open ? (
      <div data-testid="dialog-root">
        <button data-testid="trigger-close" onClick={() => onOpenChange?.(false)}>
          Close
        </button>
        <button data-testid="trigger-open" onClick={() => onOpenChange?.(true)}>
          Open
        </button>
        {children}
      </div>
    ) : null,
  Portal: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-portal">{children}</div>
  ),
  Overlay: () => <div data-testid="dialog-overlay" />,
  Content: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-content" onClick={(e) => e.stopPropagation()}>
      {children}
    </div>
  ),
  Title: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
  Close: ({ children, asChild }: DialogProps) => {
    if (asChild) return children;
    return (
      <button onClick={() => {}} data-testid="dialog-close">
        {children}
      </button>
    );
  },
}));

interface MockSymbolPickerProps {
  position?: { top: number; left: number };
  onSelect: (symbol: DrumSymbol) => void;
  onVelocityChange: (velocity: number) => void;
  onClose: () => void;
}

// Mock SymbolPicker to verify its usage
vi.mock('../SymbolPicker', () => ({
  SymbolPicker: ({ position, onSelect, onVelocityChange, onClose }: MockSymbolPickerProps) => (
    <div data-testid="symbol-picker" data-top={position?.top} data-left={position?.left}>
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

// Mock navigator.clipboard
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: vi.fn().mockResolvedValue(undefined),
    readText: vi.fn().mockResolvedValue(''),
  },
  configurable: true,
});

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

interface TestEditorProps {
  grid: GrooveGrid;
  onChange?: (grid: GrooveGrid) => void;
}

const TestEditor: React.FC<TestEditorProps> = ({ grid: initial, onChange }) => {
  const [grid, setGrid] = React.useState(initial);

  React.useEffect(() => {
    setGrid(initial);
  }, [initial]);

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
    const onChange = vi.fn();
    const { rerender } = render(<TestEditor grid={initialGrid} onChange={onChange} />);

    const newGrid: GrooveGrid = { ...initialGrid, resolution: 8 };
    rerender(<TestEditor grid={newGrid} onChange={onChange} />);

    await waitFor(() => {
      const button = screen.getByRole('button', { name: '8' });
      expect(button).toHaveClass('bg-primary');
    });
  });

  it('positions the symbol picker correctly on context menu', async () => {
    render(<TestEditor grid={initialGrid} />);
    const cells = screen.getAllByTestId('note-cell');

    const mockRect = { top: 100, left: 200, height: 32, width: 32 };
    cells[0].getBoundingClientRect = vi.fn(() => mockRect as DOMRect);

    fireEvent.contextMenu(cells[0], { clientX: 250, clientY: 350 });

    const picker = screen.getByTestId('symbol-picker');
    expect(picker).toBeInTheDocument();
    expect(picker).toHaveAttribute('data-top', '350');
    expect(picker).toHaveAttribute('data-left', '250');
  });

  it('handles playback toggling with metronome state', async () => {
    const { rerender } = render(<TestEditor grid={initialGrid} />);
    const metroToggle = screen.getByLabelText(/Enable Metronome/i);

    fireEvent.click(metroToggle);
    expect(mockAudioState.setMetronomeEnabled).toHaveBeenCalledWith(true);

    // Rerender to pick up new state from mock hook
    mockAudioState.metronomeEnabled = true;
    rerender(<TestEditor grid={initialGrid} />);

    await waitFor(() => {
      const disableToggle = screen.getByLabelText(/Disable Metronome/i);
      expect(disableToggle).toHaveAttribute('aria-pressed', 'true');
    });
  });

  describe('Clear actions', () => {
    it('clears the entire grid when confirmed', async () => {
      const onChange = vi.fn();
      render(<TestEditor grid={initialGrid} onChange={onChange} />);

      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
      const clearBtn = screen.getByTestId('clear-grid-button');

      fireEvent.click(clearBtn);

      expect(confirmSpy).toHaveBeenCalledWith('Clear all notes in the grid?');
      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith(
          expect.objectContaining({
            instruments: expect.arrayContaining([
              expect.objectContaining({
                notes: ['none', 'none', 'none', 'none'],
              }),
            ]),
          }),
        );
      });
    });

    it('does not clear the grid when cancelled', async () => {
      const onChange = vi.fn();
      render(<TestEditor grid={initialGrid} onChange={onChange} />);

      vi.spyOn(window, 'confirm').mockReturnValue(false);
      const clearBtn = screen.getByTestId('clear-grid-button');

      fireEvent.click(clearBtn);

      expect(onChange).not.toHaveBeenCalled();
    });

    it('clears a specific row when confirmed during editing', async () => {
      const onChange = vi.fn();
      render(<TestEditor grid={initialGrid} onChange={onChange} />);

      // Enable editing mode
      fireEvent.click(screen.getByTitle('Edit Instruments'));

      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
      const clearRowBtn = screen.getByTestId('clear-row-i1');

      fireEvent.click(clearRowBtn);

      expect(confirmSpy).toHaveBeenCalledWith('Clear all notes for Kick?');
      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith(
          expect.objectContaining({
            instruments: expect.arrayContaining([
              expect.objectContaining({
                id: 'i1',
                notes: ['none', 'none', 'none', 'none'],
              }),
            ]),
          }),
        );
      });
    });
  });

  describe('Multi-cell selection', () => {
    it('selects multiple cells via drag', async () => {
      render(<TestEditor grid={initialGrid} />);
      const cells = screen.getAllByTestId('note-cell');

      fireEvent.mouseDown(cells[0], { button: 0 });
      fireEvent.mouseEnter(cells[1]);
      fireEvent.mouseUp(window);

      expect(cells[0]).toHaveClass('bg-blue-200/50');
      expect(cells[1]).toHaveClass('bg-blue-200/50');
      expect(cells[2]).not.toHaveClass('bg-blue-200/50');
    });

    it('clears selected cells with Delete key', async () => {
      const onChange = vi.fn();
      render(<TestEditor grid={initialGrid} onChange={onChange} />);
      const cells = screen.getAllByTestId('note-cell');

      fireEvent.mouseDown(cells[0], { button: 0 });
      fireEvent.mouseUp(window);

      fireEvent.keyDown(window, { key: 'Delete' });

      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith(
          expect.objectContaining({
            instruments: expect.arrayContaining([
              expect.objectContaining({
                notes: expect.arrayContaining(['none']),
              }),
            ]),
          }),
        );
      });
    });

    it('applies symbol to all selected cells', async () => {
      const onChange = vi.fn();
      render(<TestEditor grid={initialGrid} onChange={onChange} />);
      const cells = screen.getAllByTestId('note-cell');

      fireEvent.mouseDown(cells[1], { button: 0 });
      fireEvent.mouseEnter(cells[2]);
      fireEvent.mouseUp(window);

      fireEvent.contextMenu(cells[1]);
      fireEvent.click(screen.getByText('Select Ghost'));

      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith(
          expect.objectContaining({
            instruments: expect.arrayContaining([
              expect.objectContaining({
                notes: ['standard', 'ghost', 'ghost', 'none'],
              }),
            ]),
          }),
        );
      });
    });

    it('toggles optional state with Shift+Click', async () => {
      const onChange = vi.fn();
      render(<TestEditor grid={initialGrid} onChange={onChange} />);
      const cells = screen.getAllByTestId('note-cell');

      fireEvent.click(cells[0], { shiftKey: true });

      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith(
          expect.objectContaining({
            instruments: expect.arrayContaining([
              expect.objectContaining({
                notes: ['standard_opt', 'none', 'none', 'none'],
              }),
            ]),
          }),
        );
      });
    });

    it('opens symbol picker directly with Alt+Click', async () => {
      render(<TestEditor grid={initialGrid} />);
      const cells = screen.getAllByTestId('note-cell');

      fireEvent.click(cells[1], { altKey: true });

      expect(screen.getByTestId('symbol-picker')).toBeInTheDocument();
    });

    it('copies selected cells to clipboard', async () => {
      render(<TestEditor grid={initialGrid} />);
      const cells = screen.getAllByTestId('note-cell');

      fireEvent.mouseDown(cells[0], { button: 0 });
      fireEvent.mouseUp(window);

      fireEvent.keyDown(window, { key: 'c', ctrlKey: true });

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        expect.stringContaining('"notes":["standard"]'),
      );
    });

    it('pastes data into the grid', async () => {
      const onChange = vi.fn();
      render(<TestEditor grid={initialGrid} onChange={onChange} />);
      const cells = screen.getAllByTestId('note-cell');

      // Select target cell
      fireEvent.mouseDown(cells[1], { button: 0 });
      fireEvent.mouseUp(window);

      const pasteData = JSON.stringify([{ notes: ['accent'] }]);
      const pasteEvent = new Event('paste') as any;
      pasteEvent.clipboardData = {
        getData: vi.fn((type) => (type === 'text' ? pasteData : '')),
      };

      fireEvent(window, pasteEvent);

      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith(
          expect.objectContaining({
            instruments: expect.arrayContaining([
              expect.objectContaining({
                notes: ['standard', 'accent', 'none', 'none'],
              }),
            ]),
          }),
        );
      });
    });

    it('clears selection when clicking outside cells', async () => {
      render(<TestEditor grid={initialGrid} />);
      const cells = screen.getAllByTestId('note-cell');

      fireEvent.mouseDown(cells[0], { button: 0 });
      fireEvent.mouseUp(window);
      expect(cells[0]).toHaveClass('bg-blue-200/50');

      // Click another cell (not the same one)
      fireEvent.mouseDown(cells[1], { button: 0 });
      fireEvent.click(cells[1]);
      expect(cells[0]).not.toHaveClass('bg-blue-200/50');
    });

    it('applies velocity to all selected cells', async () => {
      const onChange = vi.fn();
      render(<TestEditor grid={initialGrid} onChange={onChange} />);
      const cells = screen.getAllByTestId('note-cell');

      fireEvent.mouseDown(cells[0], { button: 0 });
      fireEvent.mouseEnter(cells[1]);
      fireEvent.mouseUp(window);

      fireEvent.contextMenu(cells[0]);
      fireEvent.click(screen.getByText('Change Velocity'));

      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith(
          expect.objectContaining({
            instruments: expect.arrayContaining([
              expect.objectContaining({
                velocities: [0.5, 0.5, 0, 0],
              }),
            ]),
          }),
        );
      });
    });

    it('clears selection when opening context menu outside range', async () => {
      render(<TestEditor grid={initialGrid} />);
      const cells = screen.getAllByTestId('note-cell');

      fireEvent.mouseDown(cells[0], { button: 0 });
      fireEvent.mouseUp(window);
      expect(cells[0]).toHaveClass('bg-blue-200/50');

      fireEvent.contextMenu(cells[2]);
      expect(cells[0]).not.toHaveClass('bg-blue-200/50');
    });
  });
});
