import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { OnboardingModeBadge } from './OnboardingModeBadge';
import type { OnboardingMode } from '../../types/canvas';

describe('OnboardingModeBadge Component', () => {
  const renderBadge = (mode: OnboardingMode) => {
    return render(<OnboardingModeBadge mode={mode} />);
  };

  describe('Rendering', () => {
    it('should render beginner mode badge', () => {
      renderBadge('beginner');

      expect(screen.getByText('온보딩 모드:')).toBeInTheDocument();
      expect(screen.getByText('초보자 모드')).toBeInTheDocument();
    });

    it('should render problem-discovery mode badge', () => {
      renderBadge('problem-discovery');

      expect(screen.getByText('문제 발굴 모드')).toBeInTheDocument();
    });

    it('should render team mode badge', () => {
      renderBadge('team');

      expect(screen.getByText('팀 온보딩 모드')).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should apply correct color classes for each mode', () => {
      const { rerender } = render(<OnboardingModeBadge mode="beginner" />);

      let badge = screen.getByRole('status');
      expect(badge).toHaveClass('bg-green-100');

      rerender(<OnboardingModeBadge mode="problem-discovery" />);
      badge = screen.getByRole('status');
      expect(badge).toHaveClass('bg-blue-100');

      rerender(<OnboardingModeBadge mode="team" />);
      badge = screen.getByRole('status');
      expect(badge).toHaveClass('bg-purple-100');
    });
  });

  describe('Accessibility', () => {
    it('should have role="status"', () => {
      renderBadge('beginner');

      const badge = screen.getByRole('status');
      expect(badge).toBeInTheDocument();
    });

    it('should have aria-live="polite"', () => {
      renderBadge('beginner');

      const badge = screen.getByRole('status');
      expect(badge).toHaveAttribute('aria-live', 'polite');
    });
  });
});
