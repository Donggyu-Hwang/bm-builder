import React, { useRef, useEffect } from 'react';
import { X, Keyboard } from 'lucide-react';
import { useEscapeKey, useFocusTrap } from '../../hooks/useKeyboardNavigation';

interface Shortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  description: string;
  category: string;
}

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  shortcuts?: Shortcut[];
}

/**
 * Keyboard Shortcuts Documentation Modal
 * Displays all available keyboard shortcuts in an accessible format
 */
export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
  shortcuts = defaultShortcuts
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEscapeKey(onClose, isOpen);
  useFocusTrap(modalRef, isOpen);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Group shortcuts by category
  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, Shortcut[]>);

  const formatKey = (key: string, shortcut: Shortcut): React.ReactNode => {
    const modifiers = [];
    if (shortcut.ctrlKey) modifiers.push('Ctrl');
    if (shortcut.metaKey) modifiers.push('⌘');
    if (shortcut.shiftKey) modifiers.push('Shift');
    if (shortcut.altKey) modifiers.push('Alt');

    return (
      <div className="flex items-center gap-1">
        {modifiers.map((mod) => (
          <kbd
            key={mod}
            className="px-2 py-1 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded"
          >
            {mod}
          </kbd>
        ))}
        <kbd
          className="px-2 py-1 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded"
        >
          {key}
        </kbd>
      </div>
    );
  };

  const categories = Object.keys(groupedShortcuts);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="keyboard-shortcuts-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[80vh] overflow-hidden border-2 border-orange-100 dark:border-orange-900"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-orange-50 to-pink-50 dark:from-gray-800 dark:to-gray-700">
          <div className="flex items-center gap-3">
            <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-xl">
              <Keyboard className="w-6 h-6 text-orange-500" />
            </div>
            <h2
              id="keyboard-shortcuts-title"
              className="text-2xl font-bold text-gray-900 dark:text-white"
            >
              Keyboard Shortcuts
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close keyboard shortcuts"
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-100px)]">
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Work faster with keyboard shortcuts! Press{' '}
            <kbd className="px-2 py-1 text-xs font-semibold bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded">
              ?
            </kbd>{' '}
            anytime to see this list.
          </p>

          {/* Shortcuts List */}
          <div className="space-y-6">
            {categories.map((category) => (
              <div key={category}>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <span className="w-1 h-6 bg-gradient-to-b from-orange-500 to-pink-500 rounded-full" />
                  {category}
                </h3>
                <div className="space-y-2">
                  {groupedShortcuts[category].map((shortcut, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {shortcut.description}
                      </span>
                      {formatKey(shortcut.key, shortcut)}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Tips */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
              <span className="text-lg">💡</span>
              Pro Tips
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Most shortcuts work throughout the application</li>
              <li>• Use <kbd className="px-1 text-xs font-mono bg-blue-100 dark:bg-blue-800 rounded">Escape</kbd> to close any modal or dialog</li>
              <li>• Navigation arrows work in lists and menus</li>
              <li>• Press <kbd className="px-1 text-xs font-mono bg-blue-100 dark:bg-blue-800 rounded">Tab</kbd> to move between interactive elements</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
};

// Default keyboard shortcuts
const defaultShortcuts: Shortcut[] = [
  // Navigation
  { key: 'ArrowUp', description: 'Navigate up in lists', category: 'Navigation' },
  { key: 'ArrowDown', description: 'Navigate down in lists', category: 'Navigation' },
  { key: 'ArrowLeft', description: 'Navigate left (or go back)', category: 'Navigation' },
  { key: 'ArrowRight', description: 'Navigate right (or go forward)', category: 'Navigation' },
  { key: 'Home', description: 'Jump to first item', category: 'Navigation' },
  { key: 'End', description: 'Jump to last item', category: 'Navigation' },

  // Actions
  { key: 'Enter', description: 'Activate selected item', category: 'Actions' },
  { key: ' ', description: 'Select/toggle item', category: 'Actions' },
  { key: 'Escape', description: 'Close modal or cancel action', category: 'Actions' },
  { key: 'Delete', description: 'Delete selected item', category: 'Actions' },

  // Editing
  { key: 's', ctrlKey: true, description: 'Save current work', category: 'Editing' },
  { key: 'z', ctrlKey: true, description: 'Undo last action', category: 'Editing' },
  { key: 'z', ctrlKey: true, shiftKey: true, description: 'Redo last action', category: 'Editing' },
  { key: 'c', ctrlKey: true, description: 'Copy selection', category: 'Editing' },
  { key: 'v', ctrlKey: true, description: 'Paste from clipboard', category: 'Editing' },
  { key: 'x', ctrlKey: true, description: 'Cut selection', category: 'Editing' },
  { key: 'a', ctrlKey: true, description: 'Select all items', category: 'Editing' },

  // Search
  { key: 'k', ctrlKey: true, description: 'Open command palette', category: 'Search' },
  { key: 'f', ctrlKey: true, description: 'Find in page', category: 'Search' },

  // View
  { key: 'd', ctrlKey: true, description: 'Toggle dark mode', category: 'View' },
  { key: '?', description: 'Show keyboard shortcuts', category: 'View' },
  { key: 'r', ctrlKey: true, description: 'Refresh page', category: 'View' }
];

/**
 * Hook for managing keyboard shortcuts modal
 */
export const useKeyboardShortcutsModal = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Open with ? key (only when not typing in input)
      if (event.key === '?' && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName || '')) {
        event.preventDefault();
        setIsOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const ShortcutModal = React.useCallback(() => (
    <KeyboardShortcutsModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
  ), [isOpen]);

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    ShortcutModal
  };
};

/**
 * Keyboard shortcut badge component
 */
export const KeyboardShortcutBadge: React.FC<{ shortcut: string }> = ({ shortcut }) => (
  <kbd className="px-2 py-1 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded">
    {shortcut}
  </kbd>
);
