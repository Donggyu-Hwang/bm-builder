import { describe, it, expect, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useDoubleClick } from './useDoubleClick';

describe('useDoubleClick', () => {
  it('should detect double click within 300ms', async () => {
    const onDoubleClick = vi.fn();
    const { result } = renderHook(() =>
      useDoubleClick({
        delay: 300,
        onDoubleClick,
      })
    );

    const { handleClick } = result.current;

    // First click
    act(() => {
      handleClick({ clientX: 100, clientY: 200 } as MouseEvent);
    });
    expect(onDoubleClick).not.toHaveBeenCalled();

    // Second click within 300ms
    act(() => {
      handleClick({ clientX: 100, clientY: 200 } as MouseEvent);
    });

    // Wait for timer to execute
    await waitFor(
      () => {
        expect(onDoubleClick).toHaveBeenCalledTimes(1);
      },
      { timeout: 350 }
    );
  });

  it('should track click coordinates', () => {
    const { result } = renderHook(() => useDoubleClick());

    const { handleClick, getClickCoordinates } = result.current;

    act(() => {
      handleClick({ clientX: 500, clientY: 300 } as MouseEvent);
    });

    const coords = getClickCoordinates();
    expect(coords).toEqual({ x: 500, y: 300 });
  });

  it('should call onSingleClick if only one click', async () => {
    const onSingleClick = vi.fn();
    const onDoubleClick = vi.fn();
    const { result } = renderHook(() =>
      useDoubleClick({
        delay: 300,
        onSingleClick,
        onDoubleClick,
      })
    );

    const { handleClick } = result.current;

    act(() => {
      handleClick({ clientX: 100, clientY: 200 } as MouseEvent);
    });

    // Wait for timer to execute
    await waitFor(
      () => {
        expect(onSingleClick).toHaveBeenCalledTimes(1);
        expect(onDoubleClick).not.toHaveBeenCalled();
      },
      { timeout: 350 }
    );
  });

  it('should reset clicks after delay', async () => {
    const onDoubleClick = vi.fn();
    const { result } = renderHook(() =>
      useDoubleClick({
        delay: 100,
        onDoubleClick,
      })
    );

    const { handleClick } = result.current;

    // First click
    act(() => {
      handleClick({ clientX: 100, clientY: 200 } as MouseEvent);
    });

    // Wait longer than delay for click to reset
    await new Promise(resolve => setTimeout(resolve, 150));

    // Verify onDoubleClick was never called
    expect(onDoubleClick).not.toHaveBeenCalled();

    // Second click after delay should not trigger double-click
    act(() => {
      handleClick({ clientX: 100, clientY: 200 } as MouseEvent);
    });

    // Wait another delay period
    await new Promise(resolve => setTimeout(resolve, 150));

    // Still should not have been called
    expect(onDoubleClick).not.toHaveBeenCalled();
  });
});
