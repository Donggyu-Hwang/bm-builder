import React, { useState } from 'react';
import documentExportService from '../../services/documentExport.service';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: 'pdf' | 'docx' | 'png', includeIncomplete: boolean) => void;
  nodeCount: number;
}

const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, onExport, nodeCount }) => {
  const [format, setFormat] = useState<'pdf' | 'docx' | 'png'>('pdf');
  const [includeIncomplete, setIncludeIncomplete] = useState(true);

  if (!isOpen) return null;

  const handleExport = () => {
    onExport(format, includeIncomplete);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">캔버스 내보내기</h2>

        {/* Progress Info */}
        <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-3 mb-4">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            현재 {nodeCount}개 노드가 있습니다
          </p>
          {nodeCount >= 3 && (
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">내보내기 가능 ✅</p>
          )}
          {nodeCount < 3 && (
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">최소 3개 노드 필요</p>
          )}
        </div>

        {/* Format Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            내보내기 형식
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setFormat('pdf')}
              className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                format === 'pdf'
                  ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-100'
                  : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
              }`}
            >
              PDF
            </button>
            <button
              onClick={() => setFormat('docx')}
              className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                format === 'docx'
                  ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-100'
                  : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
              }`}
            >
              DOCX
            </button>
            <button
              onClick={() => setFormat('png')}
              className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                format === 'png'
                  ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-100'
                  : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
              }`}
            >
              PNG
            </button>
          </div>
        </div>

        {/* Include Incomplete Option */}
        <div className="mb-6">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={includeIncomplete}
              onChange={(e) => setIncludeIncomplete(e.target.checked)}
              className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">미완성 섹션 포함</span>
          </label>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-6">
            체크 해제 시 완료된 노드만 내보내기
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            disabled={nodeCount < 3}
            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            내보내기
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            취소
          </button>
        </div>

        {/* Info */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            • PDF/DOCX: 최소 3개 노드 필요
            <br />
            • PNG: 캔버스 스크린샷
            <br />
            • Story 6.1: 부분 내보내기 지원
            <br />• Story 6.2: AI 문서 변환 (5초 목표)
          </p>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
