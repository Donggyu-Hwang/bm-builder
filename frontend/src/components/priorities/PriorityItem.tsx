import React from 'react';
import type { Priority } from '../../api/prioritiesApi';

interface PriorityItemProps {
  priority: Priority;
  index: number;
  onDelete: (id: string) => void;
}

export const PriorityItem: React.FC<PriorityItemProps> = ({ priority, index, onDelete }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold">
            {index + 1}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-medium text-gray-900">
            {priority.title}
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            {priority.description}
          </p>
        </div>
        <button
          onClick={() => onDelete(priority.id)}
          className="flex-shrink-0 text-gray-400 hover:text-red-600 transition-colors"
          aria-label="Delete priority"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};
