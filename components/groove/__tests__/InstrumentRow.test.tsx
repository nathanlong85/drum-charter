import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { DrumInstrument, GrooveGrid } from '@/lib/types/groove';
import { InstrumentRow } from '../InstrumentRow';

const mockInstrument: DrumInstrument = {
  id: 'i1',
  category: 'snare',
  presetVariety: 'Snare',
  customName: 'Main Snare',
  notes: ['standard', 'none', 'accent', 'none'],
  velocities: [0.7, 0, 1.2, 0],
};

const mockGrid: Pick<GrooveGrid, 'timeSignature' | 'resolution' | 'measures'> = {
  timeSignature: { beatsPerMeasure: 4, beatValue: 4 },
  resolution: 4,
  measures: 1,
};

describe('InstrumentRow', () => {
  const onNoteClick = vi.fn();
  const onNoteContextMenu = vi.fn();
  const onSettingsClick = vi.fn();
  const onMoveUp = vi.fn();
  const onMoveDown = vi.fn();

  it('renders instrument name and notes', () => {
    render(
      <InstrumentRow
        instrument={mockInstrument}
        grid={mockGrid}
        onNoteClick={onNoteClick}
        onNoteContextMenu={onNoteContextMenu}
      />,
    );

    expect(screen.getByText('Main Snare')).toBeInTheDocument();
    // 4 notes rendered
    expect(screen.getAllByTestId('note-cell')).toHaveLength(4);
  });

  it('handles note interactions', () => {
    render(
      <InstrumentRow
        instrument={mockInstrument}
        grid={mockGrid}
        onNoteClick={onNoteClick}
        onNoteContextMenu={onNoteContextMenu}
      />,
    );

    fireEvent.click(screen.getAllByTestId('note-cell')[0]);
    expect(onNoteClick).toHaveBeenCalledWith(0);

    fireEvent.contextMenu(screen.getAllByTestId('note-cell')[1]);
    expect(onNoteContextMenu).toHaveBeenCalledWith(1, expect.anything());
  });

  it('shows edit controls only when isEditing is true', () => {
    const { rerender } = render(
      <InstrumentRow
        instrument={mockInstrument}
        grid={mockGrid}
        onNoteClick={onNoteClick}
        onNoteContextMenu={onNoteContextMenu}
        isEditing={false}
      />,
    );

    expect(screen.queryByTitle(/Move Up/i)).not.toBeInTheDocument();

    rerender(
      <InstrumentRow
        instrument={mockInstrument}
        grid={mockGrid}
        onNoteClick={onNoteClick}
        onNoteContextMenu={onNoteContextMenu}
        isEditing={true}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
        onSettingsClick={onSettingsClick}
      />,
    );

    expect(screen.getByTitle(/Move Up/i)).toBeInTheDocument();
    expect(screen.getByTitle(/Move Down/i)).toBeInTheDocument();
    expect(screen.getByTitle(/Edit Settings/i)).toBeInTheDocument();
  });

  it('triggers edit callbacks', () => {
    render(
      <InstrumentRow
        instrument={mockInstrument}
        grid={mockGrid}
        onNoteClick={onNoteClick}
        onNoteContextMenu={onNoteContextMenu}
        isEditing={true}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
        onSettingsClick={onSettingsClick}
      />,
    );

    fireEvent.click(screen.getByTitle(/Move Up/i));
    expect(onMoveUp).toHaveBeenCalled();

    fireEvent.click(screen.getByTitle(/Move Down/i));
    expect(onMoveDown).toHaveBeenCalled();

    fireEvent.click(screen.getByTitle(/Edit Settings/i));
    expect(onSettingsClick).toHaveBeenCalled();
  });

  it('falls back to getVelocityForSymbol if velocities are missing', () => {
    const { velocities: _v, ...instWithoutVel } = mockInstrument;
    render(
      <InstrumentRow
        instrument={instWithoutVel as DrumInstrument}
        grid={mockGrid}
        onNoteClick={onNoteClick}
        onNoteContextMenu={onNoteContextMenu}
      />,
    );
    // 4 notes rendered, should not crash
    expect(screen.getAllByTestId('note-cell')).toHaveLength(4);
  });
});
