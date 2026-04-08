import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import type React from 'react';
import { useEffect, useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { GrooveGrid } from '@/lib/types/groove';
import { GrooveGridEditor } from '../GrooveGridEditor';

// Mock audio playback hook
const mockAudioState = {
  isPlaying: false,
  isSamplesLoaded: true,
  togglePlayback: vi.fn(),
  metronomeEnabled: false,
  setMetronomeEnabled: vi.fn(),
  metronomeVolume: 0.5,
  setMetronomeVolume: vi.fn(),
};

vi.mock('@/lib/hooks/useAudioPlayback', () => ({
  useAudioPlayback: ({ onStepChange, initialMetronomeEnabled, initialMetronomeVolume }: any) => {
    useEffect(() => {
      mockAudioState.metronomeEnabled = initialMetronomeEnabled ?? false;
      mockAudioState.metronomeVolume = initialMetronomeVolume ?? 0.5;
    }, [initialMetronomeEnabled, initialMetronomeVolume]);

    // Expose a way to trigger step change for testing
    useEffect(() => {
      (window as any).triggerStepChange = (step: number) => onStepChange?.(step);
    }, [onStepChange]);

    return mockAudioState;
  },
}));

// Mock SymbolPicker to avoid complex SVG/icon logic in unit tests
vi.mock('../SymbolPicker', () => ({
  SymbolPicker: ({ onSelect, onVelocityChange }: any) => (
    <div data-testid="symbol-picker">
      <button onClick={() => onSelect('standard')} aria-label="Standard Hit">
        Standard
      </button>
      <button onClick={() => onSelect('accent')} aria-label="Accented Hit">
        Accented
      </button>
      <button onClick={() => onVelocityChange(0.5)}>GHOST</button>
      <button onClick={() => onSelect(null)}>Clear</button>
    </div>
  ),
}));

vi.mock('@/components/common/Tooltip', () => ({
  Tooltip: ({ children }: any) => children,
}));

// Mock Radix UI components
vi.mock('@radix-ui/react-dialog', () => ({
  Root: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Trigger: ({ children }: any) => <div>{children}</div>,
  Portal: ({ children }: any) => <div>{children}</div>,
  Overlay: () => <div>Overlay</div>,
  Content: ({ children }: any) => (
    <div role="dialog" data-testid="dialog-content">
      {children}
    </div>
  ),
  Title: ({ children }: any) => <h2>{children}</h2>,
  Description: ({ children }: any) => <p>{children}</p>,
  Close: ({ children }: any) => <button>{children}</button>,
}));

vi.mock('@radix-ui/react-dropdown-menu', () => ({
  Root: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Trigger: ({ children, asChild }: any) => (asChild ? children : <button>{children}</button>),
  Portal: ({ children }: any) => <div>{children}</div>,
  Content: ({ children }: any) => (
    <div data-testid="dropdown-content" role="menu">
      {children}
    </div>
  ),
  Item: ({ children, onSelect }: any) => (
    <button role="menuitem" onClick={() => onSelect?.()}>
      {children}
    </button>
  ),
  Label: ({ children }: any) => <div>{children}</div>,
  Separator: () => <hr />,
}));

const initialGrid: GrooveGrid = {
  measures: 1,
  resolution: 4,
  timeSignature: { beatsPerMeasure: 4, beatValue: 4 },
  instruments: [
    {
      id: 'i1',
      category: 'kick',
      customName: 'Kick',
      notes: ['standard', 'none', 'none', 'none'],
      velocities: [0.7, 0, 0, 0],
      presetVariety: 'Kick',
    },
    {
      id: 'i2',
      category: 'snare',
      customName: 'Snare',
      notes: ['none', 'standard', 'none', 'none'],
      velocities: [0, 0.7, 0, 0],
      presetVariety: 'Snare',
    },
  ],
  playbackOptionalHits: true,
};

const renderWithProvider = (ui: React.ReactElement) => {
  return render(ui);
};

const TestEditor = ({
  grid,
  onChange,
}: {
  grid: GrooveGrid;
  onChange?: (g: GrooveGrid) => void;
}) => {
  const [currentGrid, setCurrentGrid] = useState(grid);
  const handleChange = (newGrid: GrooveGrid) => {
    setCurrentGrid(newGrid);
    onChange?.(newGrid);
  };
  return <GrooveGridEditor initialGrid={currentGrid} onChange={handleChange} />;
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
    fireEvent.click(screen.getByTestId('instrument-settings-trigger-i1'));

    vi.spyOn(window, 'confirm').mockReturnValue(true);
    // Find "Delete Instrument" in the mocked dropdown using menuitem role
    const deleteBtn = screen.getAllByRole('menuitem', { name: /Delete Instrument/i })[0];
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

    const trigger = screen.getByTestId('instrument-settings-trigger-i1');
    fireEvent.click(trigger);

    // Find "Settings" in the mocked dropdown
    const settingsBtn = screen.getAllByRole('menuitem', { name: /Settings/i })[0];
    fireEvent.click(settingsBtn);

    // Modal should be open (using Dialog mock)
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const saveBtn = screen.getByRole('button', { name: /Save Changes/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(onChange).toHaveBeenCalled();
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
    pasteEventEmpty.clipboardData = {
      getData: () => '',
    };
    fireEvent(window, pasteEventEmpty);

    expect(onChange).not.toHaveBeenCalled();
  });

  it('updates grid settings', async () => {
    const onChange = vi.fn();
    renderWithProvider(<TestEditor grid={initialGrid} onChange={onChange} />);

    // Click resolution button
    const resBtn = screen.getByTestId('resolution-button-8');
    fireEvent.click(resBtn);

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          resolution: 8,
        }),
      );
    });
  });

  it('toggles optional hits', async () => {
    const onChange = vi.fn();
    renderWithProvider(<TestEditor grid={initialGrid} onChange={onChange} />);

    const optBtn = screen.getByTitle('Hide Optional Hits');
    fireEvent.click(optBtn);

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          playbackOptionalHits: false,
        }),
      );
    });
  });

  it('handles note interactions and symbol picker', async () => {
    const onChange = vi.fn();
    renderWithProvider(<TestEditor grid={initialGrid} onChange={onChange} />);
    const cells = screen.getAllByTestId('note-cell');

    // Right-click to open symbol picker
    fireEvent.contextMenu(cells[1]);
    expect(screen.getByTestId('symbol-picker')).toBeInTheDocument();

    // Select "Accented Hit" (Standard in mock)
    fireEvent.click(screen.getByText('Accented'));

    await waitFor(() => {
      expect(onChange).toHaveBeenCalled();
    });
  });

  it('syncs metronome state from props', () => {
    renderWithProvider(
      <GrooveGridEditor initialGrid={initialGrid} metronomeEnabled={true} metronomeVolume={0.8} />,
    );
    expect(mockAudioState.setMetronomeEnabled).toHaveBeenCalledWith(true);
    expect(mockAudioState.setMetronomeVolume).toHaveBeenCalledWith(0.8);
  });

  it('syncs with initialGrid when it changes', async () => {
    const { rerender } = renderWithProvider(<GrooveGridEditor initialGrid={initialGrid} />);

    const newGrid = {
      ...initialGrid,
      measures: 2,
    };

    rerender(<GrooveGridEditor initialGrid={newGrid} />);

    expect(screen.getAllByText('1').length).toBe(2); // Two measures
  });

  it('positions the symbol picker correctly on context menu', () => {
    renderWithProvider(<TestEditor grid={initialGrid} />);
    const cells = screen.getAllByTestId('note-cell');

    fireEvent.contextMenu(cells[0], { clientX: 100, clientY: 200 });
    const picker = screen.getByTestId('symbol-picker');
    expect(picker).toBeInTheDocument();
  });

  it('handles playback toggling with metronome state', () => {
    renderWithProvider(<TestEditor grid={initialGrid} />);
    const playBtn = screen.getByTestId('playback-toggle');
    fireEvent.click(playBtn);
    expect(mockAudioState.togglePlayback).toHaveBeenCalled();
  });

  it('handles shift-click to toggle optional hit', async () => {
    const onChange = vi.fn();
    renderWithProvider(<TestEditor grid={initialGrid} onChange={onChange} />);
    const cells = screen.getAllByTestId('note-cell');

    fireEvent.click(cells[0], { shiftKey: true });

    await waitFor(() => {
      expect(onChange).toHaveBeenCalled();
    });
  });

  it('handles clicking note when already selected as a single cell', async () => {
    const onChange = vi.fn();
    renderWithProvider(<TestEditor grid={initialGrid} onChange={onChange} />);
    const cells = screen.getAllByTestId('note-cell');

    // Click once to toggle
    fireEvent.click(cells[1]);
    await waitFor(() => expect(onChange).toHaveBeenCalled());
  });

  it('handles step changes during playback', async () => {
    renderWithProvider(<TestEditor grid={initialGrid} />);

    // Trigger step change via the window global we set up in mock
    await act(async () => {
      (window as any).triggerStepChange(2);
    });

    await waitFor(() => {
      const activeCells = screen.getAllByTestId('active-step');
      expect(activeCells.length).toBeGreaterThan(0);
    });
  });

  it('handles BPM and metronome volume changes', async () => {
    const onBpmChange = vi.fn();
    renderWithProvider(<GrooveGridEditor initialGrid={initialGrid} onBpmChange={onBpmChange} />);

    const bpmInput = screen.getByDisplayValue('120');
    fireEvent.change(bpmInput, { target: { value: '140' } });

    expect(onBpmChange).toHaveBeenCalledWith(140);
  });

  it('handles grid settings in toolbar', async () => {
    const onChange = vi.fn();
    renderWithProvider(<TestEditor grid={initialGrid} onChange={onChange} />);

    // Increase measures
    const addMeasureBtn = screen.getByTitle('Increase measures');
    fireEvent.click(addMeasureBtn);

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          measures: 2,
        }),
      );
    });
  });

  it('handles readOnly mode', () => {
    renderWithProvider(<GrooveGridEditor initialGrid={initialGrid} readOnly={true} />);
    expect(screen.queryByTestId('add-instrument-button')).not.toBeInTheDocument();
  });

  describe('Clear actions', () => {
    it('clears the entire grid when confirmed', async () => {
      const onChange = vi.fn();
      renderWithProvider(<TestEditor grid={initialGrid} onChange={onChange} />);

      vi.spyOn(window, 'confirm').mockReturnValue(true);
      const clearBtn = screen.getByTestId('clear-grid-button');
      fireEvent.click(clearBtn);

      await waitFor(() => {
        expect(onChange).toHaveBeenCalled();
      });
    });

    it('clears a specific row when confirmed during editing', async () => {
      const onChange = vi.fn();
      renderWithProvider(<TestEditor grid={initialGrid} onChange={onChange} />);

      fireEvent.click(screen.getByTitle('Edit Instruments'));
      fireEvent.click(screen.getByTestId('instrument-settings-trigger-i1'));

      vi.spyOn(window, 'confirm').mockReturnValue(true);
      const clearRowBtns = screen.getAllByRole('menuitem', { name: /Clear Row/i });
      fireEvent.click(clearRowBtns[0]);

      await waitFor(() => {
        expect(onChange).toHaveBeenCalled();
      });
    });
  });

  describe('Multi-cell selection', () => {
    it('selects multiple cells via drag', () => {
      renderWithProvider(<TestEditor grid={initialGrid} />);
      const cells = screen.getAllByTestId('note-cell');

      fireEvent.mouseDown(cells[0], { button: 0 });
      fireEvent.mouseEnter(cells[1]);
      fireEvent.mouseUp(window);

      expect(cells[0]).toHaveClass('ring-primary');
      expect(cells[1]).toHaveClass('ring-primary');
    });

    it('clears selected cells when clicking outside range', () => {
      renderWithProvider(<TestEditor grid={initialGrid} />);
      const cells = screen.getAllByTestId('note-cell');

      fireEvent.mouseDown(cells[0], { button: 0 });
      fireEvent.mouseEnter(cells[1]);
      fireEvent.mouseUp(window);

      fireEvent.click(cells[3]);
      expect(cells[0]).not.toHaveClass('ring-primary');
    });

    it('clears selection when opening context menu outside range', () => {
      renderWithProvider(<TestEditor grid={initialGrid} />);
      const cells = screen.getAllByTestId('note-cell');

      fireEvent.mouseDown(cells[0], { button: 0 });
      fireEvent.mouseEnter(cells[1]);
      fireEvent.mouseUp(window);

      fireEvent.contextMenu(cells[3]);
      expect(cells[0]).not.toHaveClass('ring-primary');
    });

    it('applies symbol to all selected cells', async () => {
      const onChange = vi.fn();
      renderWithProvider(<TestEditor grid={initialGrid} onChange={onChange} />);
      const cells = screen.getAllByTestId('note-cell');

      fireEvent.mouseDown(cells[0], { button: 0 });
      fireEvent.mouseEnter(cells[1]);
      fireEvent.mouseUp(window);

      fireEvent.contextMenu(cells[0]);
      fireEvent.click(screen.getByText('Accented'));

      await waitFor(() => {
        expect(onChange).toHaveBeenCalled();
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
      fireEvent.click(screen.getByText('GHOST'));

      await waitFor(() => {
        expect(onChange).toHaveBeenCalled();
      });
    });
  });

  describe('Keyboard Shortcuts', () => {
    beforeEach(() => {
      vi.stubGlobal('navigator', {
        clipboard: {
          writeText: vi.fn().mockResolvedValue(undefined),
          readText: vi.fn().mockResolvedValue(''),
        },
      });
    });

    it('deletes selected cells with Delete key', async () => {
      const onChange = vi.fn();
      renderWithProvider(<TestEditor grid={initialGrid} onChange={onChange} />);
      const cells = screen.getAllByTestId('note-cell');

      fireEvent.mouseDown(cells[0], { button: 0 });
      fireEvent.mouseUp(window);

      fireEvent.keyDown(window, { key: 'Delete' });

      await waitFor(() => {
        expect(onChange).toHaveBeenCalled();
      });
    });

    it('copies selected data to clipboard', () => {
      renderWithProvider(<TestEditor grid={initialGrid} />);
      const cells = screen.getAllByTestId('note-cell');

      fireEvent.mouseDown(cells[0], { button: 0 });
      fireEvent.mouseUp(window);

      fireEvent.keyDown(window, { key: 'c', ctrlKey: true });

      expect(navigator.clipboard.writeText).toHaveBeenCalled();
    });

    it('pastes data into the grid', async () => {
      const onChange = vi.fn();
      renderWithProvider(<TestEditor grid={initialGrid} onChange={onChange} />);
      const cells = screen.getAllByTestId('note-cell');

      fireEvent.mouseDown(cells[2], { button: 0 });
      fireEvent.mouseUp(window);

      const pasteData = JSON.stringify([{ notes: ['accent'], velocities: [1.0] }]);
      const pasteEvent = new Event('paste') as any;
      pasteEvent.clipboardData = {
        getData: () => pasteData,
      };
      // Mock readText to return the pasteData
      navigator.clipboard.readText = vi.fn().mockResolvedValue(pasteData);

      fireEvent(window, pasteEvent);

      await waitFor(() => {
        expect(onChange).toHaveBeenCalled();
      });
    });

    it('ignores shortcuts when typing in inputs', () => {
      renderWithProvider(<TestEditor grid={initialGrid} />);
      const bpmInput = screen.getByDisplayValue('120');
      fireEvent.keyDown(bpmInput, { key: 'Delete' });
    });

    it('handles copy error gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      navigator.clipboard.writeText = vi.fn().mockRejectedValue(new Error('Copy failed'));

      renderWithProvider(<TestEditor grid={initialGrid} />);
      const cells = screen.getAllByTestId('note-cell');
      fireEvent.mouseDown(cells[0], { button: 0 });
      fireEvent.mouseUp(window);

      fireEvent.keyDown(window, { key: 'c', ctrlKey: true });
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalled();
      });
    });

    it('handles paste with invalid JSON or wrong format', () => {
      const onChange = vi.fn();
      renderWithProvider(<TestEditor grid={initialGrid} onChange={onChange} />);

      const pasteEvent = new Event('paste') as any;
      pasteEvent.clipboardData = {
        getData: () => 'invalid-json',
      };
      fireEvent(window, pasteEvent);
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('Header Rendering', () => {
    it('renders 8th note sub-labels', () => {
      const grid8 = { ...initialGrid, resolution: 8 };
      renderWithProvider(<GrooveGridEditor initialGrid={grid8} />);

      const plusLabels = screen.getAllByText('+');
      expect(plusLabels.length).toBeGreaterThan(0);
    });

    it('renders 16th note sub-labels', () => {
      const grid16 = { ...initialGrid, resolution: 16 };
      renderWithProvider(<GrooveGridEditor initialGrid={grid16} />);

      expect(screen.getAllByText('e').length).toBeGreaterThan(0);
      expect(screen.getAllByText('&').length).toBeGreaterThan(0);
      expect(screen.getAllByText('a').length).toBeGreaterThan(0);
    });
  });
});
