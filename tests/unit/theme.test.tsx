import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { GrooveGridEditor } from '@/components/groove/GrooveGridEditor';
import { NoteCell } from '@/components/groove/NoteCell';
import type { GrooveGrid } from '@/lib/types/groove';

// Mock child components or hooks if necessary
vi.mock('@/components/groove/InstrumentRow', () => ({
  InstrumentRow: () => <div data-testid="instrument-row" />,
}));

describe('Theme Class Verification', () => {
  describe('NoteCell', () => {
    it('applies dark:invert class to the symbol image when isBeat is true', () => {
      render(
        <NoteCell
          symbol="standard"
          onClick={() => {}}
          onContextMenu={(e) => e.preventDefault()}
          isBeat={true}
        />,
      );

      const img = screen.getByAltText('standard');
      expect(img.className).toContain('dark:invert');
    });

    it('does not apply dark:invert class when isBeat is false', () => {
      render(
        <NoteCell
          symbol="standard"
          onClick={() => {}}
          onContextMenu={(e) => e.preventDefault()}
          isBeat={false}
        />,
      );

      const img = screen.getByAltText('standard');
      expect(img.className).not.toContain('dark:invert');
    });

    it('applies theme-aware border and background classes', () => {
      const { container } = render(
        <NoteCell
          symbol="none"
          onClick={() => {}}
          onContextMenu={(e) => e.preventDefault()}
          isBeat={true}
        />,
      );

      const cell = container.firstChild as HTMLElement;
      expect(cell.className).toContain('dark:border-gray-700');
      expect(cell.className).toContain('dark:hover:bg-blue-900');
      expect(cell.className).toContain('dark:bg-gray-900');
    });
  });

  describe('GrooveGridEditor', () => {
    const mockGrid: GrooveGrid = {
      timeSignature: { beatsPerMeasure: 4, beatValue: 4 },
      resolution: 16,
      measures: 1,
      instruments: [
        {
          instrumentId: 'hihat',
          label: 'Hi-Hat',
          notes: Array(16).fill('none'),
          velocities: Array(16).fill(0),
        },
      ],
    };

    it('applies dark mode classes to the toolbar container', () => {
      render(<GrooveGridEditor initialGrid={mockGrid} />);

      const toolbar = screen.getByTestId('groove-toolbar');
      expect(toolbar.className).toContain('dark:bg-gray-900');
      expect(toolbar.className).toContain('dark:border-gray-800');
    });

    it('applies dark mode classes to numeric inputs', () => {
      render(<GrooveGridEditor initialGrid={mockGrid} />);

      const bpmInput = screen.getByDisplayValue('120');
      expect(bpmInput.className).toContain('dark:bg-gray-800');
      expect(bpmInput.className).toContain('dark:border-gray-700');
    });
  });
});
