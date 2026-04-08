import { fireEvent, render, screen } from '@testing-library/react';
import type React from 'react';
import { describe, expect, it, vi } from 'vitest';
import type { GrooveGrid } from '@/lib/types/groove';
import { GrooveGridProvider } from '../GrooveGridContext';
import { GrooveGridToolbar } from '../GrooveGridToolbar';

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
  useAudioPlayback: () => mockAudioState,
}));

const mockState: GrooveGrid = {
  timeSignature: { beatsPerMeasure: 4, beatValue: 4 },
  resolution: 16,
  measures: 1,
  instruments: [],
  playbackOptionalHits: true,
};

const renderWithProvider = (ui: React.ReactElement, onChange = vi.fn(), onBpmChange = vi.fn()) =>
  render(
    <GrooveGridProvider
      initialGrid={mockState}
      bpm={120}
      onChange={onChange}
      onBpmChange={onBpmChange}
    >
      {ui}
    </GrooveGridProvider>,
  );

describe('GrooveGridToolbar', () => {
  it('handles playback toggle', () => {
    renderWithProvider(<GrooveGridToolbar />);
    fireEvent.click(screen.getByTestId('playback-toggle'));
    expect(mockAudioState.togglePlayback).toHaveBeenCalled();
  });

  it('handles BPM change', () => {
    const onBpmChange = vi.fn();
    renderWithProvider(<GrooveGridToolbar />, vi.fn(), onBpmChange);
    const bpmInput = screen.getByDisplayValue('120');
    fireEvent.change(bpmInput, { target: { value: '140' } });
    expect(onBpmChange).toHaveBeenCalledWith(140);
  });

  it('handles metronome toggle', () => {
    renderWithProvider(<GrooveGridToolbar />);
    fireEvent.click(screen.getByTitle('Enable Metronome'));
    expect(mockAudioState.setMetronomeEnabled).toHaveBeenCalledWith(true);
  });

  it('handles measures update', () => {
    const onChange = vi.fn();
    renderWithProvider(<GrooveGridToolbar />, onChange);
    fireEvent.click(screen.getByText('+'));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ measures: 2 }));

    fireEvent.click(screen.getByText('-'));
    // Since we started at 1, + then - brings us back to 1
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ measures: 1 }));
  });

  it('handles resolution update', () => {
    const onChange = vi.fn();
    renderWithProvider(<GrooveGridToolbar />, onChange);
    // Target button text '8' specifically by role to avoid select options
    const res8Btn = screen.getByRole('button', { name: '8' });
    fireEvent.click(res8Btn);
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ resolution: 8 }));
  });

  it('handles edit instruments toggle', () => {
    // This is internal state in context, harder to verify without checking sub-components
    // but we can verify it doesn't crash.
    renderWithProvider(<GrooveGridToolbar />);
    fireEvent.click(screen.getByTitle('Edit Instruments'));
    expect(screen.getByTitle('Finish Editing')).toBeInTheDocument();
  });

  it('handles optional hits toggle', () => {
    const onChange = vi.fn();
    renderWithProvider(<GrooveGridToolbar />, onChange);
    fireEvent.click(screen.getByTitle('Hide Optional Hits'));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ playbackOptionalHits: false }));
  });

  it('handles time signature change', () => {
    const onChange = vi.fn();
    renderWithProvider(<GrooveGridToolbar />, onChange);

    // Get the input by display value, but we need to disambiguate from the select
    const inputs = screen.getAllByDisplayValue('4');
    const sigBeats = inputs.find((el) => el.tagName === 'INPUT');
    if (!sigBeats) throw new Error('Input not found');

    fireEvent.change(sigBeats, { target: { value: '3' } });
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        timeSignature: expect.objectContaining({
          beatsPerMeasure: 3,
          beatValue: 4,
        }),
      }),
    );
  });
});
