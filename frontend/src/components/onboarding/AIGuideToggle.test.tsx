import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AIGuideToggle } from './AIGuideToggle';

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

vi.stubGlobal('localStorage', mockLocalStorage);

describe('AIGuideToggle Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render toggle switch', () => {
      render(<AIGuideToggle enabled={true} onToggle={vi.fn()} />);

      expect(screen.getByText('AI 가이드')).toBeInTheDocument();
      expect(screen.getByText('켜짐')).toBeInTheDocument();
    });

    it('should render disabled state', () => {
      render(<AIGuideToggle enabled={false} onToggle={vi.fn()} />);

      expect(screen.getByText('꺼짐')).toBeInTheDocument();
    });
  });

  describe('Interaction', () => {
    it('should call onToggle when clicked', () => {
      const handleToggle = vi.fn();
      render(<AIGuideToggle enabled={false} onToggle={handleToggle} />);

      const toggle = screen.getByRole('switch');
      fireEvent.click(toggle);

      expect(handleToggle).toHaveBeenCalledTimes(1);
      expect(handleToggle).toHaveBeenCalledWith(true);
    });

    it('should store state in localStorage', () => {
      const handleToggle = vi.fn();
      render(<AIGuideToggle enabled={false} onToggle={handleToggle} />);

      const toggle = screen.getByRole('switch');
      fireEvent.click(toggle);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('bm_builder_ai_guide_toggle', 'true');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<AIGuideToggle enabled={true} onToggle={vi.fn()} />);

      const toggle = screen.getByRole('switch');
      expect(toggle).toHaveAttribute('aria-checked', 'true');
      expect(toggle).toHaveAttribute('aria-label', 'AI 가이드 켜기/끄기');
    });

    it('should be keyboard navigable', () => {
      const handleToggle = vi.fn();
      render(<AIGuideToggle enabled={false} onToggle={handleToggle} />);

      const toggleContainer = screen.getByLabelText('AI 가이드 켜기/끄기');
      toggleContainer.focus();
      fireEvent.keyDown(toggleContainer, { key: 'Enter' });

      expect(handleToggle).toHaveBeenCalled();
    });

    it('should respond to Space key', () => {
      const handleToggle = vi.fn();
      render(<AIGuideToggle enabled={false} onToggle={handleToggle} />);

      const toggleContainer = screen.getByLabelText('AI 가이드 켜기/끄기');
      fireEvent.keyDown(toggleContainer, { key: ' ' });

      expect(handleToggle).toHaveBeenCalled();
    });
  });

  describe('Visual Feedback', () => {
    it('should show correct state text', () => {
      const { rerender } = render(<AIGuideToggle enabled={false} onToggle={vi.fn()} />);

      expect(screen.getByText('꺼짐')).toBeInTheDocument();

      rerender(<AIGuideToggle enabled={true} onToggle={vi.fn()} />);
      expect(screen.getByText('켜짐')).toBeInTheDocument();
    });

    it('should show correct toggle button styling', () => {
      const { container } = render(<AIGuideToggle enabled={true} onToggle={vi.fn()} />);

      const button = container.querySelector('button[type="button"]');
      expect(button).toBeInTheDocument();
      expect(button?.className).toContain('bg-indigo-600');
    });
  });
});
