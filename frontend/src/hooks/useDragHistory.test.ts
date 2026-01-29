import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDragHistory } from './useDragHistory';

describe('useDragHistory', () => {
  const mockOnUndo = vi.fn();
  const mockOnRedo = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with empty history', () => {
    const { result } = renderHook(() => useDragHistory());

    expect(result.current.history).toEqual([]);
    expect(result.current.currentIndex).toBe(-1);
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
  });

  it('adds entry to history', () => {
    const { result } = renderHook(() => useDragHistory());

    act(() => {
      result.current.addToHistory({
        nodeId: 'node-1',
        fromPosition: { x: 100, y: 100 },
        toPosition: { x: 200, y: 200 },
        timestamp: Date.now(),
      });
    });

    expect(result.current.history.length).toBe(1);
    expect(result.current.currentIndex).toBe(0);
    expect(result.current.canUndo).toBe(true);
    expect(result.current.canRedo).toBe(false);
  });

  it('undos last operation', () => {
    const { result } = renderHook(() =>
      useDragHistory({
        onUndo: mockOnUndo,
        onRedo: mockOnRedo,
      })
    );

    // Add entry
    act(() => {
      result.current.addToHistory({
        nodeId: 'node-1',
        fromPosition: { x: 100, y: 100 },
        toPosition: { x: 200, y: 200 },
        timestamp: Date.now(),
      });
    });

    // Undo
    act(() => {
      result.current.undo();
    });

    expect(mockOnUndo).toHaveBeenCalledWith(
      expect.objectContaining({
        nodeId: 'node-1',
        fromPosition: { x: 100, y: 100 },
        toPosition: { x: 200, y: 200 },
      })
    );
    expect(result.current.currentIndex).toBe(-1);
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(true);
  });

  it('redos next operation', () => {
    const { result } = renderHook(() =>
      useDragHistory({
        onUndo: mockOnUndo,
        onRedo: mockOnRedo,
      })
    );

    // Add entry
    act(() => {
      result.current.addToHistory({
        nodeId: 'node-1',
        fromPosition: { x: 100, y: 100 },
        toPosition: { x: 200, y: 200 },
        timestamp: Date.now(),
      });
    });

    // Undo
    act(() => {
      result.current.undo();
    });

    // Redo
    act(() => {
      result.current.redo();
    });

    expect(mockOnRedo).toHaveBeenCalledWith(
      expect.objectContaining({
        nodeId: 'node-1',
      })
    );
    expect(result.current.currentIndex).toBe(0);
    expect(result.current.canUndo).toBe(true);
    expect(result.current.canRedo).toBe(false);
  });

  it('limits history size to maxSize', () => {
    const { result } = renderHook(() =>
      useDragHistory({
        maxSize: 3,
      })
    );

    // Add 5 entries (max size is 3)
    for (let i = 0; i < 5; i++) {
      act(() => {
        result.current.addToHistory({
          nodeId: `node-${i}`,
          fromPosition: { x: i * 100, y: i * 100 },
          toPosition: { x: (i + 1) * 100, y: (i + 1) * 100 },
          timestamp: Date.now(),
        });
      });
    }

    // Should only keep last 3 entries
    expect(result.current.history.length).toBe(3);
    expect(result.current.history[0].nodeId).toBe('node-2');
    expect(result.current.history[1].nodeId).toBe('node-3');
    expect(result.current.history[2].nodeId).toBe('node-4');
  });

  it('clears forward history when adding new entry after undo', () => {
    const { result } = renderHook(() => useDragHistory());

    // Add 3 entries
    for (let i = 0; i < 3; i++) {
      act(() => {
        result.current.addToHistory({
          nodeId: `node-${i}`,
          fromPosition: { x: i * 100, y: i * 100 },
          toPosition: { x: (i + 1) * 100, y: (i + 1) * 100 },
          timestamp: Date.now(),
        });
      });
    }

    expect(result.current.history.length).toBe(3);

    // Undo once
    act(() => {
      result.current.undo();
    });

    expect(result.current.currentIndex).toBe(1);

    // Add new entry (should clear forward history)
    act(() => {
      result.current.addToHistory({
        nodeId: 'node-new',
        fromPosition: { x: 0, y: 0 },
        toPosition: { x: 100, y: 100 },
        timestamp: Date.now(),
      });
    });

    // Should only have 3 entries now (first 2 + new entry)
    expect(result.current.history.length).toBe(3);
    // The history should contain: node-0, node-1, node-new
    expect(result.current.history[0].nodeId).toBe('node-0');
    expect(result.current.history[1].nodeId).toBe('node-1');
    expect(result.current.history[2].nodeId).toBe('node-new');
    // Current index should point to the new entry
    expect(result.current.currentIndex).toBe(2);
  });

  it('clears all history', () => {
    const { result } = renderHook(() => useDragHistory());

    // Add entries
    act(() => {
      result.current.addToHistory({
        nodeId: 'node-1',
        fromPosition: { x: 100, y: 100 },
        toPosition: { x: 200, y: 200 },
        timestamp: Date.now(),
      });
    });

    expect(result.current.history.length).toBe(1);

    // Clear
    act(() => {
      result.current.clear();
    });

    expect(result.current.history).toEqual([]);
    expect(result.current.currentIndex).toBe(-1);
  });

  it('does not undo when at the beginning of history', () => {
    const { result } = renderHook(() =>
      useDragHistory({
        onUndo: mockOnUndo,
      })
    );

    const resultUndo = result.current.undo();

    expect(resultUndo).toBeNull();
    expect(mockOnUndo).not.toHaveBeenCalled();
  });

  it('does not redo when at the end of history', () => {
    const { result } = renderHook(() =>
      useDragHistory({
        onRedo: mockOnRedo,
      })
    );

    // Add entry
    act(() => {
      result.current.addToHistory({
        nodeId: 'node-1',
        fromPosition: { x: 100, y: 100 },
        toPosition: { x: 200, y: 200 },
        timestamp: Date.now(),
      });
    });

    const resultRedo = result.current.redo();

    expect(resultRedo).toBeNull();
    expect(mockOnRedo).not.toHaveBeenCalled();
  });
});
