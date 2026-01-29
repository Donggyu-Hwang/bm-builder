# Technical Specification: Epic 4 - AI Co-Founder 대화 경험

**Epic ID:** Epic-4
**Epic Name:** AI Co-Founder 대화 경험 (AI Co-Founder Conversational Experience)
**Status:** Ready for Development
**Last Updated:** 2026-01-28
**Author:** Technical Specification (YOLO Mode)

---

## 1. Overview

### 1.1 Problem Statement

**User Pain Points:**
- 노드 내용을 어떻게 작성할지 모름
- AI가 맥락을 이해하지 못하고 일반적인 질문만 함
- AI 제안을 빠르게 적용할 방법이 없음

### 1.2 Solution Approach

**Core Capabilities:**
1. **노드 사이드바:** 200ms 로딩, 우측 400px
2. **AI 맥락 인식:** 이전 노드 내용 기반 연속적 질문
3. **AI 제안 승인/거부:** 승인율 70% 목표

### 1.3 In/Out Scope

**In Scope:**
- 노드 사이드바 렌더링 (Story 4.1)
- AI 맥락 인식 대화 (Story 4.2)
- AI 제안 승인/거부 (Story 4.3)

**Out Scope:**
- 음성 대화 (텍스트만)
- 실시간 협업 (Post-MVP)

---

## 2. Context for Development

### 2.1 Files to Create/Modify

**New Files:**
1. `/Users/donggyu/bm-builder/frontend/src/components/canvas/NodeSidebar.tsx`
2. `/Users/donggyu/bm-builder/frontend/src/components/ai/AIChat.tsx`
3. `/Users/donggyu/bm-builder/frontend/src/components/ai/AISuggestionCard.tsx`
4. `/Users/donggyu/bm-builder/frontend/src/hooks/useAIChat.ts`
5. `/Users/donggyu/bm-builder/frontend/src/api/aiApi.ts`
6. `/Users/donggyu/bm-builder/backend/src/routes/v1/ai.routes.ts`
7. `/Users/donggyu/bm-builder/backend/src/services/claude.service.ts` (extend existing)

**Modified Files:**
1. `/Users/donggyu/bm-builder/backend/src/services/claudeWithFallback.service.ts` - Add context awareness

### 2.2 Technical Decisions

**Claude API Integration:**
- 200K token context window
- temperature: 0.7 (creativity balance)
- max_tokens: 500 (간결한 응답)

**API Response Format:**
```typescript
interface AIChatRequest {
  nodeId: string;
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>;
  currentNodeContent: string;
  allNodeContents: Array<{ nodeId: string; content: string }>;
}

interface AIChatResponse {
  success: true;
  data: {
    response: string;
    suggestions?: string[];
  };
}
```

---

## 3. Implementation Plan

### 3.1 Story 4.1: 노드 사이드바 렌더링

**Frontend Implementation:**

```typescript
// frontend/src/components/canvas/NodeSidebar.tsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface NodeSidebarProps {
  node: Node;
  onClose: () => void;
}

export function NodeSidebar({ node, onClose }: NodeSidebarProps) {
  const [activeTab, setActiveTab] = useState<'content' | 'ai'>('content');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading (200ms target)
    const timer = setTimeout(() => setIsLoading(false), 200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ duration: 0.3 }}
        className="fixed right-0 top-0 h-full w-[400px] bg-white shadow-2xl z-[900]"
      >
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center">
          <div>
            <h2 className="font-bold text-lg">{node.data.label}</h2>
            <div className="text-sm text-gray-600">
              Status: {node.data.status}
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('content')}
            className={`flex-1 py-3 ${activeTab === 'content' ? 'bg-blue-50 text-blue-600' : ''}`}
          >
            내용
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`flex-1 py-3 ${activeTab === 'ai' ? 'bg-blue-50 text-blue-600' : ''}`}
          >
            AI 대화
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {isLoading ? (
            <Skeleton />
          ) : (
            <>
              {activeTab === 'content' && (
                <div className="space-y-4">
                  <input
                    type="text"
                    defaultValue={node.data.label}
                    className="w-full p-2 border rounded"
                    placeholder="노드 제목"
                  />
                  <textarea
                    defaultValue={node.data.content}
                    className="w-full h-64 p-2 border rounded resize-none"
                    placeholder="내용을 입력하세요..."
                  />
                </div>
              )}
              {activeTab === 'ai' && <AIChat nodeId={node.id} />}
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
```

### 3.2 Story 4.2: AI 맥락 인식 대화

**Frontend Implementation:**

```typescript
// frontend/src/components/ai/AIChat.tsx
import { useAIChat } from '../../hooks/useAIChat';

export function AIChat({ nodeId }: { nodeId: string }) {
  const { messages, isLoading, sendMessage } = useAIChat(nodeId);

  return (
    <div className="flex flex-col h-full">
      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-lg ${
              msg.role === 'user'
                ? 'bg-gray-100 ml-8'
                : 'bg-blue-500 text-white mr-8'
            }`}
          >
            {msg.content}
          </div>
        ))}
        {isLoading && (
          <div className="bg-blue-500 text-white p-3 rounded-lg mr-8">
            AI가 내용을 생성하고 있습니다...
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const input = e.currentTarget.elements.namedItem('message') as HTMLInputElement;
            sendMessage(input.value);
            input.value = '';
          }}
          className="flex gap-2"
        >
          <input
            name="message"
            type="text"
            className="flex-1 p-2 border rounded"
            placeholder="질문 입력..."
          />
          <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">
            전송
          </button>
        </form>
      </div>
    </div>
  );
}
```

**Hook:**

```typescript
// frontend/src/hooks/useAIChat.ts
import { useState, useCallback } from 'react';
import { useAppSelector } from '../../store/hooks';
import { chatWithAI } from '../../api/aiApi';

