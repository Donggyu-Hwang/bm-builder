import React, { useState, useEffect, useRef } from 'react';

interface Node {
  id: string;
  type: string;
  stage: number;
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  status: string;
  createdAt: number;
  updatedAt: number;
}

interface NodeDetailSidebarProps {
  node: Node | null;
  onClose: () => void;
  onSave?: (id: string, content: string) => void;
}

export const NodeDetailSidebar: React.FC<NodeDetailSidebarProps> = ({ node, onClose, onSave }) => {
  const [content, setContent] = useState(node?.content || '');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Update content when node changes
  useEffect(() => {
    setContent(node?.content || '');
  }, [node]);

  // Auto-focus textarea when sidebar opens
  useEffect(() => {
    if (node && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [node]);

  const handleSave = () => {
    if (node && onSave) {
      onSave(node.id, content);
      onClose();
    }
  };

  if (!node) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-2xl border-l-2 border-gray-200 z-40 transform transition-transform duration-200 ease-out translate-x-0">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
            노드 상세
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close sidebar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium px-3 py-1 rounded-full bg-blue-100 text-blue-700" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            Stage {node.stage}
          </span>
          <span className="text-xs text-gray-500" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            {node.type}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            내용
          </label>
          <textarea
            ref={textareaRef}
            className="w-full h-40 px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all resize-none"
            placeholder="노드 내용을 입력하세요..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              상태
            </span>
            <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 font-medium" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              {node.status === 'not_started' ? '시작 전' : node.status}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              위치
            </span>
            <span className="text-gray-900 font-medium" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              ({Math.round(node.x)}, {Math.round(node.y)})
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              생성 시간
            </span>
            <span className="text-gray-900 font-medium" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              {new Date(node.createdAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200 bg-white">
        <button
          onClick={handleSave}
          className="w-full py-3 px-4 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-lg transition-colors"
          style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
        >
          저장하기
        </button>
      </div>
    </div>
  );
};

export default NodeDetailSidebar;
