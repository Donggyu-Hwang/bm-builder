import { useState, useCallback, useRef, useEffect, TouchEvent } from 'react';

interface UseLongPressOptions {
  delay?: number;
  onLongPress?: (event: TouchEvent | MouseEvent) => void;
  onStart?: () => void;
  onCancel?: () => void;
}

export const useLongPress = ({
  delay = 500,
  onLongPress,
  onStart,
  onCancel,
}: UseLongPressOptions = {}) => {
  const [isPressed, setIsPressed] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressTriggeredRef = useRef(false);

  const start = useCallback(
    (event: TouchEvent | MouseEvent) => {
      setIsPressed(true);
      if (onStart) onStart();

      timerRef.current = setTimeout(() => {
        setIsPressed(false);
        isLongPressTriggeredRef.current = true;

        // Haptic feedback for mobile devices
        if ('vibrate' in navigator && typeof navigator.vibrate === 'function') {
          navigator.vibrate(50);
        }

        if (onLongPress) {
          onLongPress(event as TouchEvent | MouseEvent);
        }
      }, delay);
    },
    [delay, onLongPress, onStart]
  );

  const clear = useCallback(() => {
    setIsPressed(false);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    // Only call onCancel if long press wasn't triggered
    if (!isLongPressTriggeredRef.current && onCancel) {
      onCancel();
    }

    isLongPressTriggeredRef.current = false;
  }, [onCancel]);

  const reset = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setIsPressed(false);
    isLongPressTriggeredRef.current = false;
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
    isPressed,
    handlers: {
      onMouseDown: start,
      onMouseUp: clear,
      onMouseLeave: clear,
      onTouchStart: (e: TouchEvent) => start(e),
      onTouchEnd: clear,
      onTouchMove: clear, // Cancel if finger moves
    },
    reset,
  };
};

export default useLongPress;
