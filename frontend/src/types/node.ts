/**
 * Node Type Definitions
 *
 * Core types for the Lean Startup Canvas node system.
 * Defines the structure of nodes, their states, and relationships.
 */

import type { NodeType } from '../config/nodeTypes';

/**
 * Node completion status
 */
export type NodeStatus = 'not_started' | 'in_progress' | 'completed';

/**
 * Position coordinates on the canvas
 */
export interface NodePosition {
  x: number;
  y: number;
}

/**
 * Complete node structure
 */
export interface Node {
  /** Unique node identifier */
  id: string;
  /** Node type configuration */
  type: NodeType;
  /** Current completion status */
  status: NodeStatus;
  /** Node content/text */
  content: string;
  /** Canvas position */
  position: NodePosition;
  /** Creation timestamp */
  createdAt: number;
  /** Last update timestamp */
  updatedAt: number;
}

/**
 * Node creation parameters
 */
export interface CreateNodeParams {
  /** Node type to create */
  type: NodeType;
  /** Initial position (optional, defaults to center) */
  position?: NodePosition;
  /** Initial content (optional) */
  content?: string;
}

/**
 * Node update parameters
 */
export interface UpdateNodeParams {
  /** Node ID to update */
  id: string;
  /** New content */
  content?: string;
  /** New position */
  position?: NodePosition;
  /** New status */
  status?: NodeStatus;
}

/**
 * Node connection between two nodes
 */
export interface NodeConnection {
  /** Unique connection identifier */
  id: string;
  /** Source node ID */
  sourceId: string;
  /** Target node ID */
  targetId: string;
  /** Creation timestamp */
  createdAt: number;
}
