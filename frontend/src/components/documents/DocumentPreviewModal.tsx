import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchDocumentPreview,
  updateDocument,
  setSelectedDocument,
  clearPreview,
  selectSelectedDocument,
  selectPreview,
  selectDocumentsUpdating,
  selectDocumentsError,
  clearError,
} from '../../store/slices/embeddedDocumentsSlice';

/**
 * DocumentPreviewModal Component
 * Modal for previewing and editing document classification
 */
export const DocumentPreviewModal = () => {
  const dispatch = useDispatch();

  const selectedDocument = useSelector(selectSelectedDocument);
  const preview = useSelector(selectPreview);
  const updating = useSelector(selectDocumentsUpdating);
  const error = useSelector(selectDocumentsError);

  // Fetch preview when document is selected
  useEffect(() => {
    if (selectedDocument) {
      dispatch(fetchDocumentPreview(selectedDocument.id));
    }

    // Cleanup preview on unmount
    return () => {
      dispatch(clearPreview());
    };
  }, [selectedDocument, dispatch]);

  // Handle close modal
  const handleClose = useCallback(() => {
    dispatch(setSelectedDocument(null));
    dispatch(clearError());
  }, [dispatch]);

  // Handle toggle business document
  const handleToggleBusiness = useCallback(async () => {
    if (!selectedDocument) return;

    await dispatch(
      updateDocument({
        documentId: selectedDocument.id,
        updates: {
          is_business_document: !selectedDocument.is_business_document,
        },
      })
    );
  }, [selectedDocument, dispatch]);

  // Handle toggle exclude
  const handleToggleExclude = useCallback(async () => {
    if (!selectedDocument) return;

    await dispatch(
      updateDocument({
        documentId: selectedDocument.id,
        updates: {
          is_excluded: !selectedDocument.is_excluded,
        },
      })
    );
  }, [selectedDocument, dispatch]);

  // Handle backdrop click
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) {
        handleClose();
      }
    },
    [handleClose]
  );

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [handleClose]);

  if (!selectedDocument) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] sm:max-h-[80vh] overflow-y-auto m-0 sm:m-4 flex flex-col">
        <div className="p-4 sm:p-6 flex-shrink-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-100 truncate flex-1">
              {selectedDocument.file_name}
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl leading-none flex-shrink-0"
              aria-label="Close modal"
            >
              ✕
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-3 sm:mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-3 sm:px-4 py-2 sm:py-3 rounded text-sm">
              {error}
            </div>
          )}

          {/* Preview Text */}
          <div className="bg-gray-50 dark:bg-gray-900 p-3 sm:p-4 rounded mb-3 sm:mb-4 border border-gray-200 dark:border-gray-700 max-h-[40vh] sm:max-h-[50vh] overflow-y-auto">
            <pre className="whitespace-pre-wrap text-xs sm:text-sm text-gray-700 dark:text-gray-300 font-sans">
              {preview || '로딩 중...'}
            </pre>
          </div>

          {/* Toggles */}
          <div className="space-y-3 sm:space-y-4">
            {/* Business Document Toggle */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 min-w-0">
                <span className="text-gray-700 dark:text-gray-200 font-medium text-sm sm:text-base">
                  비즈니스 문서
                </span>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  AI가 이 문서를 비즈니스 관련으로 분석합니다
                </p>
              </div>
              <button
                onClick={handleToggleBusiness}
                disabled={updating}
                className={`relative inline-flex h-5 sm:h-6 w-9 sm:w-11 items-center rounded-full transition-colors flex-shrink-0 ${
                  selectedDocument.is_business_document
                    ? 'bg-blue-600'
                    : 'bg-gray-200 dark:bg-gray-700'
                } ${updating ? 'opacity-50 cursor-not-allowed' : ''}`}
                aria-pressed={selectedDocument.is_business_document}
              >
                <span
                  className={`inline-block h-3.5 sm:h-4 w-3.5 sm:w-4 transform rounded-full bg-white transition-transform ${
                    selectedDocument.is_business_document
                      ? 'translate-x-5 sm:translate-x-6'
                      : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Exclude Toggle */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 min-w-0">
                <span className="text-gray-700 dark:text-gray-200 font-medium text-sm sm:text-base">
                  임베딩에서 제외
                </span>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  이 문서를 AI 검색에서 제외합니다
                </p>
              </div>
              <input
                type="checkbox"
                checked={selectedDocument.is_excluded}
                onChange={handleToggleExclude}
                disabled={updating}
                className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 disabled:opacity-50 flex-shrink-0"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="mt-4 sm:mt-6 flex gap-2 sm:gap-3">
            <button
              onClick={handleClose}
              disabled={updating}
              className="flex-1 bg-blue-600 text-white py-2 sm:py-2.5 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              {updating ? '저장 중...' : '완료'}
            </button>
          </div>

          {/* Updating Indicator */}
          {updating && (
            <div className="mt-2 sm:mt-3 text-center text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              변경사항을 저장 중입니다...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
