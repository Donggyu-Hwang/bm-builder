import React from 'react';
import type { OnboardingMode } from '../../types/canvas';

interface NodeTypeSelectorProps {
  mode: OnboardingMode;
  onSelect: (type: string) => void;
  onClose: () => void;
}

const INITIAL_NODE_TYPES = [
  {
    id: 'problem-discovery',
    label: '문제 발굴',
    stage: 1,
    color: '#ef4444',
    icon: '🔍',
    description: '해결하고 싶은 문제를 발견하세요',
  },
  {
    id: 'problem-definition',
    label: '문제 정의',
    stage: 2,
    color: '#f97316',
    icon: '🎯',
    description: '문제를 명확하게 정의하세요',
  },
  {
    id: 'customer-development',
    label: '고객 개발',
    stage: 3,
    color: '#eab308',
    icon: '👥',
    description: '타겟 고객을 이해하세요',
  },
];

export const NodeTypeSelector: React.FC<NodeTypeSelectorProps> = ({ mode, onSelect, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-3xl w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">노드 타입 선택</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>

        <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          {mode === 'problem-discovery' && '문제 발굴 모드: 3단계 노드 중 하나를 선택하세요'}
          {mode === 'beginner' && '초보자 모드: 3단계 노드 중 하나를 선택하세요'}
          {mode === 'team' && '팀 온보딩 모드: 3단계 노드 중 하나를 선택하세요'}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {INITIAL_NODE_TYPES.map((type) => (
            <button
              key={type.id}
              onClick={() => onSelect(type.id)}
              className="p-4 border-2 border-gray-200 dark:border-gray-600 rounded-lg hover:border-indigo-500 dark:hover:border-indigo-400 transition-all hover:scale-105"
            >
              <div className="text-4xl mb-2">{type.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                {type.label}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{type.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
