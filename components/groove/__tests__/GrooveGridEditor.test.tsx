import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { GrooveGrid } from '@/lib/types/groove';
import { GrooveGridEditor } from '../GrooveGridEditor';

const mockGrid: GrooveGrid = {
  timeSignature: { beatsPerMeasure: 4, beatValue: 4 },
  resolution: 16,
  measures: 1,
  instruments: [
    {
      id: 'hh',
      category: 'hi-hat',
      presetVariety: 'Hi-Hat',
      customName: 'Hi-Hat',
      notes: Array(16).fill('none'),
      velocities: Array(16).fill(0),
    },
    {
      id: 'sn',
      category: 'snare',
      presetVariety: 'Snare',
      customName: 'Snare',
      notes: Array(16).fill('none'),
      velocities: Array(16).fill(0),
    },
    {
      id: 'bd',
      category: 'kick',
      presetVariety: 'Kick',
      customName: 'Bass',
      notes: Array(16).fill('none'),
      velocities: Array(16).fill(0),
    },
  ],
};

describe('GrooveGridEditor', () => {
  it('renders without crashing when provided with initialGrid', () => {
    render(<GrooveGridEditor initialGrid={mockGrid} />);

    // Check for instrument labels
    expect(screen.getByText('Hi-Hat')).toBeInTheDocument();
    expect(screen.getByText('Snare')).toBeInTheDocument();
    expect(screen.getByText('Bass')).toBeInTheDocument();
  });

  it('renders the correct number of cells based on resolution and measures', () => {
    render(<GrooveGridEditor initialGrid={mockGrid} />);

    // 16 notes for 3 instruments = 48 note cells
    // (InstrumentRow uses InstrumentRow component which we'd need to check)
    // For now, let's just check headers
    // Let's be more specific to avoid duplicates or other text elements matching the regex.
    const headerElements = screen
      .getAllByText(/[1-4e+a]/)
      .filter((el) => el.className.includes('w-8'));
    expect(headerElements.length).toBe(16);
  });
});
