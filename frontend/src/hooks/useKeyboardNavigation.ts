import { useEffect, useCallback } from 'react';

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  handler: (event: KeyboardEvent) => void;
  description: string;
}

interface KeyboardNavigationOptions {
  enabled?: boolean;
  preventDefault?: boolean;
}

/**
 * Custom hook for keyboard navigation
 * Handles global keyboard shortcuts and accessibility
 */
export const useKeyboardNavigation = (
  shortcuts: KeyboardShortcut[],
  options: KeyboardNavigationOptions = {}
) => {
  const { enabled = true, preventDefault = true } = options;

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      for (const shortcut of shortcuts) {
        const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatches = shortcut.ctrlKey === undefined || event.ctrlKey === shortcut.ctrlKey;
        const shiftMatches = shortcut.shiftKey === undefined || event.shiftKey === shortcut.shiftKey;
        const altMatches = shortcut.altKey === undefined || event.altKey === shortcut.altKey;
        const metaMatches = shortcut.metaKey === undefined || event.metaKey === shortcut.metaKey;

        if (keyMatches && ctrlMatches && shiftMatches && altMatches && metaMatches) {
          if (preventDefault) {
            event.preventDefault();
          }
          shortcut.handler(event);
          break;
        }
      }
    },
    [shortcuts, enabled, preventDefault]
  );

  useEffect(() => {
    if (enabled) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [handleKeyDown, enabled]);
};

/**
 * Hook for handling Escape key to close modals/dropdowns
 */
export const useEscapeKey = (callback: () => void, enabled = true) => {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (enabled && event.key === 'Escape') {
        event.preventDefault();
        callback();
      }
    };

    if (enabled) {
      window.addEventListener('keydown', handleEscape);
      return () => window.removeEventListener('keydown', handleEscape);
    }
  }, [callback, enabled]);
};

/**
 * Hook for trap focus in modals for accessibility
 */
export const useFocusTrap = (containerRef: React.RefObject<HTMLElement>, enabled = true) => {
  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTab = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    };

    // Focus first element on mount
    firstElement?.focus();

    document.addEventListener('keydown', handleTab);
    return () => document.removeEventListener('keydown', handleTab);
  }, [containerRef, enabled]);
};

/**
 * Hook for arrow key navigation in lists
 */
export const useArrowNavigation = (
  itemCount: number,
  selectedIndex: number,
  onSelect: (index: number) => void,
  options: { enabled?: boolean; loop?: boolean } = {}
) => {
  const { enabled = true, loop = true } = options;

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        const nextIndex = selectedIndex + 1;
        if (nextIndex < itemCount) {
          onSelect(nextIndex);
        } else if (loop) {
          onSelect(0);
        }
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        const prevIndex = selectedIndex - 1;
        if (prevIndex >= 0) {
          onSelect(prevIndex);
        } else if (loop) {
          onSelect(itemCount - 1);
        }
      } else if (event.key === 'Home') {
        event.preventDefault();
        onSelect(0);
      } else if (event.key === 'End') {
        event.preventDefault();
        onSelect(itemCount - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [itemCount, selectedIndex, onSelect, enabled, loop]);
};

/**
 * Hook for Enter/Space key activation
 */
export const useKeyboardActivation = (
  callback: () => void,
  options: { enabled?: boolean; enter?: boolean; space?: boolean } = {}
) => {
  const { enabled = true, enter = true, space = true } = options;

  const handleKeyDown = (event: KeyboardEvent) => {
    if (!enabled) return;

    if ((enter && event.key === 'Enter') || (space && event.key === ' ')) {
      event.preventDefault();
      callback();
    }
  };

  useEffect(() => {
    if (enabled) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [callback, enabled, enter, space]);
};

/**
 * Common keyboard shortcuts documentation
 */
export const KeyboardShortcuts = {
  // Navigation
  NavigateUp: { key: 'ArrowUp', description: 'Navigate up in lists' },
  NavigateDown: { key: 'ArrowDown', description: 'Navigate down in lists' },
  NavigateLeft: { key: 'ArrowLeft', description: 'Navigate left (or go back)' },
  NavigateRight: { key: 'ArrowRight', description: 'Navigate right (or go forward)' },
  Home: { key: 'Home', description: 'Jump to first item' },
  End: { key: 'End', description: 'Jump to last item' },

  // Actions
  Activate: { key: 'Enter', description: 'Activate selected item' },
  Select: { key: 'Space', description: 'Select/toggle item' },
  Escape: { key: 'Escape', description: 'Close modal or cancel action' },
  Save: { key: 's', ctrlKey: true, description: 'Save current work' },
  Delete: { key: 'Delete', description: 'Delete selected item' },

  // Editing
  Undo: { key: 'z', ctrlKey: true, description: 'Undo last action' },
  Redo: { key: 'z', ctrlKey: true, shiftKey: true, description: 'Redo last action' },
  Copy: { key: 'c', ctrlKey: true, description: 'Copy selection' },
  Paste: { key: 'v', ctrlKey: true, description: 'Paste from clipboard' },
  Cut: { key: 'x', ctrlKey: true, description: 'Cut selection' },
  SelectAll: { key: 'a', ctrlKey: true, description: 'Select all items' },

  // Search
  Search: { key: 'k', ctrlKey: true, description: 'Open search' },
  Find: { key: 'f', ctrlKey: true, description: 'Find in page' },

  // View
  ToggleDarkMode: { key: 'd', ctrlKey: true, description: 'Toggle dark mode' },
  ShowShortcuts: { key: '?', description: 'Show keyboard shortcuts' },
  Refresh: { key: 'r', ctrlKey: true, description: 'Refresh page' }
};
