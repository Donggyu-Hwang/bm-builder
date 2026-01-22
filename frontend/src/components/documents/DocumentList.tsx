import { useEffect, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchDocuments,
  setSelectedDocument,
  setFilter,
  setSearch,
  selectDocuments,
  selectSelectedDocument,
  selectDocumentsLoading,
  selectDocumentsError,
  selectFilter,
  selectSearch,
  clearError,
} from '../../store/slices/embeddedDocumentsSlice';
import type { DocumentFilter } from '../../api/embeddedDocumentsApi';
import { useToast, ErrorMessages } from '../ui';
import { ListSkeleton } from '../ui/Skeleton';
import { useArrowNavigation } from '../../hooks/useKeyboardNavigation';

/**
 * DocumentList Component
 * Displays a list of scanned documents with filtering and search
 * Enhanced with keyboard navigation, loading states, and friendly error messages
 */
export const DocumentList = () => {
  const dispatch = useDispatch();
  const { addToast } = useToast();
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const documents = useSelector(selectDocuments);
  const selectedDocument = useSelector(selectSelectedDocument);
  const loading = useSelector(selectDocumentsLoading);
  const error = useSelector(selectDocumentsError);
  const filter = useSelector(selectFilter);
  const search = useSelector(selectSearch);

  // Fetch documents on mount and when filter/search changes
  useEffect(() => {
    dispatch(fetchDocuments({ filter, search }))
      .unwrap()
      .catch((err) => {
        addToast({
          type: 'error',
          title: 'Oops! Failed to load documents',
          message: 'Let\'s try refreshing the page. Your files are safe!'
        });
      });
  }, [dispatch, filter, search, addToast]);

  // Handle document click with keyboard support
  const handleDocumentClick = useCallback(
    (document: typeof documents[0]) => {
      dispatch(setSelectedDocument(document));
      addToast({
        type: 'success',
        title: 'Document selected',
        message: `${document.file_name} is now selected`
      });
    },
    [dispatch, addToast]
  );

  // Handle filter change with feedback
  const handleFilterChange = useCallback(
    (newFilter: DocumentFilter) => {
      dispatch(setFilter(newFilter));
      addToast({
        type: 'info',
        title: 'Filter updated',
        message: `Showing ${newFilter === 'all' ? 'all' : newFilter} documents`
      });
    },
    [dispatch, addToast]
  );

  // Handle search change
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      dispatch(setSearch(e.target.value));
      setFocusedIndex(-1); // Reset keyboard navigation when searching
    },
    [dispatch]
  );

  // Keyboard navigation for document list
  useArrowNavigation(
    documents.length,
    focusedIndex,
    setFocusedIndex,
    { enabled: documents.length > 0 && !loading, loop: true }
  );

  // Activate selected document with Enter key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Enter' || e.key === ' ') && focusedIndex >= 0) {
        e.preventDefault();
        handleDocumentClick(documents[focusedIndex]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedIndex, documents, handleDocumentClick]);

  // Get file icon based on type
  const getFileIcon = (fileType: string): string => {
    switch (fileType) {
      case 'pdf':
        return '📄';
      case 'docx':
        return '📝';
      case 'hwp':
        return '📃';
      default:
        return '📄';
    }
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Clear error on unmount
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Error Display with friendly message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-3 sm:px-4 py-3 rounded-xl" role="alert">
          <div className="flex items-start gap-2">
            <span className="text-xl flex-shrink-0">😅</span>
            <div className="flex-1">
              <p className="font-semibold">Oops! Something went wrong</p>
              <p className="text-sm mt-1">{error}</p>
              <p className="text-sm mt-1">Let's try refreshing the page!</p>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filter Controls */}
      <div className="space-y-3 sm:space-y-4">
        {/* Search Input */}
        <div>
          <input
            type="text"
            placeholder="파일명으로 검색... (Press / to focus)"
            value={search}
            onChange={handleSearchChange}
            className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            aria-label="Search documents"
          />
        </div>

        {/* Filter Buttons with keyboard-accessible hints */}
        <div className="flex gap-2 flex-wrap" role="group" aria-label="Filter documents">
          <button
            onClick={() => handleFilterChange('all')}
            aria-pressed={filter === 'all'}
            className={`px-3 sm:px-4 py-2 text-sm rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            전체 보기
          </button>
          <button
            onClick={() => handleFilterChange('business')}
            aria-pressed={filter === 'business'}
            className={`px-3 sm:px-4 py-2 text-sm rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 ${
              filter === 'business'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            비즈니스 문서만
          </button>
          <button
            onClick={() => handleFilterChange('excluded')}
            aria-pressed={filter === 'excluded'}
            className={`px-3 sm:px-4 py-2 text-sm rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 ${
              filter === 'excluded'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            제외된 문서만
          </button>
        </div>

        {/* Keyboard navigation hint */}
        {documents.length > 0 && !loading && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            💡 Use arrow keys to navigate, Enter/Space to select
          </p>
        )}
      </div>

      {/* Document Count */}
      {!loading && documents.length > 0 && (
        <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
          {documents.length}개의 문서
        </div>
      )}

      {/* Loading State with Skeleton */}
      {loading && (
        <ListSkeleton items={3} className="py-4" />
      )}

      {/* Document List with Keyboard Navigation */}
      {!loading && (
        <div
          className="grid gap-3 sm:gap-4"
          role="listbox"
          aria-label="Documents"
        >
          {documents.map((doc, index) => (
            <div
              key={doc.id}
              onClick={() => handleDocumentClick(doc)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleDocumentClick(doc);
                }
              }}
              tabIndex={focusedIndex === index ? 0 : -1}
              role="option"
              aria-selected={focusedIndex === index}
              className={`p-3 sm:p-4 border rounded-lg cursor-pointer transition-all outline-none ${
                doc.is_excluded
                  ? 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 opacity-60'
                  : focusedIndex === index
                  ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-400 dark:border-orange-600 ring-2 ring-orange-500'
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-orange-400 dark:hover:border-orange-600 hover:shadow-md'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  <span className="text-xl sm:text-2xl flex-shrink-0" aria-hidden="true">
                    {getFileIcon(doc.file_type)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm sm:text-base text-gray-800 dark:text-gray-100 truncate">
                      {doc.file_name}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      {formatFileSize(doc.size)} •{' '}
                      {new Date(doc.created_at).toLocaleDateString('ko-KR')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0 ml-1 sm:ml-2">
                  {doc.is_business_document && (
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-[10px] sm:text-xs rounded">
                      비즈니스 ✅
                    </span>
                  )}
                  {doc.is_excluded && (
                    <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 text-[10px] sm:text-xs rounded">
                      제외됨 ❌
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Empty State with friendly message */}
          {documents.length === 0 && (
            <div className="text-center py-8 sm:py-12 text-gray-500 dark:text-gray-400" role="status">
              <p className="text-4xl mb-4" aria-hidden="true">📭</p>
              <p className="text-base sm:text-lg font-semibold">
                표시할 문서가 없습니다
              </p>
              {search && (
                <p className="text-xs sm:text-sm mt-2">
                  Let's try a different search term or filter! 💡
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
