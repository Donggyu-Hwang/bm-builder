import React, { useMemo } from 'react';
import type { NodeTypesConfig } from '../../types/canvas';

// 7단계 린스타트업 노드 타입 정의
export const SEVEN_STAGES_NODE_TYPES: NodeTypesConfig = [
  {
    id: 'problem-discovery',
    label: '문제 발굴',
    stage: 1,
    color: '#ef4444',
    icon: '🔍',
    description: '해결하고 싶은 문제를 발견하세요',
    visibleAtStages: [1, 2, 3, 4, 5, 6, 7],
  },
  {
    id: 'problem-definition',
    label: '문제 정의',
    stage: 2,
    color: '#f97316',
    icon: '🎯',
    description: '문제를 명확하게 정의하고 타겟 사용자를 설정하세요',
    visibleAtStages: [1, 2, 3, 4, 5, 6, 7],
  },
  {
    id: 'customer-development',
    label: '고객 개발',
    stage: 3,
    color: '#eab308',
    icon: '👥',
    description: '타겟 고객을 이해하고 인터뷰를 진행하세요',
    visibleAtStages: [1, 2, 3, 4, 5, 6, 7],
  },
  {
    id: 'market-development',
    label: '시장 개발',
    stage: 4,
    color: '#22c55e',
    icon: '📊',
    description: 'TAM/SAM/SOM을 계산하고 시장 규모를 파악하세요',
    visibleAtStages: [2, 3, 4, 5, 6, 7],
  },
  {
    id: 'solution',
    label: '솔루션',
    stage: 5,
    color: '#3b82f6',
    icon: '💡',
    description: '문제 해결을 위한 솔루션을 설계하세요',
    visibleAtStages: [2, 3, 4, 5, 6, 7],
  },
  {
    id: 'business-model-canvas',
    label: '비즈니스 모델 캔버스',
    stage: 6,
    color: '#8b5cf6',
    icon: '📋',
    description: '9블록 비즈니스 모델을 작성하세요',
    visibleAtStages: [3, 4, 5, 6, 7],
  },
  {
    id: 'pitch-deck',
    label: 'IR 자료',
    stage: 7,
    color: '#ec4899',
    icon: '📊',
    description: '투자자 피칭용 IR 자료를 작성하세요',
    visibleAtStages: [4, 5, 6, 7],
  },
];

// Progressive Disclosure: 초기 3단계만 표시
export const INITIAL_NODE_TYPES = SEVEN_STAGES_NODE_TYPES.slice(0, 3);

// 노드 타입 ID로 검색
export const getNodeTypeById = (id: string) => {
  return SEVEN_STAGES_NODE_TYPES.find((type) => type.id === id);
};

// 스테이지별 노드 타입 필터링
export const getNodeTypesByStage = (stage: number, unlockedStages: number[] = [1, 2, 3]) => {
  return SEVEN_STAGES_NODE_TYPES.filter(
    (type) => type.visibleAtStages.includes(stage) && unlockedStages.includes(type.stage)
  );
};

// 모든 노드 타입 반환 (Progressive Disclosure 해제 후)
export const getAllNodeTypes = () => SEVEN_STAGES_NODE_TYPES;
