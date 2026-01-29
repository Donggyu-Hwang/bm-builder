# Technical Specification: Epic 1 - AI Co-Founder와 함께 시작하기

**Epic ID:** Epic-1
**Epic Name:** AI Co-Founder와 함께 시작하기
**Status:** Ready for Development
**Last Updated:** 2026-01-28
**Author:** Technical Specification (YOLO Mode)

---

## 1. Overview

### 1.1 Problem Statement

**User Pain Points (from PRD):**
- 첫 방문자가 진입 경로를 찾지 못하고 이탈함
- 대시보드가 너무 일반적이라 노드 기능을 발견조차 어려움
- 온보딩 없이 빈 캔버스로 시작하면 당황함

**Root Cause:**
- 루트 경로(`/`)가 대시보드로 설정되어 캔버스 진입 불가
- 첫 방문자 온보딩 없음
- 7단계 시각화 부족

### 1.2 Solution Approach

**Hybrid Approach (PRD Journey 1):**
1. 로그인 → AI 인사 + Proactive 제안 (30초)
2. 사용자 선택 "린스타트업 7단계" → 간소화된 캔버스 진입
3. AI: "어떤 문제를 해결하고 싶으신가요?" (대화형 가이드)
4. 캔버스 중앙에 "문제 발굴" 노드 자동 생성 (AI 도움)
5. AI: "이 노드에 대해 2-3가지 질문드릴게요" (맥락 이해)
6. 10분 후: 첫 노드 완성 + 축하 이펙트 ✅
7. 점진적 확장: "다음 단계로 넘어갈까요?"

### 1.3 In/Out Scope

**In Scope (MVP):**
- AI 인사와 Proactive 제안 3가지 (Story 1.1)
- Adaptive 온보딩 모드 캔버스 (Story 1.2)
- AI 가이드와 함께 첫 노드 생성 (Story 1.3)
- 온보딩 완료 및 다음 단계 안내 (Story 1.4)
- 네트워크 오류 안내 (오프라인 모드 지원)

**Out Scope (Post-MVP):**
- 복잡한 온보딩 퀴즈 (간소화된 가이드만)
- 비디오 튜토리얼 (오버레이 가이드만)
- 7단계 전체 템플릿 (Progressive Disclosure로 3단계만)

---

## 2. Context for Development

### 2.1 Existing Codebase Patterns

**Frontend Structure:**
```
frontend/src/
├── pages/
│   ├── LoginPage.tsx
│   └── (NEW) LeanStartupCanvasPage.tsx
├── components/
│   ├── welcome/
│   │   ├── WelcomeModal.tsx (existing)
│   │   └── (NEW) AIWelcomeOverlay.tsx
│   ├── onboarding/
│   │   └── (NEW) OnboardingGuide.tsx
│   └── ui/
│       └── Modal.tsx (existing)
├── store/
│   └── slices/
│       └── (NEW) onboardingSlice.ts
├── hooks/
│   └── (NEW) useOnboarding.ts
└── types/
    └── (NEW) onboarding.types.ts
```

**Backend Structure:**
```
backend/src/
├── routes/v1/
│   ├── auth.routes.ts (existing)
│   └── (NEW) onboarding.routes.ts
├── services/
│   └── (NEW) onboarding.service.ts
└── middleware/
    └── auth.middleware.ts (existing)
```

**Shared Types:**
```
shared/types/
└── (NEW) onboarding.types.ts
```

### 2.2 Files to Create/Modify

**New Files (Frontend):**
1. `/Users/donggyu/bm-builder/frontend/src/components/onboarding/AIWelcomeOverlay.tsx`
2. `/Users/donggyu/bm-builder/frontend/src/components/onboarding/OnboardingGuide.tsx`
3. `/Users/donggyu/bm-builder/frontend/src/components/onboarding/OptionCard.tsx`
4. `/Users/donggyu/bm-builder/frontend/src/store/slices/onboardingSlice.ts`
5. `/Users/donggyu/bm-builder/frontend/src/hooks/useOnboarding.ts`
6. `/Users/donggyu/bm-builder/frontend/src/pages/LeanStartupCanvasPage.tsx`

