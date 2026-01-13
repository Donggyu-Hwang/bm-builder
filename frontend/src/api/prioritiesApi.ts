import axios from 'axios';
import type { PriorityItem } from '../types/priorities';
import { API_BASE_URL } from '../utils/constants';
import { isDemoMode } from '../utils/demoMode';

const API_URL = `${API_BASE_URL}/priorities`;

// Demo mode mock data
function getMockPriorities(): PriorityItem[] {
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

export async function generatePriorities(onboardingResponses: string): Promise<PriorityItem[]> {
  if (isDemoMode()) {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return getMockPriorities();
  }

  try {
    const response = await axios.post<{ priorities: PriorityItem[] }>(
      `${API_URL}/generate`,
      { onboardingResponses }
    );
    return response.data.priorities;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || '생성에 실패했습니다.');
    }
    throw new Error('알 수 없는 오류가 발생했습니다.');
  }
}

export async function getPriorities(): Promise<PriorityItem[]> {
  if (isDemoMode()) {
    return getMockPriorities();
  }

  try {
    const response = await axios.get<{ priorities: PriorityItem[] }>(`${API_URL}`);
    return response.data.priorities;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || '데이터를 가져오는데 실패했습니다.');
    }
    throw new Error('알 수 없는 오류가 발생했습니다.');
  }
}

export async function updatePriorities(priorities: PriorityItem[]): Promise<PriorityItem[]> {
  if (isDemoMode()) {
    alert('데모 모드에서는 저장이 불가능합니다. 가입 후 이용해주세요!');
    return priorities;
  }

  try {
    const response = await axios.put<{ priorities: PriorityItem[] }>(
      `${API_URL}`,
      { priorities }
    );
    return response.data.priorities;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || '업데이트에 실패했습니다.');
    }
    throw new Error('알 수 없는 오류가 발생했습니다.');
  }
}
