import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { GrooveGridEditor } from '@/components/groove/GrooveGridEditor';
import { NoteCell } from '@/components/groove/NoteCell';
import { createDefaultDrumInstruments } from '@/lib/types/groove';

describe('Theme Class Verification', () => {
  describe('NoteCell', () => {
    it('applies new design system tokens', () => {
      const { container } = render(
        <NoteCell symbol="standard" onClick={() => {}} onContextMenu={() => {}} />,
      );

      const cell = container.firstChild as HTMLElement;
      expect(cell.className).toContain('border-outline-variant/20');
      expect(cell.className).toContain('hover:bg-primary/10');
    });
  });

  describe('GrooveGridEditor', () => {
    const mockGrid = {
      id: 'g1',
      measures: 1,
      resolution: 4 as const,
      timeSignature: { beatsPerMeasure: 4, beatValue: 4 },
      playbackOptionalHits: [],
      instruments: createDefaultDrumInstruments({
        measures: 1,
        resolution: 4,
        timeSignature: { beatsPerMeasure: 4, beatValue: 4 },
      }),
    };

    it('applies surface and primary tokens to the toolbar', () => {
      render(<GrooveGridEditor initialGrid={mockGrid} />);

      const toolbar = screen.getByTestId('groove-toolbar');
      expect(toolbar.className).toContain('bg-surface-container-low');
      expect(toolbar.className).toContain('border-outline-variant/10');
    });

    it('applies headline and surface tokens to numeric inputs', () => {
      render(<GrooveGridEditor initialGrid={mockGrid} />);

      // BPM input is 120 by default
      const bpmInput = screen.getByDisplayValue('120');
      expect(bpmInput.className).toContain('bg-surface-container-highest');
      expect(bpmInput.className).toContain('font-headline');
    });
  });
});
