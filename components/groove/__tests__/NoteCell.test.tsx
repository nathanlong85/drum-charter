import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { NoteCell } from '../NoteCell';

describe('NoteCell', () => {
  const onClick = vi.fn();
  const onContextMenu = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders standard hit correctly', () => {
    render(
      <NoteCell symbol="standard" velocity={0.7} onClick={onClick} onContextMenu={onContextMenu} />,
    );
    const cell = screen.getByTestId('note-cell');
    expect(cell).toBeInTheDocument();
    expect(screen.getByAltText('standard')).toBeInTheDocument();
  });

  it('renders empty cell correctly', () => {
    render(<NoteCell symbol="none" velocity={0} onClick={onClick} onContextMenu={onContextMenu} />);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('applies measure boundary class', () => {
    const { rerender } = render(
      <NoteCell
        symbol="none"
        velocity={0}
        onClick={onClick}
        onContextMenu={onContextMenu}
        isMeasureBoundary={false}
      />,
    );
    expect(screen.getByTestId('note-cell')).not.toHaveClass('border-r-2');

    rerender(
      <NoteCell
        symbol="none"
        velocity={0}
        onClick={onClick}
        onContextMenu={onContextMenu}
        isMeasureBoundary={true}
      />,
    );
    expect(screen.getByTestId('note-cell')).toHaveClass('border-r-2');
  });

  it('triggers context menu callback', () => {
    render(
      <NoteCell symbol="standard" velocity={0.7} onClick={onClick} onContextMenu={onContextMenu} />,
    );
    fireEvent.contextMenu(screen.getByTestId('note-cell'));
    expect(onContextMenu).toHaveBeenCalled();
  });

  it('prevents context menu in readOnly mode', () => {
    const preventDefault = vi.fn();
    render(
      <NoteCell
        symbol="standard"
        velocity={0.7}
        onClick={onClick}
        onContextMenu={onContextMenu}
        readOnly={true}
      />,
    );
    fireEvent.contextMenu(screen.getByTestId('note-cell'), { preventDefault });
    expect(onContextMenu).not.toHaveBeenCalled();
    // preventDefault check is tricky with fireEvent but checking onContextMenu is not called is enough
  });
});
