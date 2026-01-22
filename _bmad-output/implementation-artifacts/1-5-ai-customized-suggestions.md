# Story 1.5: AI 맞춤형 제안

**Epic:** Epic 1 - 사용자 인증 및 온보딩
**Story ID:** 1.5
**Status:** done
**Created:** 2026-01-18
**Last Updated:** 2026-01-18
**Dependencies:** Story 1.1 (프로젝트 초기화), Story 1.2 (OAuth 로그인), Story 1.3 (온보딩 플로우)

---

## ⚠️ IMPORTANT: Architecture Alignment

**Note:** This story has been adjusted to align with the project architecture document. The original epic mentioned GLM 4.7 fallback, but the architecture specifies **Claude 4.5 only for MVP**. GLM 4.7 is Post-MVP.

**Adjusted Requirements:**
- ✅ Claude 4.5 for AI suggestions (primary)
- ✅ 3 retries with Claude API
- ✅ Graceful error handling (fallback to manual priorities if AI fails)
- ❌ GLM 4.7 fallback removed (Post-MVP feature)

---

## 📋 User Story

**As a** 예비 창업가,
**I want** AI가 나의 상황에 맞는 우선순위를 제안해주길 원해서,
**So that** 무엇부터 시작해야 할지 명확해진다.

---

## ✅ Acceptance Criteria (BDD Format)

### Scenario 1: AI 우선순위 생성 (백그라운드)

**Given** 사용자가 온보딩을 완료했을 때
**When** AI가 제안을 생성하면 (백그라운드 비동기)
**Then** 프로그레시브 스트리밍으로 10초 이내 첫 응답이 표시된다

### Scenario 2: 데이터베이스 저장

**And** 제안이 `daily_priorities` 테이블에 저장된다:
- `user_id` (UUID)
- `priorities` (JSONB: [{id, title, description, order}])
- `created_at` (timestamp)
- `source` (text: "ai_suggestion")

### Scenario 3: 대시보드 표시

**And** 제안이 다음 형식으로 대시보드에 표시된다:
- "오늘의 추천 우선순위:"
- 1. [타겟 고객 인터뷰 질문지 작성]
- 2. [경쟁사 분석 보고서]
- 3. [MVP 기능 명세서]

### Scenario 4: 수동 조정 가능

**And** 사용자가 우선순위를 수동으로 조정할 수 있다:
- Drag & drop으로 순서 변경
- 항목 삭제
- 항목 추가
- "저장" 버튼으로 변경사항 저장

### Scenario 5: AI 실패 처리 (조정됨)

**And** Claude API 호출 실패 시:
- 3회 재시도 (exponential backoff: 1s, 2s, 4s)
- 3회 실패 시 "제안 생성에 실패했습니다. 나중에 다시 시도해주세요." 메시지
- 수동으로 우선순위를 추가할 수 있는 UI 제공

### Scenario 6: 일반적인 제안 처리

**And** 제안이 너무 일반적이면:
- "더 구체적인 정보를 입력하시면 맞춤형 제안을 드릴게요!" 안내
- 온보딩 재수행 권장 (Settings → 온보딩 다시하기)

---

## 🏗️ Developer Context - Critical Implementation Guide

### 🔴 CRITICAL: First AI Integration Story

**This is the FIRST AI integration point.** All future AI features will build on this pattern. Establish a solid foundation for:
- Claude API integration
- Error handling & retries
- Progressive streaming UI
- Fallback UX

### 📁 File Structure Requirements

**AI Priority Components:**
```
frontend/src/
├── api/
│   ├── claudeApi.ts                # ✅ Claude API client
│   └── prioritiesApi.ts            # ✅ Priorities CRUD
├── components/
│   └── priorities/
│       ├── PrioritiesList.tsx      # ✅ Display priorities
│       ├── PriorityItem.tsx        # ✅ Single priority (draggable)
│       └── AddPriorityModal.tsx    # ✅ Manual add
├── store/
│   └── slices/
│       └── prioritiesSlice.ts      # ✅ Priorities state
└── hooks/
    └── useClaude.ts                # ✅ Claude hook

backend/src/
├── services/
│   └── claude.service.ts           # ✅ Claude API integration
└── routes/v1/
    └── priorities.routes.ts        # ✅ Priorities endpoints
```

