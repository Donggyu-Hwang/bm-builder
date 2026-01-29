/**
 * Progressive Disclosure Hook Tests
 */

import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { Provider } from 'react-redux';
import { store } from '../store/index';
import { useProgressiveDisclosure, isNodeTypeVisible, getNextStageToUnlock } from './useProgressiveDisclosure';
import { NODE_TYPES } from '../config/nodeTypes';

// Wrapper for Redux provider
const wrapper = ({ children }: { children: React.ReactNode }) => {
  return <Provider store={store}>{children}</Provider>;
};

describe('useProgressiveDisclosure', () => {
  beforeEach(() => {
    // Reset store state before each test
    store.dispatch({ type: 'onboarding/resetOnboarding' });
  });

  it('should return initial unlocked stages [1, 2, 3]', () => {
    const { result } = renderHook(() => useProgressiveDisclosure(), { wrapper });

    expect(result.current.unlockedStages).toEqual([1, 2, 3]);
  });

  it('should return visible node types based on unlocked stages', () => {
    const { result } = renderHook(() => useProgressiveDisclosure(), { wrapper });

    expect(result.current.visibleNodeTypes.length).toBeGreaterThan(0);
    expect(result.current.visibleNodeTypes.length).toBeLessThanOrEqual(3);
  });

  it('should return total stages as 7', () => {
    const { result } = renderHook(() => useProgressiveDisclosure(), { wrapper });

    expect(result.current.totalStages).toBe(7);
  });

  it('should calculate correct unlocked count', () => {
    const { result } = renderHook(() => useProgressiveDisclosure(), { wrapper });

    expect(result.current.unlockedCount).toBe(3);
  });

  it('should calculate correct progress percentage', () => {
    const { result } = renderHook(() => useProgressiveDisclosure(), { wrapper });

    expect(result.current.progressPercentage).toBe((3 / 7) * 100);
  });

  it('should indicate not fully unlocked initially', () => {
    const { result } = renderHook(() => useProgressiveDisclosure(), { wrapper });

    expect(result.current.isFullyUnlocked).toBe(false);
    expect(result.current.canUnlockNext).toBe(true);
  });

  it('should update when onboarding is completed', () => {
    const { result } = renderHook(() => useProgressiveDisclosure(), { wrapper });

    act(() => {
      store.dispatch({ type: 'onboarding/setOnboardingCompleted' });
    });

    expect(result.current.unlockedStages).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(result.current.isFullyUnlocked).toBe(true);
    expect(result.current.canUnlockNext).toBe(false);
  });
});

describe('isNodeTypeVisible', () => {
  it('should return true for stage 1 when stages 1-3 unlocked', () => {
    const stage1Type = NODE_TYPES.find((type) => type.stage === 1)!;
    const visible = isNodeTypeVisible(stage1Type, [1, 2, 3]);

    expect(visible).toBe(true);
  });

  it('should return false for stage 4 when only stages 1-3 unlocked', () => {
    const stage4Type = NODE_TYPES.find((type) => type.stage === 4)!;
    const visible = isNodeTypeVisible(stage4Type, [1, 2, 3]);

    expect(visible).toBe(false);
  });

  it('should return true for stage 4 when stage 4 is unlocked', () => {
    const stage4Type = NODE_TYPES.find((type) => type.stage === 4)!;
    const visible = isNodeTypeVisible(stage4Type, [1, 2, 3, 4]);

    expect(visible).toBe(true);
  });
});

describe('getNextStageToUnlock', () => {
  it('should return 4 when stages 1-3 unlocked', () => {
    const nextStage = getNextStageToUnlock([1, 2, 3]);

    expect(nextStage).toBe(4);
  });

  it('should return 5 when stages 1-4 unlocked', () => {
    const nextStage = getNextStageToUnlock([1, 2, 3, 4]);

    expect(nextStage).toBe(5);
  });

  it('should return null when all stages unlocked', () => {
    const nextStage = getNextStageToUnlock([1, 2, 3, 4, 5, 6, 7]);

    expect(nextStage).toBeNull();
  });
});
