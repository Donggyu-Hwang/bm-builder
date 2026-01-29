import React, { useEffect, useState } from 'react';

const STORAGE_KEY = 'bm_builder_ai_guide_toggle';

interface AIGuideToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}

export const AIGuideToggle: React.FC<AIGuideToggleProps> = ({ enabled, onToggle }) => {
  const [isInitialized, setIsInitialized] = useState(false);

  // Load toggle state from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) {
      onToggle(saved === 'true');
    }
    setIsInitialized(true);
  }, [onToggle]);

  // Save to localStorage whenever toggle changes
  const handleToggle = () => {
    const newState = !enabled;
    onToggle(newState);
    localStorage.setItem(STORAGE_KEY, String(newState));
  };

  if (!isInitialized) {
    return null; // Prevent flash
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 md:top-6 md:left-auto md:translate-x-0 md:right-6 lg:top-6 lg:right-6 z-50">
      <div className="flex items-center gap-3 px-4 py-2 bg-white/90 backdrop-blur-md border-2 border-gray-900 rounded-lg shadow-lg">
        <span className="text-sm font-medium" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
          AI 가이드
        </span>
        <button
          onClick={handleToggle}
          className={`
            relative w-14 h-7 rounded-full transition-all duration-300
            ${enabled ? 'bg-gray-900' : 'bg-gray-300'}
          `}
          role="switch"
          aria-checked={enabled}
          aria-label="AI 가이드 토글"
        >
          <span
            className={`
              absolute top-1 w-5 h-5 bg-white rounded-full shadow-md
              transition-all duration-300
              ${enabled ? 'left-8' : 'left-1'}
            `}
          />
        </button>
      </div>
    </div>
  );
};

export default AIGuideToggle;
