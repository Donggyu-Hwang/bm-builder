import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { OptionCard } from './OptionCard';
import type { UserOption } from '../../types/onboarding';

describe('OptionCard Component', () => {
  const mockOnSelect = vi.fn();

  const defaultProps = {
    id: 'idea-exists' as UserOption,
    title: '이미 스타트업 아이디어가 있어요',
    description: '아이디어 입력으로 바로 이동',
    icon: '💡',
    onSelect: mockOnSelect,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render card with title and description', () => {
      render(<OptionCard {...defaultProps} />);

      expect(screen.getByText('이미 스타트업 아이디어가 있어요')).toBeInTheDocument();
      expect(screen.getByText('아이디어 입력으로 바로 이동')).toBeInTheDocument();
    });

    it('should render icon', () => {
      render(<OptionCard {...defaultProps} />);

      const icon = screen.getByText('💡');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveAttribute('role', 'img');
    });
  });

  describe('Interaction', () => {
    it('should call onSelect when clicked', () => {
      render(<OptionCard {...defaultProps} />);

      const card = screen.getByText('이미 스타트업 아이디어가 있어요');
      fireEvent.click(card);

      expect(mockOnSelect).toHaveBeenCalledTimes(1);
      expect(mockOnSelect).toHaveBeenCalledWith('idea-exists');
    });

    it('should call onSelect with correct option id', () => {
      const props = {
        ...defaultProps,
        id: 'team' as UserOption,
        title: '팀과 함께하고 있어요',
      };

      render(<OptionCard {...props} />);

      const card = screen.getByText('팀과 함께하고 있어요');
      fireEvent.click(card);

      expect(mockOnSelect).toHaveBeenCalledWith('team');
    });
  });

  describe('Accessibility', () => {
    it('should be keyboard accessible', () => {
      render(<OptionCard {...defaultProps} />);

      const card = screen.getByRole('button');
      card.focus();
      expect(document.activeElement).toBe(card);

      fireEvent.keyDown(card, { key: 'Enter', code: 'Enter' });
      expect(mockOnSelect).toHaveBeenCalledTimes(1);
    });

    it('should have visible focus state', () => {
      render(<OptionCard {...defaultProps} />);

      const card = screen.getByRole('button');
      expect(card).toHaveClass('focus:ring-2');
    });

    it('should meet minimum touch target size (44px)', () => {
      render(<OptionCard {...defaultProps} />);

      const card = screen.getByRole('button');
      const style = window.getComputedStyle(card);
      const minHeight = parseInt(style.minHeight);

      expect(minHeight).toBeGreaterThanOrEqual(44);
    });
  });

  describe('Visual Feedback', () => {
    it('should have hover effect classes', () => {
      render(<OptionCard {...defaultProps} />);

      const card = screen.getByRole('button');
      expect(card.className).toContain('hover:shadow-xl');
      expect(card.className).toContain('hover:border-indigo-500');
    });
  });
});
