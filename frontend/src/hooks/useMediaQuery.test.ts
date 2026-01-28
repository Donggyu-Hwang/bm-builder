import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMediaQuery } from './useMediaQuery';

describe('useMediaQuery Hook', () => {
  const originalMatchMedia = window.matchMedia;

  beforeEach(() => {
    // Reset window.matchMedia before each test
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  afterEach(() => {
    // Restore original matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: originalMatchMedia,
    });
  });

  describe('Initial State', () => {
    it('should return false when media query does not match', () => {
      (window.matchMedia as vi.Mock).mockReturnValue({
        matches: false,
        media: '(max-width: 768px)',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      });

      const { result } = renderHook(() => useMediaQuery('(max-width: 768px)'));

      expect(result.current).toBe(false);
    });

    it('should return true when media query matches', () => {
      (window.matchMedia as vi.Mock).mockReturnValue({
        matches: true,
        media: '(max-width: 768px)',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      });

      const { result } = renderHook(() => useMediaQuery('(max-width: 768px)'));

      expect(result.current).toBe(true);
    });
  });

  describe('Event Listener', () => {
    it('should add event listener on mount', () => {
      const addEventListener = vi.fn();
      (window.matchMedia as vi.Mock).mockReturnValue({
        matches: false,
        media: '(max-width: 768px)',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener,
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      });

      renderHook(() => useMediaQuery('(max-width: 768px)'));

      expect(addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    });

    it('should remove event listener on unmount', () => {
      const addEventListener = vi.fn();
      const removeEventListener = vi.fn();
      (window.matchMedia as vi.Mock).mockReturnValue({
        matches: false,
        media: '(max-width: 768px)',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener,
        removeEventListener,
        dispatchEvent: vi.fn(),
      });

      const { unmount } = renderHook(() => useMediaQuery('(max-width: 768px)'));

      unmount();

      expect(removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    });

    it('should update matches when media query changes', () => {
      let changeListener: ((event: MediaQueryListEvent) => void) | null = null;

      (window.matchMedia as vi.Mock).mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: (_event: string, listener: () => void) => {
          changeListener = listener as any;
        },
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      const { result } = renderHook(() => useMediaQuery('(max-width: 768px)'));

      expect(result.current).toBe(false);

      act(() => {
        if (changeListener) {
          const mockEvent = {
            matches: true,
            media: '(max-width: 768px)',
          } as MediaQueryListEvent;
          changeListener(mockEvent);
        }
      });

      expect(result.current).toBe(true);
    });
  });

  describe('Query Parameter', () => {
    it('should use correct query string', () => {
      const query = '(min-width: 1024px)';
      (window.matchMedia as vi.Mock).mockReturnValue({
        matches: true,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      });

      renderHook(() => useMediaQuery(query));

      expect(window.matchMedia).toHaveBeenCalledWith(query);
    });

    it('should handle different query strings', () => {
      const queries = ['(max-width: 768px)', '(min-width: 1024px)', '(prefers-color-scheme: dark)'];

      queries.forEach((query) => {
        const { unmount: unmount1 } = renderHook(() => useMediaQuery(query));
        expect(window.matchMedia).toHaveBeenCalledWith(query);
        unmount1();
      });

      // Check that each query was called (initial call + potentially during render)
      expect(window.matchMedia).toHaveBeenCalled();
    });
  });
});
