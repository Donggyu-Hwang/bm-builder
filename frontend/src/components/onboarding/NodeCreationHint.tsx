import React from 'react';

interface NodeCreationHintProps {
  isVisible: boolean;
  onDoubleClick: () => void;
}

export const NodeCreationHint: React.FC<NodeCreationHintProps> = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40">
      <div className="bg-white/95 backdrop-blur-md border-2 border-gray-900 rounded-lg shadow-xl px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">👆</span>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 mb-1" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
              더블클릭하여 노드를 생성하세요
            </p>
            <p className="text-xs text-gray-500" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              또는 우측의 AI 가이드를 사용하세요
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NodeCreationHint;
