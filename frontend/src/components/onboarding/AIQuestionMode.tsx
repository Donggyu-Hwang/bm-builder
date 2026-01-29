import React, { useState, useEffect } from 'react';

interface AIQuestionModeProps {
  isVisible: boolean;
  onStart: () => void;
  onSkip: () => void;
  onCreateNode: (content: string) => void;
}

export const AIQuestionMode: React.FC<AIQuestionModeProps> = ({ isVisible, onStart, onSkip, onCreateNode }) => {
  const [countdown, setCountdown] = useState(3);
  const [userInput, setUserInput] = useState('');

  useEffect(() => {
    if (!isVisible) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isVisible]);

  if (!isVisible) return null;

  const handleStartNow = () => {
    setCountdown(0); // Skip countdown
    onStart();
  };

  const handleSkip = () => {
    onSkip();
  };

  const handleCreateNode = () => {
    if (userInput.trim()) {
      onCreateNode(userInput);
      setUserInput(''); // Clear input after creation
    }
  };

  return (
    <div className="fixed right-6 top-24 w-[400px] z-40">
      <div className="bg-white/95 backdrop-blur-md border-2 border-gray-900 rounded-lg shadow-xl p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-xl">🤖</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                AI Co-Founder
              </h3>
              <p className="text-xs text-gray-500" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                질문 모드
              </p>
            </div>
          </div>

          {/* Countdown or Question */}
          {countdown > 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-gray-600 mb-3" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                {countdown}초 후 자동으로 시작됩니다
              </p>
              <div className="text-5xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                {countdown}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleStartNow}
                  className="flex-1 px-4 py-2 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors text-sm"
                >
                  지금 시작하기
                </button>
                <button
                  onClick={handleSkip}
                  className="flex-1 px-4 py-2 bg-white text-gray-900 font-medium rounded-lg border-2 border-gray-900 hover:bg-gray-50 transition-colors text-sm"
                >
                  건너뛰기
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-base font-medium text-gray-900 mb-4 leading-relaxed">
                어떤 스타트업 아이디어를 가지고 계신가요? 간단히 설명해주세요
              </p>

              {/* Input Field */}
              <div className="mb-4">
                <textarea
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-gray-900 focus:outline-none transition-colors resize-none"
                  rows={6}
                  placeholder="예: 핀테크 스타트업으로 젊은 층을 위한 자동화 저축 관리 앱을 만들고 싶어요..."
                  style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
                />
              </div>

              {/* Auto-complete Suggestions */}
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  자동완성 제안:
                </p>
                <div className="space-y-2">
                  <button className="w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                    💡 핀테크 스타트업: 금융 서비스...
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                    💡 헬스케어: 원격 진료 플랫폼...
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                    💡 이커머스: 지속 가능한 패션...
                  </button>
                </div>
              </div>

              {/* Create Node Button */}
              <button
                onClick={handleCreateNode}
                disabled={!userInput.trim()}
                className={`w-full px-6 py-3 font-medium rounded-lg transition-colors ${
                  userInput.trim()
                    ? 'bg-gray-900 text-white hover:bg-gray-800'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                노드 생성
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIQuestionMode;
