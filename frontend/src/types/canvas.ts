/**
 * Canvas type definitions
 * @module canvas
 */

import type { Node as ReactFlowNode, Edge as ReactFlowEdge } from 'reactflow';

export type OnboardingMode = 'beginner' | 'problem-discovery' | 'team';

export interface OnboardingState {
  mode: OnboardingMode;
  aiGuideEnabled: boolean;
  nodeCount: number;
  completed: boolean;
}

export interface ProgressiveDisclosureState {
  unlockedStages: number[];
  showAll: boolean;
}

export interface Node {
  id: string;
  type: string;
  stage: number;
  data: Record<string, unknown>;
  position: { x: number; y: number };
}

export interface NodeType {
  id: string;
  label: string;
  stage: number;
  color: string;
  icon: string;
  description: string;
  visibleAtStages: number[];
}

export type NodeTypesConfig = NodeType[];

export const ONBOARDING_STORAGE_KEY = 'bm_builder_onboarding';
export const ONBOARDING_MODE_STORAGE_KEY = 'bm_builder_onboarding_mode';
export const AI_GUIDE_TOGGLE_STORAGE_KEY = 'bm_builder_ai_guide_toggle';
