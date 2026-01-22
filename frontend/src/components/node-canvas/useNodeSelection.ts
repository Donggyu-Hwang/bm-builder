/**
 * useNodeSelection Hook
 * Multi-selection support for nodes using Shift+click
 * Story 6.2: Node Drag-and-Drop and Editing
 */

import { useState, useCallback } from 'react';

export function useNodeSelection() {
  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);

  /**
   * Toggle node selection
   * - Shift+click: Multi-selection mode (toggle individual node)
   * - Regular click: Single selection mode (replace selection)
   */
  const toggleNodeSelection = useCallback(
    (nodeId: string, event: React.MouseEvent | KeyboardEvent) => {
      if (event.shiftKey) {
        // Multi-selection mode
        setSelectedNodeIds((prev) =>
          prev.includes(nodeId)
            ? prev.filter((id) => id !== nodeId)
            : [...prev, nodeId]
        );
      } else {
        // Single selection mode
        setSelectedNodeIds([nodeId]);
      }
    },
    []
  );

  /**
   * Clear all selections
   */
  const clearSelection = useCallback(() => {
    setSelectedNodeIds([]);
  }, []);

  /**
   * Check if a node is selected
   */
  const isNodeSelected = useCallback(
    (nodeId: string) => {
      return selectedNodeIds.includes(nodeId);
    },
    [selectedNodeIds]
  );

  /**
   * Select all nodes
   */
  const selectAllNodes = useCallback((nodeIds: string[]) => {
    setSelectedNodeIds(nodeIds);
  }, []);

  return {
    selectedNodeIds,
    setSelectedNodeIds,
    toggleNodeSelection,
    clearSelection,
    isNodeSelected,
    selectAllNodes,
  };
}
