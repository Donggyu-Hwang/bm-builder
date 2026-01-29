import React, { useState } from 'react';

interface Question {
  id: number;
  question: string;
  example: string;
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    question: '어떤 분야에서 문제를 발견하고 싶으신가요?',
    example: '예: 핀테크, 헬스케어, 교육, 이커머스 등',
  },
  {
    id: 2,
    question: '본인이나 주변에서 겪은 불편한 점이 있나요?',
    example: '예: 서비스 이용 중 겪은 문제, 시간 낭비, 비용 부담 등',
  },
  {
    id: 3,
    question: '해결하고 싶은 특정 문제가 있나요?',
    example: '예: 구체적인痛点(pain point)나 개선하고 싶은 프로세스',
  },
];

interface ProblemDiscoveryProps {
  isVisible: boolean;
}

export const ProblemDiscovery: React.FC<ProblemDiscoveryProps> = ({ isVisible }) => {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [activeQuestion, setActiveQuestion] = useState<number>(0);

  if (!isVisible) return null;

  return (
    <div className="fixed left-6 top-1/2 -translate-y-1/2 w-96 bg-white/95 backdrop-blur-md border-2 border-gray-900 rounded-lg shadow-xl p-6 z-40">
      <h3 className="text-2xl font-bold mb-6 text-gray-900" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
        문제 발굴
      </h3>

      <div className="space-y-6">
        {QUESTIONS.map((q, index) => (
          <div
            key={q.id}
            className={`
              transition-all duration-300
              ${index === activeQuestion ? 'opacity-100' : 'opacity-50'}
            `}
          >
            <p className="text-sm font-medium mb-2 text-gray-600" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              Q{q.id}.
            </p>
            <p className="text-lg font-semibold mb-3 text-gray-900">{q.question}</p>
            <p className="text-sm text-gray-500 mb-3 italic">{q.example}</p>
            <textarea
              value={answers[q.id] || ''}
              onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
              onFocus={() => setActiveQuestion(index)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-gray-900 focus:outline-none transition-colors resize-none"
              rows={3}
              placeholder="답변을 입력하세요..."
            />
          </div>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <button className="w-full px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors">
          답변 완료
        </button>
      </div>
    </div>
  );
};

export default ProblemDiscovery;
