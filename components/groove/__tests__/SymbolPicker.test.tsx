import * as Tooltip from '@radix-ui/react-tooltip';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SymbolPicker } from '../SymbolPicker';

describe('SymbolPicker', () => {
  const onSelect = vi.fn();
  const onVelocityChange = vi.fn();
  const onClose = vi.fn();
  const position = { top: 100, left: 100 };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderWithProvider = (ui: React.ReactElement) => {
    return render(<Tooltip.Provider>{ui}</Tooltip.Provider>);
  };

  it('renders standard symbols for any category', () => {
    renderWithProvider(
      <SymbolPicker
        onSelect={onSelect}
        onVelocityChange={onVelocityChange}
        currentVelocity={0.7}
        onClose={onClose}
        position={position}
      />,
    );

    // Standard hit should always be there (Full label)
    expect(screen.getByLabelText('Standard Hit')).toBeInTheDocument();
  });

  it('filters symbols for kick category', () => {
    renderWithProvider(
      <SymbolPicker
        onSelect={onSelect}
        onVelocityChange={onVelocityChange}
        currentVelocity={0.7}
        onClose={onClose}
        position={position}
        category="kick"
      />,
    );

    expect(screen.getByLabelText('Standard Hit')).toBeInTheDocument();
    // Rim shot should NOT be there for kick (Label: Rim Shot)
    expect(screen.queryByLabelText('Rim Shot')).not.toBeInTheDocument();
  });

  it('shows rim shot for snare category', () => {
    renderWithProvider(
      <SymbolPicker
        onSelect={onSelect}
        onVelocityChange={onVelocityChange}
        currentVelocity={0.7}
        onClose={onClose}
        position={position}
        category="snare"
      />,
    );

    // The aria-label is exactly "Rim Shot"
    expect(screen.getByLabelText('Rim Shot')).toBeInTheDocument();
  });

  it('calls onSelect when a symbol is clicked', () => {
    renderWithProvider(
      <SymbolPicker
        onSelect={onSelect}
        onVelocityChange={onVelocityChange}
        currentVelocity={0.7}
        onClose={onClose}
        position={position}
      />,
    );

    fireEvent.click(screen.getByLabelText('Accented Hit'));
    expect(onSelect).toHaveBeenCalledWith('accent');
  });

  it('handles velocity changes', () => {
    renderWithProvider(
      <SymbolPicker
        onSelect={onSelect}
        onVelocityChange={onVelocityChange}
        currentVelocity={0.7}
        onClose={onClose}
        position={position}
      />,
    );

    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '0.9' } });
    expect(onVelocityChange).toHaveBeenCalledWith(0.9);
  });

  it('calls onClose when Done is clicked', () => {
    renderWithProvider(
      <SymbolPicker
        onSelect={onSelect}
        onVelocityChange={onVelocityChange}
        currentVelocity={0.7}
        onClose={onClose}
        position={position}
      />,
    );

    fireEvent.click(screen.getByText('Done'));
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose when backdrop is clicked', () => {
    renderWithProvider(
      <SymbolPicker
        onSelect={onSelect}
        onVelocityChange={onVelocityChange}
        currentVelocity={0.7}
        onClose={onClose}
        position={position}
      />,
    );

    const backdrop = screen.getByTestId('symbolpicker-backdrop');
    fireEvent.mouseDown(backdrop);
    expect(onClose).toHaveBeenCalled();
  });

  it('renders drag and drag_opt symbols', () => {
    renderWithProvider(
      <SymbolPicker
        onSelect={onSelect}
        onVelocityChange={onVelocityChange}
        currentVelocity={0.7}
        onClose={onClose}
        position={position}
        category="snare"
      />,
    );

    expect(screen.getByLabelText('Drag')).toBeInTheDocument();
    expect(screen.getByLabelText('Optional Drag')).toBeInTheDocument();
  });
});
