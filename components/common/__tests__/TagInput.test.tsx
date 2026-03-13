import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TagInput } from '../TagInput';
import React from 'react';

describe('TagInput', () => {
  const defaultProps = {
    tags: ['funk', 'linear'],
    onChange: vi.fn(),
    suggestions: ['rock', 'jazz', 'shuffle'],
  };

  it('renders existing tags', () => {
    render(<TagInput {...defaultProps} />);
    expect(screen.getByText(/funk/i)).toBeDefined();
    expect(screen.getByText(/linear/i)).toBeDefined();
  });

  it('calls onChange with new tag when Enter is pressed', () => {
    render(<TagInput {...defaultProps} placeholder="Add tag..." />);
    const input = screen.getByPlaceholderText(/add tag/i);
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
    const input = screen.getByPlaceholderText(/add tag/i);
    fireEvent.change(input, { target: { value: 'j' } });
    
    expect(screen.getByText(/jazz/i)).toBeDefined();
    // 'rock' should not be visible as it doesn't contain 'j'
    expect(screen.queryByText(/rock/i)).toBeNull();
  });

  it('adds a tag from suggestions when clicked', () => {
    render(<TagInput {...defaultProps} placeholder="Add tag..." />);
    const input = screen.getByPlaceholderText(/add tag/i);
    fireEvent.change(input, { target: { value: 'j' } });
    
    const suggestionBtn = screen.getByText(/jazz/i);
    fireEvent.click(suggestionBtn);
    
    expect(defaultProps.onChange).toHaveBeenCalledWith(['funk', 'linear', 'jazz']);
  });

  it('removes last tag when Backspace is pressed on empty input', () => {
    render(<TagInput {...defaultProps} placeholder="Add tag..." />);
    const input = screen.getByPlaceholderText(/add tag/i);
    fireEvent.keyDown(input, { key: 'Backspace' });
    
    expect(defaultProps.onChange).toHaveBeenCalledWith(['funk']);
  });
});
