import { describe, it, expect, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useLongPress } from './useLongPress';

describe('useLongPress', () => {
  it('should trigger long press after 500ms', async () => {
    const onLongPress = vi.fn();
    const { result } = renderHook(() =>
      useLongPress({
        delay: 500,
        onLongPress,
      })
    );

    const { handlers } = result.current;

    // Simulate long press
    act(() => {
      handlers.onMouseDown({} as MouseEvent);
    });

    // Wait for timer to execute
    await waitFor(
      () => {
        expect(onLongPress).toHaveBeenCalledTimes(1);
      },
      { timeout: 550 }
    );
  });

  it('should set isPressed state during press', async () => {
    const onLongPress = vi.fn();
    const { result } = renderHook(() =>
      useLongPress({
        delay: 500,
        onLongPress,
      })
    );

    const { handlers } = result.current;

    expect(result.current.isPressed).toBe(false);

    act(() => {
      handlers.onMouseDown({} as MouseEvent);
    });

    // Check immediately after mouse down
    expect(result.current.isPressed).toBe(true);

    await waitFor(
      () => {
        expect(result.current.isPressed).toBe(false);
      },
      { timeout: 550 }
    );
  });

  it('should cancel on mouse up', () => {
    const onLongPress = vi.fn();
    const onCancel = vi.fn();
    const { result } = renderHook(() =>
      useLongPress({
        delay: 500,
        onLongPress,
        onCancel,
      })
    );

    const { handlers } = result.current;

    act(() => {
      handlers.onMouseDown({} as MouseEvent);
      handlers.onMouseUp();
    });

    expect(onLongPress).not.toHaveBeenCalled();
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('should trigger haptic feedback on long press', async () => {
    const mockVibrate = vi.fn();
    global.navigator.vibrate = mockVibrate;

    const onLongPress = vi.fn();
    const { result } = renderHook(() =>
      useLongPress({
        delay: 100,
        onLongPress,
      })
    );

    const { handlers } = result.current;

    act(() => {
      handlers.onMouseDown({} as MouseEvent);
    });

    await waitFor(
      () => {
        expect(mockVibrate).toHaveBeenCalledWith(50);
      },
      { timeout: 150 }
    );
  });

  it('should cancel on touch move', async () => {
    const onLongPress = vi.fn();
    const { result } = renderHook(() =>
      useLongPress({
        delay: 500,
        onLongPress,
      })
    );

    const { handlers } = result.current;

    act(() => {
      handlers.onTouchStart({} as TouchEvent);
      handlers.onTouchMove();
    });

    await waitFor(
      () => {
        expect(onLongPress).not.toHaveBeenCalled();
      },
      { timeout: 550 }
    );
  });
});
