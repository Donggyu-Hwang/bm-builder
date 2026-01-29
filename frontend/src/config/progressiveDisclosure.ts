// Progressive Disclosure Configuration
// Initially shows only Stage 1-3 node types for simplified onboarding

import type { ProgressiveDisclosureState } from '../types/canvas';

export const INITIAL_UNLOCKED_STAGES = [1, 2, 3];

export const STAGE_CONFIG = {
  1: { name: '문제 발굴', icon: '🔍', color: '#ef4444' },
  2: { name: '문제 정의', icon: '🎯', color: '#f97316' },
  3: { name: '고객 개발', icon: '👥', color: '#b45309' }, // Amber-700 (WCAG compliant)
  4: { name: '시장 개발', icon: '📈', color: '#22c55e' },
  5: { name: '솔루션', icon: '💡', color: '#3b82f6' },
  6: { name: '비즈니스 모델', icon: '📊', color: '#6366f1' },
  7: { name: 'IR 자료', icon: '📄', color: '#a855f7' },
};

export const getInitialProgressiveState = (): ProgressiveDisclosureState => ({
  unlockedStages: INITIAL_UNLOCKED_STAGES,
  showAll: false,
});

export const unlockAllStages = (): ProgressiveDisclosureState => ({
  unlockedStages: [1, 2, 3, 4, 5, 6, 7],
  showAll: true,
});
