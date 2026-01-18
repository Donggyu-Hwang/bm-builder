import { useEffect, useCallback } from 'react';
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

/**
 * DocumentList Component
 * Displays a list of scanned documents with filtering and search
 */
export const DocumentList = () => {
  const dispatch = useDispatch();

  const documents = useSelector(selectDocuments);
  const selectedDocument = useSelector(selectSelectedDocument);
  const loading = useSelector(selectDocumentsLoading);
  const error = useSelector(selectDocumentsError);
  const filter = useSelector(selectFilter);
  const search = useSelector(selectSearch);

  // Fetch documents on mount and when filter/search changes
  useEffect(() => {
    dispatch(fetchDocuments({ filter, search }));
  }, [dispatch, filter, search]);

  // Handle document click
  const handleDocumentClick = useCallback(
    (document: typeof documents[0]) => {
      dispatch(setSelectedDocument(document));
    },
    [dispatch]
  );

  // Handle filter change
  const handleFilterChange = useCallback(
    (newFilter: DocumentFilter) => {
      dispatch(setFilter(newFilter));
    },
    [dispatch]
  );

  // Handle search change
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      dispatch(setSearch(e.target.value));
    },
    [dispatch]
  );

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
    <div className="space-y-6">
      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Search and Filter Controls */}
      <div className="space-y-4">
        {/* Search Input */}
        <div>
          <input
            type="text"
            placeholder="파일명으로 검색..."
            value={search}
            onChange={handleSearchChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => handleFilterChange('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            전체 보기
          </button>
          <button
            onClick={() => handleFilterChange('business')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'business'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            비즈니스 문서만
          </button>
          <button
            onClick={() => handleFilterChange('excluded')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'excluded'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            제외된 문서만
          </button>
        </div>
      </div>

      {/* Document Count */}
      {!loading && documents.length > 0 && (
        <div className="text-sm text-gray-600">
          {documents.length}개의 문서
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Document List */}
      {!loading && (
        <div className="grid gap-4">
          {documents.map((doc) => (
            <div
              key={doc.id}
              onClick={() => handleDocumentClick(doc)}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                doc.is_excluded
                  ? 'bg-gray-100 border-gray-300 opacity-60'
                  : 'bg-white border-gray-200 hover:border-blue-400 hover:shadow-md'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-2xl flex-shrink-0">
                    {getFileIcon(doc.file_type)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 truncate">
                      {doc.file_name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {formatFileSize(doc.size)} •{' '}
                      {new Date(doc.created_at).toLocaleDateString('ko-KR')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                  {doc.is_business_document && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                      비즈니스 ✅
                    </span>
                  )}
                  {doc.is_excluded && (
                    <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                      제외됨 ❌
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Empty State */}
          {documents.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">표시할 문서가 없습니다</p>
              {search && (
                <p className="text-sm mt-2">
                  다른 검색어나 필터를 시도해보세요
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
