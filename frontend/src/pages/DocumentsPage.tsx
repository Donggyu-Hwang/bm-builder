import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  fetchDocumentStats,
  resetState,
  selectStats,
} from '../store/slices/embeddedDocumentsSlice';
import { selectIsAuthenticated } from '../store/slices/authSlice';
import { DocumentList } from '../components/documents/DocumentList';
import { DocumentPreviewModal } from '../components/documents/DocumentPreviewModal';

/**
 * DocumentsPage Component
 * Main page for viewing and managing scanned documents
 */
export const DocumentsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isAuthenticated = useSelector(selectIsAuthenticated);
  const stats = useSelector(selectStats);

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Fetch document stats on mount
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchDocumentStats());
    }

    // Cleanup on unmount
    return () => {
      dispatch(resetState());
    };
  }, [dispatch, isAuthenticated]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            문서 관리
          </h1>
          <p className="text-gray-600">
            스캔된 문서를 확인하고 비즈니스 문서 분류를 관리하세요
          </p>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="text-sm text-gray-600 mb-1">전체 문서</div>
              <div className="text-3xl font-bold text-gray-900">
                {stats.total}
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="text-sm text-gray-600 mb-1">비즈니스 문서</div>
              <div className="text-3xl font-bold text-green-600">
                {stats.business}
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="text-sm text-gray-600 mb-1">제외된 문서</div>
              <div className="text-3xl font-bold text-red-600">
                {stats.excluded}
              </div>
            </div>
          </div>
        )}

        {/* Document List */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <DocumentList />
        </div>
      </div>

      {/* Preview Modal */}
      <DocumentPreviewModal />
    </div>
  );
};
