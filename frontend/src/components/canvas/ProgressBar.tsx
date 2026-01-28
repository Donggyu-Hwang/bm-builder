import React from 'react';
import { useAppSelector } from '../../hooks/useRedux';

const ProgressBar: React.FC = () => {
  const nodes = useAppSelector((state) => state.canvas.nodes);

  // Calculate progress based on 7 stages
  const completedStages = React.useMemo(() => {
    const stages = new Set(nodes.map((node) => (node.data as { stage?: number })?.stage || 0));
    return stages.size;
  }, [nodes]);

  const progress = (completedStages / 7) * 100;

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            7단계 린스타트업 여정
          </h2>
          <span className="text-sm text-gray-600 dark:text-gray-400">완료 {completedStages}/7</span>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">{Math.round(progress)}% 완료</div>
      </div>

      {/* Progress bar with gradient */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Stage indicators */}
      <div className="flex items-center justify-between mt-2">
        {[1, 2, 3, 4, 5, 6, 7].map((stage) => {
          const hasNodeInStage = nodes.some(
            (node) => (node.data as { stage?: number })?.stage === stage
          );

          return (
            <div
              key={stage}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                hasNodeInStage
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-600'
              }`}
            >
              {stage}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressBar;
