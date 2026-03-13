import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { TagInput } from '../TagInput';
import React from 'react';

describe('TagInput', () => {
  const defaultProps = {
    tags: ['funk', 'linear'],
    onChange: vi.fn(),
    suggestions: ['rock', 'jazz', 'shuffle'],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders existing tags', () => {
    render(<TagInput {...defaultProps} />);
    expect(screen.getByText(/funk/i)).toBeInTheDocument();
    expect(screen.getByText(/linear/i)).toBeInTheDocument();
  });

  it('calls onChange with new tag when Enter is pressed', () => {
    render(<TagInput {...defaultProps} placeholder="Add tag..." />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'metal' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    
    expect(defaultProps.onChange).toHaveBeenCalledWith(['funk', 'linear', 'metal']);
  });

  it('removes a tag when X is clicked', () => {
    render(<TagInput {...defaultProps} />);
    // Get the first remove button specifically by its aria-label
    const removeButton = screen.getByLabelText(/Remove funk tag/i);
    fireEvent.click(removeButton);
    
    expect(defaultProps.onChange).toHaveBeenCalledWith(['linear']);
  });

  it('shows suggestions when typing', () => {
    render(<TagInput {...defaultProps} placeholder="Add tag..." />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'j' } });
    
    expect(screen.getByText(/jazz/i)).toBeInTheDocument();
    // 'rock' should not be visible as it doesn't contain 'j'
    expect(screen.queryByText(/rock/i)).toBeNull();
  });

  it('adds a tag from suggestions when clicked', () => {
    render(<TagInput {...defaultProps} placeholder="Add tag..." />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'j' } });
    
    const suggestionBtn = screen.getByRole('button', { name: /jazz/i });
    fireEvent.mouseDown(suggestionBtn);
    
    expect(defaultProps.onChange).toHaveBeenCalledWith(['funk', 'linear', 'jazz']);
  });

  it('adds a tag from suggestions using keyboard', () => {
    render(<TagInput {...defaultProps} placeholder="Add tag..." />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'j' } });
    
    const suggestionBtn = screen.getByRole('button', { name: /jazz/i });
    
    // Test Enter key
    fireEvent.keyDown(suggestionBtn, { key: 'Enter' });
    expect(defaultProps.onChange).toHaveBeenCalledWith(['funk', 'linear', 'jazz']);
    
    // Reset for Space test
    vi.clearAllMocks();
    fireEvent.change(input, { target: { value: 'j' } });
    const suggestionBtnSpace = screen.getByRole('button', { name: /jazz/i });
    
    // Test Space key
    fireEvent.keyDown(suggestionBtnSpace, { key: ' ' });
    expect(defaultProps.onChange).toHaveBeenCalledWith(['funk', 'linear', 'jazz']);
  });

  it('is case-insensitive for duplicate detection', () => {
    render(<TagInput {...defaultProps} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'FUNK' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    
    expect(defaultProps.onChange).not.toHaveBeenCalled();
  });

  it('is case-insensitive for filtering suggestions', () => {
    const propsWithUpper = {
      ...defaultProps,
      tags: ['FUNK'],
      suggestions: ['funk', 'JAZZ']
    };
    render(<TagInput {...propsWithUpper} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'j' } });
    
    expect(screen.getByText(/JAZZ/i)).toBeInTheDocument();
    
    // Suggestions should not include 'funk' because it's already in tags (case-insensitive)
    const suggestionsList = screen.getByText(/Suggestions/i).parentElement?.parentElement;
    expect(suggestionsList?.textContent).not.toContain('funk');
  });

  it('all buttons have type="button" to prevent form submission', () => {
    render(<TagInput {...defaultProps} />);
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button.getAttribute('type')).toBe('button');
    });
  });

  it('closes suggestions on blur', async () => {
    vi.useFakeTimers();
    render(<TagInput {...defaultProps} />);
    const input = screen.getByRole('textbox');
    
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'j' } });
    expect(screen.getByText(/jazz/i)).toBeDefined();
    
    fireEvent.blur(input);
    
    // Explicitly advance timers and wait for re-render
    await act(async () => {
      vi.advanceTimersByTime(200);
    });
    
    expect(screen.queryByText(/jazz/i)).toBeNull();
    vi.useRealTimers();
  });
});
