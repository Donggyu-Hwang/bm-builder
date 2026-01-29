interface Node {
  id: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
}

interface Position {
  x: number;
  y: number;
}

const DEFAULT_NODE_SIZE = { width: 200, height: 150 };
const MIN_GAP = 50;

/**
 * Calculate node position to avoid overlap with existing nodes
 */
export const calculateNodePosition = (
  clickPosition: Position,
  existingNodes: Node[]
): Position => {
  const { x: clickX, y: clickY } = clickPosition;
  const { width: nodeWidth, height: nodeHeight } = DEFAULT_NODE_SIZE;

  // Check for collisions with existing nodes
  let adjustedPosition = { x: clickX, y: clickY };
  let attempts = 0;
  const maxAttempts = 50; // Increased from 10 to handle dense canvas scenarios

  while (attempts < maxAttempts) {
    let hasCollision = false;

    for (const node of existingNodes) {
      const nodeW = node.width || nodeWidth;
      const nodeH = node.height || nodeHeight;

      // Check if new node would overlap with existing node
      if (
        adjustedPosition.x < node.x + nodeW + MIN_GAP &&
        adjustedPosition.x + nodeWidth + MIN_GAP > node.x &&
        adjustedPosition.y < node.y + nodeH + MIN_GAP &&
        adjustedPosition.y + nodeHeight + MIN_GAP > node.y
      ) {
        hasCollision = true;
        break;
      }
    }

    if (!hasCollision) {
      break; // Found a valid position
    }

    // Try a different position (spiral out from click position)
    const angle = (attempts * 45 * Math.PI) / 180;
    const radius = MIN_GAP * (attempts + 1);
    adjustedPosition = {
      x: clickX + Math.cos(angle) * radius - nodeWidth / 2,
      y: clickY + Math.sin(angle) * radius - nodeHeight / 2,
    };

    attempts++;
  }

  // Ensure position is within bounds (minimum 0, maximum viewport)
  return {
    x: Math.max(0, adjustedPosition.x),
    y: Math.max(0, adjustedPosition.y),
  };
};

/**
 * Check if a position would collide with any existing nodes
 */
export const hasCollision = (
  position: Position,
  size: { width: number; height: number },
  existingNodes: Node[]
): boolean => {
  for (const node of existingNodes) {
    const nodeW = node.width || size.width;
    const nodeH = node.height || size.height;

    if (
      position.x < node.x + nodeW + MIN_GAP &&
      position.x + size.width + MIN_GAP > node.x &&
      position.y < node.y + nodeH + MIN_GAP &&
      position.y + size.height + MIN_GAP > node.y
    ) {
      return true;
    }
  }
  return false;
};

/**
 * Calculate distance between two positions
 */
export const distance = (pos1: Position, pos2: Position): number => {
  const dx = pos1.x - pos2.x;
  const dy = pos1.y - pos2.y;
  return Math.sqrt(dx * dx + dy * dy);
};
