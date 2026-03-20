import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { GrooveGrid } from '@/lib/types/groove';
import { GrooveGridToolbar } from '../GrooveGridToolbar';

const mockState: GrooveGrid = {
  timeSignature: { beatsPerMeasure: 4, beatValue: 4 },
  resolution: 16,
  measures: 1,
  instruments: [],
  playbackOptionalHits: true,
};

describe('GrooveGridToolbar', () => {
  const props = {
    state: mockState,
    isPlaying: false,
    togglePlayback: vi.fn(),
    bpm: 120,
    onBpmChange: vi.fn(),
    metronomeEnabled: false,
    onMetronomeToggle: vi.fn(),
    metronomeVolume: 0.5,
    onMetronomeVolumeChange: vi.fn(),
    updateMeasures: vi.fn(),
    updateResolution: vi.fn(),
    updateTimeSignature: vi.fn(),
    isEditingInstruments: false,
    onToggleEditInstruments: vi.fn(),
    onToggleOptionalHits: vi.fn(),
  };

  it('handles playback toggle', () => {
    render(<GrooveGridToolbar {...props} />);
    fireEvent.click(screen.getByText(/Play/i));
    expect(props.togglePlayback).toHaveBeenCalled();
  });

  it('handles BPM change', () => {
    render(<GrooveGridToolbar {...props} />);
    // BPM input is unique in its group
    const inputs = screen.getAllByRole('spinbutton');
    const bpmInput = inputs[0];
    fireEvent.change(bpmInput, { target: { value: '140' } });
    expect(props.onBpmChange).toHaveBeenCalledWith(140);
  });

  it('handles metronome toggle', () => {
    render(<GrooveGridToolbar {...props} />);
    fireEvent.click(screen.getByTitle('Enable Metronome'));
    expect(props.onMetronomeToggle).toHaveBeenCalledWith(true);
  });

  it('handles measures update', () => {
    render(<GrooveGridToolbar {...props} />);
    fireEvent.click(screen.getByTitle('Increase measures'));
    expect(props.updateMeasures).toHaveBeenCalledWith(1);

    fireEvent.click(screen.getByTitle('Decrease measures'));
    expect(props.updateMeasures).toHaveBeenCalledWith(-1);
  });

  it('handles resolution update', () => {
    render(<GrooveGridToolbar {...props} />);
    // Target only buttons to avoid <option> elements
    const buttons = screen.getAllByRole('button');
    const res8Btn = buttons.find((b) => b.textContent === '8');
    if (res8Btn) fireEvent.click(res8Btn);
    expect(props.updateResolution).toHaveBeenCalledWith(8);
  });

  it('handles edit instruments toggle', () => {
    render(<GrooveGridToolbar {...props} />);
    fireEvent.click(screen.getByTitle('Edit Instruments'));
    expect(props.onToggleEditInstruments).toHaveBeenCalled();
  });

  it('handles optional hits toggle', () => {
    render(<GrooveGridToolbar {...props} />);
    fireEvent.click(screen.getByTitle('Hide Optional Hits'));
    expect(props.onToggleOptionalHits).toHaveBeenCalledWith(false);
  });

  it('handles time signature change', () => {
    render(<GrooveGridToolbar {...props} />);

    // Index 1 is the time signature beats input
    const inputs = screen.getAllByRole('spinbutton');
    const beatsInput = inputs[1];
    fireEvent.change(beatsInput, { target: { value: '3' } });
    expect(props.updateTimeSignature).toHaveBeenCalledWith(3, 4);

    // Only one combobox (select) in the toolbar
    const beatValueSelect = screen.getByRole('combobox');
    fireEvent.change(beatValueSelect, { target: { value: '8' } });
    expect(props.updateTimeSignature).toHaveBeenCalledWith(4, 8);
  });
});
