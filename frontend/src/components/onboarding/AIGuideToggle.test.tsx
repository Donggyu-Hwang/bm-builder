import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AIGuideToggle } from './AIGuideToggle';

describe('AIGuideToggle', () => {
  const mockOnToggle = vi.fn();

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('renders toggle switch correctly', () => {
    render(<AIGuideToggle enabled={true} onToggle={mockOnToggle} />);
    expect(screen.getByText('AI 가이드')).toBeInTheDocument();
  });

  it('shows enabled state when enabled prop is true', () => {
    render(<AIGuideToggle enabled={true} onToggle={mockOnToggle} />);
    const toggle = screen.getByRole('switch');
    expect(toggle).toHaveAttribute('aria-checked', 'true');
  });

  it('shows disabled state when enabled prop is false', () => {
    render(<AIGuideToggle enabled={false} onToggle={mockOnToggle} />);
    const toggle = screen.getByRole('switch');
    expect(toggle).toHaveAttribute('aria-checked', 'false');
  });

  it('calls onToggle with opposite value when clicked', () => {
    render(<AIGuideToggle enabled={true} onToggle={mockOnToggle} />);
    const toggle = screen.getByRole('switch');
    fireEvent.click(toggle);
    expect(mockOnToggle).toHaveBeenCalledWith(false);
  });

  it('saves state to localStorage when toggled', () => {
    render(<AIGuideToggle enabled={true} onToggle={mockOnToggle} />);
    const toggle = screen.getByRole('switch');
    fireEvent.click(toggle);
    expect(localStorage.getItem('bm_builder_ai_guide_toggle')).toBe('false');
  });
});
