/**
 * Custom hook for viewport persistence
 * Saves and restores canvas viewport position to localStorage
 */

import { useEffect, useRef } from 'react';
import { useReactFlow } from '@reactflow/core';

interface ViewportState {
  x: number;
  y: number;
  zoom: number;
}

interface UseViewportPersistenceOptions {
  documentId?: string;
  enabled?: boolean;
  saveInterval?: number; // milliseconds
}

export const useViewportPersistence = ({
  documentId,
  enabled = true,
  saveInterval = 500,
}: UseViewportPersistenceOptions = {}) => {
  const { getViewport, setViewport, getNodes } = useReactFlow();
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const isRestoringRef = useRef(false);

  // Storage key for localStorage
  const storageKey = documentId
    ? `canvas-viewport-${documentId}`
    : 'canvas-viewport';

  // Load viewport from localStorage on mount
  useEffect(() => {
    if (!enabled) return;

    const loadViewport = () => {
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          const viewport: ViewportState = JSON.parse(stored);

          // Only restore if we have valid viewport data
          if (
            typeof viewport.x === 'number' &&
            typeof viewport.y === 'number' &&
            typeof viewport.zoom === 'number'
          ) {
            isRestoringRef.current = true;
            setViewport(
              {
                x: viewport.x,
                y: viewport.y,
                zoom: viewport.zoom,
              },
              { duration: 0 }
            );

            // Clear restoring flag after viewport is set
            setTimeout(() => {
              isRestoringRef.current = false;
            }, 100) as unknown as ReturnType<typeof setTimeout>;
          }
        }
      } catch (error) {
        console.error('Failed to load viewport:', error);
      }
    };

    // Wait for nodes to be loaded before restoring viewport
    const checkNodes = setInterval(() => {
      const nodes = getNodes();
      if (nodes.length > 0) {
        clearInterval(checkNodes);
        loadViewport();
      }
    }, 100) as unknown as ReturnType<typeof setInterval>;

    return () => clearInterval(checkNodes);
  }, [storageKey, enabled, setViewport, getNodes]);

  // Save viewport to localStorage when it changes
  useEffect(() => {
    if (!enabled || isRestoringRef.current) return;

    const saveViewport = () => {
      const viewport = getViewport();

      try {
        localStorage.setItem(
          storageKey,
          JSON.stringify({
            x: viewport.x,
            y: viewport.y,
            zoom: viewport.zoom,
          })
        );
      } catch (error) {
        console.error('Failed to save viewport:', error);
      }
    };

    // Debounce viewport saves
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(saveViewport, saveInterval);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [getViewport, storageKey, enabled, saveInterval]);

  // Clear saved viewport
  const clearSavedViewport = () => {
    try {
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.error('Failed to clear viewport:', error);
    }
  };

  return { clearSavedViewport };
};
