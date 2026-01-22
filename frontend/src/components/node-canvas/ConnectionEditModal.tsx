/**
 * Connection Edit Modal
 * Allows editing edge properties and deleting connections
 */

import { useState } from 'react';
import { Edge } from 'reactflow';
import { X, Save, Trash2, Info } from 'lucide-react';

interface EdgeData {
  label?: string;
  type: 'sequential' | 'parallel' | 'conditional';
  dataFlow?: string;
  isMandatory: boolean;
  isAIConnection: boolean;
  sourceNode?: string;
  targetNode?: string;
  animated?: boolean;
}

interface ConnectionEditModalProps {
  edge: Edge<EdgeData>;
  onClose: () => void;
  onSave: (edgeId: string, updates: Partial<EdgeData>) => void;
  onDelete: (edgeId: string) => void;
}

const relationshipTypes = [
  { value: 'sequential', label: '순차적 (Sequential)', description: '선행 노드 완료 후 다음 노드 실행' },
  { value: 'parallel', label: '병렬 (Parallel)', description: '동시에 실행 가능' },
  { value: 'conditional', label: '조건부 (Conditional)', description: '특정 조건에서만 실행' },
];

export const ConnectionEditModal = ({
  edge,
  onClose,
  onSave,
  onDelete,
}: ConnectionEditModalProps) => {
  const [type, setType] = useState<EdgeData['type']>(edge.data.type);
  const [label, setLabel] = useState(edge.data.label || '');
  const [dataFlow, setDataFlow] = useState(edge.data.dataFlow || '');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSave = () => {
    onSave(edge.id, { type, label, dataFlow });
    onClose();
  };

  const handleDelete = () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }
    onDelete(edge.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">연결 편집</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 space-y-4">
          {/* Relationship Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              관계 유형
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as EdgeData['type'])}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {relationshipTypes.map((rt) => (
                <option key={rt.value} value={rt.value}>
                  {rt.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              {relationshipTypes.find((rt) => rt.value === type)?.description}
            </p>
          </div>

          {/* Label */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              라벨
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="예: AI 생성에서 복사"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Data Flow */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              데이터 흐름 설명 (선택)
            </label>
            <input
              type="text"
              value={dataFlow}
              onChange={(e) => setDataFlow(e.target.value)}
              placeholder="예: AI에서 1,500자 복사"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-blue-800">
                <p className="font-medium mb-1">관계 유형 설명:</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>순차적: 선행 노드 완료 후 다음 노드 실행</li>
                  <li>병렬: 동시에 실행 가능</li>
                  <li>조건부: 특정 조건에서만 실행</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Connection Info */}
          {(edge.data.sourceNode || edge.data.targetNode) && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <p className="text-xs text-gray-600">
                <span className="font-medium">연결:</span>{' '}
                {edge.data.sourceNode || '시작 노드'} → {edge.data.targetNode || '끝 노드'}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleDelete}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
              showDeleteConfirm
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-white text-red-600 border border-red-300 hover:bg-red-50'
            }`}
          >
            <Trash2 className="w-4 h-4" />
            {showDeleteConfirm ? '확인 (연결 해제)' : '연결 해제'}
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            저장
          </button>
        </div>
      </div>
    </div>
  );
};
