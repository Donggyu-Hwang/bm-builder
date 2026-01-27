/**
 * Node generation utilities for NodeCanvas
 */

import { Node } from 'reactflow';
import { GeneratedDocument } from '../../api/generatedDocumentsApi';
import { Slide } from '../hooks/useNodeCanvasData';

export const generateInitialNodes = (
  document: GeneratedDocument | null,
  sections: Slide[]
): Node[] => {
  if (!document) return [];

  const nodes: Node[] = [];
  let yOffset = 0;

  // Start node
  nodes.push({
    id: 'start',
    type: 'start',
    position: { x: 250, y: yOffset },
    data: { label: '문서 시작' },
  });
  yOffset += 150;

  // Section nodes (or slides for pitch decks)
  sections.forEach((section) => {
    nodes.push({
      id: `section-${section.id || sections.indexOf(section)}`,
      type: 'section',
      position: { x: 250, y: yOffset },
      data: {
        label: section.title || `섹션 ${sections.indexOf(section) + 1}`,
        status: section.status || '완료',
        wordCount: section.content?.length || 0,
        lastEdited: section.updated_at || document.updated_at,
      },
    });
    yOffset += 150;

    // AI generation nodes if applicable
    if (section.ai_generated || document.ai_provider) {
      nodes.push({
        id: `ai-${section.id || sections.indexOf(section)}`,
        type: 'aiGeneration',
        position: { x: 550, y: yOffset - 100 },
        data: {
          label: 'AI 생성',
          provider: section.ai_provider || document.ai_provider || 'claude',
        },
      });
    }
  });

  // End node
  nodes.push({
    id: 'end',
    type: 'end',
    position: { x: 250, y: yOffset },
    data: { label: '완성된 문서' },
  });

  return nodes;
};
