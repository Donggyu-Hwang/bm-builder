/**
 * Edge Type Selector Component
 * Allows users to select different edge types for visualization
 */

import { useState } from 'react';
import { Settings } from 'lucide-react';

export type EdgeType = 'smoothstep' | 'bezier' | 'step';

interface EdgeTypeSelectorProps {
  currentType: EdgeType;
  onTypeChange: (type: EdgeType) => void;
}

const edgeTypeOptions = [
  { value: 'bezier' as EdgeType, label: '부드러운 곡선', description: 'Bezier curve' },
  { value: 'smoothstep' as EdgeType, label: '직각 라운드', description: 'Smooth step' },
  { value: 'step' as EdgeType, label: '직각', description: 'Step' },
];

export const EdgeTypeSelector = ({ currentType, onTypeChange }: EdgeTypeSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
        title="연결선 스타일 변경"
      >
        <Settings className="w-4 h-4" />
        <span>연결선 스타일</span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu */}
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            <div className="p-2">
              <p className="text-xs font-medium text-gray-500 px-2 py-1">연결선 유형</p>
              {edgeTypeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    onTypeChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-md transition-colors flex flex-col ${
                    currentType === option.value
                      ? 'bg-purple-50 text-purple-700'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <span className="font-medium text-sm">{option.label}</span>
                  <span className="text-xs text-gray-500">{option.description}</span>
                </button>
              ))}
            </div>

            {/* Preview */}
            <div className="border-t border-gray-200 p-3 bg-gray-50 rounded-b-lg">
              <p className="text-xs text-gray-500 mb-2">미리보기:</p>
              <svg
                width="100%"
                height="40"
                className="bg-white rounded border border-gray-200"
              >
                <path
                  d={
                    currentType === 'bezier'
                      ? 'M 10 20 C 40 20, 60 20, 90 20'
                      : currentType === 'smoothstep'
                      ? 'M 10 20 L 30 20 L 30 20 L 50 20 L 50 20 L 70 20 L 70 20 L 90 20'
                      : 'M 10 20 L 30 20 L 30 20 L 50 20 L 50 20 L 70 20 L 70 20 L 90 20'
                  }
                  fill="none"
                  stroke="#8b5cf6"
                  strokeWidth="2"
                  strokeDasharray={currentType === 'bezier' ? 'none' : '5,5'}
                />
              </svg>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
