import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

export interface Priority {
  id: string;
  title: string;
  description: string;
  order: number;
}

export interface GeneratePrioritiesRequest {
  vision: string;
  targetCustomer: string;
  currentStage: 'idea' | 'prototype' | 'mvp' | 'growth';
}

export class ClaudeService {
  /**
   * Generate AI-powered priorities based on onboarding responses
   */
  async generatePriorities(input: GeneratePrioritiesRequest): Promise<{
    priorities: Priority[];
    error?: string;
  }> {
    const prompt = this.buildPrompt(input);

    // Retry logic: 3 attempts with exponential backoff
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const response = await anthropic.messages.create({
          model: 'claude-sonnet-4-5-20250114',
          max_tokens: 1000,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
        });

        const content = response.content[0];
        if (content && content.type === 'text') {
          const priorities = this.parsePriorities(content.text);
          return { priorities };
        }

        throw new Error('Unexpected response type');
      } catch (error) {
        const isLastAttempt = attempt === 3;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        if (!isLastAttempt) {
          // Exponential backoff: 1s, 2s, 4s
          const backoffTime = Math.pow(2, attempt - 1) * 1000;
          console.log(
            `Attempt ${attempt} failed: ${errorMessage}, retrying in ${backoffTime}ms...`
          );
          await this.sleep(backoffTime);
          continue;
        }

        // Last attempt failed
        console.error('All retry attempts failed:', error);
        return {
          priorities: this.getDefaultPriorities(),
          error: '제안 생성에 실패했습니다. 나중에 다시 시도해주세요.',
        };
      }
    }

    return {
      priorities: this.getDefaultPriorities(),
      error: '알 수 없는 오류가 발생했습니다.',
    };
  }

  /**
   * Build prompt for Claude
   */
  private buildPrompt(input: GeneratePrioritiesRequest): string {
    const stageMap = {
      idea: '아이디어',
      prototype: '프로토타입',
      mvp: 'MVP',
      growth: '성장',
    };

    return `당신은 창업 전문가 AI 코파일럿입니다.

사용자 정보:
- 비전: ${input.vision}
- 타겟 고객: ${input.targetCustomer}
- 현재 단계: ${stageMap[input.currentStage]}

위 정보를 바탕으로, 오늘 당장 시작할 수 있는 3가지 우선순위를 제안해주세요.

각 우선순위는 다음 형식을 따라주세요:
1. [제목] - [한 문장 설명]
2. [제목] - [한 문장 설명]
3. [제목] - [한 문장 설명]

제약사항:
- 구체적이고 실행 가능한 항목이어야 합니다
- 현재 단계('${stageMap[input.currentStage]}')에 적합한 항목이어야 합니다
- 각 항목은 한 문장으로 명확하게 설명해야 합니다
- 창업 초기 단계에 적합한 항목이어야 합니다 (예: 고객 인터뷰, 경쟁사 분석, MVP 기능 정의 등)

JSON 형식으로 응답해주세요:
{
  "priorities": [
    {"title": "...", "description": "..."},
    {"title": "...", "description": "..."},
    {"title": "...", "description": "..."}
  ]
}`;
  }

  /**
   * Parse Claude response into Priority objects
   */
  private parsePriorities(text: string): Priority[] {
    try {
      // Try to extract JSON from markdown code block
      const jsonMatch = text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : text;

      if (!jsonStr) {
        return [];
      }

      const parsed = JSON.parse(jsonStr);

      if (parsed.priorities && Array.isArray(parsed.priorities)) {
        return parsed.priorities.map((p: unknown, index: number) => {
          if (!p || typeof p !== 'object') {
            throw new Error('Invalid priority format');
          }

          const priority = p as { title?: string; description?: string };

          return {
            id: `priority-${Date.now()}-${index}`,
            title: priority.title || `우선순위 ${index + 1}`,
            description: priority.description || '',
            order: index,
          };
        });
      }

      throw new Error('Invalid response format');
    } catch (error) {
      console.error('Failed to parse priorities:', error);
      return this.getDefaultPriorities();
    }
  }

  /**
   * Get default priorities if AI fails
   */
  private getDefaultPriorities(): Priority[] {
    return [
      {
        id: `priority-${Date.now()}-1`,
        title: '타겟 고객 인터뷰 질문지 작성',
        description: '잠재 고객의 니즈를 파악하기 위한 인터뷰 질문을 준비하세요',
        order: 0,
      },
      {
        id: `priority-${Date.now()}-2`,
        title: '경쟁사 분석 보고서',
        description: '시장에 이미 존재하는 유사 서비스를 분석하고 차별점을 찾으세요',
        order: 1,
      },
      {
        id: `priority-${Date.now()}-3`,
        title: 'MVP 기능 명세서',
        description: '첫 번째 제품에 포함할 핵심 기능을 정의하세요',
        order: 2,
      },
    ];
  }

  /**
   * Sleep utility for retry backoff
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Generate document with streaming support
   */
  async generateDocument(params: {
    systemPrompt: string;
    userMessages: string[];
    maxTokens?: number;
    onProgress?: (progress: number, message: string) => void;
  }): Promise<string> {
    try {
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-5-20250114',
        max_tokens: params.maxTokens || 8192,
        system: params.systemPrompt,
        messages: params.userMessages.map((msg) => ({
          role: 'user' as const,
          content: msg,
        })),
      });

      const content = response.content[0];
      if (content && content.type === 'text') {
        return content.text;
      }

      throw new Error('Unexpected response type');
    } catch (error) {
      console.error('Claude API error:', error);
      throw new Error(`Failed to generate document: ${error}`);
    }
  }

  /**
   * Generate interview questions for a document template
   */
  async generateQuestions(templateType: string): Promise<string[]> {
    try {
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-5-20250114',
        max_tokens: 1024,
        system: `You are a helpful assistant that generates interview questions for document creation.
Generate 5-10 specific, relevant questions that will help gather information needed to create a ${templateType} document.
Each question should be clear and specific.
Return ONLY the questions, one per line, with no numbering or additional text.`,
        messages: [
          {
            role: 'user',
            content: `Generate 5-10 interview questions for a ${templateType} document. Return only the questions, one per line.`,
          },
        ],
      });

      const content = response.content[0];
      if (content && content.type === 'text') {
        return content.text
          .split('\n')
          .map((q: string) => q.trim())
          .filter((q: string) => q.length > 0)
          .filter((q: string) => !q.match(/^\d+[\.\)]/)) // Remove numbered lists
          .slice(0, 10); // Max 10 questions
      }

      return [];
    } catch (error) {
      console.error('Failed to generate questions:', error);
      // Return fallback questions if API fails
      return this.getFallbackQuestions(templateType);
    }
  }

  /**
   * Fallback questions for when Claude API is unavailable
   * MEDIUM FIX: Loaded from JSON file for better maintainability
   */
  private getFallbackQuestions(templateType: string): string[] {
    try {
      // Dynamically import JSON file
      const fallbackData = require('../../data/fallbackQuestions.json');
      return (
        fallbackData[templateType] || [
          '사업의 핵심 가치는 무엇인가요?',
          '타겟 시장은 어디인가요?',
          '주요 경쟁자는 누구인가요?',
          '매출 모델은 어떻게 되나요?',
          '성장 계획을 설명해주세요',
        ]
      );
    } catch (error) {
      console.error('Failed to load fallback questions from JSON:', error);
      // Return hardcoded default if JSON file is not available
      return [
        '사업의 핵심 가치는 무엇인가요?',
        '타겟 시장은 어디인가요?',
        '주요 경쟁자는 누구인가요?',
        '매출 모델은 어떻게 되나요?',
        '성장 계획을 설명해주세요',
      ];
    }
  }

  /**
   * Check if API key is configured
   * CRITICAL FIX: Enhanced validation to detect placeholder/invalid keys
   */
  isConfigured(): boolean {
    const key = process.env.CLAUDE_API_KEY;

    // Check if key exists
    if (!key) {
      return false;
    }

    // Check for common placeholder values
    const invalidPlaceholders = [
      'your-api-key',
      'your-claude-api-key',
      'sk-ant-api03',
      'sk-ant-ap03',
    ];

    const normalizedKey = key.toLowerCase().trim();
    if (invalidPlaceholders.some((placeholder) => normalizedKey.includes(placeholder))) {
      return false;
    }

    // Claude API keys should start with 'sk-ant-' and be at least 40 characters
    if (!key.startsWith('sk-ant-')) {
      return false;
    }

    if (key.length < 40) {
      return false;
    }

    return true;
  }
}

export const claudeService = new ClaudeService();
