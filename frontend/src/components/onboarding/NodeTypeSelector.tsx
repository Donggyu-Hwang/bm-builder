import React from 'react';
import { STAGE_CONFIG, INITIAL_UNLOCKED_STAGES } from '../../config/progressiveDisclosure';

interface NodeTypeSelectorProps {
  isVisible: boolean;
  onSelect: (stage: number, nodeType: string) => void;
  onClose: () => void;
}

export const NodeTypeSelector: React.FC<NodeTypeSelectorProps> = ({ isVisible, onSelect, onClose }) => {
  if (!isVisible) return null;

  const handleSelect = (stage: number) => {
    const config = STAGE_CONFIG[stage as keyof typeof STAGE_CONFIG];
    onSelect(stage, config.name);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full mx-4 border-2 border-gray-900">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
            노드 타입 선택
          </h2>
          <p className="text-sm text-gray-600" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            Progressive Disclosure: Stage 1-3만 표시
          </p>
        </div>

        {/* Node Types Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {INITIAL_UNLOCKED_STAGES.map((stage) => {
            const config = STAGE_CONFIG[stage as keyof typeof STAGE_CONFIG];
            return (
              <button
                key={stage}
                onClick={() => handleSelect(stage)}
                className="p-6 border-2 border-gray-200 rounded-lg hover:border-gray-900 transition-all hover:shadow-lg text-left group"
              >
                <div className="text-3xl mb-3">{config.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                  {config.name}
                </h3>
                <p className="text-xs text-gray-500" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  Stage {stage}
                </p>
                <div className="mt-3 h-1 w-12 rounded-full" style={{ backgroundColor: config.color }} />
              </button>
            );
          })}
        </div>

        {/* Description */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-700 leading-relaxed">
            <strong>진행적 노출 (Progressive Disclosure):</strong> 온보딩 모드에서는 처음 3단계(문제 발굴, 문제 정의, 고객 개발)만 표시됩니다.
            3개 이상의 노드를 완성하면 모든 7단계가 잠금 해제됩니다.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-white text-gray-900 font-medium rounded-lg border-2 border-gray-900 hover:bg-gray-50 transition-colors"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
};

export default NodeTypeSelector;
