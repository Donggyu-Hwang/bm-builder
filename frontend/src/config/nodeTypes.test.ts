/**
 * Node Types Configuration Tests
 */

import { describe, it, expect } from 'vitest';
import {
  NODE_TYPES,
  isNodeType,
  getNodeTypeById,
  getNodeTypeByStage,
  getVisibleNodeTypes,
  getVisibleStageCount,
} from './nodeTypes';

describe('nodeTypes', () => {
  describe('NODE_TYPES', () => {
    it('should have 7 stages defined', () => {
      expect(NODE_TYPES).toHaveLength(7);
    });

    it('should have all required properties for each node type', () => {
      NODE_TYPES.forEach((nodeType) => {
        expect(nodeType).toHaveProperty('id');
        expect(nodeType).toHaveProperty('label');
        expect(nodeType).toHaveProperty('stage');
        expect(nodeType).toHaveProperty('color');
        expect(nodeType).toHaveProperty('icon');
        expect(nodeType).toHaveProperty('description');
        expect(nodeType).toHaveProperty('unlockedAtStage');
      });
    });

    it('should have stages numbered 1-7', () => {
      const stages = NODE_TYPES.map((type) => type.stage);
      expect(stages).toContain(1);
      expect(stages).toContain(2);
      expect(stages).toContain(3);
      expect(stages).toContain(4);
      expect(stages).toContain(5);
      expect(stages).toContain(6);
      expect(stages).toContain(7);
    });

    it('should have unique IDs', () => {
      const ids = NODE_TYPES.map((type) => type.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have colors in hex format', () => {
      NODE_TYPES.forEach((nodeType) => {
        expect(nodeType.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
      });
    });

    it('should have valid stage 1 colors and labels', () => {
      const stage1 = NODE_TYPES.find((type) => type.stage === 1);
      expect(stage1).toBeDefined();
      expect(stage1?.label).toBe('문제 발굴');
      expect(stage1?.color).toBe('#ef4444');
      expect(stage1?.icon).toBe('🔍');
      expect(stage1?.unlockedAtStage).toEqual([1, 2, 3, 4, 5, 6, 7]);
    });

    it('should have valid stage 3 colors and labels (WCAG compliant)', () => {
      const stage3 = NODE_TYPES.find((type) => type.stage === 3);
      expect(stage3).toBeDefined();
      expect(stage3?.label).toBe('고객 개발');
      expect(stage3?.color).toBe('#b45309'); // Amber-700 (WCAG 2.1 AA compliant)
      expect(stage3?.icon).toBe('👥');
      expect(stage3?.unlockedAtStage).toEqual([1, 2, 3, 4, 5, 6, 7]);
    });

    it('should have valid stage 7 colors and labels', () => {
      const stage7 = NODE_TYPES.find((type) => type.stage === 7);
      expect(stage7).toBeDefined();
      expect(stage7?.label).toBe('IR 자료');
      expect(stage7?.color).toBe('#a855f7');
      expect(stage7?.icon).toBe('📄');
      expect(stage7?.unlockedAtStage).toEqual([7]);
    });
  });

  describe('isNodeType', () => {
    it('should return true for valid node type', () => {
      const validType = NODE_TYPES[0];
      expect(isNodeType(validType)).toBe(true);
    });

    it('should return false for invalid values', () => {
      expect(isNodeType(null)).toBe(false);
      expect(isNodeType(undefined)).toBe(false);
      expect(isNodeType({})).toBe(false);
      expect(isNodeType({ id: 'test' })).toBe(false);
    });
  });

  describe('getNodeTypeById', () => {
    it('should return node type by valid ID', () => {
      const type = getNodeTypeById('problem-discovery');
      expect(type).toBeDefined();
      expect(type?.id).toBe('problem-discovery');
    });

    it('should return undefined for invalid ID', () => {
      const type = getNodeTypeById('invalid-id');
      expect(type).toBeUndefined();
    });
  });

  describe('getNodeTypeByStage', () => {
    it('should return node type by valid stage number', () => {
      const type = getNodeTypeByStage(1);
      expect(type).toBeDefined();
      expect(type?.stage).toBe(1);
    });

    it('should return undefined for invalid stage', () => {
      const type = getNodeTypeByStage(99);
      expect(type).toBeUndefined();
    });
  });

  describe('getVisibleNodeTypes', () => {
    it('should return all types when all stages unlocked', () => {
      const visible = getVisibleNodeTypes([1, 2, 3, 4, 5, 6, 7]);
      expect(visible).toHaveLength(7);
    });

    it('should return only first 3 stages initially', () => {
      const visible = getVisibleNodeTypes([1, 2, 3]);
      expect(visible.length).toBeGreaterThan(0);
      visible.forEach((type) => {
        expect(type.unlockedAtStage.includes(1) || type.unlockedAtStage.includes(2) || type.unlockedAtStage.includes(3)).toBe(true);
      });
    });

    it('should not show stage 4 when only stages 1-3 unlocked', () => {
      const visible = getVisibleNodeTypes([1, 2, 3]);
      const hasStage4 = visible.some((type) => type.stage === 4);
      expect(hasStage4).toBe(false);
      // Verify stage 4 requires stage 4 to be unlocked
      const stage4Type = NODE_TYPES.find((type) => type.stage === 4);
      expect(stage4Type?.unlockedAtStage.includes(4)).toBe(true);
      expect(stage4Type?.unlockedAtStage.includes(1, 2, 3)).not.toBe(true);
    });

    it('should show stage 4 when it is unlocked', () => {
      const visible = getVisibleNodeTypes([1, 2, 3, 4]);
      const hasStage4 = visible.some((type) => type.stage === 4);
      expect(hasStage4).toBe(true);
    });
  });

  describe('getVisibleStageCount', () => {
    it('should return 3 when stages 1-3 unlocked', () => {
      const count = getVisibleStageCount([1, 2, 3]);
      expect(count).toBe(3);
    });

    it('should return 7 when all stages unlocked', () => {
      const count = getVisibleStageCount([1, 2, 3, 4, 5, 6, 7]);
      expect(count).toBe(7);
    });
  });
});
