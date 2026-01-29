import React from 'react';
import type { OnboardingMode } from '../../types/canvas';

interface OnboardingModeBadgeProps {
  mode: OnboardingMode;
}

const MODE_LABELS: Record<OnboardingMode, string> = {
  beginner: '초보자 모드',
  'problem-discovery': '문제 발굴 모드',
  team: '팀 온보딩 모드',
};

export const OnboardingModeBadge: React.FC<OnboardingModeBadgeProps> = ({ mode }) => {
  return (
    <div className="fixed bottom-16 left-1/2 -translate-x-1/2 md:top-6 md:left-auto md:translate-x-0 md:right-36 lg:top-6 lg:right-36 z-50">
      <div className="px-4 py-2 bg-white/90 backdrop-blur-md border-2 border-gray-900 rounded-lg shadow-lg">
        <p className="text-sm font-medium" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
          온보딩 모드: <span className="text-gray-900">{MODE_LABELS[mode]}</span>
        </p>
      </div>
    </div>
  );
};

export default OnboardingModeBadge;
