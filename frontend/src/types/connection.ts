/**
 * Connection Data Types for Node Connection System
 *
 * Story 2.4: Shift+Drag Node Connections
 *
 * Hand-Drawn Sketch Aesthetic (VS Design Diverge - T-Score 0.15):
 * - Organic, imperfect Bezier curves with pencil-stroke texture
 * - Dripping paint anchor points with hover animations
 * - Motion-trail effects during drag
 * - Dynamic color transitions based on source node stage
 */

/**
 * Anchor point positions on a node
 */
export type AnchorPosition = 'top' | 'bottom' | 'left' | 'right';

/**
 * Connection data structure
 * Stores complete information about a node-to-node connection
 */
export interface Connection {
  /** Unique identifier (UUID v4) */
  id: string;
  /** Source node ID (where connection starts) */
  sourceNodeId: string;
  /** Target node ID (where connection ends) */
  targetNodeId: string;
  /** Anchor position on source node */
  sourceAnchor: AnchorPosition;
  /** Anchor position on target node */
  targetAnchor: AnchorPosition;
  /** Timestamp of creation (for undo/redo) */
  createdAt: number;
}

/**
 * Connection creation request payload
 * Used when sending to backend API
 */
export interface ConnectionCreateRequest {
  sourceNodeId: string;
  targetNodeId: string;
  sourceAnchor: AnchorPosition;
  targetAnchor: AnchorPosition;
}

/**
 * Connection state during drag operation
 * Tracks temporary connection before completion
 */
export interface PendingConnection {
  /** Source node ID */
  sourceNodeId: string;
  /** Source anchor position */
  sourceAnchor: AnchorPosition;
  /** Current mouse/touch position */
  currentX: number;
  /** Current y coordinate */
  currentY: number;
}

/**
 * Anchor point visual state
 * Calculated based on node position and size
 */
export interface AnchorPoint {
  /** Anchor position identifier */
  position: AnchorPosition;
  /** X coordinate relative to canvas */
  x: number;
  /** Y coordinate relative to canvas */
  y: number;
  /** Whether this anchor is currently highlighted */
  isHighlighted: boolean;
  /** Whether mouse is hovering over this anchor */
  isHovered: boolean;
}

/**
 * Validation error types
 */
export type ConnectionValidationError =
  | 'DUPLICATE_CONNECTION'
  | 'SELF_LOOP'
  | 'INVALID_TARGET';

/**
 * Connection validation result
 */
export interface ConnectionValidation {
  /** Whether connection is valid */
  isValid: boolean;
  /** Error type if invalid */
  error?: ConnectionValidationError;
  /** Error message in Korean */
  errorMessage?: string;
}