**New Files (Backend):**
1. `/Users/donggyu/bm-builder/backend/src/routes/v1/onboarding.routes.ts`
2. `/Users/donggyu/bm-builder/backend/src/services/onboarding.service.ts`

**New Files (Shared):**
1. `/Users/donggyu/bm-builder/shared/types/onboarding.types.ts`

**Modified Files:**
1. `/Users/donggyu/bm-builder/frontend/src/App.tsx` - Add route for `/lean-startup-canvas`
2. `/Users/donggyu/bm-builder/backend/src/index.ts` - Register onboarding routes

### 2.3 Technical Decisions from Architecture.md

**Authentication:**
- JWT 토큰 기반 인증 (Supabase Auth 제거 완료)
- Passport.js OAuth 2.0 (Google, Naver)
- 모든 protected 라우트에 `authenticate` 미들웨어 적용

**State Management:**
- Redux Toolkit for 전역 상태 (onboarding 모드, 선택된 옵션)
- LocalStorage for 사용자 옵션 저장 (다음 방문 시 자동 적용)

**API Response Format:**
```typescript
type ApiResponse<T, E = ApiError> =
  | { success: true; data: T }
  | { success: false; error: E };
```

**Database (PostgreSQL):**
- `onboarding_responses` 테이블 (existing) 활용
- `user_preferences` 테이블 (existing)에 온보딩 모드 저장

**Performance Targets:**
- 페이지 로드: 2초 이내 (3G 네트워크 기준)
- 노드 생성: 500ms 이내
- 온보딩 완료: 10분 내 첫 노드 작성

---

## 3. Implementation Plan

### 3.1 Story 1.1: AI 인사와 사용자 상태 파악

**Technical Tasks:**

**Frontend:**

1. **AIWelcomeOverlay Component**
   - 파일: `/Users/donggyu/bm-builder/frontend/src/components/onboarding/AIWelcomeOverlay.tsx`
   - 역할: 첫 방문 시 AI 인사와 3가지 옵션 카드 표시
   - 기술 스택: React 19, TypeScript 5.3, Tailwind CSS 3.4
   - 주요 기능:
     - AI 인사 메시지: "안녕하세요! AI Co-Founder입니다"
     - 3가지 옵션 카드 수평 정렬
     - 옵션 1: "이미 스타트업 아이디어가 있어요"
     - 옵션 2: "아직 아이디어가 없어요"
     - 옵션 3: "팀과 함께하고 있어요"
     - "건너뛰기" 버튼 (우측 상단)

   ```typescript
   interface AIWelcomeOverlayProps {
     onOptionSelect: (option: OnboardingOption) => void;
     onSkip: () => void;
   }

   type OnboardingOption = 'has-idea' | 'no-idea' | 'with-team';
   ```

2. **온보딩 옵션 LocalStorage 저장**
   - 키: `bm_builder_onboarding_option`
   - 값: `{ option: OnboardingOption; timestamp: string }`
   - 만료: 30일

3. **오프라인 모드 감지**
   - `navigator.onLine` API 활용
   - `window.addEventListener('online')` / `offline`
   - 토스트 메시지: "오프라인 모드로 작동 중입니다"

**Backend:**

1. **onboarding.routes.ts**
   - 파일: `/Users/donggyu/bm-builder/backend/src/routes/v1/onboarding.routes.ts`
   - 엔드포인트:
     ```
     POST /api/v1/onboarding/option
     GET  /api/v1/onboarding/option
     ```

   ```typescript
   import express from 'express';
   import { authenticate } from '../../middleware/auth.middleware';
   import { saveOnboardingOption, getOnboardingOption } from '../../services/onboarding.service';

   const router = express.Router();

   router.post('/option', authenticate, async (req, res) => {
     try {
       const { option } = req.body;
       const result = await saveOnboardingOption(req.userId, option);
       res.json({ success: true, data: result });
     } catch (error) {
       res.status(500).json({ success: false, error: { code: 'SAVE_FAILED', message: error.message }});
     }
   });

   router.get('/option', authenticate, async (req, res) => {
     try {
       const option = await getOnboardingOption(req.userId);
       res.json({ success: true, data: option });
     } catch (error) {
       res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Option not found' }});
     }
   });
   ```

