import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { SongSection } from '@/lib/types/groove';
import { SongChartHeader } from '../SongChartHeader';

const mockSections: SongSection[] = [
  { id: '1', name: 'Intro', measuresCount: 4 },
  { id: '2', name: 'Verse', measuresCount: 8 },
  { id: '3', name: 'Chorus', measuresCount: 8 },
];

const mockTimeSignature = { beatsPerMeasure: 4, beatValue: 4 };

describe('SongChartHeader', () => {
  it('renders auto-generated order when manualOrder is not provided', () => {
    render(
      <SongChartHeader
        title="Test Song"
        timeSignature={mockTimeSignature}
        sections={mockSections}
      />,
    );
    expect(screen.getByText('Order:')).toBeDefined();
    expect(screen.getByText('Intro, Verse, Chorus')).toBeDefined();
  });

  it('renders manual order when provided', () => {
    render(
      <SongChartHeader
        title="Test Song"
        timeSignature={mockTimeSignature}
        sections={mockSections}
        manualOrder="Chorus, Verse, Bridge"
      />,
    );
    expect(screen.getByText('Order:')).toBeDefined();
    expect(screen.getByText('Chorus, Verse, Bridge')).toBeDefined();
    expect(screen.queryByText('Intro, Verse, Chorus')).toBeNull();
  });

  it('renders BPM when provided', () => {
    render(
      <SongChartHeader
        title="Test Song"
        bpm={120}
        timeSignature={mockTimeSignature}
        sections={mockSections}
      />,
    );
    expect(screen.getByText('BPM:')).toBeDefined();
    expect(screen.getByText('120')).toBeDefined();
  });
});
