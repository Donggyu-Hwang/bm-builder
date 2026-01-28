/**
 * Progressive Disclosure Configuration for Onboarding
 * Initially shows only Stage 1-3 node types
 */

export const INITIAL_UNLOCKED_STAGES = [1, 2, 3];

export const PROGRESSIVE_DISCLOSURE_CONFIG = {
  // Node types shown in each stage
  stage1: ['idea', 'problem', 'solution'],
  stage2: ['customer-segment', 'value-proposition', 'channel'],
  stage3: ['revenue-stream', 'cost-structure', 'key-metrics'],
  stage4: ['partners', 'activities', 'resources'],
  stage5: ['relationships', 'distribution', 'validation'],
  stage6: ['competition', 'advantage', 'growth'],
  stage7: ['pivot', 'scale', 'exit'],

  // Minimum nodes to create before unlocking next stage
  nodesToUnlockStage2: 3,
  nodesToUnlockStage3: 5,
  nodesToUnlockStage4: 7,
  nodesToUnlockStage5: 10,
  nodesToUnlockStage6: 15,
  nodesToUnlockStage7: 20,
};

export const getAvailableNodeTypes = (unlockedStages: number[]): string[] => {
  const nodeTypes: string[] = [];

  unlockedStages.forEach((stage) => {
    switch (stage) {
      case 1:
        nodeTypes.push(...PROGRESSIVE_DISCLOSURE_CONFIG.stage1);
        break;
      case 2:
        nodeTypes.push(...PROGRESSIVE_DISCLOSURE_CONFIG.stage2);
        break;
      case 3:
        nodeTypes.push(...PROGRESSIVE_DISCLOSURE_CONFIG.stage3);
        break;
      case 4:
        nodeTypes.push(...PROGRESSIVE_DISCLOSURE_CONFIG.stage4);
        break;
      case 5:
        nodeTypes.push(...PROGRESSIVE_DISCLOSURE_CONFIG.stage5);
        break;
      case 6:
        nodeTypes.push(...PROGRESSIVE_DISCLOSURE_CONFIG.stage6);
        break;
      case 7:
        nodeTypes.push(...PROGRESSIVE_DISCLOSURE_CONFIG.stage7);
        break;
    }
  });

  return [...new Set(nodeTypes)]; // Remove duplicates
};

export const shouldUnlockNextStage = (currentStage: number, nodeCount: number): boolean => {
  switch (currentStage) {
    case 1:
      return nodeCount >= PROGRESSIVE_DISCLOSURE_CONFIG.nodesToUnlockStage2;
    case 2:
      return nodeCount >= PROGRESSIVE_DISCLOSURE_CONFIG.nodesToUnlockStage3;
    case 3:
      return nodeCount >= PROGRESSIVE_DISCLOSURE_CONFIG.nodesToUnlockStage4;
    case 4:
      return nodeCount >= PROGRESSIVE_DISCLOSURE_CONFIG.nodesToUnlockStage5;
    case 5:
      return nodeCount >= PROGRESSIVE_DISCLOSURE_CONFIG.nodesToUnlockStage6;
    case 6:
      return nodeCount >= PROGRESSIVE_DISCLOSURE_CONFIG.nodesToUnlockStage7;
    default:
      return false;
  }
};
