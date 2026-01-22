/**
 * Flow Simplification Toggle Component
 * Toggle button for switching between simple and detailed flow views
 */

import { useFlowSimplification } from './useFlowSimplification';
import { Eye, EyeOff } from 'lucide-react';

export const SimplificationToggle = () => {
  const { isSimplified, toggleSimplification } = useFlowSimplification();

  return (
    <button
      onClick={toggleSimplification}
      className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
      title={isSimplified ? '자세히 보기 (모든 연결 표시)' : '간단히 보기 (주요 연결만 표시)'}
    >
      {isSimplified ? (
        <>
          <Eye className="w-4 h-4" />
          <span>자세히 보기</span>
        </>
      ) : (
        <>
          <EyeOff className="w-4 h-4" />
          <span>간단히 보기</span>
        </>
      )}
    </button>
  );
};
