import React from 'react';
import { useDispatch } from 'react-redux';
import { startDemoMode } from '../../store/slices/demoSlice';
import { Rocket } from 'lucide-react';

export const DemoModeBanner: React.FC = () => {
  const dispatch = useDispatch();

  const handleStartDemo = () => {
    dispatch(startDemoMode());
    // 데모 모드용 mock 데이터 초기화
    window.location.href = '/dashboard';
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 text-center shadow-lg bg-gradient-to-r from-indigo-500 to-purple-600">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold mb-2 text-white flex items-center justify-center gap-2">
          <Rocket className="w-8 h-8" />
          BM Builder 체험해보기
        </h2>
        <p className="text-lg mb-4 text-white">가입 없이 바로 체험할 수 있습니다!</p>
        <button
          onClick={handleStartDemo}
          className="bg-white text-indigo-600 px-8 py-3 text-lg font-bold rounded-lg hover:bg-opacity-90 hover:scale-105 transition-all duration-200 shadow-md"
        >
          데모 모드 체험하기
        </button>
      </div>
    </div>
  );
};
