import { RefreshCw, X } from 'lucide-react';

interface DocumentChangesBannerProps {
  changes: {
    updated_at?: string;
    updated_by?: string;
    sections_count?: number;
  };
  onRefresh: () => void;
  onDismiss: () => void;
}

const DocumentChangesBanner: React.FC<DocumentChangesBannerProps> = ({
  changes,
  onRefresh,
  onDismiss,
}) => {
  const getTimeAgo = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return '방금 전';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}분 전`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}시간 전`;
    return `${Math.floor(seconds / 86400)}일 전`;
  };

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-spin-slow" />
            <p className="text-sm text-blue-900 dark:text-blue-200">
              새로운 변경사항이 있습니다
              {changes.updated_at && (
                <span className="ml-1 text-blue-700 dark:text-blue-300">
                  ({getTimeAgo(changes.updated_at)}에 수정됨)
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            지금 새로고침
          </button>
          <button
            onClick={onDismiss}
            className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            title="나중에"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentChangesBanner;
