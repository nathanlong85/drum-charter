import { render, screen } from '@testing-library/react';
import { GrooveGridEditor } from '../GrooveGridEditor';
import { GrooveGrid } from '@/lib/types/groove';
import { describe, it, expect } from 'vitest';

const mockGrid: GrooveGrid = {
  timeSignature: { beatsPerMeasure: 4, beatValue: 4 },
  resolution: 16,
  measures: 1,
  instruments: [
    { instrumentId: 'hh', label: 'Hi-Hat', notes: Array(16).fill('none') },
    { instrumentId: 'sn', label: 'Snare', notes: Array(16).fill('none') },
    { instrumentId: 'bd', label: 'Bass', notes: Array(16).fill('none') },
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
    const { container } = render(<GrooveGridEditor initialGrid={mockGrid} />);
    
    // 16 notes for 3 instruments = 48 note cells
    // (InstrumentRow uses InstrumentRow component which we'd need to check)
    // For now, let's just check headers
    // Let's be more specific to avoid duplicates or other text elements matching the regex.
    const headerElements = screen.getAllByText(/[1-4e+a]/).filter(el => el.className.includes('w-8'));
    expect(headerElements.length).toBe(16);
  });
});
