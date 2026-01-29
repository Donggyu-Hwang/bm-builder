import { useState, useEffect, useCallback } from 'react';

export interface NodeCompletion {
  nodeId: string;
  contentLength: number;
  completed: boolean;
  completedAt?: number;
}

export interface UseNodeCompletionOptions {
  minContentLength?: number;
  onFirstCompletion?: () => void;
  onNodeComplete?: (nodeId: string) => void;
}

/**
 * Hook to detect when node content reaches completion threshold
 * @param nodes - Array of nodes to monitor
 * @param options - Configuration options
 * @returns Node completion tracking state
 */
export const useNodeCompletion = (
  nodes: Array<{ id: string; content: string }>,
  options: UseNodeCompletionOptions = {}
) => {
  const {
    minContentLength = 100,
    onFirstCompletion,
    onNodeComplete,
  } = options;

  const [completions, setCompletions] = useState<Record<string, NodeCompletion>>({});
  const [firstCompleted, setFirstCompleted] = useState(false);

  // Check node completions
  useEffect(() => {
    const newCompletions: Record<string, NodeCompletion> = { ...completions };
    let hasNewCompletion = false;
    let hasFirstCompletion = false;

    nodes.forEach((node) => {
      const contentLength = node.content.length;
      const isCompleted = contentLength >= minContentLength;
      const existingCompletion = completions[node.id];

      // Node just completed
      if (isCompleted && !existingCompletion?.completed) {
        newCompletions[node.id] = {
          nodeId: node.id,
          contentLength,
          completed: true,
          completedAt: Date.now(),
        };

        hasNewCompletion = true;
        hasFirstCompletion = !firstCompleted;

        // Trigger callbacks
        if (onNodeComplete) {
          onNodeComplete(node.id);
        }
      } else if (existingCompletion) {
        // Keep existing completion state
        newCompletions[node.id] = existingCompletion;
      }
    });

    if (hasNewCompletion) {
      setCompletions(newCompletions);

      // Trigger first completion callback only once
      if (hasFirstCompletion && !firstCompleted) {
        setFirstCompleted(true);
        if (onFirstCompletion) {
          onFirstCompletion();
        }
      }
    }
  }, [nodes, minContentLength, onFirstCompletion, onNodeComplete, completions, firstCompleted]);

  /**
   * Check if a specific node is completed
   */
  const isNodeCompleted = useCallback(
    (nodeId: string): boolean => {
      return completions[nodeId]?.completed ?? false;
    },
    [completions]
  );

  /**
   * Get total number of completed nodes
   */
  const getCompletedCount = useCallback((): number => {
    return Object.values(completions).filter((c) => c.completed).length;
  }, [completions]);

  /**
   * Reset all completion state
   */
  const resetCompletions = useCallback(() => {
    setCompletions({});
    setFirstCompleted(false);
  }, []);

  return {
    completions,
    firstCompleted,
    isNodeCompleted,
    getCompletedCount,
    resetCompletions,
  };
};

export default useNodeCompletion;
