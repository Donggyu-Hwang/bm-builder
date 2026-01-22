/**
 * Flow Simplification Hook
 * Provides functionality to simplify complex flows by hiding minor connections
 */

import { useState, useCallback } from 'react';
import { Edge } from 'reactflow';

interface EdgeData {
  label?: string;
  type: 'sequential' | 'parallel' | 'conditional';
  dataFlow?: string;
  isMandatory: boolean;
  isAIConnection: boolean;
  sourceNode?: string;
  targetNode?: string;
  animated?: boolean;
}

export const useFlowSimplification = () => {
  const [isSimplified, setIsSimplified] = useState(false);

  const simplifyEdges = useCallback((edges: Edge<EdgeData>[]): Edge<EdgeData>[] => {
    if (!isSimplified) return edges;

    // Hide AI generation connections and optional connections
    return edges.filter((edge) => {
      // Keep connections that are:
      // 1. Not AI connections, OR
      // 2. Mandatory connections
      return !edge.data.isAIConnection || edge.data.isMandatory;
    });
  }, [isSimplified]);

  const toggleSimplification = useCallback(() => {
    setIsSimplified((prev) => !prev);
  }, []);

  return {
    isSimplified,
    simplifyEdges,
    toggleSimplification,
  };
};
