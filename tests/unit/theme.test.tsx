import * as Tooltip from '@radix-ui/react-tooltip';
import { render, screen, waitFor } from '@testing-library/react';
import type React from 'react';
import { describe, expect, it } from 'vitest';
import { GrooveGridEditor } from '@/components/groove/GrooveGridEditor';
import { NoteCell } from '@/components/groove/NoteCell';
import { createDefaultDrumInstruments } from '@/lib/types/groove';

const renderWithProvider = (ui: React.ReactElement) =>
  render(ui, {
    wrapper: ({ children }) => <Tooltip.Provider>{children}</Tooltip.Provider>,
  });

describe('Theme Class Verification', () => {
  describe('NoteCell', () => {
    it('applies new design system tokens', () => {
      const { getByTestId } = renderWithProvider(
        <NoteCell symbol="standard" index={0} onClick={() => {}} onContextMenu={() => {}} />,
      );

      const cell = getByTestId('note-cell');
      expect(cell.className).toContain('border-outline-variant/10');
      expect(cell.className).toContain('hover:bg-primary/5');
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

    it('applies surface tokens to the toolbar pods', async () => {
      renderWithProvider(<GrooveGridEditor initialGrid={mockGrid} />);

      await waitFor(() => {
        expect(screen.queryByText(/Loading/i)).toBeNull();
      });

      const transportPod = screen.getByText(/Transport/i).closest('div');
      expect(transportPod?.parentElement?.className).toContain('bg-surface-container-high');
      expect(transportPod?.parentElement?.className).toContain('border-outline-variant/10');
    });

    it('applies headline tokens to numeric inputs', () => {
      renderWithProvider(<GrooveGridEditor initialGrid={mockGrid} />);

      // BPM input is 120 by default
      const bpmInput = screen.getByDisplayValue('120');
      expect(bpmInput.className).toContain('font-headline');
      expect(bpmInput.className).toContain('font-black');
    });
  });
});
