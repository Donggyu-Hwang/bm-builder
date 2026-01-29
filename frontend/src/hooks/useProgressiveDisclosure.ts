/**
 * Progressive Disclosure Hook
 *
 * Manages the visibility of Lean Startup stages based on user progress.
 * Initially shows only stages 1-3 to avoid overwhelming new users.
 * Unlocks additional stages as users progress through the methodology.
 *
 * Usage:
 * ```tsx
 * const { unlockedStages, visibleNodeTypes, unlockNextStage } = useProgressiveDisclosure();
 * ```
 */

import { useMemo } from 'react';
import { useAppSelector } from '../store/hooks';
import { selectUnlockedStages } from '../store/slices/onboardingSlice';
import { getVisibleNodeTypes, type NodeType } from '../config/nodeTypes';

export interface UseProgressiveDisclosureReturn {
  /** Array of currently unlocked stage numbers (e.g., [1, 2, 3]) */
  unlockedStages: number[];
  /** Filtered node types that are visible based on unlocked stages */
  visibleNodeTypes: NodeType[];
  /** Total number of stages available in the system */
  totalStages: number;
  /** Number of currently unlocked stages */
  unlockedCount: number;
  /** Percentage of stages unlocked (0-100) */
  progressPercentage: number;
  /** Whether all stages are unlocked */
  isFullyUnlocked: boolean;
  /** Whether next stage can be unlocked */
  canUnlockNext: boolean;
}

/**
 * Progressive disclosure hook for managing Lean Startup stage visibility
 *
 * Initially unlocks stages 1-3 for beginners.
 * As users complete nodes and progress, additional stages become available.
 *
 * @returns Object containing unlocked stages and related state
 */
export function useProgressiveDisclosure(): UseProgressiveDisclosureReturn {
  // Get unlocked stages from Redux store
  const unlockedStages = useAppSelector(selectUnlockedStages);

  // Memoize visible node types based on unlocked stages
  const visibleNodeTypes = useMemo(() => {
    return getVisibleNodeTypes(unlockedStages);
  }, [unlockedStages]);

  // Total stages in the Lean Startup methodology
  const totalStages = 7;

  // Calculate progress metrics
  const unlockedCount = unlockedStages.length;
  const progressPercentage = (unlockedCount / totalStages) * 100;
  const isFullyUnlocked = unlockedCount >= totalStages;
  const canUnlockNext = unlockedCount < totalStages;

  return {
    unlockedStages,
    visibleNodeTypes,
    totalStages,
    unlockedCount,
    progressPercentage,
    isFullyUnlocked,
    canUnlockNext,
  };
}

/**
 * Check if a specific node type is visible based on unlocked stages
 *
 * @param nodeType - Node type to check
 * @param unlockedStages - Currently unlocked stages
 * @returns Whether the node type is visible
 */
export function isNodeTypeVisible(
  nodeType: NodeType,
  unlockedStages: number[]
): boolean {
  return nodeType.unlockedAtStage.some((stage) => unlockedStages.includes(stage));
}

/**
 * Get the next stage to unlock
 *
 * @param unlockedStages - Currently unlocked stages
 * @returns Next stage number or null if all unlocked
 */
export function getNextStageToUnlock(unlockedStages: number[]): number | null {
  const maxStage = Math.max(...unlockedStages);
  return maxStage < 7 ? maxStage + 1 : null;
}
