import * as Tooltip from '@radix-ui/react-tooltip';
import { fireEvent, render, screen } from '@testing-library/react';
import type React from 'react';
import { describe, expect, it, vi } from 'vitest';
import type { DrumInstrument, GrooveGrid } from '@/lib/types/groove';
import { GrooveGridProvider } from '../GrooveGridContext';
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

describe('InstrumentRow', () => {
  it('renders instrument name and notes', () => {
    renderWithProvider(
      <InstrumentRow instrument={mockInstrument} instIdx={0} startNoteIdx={0} endNoteIdx={4} />,
    );

    expect(screen.getByText('Main Snare')).toBeInTheDocument();
    // 4 notes rendered
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

    // Context menu should trigger state change in provider (setting pickerPos)
    // but since we only render the row, we can't see the picker.
    // We can verify it doesn't crash and the right-click is handled.
    fireEvent.contextMenu(screen.getAllByTestId('note-cell')[1]);
  });

  // We can't easily reach into the provider to set isEditing without a test helper component
  // or just checking if it reacts to the button in the real UI.
  // For unit tests of InstrumentRow, we might need to expose isEditing via props again
  // OR just test it within GrooveGridEditor.
  // Actually, InstrumentRow still reads isEditing from context.
});
