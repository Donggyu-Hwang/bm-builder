/**
 * Node Detail Modal
 * Modal for editing node properties (title, color, icon, notes)
 * Story 6.2: Node Drag-and-Drop and Editing
 */

import { useState } from 'react';
import { Node } from 'reactflow';
import { NODE_COLORS, NODE_ICONS } from '../../utils/nodeUtils';

interface NodeDetailModalProps {
  node: Node;
  onClose: () => void;
  onSave: (updates: Partial<Node>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

export default function NodeDetailModal({
  node,
  onClose,
  onSave,
  onDelete,
  onDuplicate,
}: NodeDetailModalProps) {
  const [title, setTitle] = useState(node.data.label || '');
  const [color, setColor] = useState(node.data.color || NODE_COLORS[0].value);
  const [icon, setIcon] = useState(node.data.icon || NODE_ICONS[0].value);
  const [notes, setNotes] = useState(node.data.notes || '');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSave = () => {
    onSave({
      data: {
        ...node.data,
        label: title,
        color,
        icon,
        notes,
      },
    });
    onClose();
  };

  const handleDelete = () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
    } else {
      onDelete();
      onClose();
    }
  };

  const handleDuplicate = () => {
    onDuplicate();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">노드 편집</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="닫기"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label
              htmlFor="node-title"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              제목
            </label>
            <input
              id="node-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="노드 제목 입력"
            />
          </div>

          {/* Color Picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              색상
            </label>
            <div className="flex flex-wrap gap-2">
              {NODE_COLORS.map((colorOption) => (
                <button
                  key={colorOption.value}
                  onClick={() => setColor(colorOption.value)}
                  className={`w-10 h-10 rounded-lg border-2 transition-all ${
                    color === colorOption.value
                      ? 'border-gray-900 scale-110'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  style={{ backgroundColor: colorOption.value }}
                  title={colorOption.name}
                  aria-label={`색상 선택: ${colorOption.name}`}
                />
              ))}
            </div>
          </div>

          {/* Icon Picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              아이콘
            </label>
            <div className="grid grid-cols-6 gap-2">
              {NODE_ICONS.map((iconOption) => (
                <button
                  key={iconOption.value}
                  onClick={() => setIcon(iconOption.value)}
                  className={`p-2 rounded-lg border-2 transition-all ${
                    icon === iconOption.value
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  title={iconOption.name}
                  aria-label={`아이콘 선택: ${iconOption.name}`}
                >
                  <span className="text-sm text-center block">
                    {iconOption.name.charAt(0)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label
              htmlFor="node-notes"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              메모
            </label>
            <textarea
              id="node-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              placeholder="노드에 대한 메모를 입력하세요"
            />
          </div>

          {/* Content Preview */}
          {node.data.content && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                내용 미리보기
              </label>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 max-h-32 overflow-y-auto">
                {node.data.content.substring(0, 200)}
                {node.data.content.length > 200 && '...'}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50 rounded-b-lg">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleDuplicate}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            복제
          </button>
          <button
            onClick={handleDelete}
            className={`px-4 py-2 rounded-lg text-white transition-colors ${
              showDeleteConfirm
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-gray-400 hover:bg-gray-500'
            }`}
          >
            {showDeleteConfirm ? '삭제 확인' : '삭제'}
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            저장
          </button>
        </div>

        {/* Warning Message */}
        {showDeleteConfirm && (
          <div className="px-6 pb-4">
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">
                정말 이 섹션을 삭제하시겠습니까? 연결된 모든 콘텐츠가 삭제됩니다.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
