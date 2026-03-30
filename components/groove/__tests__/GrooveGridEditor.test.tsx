import * as Tooltip from '@radix-ui/react-tooltip';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { DrumSymbol, GrooveGrid } from '@/lib/types/groove';
import { GrooveGridEditor } from '../GrooveGridEditor';

const renderWithProvider = (ui: React.ReactElement) =>
  render(ui, {
    wrapper: ({ children }) => <Tooltip.Provider>{children}</Tooltip.Provider>,
  });

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
vi.mock('@/lib/hooks/useAudioPlayback', () => {
  const { useState, useEffect } = require('react');
  return {
    useAudioPlayback: ({
      initialMetronomeEnabled = false,
      initialMetronomeVolume = 0.5,
      onStepChange,
    }: any) => {
      const [metronomeEnabled, setMetronomeEnabled] = useState(initialMetronomeEnabled);
      const [metronomeVolume, setMetronomeVolume] = useState(initialMetronomeVolume);

      // Expose a way to trigger step change for testing
      useEffect(() => {
        (window as any).triggerStepChange = (step: number) => onStepChange?.(step);
      }, [onStepChange]);

      return {
        isPlaying: false,
        isSamplesLoaded: true,
        togglePlayback: mockAudioState.togglePlayback,
        metronomeEnabled,
        setMetronomeEnabled,
        metronomeVolume,
        setMetronomeVolume,
      };
    },
  };
});

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
    renderWithProvider(<TestEditor grid={initialGrid} />);
    expect(screen.getByTestId('groove-grid')).toBeInTheDocument();
    expect(screen.getByText('Kick')).toBeInTheDocument();
  });

  it('toggles playback', () => {
    renderWithProvider(<TestEditor grid={initialGrid} />);
    const playBtn = screen.getByTestId('playback-toggle');
    fireEvent.click(playBtn);
    expect(mockAudioState.togglePlayback).toHaveBeenCalled();
  });

  it('adds an instrument', async () => {
    const onChange = vi.fn();
    renderWithProvider(<TestEditor grid={initialGrid} onChange={onChange} />);

    fireEvent.click(screen.getByTitle('Edit Instruments'));
    fireEvent.click(screen.getByTestId('add-instrument-button'));

    await waitFor(() => {
      expect(screen.queryByText('misc')).toBeInTheDocument();
    });
    expect(onChange).toHaveBeenCalled();
  });

  it('removes an instrument', async () => {
    const onChange = vi.fn();
    renderWithProvider(<TestEditor grid={initialGrid} onChange={onChange} />);

    fireEvent.click(screen.getByTitle('Edit Instruments'));
    fireEvent.click(screen.getByTitle('Edit Settings'));

    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const deleteBtn = screen.getByRole('button', { name: /Remove/i });
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(screen.queryByText('Kick')).not.toBeInTheDocument();
    });
    expect(onChange).toHaveBeenCalled();
  });

  it('updates an instrument', async () => {
    const onChange = vi.fn();
    renderWithProvider(<TestEditor grid={initialGrid} onChange={onChange} />);

    fireEvent.click(screen.getByTitle('Edit Instruments'));
    fireEvent.click(screen.getByTitle('Edit Settings'));

    const saveBtn = screen.getByRole('button', { name: /Save Changes/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          instruments: [expect.objectContaining({ customName: 'Kick' })],
        }),
      );
    });
  });

  it('clears selection when clicking a different note than the selection', async () => {
    renderWithProvider(<TestEditor grid={initialGrid} />);
    const cells = screen.getAllByTestId('note-cell');

    // Select two cells
    fireEvent.mouseDown(cells[0], { button: 0 });
    fireEvent.mouseEnter(cells[1]);
    fireEvent.mouseUp(window);
    expect(cells[0]).toHaveClass('ring-primary');

    // Click third cell
    fireEvent.click(cells[2]);
    expect(cells[0]).not.toHaveClass('ring-primary');
  });

  it('handles paste with no text', async () => {
    const onChange = vi.fn();
    renderWithProvider(<TestEditor grid={initialGrid} onChange={onChange} />);
    const cells = screen.getAllByTestId('note-cell');

    fireEvent.mouseDown(cells[0], { button: 0 });
    fireEvent.mouseUp(window);

    const pasteEventEmpty = new Event('paste') as any;
    pasteEventEmpty.clipboardData = { getData: vi.fn(() => '') };
    fireEvent(window, pasteEventEmpty);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('updates grid settings', async () => {
    const onChange = vi.fn();
    renderWithProvider(<TestEditor grid={initialGrid} onChange={onChange} />);

    fireEvent.click(screen.getByText('+'));
    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ measures: 2 }));
    });

    fireEvent.click(screen.getByRole('button', { name: '8' }));
    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ resolution: 8 }));
    });

    const inputs = screen.getAllByDisplayValue('4');
    const sigBeats = inputs.find((el) => el.tagName === 'INPUT');
    if (!sigBeats) throw new Error('Input not found');

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
    renderWithProvider(<TestEditor grid={initialGrid} onChange={onChange} />);

    fireEvent.click(screen.getByTitle('Hide Optional Hits'));
    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({ playbackOptionalHits: false }),
      );
    });
  });

  it('handles note interactions and symbol picker', async () => {
    const onChange = vi.fn();
    renderWithProvider(<TestEditor grid={initialGrid} onChange={onChange} />);

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

  it('syncs metronome state from props', async () => {
    const { rerender } = renderWithProvider(
      <GrooveGridEditor initialGrid={initialGrid} metronomeEnabled={false} metronomeVolume={0.5} />,
    );

    rerender(
      <GrooveGridEditor initialGrid={initialGrid} metronomeEnabled={true} metronomeVolume={0.8} />,
    );

    await waitFor(() => {
      expect(screen.getByTitle(/Disable Metronome/i)).toBeInTheDocument();
    });
  });

  it('syncs with initialGrid when it changes', async () => {
    const onChange = vi.fn();
    const { rerender } = renderWithProvider(<TestEditor grid={initialGrid} onChange={onChange} />);

    const newGrid: GrooveGrid = { ...initialGrid, resolution: 8 };
    rerender(<TestEditor grid={newGrid} onChange={onChange} />);

    await waitFor(() => {
      const button = screen.getByRole('button', { name: '8' });
      expect(button).toHaveClass('bg-primary');
    });
  });

  it('positions the symbol picker correctly on context menu', async () => {
    renderWithProvider(<TestEditor grid={initialGrid} />);
    const cells = screen.getAllByTestId('note-cell');

    const mockRect = { top: 100, left: 200, height: 40, width: 40, bottom: 140 };
    cells[0].getBoundingClientRect = vi.fn(() => mockRect as DOMRect);

    fireEvent.contextMenu(cells[0]);

    const picker = screen.getByTestId('symbol-picker');
    expect(picker).toBeInTheDocument();
    expect(picker).toHaveAttribute('data-top', '140');
    expect(picker).toHaveAttribute('data-left', '200');
  });

  it('handles playback toggling with metronome state', async () => {
    const onMetronomeToggle = vi.fn();
    renderWithProvider(
      <GrooveGridEditor initialGrid={initialGrid} onMetronomeToggle={onMetronomeToggle} />,
    );
    const metroToggle = screen.getByTitle(/Enable Metronome/i);

    fireEvent.click(metroToggle);
    expect(onMetronomeToggle).toHaveBeenCalledWith(true);
    await waitFor(() => {
      expect(screen.getByTitle(/Disable Metronome/i)).toBeInTheDocument();
    });
  });

  it('handles shift-click to toggle optional hit', async () => {
    const onChange = vi.fn();
    renderWithProvider(<TestEditor grid={initialGrid} onChange={onChange} />);
    const cells = screen.getAllByTestId('note-cell');

    fireEvent.click(cells[0], { shiftKey: true });
    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          instruments: [
            expect.objectContaining({
              notes: ['standard_opt', 'none', 'none', 'none'],
            }),
          ],
        }),
      );
    });
  });

  it('handles alt-click to open symbol picker directly', async () => {
    renderWithProvider(<TestEditor grid={initialGrid} />);
    const cells = screen.getAllByTestId('note-cell');

    const mockRect = { top: 100, left: 200, height: 40, width: 40, bottom: 140 };
    cells[1].getBoundingClientRect = vi.fn(() => mockRect as DOMRect);

    fireEvent.click(cells[1], { altKey: true });
    expect(screen.getByTestId('symbol-picker')).toBeInTheDocument();
  });

  it('handles clicking note when already selected as a single cell', async () => {
    const onChange = vi.fn();
    renderWithProvider(<TestEditor grid={initialGrid} onChange={onChange} />);
    const cells = screen.getAllByTestId('note-cell');

    // First click to toggle it from standard to accent
    fireEvent.click(cells[0]);
    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          instruments: [expect.objectContaining({ notes: ['accent', 'none', 'none', 'none'] })],
        }),
      );
    });

    // Select it
    fireEvent.mouseDown(cells[0], { button: 0 });
    fireEvent.mouseUp(window);

    // Click it while selected
    fireEvent.click(cells[0]);
    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          instruments: [expect.objectContaining({ notes: ['ghost', 'none', 'none', 'none'] })],
        }),
      );
    });
  });

  it('handles step changes during playback', async () => {
    renderWithProvider(<GrooveGridEditor initialGrid={initialGrid} />);

    await act(async () => {
      (window as any).triggerStepChange(1);
    });

    await waitFor(() => {
      const activeStep = screen.getByTestId('active-step');
      expect(activeStep).toBeInTheDocument();
      // Step 1 corresponds to beat 2 in a 4/4 grid with res 4
      expect(activeStep).toHaveTextContent('2');
    });
  });
  it('handles BPM and metronome volume changes', async () => {
    const onBpmChange = vi.fn();
    const onMetronomeVolumeChange = vi.fn();
    renderWithProvider(
      <GrooveGridEditor
        initialGrid={initialGrid}
        onBpmChange={onBpmChange}
        onMetronomeVolumeChange={onMetronomeVolumeChange}
      />,
    );

    const bpmInput = screen.getByDisplayValue('120');
    fireEvent.change(bpmInput, { target: { value: '140' } });
    expect(onBpmChange).toHaveBeenCalledWith(140);

    const volumeIcon = screen.getByTitle('Metronome Settings');
    fireEvent.click(volumeIcon);
    const volumeSlider = screen.getByTestId('metronome-volume-slider');
    fireEvent.change(volumeSlider, { target: { value: '0.8' } });
    expect(onMetronomeVolumeChange).toHaveBeenCalledWith(0.8);

    // Metronome Presets
    const ghostBtn = screen.getByTestId('metronome-preset-ghost');
    fireEvent.click(ghostBtn);
    expect(onMetronomeVolumeChange).toHaveBeenCalledWith(0.3);

    const closeSettings = screen.getByTestId('close-metronome-settings');
    fireEvent.click(closeSettings);
    expect(screen.queryByTestId('metronome-volume-slider')).not.toBeInTheDocument();
  });

  it('handles grid settings in toolbar', async () => {
    const onChange = vi.fn();
    renderWithProvider(<TestEditor grid={initialGrid} onChange={onChange} />);

    // Beat value select
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '8' } });
    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({ timeSignature: expect.objectContaining({ beatValue: 8 }) }),
      );
    });

    onChange.mockClear();

    // Decrease measures
    fireEvent.click(screen.getByText('-'));
    // Since measures: 1 is minimum, it should not change
    expect(onChange).not.toHaveBeenCalled();

    // Increase then decrease
    fireEvent.click(screen.getByText('+'));
    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ measures: 2 }));
    });
    fireEvent.click(screen.getByText('-'));
    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ measures: 1 }));
    });
  });

  it('handles readOnly mode', () => {
    renderWithProvider(<GrooveGridEditor initialGrid={initialGrid} readOnly={true} />);
    const bpmInput = screen.getByDisplayValue('120');
    expect(bpmInput).toHaveAttribute('disabled');

    const cells = screen.getAllByTestId('note-cell');
    fireEvent.click(cells[0]);
    // No visual way to check dispatch in this case, but checking it doesn't crash is good
  });

  describe('Clear actions', () => {
    it('clears the entire grid when confirmed', async () => {
      const onChange = vi.fn();
      renderWithProvider(<TestEditor grid={initialGrid} onChange={onChange} />);

      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
      const clearBtn = screen.getByTitle('Clear Grid');

      fireEvent.click(clearBtn);

      expect(confirmSpy).toHaveBeenCalledWith('Clear entire grid?');
      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith(
          expect.objectContaining({
            instruments: [
              expect.objectContaining({
                notes: ['none', 'none', 'none', 'none'],
              }),
            ],
          }),
        );
      });
    });

    it('clears a specific row when confirmed during editing', async () => {
      const onChange = vi.fn();
      renderWithProvider(<TestEditor grid={initialGrid} onChange={onChange} />);

      fireEvent.click(screen.getByTitle('Edit Instruments'));

      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
      const clearRowBtn = screen.getByTitle('Clear Row');

      fireEvent.click(clearRowBtn);

      expect(confirmSpy).toHaveBeenCalledWith('Clear all notes for Kick?');
      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith(
          expect.objectContaining({
            instruments: [
              expect.objectContaining({
                notes: ['none', 'none', 'none', 'none'],
              }),
            ],
          }),
        );
      });
    });
  });

  describe('Multi-cell selection', () => {
    it('selects multiple cells via drag', async () => {
      renderWithProvider(<TestEditor grid={initialGrid} />);
      const cells = screen.getAllByTestId('note-cell');

      fireEvent.mouseDown(cells[0], { button: 0 });
      fireEvent.mouseEnter(cells[1]);
      fireEvent.mouseUp(window);

      expect(cells[0]).toHaveClass('ring-primary');
      expect(cells[1]).toHaveClass('ring-primary');
      expect(cells[2]).not.toHaveClass('ring-primary');
    });

    it('clears selected cells when clicking outside range', async () => {
      renderWithProvider(<TestEditor grid={initialGrid} />);
      const cells = screen.getAllByTestId('note-cell');

      fireEvent.mouseDown(cells[0], { button: 0 });
      fireEvent.mouseUp(window);
      expect(cells[0]).toHaveClass('ring-primary');

      fireEvent.mouseDown(cells[1], { button: 0 });
      expect(cells[0]).not.toHaveClass('ring-primary');
    });

    it('clears selection when opening context menu outside range', async () => {
      renderWithProvider(<TestEditor grid={initialGrid} />);
      const cells = screen.getAllByTestId('note-cell');

      fireEvent.mouseDown(cells[0], { button: 0 });
      fireEvent.mouseUp(window);
      expect(cells[0]).toHaveClass('ring-primary');

      fireEvent.contextMenu(cells[2]);
      expect(cells[0]).not.toHaveClass('ring-primary');
    });

    it('applies symbol to all selected cells', async () => {
      const onChange = vi.fn();
      renderWithProvider(<TestEditor grid={initialGrid} onChange={onChange} />);
      const cells = screen.getAllByTestId('note-cell');

      fireEvent.mouseDown(cells[1], { button: 0 });
      fireEvent.mouseEnter(cells[2]);
      fireEvent.mouseUp(window);

      fireEvent.contextMenu(cells[1]);
      fireEvent.click(screen.getByText('Select Ghost'));

      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith(
          expect.objectContaining({
            instruments: [
              expect.objectContaining({
                notes: ['standard', 'ghost', 'ghost', 'none'],
              }),
            ],
          }),
        );
      });
    });

    it('applies velocity to all selected cells', async () => {
      const onChange = vi.fn();
      renderWithProvider(<TestEditor grid={initialGrid} onChange={onChange} />);
      const cells = screen.getAllByTestId('note-cell');

      fireEvent.mouseDown(cells[0], { button: 0 });
      fireEvent.mouseEnter(cells[1]);
      fireEvent.mouseUp(window);

      fireEvent.contextMenu(cells[0]);
      fireEvent.click(screen.getByText('Change Velocity'));

      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith(
          expect.objectContaining({
            instruments: [
              expect.objectContaining({
                velocities: [0.5, 0.5, 0, 0],
              }),
            ],
          }),
        );
      });
    });
  });

  describe('Keyboard Shortcuts', () => {
    it('deletes selected cells with Delete key', async () => {
      const onChange = vi.fn();
      renderWithProvider(<TestEditor grid={initialGrid} onChange={onChange} />);
      const cells = screen.getAllByTestId('note-cell');

      fireEvent.mouseDown(cells[0], { button: 0 });
      fireEvent.mouseUp(window);

      fireEvent.keyDown(window, { key: 'Delete' });

      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith(
          expect.objectContaining({
            instruments: [
              expect.objectContaining({
                notes: ['none', 'none', 'none', 'none'],
              }),
            ],
          }),
        );
      });
    });

    it('copies selected data to clipboard', async () => {
      renderWithProvider(<TestEditor grid={initialGrid} />);
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
      renderWithProvider(<TestEditor grid={initialGrid} onChange={onChange} />);
      const cells = screen.getAllByTestId('note-cell');

      fireEvent.mouseDown(cells[1], { button: 0 });
      fireEvent.mouseUp(window);

      const pasteData = JSON.stringify([{ notes: ['accent'], velocities: [1.0] }]);
      const pasteEvent = new Event('paste') as any;
      pasteEvent.clipboardData = {
        getData: vi.fn((type) => (type === 'text' ? pasteData : '')),
      };

      fireEvent(window, pasteEvent);

      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith(
          expect.objectContaining({
            instruments: [
              expect.objectContaining({
                notes: ['standard', 'accent', 'none', 'none'],
              }),
            ],
          }),
        );
      });
    });

    it('ignores shortcuts when typing in inputs', async () => {
      const onChange = vi.fn();
      renderWithProvider(<TestEditor grid={initialGrid} onChange={onChange} />);
      const cells = screen.getAllByTestId('note-cell');

      fireEvent.mouseDown(cells[0], { button: 0 });
      fireEvent.mouseUp(window);

      const input = document.createElement('input');
      document.body.appendChild(input);
      input.focus();

      fireEvent.keyDown(input, { key: 'Delete' });
      expect(onChange).not.toHaveBeenCalled();

      const pasteEvent = new Event('paste') as any;
      pasteEvent.clipboardData = { getData: vi.fn(() => JSON.stringify([{ notes: ['accent'] }])) };
      fireEvent(input, pasteEvent);
      expect(onChange).not.toHaveBeenCalled();

      document.body.removeChild(input);
    });

    it('handles copy error gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const originalWriteText = navigator.clipboard.writeText;
      navigator.clipboard.writeText = vi.fn().mockRejectedValue(new Error('Copy failed'));

      renderWithProvider(<TestEditor grid={initialGrid} />);
      const cells = screen.getAllByTestId('note-cell');

      fireEvent.mouseDown(cells[0], { button: 0 });
      fireEvent.mouseUp(window);

      try {
        fireEvent.keyDown(window, { key: 'c', ctrlKey: true });
        await waitFor(() => {
          expect(consoleSpy).toHaveBeenCalledWith(
            'Failed to copy to clipboard:',
            expect.any(Error),
          );
        });
      } finally {
        navigator.clipboard.writeText = originalWriteText;
      }
    });

    it('handles paste with invalid JSON or wrong format', async () => {
      const onChange = vi.fn();
      renderWithProvider(<TestEditor grid={initialGrid} onChange={onChange} />);
      const cells = screen.getAllByTestId('note-cell');

      fireEvent.mouseDown(cells[0], { button: 0 });
      fireEvent.mouseUp(window);

      const pasteEventInvalid = new Event('paste') as any;
      pasteEventInvalid.clipboardData = { getData: vi.fn(() => 'not-json') };
      fireEvent(window, pasteEventInvalid);
      expect(onChange).not.toHaveBeenCalled();

      const pasteEventWrong = new Event('paste') as any;
      pasteEventWrong.clipboardData = { getData: vi.fn(() => JSON.stringify({ wrong: 'data' })) };
      fireEvent(window, pasteEventWrong);
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('Instrument Management', () => {
    it('moves instruments up and down', async () => {
      const complexGrid: GrooveGrid = {
        ...initialGrid,
        instruments: [
          ...initialGrid.instruments,
          {
            id: 'i2',
            category: 'snare',
            presetVariety: 'Snare',
            customName: 'Snare',
            notes: ['none', 'standard', 'none', 'none'],
            velocities: [0, 0.7, 0, 0],
          },
        ],
      };
      const onChange = vi.fn();
      renderWithProvider(<TestEditor grid={complexGrid} onChange={onChange} />);

      fireEvent.click(screen.getByTitle('Edit Instruments'));

      const moveDownBtns = screen.getAllByTitle('Move Down');
      fireEvent.click(moveDownBtns[0]);

      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith(
          expect.objectContaining({
            instruments: [
              expect.objectContaining({ id: 'i2' }),
              expect.objectContaining({ id: 'i1' }),
            ],
          }),
        );
      });

      const moveUpBtns = screen.getAllByTitle('Move Up');
      fireEvent.click(moveUpBtns[1]);

      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith(
          expect.objectContaining({
            instruments: [
              expect.objectContaining({ id: 'i1' }),
              expect.objectContaining({ id: 'i2' }),
            ],
          }),
        );
      });
    });
  });

  describe('Header Rendering', () => {
    it('renders 8th note sub-labels', () => {
      const grid8: GrooveGrid = { ...initialGrid, resolution: 8 };
      renderWithProvider(<GrooveGridEditor initialGrid={grid8} />);

      const plusLabels = screen.getAllByText('+');
      expect(plusLabels.length).toBeGreaterThan(0);
    });

    it('renders 16th note sub-labels', () => {
      const grid16: GrooveGrid = { ...initialGrid, resolution: 16 };
      renderWithProvider(<GrooveGridEditor initialGrid={grid16} />);

      expect(screen.getAllByText('e').length).toBeGreaterThan(0);
      expect(screen.getAllByText('a').length).toBeGreaterThan(0);
    });
  });
});
