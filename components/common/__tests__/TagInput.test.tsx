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
    expect(screen.getByText(/funk/i)).toBeDefined();
    expect(screen.getByText(/linear/i)).toBeDefined();
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
    const removeButtons = screen.getAllByRole('button');
    // First two are remove buttons for existing tags
    fireEvent.click(removeButtons[0]);
    
    expect(defaultProps.onChange).toHaveBeenCalledWith(['linear']);
  });

  it('shows suggestions when typing', () => {
    render(<TagInput {...defaultProps} placeholder="Add tag..." />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'j' } });
    
    expect(screen.getByText(/jazz/i)).toBeDefined();
    // 'rock' should not be visible as it doesn't contain 'j'
    expect(screen.queryByText(/rock/i)).toBeNull();
  });

  it('adds a tag from suggestions when clicked', () => {
    render(<TagInput {...defaultProps} placeholder="Add tag..." />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'j' } });
    
    const suggestionBtn = screen.getByText(/jazz/i);
    fireEvent.mouseDown(suggestionBtn); // Use mouseDown as per new implementation
    
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
    
    expect(screen.getByText(/JAZZ/i)).toBeDefined();
    
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