---

## 🛠️ Technical Requirements

### 1. Database Schema Setup

#### 1.1 Create daily_priorities Table

**Create backend/PostgreSQL/migrations/20240118000006_create_daily_priorities.sql:**
```sql
-- Create daily_priorities table
CREATE TABLE IF NOT EXISTS public.daily_priorities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  priorities JSONB NOT NULL DEFAULT '[]'::jsonb,
  source TEXT NOT NULL DEFAULT 'manual', -- 'ai_suggestion' or 'manual'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.daily_priorities ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own priorities"
ON public.daily_priorities
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own priorities"
ON public.daily_priorities
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own priorities"
ON public.daily_priorities
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own priorities"
ON public.daily_priorities
FOR DELETE
USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS daily_priorities_user_id_idx ON public.daily_priorities(user_id);
CREATE INDEX IF NOT EXISTS daily_priorities_created_at_idx ON public.daily_priorities(created_at);

-- Trigger for updated_at
CREATE TRIGGER update_daily_priorities_updated_at
BEFORE UPDATE ON public.daily_priorities
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

**Push migration:**
```bash
cd backend/PostgreSQL
PostgreSQL db push
```

### 2. Backend Implementation

#### 2.1 Create Claude Service

**Create backend/src/services/claude.service.ts:**
```typescript
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
        if (content.type === 'text') {
          const priorities = this.parsePriorities(content.text);
          return { priorities };
        }

        throw new Error('Unexpected response type');
      } catch (error) {
        const isLastAttempt = attempt === 3;

        if (!isLastAttempt) {
          // Exponential backoff: 1s, 2s, 4s
          const backoffTime = Math.pow(2, attempt - 1) * 1000;
          console.log(`Attempt ${attempt} failed, retrying in ${backoffTime}ms...`);
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

      const parsed = JSON.parse(jsonStr);

      if (parsed.priorities && Array.isArray(parsed.priorities)) {
        return parsed.priorities.map((p: any, index: number) => ({
          id: `priority-${Date.now()}-${index}`,
          title: p.title || `우선순위 ${index + 1}`,
          description: p.description || '',
          order: index,
        }));
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
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const claudeService = new ClaudeService();
```

#### 2.2 Create Priorities Routes

**Create backend/src/routes/v1/priorities.routes.ts:**
```typescript
import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';
import { claudeService } from '../services/claude.service';
import { PostgreSQLAdmin } from '../utils/PostgreSQLAdmin';

const router = Router();

// Generate AI priorities
router.post('/generate', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { vision, target_customer, current_stage } = req.body;

    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: '인증이 필요합니다' },
      });
    }

    // Generate priorities using Claude
    const { priorities, error } = await claudeService.generatePriorities({
      vision,
      targetCustomer: target_customer,
      current_stage,
    });

    // Save to database
    const { data, error: dbError } = await PostgreSQLAdmin
      .from('daily_priorities')
      .upsert({
        user_id: req.user.id,
        priorities,
        source: error ? 'manual' : 'ai_suggestion',
      });

    if (dbError) {
      return res.status(500).json({
        success: false,
        error: { code: 'DB_ERROR', message: '저장 실패' },
      });
    }

    res.json({
      success: true,
      data: { priorities, error },
    });
  } catch (error) {
    console.error('Error generating priorities:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: '제안 생성 실패' },
    });
  }
});

// Get current priorities
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: '인증이 필요합니다' },
      });
    }

    const { data, error } = await PostgreSQLAdmin
      .from('daily_priorities')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      return res.json({
        success: true,
        data: { priorities: [] },
      });
    }

    res.json({
      success: true,
      data: { priorities: data?.priorities || [], source: data?.source },
    });
  } catch (error) {
    console.error('Error fetching priorities:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: '조회 실패' },
    });
  }
});

// Update priorities
router.put('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { priorities } = req.body;

    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: '인증이 필요합니다' },
      });
    }

    const { data, error } = await PostgreSQLAdmin
      .from('daily_priorities')
      .upsert({
        user_id: req.user.id,
        priorities,
        source: 'manual',
      });

    if (error) {
      return res.status(500).json({
        success: false,
        error: { code: 'DB_ERROR', message: '저장 실패' },
      });
    }

    res.json({
      success: true,
      data: { priorities },
    });
  } catch (error) {
    console.error('Error updating priorities:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: '저장 실패' },
    });
  }
});

