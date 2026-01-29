import { useState, useCallback, useRef, useEffect } from 'react';

interface UseDoubleClickOptions {
  delay?: number;
  onSingleClick?: () => void;
  onDoubleClick?: () => void;
}

export const useDoubleClick = ({
  delay = 300,
  onSingleClick,
  onDoubleClick,
}: UseDoubleClickOptions = {}) => {
  const [clicks, setClicks] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const clickCoordinatesRef = useRef<{ x: number; y: number } | null>(null);

  const handleClick = useCallback(
    (event: React.MouseEvent | MouseEvent) => {
      const { clientX, clientY } = event;
      clickCoordinatesRef.current = { x: clientX, y: clientY };

      setClicks((prev) => {
        const newClicks = prev + 1;

        // Clear existing timer
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }

        if (newClicks === 2) {
          // Double click detected
          if (onDoubleClick) {
            onDoubleClick();
          }
          timerRef.current = setTimeout(() => {
            setClicks(0);
            clickCoordinatesRef.current = null;
          }, delay);
          return 0;
        } else {
          // Wait for potential second click
          timerRef.current = setTimeout(() => {
            if (newClicks === 1 && onSingleClick) {
              onSingleClick();
            }
            setClicks(0);
            clickCoordinatesRef.current = null;
          }, delay);
        }

        return newClicks;
      });
    },
    [delay, onSingleClick, onDoubleClick]
  );

  const getClickCoordinates = useCallback(() => {
    return clickCoordinatesRef.current;
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return {
    handleClick,
    getClickCoordinates,
    clicks,
  };
};

export default useDoubleClick;
