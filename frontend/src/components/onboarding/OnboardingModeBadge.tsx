import React from 'react';
import type { OnboardingMode } from '../../types/canvas';

interface OnboardingModeBadgeProps {
  mode: OnboardingMode;
  className?: string;
}

const MODE_LABELS: Record<OnboardingMode, string> = {
  beginner: '초보자 모드',
  'problem-discovery': '문제 발굴 모드',
  team: '팀 온보딩 모드',
};

const MODE_COLORS: Record<OnboardingMode, string> = {
  beginner: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  'problem-discovery': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  team: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
};

export const OnboardingModeBadge: React.FC<OnboardingModeBadgeProps> = ({
  mode,
  className = '',
}) => {
  return (
    <div
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${MODE_COLORS[mode]} ${className}`}
      role="status"
      aria-live="polite"
    >
      <span className="mr-1">온보딩 모드:</span>
      <span className="font-semibold">{MODE_LABELS[mode]}</span>
    </div>
  );
};
