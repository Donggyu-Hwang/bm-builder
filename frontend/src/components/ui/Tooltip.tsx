import { ReactNode, useState, useRef, useEffect } from 'react';
import { cn } from '../../utils/cn';

interface TooltipProps {
  children: ReactNode;
  content: ReactNode;
  delay?: number;
  side?: 'top' | 'bottom' | 'left' | 'right';
}

export default function Tooltip({ children, content, delay = 300, side = 'top' }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  const getPosition = () => {
    const positions = {
      top: 'bottom-full mb-2 left-1/2 -translate-x-1/2',
      bottom: 'top-full mt-2 left-1/2 -translate-x-1/2',
      left: 'right-full mr-2 top-1/2 -translate-y-1/2',
      right: 'left-full ml-2 top-1/2 -translate-y-1/2',
    };
    return positions[side];
  };

  const getArrowPosition = () => {
    const arrows = {
      top: 'bottom-[-4px] left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent',
      bottom: 'top-[-4px] left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent',
      left: 'right-[-4px] top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent',
      right: 'left-[-4px] top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent',
    };
    return arrows[side];
  };

  return (
    <div
      ref={triggerRef}
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {isVisible && (
        <div
          ref={tooltipRef}
          className={cn(
            'absolute z-50 max-w-xs rounded-md border bg-popover px-3 py-1.5 text-sm text-popper-foreground shadow-md animate-in fade-in zoom-in-95',
            getPosition()
          )}
        >
          {content}
          <div
            className={cn(
              'absolute h-0 w-0 border-4',
              getArrowPosition()
            )}
          />
        </div>
      )}
    </div>
  );
}
