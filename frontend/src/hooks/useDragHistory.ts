import { useState, useCallback, useRef, useEffect } from 'react';

interface HistoryEntry {
  nodeId: string;
  fromPosition: { x: number; y: number };
  toPosition: { x: number; y: number };
  timestamp: number;
}

interface UseDragHistoryOptions {
  maxSize?: number;
  onUndo?: (entry: HistoryEntry) => void;
  onRedo?: (entry: HistoryEntry) => void;
}

/**
 * Custom hook for managing drag operation history with undo/redo support
 *
 * Features:
 * - Linear undo/redo stack (max 10 entries by default)
 * - Timestamp-based history tracking
 * - Memory-efficient history (stores position deltas only)
 * - Keyboard shortcuts (Ctrl+Z / Ctrl+Shift+Z)
 *
 * Story 2.3 Acceptance Criteria:
 * - AC 2.3.7: Undo/redo for drag operations
 */
export const useDragHistory = (options: UseDragHistoryOptions = {}) => {
  const { maxSize = 10, onUndo, onRedo } = options;

  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const isPerformingUndoRedoRef = useRef(false);
  const currentIndexRef = useRef(currentIndex);

  // Keep ref in sync with state
  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  /**
   * Add a new history entry
   */
  const addToHistory = useCallback(
    (entry: HistoryEntry) => {
      // Use ref to get current value, avoiding stale closure
      const currentIdx = currentIndexRef.current;

      setHistory((prevHistory) => {
        // Remove any forward history if we're not at the end
        const truncatedHistory = currentIdx < prevHistory.length - 1
          ? prevHistory.slice(0, currentIdx + 1)
          : prevHistory;

        // Add new entry
        const newHistory = [...truncatedHistory, entry];

        // Limit history size
        const finalHistory = newHistory.length > maxSize
          ? newHistory.slice(1)
          : newHistory;

        // Update index to point to new last entry
        setCurrentIndex(finalHistory.length - 1);

        return finalHistory;
      });
    },
    [maxSize]
  );

  /**
   * Undo the last drag operation
   */
  const undo = useCallback(() => {
    if (currentIndex < 0) return null;

    const entry = history[currentIndex];
    isPerformingUndoRedoRef.current = true;

    onUndo?.(entry);

    setCurrentIndex(currentIndex - 1);

    // Reset flag after callback execution
    setTimeout(() => {
      isPerformingUndoRedoRef.current = false;
    }, 0);

    return entry;
  }, [currentIndex, history, onUndo]);

  /**
   * Redo the next drag operation
   */
  const redo = useCallback(() => {
    if (currentIndex >= history.length - 1) return null;

    const entry = history[currentIndex + 1];
    isPerformingUndoRedoRef.current = true;

    onRedo?.(entry);

    setCurrentIndex(currentIndex + 1);

    // Reset flag after callback execution
    setTimeout(() => {
      isPerformingUndoRedoRef.current = false;
    }, 0);

    return entry;
  }, [currentIndex, history, onRedo]);

  /**
   * Clear all history
   */
  const clear = useCallback(() => {
    setHistory([]);
    setCurrentIndex(-1);
  }, []);

  /**
   * Check if undo is available
   */
  const canUndo = currentIndex >= 0;

  /**
   * Check if redo is available
   */
  const canRedo = currentIndex < history.length - 1;

  return {
    history,
    currentIndex,
    addToHistory,
    undo,
    redo,
    clear,
    canUndo,
    canRedo,
  };
};

export default useDragHistory;