export default router;
```

#### 2.3 Register Priorities Routes

**Update backend/src/index.ts:**
```typescript
import prioritiesRoutes from './routes/v1/priorities.routes';

// Register routes
app.use('/api/v1/priorities', prioritiesRoutes);
```

### 3. Frontend Implementation

#### 3.1 Create Priorities API Layer

**Create frontend/src/api/prioritiesApi.ts:**
```typescript
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface Priority {
  id: string;
  title: string;
  description: string;
  order: number;
}

interface GeneratePrioritiesRequest {
  vision: string;
  target_customer: string;
  current_stage: 'idea' | 'prototype' | 'mvp' | 'growth';
}

export const prioritiesApi = {
  /**
   * Generate AI priorities
   */
  async generate(input: GeneratePrioritiesRequest): Promise<{
    data: { priorities: Priority[]; error?: string } | null;
    error: Error | null;
  }> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/v1/priorities/generate`,
        input
      );
      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },

  /**
   * Get current priorities
   */
  async get(): Promise<{
    data: { priorities: Priority[]; source: string } | null;
    error: Error | null;
  }> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/v1/priorities`);
      return { data: response.data.data, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },

  /**
   * Update priorities
   */
  async update(priorities: Priority[]): Promise<{
    data: { priorities: Priority[] } | null;
    error: Error | null;
  }> {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/v1/priorities`,
        { priorities }
      );
      return { data: response.data.data, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },
};
```

#### 3.2 Create Redux Priorities Slice

**Create frontend/src/store/slices/prioritiesSlice.ts:**
```typescript
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { Priority } from '@/api/prioritiesApi';
import { prioritiesApi } from '@/api/prioritiesApi';
import { selectOnboarding } from './onboardingSlice';

interface PrioritiesState {
  items: Priority[];
  source: 'ai_suggestion' | 'manual';
  loading: boolean;
  generating: boolean;
  error: string | null;
  aiError?: string;
}

const initialState: PrioritiesState = {
  items: [],
  source: 'manual',
  loading: false,
  generating: false,
  error: null,
};

// Async thunks
export const loadPriorities = createAsyncThunk(
  'priorities/loadPriorities',
  async (_, { rejectWithValue }) => {
    const { data, error } = await prioritiesApi.get();

    if (error) {
      return rejectWithValue(error.message);
    }

    return data;
  }
);

export const generatePriorities = createAsyncThunk(
  'priorities/generatePriorities',
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as { onboarding: { responses: any } };
    const { responses } = state.onboarding;

    if (!responses.vision || !responses.target_customer || !responses.current_stage) {
      return rejectWithValue('온보딩 정보가 부족합니다');
    }

    const { data, error } = await prioritiesApi.generate({
      vision: responses.vision,
      target_customer: responses.target_customer,
      current_stage: responses.current_stage,
    });

    if (error) {
      return rejectWithValue(error.message);
    }

    return data;
  }
);

export const updatePriorities = createAsyncThunk(
  'priorities/updatePriorities',
  async (priorities: Priority[], { rejectWithValue }) => {
    const { data, error } = await prioritiesApi.update(priorities);

    if (error) {
      return rejectWithValue(error.message);
    }

    return data;
  }
);

// Slice
const prioritiesSlice = createSlice({
  name: 'priorities',
  initialState,
  reducers: {
    reorderPriority: (state, action: PayloadAction<{ fromIndex: number; toIndex: number }>) => {
      const { fromIndex, toIndex } = action.payload;
      const [movedItem] = state.items.splice(fromIndex, 1);
      state.items.splice(toIndex, 0, movedItem);
      // Update order
      state.items.forEach((item, index) => {
        item.order = index;
      });
    },
    addPriority: (state, action: PayloadAction<Omit<Priority, 'id' | 'order'>>) => {
      const newPriority: Priority = {
        id: `priority-${Date.now()}`,
        ...action.payload,
        order: state.items.length,
      };
      state.items.push(newPriority);
    },
    removePriority: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
      // Reorder remaining items
      state.items.forEach((item, index) => {
        item.order = index;
      });
    },
    clearError: (state) => {
      state.error = null;
      state.aiError = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      // loadPriorities
      .addCase(loadPriorities.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadPriorities.fulfilled, (state, action) => {
        if (action.payload) {
          state.items = action.payload.priorities;
          state.source = action.payload.source as 'ai_suggestion' | 'manual';
        }
        state.loading = false;
      })
      .addCase(loadPriorities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // generatePriorities
      .addCase(generatePriorities.pending, (state) => {
        state.generating = true;
        state.aiError = undefined;
      })
      .addCase(generatePriorities.fulfilled, (state, action) => {
        if (action.payload) {
          state.items = action.payload.priorities;
          state.source = 'ai_suggestion';
          state.aiError = action.payload.error;
        }
        state.generating = false;
      })
      .addCase(generatePriorities.rejected, (state, action) => {
        state.generating = false;
        state.error = action.payload as string;
      })

      // updatePriorities
      .addCase(updatePriorities.fulfilled, (state, action) => {
        if (action.payload) {
          state.items = action.payload.priorities;
          state.source = 'manual';
        }
      });
  },
});

export const { reorderPriority, addPriority, removePriority, clearError } = prioritiesSlice.actions;

export default prioritiesSlice.reducer;
```

#### 3.3 Create Priorities Components

**Create frontend/src/components/priorities/PriorityItem.tsx:**
```typescript
import React from 'react';
import type { Priority } from '@/api/prioritiesApi';

interface PriorityItemProps {
  priority: Priority;
  index: number;
  onDelete: (id: string) => void;
}

export const PriorityItem: React.FC<PriorityItemProps> = ({ priority, index, onDelete }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold">
            {index + 1}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-medium text-gray-900">
            {priority.title}
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            {priority.description}
          </p>
        </div>
        <button
          onClick={() => onDelete(priority.id)}
          className="flex-shrink-0 text-gray-400 hover:text-red-600"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};
```

**Create frontend/src/components/priorities/PrioritiesList.tsx:**
```typescript
import React from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectPriorities, removePriority, updatePriorities } from '@/store/slices/prioritiesSlice';
import { PriorityItem } from './PriorityItem';

export const PrioritiesList: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items, generating, aiError } = useAppSelector(selectPriorities);

  const handleDelete = (id: string) => {
    dispatch(removePriority(id));
    // Auto-save after deletion
    const updatedItems = items.filter(item => item.id !== id);
    dispatch(updatePriorities(updatedItems) as any);
  };

  if (generating) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-600">AI가 맞춤형 제안을 생성 중입니다...</p>
        <p className="text-sm text-gray-500 mt-2">10초 이내 완료됩니다</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-600">아직 우선순위가 없습니다.</p>
        <p className="text-sm text-gray-500 mt-2">AI가 제안을 생성하거나 직접 추가해주세요.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {aiError && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-900 font-medium">{aiError}</p>
          <p className="text-sm text-yellow-700 mt-2">
            온보딩 정보를 더 구체적으로 입력하면 더 좋은 제안을 받을 수 있어요!
          </p>
        </div>
      )}

      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {items.length === 3 ? '오늘의 추천 우선순위' : '우선순위'}
      </h3>

      {items.map((priority, index) => (
        <PriorityItem
          key={priority.id}
          priority={priority}
          index={index}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
};
```

#### 3.4 Update Dashboard Page

**Update frontend/src/pages/DashboardPage.tsx:**
```typescript
import { useEffect } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { loadPriorities, generatePriorities, selectPriorities } from '@/store/slices/prioritiesSlice';

export const DashboardPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items, loading, source } = useAppSelector(selectPriorities);

  useEffect(() => {
    // Load existing priorities
    dispatch(loadPriorities() as any);

    // If no priorities exist, generate AI suggestions
    if (items.length === 0 && !loading) {
      dispatch(generatePriorities() as any);
    }
  }, [dispatch]);

  // ... rest of dashboard
  return (
    <>
      <WelcomeModal />
      <div className="min-h-screen bg-gray-50">
        {/* ... nav ... */}

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <PrioritiesList />
          </div>
        </main>
      </div>
    </>
  );
};
```

---

## 🚫 Anti-Patterns to Avoid

### ❌ Forbidden: Blocking UI During AI Generation

```typescript
// ❌ BAD: UI freezes during AI call
const handleGenerate = async () => {
  const result = await api.generate(); // Blocks UI
  setPriorities(result);
};

// ✅ GOOD: Show loading state
const { generating } = useAppSelector(selectPriorities);

if (generating) {
  return <LoadingSpinner />;
}
```

### ❌ Forbidden: No Retry Logic

```typescript
// ❌ BAD: Single attempt, fails on network hiccup
const response = await anthropic.messages.create({...});

// ✅ GOOD: Retry with exponential backoff
for (let attempt = 1; attempt <= 3; attempt++) {
  try {
    return await anthropic.messages.create({...});
  } catch (error) {
    if (attempt === 3) throw error;
    await sleep(Math.pow(2, attempt - 1) * 1000);
  }
}
```

### ❌ Forbidden: Crashing on Bad AI Response

```typescript
// ❌ BAD: Assumes perfect JSON
const parsed = JSON.parse(response);
return parsed.priorities;

// ✅ GOOD: Graceful fallback
try {
  const parsed = JSON.parse(response);
  return parsed.priorities;
} catch (error) {
  return getDefaultPriorities(); // Fallback
}
```

---

## ✅ Verification Steps

### 1. AI Generation Verification

**Steps:**
1. Complete onboarding
2. Navigate to dashboard
3. **Expected:** Loading spinner shown while AI generates
4. **Expected:** Within 10 seconds, 3 priorities appear

### 2. Database Verification

**Check PostgreSQL:**
1. Go to Table Editor → daily_priorities
2. Verify record created with:
   - user_id matches current user
   - priorities JSONB array with 3 items
   - source = 'ai_suggestion'

### 3. Manual Adjustment Verification

**Steps:**
1. Delete a priority item
2. **Expected:** Item removed, auto-saved to database
3. Refresh page
4. **Expected:** Deletion persisted

### 4. Error Handling Verification

**Steps:**
1. Temporarily set CLAUDE_API_KEY to invalid value
2. Restart backend
3. Navigate to dashboard
4. **Expected:** Error message shown, default priorities provided

---

## 🎯 Success Criteria

### ✅ Must Have (Blockers)

1. **AI Integration:** Claude 4.5 API successfully called
2. **Retry Logic:** 3 retries with exponential backoff
3. **Loading State:** Progress indicator during generation
4. **Database Storage:** Priorities saved to daily_priorities table
5. **Manual CRUD:** Add, remove, reorder priorities
6. **Error Handling:** Graceful fallback on AI failure

### 📋 Should Have (Important)

1. **10-Second Target:** First response within 10 seconds
2. **Personalization:** Priorities reflect onboarding responses
3. **Auto-Save:** Manual changes auto-saved
4. **Source Tracking:** Distinguish AI vs manual priorities
5. **UX Polish:** Smooth animations and transitions

---

## 📚 References

**Previous Stories:**
- **Story 1.1:** 프로젝트 초기화 (database setup)
- **Story 1.2:** OAuth 로그인 (auth required)
- **Story 1.3:** 온보딩 플로우 (provides input data)

**Next Stories:**
- **Story 1.6:** 데모 모드 (alternative experience)
- **Story 1.7:** 학습 지원 (business terms tooltips)

**External Dependencies:**
- **Anthropic SDK:** `@anthropic-ai/sdk`
- **Claude API Docs:** https://docs.anthropic.com/

---

## ✅ Story Completion Checklist

- [ ] daily_priorities table created with migrations
- [ ] Backend claude.service.ts created
- [ ] Backend priorities routes created
- [ ] Frontend prioritiesApi.ts created
- [ ] Frontend prioritiesSlice.ts created
- [ ] PriorityItem component created
- [ ] PrioritiesList component created
- [ ] Dashboard updated with priorities
- [ ] AI generation tested with real Claude API
- [ ] Retry logic verified
- [ ] Error handling tested
- [ ] Manual CRUD operations tested
- [ ] Database records verified
- [ ] 10-second generation target met

---

**Status:** ready-for-dev
**Ready for:** Dev Agent Implementation
**Next Story:** Story 1.6 - 데모 모드
