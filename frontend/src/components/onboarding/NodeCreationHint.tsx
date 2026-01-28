import React from 'react';

export const NodeCreationHint: React.FC = () => {
  return (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-md">
        <div className="text-6xl mb-4">🎯</div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">첫 번째 노드 생성</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          캔버스를 더블클릭하여 노드를 생성하세요
        </p>
        <div className="text-sm text-indigo-600 dark:text-indigo-400">
          💡 팁: 더블클릭 후 노드 타입을 선택하세요
        </div>
      </div>
    </div>
  );
};
