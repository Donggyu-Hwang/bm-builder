/**
 * Document Edit Page
 * Allows users to edit AI-generated documents with auto-save
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { generatedDocumentsApi, GeneratedDocument } from '../../api/generatedDocumentsApi';

export const DocumentEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [document, setDocument] = useState<GeneratedDocument | null>(null);
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Load document
  useEffect(() => {
    if (!id) return;

    const loadDocument = async () => {
      try {
        const doc = await generatedDocumentsApi.getDocument(id);
        setDocument(doc);
        setContent(doc.content);
        setTitle(doc.title);
      } catch (error) {
        console.error('Failed to load document:', error);
        alert('문서를 불러오는데 실패했습니다');
        navigate('/documents');
      }
    };

    loadDocument();
  }, [id, navigate]);

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!document || saveStatus === 'saving') return;

    const timer = setTimeout(() => {
      handleAutoSave();
    }, 30000);

    return () => clearTimeout(timer);
  }, [content, title, document, saveStatus]);

  const handleAutoSave = async () => {
    if (!id || !document) return;

    setSaveStatus('saving');
    try {
      await generatedDocumentsApi.updateDocument(id, {
        title,
        content,
      });
      setSaveStatus('saved');
      setLastSaved(new Date());
    } catch (error) {
      console.error('Auto-save failed:', error);
      setSaveStatus('error');
    }
  };

  const handleSave = async () => {
    if (!id) return;

    setSaveStatus('saving');
    try {
      await generatedDocumentsApi.updateDocument(id, {
        title,
        content,
      });
      setSaveStatus('saved');
      setLastSaved(new Date());
      alert('저장되었습니다!');
      navigate(-1);
    } catch (error) {
      console.error('Save failed:', error);
      setSaveStatus('error');
      alert('저장에 실패했습니다');
    }
  };

  const handleCancel = () => {
    if (content !== document?.content || title !== document?.title) {
      if (!confirm('저장되지 않은 변경사항이 있습니다. 정말 나가시겠습니까?')) {
        return;
      }
    }
    navigate(-1);
  };

  const handlePreview = () => {
    // Save first, then show preview
    handleAutoSave();
    alert('미리보기 기능은 곧 구현될 예정입니다');
  };

  if (!document) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">문서 편집</h1>
          <p className="text-sm text-gray-500 mt-1">
            자동 저장: {saveStatus === 'saved' && lastSaved
              ? `${lastSaved.toLocaleTimeString('ko-KR')}에 저장됨`
              : saveStatus === 'saving'
              ? '저장 중...'
              : saveStatus === 'error'
              ? '저장 실패'
              : '대기 중'}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/documents/${id}/node-canvas`)}
            className="px-4 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors"
          >
            Node UI 보기
          </button>
          <button
            onClick={handlePreview}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            미리보기
          </button>
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={saveStatus === 'saving'}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {saveStatus === 'saving' ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>

      {/* Document Info */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">문서 제목</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="문서 제목을 입력하세요"
        />

        <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
          <span>템플릿: {document.template_type}</span>
          <span>•</span>
          <span>생성일: {new Date(document.created_at).toLocaleDateString('ko-KR')}</span>
        </div>
      </div>

      {/* Content Editor - MVP: Textarea-based editor */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">문서 내용</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full h-[600px] px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
          placeholder="문서 내용을 입력하세요..."
        />

        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            💡 <strong>팁:</strong> 이 에디터는 MVP 버전입니다. WYSIWYG 에디터(볼드, 이탤릭, 리스트 등)는 향후 업데이트에서 지원될 예정입니다.
          </p>
        </div>
      </div>

      {/* Infographic Editing - MVP Placeholder */}
      <div className="mt-6 bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">인포그래픽</h3>
        <p className="text-gray-500 text-sm">
          인포그래픽 편집 기능은 Story 3.3에서 생성된 차트/이미지를 관리하는 기능입니다.
          현재 MVP에서는 텍스트 편집만 지원하며, 이미지 편집 기능은 향후 업데이트 예정입니다.
        </p>
      </div>

      {/* Version History - MVP Placeholder */}
      <div className="mt-6 bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">버전 히스토리</h3>
        <p className="text-gray-500 text-sm">
          버전 히스토리 기능은 향후 업데이트에서 지원될 예정입니다.
          최대 10개 버전이 자동으로 저장됩니다.
        </p>
      </div>
    </div>
  );
};
