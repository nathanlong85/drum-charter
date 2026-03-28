import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TagInput } from '../TagInput';

describe('TagInput', () => {
  const onChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders existing tags', () => {
    render(<TagInput tags={['rock', 'funk']} onChange={onChange} />);
    expect(screen.getByText('rock')).toBeInTheDocument();
    expect(screen.getByText('funk')).toBeInTheDocument();
  });

  it('adds a tag on Enter and normalizes to lowercase', () => {
    render(<TagInput tags={[]} onChange={onChange} />);
    const input = screen.getByPlaceholderText(/Add tag.../i);

    fireEvent.change(input, { target: { value: 'JaZz' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    expect(onChange).toHaveBeenCalledWith(['jazz']);
  });

  it('removes a tag when clicking X', () => {
    render(<TagInput tags={['rock']} onChange={onChange} />);
    const removeBtn = screen.getByLabelText(/Remove rock tag/i);
    fireEvent.click(removeBtn);

    expect(onChange).toHaveBeenCalledWith([]);
  });

  it('removes last tag on Backspace when input is empty', () => {
    render(<TagInput tags={['rock', 'funk']} onChange={onChange} />);
    const input = screen.getByPlaceholderText(/Add tag.../i);

    fireEvent.keyDown(input, { key: 'Backspace', code: 'Backspace' });
    expect(onChange).toHaveBeenCalledWith(['rock']);
  });

  it('does not remove last tag on Backspace if input is not empty', () => {
    render(<TagInput tags={['rock']} onChange={onChange} />);
    const input = screen.getByPlaceholderText(/Add tag.../i);

    fireEvent.change(input, { target: { value: 'j' } });
    fireEvent.keyDown(input, { key: 'Backspace', code: 'Backspace' });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('shows suggestions on focus', () => {
    render(<TagInput tags={[]} onChange={onChange} suggestions={['rock', 'jazz']} />);
    const input = screen.getByPlaceholderText(/Add tag.../i);

    fireEvent.focus(input);
    expect(screen.getByText('Suggested Identities')).toBeInTheDocument();
    expect(screen.getByText('rock')).toBeInTheDocument();
    expect(screen.getByText('jazz')).toBeInTheDocument();
  });

  it('adds tag from suggestion on click', () => {
    render(<TagInput tags={[]} onChange={onChange} suggestions={['rock']} />);
    const input = screen.getByPlaceholderText(/Add tag.../i);

    fireEvent.focus(input);
    const suggestion = screen.getByRole('button', { name: /rock/i });
    fireEvent.mouseDown(suggestion); // Component uses onMouseDown

    expect(onChange).toHaveBeenCalledWith(['rock']);
  });

  it('filters suggestions based on input', () => {
    render(<TagInput tags={[]} onChange={onChange} suggestions={['rock', 'jazz']} />);
    const input = screen.getByPlaceholderText(/Add tag.../i);

    fireEvent.change(input, { target: { value: 'ro' } });
    expect(screen.getByText('rock')).toBeInTheDocument();
    expect(screen.queryByText('jazz')).not.toBeInTheDocument();
  });

  it('hides suggestions on click outside', () => {
    render(<TagInput tags={[]} onChange={onChange} suggestions={['rock']} />);
    const input = screen.getByPlaceholderText(/Add tag.../i);
    fireEvent.focus(input);
    expect(screen.getByText('Suggested Identities')).toBeInTheDocument();

    fireEvent.mouseDown(document.body);
    expect(screen.queryByText('Suggestions')).not.toBeInTheDocument();
  });

  it('adds tag from suggestion on Enter key', () => {
    render(<TagInput tags={[]} onChange={onChange} suggestions={['rock']} />);
    const input = screen.getByPlaceholderText(/Add tag.../i);
    fireEvent.focus(input);

    const suggestion = screen.getByRole('button', { name: /rock/i });
    fireEvent.keyDown(suggestion, { key: 'Enter', code: 'Enter' });

    expect(onChange).toHaveBeenCalledWith(['rock']);
  });

  it('hides suggestions on blur after timeout', async () => {
    vi.useFakeTimers();
    try {
      render(<TagInput tags={[]} onChange={onChange} suggestions={['rock']} />);
      const input = screen.getByPlaceholderText(/Add tag.../i);

      fireEvent.focus(input);
      expect(screen.getByText('Suggested Identities')).toBeInTheDocument();

      fireEvent.blur(input);

      act(() => {
        vi.advanceTimersByTime(10);
      });

      expect(screen.queryByText('Suggestions')).not.toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });
});
