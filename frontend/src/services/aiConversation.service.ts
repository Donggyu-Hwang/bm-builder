import { Node } from 'reactflow';
import type { CustomNodeData } from '../components/canvas/CustomNode';

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export interface AISuggestion {
  id: string;
  nodeId: string;
  content: string;
  context: string;
  timestamp: number;
  approved?: boolean;
}

class AIConversationService {
  private baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
  private apiKey = import.meta.env.VITE_CLAUDE_API_KEY || '';

  /**
   * Generate contextual AI conversation based on node content and canvas state
   * Story 4.2: AI 맥락 인식 대화
   */
  async generateContextualConversation(
    currentNode: Node,
    allNodes: Node[],
    userMessage: string
  ): Promise<string> {
    try {
      const currentNodeData = currentNode.data as CustomNodeData;

      // Build context from previous nodes
      const previousNodes = this.buildContextFromNodes(allNodes, currentNode.id);

      const prompt = this.buildContextualPrompt(currentNodeData, previousNodes, userMessage);

      // Call Claude API
      const response = await fetch(`${this.baseUrl}/ai/conversation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          prompt,
          currentNodeId: currentNode.id,
          context: {
            stage: currentNodeData.stage,
            label: currentNodeData.label,
            previousNodes,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate AI response');
      }

      const data = await response.json();

      // Progressive streaming (10초 첫 응답 목표)
      return this.streamResponse(data.response);
    } catch (error) {
      console.error('AI conversation error:', error);
      return '죄송합니다. AI 응답 생성 중 오류가 발생했습니다. 다시 시도해 주세요.';
    }
  }

  /**
   * Generate AI suggestion for improving node content
   * Story 4.3: AI 제안 승인
   */
  async generateSuggestion(currentNode: Node, allNodes: Node[]): Promise<AISuggestion> {
    try {
      const currentNodeData = currentNode.data as CustomNodeData;
      const previousNodes = this.buildContextFromNodes(allNodes, currentNode.id);

      const prompt = `다음은 린스타트업 캔버스의 노드 정보입니다:

현재 노드: ${currentNodeData.label} (Stage ${currentNodeData.stage})
내용: ${currentNodeData.content || '아직 작성되지 않음'}

이전 작업된 노드들:
${previousNodes.map((node) => `- ${node.label}: ${node.content || '내용 없음'}`).join('\n')}

이 ${currentNodeData.label} 노드를 개선할 수 있는 구체적이고 실행 가능한 제안을 3가지 제시해주세요.
각 제안은 다음 형식을 따르세요:
1. 제안 내용
2. 왜 필요한지 (이유)
3. 어떻게 개선할 수 있는지 (구체적 방법)

답변은 한국어로 작성해주세요.`;

      const response = await fetch(`${this.baseUrl}/ai/suggestion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          prompt,
          nodeId: currentNode.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate AI suggestion');
      }

      const data = await response.json();

      return {
        id: `suggestion-${Date.now()}`,
        nodeId: currentNode.id,
        content: data.suggestion,
        context: JSON.stringify(previousNodes),
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error('AI suggestion error:', error);
      throw error;
    }
  }

  /**
   * Stream AI response progressively (target: 10s first response)
   */
  private async streamResponse(fullResponse: string): Promise<string> {
    // Simulate progressive streaming
    const chunks = fullResponse.split('\n\n');
    let accumulated = '';

    for (const chunk of chunks) {
      accumulated += chunk + '\n\n';
      // In real implementation, you'd use Server-Sent Events or WebSocket
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    return accumulated;
  }

  /**
   * Build context from all previous nodes
   */
  private buildContextFromNodes(
    allNodes: Node[],
    currentNodeId: string
  ): Array<{ id: string; label: string; stage: number; content?: string }> {
    return allNodes
      .filter((node) => node.id !== currentNodeId)
      .map((node) => {
        const data = node.data as CustomNodeData;
        return {
          id: node.id,
          label: data.label,
          stage: data.stage,
          content: data.content as string | undefined,
        };
      })
      .sort((a, b) => a.stage - b.stage);
  }

  /**
   * Build contextual prompt for AI conversation
   */
  private buildContextualPrompt(
    currentNodeData: CustomNodeData,
    previousNodes: Array<{ id: string; label: string; stage: number; content?: string }>,
    userMessage: string
  ): string {
    return `당신은 린스타트업 방법론 전문가 AI 코파운더입니다.

현재 작업 중인 노드: ${currentNodeData.label} (Stage ${currentNodeData.stage})
설명: ${currentNodeData.description}

이전에 완료한 노드들:
${previousNodes.map((node) => `- Stage ${node.stage}: ${node.label}`).join('\n')}

사용자 질문: ${userMessage}

린스타트업 방법론에 기반하여, 현재 단계(${currentNodeData.label})에서 고려해야 할 핵심 사항들을 중심으로 답변해주세요.
이전 단계들의 맥락을 고려하고, 구체적이고 실행 가능한 조언을 제공해주세요.

답변은 한국어로 작성해주세요.`;
  }

  /**
   * Save conversation history for context retention
   */
  saveConversationHistory(nodeId: string, messages: AIMessage[]): void {
    try {
      const key = `conversation_${nodeId}`;
      localStorage.setItem(key, JSON.stringify(messages));
    } catch (error) {
      console.error('Failed to save conversation history:', error);
    }
  }

  /**
   * Load conversation history
   */
  loadConversationHistory(nodeId: string): AIMessage[] {
    try {
      const key = `conversation_${nodeId}`;
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Failed to load conversation history:', error);
      return [];
    }
  }
}

export default new AIConversationService();
