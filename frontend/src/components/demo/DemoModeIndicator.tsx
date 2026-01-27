import React from 'react';
import { useSelector } from 'react-redux';
import { AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const DemoModeIndicator: React.FC = () => {
  const isDemoMode = useSelector((state: any) => state.demo.isDemoMode);
  const navigate = useNavigate();

  if (!isDemoMode) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[10000] flex items-center justify-center gap-2 px-4 py-2 text-white bg-gradient-to-r from-red-500 to-orange-500 shadow-lg">
      <AlertTriangle className="w-6 h-6" />
      <span className="font-bold">데모 모드입니다. 무제한 사용을 위해 가입하세요!</span>
      <button
        onClick={() => navigate('/login')}
        className="px-4 py-2 font-bold text-red-500 bg-white rounded hover:bg-opacity-90 transition-colors"
      >
        지금 가입하기
      </button>
    </div>
  );
};
