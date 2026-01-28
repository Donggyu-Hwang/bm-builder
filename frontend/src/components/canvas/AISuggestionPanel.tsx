import React, { useState } from 'react';
import { useAppSelector } from '../../hooks/useRedux';
import aiConversationService, { AISuggestion } from '../../services/aiConversation.service';

interface AISuggestionPanelProps {
  nodeId: string;
  onApplySuggestion: (content: string) => void;
}

const AISuggestionPanel: React.FC<AISuggestionPanelProps> = ({ nodeId, onApplySuggestion }) => {
  const nodes = useAppSelector((state) => state.canvas.nodes);
  const [suggestion, setSuggestion] = useState<AISuggestion | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentNode = nodes.find((n) => n.id === nodeId);

  const handleGenerateSuggestion = async () => {
    if (!currentNode) return;

    setIsLoading(true);
    setError(null);

    try {
      const generatedSuggestion = await aiConversationService.generateSuggestion(
        currentNode,
        nodes
      );
      setSuggestion(generatedSuggestion);
    } catch (err) {
      setError('AI 제안 생성 중 오류가 발생했습니다. 다시 시도해 주세요.');
      console.error('Failed to generate suggestion:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = () => {
    if (suggestion) {
      onApplySuggestion(suggestion.content);
      setSuggestion({ ...suggestion, approved: true });
    }
  };

  const handleReject = () => {
    setSuggestion(null);
  };

  if (!currentNode) return null;

  return (
    <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">AI 제안</h3>
        {!suggestion && !isLoading && (
          <button
            onClick={handleGenerateSuggestion}
            className="px-3 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700 transition-colors"
          >
            제안 받기
          </button>
        )}
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600" />
            <span className="text-sm text-gray-600 dark:text-gray-400">AI 제안 생성 중...</span>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-3">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          <button
            onClick={handleGenerateSuggestion}
            className="mt-2 text-xs text-red-600 dark:text-red-400 hover:underline"
          >
            다시 시도
          </button>
        </div>
      )}

      {suggestion && !suggestion.approved && (
        <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {suggestion.content}
            </p>
          </div>

          <div className="flex items-center gap-2 mt-4">
            <button
              onClick={handleApprove}
              className="flex-1 px-3 py-2 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 transition-colors"
            >
              승인하기
            </button>
            <button
              onClick={handleReject}
              className="flex-1 px-3 py-2 text-gray-600 dark:text-gray-400 text-sm rounded hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              거절하기
            </button>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
            승인 시 이 제안이 노드 내용에 적용됩니다
          </p>
        </div>
      )}

      {suggestion?.approved && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
          <p className="text-sm text-green-600 dark:text-green-400">✓ 제안이 승인되었습니다</p>
        </div>
      )}

      {/* Usage Stats */}
      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          목표 승인율: 70% | 현재: {suggestion?.approved ? '100%' : '0%'}
        </p>
      </div>
    </div>
  );
};

export default AISuggestionPanel;
