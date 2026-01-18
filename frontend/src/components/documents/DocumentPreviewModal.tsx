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
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800 truncate">
              {selectedDocument.file_name}
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
              aria-label="Close modal"
            >
              ✕
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Preview Text */}
          <div className="bg-gray-50 p-4 rounded mb-4 border border-gray-200">
            <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
              {preview || '로딩 중...'}
            </pre>
          </div>

          {/* Toggles */}
          <div className="space-y-4">
            {/* Business Document Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-gray-700 font-medium">
                  비즈니스 문서
                </span>
                <p className="text-sm text-gray-500">
                  AI가 이 문서를 비즈니스 관련으로 분석합니다
                </p>
              </div>
              <button
                onClick={handleToggleBusiness}
                disabled={updating}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  selectedDocument.is_business_document
                    ? 'bg-blue-600'
                    : 'bg-gray-200'
                } ${updating ? 'opacity-50 cursor-not-allowed' : ''}`}
                aria-pressed={selectedDocument.is_business_document}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    selectedDocument.is_business_document
                      ? 'translate-x-6'
                      : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Exclude Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-gray-700 font-medium">
                  임베딩에서 제외
                </span>
                <p className="text-sm text-gray-500">
                  이 문서를 AI 검색에서 제외합니다
                </p>
              </div>
              <input
                type="checkbox"
                checked={selectedDocument.is_excluded}
                onChange={handleToggleExclude}
                disabled={updating}
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="mt-6 flex gap-3">
            <button
              onClick={handleClose}
              disabled={updating}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updating ? '저장 중...' : '완료'}
            </button>
          </div>

          {/* Updating Indicator */}
          {updating && (
            <div className="mt-3 text-center text-sm text-gray-600">
              변경사항을 저장 중입니다...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
