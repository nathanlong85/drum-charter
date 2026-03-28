import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { DrumInstrument } from '@/lib/types/groove';
import { InstrumentSettingsModal } from '../InstrumentSettingsModal';

interface RootProps {
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface PortalProps {
  children?: React.ReactNode;
}

interface ContentProps {
  children?: React.ReactNode;
  onOpenAutoFocus?: (e: any) => void;
}

interface TitleProps {
  children?: React.ReactNode;
}

interface CloseProps {
  children?: React.ReactNode;
  asChild?: boolean;
}

// Mock Radix Dialog
vi.mock('@radix-ui/react-dialog', () => ({
  Root: ({ children, open: _open, onOpenChange }: RootProps) => (
    <div data-testid="dialog-root">
      <button data-testid="trigger-close" onClick={() => onOpenChange?.(false)}>
        Close
      </button>
      <button data-testid="trigger-open" onClick={() => onOpenChange?.(true)}>
        Open
      </button>
      {children}
    </div>
  ),
  Portal: ({ children }: PortalProps) => <div data-testid="dialog-portal">{children}</div>,
  Overlay: () => <div data-testid="dialog-overlay" />,
  Content: ({ children, onOpenAutoFocus }: ContentProps) => {
    // Call the callback immediately to cover the line
    React.useEffect(() => {
      onOpenAutoFocus?.({ preventDefault: () => {} });
    }, [onOpenAutoFocus]);
    return (
      <div data-testid="dialog-content" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    );
  },
  Title: ({ children }: TitleProps) => <h2>{children}</h2>,
  Close: ({ children, asChild }: CloseProps) => {
    if (asChild) return children;
    return (
      <button onClick={() => {}} data-testid="dialog-close">
        {children}
      </button>
    );
  },
}));

const mockInstrument: DrumInstrument = {
  id: 'test-id',
  category: 'snare',
  presetVariety: 'Snare',
  customName: 'My Snare',
  notes: [],
  velocities: [],
};

describe('InstrumentSettingsModal', () => {
  let onSave: ReturnType<typeof vi.fn>;
  let onClose: ReturnType<typeof vi.fn>;
  let onDelete: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onSave = vi.fn();
    onClose = vi.fn();
    onDelete = vi.fn();
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('renders initial instrument data', () => {
    render(
      <InstrumentSettingsModal
        instrument={mockInstrument}
        onSave={onSave}
        onClose={onClose}
        onDelete={onDelete}
      />,
    );

    expect(screen.getByLabelText(/Custom Name/i)).toHaveValue('My Snare');
  });

  it('calls onSave with updated values', () => {
    render(
      <InstrumentSettingsModal
        instrument={mockInstrument}
        onSave={onSave}
        onClose={onClose}
        onDelete={onDelete}
      />,
    );

    fireEvent.change(screen.getByLabelText(/Custom Name/i), { target: { value: 'New Name' } });
    fireEvent.change(screen.getByLabelText(/Category/i), { target: { value: 'kick' } });
    fireEvent.change(screen.getByLabelText(/Variety/i), { target: { value: 'Electronic Kick' } });

    fireEvent.click(screen.getByRole('button', { name: /Save Changes/i }));

    expect(onSave).toHaveBeenCalledWith({
      customName: 'New Name',
      category: 'kick',
      presetVariety: 'Electronic Kick',
    });
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onDelete after confirmation', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    render(
      <InstrumentSettingsModal
        instrument={mockInstrument}
        onSave={onSave}
        onClose={onClose}
        onDelete={onDelete}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /Remove/i }));
    expect(onDelete).toHaveBeenCalled();
  });

  it('does not call onDelete if confirmation is cancelled', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);

    render(
      <InstrumentSettingsModal
        instrument={mockInstrument}
        onSave={onSave}
        onClose={onClose}
        onDelete={onDelete}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /Remove/i }));

    expect(onDelete).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('calls onClose when dialog signals close', () => {
    render(
      <InstrumentSettingsModal
        instrument={mockInstrument}
        onSave={onSave}
        onClose={onClose}
        onDelete={onDelete}
      />,
    );

    fireEvent.click(screen.getByTestId('trigger-close'));
    expect(onClose).toHaveBeenCalled();
  });

  it('does not call onClose when dialog signals open', () => {
    render(
      <InstrumentSettingsModal
        instrument={mockInstrument}
        onSave={onSave}
        onClose={onClose}
        onDelete={onDelete}
      />,
    );

    fireEvent.click(screen.getByTestId('trigger-open'));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('focuses the input after mount', async () => {
    render(
      <InstrumentSettingsModal
        instrument={mockInstrument}
        onSave={onSave}
        onClose={onClose}
        onDelete={onDelete}
      />,
    );

    const input = screen.getByLabelText(/Custom Name/i);
    vi.advanceTimersByTime(150);
    expect(document.activeElement).toBe(input);
  });
});
