import { useNavigate } from 'react-router-dom';
import { Sparkles, FileText, TrendingUp } from 'lucide-react';

interface DocumentCreationCTAProps {
  totalDocuments?: number;
}

export const DocumentCreationCTA = ({ totalDocuments = 0 }: DocumentCreationCTAProps) => {
  const navigate = useNavigate();

  // 첫 방문(문서 0개)인 경우 더 눈에 띄는 CTA
  if (totalDocuments === 0) {
    return (
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-xl p-6 sm:p-8 mb-8 shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                첫 문서를 만들어볼까요? 🎉
              </h2>
            </div>
            <p className="text-blue-100 text-base sm:text-lg mb-4 max-w-2xl">
              온보딩을 완료했어요! AI와 함께 정부지원사업 문서를 생성해보세요.
              <br />단 50분 만에 제출 가능한 문서를 완성할 수 있어요.
            </p>
            <div className="flex flex-wrap gap-2 text-sm">
              <div className="bg-white/20 px-3 py-1 rounded-full text-white">✨ AI 자동 생성</div>
              <div className="bg-white/20 px-3 py-1 rounded-full text-white">
                📄 정부지원사업 양식
              </div>
              <div className="bg-white/20 px-3 py-1 rounded-full text-white">🎯 맞춤형 IR 자료</div>
            </div>
          </div>
          <button
            onClick={() => navigate('/create')}
            className="w-full sm:w-auto bg-white text-blue-600 px-8 py-4 rounded-lg font-bold text-base hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            지금 시작하기 →
          </button>
        </div>
      </div>
    );
  }

  // 문서가 있는 경우 더 간결한 CTA
  return (
    <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg p-4 sm:p-6 mb-6 shadow-md">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-lg">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">새 문서 만들기</h3>
            <p className="text-blue-100 text-sm">AI와 함께 다음 문서를 생성해보세요</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/create')}
          className="w-full sm:w-auto bg-white text-blue-600 px-6 py-2.5 rounded-lg font-semibold hover:bg-gray-100 transition-all shadow-md"
        >
          ✨ 문서 생성
        </button>
      </div>
    </div>
  );
};
