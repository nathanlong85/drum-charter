import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { GrooveDemo } from '../GrooveDemo';

// Mock the GrooveGridEditor since it's already tested unit-wise
// and we want to verify GrooveDemo renders it correctly.
vi.mock('@/components/groove/GrooveGridEditor', () => ({
  GrooveGridEditor: ({ initialGrid }: any) => (
    <div data-testid="mock-grid-editor">
      Mocked Editor with {initialGrid.instruments.length} instruments
    </div>
  ),
}));

describe('GrooveDemo', () => {
  it('renders without crashing', () => {
    render(<GrooveDemo />);

    expect(screen.getByText('Drum Sequencer')).toBeInTheDocument();
    expect(screen.getByText('v1.0-alpha Live Preview')).toBeInTheDocument();
    expect(screen.getByTestId('mock-grid-editor')).toBeInTheDocument();
    expect(screen.getByText(/Mocked Editor with 3 instruments/)).toBeInTheDocument();
  });

  it('contains the instructions text', () => {
    render(<GrooveDemo />);
    expect(screen.getByText(/Interact with grid to explore articulation/i)).toBeInTheDocument();
  });
});
