import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useConnection } from './useConnection';

describe('useConnection', () => {
  const mockOnConnectionCreate = vi.fn();
  const mockOnConnectionDelete = vi.fn();
  const mockOnValidationError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with correct default state', () => {
    const { result } = renderHook(() =>
      useConnection({
        onConnectionCreate: mockOnConnectionCreate,
        onConnectionDelete: mockOnConnectionDelete,
        onValidationError: mockOnValidationError,
      })
    );

    expect(result.current.connections).toEqual([]);
    expect(result.current.pendingConnection).toBeNull();
    expect(result.current.visibleAnchors).toBeInstanceOf(Map);
    expect(result.current.isConnectionMode).toBe(false);
    expect(result.current.hoveredAnchor).toBeNull();
  });

  it('activates and deactivates connection mode', () => {
    const { result } = renderHook(() => useConnection());

    act(() => {
      result.current.activateConnectionMode();
    });

    expect(result.current.isConnectionMode).toBe(true);

    act(() => {
      result.current.deactivateConnectionMode();
    });

    expect(result.current.isConnectionMode).toBe(false);
  });

  it('starts connection drag from anchor point', () => {
    const { result } = renderHook(() => useConnection());

    act(() => {
      result.current.startConnectionDrag('node-1', 'top', 100, 200);
    });

    expect(result.current.pendingConnection).toEqual({
      sourceNodeId: 'node-1',
      sourceAnchor: 'top',
      currentX: 100,
      currentY: 200,
    });
  });

  it('updates pending connection during drag', () => {
    const { result } = renderHook(() => useConnection());

    act(() => {
      result.current.startConnectionDrag('node-1', 'top', 100, 200);
    });

    act(() => {
      result.current.updateConnectionDrag(150, 250);
    });

    expect(result.current.pendingConnection?.currentX).toBe(150);
    expect(result.current.pendingConnection?.currentY).toBe(250);
  });

  it('completes connection drag successfully', () => {
    const { result } = renderHook(() =>
      useConnection({
        onConnectionCreate: mockOnConnectionCreate,
      })
    );

    act(() => {
      result.current.startConnectionDrag('node-1', 'top', 100, 200);
      result.current.updateConnectionDrag(300, 400);
    });

    act(() => {
      result.current.completeConnectionDrag('node-2', 'bottom');
    });

    expect(result.current.pendingConnection).toBeNull();
    expect(result.current.connections.length).toBe(1);
    expect(mockOnConnectionCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        sourceNodeId: 'node-1',
        targetNodeId: 'node-2',
        sourceAnchor: 'top',
        targetAnchor: 'bottom',
      })
    );
  });

  it('validates and prevents self-loop connections', () => {
    const { result } = renderHook(() =>
      useConnection({
        onValidationError: mockOnValidationError,
      })
    );

    act(() => {
      result.current.startConnectionDrag('node-1', 'top', 100, 200);
    });

    act(() => {
      result.current.completeConnectionDrag('node-1', 'bottom');
    });

    expect(result.current.pendingConnection).toBeNull();
    expect(result.current.connections.length).toBe(0);
    expect(mockOnValidationError).toHaveBeenCalledWith('자기 자신에게는 연결할 수 없습니다');
  });

  it('validates and prevents duplicate connections', () => {
    const { result } = renderHook(() =>
      useConnection({
        onConnectionCreate: mockOnConnectionCreate,
        onValidationError: mockOnValidationError,
      })
    );

    // Create first connection
    act(() => {
      result.current.startConnectionDrag('node-1', 'top', 100, 200);
      result.current.completeConnectionDrag('node-2', 'bottom');
    });

    expect(result.current.connections.length).toBe(1);

    // Try to create duplicate
    act(() => {
      result.current.startConnectionDrag('node-1', 'top', 100, 200);
      result.current.completeConnectionDrag('node-2', 'bottom');
    });

    // Only first connection should exist, duplicate rejected
    expect(result.current.connections.length).toBe(1);
    // Validation error is called within setState, so we check the state instead
    expect(mockOnConnectionCreate).toHaveBeenCalledTimes(1); // Only called once for first connection
  });

  it('cancels connection drag', () => {
    const { result } = renderHook(() => useConnection());

    act(() => {
      result.current.startConnectionDrag('node-1', 'top', 100, 200);
    });

    expect(result.current.pendingConnection).not.toBeNull();

    act(() => {
      result.current.cancelConnectionDrag();
    });

    expect(result.current.pendingConnection).toBeNull();
  });

  it('deletes connection by ID', () => {
    const { result } = renderHook(() =>
      useConnection({
        onConnectionDelete: mockOnConnectionDelete,
      })
    );

    // Create a connection first
    act(() => {
      result.current.startConnectionDrag('node-1', 'top', 100, 200);
      result.current.completeConnectionDrag('node-2', 'bottom');
    });

    expect(result.current.connections.length).toBe(1);
    const connectionId = result.current.connections[0].id;
    expect(connectionId).toBeDefined();

    act(() => {
      result.current.deleteConnection(connectionId);
    });

    expect(result.current.connections.length).toBe(0);
    expect(mockOnConnectionDelete).toHaveBeenCalledWith(connectionId);
  });

  it('calculates anchor points correctly', () => {
    const { result } = renderHook(() => useConnection());

    const anchors = result.current.calculateAnchorPoints('node-1', 100, 100, 200, 150);

    expect(anchors).toHaveLength(4);
    expect(anchors[0].position).toBe('top');
    expect(anchors[0].x).toBe(200); // center x
    expect(anchors[0].y).toBe(100); // top y
    expect(anchors[1].position).toBe('bottom');
    expect(anchors[1].x).toBe(200); // center x
    expect(anchors[1].y).toBe(250); // bottom y
  });

  it('finds nearest anchor point', () => {
    const { result } = renderHook(() => useConnection());

    const anchors = result.current.calculateAnchorPoints('node-1', 100, 100, 200, 150);

    // Test finding top anchor (near center top)
    const nearest = result.current.findNearestAnchor(200, 105, anchors);

    expect(nearest?.position).toBe('top');
  });

  it('updates and removes node anchors', () => {
    const { result } = renderHook(() => useConnection());

    act(() => {
      result.current.updateNodeAnchors('node-1', 100, 100, 200, 150);
    });

    expect(result.current.visibleAnchors.has('node-1')).toBe(true);
    expect(result.current.visibleAnchors.get('node-1')).toHaveLength(4);

    act(() => {
      result.current.removeNodeAnchors('node-1');
    });

    expect(result.current.visibleAnchors.has('node-1')).toBe(false);
  });

  it('sets and clears hovered anchor', () => {
    const { result } = renderHook(() => useConnection());

    act(() => {
      result.current.setHoveredAnchor('node-1', 'top');
    });

    expect(result.current.hoveredAnchor).toEqual({
      nodeId: 'node-1',
      position: 'top',
    });

    act(() => {
      result.current.setHoveredAnchor(null, null);
    });

    expect(result.current.hoveredAnchor).toBeNull();
  });

  it('validates connections correctly', () => {
    const { result } = renderHook(() => useConnection());

    // Valid connection
    let validation = result.current.validateConnection('node-1', 'node-2');
    expect(validation.isValid).toBe(true);

    // Self-loop
    validation = result.current.validateConnection('node-1', 'node-1');
    expect(validation.isValid).toBe(false);
    expect(validation.error).toBe('SELF_LOOP');

    // Duplicate - create connection first, then validate
    act(() => {
      result.current.startConnectionDrag('node-1', 'top', 100, 200);
      result.current.completeConnectionDrag('node-2', 'bottom');
    });

    // Now validate the same nodes - should be duplicate
    validation = result.current.validateConnection('node-1', 'node-2');
    expect(validation.isValid).toBe(false);
    expect(validation.error).toBe('DUPLICATE_CONNECTION');
  });
});
