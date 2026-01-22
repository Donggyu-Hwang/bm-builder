/**
 * Zoom Controls Component
 * Provides zoom in/out, zoom level display, and fit to screen functionality
 */

import { useReactFlow } from '@reactflow/core';
import { useState, useEffect } from 'react';
import { Plus, Minus, Maximize } from 'lucide-react';

export const ZoomControls: React.FC = () => {
  const { zoomIn, zoomOut, fitView, getZoom } = useReactFlow();
  const [currentZoom, setCurrentZoom] = useState(100);

  // Update zoom level display when viewport changes
  useEffect(() => {
    const updateZoomLevel = () => {
      const zoom = getZoom();
      setCurrentZoom(Math.round(zoom * 100));
    };

    // Update zoom level every 100ms
    const interval = setInterval(updateZoomLevel, 100);
    return () => clearInterval(interval);
  }, [getZoom]);

  const handleZoomIn = () => {
    const newZoom = Math.min(currentZoom + 25, 200);
    zoomIn({ duration: 200 });
    setCurrentZoom(newZoom);
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(currentZoom - 25, 25);
    zoomOut({ duration: 200 });
    setCurrentZoom(newZoom);
  };

  const handleFitView = () => {
    fitView({ duration: 200, padding: 0.2 });
    setCurrentZoom(100);
  };

  return (
    <div className="zoom-controls">
      <button
        onClick={handleZoomOut}
        aria-label="Zoom out"
        disabled={currentZoom <= 25}
        title="축소 (-)"
      >
        <Minus size={16} />
      </button>
      <span className="zoom-level" aria-label={`Current zoom: ${currentZoom}%`}>
        {currentZoom}%
      </span>
      <button
        onClick={handleZoomIn}
        aria-label="Zoom in"
        disabled={currentZoom >= 200}
        title="확대 (+)"
      >
        <Plus size={16} />
      </button>
      <div className="zoom-controls-divider" />
      <button
        onClick={handleFitView}
        aria-label="Fit to screen"
        title="화면에 맞추기 (0)"
      >
        <Maximize size={16} />
        <span className="ml-1">맞추기</span>
      </button>
    </div>
  );
};
