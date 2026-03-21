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

  it('renders standard symbols for any category', () => {
    render(
      <SymbolPicker
        onSelect={onSelect}
        onVelocityChange={onVelocityChange}
        currentVelocity={0.7}
        onClose={onClose}
        position={position}
      />,
    );

    // Standard hit should always be there
    expect(screen.getByLabelText('standard')).toBeInTheDocument();
  });

  it('filters symbols for kick category', () => {
    render(
      <SymbolPicker
        category="kick"
        onSelect={onSelect}
        onVelocityChange={onVelocityChange}
        currentVelocity={0.7}
        onClose={onClose}
        position={position}
      />,
    );

    expect(screen.getByLabelText('standard')).toBeInTheDocument();
    // Rim shot should NOT be there for kick
    expect(screen.queryByLabelText('rim shot')).not.toBeInTheDocument();
  });

  it('shows rim shot for snare category', () => {
    render(
      <SymbolPicker
        category="snare"
        onSelect={onSelect}
        onVelocityChange={onVelocityChange}
        currentVelocity={0.7}
        onClose={onClose}
        position={position}
      />,
    );

    // The aria-label is exactly "rim shot" (no underscore in UI)
    expect(screen.getByLabelText('rim shot')).toBeInTheDocument();
  });

  it('calls onSelect when a symbol is clicked', () => {
    render(
      <SymbolPicker
        onSelect={onSelect}
        onVelocityChange={onVelocityChange}
        currentVelocity={0.7}
        onClose={onClose}
        position={position}
      />,
    );

    fireEvent.click(screen.getByLabelText('accent'));
    expect(onSelect).toHaveBeenCalledWith('accent');
  });

  it('handles velocity changes', () => {
    render(
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
    render(
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
    render(
      <SymbolPicker
        onSelect={onSelect}
        onVelocityChange={onVelocityChange}
        currentVelocity={0.7}
        onClose={onClose}
        position={position}
      />,
    );

    const backdrop = screen.getByTestId('symbolpicker-backdrop');
    fireEvent.click(backdrop);
    expect(onClose).toHaveBeenCalled();
  });
});
