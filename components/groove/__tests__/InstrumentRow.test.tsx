'use client';

import * as Tooltip from '@radix-ui/react-tooltip';
import { fireEvent, render, screen } from '@testing-library/react';
import type React from 'react';
import { useEffect } from 'react';
import { describe, expect, it, vi } from 'vitest';
import type { DrumInstrument, GrooveGrid } from '@/lib/types/groove';
import { GrooveGridProvider, useGrooveGrid } from '../GrooveGridContext';
import { InstrumentRow } from '../InstrumentRow';

const mockInstrument: DrumInstrument = {
  id: 'i1',
  category: 'snare',
  presetVariety: 'Snare',
  customName: 'Main Snare',
  notes: ['standard', 'none', 'accent', 'none'],
  velocities: [0.7, 0, 1.2, 0],
};

const initialGrid: GrooveGrid = {
  timeSignature: { beatsPerMeasure: 4, beatValue: 4 },
  resolution: 4,
  measures: 1,
  instruments: [mockInstrument],
};

const renderWithProvider = (ui: React.ReactElement, grid: GrooveGrid = initialGrid) =>
  render(
    <Tooltip.Provider>
      <GrooveGridProvider initialGrid={grid} bpm={120}>
        {ui}
      </GrooveGridProvider>
    </Tooltip.Provider>,
  );

function EditModeActivator({ children }: { children: React.ReactNode }) {
  const { setIsEditingInstruments } = useGrooveGrid();
  useEffect(() => {
    setIsEditingInstruments(true);
  }, [setIsEditingInstruments]);
  return <>{children}</>;
}

const renderInEditMode = (ui: React.ReactElement, grid: GrooveGrid = initialGrid) =>
  render(
    <Tooltip.Provider>
      <GrooveGridProvider initialGrid={grid} bpm={120}>
        <EditModeActivator>{ui}</EditModeActivator>
      </GrooveGridProvider>
    </Tooltip.Provider>,
  );

describe('InstrumentRow', () => {
  it('renders instrument name and notes', () => {
    renderWithProvider(
      <InstrumentRow instrument={mockInstrument} instIdx={0} startNoteIdx={0} endNoteIdx={4} />,
    );

    expect(screen.getByText('Main Snare')).toBeInTheDocument();
    expect(screen.getAllByTestId('note-cell')).toHaveLength(4);
  });

  it('handles note interactions', async () => {
    const onChange = vi.fn();
    render(
      <Tooltip.Provider>
        <GrooveGridProvider initialGrid={initialGrid} bpm={120} onChange={onChange}>
          <InstrumentRow instrument={mockInstrument} instIdx={0} startNoteIdx={0} endNoteIdx={4} />
        </GrooveGridProvider>
      </Tooltip.Provider>,
    );

    fireEvent.click(screen.getAllByTestId('note-cell')[0]);
    expect(onChange).toHaveBeenCalled();

    fireEvent.contextMenu(screen.getAllByTestId('note-cell')[1]);
  });

  it('shows grip handle in edit mode', async () => {
    renderInEditMode(
      <InstrumentRow instrument={mockInstrument} instIdx={0} startNoteIdx={0} endNoteIdx={4} />,
    );

    expect(
      await screen.findByTestId(`instrument-drag-handle-${mockInstrument.id}`),
    ).toBeInTheDocument();
  });

  it('does not show grip handle outside edit mode', () => {
    renderWithProvider(
      <InstrumentRow instrument={mockInstrument} instIdx={0} startNoteIdx={0} endNoteIdx={4} />,
    );

    expect(
      screen.queryByTestId(`instrument-drag-handle-${mockInstrument.id}`),
    ).not.toBeInTheDocument();
  });

  it('does not show grip handle in edit mode when readOnly', () => {
    render(
      <Tooltip.Provider>
        <GrooveGridProvider initialGrid={initialGrid} bpm={120} readOnly>
          <EditModeActivator>
            <InstrumentRow
              instrument={mockInstrument}
              instIdx={0}
              startNoteIdx={0}
              endNoteIdx={4}
            />
          </EditModeActivator>
        </GrooveGridProvider>
      </Tooltip.Provider>,
    );

    expect(
      screen.queryByTestId(`instrument-drag-handle-${mockInstrument.id}`),
    ).not.toBeInTheDocument();
  });

  it('calls onDragStart when dragging begins in edit mode', async () => {
    const onDragStart = vi.fn();
    renderInEditMode(
      <InstrumentRow
        instrument={mockInstrument}
        instIdx={0}
        startNoteIdx={0}
        endNoteIdx={4}
        onDragStart={onDragStart}
      />,
    );

    const panel = await screen.findByTestId(`instrument-drag-handle-${mockInstrument.id}`);
    // The draggable button is the element itself
    const draggablePanel = panel.closest('[draggable="true"]') as HTMLElement;
    expect(draggablePanel).not.toBeNull();
    // jsdom doesn't populate dataTransfer, so provide a minimal mock
    fireEvent.dragStart(draggablePanel, { dataTransfer: { setData: vi.fn() } });
    expect(onDragStart).toHaveBeenCalledWith(0);
  });
});
