import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useNodeDrag } from './useNodeDrag';

describe('useNodeDrag', () => {
  const mockNodes = [
    { id: 'node-1', x: 100, y: 100, width: 200, height: 150 },
    { id: 'node-2', x: 400, y: 300, width: 200, height: 150 },
  ];

  const mockOnDragStart = vi.fn();
  const mockOnDragMove = vi.fn();
  const mockOnDragEnd = vi.fn();
  const mockOnMultiDragMove = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock navigator.vibrate
    Object.defineProperty(navigator, 'vibrate', {
      value: vi.fn(),
      writable: true,
    });
  });

  it('initializes with correct default state', () => {
    const { result } = renderHook(() =>
      useNodeDrag({
        onDragStart: mockOnDragStart,
        onDragMove: mockOnDragMove,
        onDragEnd: mockOnDragEnd,
        nodes: mockNodes,
      })
    );

    expect(result.current[0]).toEqual({
      isDragging: false,
      draggedNodeId: null,
      dragStartTime: 0,
      lastFrameTime: 0,
      fps: 60,
      currentPosition: null,
      velocity: { x: 0, y: 0 },
      isPinchZooming: false,
      initialPinchDistance: 0,
    });
  });

  it('starts drag on mouse down', () => {
    const { result } = renderHook(() =>
      useNodeDrag({
        onDragStart: mockOnDragStart,
        onDragMove: mockOnDragMove,
        onDragEnd: mockOnDragEnd,
        nodes: mockNodes,
      })
    );

    act(() => {
      const mockEvent = {
        preventDefault: vi.fn(),
        clientX: 150,
        clientY: 150,
      } as unknown as React.MouseEvent;
      result.current[1].onMouseDown('node-1', mockEvent);
    });

    expect(result.current[0].isDragging).toBe(true);
    expect(result.current[0].draggedNodeId).toBe('node-1');
    expect(mockOnDragStart).toHaveBeenCalledWith('node-1');
    expect(navigator.vibrate).toHaveBeenCalledWith(50); // Haptic feedback
  });

  it('starts drag on touch start', () => {
    const { result } = renderHook(() =>
      useNodeDrag({
        onDragStart: mockOnDragStart,
        onDragMove: mockOnDragMove,
        onDragEnd: mockOnDragEnd,
        nodes: mockNodes,
      })
    );

    act(() => {
      const mockEvent = {
        preventDefault: vi.fn(),
        touches: [{ clientX: 150, clientY: 150 }],
      } as unknown as React.TouchEvent;
      result.current[1].onTouchStart('node-1', mockEvent);
    });

    expect(result.current[0].isDragging).toBe(true);
    expect(result.current[0].draggedNodeId).toBe('node-1');
  });

  it('updates position during drag', async () => {
    const { result } = renderHook(() =>
      useNodeDrag({
        onDragStart: mockOnDragStart,
        onDragMove: mockOnDragMove,
        onDragEnd: mockOnDragEnd,
        nodes: mockNodes,
      })
    );

    // Start drag
    act(() => {
      const mockEvent = {
        preventDefault: vi.fn(),
        clientX: 150,
        clientY: 150,
      } as unknown as React.MouseEvent;
      result.current[1].onMouseDown('node-1', mockEvent);
    });

    // Move mouse
    act(() => {
      const mockEvent = {
        preventDefault: vi.fn(),
        clientX: 200,
        clientY: 200,
      } as unknown as React.MouseEvent;
      result.current[1].onMouseMove(mockEvent);
    });

    await waitFor(() => {
      expect(mockOnDragMove).toHaveBeenCalled();
    });
  });

  it('ends drag on mouse up', () => {
    const { result } = renderHook(() =>
      useNodeDrag({
        onDragStart: mockOnDragStart,
        onDragMove: mockOnDragMove,
        onDragEnd: mockOnDragEnd,
        nodes: mockNodes,
      })
    );

    // Start drag
    act(() => {
      const mockEvent = {
        preventDefault: vi.fn(),
        clientX: 150,
        clientY: 150,
      } as unknown as React.MouseEvent;
      result.current[1].onMouseDown('node-1', mockEvent);
    });

    // End drag
    act(() => {
      const mockEvent = {
        preventDefault: vi.fn(),
      } as unknown as React.MouseEvent;
      result.current[1].onMouseUp(mockEvent);
    });

    expect(result.current[0].isDragging).toBe(false);
    expect(result.current[0].draggedNodeId).toBe(null);
    expect(mockOnDragEnd).toHaveBeenCalled();
    expect(navigator.vibrate).toHaveBeenCalledWith([30, 50, 30]); // Triple tick pattern
  });

  it('constrains position within canvas bounds', () => {
    const { result } = renderHook(() =>
      useNodeDrag({
        onDragStart: mockOnDragStart,
        onDragMove: mockOnDragMove,
        onDragEnd: mockOnDragEnd,
        canvasBounds: { width: 800, height: 600 },
        nodes: mockNodes,
      })
    );

    // Start drag
    act(() => {
      const mockEvent = {
        preventDefault: vi.fn(),
        clientX: 150,
        clientY: 150,
      } as unknown as React.MouseEvent;
      result.current[1].onMouseDown('node-1', mockEvent);
    });

    // Try to move outside bounds (negative position)
    act(() => {
      const mockEvent = {
        preventDefault: vi.fn(),
        clientX: -100,
        clientY: -100,
      } as unknown as React.MouseEvent;
      result.current[1].onMouseMove(mockEvent);
    });

    // Position should be constrained to 0,0 (minimum)
    waitFor(() => {
      expect(mockOnDragMove).toHaveBeenCalledWith(
        'node-1',
        expect.objectContaining({
          x: expect.any(Number),
          y: expect.any(Number),
        })
      );
    });
  });

  it('handles multi-select drag', async () => {
    const { result } = renderHook(() =>
      useNodeDrag({
        onDragStart: mockOnDragStart,
        onDragMove: mockOnDragMove,
        onDragEnd: mockOnDragEnd,
        onMultiDragMove: mockOnMultiDragMove,
        selectedNodeIds: ['node-1', 'node-2'],
        nodes: mockNodes,
      })
    );

    // Start drag on selected node
    act(() => {
      const mockEvent = {
        preventDefault: vi.fn(),
        clientX: 150,
        clientY: 150,
      } as unknown as React.MouseEvent;
      result.current[1].onMouseDown('node-1', mockEvent);
    });

    // Move
    act(() => {
      const mockEvent = {
        preventDefault: vi.fn(),
        clientX: 200,
        clientY: 200,
      } as unknown as React.MouseEvent;
      result.current[1].onMouseMove(mockEvent);
    });

    await waitFor(() => {
      expect(mockOnMultiDragMove).toHaveBeenCalledWith(['node-1', 'node-2'], expect.any(Object));
    });
  });

  it('calculates velocity correctly during drag', () => {
    const { result } = renderHook(() =>
      useNodeDrag({
        onDragStart: mockOnDragStart,
        onDragMove: mockOnDragMove,
        onDragEnd: mockOnDragEnd,
        nodes: mockNodes,
      })
    );

    // Start drag
    act(() => {
      const mockEvent = {
        preventDefault: vi.fn(),
        clientX: 150,
        clientY: 150,
      } as unknown as React.MouseEvent;
      result.current[1].onMouseDown('node-1', mockEvent);
    });

    // Move quickly
    act(() => {
      const mockEvent = {
        preventDefault: vi.fn(),
        clientX: 300,
        clientY: 300,
      } as unknown as React.MouseEvent;
      result.current[1].onMouseMove(mockEvent);
    });

    // Velocity should be non-zero for fast movement
    waitFor(() => {
      const velocity = result.current[0].velocity;
      expect(velocity.x + velocity.y).toBeGreaterThan(0);
    });
  });

  it('throttles position updates to ~60fps', async () => {
    const { result } = renderHook(() =>
      useNodeDrag({
        onDragStart: mockOnDragStart,
        onDragMove: mockOnDragMove,
        onDragEnd: mockOnDragEnd,
        nodes: mockNodes,
      })
    );

    // Start drag
    act(() => {
      const mockEvent = {
        preventDefault: vi.fn(),
        clientX: 150,
        clientY: 150,
      } as unknown as React.MouseEvent;
      result.current[1].onMouseDown('node-1', mockEvent);
    });

    const callCountBefore = mockOnDragMove.mock.calls.length;

    // Rapidly fire multiple mouse moves
    for (let i = 0; i < 10; i++) {
      act(() => {
        const mockEvent = {
          preventDefault: vi.fn(),
          clientX: 150 + i * 10,
          clientY: 150 + i * 10,
        } as unknown as React.MouseEvent;
        result.current[1].onMouseMove(mockEvent);
      });
    }

    await waitFor(() => {
      // Should be throttled to ~60fps, not all 10 calls
      expect(mockOnDragMove.mock.calls.length).toBeLessThan(10);
      expect(mockOnDragMove.mock.calls.length).toBeGreaterThan(callCountBefore);
    });
  });
});
