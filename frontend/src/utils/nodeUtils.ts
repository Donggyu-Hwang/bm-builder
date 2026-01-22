/**
 * Node Canvas Utilities
 * Helper functions for node positioning, drag behavior, and collision detection
 * Story 6.2: Node Drag-and-Drop and Editing
 */

import { Node } from 'reactflow';

// Grid configuration
export const GRID_SIZE = 20; // 20px grid
export const DRAG_THRESHOLD = 5; // 5px threshold to prevent accidental drags

/**
 * Snap position to grid
 * @param position - The position to snap
 * @returns Snapped position
 */
export function snapToGrid(position: { x: number; y: number }): { x: number; y: number } {
  return {
    x: Math.round(position.x / GRID_SIZE) * GRID_SIZE,
    y: Math.round(position.y / GRID_SIZE) * GRID_SIZE,
  };
}

/**
 * Check if drag movement exceeds threshold
 * @param startPos - Starting position
 * @param currentPos - Current position
 * @returns True if threshold exceeded
 */
export function checkDragThreshold(
  startPos: { x: number; y: number },
  currentPos: { x: number; y: number }
): boolean {
  const dx = Math.abs(currentPos.x - startPos.x);
  const dy = Math.abs(currentPos.y - startPos.y);
  return dx > DRAG_THRESHOLD || dy > DRAG_THRESHOLD;
}

/**
 * Check if two rectangles collide
 * @param rect1 - First rectangle {x, y, width, height}
 * @param rect2 - Second rectangle {x, y, width, height}
 * @returns True if collision detected
 */
export function checkCollision(
  rect1: { x: number; y: number; width: number; height: number },
  rect2: { x: number; y: number; width: number; height: number }
): boolean {
  return (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y
  );
}

/**
 * Check if a node collides with any other nodes
 * @param node - The node to check
 * @param allNodes - All nodes in the canvas
 * @param excludeNodeId - Node ID to exclude from collision check (the node itself)
 * @returns True if collision detected
 */
export function checkNodeCollision(
  node: Node,
  allNodes: Node[],
  excludeNodeId?: string
): boolean {
  const nodeWidth = 200; // Approximate node width
  const nodeHeight = 100; // Approximate node height

  const nodeRect = {
    x: node.position.x,
    y: node.position.y,
    width: nodeWidth,
    height: nodeHeight,
  };

  return allNodes.some((otherNode) => {
    if (otherNode.id === excludeNodeId) return false;

    const otherRect = {
      x: otherNode.position.x,
      y: otherNode.position.y,
      width: nodeWidth,
      height: nodeHeight,
    };

    return checkCollision(nodeRect, otherRect);
  });
}

/**
 * Find a non-colliding position for a node
 * @param position - Desired position
 * @param allNodes - All nodes in the canvas
 * @param excludeNodeId - Node ID to exclude from collision check
 * @returns Non-colliding position
 */
export function findNonCollidingPosition(
  position: { x: number; y: number },
  allNodes: Node[],
  excludeNodeId?: string
): { x: number; y: number } {
  let newPosition = { ...position };
  let offset = GRID_SIZE;
  const maxAttempts = 50;

  for (let i = 0; i < maxAttempts; i++) {
    const testNode = { id: 'test', position: newPosition } as Node;

    if (!checkNodeCollision(testNode, allNodes, excludeNodeId)) {
      return newPosition;
    }

    // Try offsetting position
    newPosition = {
      x: position.x + offset,
      y: position.y + offset,
    };
    offset += GRID_SIZE;
  }

  // If we couldn't find a non-colliding position, return original
  return position;
}

/**
 * Constrain position to canvas bounds
 * @param position - Position to constrain
 * @param bounds - Canvas bounds {minX, minY, maxX, maxY}
 * @returns Constrained position
 */
export function constrainToBounds(
  position: { x: number; y: number },
  bounds: { minX: number; minY: number; maxX: number; maxY: number }
): { x: number; y: number } {
  return {
    x: Math.max(bounds.minX, Math.min(bounds.maxX, position.x)),
    y: Math.max(bounds.minY, Math.min(bounds.maxY, position.y)),
  };
}

/**
 * Calculate distance between two positions
 * @param pos1 - First position
 * @param pos2 - Second position
 * @returns Distance in pixels
 */
export function calculateDistance(
  pos1: { x: number; y: number },
  pos2: { x: number; y: number }
): number {
  const dx = pos2.x - pos1.x;
  const dy = pos2.y - pos1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Color presets for nodes
 */
export const NODE_COLORS = [
  { name: 'Green', value: '#4CAF50' },
  { name: 'Blue', value: '#2196F3' },
  { name: 'Orange', value: '#FF9800' },
  { name: 'Red', value: '#F44336' },
  { name: 'Purple', value: '#9C27B0' },
  { name: 'Gray', value: '#607D8B' },
];

/**
 * Icon presets for nodes
 */
export const NODE_ICONS = [
  { name: 'Document', value: 'file-text' },
  { name: 'Image', value: 'image' },
  { name: 'Code', value: 'code' },
  { name: 'Chart', value: 'chart' },
  { name: 'Database', value: 'database' },
  { name: 'Settings', value: 'settings' },
  { name: 'User', value: 'user' },
  { name: 'Team', value: 'users' },
  { name: 'Star', value: 'star' },
  { name: 'Heart', value: 'heart' },
  { name: 'Check', value: 'check' },
  { name: 'Alert', value: 'alert-circle' },
];
