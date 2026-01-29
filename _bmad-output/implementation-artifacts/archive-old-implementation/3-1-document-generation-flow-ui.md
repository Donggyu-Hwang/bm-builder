# Story 3.1: 문서 생성 플로우 UI

**Story ID:** 3.1
**Epic:** Epic 3 - AI 문서 생성
**Status:** ready-for-dev
**Last Updated:** 2026-01-18

---

## User Story

**As a** 예비 창업가,
**I want** AI와 질문/답변으로 문서를 생성하려고,
**So that** 복잡한 양식을 간단하게 완성할 수 있다.

---

## Acceptance Criteria

### AC1: 문서 생성 페이지 접근

**Given** 사용자가 대시보드에 접속했을 때
**When** 사용자가 "새 문서 만들기" 버튼을 클릭하면
**Then** 문서 생성 페이지로 이동한다

### AC2: 양식 선택 UI

**And** 문서 생성 페이지가 다음을 제공한다:
  - 양식 선택 dropdown:
    - 정부지원사업: 예비창업, 초기창업, R&D, 성장, 특화
    - IR 자료: 피칭 데크, 1-pager, 비즈니스 모델 캔버스
  - "시작하기" 버튼

### AC3: AI 인터뷰 Modal

**When** 사용자가 양식을 선택하고 "시작하기"를 클릭하면
**Then** AI 인터뷰 modal이 표시된다

**And** AI 인터뷰 modal이 다음을 제공한다:
  - 질문 표시 (Claude 4.5가 생성)
  - 답변 입력 textarea
  - "다음" / "이전" / "완료" 버튼
  - Progress indicator: "질문 3/10"

### AC4: 질문/답변 인터랙션

**And** 각 질문에서:
  - 질문이 로딩 중일 때 스켈레톤 표시
  - 질문이 표시되면 자동으로 textarea에 focus
  - 답변 후 "다음" 클릭 시 다음 질문 로딩

### AC5: 중단 확인

**And** 사용자가 중간에 "나가기"를 클릭하면:
  - "문서 생성을 중단하시겠습니까? 진행 상황은 저장되지 않습니다." 확인 modal
  - 확인 시 대시보드로 돌아감

---

## Technical Implementation

### Database Schema

```sql
-- Document templates table
CREATE TABLE IF NOT EXISTS document_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_type TEXT NOT NULL UNIQUE,
  template_name TEXT NOT NULL,
  category TEXT NOT NULL, -- 'gov_support' or 'ir_material'
  description TEXT,
  prompt_template TEXT NOT NULL,
  questions JSONB, -- Array of default questions
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert templates
INSERT INTO document_templates (template_type, template_name, category, description, questions) VALUES
('pre Startup', '예비창업', 'gov_support', '창업아이디어 공모전을 위한 문서', '["어떤 사회문제를 해결하나요?", "해결책은 무엇인가요?"]'::jsonb),
('early Startup', '초기창업', 'gov_support', '벤처투자 유치를 위한 문서', '["타겟 시장 규모는?", "투자 포트폴리는?"]'::jsonb),
('rnd', 'R&D', 'gov_support', '기업부설지원사업', '["핵심 기술의 혁신성은?", "과제 목표는?"]'::jsonb),
('growth', '성장', 'gov_support', '고성장기업 지원', '["매출 성장률은?", "시장 확장 전략은?"]'::jsonb),
('specialization', '특화', 'gov_support', '지역/플랫폼 특화', '["지역 특성은?", "플랫폼 전략은?"]'::jsonb),
('pitch_deck', '피칭 데크', 'ir_material', '투자자 피칭을 위한 10-15장 슬라이드', '["회사의 미션은?", "문제는?", "해결책은?"]'::jsonb),
('one_pager', '1-Pager', 'ir_material', '한 페이지 요약', '["핵심 가치 제안은?"]'::jsonb),
('business_model_canvas', '비즈니스 모델 캔버스', 'ir_material', '9블록 비즈니스 모델', '["키 파트너는?", "키 활동은?"]'::jsonb);
```

### Frontend Implementation

#### 1. Document Generation Page

