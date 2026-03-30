import * as Tooltip from '@radix-ui/react-tooltip';
import { fireEvent, render, screen } from '@testing-library/react';
import type React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { NoteCell } from '../NoteCell';

describe('NoteCell', () => {
  const onClick = vi.fn();
  const onContextMenu = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderWithProvider = (ui: React.ReactElement) => {
    return render(<Tooltip.Provider>{ui}</Tooltip.Provider>);
  };

  it('renders standard hit correctly', () => {
    renderWithProvider(
      <NoteCell symbol="standard" velocity={0.7} onClick={onClick} onContextMenu={onContextMenu} />,
    );
    const cell = screen.getByTestId('note-cell');
    expect(cell).toBeInTheDocument();
    expect(screen.getByAltText('standard')).toBeInTheDocument();
  });

  it('renders empty cell correctly', () => {
    renderWithProvider(
      <NoteCell symbol="none" velocity={0} onClick={onClick} onContextMenu={onContextMenu} />,
    );
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('applies measure boundary class', () => {
    const { rerender } = render(
      <Tooltip.Provider>
        <NoteCell
          symbol="none"
          velocity={0}
          onClick={onClick}
          onContextMenu={onContextMenu}
          isMeasureBoundary={false}
        />
      </Tooltip.Provider>,
    );
    expect(screen.getByTestId('note-cell')).not.toHaveClass('border-r-2');

    rerender(
      <Tooltip.Provider>
        <NoteCell
          symbol="none"
          velocity={0}
          onClick={onClick}
          onContextMenu={onContextMenu}
          isMeasureBoundary={true}
        />
      </Tooltip.Provider>,
    );
    expect(screen.getByTestId('note-cell')).toHaveClass('border-r-2');
  });

  it('triggers context menu callback', () => {
    renderWithProvider(
      <NoteCell symbol="standard" velocity={0.7} onClick={onClick} onContextMenu={onContextMenu} />,
    );
    fireEvent.contextMenu(screen.getByTestId('note-cell'));
    expect(onContextMenu).toHaveBeenCalled();
  });

  it('prevents context menu in readOnly mode', () => {
    const preventDefault = vi.fn();
    renderWithProvider(
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
  });
});
