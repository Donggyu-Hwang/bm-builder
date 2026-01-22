/**
 * Generated Document List Component
 * Displays list of AI-generated documents with search and sort
 */

import { useState, useEffect } from 'react';
import { generatedDocumentsApi, GeneratedDocument } from '../../api/generatedDocumentsApi';
import { GeneratedDocumentViewer } from './GeneratedDocumentViewer';

export const GeneratedDocumentList = () => {
  const [documents, setDocuments] = useState<GeneratedDocument[]>([]);
  const [sortBy, setSortBy] = useState<'created_at_desc' | 'created_at_asc' | 'title'>('created_at_desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDocument, setSelectedDocument] = useState<GeneratedDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, [sortBy, searchQuery]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await generatedDocumentsApi.getDocuments({
        sortBy,
        search: searchQuery,
      });
      setDocuments(response.documents);
    } catch (err) {
      console.error('Failed to fetch documents:', err);
      setError('문서 목록을 불러오는데 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (documentId: string) => {
    if (!confirm('정말 이 문서를 삭제하시겠습니까?')) {
      return;
    }

    try {
      await generatedDocumentsApi.deleteDocument(documentId);
      setDocuments(documents.filter(doc => doc.id !== documentId));
    } catch (err) {
      console.error('Failed to delete document:', err);
      alert('문서 삭제에 실패했습니다');
    }
  };

  const handleDuplicate = async (documentId: string) => {
    try {
      const duplicated = await generatedDocumentsApi.duplicateDocument(documentId);
      setDocuments([duplicated, ...documents]);
    } catch (err) {
      console.error('Failed to duplicate document:', err);
      alert('문서 복제에 실패했습니다');
    }
  };

  const handleDownload = async (documentId: string, title: string) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/generated-documents/${documentId}/download/pdf`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('다운로드에 실패했습니다');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title}_${new Date().toISOString().split('T')[0].replace(/-/g, '')}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Failed to download document:', err);
      alert('다운로드에 실패했습니다');
    }
  };

  const getTemplateBadge = (templateType: string) => {
    const badgeMap: Record<string, { text: string; color: string }> = {
      preliminary_startup: { text: '예비창업', color: 'bg-blue-100 text-blue-800' },
      early_startup: { text: '창업 초기', color: 'bg-green-100 text-green-800' },
      rd_project: { text: 'R&D 과제', color: 'bg-purple-100 text-purple-800' },
      growth_stage: { text: '성장기', color: 'bg-orange-100 text-orange-800' },
      specialized_support: { text: '특화지원', color: 'bg-pink-100 text-pink-800' },
      pitch_deck: { text: 'IR 자료', color: 'bg-red-100 text-red-800' },
    };

    return badgeMap[templateType] || { text: templateType, color: 'bg-gray-100 text-gray-800' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">내 문서</h2>
      </div>

      {/* Search Bar */}
      <div>
        <input
          type="text"
          placeholder="문서 제목으로 검색..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Sort Options */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">정렬</label>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="created_at_desc">최신순</option>
          <option value="created_at_asc">오래된순</option>
          <option value="title">이름순</option>
        </select>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Document List */}
      {documents.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-500 text-lg">
            {searchQuery ? '검색 결과가 없습니다.' : '아직 생성된 문서가 없습니다.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {documents.map((doc) => {
            const badge = getTemplateBadge(doc.template_type);
            return (
              <div
                key={doc.id}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{doc.title}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded ${badge.color}`}>
                        {badge.text}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        doc.status === 'completed' ? 'bg-green-100 text-green-800' :
                        doc.status === 'generating' ? 'bg-yellow-100 text-yellow-800' :
                        doc.status === 'failed' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {doc.status === 'completed' ? '완료' :
                         doc.status === 'generating' ? '생성 중' :
                         doc.status === 'failed' ? '실패' : '임시저장'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      {new Date(doc.created_at).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    <p className="text-gray-600 mt-2 line-clamp-2">
                      {doc.content.substring(0, 200)}
                      {doc.content.length > 200 && '...'}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => setSelectedDocument(doc)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    disabled={doc.status !== 'completed'}
                  >
                    보기
                  </button>
                  <button
                    onClick={() => (window.location.href = `/documents/${doc.id}/edit`)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                    disabled={doc.status !== 'completed'}
                  >
                    편집
                  </button>
                  <button
                    onClick={() => handleDuplicate(doc.id)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                    disabled={doc.status !== 'completed'}
                  >
                    복제
                  </button>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                  >
                    삭제
                  </button>
                  <button
                    onClick={() => handleDownload(doc.id, doc.title)}
                    className="px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium"
                    disabled={doc.status !== 'completed'}
                  >
                    다운로드
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Document Viewer Modal */}
      {selectedDocument && (
        <GeneratedDocumentViewer
          document={selectedDocument}
          onClose={() => setSelectedDocument(null)}
        />
      )}
    </div>
  );
};