2. **onboarding.service.ts**
   - 파일: `/Users/donggyu/bm-builder/backend/src/services/onboarding.service.ts`
   - 기능: PostgreSQL에 온보딩 옵션 저장/조회

   ```typescript
   import { pool } from '../utils/db';

   export async function saveOnboardingOption(userId: string, option: string) {
     const query = `
       INSERT INTO onboarding_responses (user_id, response, created_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (user_id) DO UPDATE SET response = $2, created_at = NOW()
       RETURNING *
     `;
     const result = await pool.query(query, [userId, option]);
     return result.rows[0];
   }

   export async function getOnboardingOption(userId: string) {
     const query = `
       SELECT response FROM onboarding_responses WHERE user_id = $1
     `;
     const result = await pool.query(query, [userId]);
     return result.rows[0]?.response;
   }
   ```

**Database Schema:**

```sql
-- 기존 테이블 활용 (onboarding_responses)
-- 컬럼: user_id, response, created_at
```

---

### 3.2 Story 1.2: Adaptive 온보딩 모드 캔버스

**Technical Tasks:**

**Frontend:**

1. **OnboardingGuide Component**
   - 파일: `/Users/donggyu/bm-builder/frontend/src/components/onboarding/OnboardingGuide.tsx`
   - 역할: 간소화된 캔버스에서 AI 가이드 표시
   - 주요 기능:
     - "초보자 모드" / "문제 발굴 모드" / "팀 온보딩 모드" 표시
     - "AI 가이드 켜기/끄기" 토글 스위치
     - Progress Disclosure: 처음엔 3단계 노드 타입만 표시
     - 3개 이상 노드 생성 시 "온보딩 완료" 모달

   ```typescript
   interface OnboardingGuideProps {
     mode: OnboardingMode;
     onModeToggle: (enabled: boolean) => void;
     onComplete: () => void;
   }

   type OnboardingMode = 'beginner' | 'discovery' | 'team';
   ```

2. **onboardingSlice (Redux Toolkit)**
   - 파일: `/Users/donggyu/bm-builder/frontend/src/store/slices/onboardingSlice.ts`
   - 상태:
     ```typescript
     interface OnboardingState {
       mode: OnboardingMode;
       isGuideEnabled: boolean;
       unlockedStages: number[];
       completedNodes: number;
     }
     ```

3. **Progressive Disclosure 구현**
   - 기존 `nodeTypes.ts` 수정 (Story 2.1에서 구현)
   - `visibleAtStage` 속성 활용
   - 초기: Stage 1-3만 표시
   - 3개 완료 시 Stage 4 해제

**API Endpoints:**

```
GET /api/v1/onboarding/mode
POST /api/v1/onboarding/complete
```

---

### 3.3 Story 1.3: AI 가이드와 함께 첫 노드 생성

**Technical Tasks:**

**Frontend:**

1. **AI 질문 모드 컴포넌트**
   - 사이드바 형태 (우측 400px)
   - 3초 카운트다운 후 자동 시작
   - "지금 시작하기" / "건너뛰기" 버튼

   ```typescript
   interface AIQuestionModeProps {
     onAnswer: (answer: string) => void;
     onSkip: () => void;
   }
   ```

2. **노드 생성 로직**
   - 더블클릭 이벤트 감지 (300ms timeout)
   - 노드 타입 선택 모달 (Progressive Disclosure: 3개만 표시)
   - 500ms 이내 노드 생성 (React Flow 기반)

3. **노드 자동 선택 및 사이드바 열기**
   - 생성된 노드 자동 선택 (파란색 테두리 2px)
   - 우측 사이드바 200ms 이내 열기
   - pulse 애니메이션 1초간 재생

**Backend:**

```
POST /api/v1/canvas/nodes
```

```typescript
interface CreateNodeRequest {
  type: string; // 'problem-discovery'
  x: number;
  y: number;
  content?: string;
}

interface CreateNodeResponse {
  id: string;
  type: string;
  x: number;
  y: number;
  content: string;
  status: 'not_started' | 'in_progress' | 'completed';
}
```

---

### 3.4 Story 1.4: 온보딩 완료 및 다음 단계 안내

**Technical Tasks:**

**Frontend:**

1. **Celebration Modal Component**
   - confetti 애니메이션 2초간 (canvas-confetti 라이브러리)
   - 메시지: "첫 번째 노드 완성! 축하합니다! 🎉"
   - "다음 단계 보기" / "온보딩 모드 계속하기" 버튼

2. **진행률 바 업데이트**
   - "1/7 단계 완료" 표시
   - 다음 단계 카드: "다음 단계: 문제 정의"

3. **메인 캔버스 전환**
   - 3개 이상 노드 완성 시 자동 전환
   - 2초 후 전환 (취소 버튼 제공)
   - Progress Disclosure 해제 (모든 7단계 표시)

**Backend:**

```
POST /api/v1/onboarding/complete
```

```typescript
interface CompleteOnboardingRequest {
  completedNodes: number;
  totalNodes: number;
}
```

---

## 4. Acceptance Criteria

### Story 1.1: AI 인사와 사용자 상태 파악

**AC 1.1.1:** Given 사용자가 루트 경로(`/`)로 접근한다, When 페이지가 로딩된다, Then 1초 이내에 AI 인사 메시지가 중앙 상단에 표시된다

**Technical Validation:**
- Performance API로 측정: `performance.mark('ai-welcome-shown')`
- target: 1000ms 이내

**AC 1.1.2:** Given 3가지 옵션 카드가 표시된다, When 각 옵션을 확인한다, Then 옵션 1: "이미 스타트업 아이디어가 있어요" - 아이디어 입력으로 바로 이동

**Technical Validation:**
- React Component rendering
- Tailwind CSS classes: `grid grid-cols-3 gap-4`
- Hover state: `hover:shadow-lg transition-shadow`

**AC 1.1.3:** Given 사용자가 옵션을 선택한다, When 옵션 카드를 클릭한다, Then 선택한 옵션에 맞는 온보딩 모드로 자동 전환된다

**Technical Validation:**
- Redux Action: `onboardingSlice.actions.setMode(mode)`
- LocalStorage 저장 확인

**AC 1.1.4:** Given 오프라인 상태로 접속한다, When 네트워크 연결을 확인한다, Then "오프라인 모드로 작동 중입니다" 알림이 표시된다

**Technical Validation:**
- `navigator.onLine` 확인
- Toast notification: react-toastify

---

### Story 1.2: Adaptive 온보딩 모드 캔버스

**AC 1.2.1:** Given 사용자가 옵션 1(아이디어 있음)을 선택했다, When 간소화된 캔버스가 로딩된다, Then "초보자 모드"로 캔버스가 표시된다

**Technical Validation:**
- Redux State: `onboarding.mode === 'beginner'`
- React Flow 캔버스 초기화

**AC 1.2.2:** Given 사용자가 캔버스에 진입한다, When 화면이 로딩된다, Then 캔버스 상단에 "온보딩 모드: [모드명]" 배지가 표시된다

**Technical Validation:**
- Badge Component: Tailwind `bg-blue-100 text-blue-800 px-3 py-1 rounded-full`

**AC 1.2.3:** Given 사용자가 캔버스를 사용한다, When 3개 이상의 노드를 생성한다, Then "온보딩 완료! 메인 캔버스로 전환하시겠습니까?" 모달이 표시된다

**Technical Validation:**
- Node count: `nodes.length >= 3`
- Modal trigger: React Portal

---

### Story 1.3: AI 가이드와 함께 첫 노드 생성

**AC 1.3.1:** Given 사용자가 "초보자 모드"로 진입했다, When 캔버스가 로딩된다, Then AI 가이드가 3초 후 자동으로 질문 모드를 시작한다

**Technical Validation:**
- `setTimeout(() => startQuestionMode(), 3000)`
- Countdown timer: 3, 2, 1

**AC 1.3.2:** Given 사용자가 텍스트를 입력하고 "노드 생성"을 클릭한다, When 노드 생성이 완료된다, Then 500ms 이내에 새 노드가 캔버스 중앙에 생성된다

**Technical Validation:**
- React Flow `addNodes()` API
- Performance: `performance.now() - startTime < 500`

**AC 1.3.3:** Given 노드가 생성된다, When 생성 완료 후, Then 생성된 노드 주변에 pulse 애니메이션이 1초간 재생된다

**Technical Validation:**
- CSS Animation: `@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }`

---

### Story 1.4: 온보딩 완료 및 다음 단계 안내

**AC 1.4.1:** Given 사용자가 첫 번째 노드를 생성하고 내용을 추가했다, When 노드 내용이 최소 100자 이상 채워진다, Then "첫 번째 노드 완성! 축하합니다! 🎉" celebration 모달이 표시된다

**Technical Validation:**
- Content length: `node.content.length >= 100`
- Confetti: `canvas-confetti` library

**AC 1.4.2:** Given 사용자가 "다음 단계 보기"를 클릭한다, When 다음 단계 안내가 표시된다, Then 진행률 바가 "1/7 단계 완료"로 표시된다

**Technical Validation:**
- Progress Bar: Tailwind `w-full bg-gray-200` + inner `bg-green-500` with width `(1/7 * 100)%`

**AC 1.4.3:** Given 사용자가 3개 이상의 노드를 완성한다, When 캔버스를 계속 사용한다, Then "온보딩 완료! 이제 메인 캔버스로 자동 전환됩니다" 메시지가 표시된다

**Technical Validation:**
- Auto-transition: `setTimeout(() => transitionToMainCanvas(), 2000)`
- Cancel button 제공

---

## 5. Performance Targets (from NFRs)

**NFR-001:** 페이지 로드 2초 이내 (Chrome DevTools, 3G 네트워크 기준)
- 측정: `window.performance.timing.loadEventEnd - window.performance.timing.navigationStart`
- target: < 2000ms

**NFR-002:** 노드 생성 500ms 이내
- 측정: `performance.now()`
- target: < 500ms

**NFR-013:** 오프라인 지원
- LocalStorage 백업
- 온라인 복구 시 5초 이내 자동 동기화

---

## 6. Additional Context

### 6.1 Dependencies

**External Libraries:**
- `canvas-confetti` (npm): Celebration 애니메이션
- `react-toastify` (existing): Toast notifications
- `@reduxjs/toolkit` (existing): State management
- `reactflow` (existing): 캔버스 (Epic 2)

**Internal Dependencies:**
- Epic 2: 캔버스 코어 경험 (노드 생성, 이동, 연결)
- Epic 4: AI Co-Founder 대화 경험 (맥락 인식 질문)

### 6.2 Testing Strategy

**Unit Tests (Vitest):**
- `AIWelcomeOverlay.test.tsx`: 옵션 선택, 건너뛰기
- `OnboardingGuide.test.tsx`: 모드 전환, 토글
- `onboardingSlice.test.ts`: Redux actions, reducers

**Integration Tests:**
- 온보딩 플로우: 옵션 선택 → 모드 전환 → 첫 노드 생성 → 완료
- 오프라인 모드: LocalStorage 저장 → 온라인 복구 → 동기화

**E2E Tests (Playwright - Post-MVP):**
- 첫 방문자 플로우 전체

### 6.3 Notes

**Critical Path:**
1. AIWelcomeOverlay → OptionCard 선택
2. OnboardingGuide 모드 설정
3. AI 질문 모드 or 더블클릭 노드 생성
4. 첫 노드 완성 → Celebration
5. 메인 캔버스 전환 (3개 노드 완성 시)

**Risks:**
- React Flow 캔버스 초기화 지연 → Skeleton UI로 대기
- AI API 실패 → fallback으로 기본 질문 표시
- 오프라인 모드 데이터 손실 → LocalStorage 5MB 제한 확인

**Mitigation:**
- Progressive 로딩: AIWelcomeOverlay 먼저 표시, 캔버스는 백그라운드 로딩
- Retry 로직: AI API 3회 재시도
- IndexedDB 업그레이드: 5MB 초과 시 자동 마이그레이션 (Story 5.3)

---

**Tech-spec-epic-1.md - Ready for Development** ✅