export function useAIChat(nodeId: string) {
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const nodes = useAppSelector(state => state.canvas.nodes);

  const sendMessage = useCallback(async (userMessage: string) => {
    setIsLoading(true);

    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

    // Prepare conversation history with context
    const conversationHistory = [
      // Previous node contents
      ...nodes
        .filter(n => n.id !== nodeId)
        .map(n => ({ role: 'assistant' as const, content: `Node "${n.data.label}": ${n.data.content}` })),

      // Current chat history
      ...messages,

      // Current message
      { role: 'user' as const, content: userMessage }
    ];

    try {
      const response = await chatWithAI({
        nodeId,
        conversationHistory,
        currentNodeContent: nodes.find(n => n.id === nodeId)?.data.content || '',
        allNodeContents: nodes.map(n => ({ nodeId: n.id, content: n.data.content }))
      });

      if (response.success) {
        setMessages(prev => [...prev, { role: 'assistant', content: response.data.response }]);
      }
    } catch (error) {
      console.error('AI chat error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [nodeId, nodes, messages]);

  return { messages, isLoading, sendMessage };
}
```

**API Layer:**

```typescript
// frontend/src/api/aiApi.ts
import { axiosInstance } from './axios';

export async function chatWithAI(request: AIChatRequest) {
  const response = await axiosInstance.post<ApiResponse<AIChatResponse>>(
    '/api/v1/ai/chat',
    request
  );
  return response.data;
}
```

**Backend Implementation:**

```typescript
// backend/src/routes/v1/ai.routes.ts
import express from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { chatWithAI } from '../../services/claude.service';

const router = express.Router();

router.post('/chat', authenticate, async (req, res) => {
  try {
    const { nodeId, conversationHistory, currentNodeContent, allNodeContents } = req.body;

    const aiResponse = await chatWithAI({
      userId: req.userId,
      nodeId,
      conversationHistory,
      context: {
        currentNodeContent,
        allNodeContents
      }
    });

    res.json({ success: true, data: aiResponse });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'AI_ERROR', message: 'AI 서비스 오류가 발생했습니다' }
    });
  }
});

export default router;
```

```typescript
// backend/src/services/claude.service.ts (extend)
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

export async function chatWithAI(params: any) {
  const { conversationHistory, context } = params;

  // Build system prompt with context
  const systemPrompt = `
You are an AI Co-Founder helping a startup founder develop their idea through the Lean Startup methodology.

Context from previous nodes:
${context.allNodeContents.map((n: any) => `- Node "${n.nodeId}": ${n.content}`).join('\n')}

Current node content: ${context.currentNodeContent}

Instructions:
- Ask questions based on the Lean Startup framework
- Keep responses concise (under 500 tokens)
- Avoid technical jargon
- Be conversational and supportive
- Reference previous nodes when relevant
  `;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 500,
    temperature: 0.7,
    system: systemPrompt,
    messages: conversationHistory
  });

  return {
    response: response.content[0].type === 'text' ? response.content[0].text : ''
  };
}
```

### 3.3 Story 4.3: AI 제안 승인/거부

**Frontend Implementation:**

```typescript
// frontend/src/components/ai/AISuggestionCard.tsx
interface AISuggestionCardProps {
  suggestion: string;
  onApply: () => void;
  onEdit: () => void;
  onReject: (reason: string) => void;
}

export function AISuggestionCard({ suggestion, onApply, onEdit, onReject }: AISuggestionCardProps) {
  const [showRejectOptions, setShowRejectOptions] = useState(false);

  return (
    <div className="border-2 border-green-500 rounded-lg p-4 my-2">
      <h4 className="font-bold mb-2">AI 제안</h4>
      <p className="text-sm mb-4">{suggestion}</p>

      <div className="flex gap-2">
        <button
          onClick={onApply}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          적용
        </button>
        <button
          onClick={onEdit}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          편집
        </button>
        <button
          onClick={() => setShowRejectOptions(!showRejectOptions)}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          거부
        </button>
      </div>

      {showRejectOptions && (
        <div className="mt-4 space-y-2">
          <p className="text-sm font-bold">거부 이유를 선택해주세요:</p>
          {['너무 일반적입니다', '맥락에 맞지 않습니다', '이미 알고 있습니다', '기타'].map(reason => (
            <button
              key={reason}
              onClick={() => onReject(reason)}
              className="block w-full text-left px-3 py-2 hover:bg-gray-100 rounded"
            >
              {reason}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## 4. Acceptance Criteria

**AC 4.1.1:** 노드 클릭 시 우측 사이드바 200ms 이내 열림
**AC 4.2.1:** AI 질문 2초 이내 응답 시작, 5초 이내 완료
**AC 4.3.1:** AI 제안 적용 시 1초 이내 노드 내용 반영

---

## 5. Performance Targets

**NFR-003:** AI 응답 속도
- 짧은 질문(100자 이내): 2초 이내 응답 시작, 5초 이내 완료
- 긴 질문(100자 이상): 3초 이내 응답 시작, 10초 이내 완료

**NFR-007:** AI 비용 최적화
- 응답 캐싱: 단기 1시간 + 장기 벡터 DB
- Claude API 200K 토큰 윈도우

---

**Tech-spec-epic-4.md - Ready for Development** ✅
