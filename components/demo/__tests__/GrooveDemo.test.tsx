import { render, screen } from '@testing-library/react';
import { GrooveDemo } from '../GrooveDemo';
import { describe, it, expect, vi } from 'vitest';

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
    
    expect(screen.getByText('Try it yourself:')).toBeInTheDocument();
    expect(screen.getByText('Live Editor Demo')).toBeInTheDocument();
    expect(screen.getByTestId('mock-grid-editor')).toBeInTheDocument();
    expect(screen.getByText(/Mocked Editor with 3 instruments/)).toBeInTheDocument();
  });

  it('contains the instructions text', () => {
    render(<GrooveDemo />);
    expect(screen.getByText(/Click on the cells above/)).toBeInTheDocument();
  });
});
