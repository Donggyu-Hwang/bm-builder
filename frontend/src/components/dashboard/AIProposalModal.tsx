import { useState, useEffect } from 'react';
import { X, Sparkles, FileText, Users, Target, TrendingUp } from 'lucide-react';

interface AIProposalModalProps {
  vision?: string;
  targetCustomer?: string;
  currentStage?: string;
  isOpen: boolean;
  onClose: () => void;
  onCreateDocument: () => void;
}

export const AIProposalModal = ({
  vision,
  targetCustomer,
  currentStage,
  isOpen,
  onClose,
  onCreateDocument,
}: AIProposalModalProps) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // 진입 애니메이션
      setTimeout(() => setIsAnimating(true), 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // 온보딩 답변 기반 맞춤 제안 생성
  const generateProposal = () => {
    const stageMap: Record<string, string> = {
      예비창업: '예비창업 단계시니까, 가장 먼저 "문제 발견"과 "고객 인터뷰" 문서를 만들어볼까요?',
      초기창업: '초기창업 단계시니까, "정부지원사업 지원서"와 "IR 피칭 데크"를 준비해봐요!',
      성장기: '성장기시니까, "사업계획서"와 "투자유치 자료"를 업그레이드해볼까요?',
      R_D: 'R&D 과제시니까, "기업설명서"와 "연구개발계획서"를 작성해봐요!',
    };

    return stageMap[currentStage || '예비창업'] || stageMap['예비창업'];
  };

  const getRecommendation = () => {
    if (vision?.includes('앱') || vision?.includes('플랫폼')) {
      return '앱/플랫폼 아이디어를 가지고 계시는군요! 시장 분석부터 시작해볼까요?';
    }
    if (targetCustomer?.includes('B2B') || targetCustomer?.includes('기업')) {
      return 'B2B 타겟이시군요! 비즈니스 모델부터 명확히 해봐요.';
    }
    return '온보딩에서 말씀하신 비전을 바탕으로 AI가 문서를 만들어드릴게요!';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        className={`bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full transform transition-all duration-300 ${
          isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-2xl p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-3 rounded-xl">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">AI 제안 🎯</h2>
                <p className="text-blue-100 text-sm mt-1">
                  온보딩을 완료했어요! 다음 단계를 제안해드릴게요.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
              aria-label="닫기"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* 온보딩 답변 요약 */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              📝 온보딩에서 말씀하신 내용
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <Target className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">비전:</span>
                  <p className="text-gray-600 dark:text-gray-400 mt-0.5">
                    {vision || '입력된 비전이 없습니다.'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Users className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">타겟 고객:</span>
                  <p className="text-gray-600 dark:text-gray-400 mt-0.5">
                    {targetCustomer || '입력된 타겟이 없습니다.'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <TrendingUp className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">현재 단계:</span>
                  <p className="text-gray-600 dark:text-gray-400 mt-0.5">
                    {currentStage || '예비창업'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* AI 맞춤 제안 */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-5 mb-6 border-2 border-purple-200 dark:border-purple-700">
            <div className="flex items-start gap-3">
              <div className="bg-purple-500 p-2 rounded-lg flex-shrink-0">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white mb-2">
                  AI가 추천하는 다음 단계
                </h4>
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                  {generateProposal()}
                </p>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">
                  💡 {getRecommendation()}
                </p>
              </div>
            </div>
          </div>

          {/* 예상 소요 시간 */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="text-2xl mb-1">⏱️</div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">50분</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">예상 소요 시간</div>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="text-2xl mb-1">📄</div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">5개+</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">정부지원사업 양식</div>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="text-2xl mb-1">✨</div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">AI 자동</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">문서 생성</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 pt-0">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            나중에
          </button>
          <button
            onClick={onCreateDocument}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
          >
            지금 문서 만들기 →
          </button>
        </div>
      </div>
    </div>
  );
};
