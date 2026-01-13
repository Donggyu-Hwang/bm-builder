import { DEMO_MODE_KEY } from './constants';
import type { User } from '@shared/types/user';
import type { PriorityItem } from '../types/priorities';

export function isDemoMode(): boolean {
  return (
    localStorage.getItem(DEMO_MODE_KEY) === 'true' ||
    new URLSearchParams(window.location.search).get('demo') === 'true'
  );
}

export function setDemoMode(enabled: boolean): void {
  if (enabled) {
    localStorage.setItem(DEMO_MODE_KEY, 'true');
  } else {
    localStorage.removeItem(DEMO_MODE_KEY);
  }
}

export function generateMockUser(): User {
  return {
    id: 'demo-user-id',
    email: 'demo@example.com',
    full_name: 'Demo User',
    avatar_url: null,
    onboarding_completed: true,
    created_at: new Date().toISOString(),
  };
}

export function generateMockPriorities(): PriorityItem[] {
  return [
    {
      id: '1',
      title: '고객 문제 정의',
      description: '타겟 고객이 겪고 있는 핵심 문제를 명확히 정의하고 검증하세요.',
      order: 1,
    },
    {
      id: '2',
      title: 'MVP 기능 명세',
      description: '최소 기능 제품(MVP)에 포함될 핵심 기능을 우선순위별로 정의하세요.',
      order: 2,
    },
    {
      id: '3',
      title: '시장 조사',
      description: '경쟁사 분석과 시장 규모 파악을 통해 비즈니스 잠재력을 평가하세요.',
      order: 3,
    },
    {
      id: '4',
      title: '고객 개발 전략',
      description: '早期 적용자(Early Adopters)를 찾기 위한 고객 개발 방법론을 수립하세요.',
      order: 4,
    },
    {
      id: '5',
      title: '프로토타입 제작',
      description: 'Paper prototype 또는 디지털 와이어프레임으로 빠르게 프로토타입을 만드세요.',
      order: 5,
    },
  ];
}

export function exitDemoMode(): void {
  localStorage.removeItem(DEMO_MODE_KEY);
  window.location.href = '/';
}
