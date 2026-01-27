/**
 * Edge generation utilities for NodeCanvas
 */

import { Edge } from 'reactflow';
import { GeneratedDocument } from '../../api/generatedDocumentsApi';
import { Slide } from '../hooks/useNodeCanvasData';

export interface EdgeData {
  label?: string;
  type: 'sequential' | 'parallel' | 'conditional';
  dataFlow?: string;
  isMandatory: boolean;
  isAIConnection: boolean;
  sourceNode?: string;
  targetNode?: string;
  animated?: boolean;
}

export const generateInitialEdges = (
  document: GeneratedDocument | null,
  sections: Slide[]
): Edge<EdgeData>[] => {
  if (!document) return [];

  const edges: Edge<EdgeData>[] = [];
  let previousNodeId = 'start';
  let previousNodeLabel = '시작';

  sections.forEach((section, index) => {
    const sectionNodeId = `section-${section.id || index}`;
    const sectionLabel = section.title || `섹션 ${index + 1}`;

    edges.push({
      id: `edge-${previousNodeId}-${sectionNodeId}`,
      source: previousNodeId,
      target: sectionNodeId,
      type: section.ai_generated || document.ai_provider ? 'animated' : 'custom',
      data: {
        label: '다음 섹션',
        type: 'sequential',
        isMandatory: true,
        isAIConnection: false,
        sourceNode: previousNodeLabel,
        targetNode: sectionLabel,
        animated: section.ai_generated || document.ai_provider,
      },
      markerEnd: { type: 'arrowclosed' },
    });

    // AI generation edge
    if (section.ai_generated || document.ai_provider) {
      const aiNodeId = `ai-${section.id || index}`;
      edges.push({
        id: `edge-${sectionNodeId}-${aiNodeId}`,
        source: sectionNodeId,
        target: aiNodeId,
        type: 'animated',
        data: {
          label: 'AI 생성',
          type: 'parallel',
          isMandatory: true,
          isAIConnection: true,
          sourceNode: sectionLabel,
          targetNode: 'AI 생성',
          dataFlow: `AI에서 ${section.wordCount || 0}자 생성`,
          animated: true,
        },
        markerEnd: { type: 'arrowclosed' },
      });

      previousNodeId = aiNodeId;
      previousNodeLabel = 'AI 생성';
    } else {
      previousNodeId = sectionNodeId;
      previousNodeLabel = sectionLabel;
    }
  });

  // Connect to end node
  edges.push({
    id: `edge-${previousNodeId}-end`,
    source: previousNodeId,
    target: 'end',
    type: 'custom',
    data: {
      label: '완성',
      type: 'sequential',
      isMandatory: true,
      isAIConnection: false,
      sourceNode: previousNodeLabel,
      targetNode: '완성된 문서',
    },
    markerEnd: { type: 'arrowclosed' },
  });

  return edges;
};
