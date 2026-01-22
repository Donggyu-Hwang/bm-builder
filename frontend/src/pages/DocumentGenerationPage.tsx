/**
 * Document Generation Page
 * Main page for selecting document templates and starting AI interviews
 */

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  fetchAllTemplates,
  selectTemplates,
  selectTemplatesLoading,
  selectSelectedCategory,
  setSelectedCategory,
  startNewSession,
  selectCurrentSession,
  setInterviewModalOpen,
  selectInterviewModalOpen,
  resetSession,
} from '../store/slices/documentGenerationSlice';
import { RootState, AppDispatch } from '../store/store';
import { DocumentTemplate } from '../../../shared/types/documentGeneration.types';
import TemplateCard from '../components/document-generation/TemplateCard';
import InterviewModal from '../components/document-generation/InterviewModal';
import ExitConfirmationModal from '../components/document-generation/ExitConfirmationModal';
import { Navigation } from '@/components/navigation/Navigation';

const DocumentGenerationPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  // Selectors
  const templates = useSelector((state: RootState) => selectTemplates(state));
  const loading = useSelector(selectTemplatesLoading);
  const selectedCategory = useSelector(selectSelectedCategory);
  const currentSession = useSelector(selectCurrentSession);
  const interviewModalOpen = useSelector(selectInterviewModalOpen);

  // Fetch templates on mount
  useEffect(() => {
    dispatch(fetchAllTemplates());
  }, [dispatch]);

  // Handle template selection
  const handleTemplateSelect = async (template: DocumentTemplate) => {
    try {
      await dispatch(
        startNewSession({
          template_type: template.template_type,
        })
      ).unwrap();
      dispatch(setInterviewModalOpen(true));
    } catch (error) {
      console.error('Failed to start session:', error);
    }
  };

  // Handle category filter change
  const handleCategoryChange = (category: 'all' | 'gov_support' | 'ir_material') => {
    dispatch(setSelectedCategory(category));
  };

  // Handle close interview
  const handleCloseInterview = () => {
    dispatch(setInterviewModalOpen(false));
    dispatch(resetSession());
  };

  // Filter templates by category
  const filteredTemplates = templates.filter((template) => {
    if (selectedCategory === 'all') return true;
    return template.category === selectedCategory;
  });

  // Group templates by category for display
  const govSupportTemplates = filteredTemplates.filter(
    (t) => t.category === 'gov_support'
  );
  const irMaterialTemplates = filteredTemplates.filter(
    (t) => t.category === 'ir_material'
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Navigation */}
      <Navigation />

      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">AI 문서 생성</h1>
              <p className="mt-1 sm:mt-2 text-sm sm:text-base text-slate-600">
                선택한 템플릿에 맞춰 AI가 맞춤형 문서를 생성합니다
              </p>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 text-sm sm:text-base text-slate-600 hover:text-slate-900 transition-colors self-start sm:self-auto"
            >
              대시보드로 돌아가기
            </button>
          </div>

          {/* Category Filter */}
          <div className="mt-4 sm:mt-6 flex flex-wrap gap-2">
            <button
              onClick={() => handleCategoryChange('all')}
              className={`px-3 sm:px-4 py-2 text-sm rounded-lg font-medium transition-all ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              전체
            </button>
            <button
              onClick={() => handleCategoryChange('gov_support')}
              className={`px-3 sm:px-4 py-2 text-sm rounded-lg font-medium transition-all ${
                selectedCategory === 'gov_support'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              정부 지원 사업
            </button>
            <button
              onClick={() => handleCategoryChange('ir_material')}
              className={`px-3 sm:px-4 py-2 text-sm rounded-lg font-medium transition-all ${
                selectedCategory === 'ir_material'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              IR 자료
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-8 sm:space-y-12">
            {/* Government Support Section */}
            {govSupportTemplates.length > 0 && (
              <section>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 sm:mb-6">
                  정부 지원 사업
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {govSupportTemplates.map((template) => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      onSelect={handleTemplateSelect}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* IR Material Section */}
            {irMaterialTemplates.length > 0 && (
              <section>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 sm:mb-6">IR 자료</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {irMaterialTemplates.map((template) => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      onSelect={handleTemplateSelect}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* No Templates Message */}
            {filteredTemplates.length === 0 && (
              <div className="text-center py-12">
                <p className="text-slate-500 text-base sm:text-lg">
                  표시할 템플릿이 없습니다
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Interview Modal */}
      {interviewModalOpen && currentSession.sessionId && (
        <InterviewModal
          sessionId={currentSession.sessionId}
          templateName={currentSession.templateName || ''}
          onClose={handleCloseInterview}
        />
      )}

      {/* Exit Confirmation Modal */}
      {/* <ExitConfirmationModal /> */}
    </div>
  );
};

export default DocumentGenerationPage;
