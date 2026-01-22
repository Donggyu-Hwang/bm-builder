/**
 * Custom hook for canvas keyboard shortcuts
 */

import { useEffect } from 'react';
import { useReactFlow } from '@reactflow/core';

export const useCanvasShortcuts = () => {
  const { zoomIn, zoomOut, fitView, getViewport, setViewport } = useReactFlow();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input or textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      // Space bar for panning (handled by ReactFlow, but we prevent default scroll)
      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
      }

      // Zoom shortcuts: + or = to zoom in, - or _ to zoom out
      if (e.key === '=' || e.key === '+') {
        e.preventDefault();
        zoomIn({ duration: 200 });
      }

      if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        zoomOut({ duration: 200 });
      }

      // 0 to reset view
      if (e.key === '0') {
        e.preventDefault();
        fitView({ duration: 200, padding: 0.2 });
      }

      // Arrow keys for panning
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        const viewport = getViewport();
        setViewport(
          {
            x: viewport.x,
            y: viewport.y + 100,
            zoom: viewport.zoom,
          },
          { duration: 100 }
        );
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const viewport = getViewport();
        setViewport(
          {
            x: viewport.x,
            y: viewport.y - 100,
            zoom: viewport.zoom,
          },
          { duration: 100 }
        );
      }

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const viewport = getViewport();
        setViewport(
          {
            x: viewport.x + 100,
            y: viewport.y,
            zoom: viewport.zoom,
          },
          { duration: 100 }
        );
      }

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        const viewport = getViewport();
        setViewport(
          {
            x: viewport.x - 100,
            y: viewport.y,
            zoom: viewport.zoom,
          },
          { duration: 100 }
        );
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      // Space bar release
      if (e.code === 'Space') {
        e.preventDefault();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [zoomIn, zoomOut, fitView, getViewport, setViewport]);
};
