// API Constants
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

// Onboarding Constants
export const ONBOARDING_STEPS = {
  1: { title: '비전', description: '당신의 비전은 무엇인가요?' },
  2: { title: '타겟', description: '타겟 고객은 누구인가요?' },
  3: { title: '현재 단계', description: '현재 어떤 단계인가요?' },
} as const;

export const BUSINESS_STAGES = [
  { value: 'idea', label: '아이디어 단계' },
  { value: 'prototype', label: '프로토타입 단계' },
  { value: 'mvp', label: 'MVP 단계' },
  { value: 'growth', label: '성장 단계' },
] as const;

export const DEMO_MODE_KEY = 'bm-builder-demo-mode';

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: '네트워크 오류가 발생했습니다. 다시 시도해주세요.',
  AUTH_ERROR: '로그인에 실패했습니다. 다시 시도해주세요.',
  VALIDATION_ERROR: '입력값을 확인해주세요.',
  UNKNOWN_ERROR: '알 수 없는 오류가 발생했습니다.',
  DEMO_MODE_SAVE: '데모 모드에서는 저장이 불가능합니다. 가입 후 이용해주세요!',
} as const;

// Tooltips
export const TOOLTIP_DELAY = 300; // ms
