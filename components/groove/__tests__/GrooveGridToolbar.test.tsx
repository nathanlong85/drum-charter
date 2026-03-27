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
    isSamplesLoaded: true,
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
    fireEvent.click(screen.getByTestId('playback-toggle'));
    expect(props.togglePlayback).toHaveBeenCalled();
  });

  it('handles BPM change', () => {
    render(<GrooveGridToolbar {...props} />);
    const bpmInput = screen.getByDisplayValue('120');
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
    fireEvent.click(screen.getByText('+'));
    expect(props.updateMeasures).toHaveBeenCalledWith(1);

    fireEvent.click(screen.getByText('-'));
    expect(props.updateMeasures).toHaveBeenCalledWith(-1);
  });

  it('handles resolution update', () => {
    render(<GrooveGridToolbar {...props} />);
    // Target button text '8' specifically by role to avoid select options
    const res8Btn = screen.getByRole('button', { name: '8' });
    fireEvent.click(res8Btn);
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

    // Get the input by display value, but we need to disambiguate from the select
    const inputs = screen.getAllByDisplayValue('4');
    const sigBeats = inputs.find((el) => el.tagName === 'INPUT');
    if (!sigBeats) throw new Error('Input not found');

    fireEvent.change(sigBeats, { target: { value: '3' } });
    expect(props.updateTimeSignature).toHaveBeenCalledWith(
      expect.objectContaining({
        beatsPerMeasure: 3,
        beatValue: 4,
      }),
    );
  });
});