**File:** `frontend/src/pages/DocumentGenerationPage.tsx`

```typescript
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AIInterviewModal } from '../components/document-generation/AIInterviewModal';

interface TemplateType {
  type: string;
  name: string;
  category: 'gov_support' | 'ir_material';
}

export const DocumentGenerationPage = () => {
  const navigate = useNavigate();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [showInterviewModal, setShowInterviewModal] = useState(false);

  const templateTypes: TemplateType[] = [
    { type: 'pre_startup', name: '예비창업', category: 'gov_support' },
    { type: 'early_startup', name: '초기창업', category: 'gov_support' },
    { type: 'rnd', name: 'R&D', category: 'gov_support' },
    { type: 'growth', name: '성장', category: 'gov_support' },
    { type: 'specialization', name: '특화', category: 'gov_support' },
    { type: 'pitch_deck', name: '피칭 데크', category: 'ir_material' },
    { type: 'one_pager', name: '1-Pager', category: 'ir_material' },
    { type: 'business_model_canvas', name: '비즈니스 모델 캔버스', category: 'ir_material' },
  ];

  const handleStart = () => {
    if (selectedTemplate) {
      setShowInterviewModal(true);
    }
  };

  const handleCancel = () => {
    if (confirm('문서 생성을 중단하시겠습니까? 진행 상황은 저장되지 않습니다.')) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={handleCancel}
            className="text-gray-600 hover:text-gray-800 mb-4"
          >
            ← 대시보드로
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            새 문서 만들기
          </h1>
          <p className="text-gray-600 mt-2">
            AI와 함께 전문가급 문서를 생성하세요
          </p>
        </div>

        {/* Template Selection */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-xl font-semibold mb-4">문서 양식 선택</h2>

          {/* Government Support */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-700 mb-3">
              정부지원사업
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {templateTypes
                .filter(t => t.category === 'gov_support')
                .map(template => (
                  <button
                    key={template.type}
                    onClick={() => setSelectedTemplate(template.type)}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      selectedTemplate === template.type
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-gray-900">
                      {template.name}
                    </div>
                  </button>
                ))}
            </div>
          </div>

          {/* IR Materials */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-700 mb-3">
              IR 자료
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {templateTypes
                .filter(t => t.category === 'ir_material')
                .map(template => (
                  <button
                    key={template.type}
                    onClick={() => setSelectedTemplate(template.type)}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      selectedTemplate === template.type
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-gray-900">
                      {template.name}
                    </div>
                  </button>
                ))}
            </div>
          </div>

          {/* Start Button */}
          <div className="flex justify-end gap-3 mt-8">
            <button
              onClick={handleCancel}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              취소
            </button>
            <button
              onClick={handleStart}
              disabled={!selectedTemplate}
              className={`px-6 py-2 rounded-lg font-medium ${
                selectedTemplate
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              시작하기
            </button>
          </div>
        </div>
      </div>

      {/* AI Interview Modal */}
      {showInterviewModal && selectedTemplate && (
        <AIInterviewModal
          templateType={selectedTemplate}
          onClose={() => setShowInterviewModal(false)}
          onComplete={(documentId) => navigate(`/documents/${documentId}`)}
        />
      )}
    </div>
  );
};
```

#### 2. AI Interview Modal Component

**File:** `frontend/src/components/document-generation/AIInterviewModal.tsx`

```typescript
import { useState, useEffect, useRef } from 'react';
import { documentGenerationApi } from '../../api/documentGenerationApi';

interface Question {
  id: string;
  question: string;
  placeholder?: string;
}

interface AIInterviewModalProps {
  templateType: string;
  onClose: () => void;
  onComplete: (documentId: string) => void;
}

