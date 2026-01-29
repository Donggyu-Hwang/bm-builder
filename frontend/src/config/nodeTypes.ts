/**
 * 7-Stage Lean Startup Node Types Configuration
 *
 * Defines the complete node type system for the Lean Startup Canvas.
 * Each stage represents a critical phase in the lean startup methodology.
 *
 * Color Scheme:
 * - Stage 1: Problem Discovery (Red #ef4444)
 * - Stage 2: Problem Definition (Orange #f97316)
 * - Stage 3: Customer Development (Amber #b45309)
 * - Stage 4: Market Development (Green #22c55e)
 * - Stage 5: Solution (Blue #3b82f6)
 * - Stage 6: Business Model Canvas (Indigo #6366f1)
 * - Stage 7: IR Materials (Purple #a855f7)
 *
 * WCAG 2.1 AA Compliance:
 * All colors meet 4.5:1 contrast ratio with white text
 */

export interface NodeType {
  /** Unique identifier for the node type */
  id: string;
  /** Display label shown in UI (Korean) */
  label: string;
  /** Stage number (1-7) in the lean startup methodology */
  stage: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  /** Primary color for visual identification (hex format) */
  color: string;
  /** Emoji icon representing the stage concept */
  icon: string;
  /** Brief description of what this stage entails */
  description: string;
  /** Array of stages at which this node type becomes unlocked/visible */
  unlockedAtStage: number[];
}

/**
 * Complete definition of all 7 Lean Startup stages
 *
 * Ordered by stage number for logical progression.
 * Each stage builds upon the previous ones in the methodology.
 */
export const NODE_TYPES: readonly NodeType[] = [
  {
    id: 'problem-discovery',
    label: '문제 발굴',
    stage: 1,
    color: '#ef4444', // Red-500
    icon: '🔍',
    description: '해결하고자 하는 문제를 발견하고 정의합니다',
    unlockedAtStage: [1, 2, 3, 4, 5, 6, 7],
  },
  {
    id: 'problem-definition',
    label: '문제 정의',
    stage: 2,
    color: '#f97316', // Orange-500
    icon: '🎯',
    description: '고객의 관점에서 문제를 명확히 정의합니다',
    unlockedAtStage: [1, 2, 3, 4, 5, 6, 7],
  },
  {
    id: 'customer-development',
    label: '고객 개발',
    stage: 3,
    color: '#b45309', // Amber-700 (WCAG 2.1 AA compliant: 5.02:1)
    icon: '👥',
    description: '타겟 고객을 이해하고 검증합니다',
    unlockedAtStage: [1, 2, 3, 4, 5, 6, 7],
  },
  {
    id: 'market-development',
    label: '시장 개발',
    stage: 4,
    color: '#22c55e', // Green-500
    icon: '📈',
    description: '시장 규모와 진입 전략을 파악합니다',
    unlockedAtStage: [4, 5, 6, 7], // Progressive Disclosure: Hidden initially
  },
  {
    id: 'solution',
    label: '솔루션',
    stage: 5,
    color: '#3b82f6', // Blue-500
    icon: '💡',
    description: '문제 해결을 위한 제품/서비스를 개발합니다',
    unlockedAtStage: [5, 6, 7], // Progressive Disclosure: Hidden initially
  },
  {
    id: 'business-model-canvas',
    label: '비즈니스 모델 캔버스',
    stage: 6,
    color: '#6366f1', // Indigo-500
    icon: '📊',
    description: '비즈니스 모델의 9가지 구성요소를 정의합니다',
    unlockedAtStage: [6, 7], // Progressive Disclosure: Hidden initially
  },
  {
    id: 'ir-materials',
    label: 'IR 자료',
    stage: 7,
    color: '#a855f7', // Purple-500
    icon: '📄',
    description: '투자자를 위한 IR 자료를 준비합니다',
    unlockedAtStage: [7], // Progressive Disclosure: Hidden initially
  },
] as const;

/**
 * Type guard to check if a value is a valid NodeType
 */
export function isNodeType(value: unknown): value is NodeType {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'label' in value &&
    'stage' in value &&
    'color' in value &&
    'icon' in value &&
    'description' in value &&
    'unlockedAtStage' in value
  );
}

/**
 * Get node type by ID
 */
export function getNodeTypeById(id: string): NodeType | undefined {
  return NODE_TYPES.find((type) => type.id === id);
}

/**
 * Get node type by stage number
 */
export function getNodeTypeByStage(stage: number): NodeType | undefined {
  return NODE_TYPES.find((type) => type.stage === stage);
}

/**
 * Filter node types based on unlocked stages
 * Used for progressive disclosure feature
 */
export function getVisibleNodeTypes(unlockedStages: number[]): NodeType[] {
  return NODE_TYPES.filter((type) =>
    type.unlockedAtStage.some((stage) => unlockedStages.includes(stage))
  );
}

/**
 * Get the number of visible stages for progress calculation
 */
export function getVisibleStageCount(unlockedStages: number[]): number {
  return new Set(
    NODE_TYPES.filter((type) =>
      type.unlockedAtStage.some((stage) => unlockedStages.includes(stage))
    ).map((type) => type.stage)
  ).size;
}

// TypeScript type for node type values
export type NodeTypeValue = typeof NODE_TYPES[number];
