import React from 'react';
import type { OptionCardProps } from '../../types/onboarding';

export const OptionCard: React.FC<OptionCardProps> = ({
  id,
  title,
  description,
  icon,
  onSelect,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(id);
    }
  };

  return (
    <button
      onClick={() => onSelect(id)}
      onKeyDown={handleKeyDown}
      className="group relative p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-all duration-200 border-2 border-transparent hover:border-indigo-500 dark:hover:border-indigo-400 text-left min-h-[120px] sm:min-h-[140px] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
      style={{ minHeight: '44px' }} // WCAG 2.1 AAA minimum touch target
    >
      <div className="flex items-start gap-4">
        <span className="text-3xl sm:text-4xl" role="img" aria-label="icon">
          {icon}
        </span>
        <div className="flex-1">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {title}
          </h3>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">{description}</p>
        </div>
      </div>
    </button>
  );
};