export const AIInterviewModal = ({
  templateType,
  onClose,
  onComplete
}: AIInterviewModalProps) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingNext, setIsGeneratingNext] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetchQuestions();
  }, [templateType]);

  useEffect(() => {
    if (!isLoading && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isLoading, currentQuestionIndex]);

  const fetchQuestions = async () => {
    try {
      setIsLoading(true);
      const data = await documentGenerationApi.getQuestions(templateType);
      setQuestions(data.questions);
    } catch (error) {
      console.error('Failed to fetch questions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerChange = (value: string) => {
    const currentQuestion = questions[currentQuestionIndex];
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: value
    }));
  };

  const handleNext = async () => {
    if (currentQuestionIndex < questions.length - 1) {
      setIsGeneratingNext(true);
      setCurrentQuestionIndex(prev => prev + 1);
      setIsGeneratingNext(false);
    } else {
      // Complete interview
      await handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleComplete = async () => {
    try {
      const documentId = await documentGenerationApi.startGeneration({
        templateType,
        answers
      });
      onComplete(documentId);
    } catch (error) {
      console.error('Failed to start generation:', error);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] || '' : '';
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg max-w-2xl w-full mx-4 p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
          <p className="text-center text-gray-600 mt-4">질문 생성 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">AI 인터뷰</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>질문 {currentQuestionIndex + 1}/{questions.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question */}
        {isGeneratingNext ? (
          <div className="mb-6">
            <div className="animate-pulse space-y-3">
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="h-24 bg-gray-200 rounded"></div>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {currentQuestion?.question}
              </label>
              <textarea
                ref={textareaRef}
                value={currentAnswer}
                onChange={(e) => handleAnswerChange(e.target.value)}
                placeholder={currentQuestion?.placeholder || '답변을 입력하세요...'}
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-6">
              <button
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                className={`px-4 py-2 rounded-lg ${
                  currentQuestionIndex === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                이전
              </button>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  나가기
                </button>
                <button
                  onClick={handleNext}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {currentQuestionIndex === questions.length - 1 ? '완료' : '다음'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
```

#### 3. Document Generation API Client

**File:** `frontend/src/api/documentGenerationApi.ts`

```typescript
import axiosInstance from './client';

interface Question {
  id: string;
  question: string;
  placeholder?: string;
}

interface GetQuestionsResponse {
  questions: Question[];
}

interface StartGenerationRequest {
  templateType: string;
  answers: Record<string, string>;
}

export const documentGenerationApi = {
  // Get AI interview questions
  getQuestions: async (templateType: string): Promise<GetQuestionsResponse> => {
    const { data } = await axiosInstance.post('/api/v1/document-generation/questions', {
      templateType
    });
    return data.data;
  },

  // Start document generation
  startGeneration: async (request: StartGenerationRequest): Promise<string> => {
    const { data } = await axiosInstance.post('/api/v1/document-generation/start', request);
    return data.data.documentId;
  }
};
```

---

## Testing Checklist

- [ ] "새 문서 만들기" 버튼으로 페이지 접근
- [ ] 양식 선택 dropdown이 올바르게 표시됨
- [ ] 양식 선택 후 "시작하기"로 AI 인터뷰 modal 표시
- [ ] 질문 로딩 시 스켈레톤 표시
- [ ] 질문 표시 시 textarea 자동 focus
- [ ] Progress indicator가 올바른 퍼센트 표시
- [ ] "다음" / "이전" 버튼으로 질문 네비게이션
- [ ] "나가기" 클릭 시 확인 modal 표시
- [ ] "완료" 시 문서 생성 시작 (Story 3.2)

---

## Dependencies

**Frontend:**
- Existing dependencies (React Router, Axios)

**Backend:**
- Story 3.2 (RAG-based Document Generation)

---

## Notes

- **Question Generation**: AI questions will be generated by Claude API in Story 3.2
- **Answer Storage**: Answers are temporarily stored in frontend state until completion
- **Progress Persistence**: Current implementation does NOT save progress (per AC)
- **Template Validation**: Backend validates template_type before generating questions

---

## Definition of Done

- [x] All acceptance criteria met
- [ ] Code review completed
- [ ] UI/UX testing with all template types
- [ ] Accessibility testing (keyboard navigation)
- [ ] Responsive design tested (mobile/tablet)
- [ ] Deployed to staging environment

---

**Story Status:** ✅ Ready for Development
**Estimated Complexity:** Medium (UI components, modal, state management)
**Recommended Developer:** Dev agent
**Dependencies:** Epic 1 (Authentication)
