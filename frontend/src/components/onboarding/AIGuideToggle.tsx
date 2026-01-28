import React, { useEffect, useState } from 'react';
import { AI_GUIDE_TOGGLE_STORAGE_KEY } from '../../types/canvas';

interface AIGuideToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  className?: string;
}

export const AIGuideToggle: React.FC<AIGuideToggleProps> = ({
  enabled,
  onToggle,
  className = '',
}) => {
  const [isToggling, setIsToggling] = useState(false);

  const handleToggle = () => {
    setIsToggling(true);
    const newState = !enabled;
    onToggle(newState);

    // Store in localStorage
    try {
      localStorage.setItem(AI_GUIDE_TOGGLE_STORAGE_KEY, JSON.stringify(newState));
    } catch (error) {
      console.error('Failed to save AI guide toggle state:', error);
    }

    setTimeout(() => setIsToggling(false), 100);
  };

  return (
    <div
      className={`flex items-center gap-3 ${className} cursor-pointer select-none`}
      role="switch"
      aria-checked={enabled}
      aria-label="AI 가이드 켜기/끄기"
      tabIndex={0}
      onClick={(e) => {
        e.stopPropagation();
        if (!isToggling) handleToggle();
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (!isToggling) handleToggle();
        }
      }}
    >
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">AI 가이드</span>
      <button
        type="button"
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
          enabled ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'
        }`}
        aria-pressed={enabled}
        disabled={isToggling}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
      <span className="text-sm text-gray-600 dark:text-gray-400">{enabled ? '켜짐' : '꺼짐'}</span>
    </div>
  );
};
