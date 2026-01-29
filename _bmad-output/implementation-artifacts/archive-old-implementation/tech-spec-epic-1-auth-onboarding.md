---
title: 'Epic 1 - 사용자 인증 및 온보딩 시스템'
slug: 'epic-1-auth-onboarding'
created: '2026-01-10'
status: 'ready-for-dev'
stepsCompleted: [1, 2, 3, 4]
tech_stack:
  - Vite 5.1 (Frontend Build Tool)
  - React 19.0 (Frontend Framework)
  - TypeScript 5.3 (Language)
  - Redux Toolkit 2.10.1 (State Management)
  - React Router 7.12.0 (Routing)
  - Tailwind CSS 3.4 (Styling)
  - Shadcn/ui (UI Components)
  - Axios 1.6.7 (HTTP Client)
  - Vitest (Frontend Testing)
  - Express 4.19 (Backend Framework)
  - Node.js 20+ LTS (Runtime)
  - Supabase 2.90.1 (Database + Auth)
  - pgvector 0.5.0 (Vector Extension)
  - Claude API 4.5 (AI Primary)
  - GLM 4.7 (AI Fallback)
files_to_modify: []
code_patterns:
  - Discriminated Union API Response (success: true/false)
  - Redux Toolkit createAsyncThunk for async operations
  - Monorepo structure with @shared/types path alias
  - Database naming: snake_case (tables, columns)
  - API endpoints: /api/v1/{resource} pattern
  - Component files: PascalCase.tsx
  - Hooks: camelCase with use prefix
  - Redux slices: camelCaseSlice.ts
  - No any type policy (use unknown + type guards)
  - RLS policies on all tables (auth.uid() = user_id)
  - Supabase Admin Client for backend (explicit filtering required)
test_patterns:
  - Vitest for frontend unit tests
  - React Testing Library for component tests
  - Mock Supabase client in tests
  - Supabase Test Environment for backend
  - RLS policy testing
  - Migration testing
  - No Playwright E2E unless explicitly required
---

# Tech-Spec: Epic 1 - 사용자 인증 및 온보딩 시스템

**Created:** 2026-01-10

## Overview

### Problem Statement

사용자가 가입 후 개인화된 AI 공동 창업자 경험을 시작할 수 있는 기반 인프라가 전혀 없습니다. 현재 프로젝트는 빈 상태로, 다음 기능들이 처음부터 구축되어야 합니다:

- Frontend/Backend 프로젝트 구조 (Monorepo)
- Supabase 통합 (인증, 데이터베이스, RLS)
- OAuth 2.0 로그인 시스템 (Google/Naver)
- 3단계 온보딩 플로우
- AI 기반 우선순위 제안 (Claude API)
- 데모 모드 (무가입 체험)
- 비즈니스 용어 학습 시스템

### Solution

Vite React TypeScript + Express TypeScript + Supabase 기반의 완전한 사용자 인증 및 온보딩 시스템을 구축합니다. Monorepo 패턴으로 프론트엔드와 백엔드를 통합 관리하며, Supabase의 인증 및 RLS 기능을 활용하여 보안을 강화합니다. AI 제안 기능은 Claude API를 주요, GLM 4.7을 보조로 사용하여 안정성을 확보합니다.

### Scope

**In Scope:**

1. **프로젝트 초기화 (Story 1.1)**
   - Frontend: Vite 5.1 + React 19.0 + TypeScript 5.3
   - Backend: Express 4.19 + TypeScript 5.3
   - Monorepo 구조: `frontend/`, `backend/`, `shared/types/`
   - Supabase 프로젝트 설정 및 `profiles` 테이블 생성
   - 환경변수 템플릿 (`.env.example`, `.env.local.example`)

2. **OAuth 2.0 로그인 (Story 1.2)**
   - Google OAuth 2.0 공급자
   - Naver OAuth 2.0 공급자
   - Supabase Auth 통합 (session, token refresh)
   - Redux Toolkit auth state 관리
   - RLS 정책으로 자동 profile 생성

3. **온보딩 플로우 (Story 1.3)**
   - 3단계 질문 시스템 (비전, 타겟, 현재 단계)
   - Progress bar (33% → 66% → 100%)
   - `onboarding_responses` 테이블에 임시 저장
   - 중단 이후 재개 기능
   - Settings에서 재온보딩 가능

4. **개인화된 환영 메시지 (Story 1.4)**
   - 온보딩 답변 참조하여 동적 메시지 생성
   - Modal UI로 표시
   - Settings에서 재표시 가능

5. **AI 맞춤형 제안 (Story 1.5)**
   - Claude API (주요) + GLM 4.7 (보조/fallback)
   - Progressive streaming (10초 이내 첫 응답)
   - `daily_priorities` 테이블에 저장
   - Drag & drop으로 우선순위 조정
   - 3회 실패 시 에러 메시지

6. **데모 모드 (Story 1.6)**
   - Mock 사용자 계정
   - Mock 데이터 (documents, priorities)
   - 모든 API 호출을 mock response로 처리
   - "저장" 시도 시 가입 유도 alert
   - 상단 banner 및 CTA 항상 표시

7. **비즈니스 용어 툴팁 (Story 1.7)**
   - 300ms delay 후 툴팁 표시
   - `glossary` 테이블 (용어, 정의, 예제)
   - 전체 텍스트 검색 기능
   - Settings에서 툴팁 토글

**Out of Scope:**

- ❌ **Story 1.8**: Node UI 가이드 투어 → Epic 6 완료 후 Future Work
- ❌ 실제 문서 생성 기능 (Epic 3)
- ❌ Google Drive 연동 (Epic 2)
- ❌ Node UI 시각화 (Epic 6)
- ❌ 팀 협업 (Epic 7)
- ❌ 실시간 WebSocket 협업 (Epic 8)

## Context for Development

### Codebase Patterns

**현재 상태:** 완전히 새로운 프로젝트 (기존 코드 없음)

**새로 적용할 패턴:**

1. **Monorepo Structure**
   ```
   bm-builder/
   ├── frontend/           # Vite React TypeScript
   │   ├── src/
   │   │   ├── api/        # API 호출 레이어 (NOT services/)
   │   │   ├── components/ # Reusable UI components
   │   │   ├── hooks/      # Custom React hooks
   │   │   ├── pages/      # Route components
   │   │   ├── store/      # Redux Toolkit slices
   │   │   ├── types/      # TypeScript types
   │   │   └── utils/      # Utility functions
   │   ├── .env.local.example
   │   └── package.json
   ├── backend/            # Express TypeScript
   │   ├── src/
   │   │   ├── routes/v1/  # API routes
   │   │   ├── controllers/# Request handlers
   │   │   ├── services/   # Business logic
   │   │   ├── middleware/ # Express middleware
   │   │   ├── models/     # Data models
   │   │   └── utils/      # Utility functions
   │   ├── supabase/       # Supabase CLI
   │   │   ├── migrations/
   │   │   └── functions/
   │   ├── .env.example
   │   └── package.json
   └── shared/
       └── types/          # 공통 TypeScript types
   ```

2. **TypeScript Configuration**
   - `strict: true` (엄격 모드)
   - `noUncheckedIndexedAccess: true`
   - Path alias: `@shared/types`
   - 절대 `any` 타입 금지 → `unknown` + type guard

3. **API Response Wrapper (Discriminated Union)**
   ```typescript
   type ApiResponse<T, E = ApiError> =
     | { success: true; data: T }
     | { success: false; error: E };
   ```

4. **Redux Toolkit Pattern**
   - 모든 비동기 로직은 `createAsyncThunk`
   - Loading/Error State는 granular하게 관리
   - Selector는 `select{Feature}{Entity}` 패턴

5. **Database Naming**
   - Tables: `snake_case` (예: `user_profiles`)
   - Columns: `snake_case` (예: `created_at`)
   - Primary Keys: `id` (UUID)
   - Foreign Keys: `{table}_id` (예: `user_id`)

6. **API Endpoint Pattern**
   - `/api/v1/{resource}/{id}/{sub-resource}`
   - HTTP verbs: GET, POST, PUT, PATCH, DELETE

### Files to Reference

| File | Purpose |
| ---- | ------- |
| `_bmad-output/planning-artifacts/prd.md` | Product Requirements Document - FRs, NFRs 참조 |
| `_bmad-output/planning-artifacts/architecture.md` | System Architecture - 기술 스택, AWS 배포 구조 참조 |
| `_bmad-output/planning-artifacts/epics.md` | Epic 1 Stories 1.1-1.7 - Acceptance Criteria 참조 |
| `_bmad-output/planning-artifacts/ux-design-specification.md` | UX Design - Shadcn/ui 컴포넌트, Design System 참조 |
| `_bmad-output/project-context.md` | 코딩 표준, 네이밍 컨벤션, Anti-patterns 참조 |

### Files to Create

**Confirmed Clean Slate:** 모든 파일이 새로 생성됩니다. 기존 코드베이스가 없습니다.

**Frontend Files (~40 files):**
- `frontend/src/api/supabase.ts` - Supabase client 초기화
- `frontend/src/api/authApi.ts` - OAuth 로그인 API
- `frontend/src/api/onboardingApi.ts` - 온보딩 API
- `frontend/src/api/prioritiesApi.ts` - 우선순위 API
- `frontend/src/components/auth/LoginForm.tsx` - 로그인 폼
- `frontend/src/components/auth/OAuthButton.tsx` - OAuth 버튼
- `frontend/src/components/onboarding/OnboardingFlow.tsx` - 온보딩 플로우 컨테이너
- `frontend/src/components/onboarding/OnboardingStep1.tsx` - 비전 질문
- `frontend/src/components/onboarding/OnboardingStep2.tsx` - 타겟 질문
- `frontend/src/components/onboarding/OnboardingStep3.tsx` - 현재 단계 질문
- `frontend/src/components/dashboard/WelcomeModal.tsx` - 환영 메시지 모달
- `frontend/src/components/dashboard/PriorityCards.tsx` - 우선순위 카드 (Drag & Drop)
- `frontend/src/components/dashboard/DemoModeBanner.tsx` - 데모 모드 배너
- `frontend/src/components/glossary/TermTooltip.tsx` - 용어 툴팁
- `frontend/src/components/glossary/GlossarySearch.tsx` - 용어 검색
- `frontend/src/hooks/useAuth.ts` - 인증 Hook
- `frontend/src/hooks/useOnboarding.ts` - 온보딩 Hook
- `frontend/src/hooks/usePriorities.ts` - 우선순위 Hook
- `frontend/src/pages/LoginPage.tsx` - 로그인 페이지
- `frontend/src/pages/OnboardingPage.tsx` - 온보딩 페이지
- `frontend/src/pages/DashboardPage.tsx` - 대시보드 페이지
- `frontend/src/pages/DemoModePage.tsx` - 데모 모드 페이지
- `frontend/src/store/slices/authSlice.ts` - Auth Redux slice
- `frontend/src/store/slices/onboardingSlice.ts` - Onboarding Redux slice
- `frontend/src/store/slices/prioritiesSlice.ts` - Priorities Redux slice
- `frontend/src/types/auth.ts` - Auth 타입 정의
- `frontend/src/types/onboarding.ts` - Onboarding 타입 정의
- `frontend/src/types/priorities.ts` - Priorities 타입 정의
- `frontend/src/utils/validators.ts` - 입력값 검증 함수
- `frontend/src/utils/constants.ts` - 상수 정의
- `frontend/src/App.tsx` - App root component
- `frontend/src/main.tsx` - Entry point
- `frontend/.env.local.example` - 환경변수 템플릿
- `frontend/package.json` - 의존성 정의
- `frontend/tsconfig.json` - TypeScript 설정
- `frontend/vite.config.ts` - Vite 설정
- `frontend/tailwind.config.js` - Tailwind CSS 설정

**Backend Files (~30 files):**
- `backend/src/routes/v1/auth.routes.ts` - Auth 라우트
- `backend/src/routes/v1/onboarding.routes.ts` - Onboarding 라우트
- `backend/src/routes/v1/priorities.routes.ts` - Priorities 라우트
- `backend/src/controllers/auth.controller.ts` - Auth 컨트롤러
- `backend/src/controllers/onboarding.controller.ts` - Onboarding 컨트롤러
- `backend/src/controllers/priorities.controller.ts` - Priorities 컨트롤러
- `backend/src/services/auth.service.ts` - Auth 서비스
- `backend/src/services/onboarding.service.ts` - Onboarding 서비스
- `backend/src/services/priorities.service.ts` - Priorities 서비스
- `backend/src/services/claude.service.ts` - Claude API 서비스
- `backend/src/middleware/auth.middleware.ts` - 인증 미들웨어
- `backend/src/middleware/errorHandler.ts` - 에러 핸들러
- `backend/src/models/user.model.ts` - User 모델
- `backend/src/models/priority.model.ts` - Priority 모델
- `backend/src/utils/supabaseAdmin.ts` - Supabase Admin Client
- `backend/src/utils/streamers.ts` - Progressive streaming 유틸
- `backend/src/index.ts` - Entry point
- `backend/.env.example` - 환경변수 템플릿
- `backend/package.json` - 의존성 정의
- `backend/tsconfig.json` - TypeScript 설정
- `backend/nodemon.json` - Nodemon 설정
- `backend/supabase/migrations/YYYYMMDDHHMMSS_create_profiles.sql` - profiles 테이블
- `backend/supabase/migrations/YYYYMMDDHHMMSS_create_onboarding_responses.sql` - onboarding_responses 테이블
- `backend/supabase/migrations/YYYYMMDDHHMMSS_create_daily_priorities.sql` - daily_priorities 테이블
- `backend/supabase/migrations/YYYYMMDDHHMMSS_create_glossary.sql` - glossary 테이블
- `backend/supabase/migrations/YYYYMMDDHHMMSS_create_user_preferences.sql` - user_preferences 테이블

**Shared Types (~3 files):**
- `shared/types/user.ts` - User 타입
- `shared/types/api.ts` - API response wrapper
- `shared/types/errors.ts` - Error 타입

**Total: ~73 new files to create**

### Technical Decisions

**Why Vite over CRA?**
- 빠른 개발 서버 시작 (< 1초)
- Native ESM support
- 더 나은 build performance

**Why Supabase over Firebase?**
- PostgreSQL 기반 (RDBMS)
- Row Level Security (RLS)로 강력한 접근 제어
- pgvector 확장으로 나중에 RAG 가능
- 오픈 소스, self-hosting 가능

**Why Redux Toolkit over Zustand?**
- 프로젝트 context에서 이미 Redux Toolkit 2.10.1로 명시됨
- createAsyncThunk로 비동기 로직 처리가 용이
- DevTools 통합이 훌륭함

**Why Claude API + GLM Fallback?**
- Claude 4.5는 한국어 생성 품질이 우수함
- GLM 4.7을 fallback으로 사용하여 안정성 확보
- 3초 이내 timeout으로 UX 저하 방지

**Why Demo Mode with Mock Data?**
- 사용자가 구매 전 서비스 가치를 확인할 수 있음
- 실제 API quota 소모 없이 체험 가능
- 가입 전환율 향상 기대

**Why Separate Glossary Table?**
- 용어 정의를 중앙화하여 일관성 유지
- 전체 텍스트 검색으로 빠른 조회
- 나중에 관리자가 용어 추가 용이

## Implementation Plan

### Tasks

**Phase 1: 프로젝트 초기화 (Story 1.1)**

#### Frontend Setup
- [ ] **Task 1.1.1:** Frontend 프로젝트 생성
  - File: `frontend/package.json`, `frontend/vite.config.ts`, `frontend/tsconfig.json`, `frontend/tailwind.config.js`
  - Action: `npm create vite@latest frontend -- --template react-ts` 실행 후 의존성 추가
  - Dependencies: `react@19.0`, `react-dom@19.0`, `@reduxjs/toolkit@2.10.1`, `react-router@7.12.0`, `tailwindcss@3.4`, `axios@1.6.7`, `@supabase/supabase-js@2.90.1`, `@dnd-kit/core@6.1.0`, `@dnd-kit/sortable@8.0.0`
  - Notes: Vite 5.1 사용, TypeScript strict mode 활성화

- [ ] **Task 1.1.2:** Frontend 기본 구조 생성
  - Files: `frontend/src/main.tsx`, `frontend/src/App.tsx`, `frontend/src/index.css`, `frontend/src/router/index.tsx`
  - Action: React root, Router 설정 (BrowserRouter), Route 구조 정의, Tailwind CSS import
  - Notes: Routes: / (LandingPage), /login (LoginPage), /onboarding (OnboardingPage - protected), /dashboard (DashboardPage - protected), /demo (DemoModePage), /settings (SettingsPage - protected)

- [ ] **Task 1.1.3:** Redux Store 설정
  - File: `frontend/src/store/store.ts`
  - Action: Redux Toolkit store 구성, auth, onboarding, priorities slices 추가
  - Notes: Redux DevTools 활성화

- [ ] **Task 1.1.4:** 환경변수 템플릿 생성
  - File: `frontend/.env.local.example`
  - Action: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_APP_URL 템플릿 작성
  - Notes: 실제 값 없이 주석만 제공

- [ ] **Task 1.1.5:** Shadcn/ui 컴포넌트 설치 및 설정
  - Files: `frontend/src/components/ui/` (Button, Input, Card, Modal 등)
  - Action: `npx shadcn-ui@latest init` 실행 후 필요한 컴포넌트 추가
  - Notes: Tailwind CSS 기반, Radix UI primitives

#### Backend Setup
- [ ] **Task 1.1.6:** Backend 프로젝트 생성
  - Files: `backend/package.json`, `backend/tsconfig.json`, `backend/nodemon.json`
  - Action: Express TypeScript 프로젝트 초기화
  - Dependencies: `express@4.19`, `@types/express`, `@types/node`, `typescript@5.3`, `nodemon`, `ts-node`, `@supabase/supabase-js@2.90.1`
  - Notes: Node.js 20+ LTS 사용

- [ ] **Task 1.1.7:** Express 서버 기본 설정
  - File: `backend/src/index.ts`
  - Action: Express app, JSON parser, CORS (환경별 origin 허용), health check endpoint (`GET /health`)
  - Notes: PORT=3000 환경변수 사용, CORS_ALLOWED_ORIGINS 환경변수로 콤마 구분된 origin 목록 관리 (개발: http://localhost:5173, 프로덕션: 실제 도메인)

- [ ] **Task 1.1.8:** 환경변수 템플릿 생성
  - File: `backend/.env.example`
  - Action: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, CLAUDE_API_KEY, GLM_API_KEY, JWT_SECRET, PORT, NODE_ENV 템플릿 작성
  - Notes: 실제 값 없이 주석만 제공

- [ ] **Task 1.1.9:** Error Handler Middleware 구현
  - File: `backend/src/middleware/errorHandler.ts`
  - Action: Express error handler middleware 구현, discriminated union error response
  - Notes: AppError 타입 정의, 모든 엔드포인트에서 일관된 에러 처리

#### Shared Types
- [ ] **Task 1.1.10:** 공통 타입 정의
  - Files: `shared/types/api.ts`, `shared/types/errors.ts`, `shared/types/user.ts`
  - Action: ApiResponse wrapper, ApiError type, User type 정의
  - Notes: Discriminated union pattern 사용

#### Supabase Setup
- [ ] **Task 1.1.11:** Supabase 프로젝트 생성 (사용자 직접 수행)
  - Action: 사용자가 Supabase Dashboard에서 프로젝트 생성
  - Notes: PostgreSQL 15 + pgvector 확장 활성화

- [ ] **Task 1.1.12:** Supabase CLI 초기화 (로컬)
  - Action: `npx supabase init` 실행, `npx supabase link --project-ref <your-project-ref>`로 원격 프로젝트 연결
  - Notes: backend/supabase/ 폴더에 migrations/와 functions/ 생성됨

- [ ] **Task 1.1.13:** Supabase Admin Client 초기화
  - File: `backend/src/utils/supabaseAdmin.ts`
  - Action: createClient() with service_role_key
  - Notes: Backend 전용, RLS 우회 가능하지만 명시적 필터링 필수

- [ ] **Task 1.1.14:** Supabase Frontend Client 초기화
  - File: `frontend/src/api/supabase.ts`
  - Action: createClient() with anon_key
  - Notes: Frontend 전용, RLS 적용됨

- [ ] **Task 1.1.15:** Database Migration - profiles 테이블
  - File: `backend/supabase/migrations/YYYYMMDDHHMMSS_create_profiles.sql`
  - Action:
    ```sql
    create table profiles (
      id uuid primary key references auth.users on delete cascade,
      email text unique not null,
      full_name text,
      avatar_url text,
      onboarding_completed boolean default false,
      created_at timestamp with time zone default timezone('utc'::text, now())
    );

    -- RLS 활성화
    alter table profiles enable row level security;

    -- RLS Policies
    create policy "Users can view their own profile"
      on profiles for select using (auth.uid() = id);

    create policy "Users can update their own profile"
      on profiles for update using (auth.uid() = id);

    -- Trigger: auth.users 생성 시 자동으로 profiles 레코드 생성
    create function public.handle_new_user()
    returns trigger as $$
    begin
      insert into public.profiles (id, email, full_name)
      values (new.id, new.email, new.raw_user_meta_data->>'full_name');
      return new;
    end;
    $$ language plpgsql security definer;

    create trigger on_auth_user_created
      after insert on auth.users
      for each row execute procedure public.handle_new_user();
    ```
  - Notes: auth.users 테이블은 Supabase Auth에서 관리

- [ ] **Task 1.1.16:** Database Migration - onboarding_responses 테이블
  - File: `backend/supabase/migrations/YYYYMMDDHHMMSS_create_onboarding_responses.sql`
  - Action:
    ```sql
    create table onboarding_responses (
      id uuid primary key default gen_random_uuid(),
      user_id uuid references profiles(id) on delete cascade not null,
      step_number integer not null,
      response text not null,
      created_at timestamp with time zone default timezone('utc'::text, now())
    );

    alter table onboarding_responses enable row level security;

    create policy "Users can manage their own onboarding responses"
      on onboarding_responses for all using (auth.uid() = user_id);
    ```

- [ ] **Task 1.1.17:** Database Migration - daily_priorities 테이블
  - File: `backend/supabase/migrations/YYYYMMDDHHMMSS_create_daily_priorities.sql`
  - Action:
    ```sql
    create table daily_priorities (
      id uuid primary key default gen_random_uuid(),
      user_id uuid references profiles(id) on delete cascade not null,
      priorities jsonb not null default '[]'::jsonb,
      source text default 'ai_suggestion',
      created_at timestamp with time zone default timezone('utc'::text, now())
    );

    alter table daily_priorities enable row level security;

    create policy "Users can manage their own priorities"
      on daily_priorities for all using (auth.uid() = user_id);
    ```

- [ ] **Task 1.1.18:** Database Migration - glossary 테이블
  - File: `backend/supabase/migrations/YYYYMMDDHHMMSS_create_glossary.sql`
  - Action:
    ```sql
    create table glossary (
      id uuid primary key default gen_random_uuid(),
      term text unique not null,
      definition text not null,
      examples text,
      category text,
      created_at timestamp with time zone default timezone('utc'::text, now())
    );

    alter table glossary enable row level security;

    create policy "Everyone can view glossary"
      on glossary for select using (true);
    ```

- [ ] **Task 1.1.19:** Database Migration - user_preferences 테이블
  - File: `backend/supabase/migrations/YYYYMMDDHHMMSS_create_user_preferences.sql`
  - Action:
    ```sql
    create table user_preferences (
      user_id uuid primary key references profiles(id) on delete cascade,
      show_tooltips boolean default true,
      node_ui_tour_completed boolean default false,
      updated_at timestamp with time zone default timezone('utc'::text, now())
    );

    alter table user_preferences enable row level security;

    create policy "Users can manage their own preferences"
      on user_preferences for all using (auth.uid() = user_id);
    ```

---

**Phase 2: OAuth 2.0 로그인 (Story 1.2)**

#### Backend Auth
- [ ] **Task 1.2.1:** Auth Service 구현
  - File: `backend/src/services/auth.service.ts`
  - Action: signInWithOAuth(), signOut(), getSession() 함수 구현
  - Notes: Supabase Auth 사용

- [ ] **Task 1.2.2:** Auth Controller 구현
  - File: `backend/src/controllers/auth.controller.ts`
  - Action: OAuth callback handler, session refresh handler
  - Notes: Error handling with discriminated union response

- [ ] **Task 1.2.3:** Auth Routes 구현
  - Files: `backend/src/routes/v1/auth.routes.ts`
  - Action: POST /api/v1/auth/google, POST /api/v1/auth/naver, GET /api/v1/auth/session
  - Notes: Auth middleware로 보호된 엔드포인트

- [ ] **Task 1.2.4:** Auth Middleware 구현
  - File: `backend/src/middleware/auth.middleware.ts`
  - Action: JWT token 검증, user ID 추출
  - Notes: req.user에 사용자 정보 추가

#### Frontend Auth
- [ ] **Task 1.2.5:** Auth Types 정의
  - File: `frontend/src/types/auth.ts`
  - Action: User, Session, AuthState 타입 정의
  - Notes: Supabase Auth 타입 호환

- [ ] **Task 1.2.6:** Auth API Layer 구현
  - File: `frontend/src/api/authApi.ts`
  - Action: signInWithGoogle(), signInWithNaver(), signOut() 함수
  - Notes: Axios 사용, discriminated union 반환

- [ ] **Task 1.2.7:** Auth Redux Slice 구현
  - File: `frontend/src/store/slices/authSlice.ts`
  - Action: createAsyncThunk for signIn, signOut, getSession
  - Notes: Granular loading/error states

- [ ] **Task 1.2.8:** useAuth Hook 구현
  - File: `frontend/src/hooks/useAuth.ts`
  - Action: signIn, signOut, user, isAuthenticated, loading 반환
  - Notes: useEffect로 session 자동 갱신

- [ ] **Task 1.2.9:** OAuthButton Component 구현
  - File: `frontend/src/components/auth/OAuthButton.tsx`
  - Action: Google/Naver 로그인 버튼, OAuth flow 시작
  - Notes: Shadcn/ui Button 사용, 로딩 상태 표시

- [ ] **Task 1.2.10:** LoginForm Component 구현
  - File: `frontend/src/components/auth/LoginForm.tsx`
  - Action: OAuthButton들 렌더링, 에러 메시지 표시
  - Notes: 간단한 UI, 로고 및 환영 메시지

- [ ] **Task 1.2.11:** LoginPage Component 구현
  - File: `frontend/src/pages/LoginPage.tsx`
  - Action: LoginForm 렌더링, 이미 로그인 시 /dashboard로 redirect
  - Notes: Protected route logic

- [ ] **Task 1.2.12:** Supabase OAuth Providers 설정 (사용자 직접 수행)
  - Action: Supabase Dashboard → Authentication → Providers에서 Google/Naver 추가
  - Notes: Redirect URL: VITE_APP_URL/auth/callback (환경변수로 관리, 개발: http://localhost:5173, 프로덕션: 실제 도메인)

---

**Phase 3: 온보딩 플로우 (Story 1.3)**

#### Backend Onboarding
- [ ] **Task 1.3.1:** Onboarding Service 구현
  - File: `backend/src/services/onboarding.service.ts`
  - Action: saveOnboardingResponse(), getOnboardingResponses(), completeOnboarding()
  - Notes: onboarding_responses 테이블 CRUD

- [ ] **Task 1.3.2:** Onboarding Controller 구현
  - File: `backend/src/controllers/onboarding.controller.ts`
  - Action: POST /api/v1/onboarding/response, GET /api/v1/onboarding/responses
  - Notes: Auth middleware로 보호

- [ ] **Task 1.3.3:** Onboarding Routes 구현
  - File: `backend/src/routes/v1/onboarding.routes.ts`
  - Action: 위 endpoints 등록
  - Notes: /api/v1 아래에 mount

#### Frontend Onboarding Utils
- [ ] **Task 1.3.4:** Validators 구현
  - File: `frontend/src/utils/validators.ts`
  - Action: validateNotEmpty(), validateEmail(), validateLength() 등 validation 함수들 구현
  - Notes: TypeScript type guards 사용, 에러 메시지 한국어로 반환

#### Frontend Onboarding
- [ ] **Task 1.3.5:** Onboarding Types 정의
  - File: `frontend/src/types/onboarding.ts`
  - Action: OnboardingResponse, OnboardingStep 타입 정의
  - Notes: step 1-3 enum

- [ ] **Task 1.3.5:** Onboarding API Layer 구현
  - File: `frontend/src/api/onboardingApi.ts`
  - Action: saveResponse(), getResponses(), completeOnboarding()
  - Notes: Axios 사용

- [ ] **Task 1.3.6:** Onboarding Redux Slice 구현
  - File: `frontend/src/store/slices/onboardingSlice.ts`
  - Action: createAsyncThunk for saving responses
  - Notes: Current step tracking

- [ ] **Task 1.3.7:** useOnboarding Hook 구현
  - File: `frontend/src/hooks/useOnboarding.ts`
  - Action: saveResponse, currentStep, responses, loading 반환
  - Notes: Step progression 로직

- [ ] **Task 1.3.8:** OnboardingStep1 Component 구현
  - File: `frontend/src/components/onboarding/OnboardingStep1.tsx`
  - Action: "당신의 비전은 무엇인가요?" text input
  - Notes: validateNotEmpty() 사용, progress bar 33%

- [ ] **Task 1.3.9:** OnboardingStep2 Component 구현
  - File: `frontend/src/components/onboarding/OnboardingStep2.tsx`
  - Action: "타겟 고객은 누구인가요?" text input
  - Notes: validateNotEmpty() 사용, progress bar 66%

- [ ] **Task 1.3.10:** OnboardingStep3 Component 구현
  - File: `frontend/src/components/onboarding/OnboardingStep3.tsx`
  - Action: "현재 어떤 단계인가요?" dropdown (아이디어/프로토타입/MVP/성장)
  - Notes: validateNotEmpty() 사용, progress bar 100%

- [ ] **Task 1.3.11:** OnboardingFlow Component 구현
  - File: `frontend/src/components/onboarding/OnboardingFlow.tsx`
  - Action: 3단계 flow orchestration, progress bar, navigation
  - Notes: 중단 후 재개 로직

- [ ] **Task 1.3.12:** OnboardingPage Component 구현
  - File: `frontend/src/pages/OnboardingPage.tsx`
  - Action: OnboardingFlow 렌더링, 완료 시 /dashboard로 redirect
  - Notes: Protected route, onboarding_completed=false 일 때만 접근

- [ ] **Task 1.3.13:** Dashboard에서 온보딩 체크 로직 추가
  - File: `frontend/src/pages/DashboardPage.tsx`
  - Action: onboarding_completed=false 이면 /onboarding으로 redirect
  - Notes: useEffect로 체크

---

**Phase 4: 개인화된 환영 메시지 (Story 1.4)**

#### Frontend Welcome Modal
- [ ] **Task 1.4.1:** WelcomeModal Component 구현
  - File: `frontend/src/components/dashboard/WelcomeModal.tsx`
  - Action: 온보딩 답변 참조하여 동적 메시지 생성, modal UI
  - Notes: Shadcn/ui Dialog 사용, "시작하기" 버튼으로 닫기

- [ ] **Task 1.4.2:** DashboardPage에 WelcomeModal 통합
  - File: `frontend/src/pages/DashboardPage.tsx`
  - Action: onboarding_completed=true 이고 first_visit=true 이면 modal 표시
  - Notes: user_preferences 테이블에 first_visit flag 저장

---

**Phase 5: AI 맞춤형 제안 (Story 1.5)**

#### Backend AI Service
- [ ] **Task 1.5.1:** Claude Service 구현
  - File: `backend/src/services/claude.service.ts`
  - Action: generatePriorities(onboardingResponses) with Claude API 4.5
  - Notes: Anthropic SDK 사용, progressive streaming (SSE), 3초 timeout

- [ ] **Task 1.5.2:** GLM Fallback Service 구현
  - File: `backend/src/services/claude.service.ts`
  - Action: Claude 실패 시 GLM 4.7로 fallback
  - Notes: 3회 재시도, 모두 실패 시 에러 반환

- [ ] **Task 1.5.3:** Progressive Streaming Util 구현
  - File: `backend/src/utils/streamers.ts`
  - Action: SSE response generator, 10초 이내 첫 500자 전송
  - Notes: Server-Sent Events 사용

- [ ] **Task 1.5.4:** Priorities Service 구현
  - File: `backend/src/services/priorities.service.ts`
  - Action: generateAI_PRIORITIES(), savePriorities(), getPriorities()
  - Notes: Claude service 호출, daily_priorities 테이블에 저장

- [ ] **Task 1.5.5:** Priorities Controller 구현
  - File: `backend/src/controllers/priorities.controller.ts`
  - Action: POST /api/v1/priorities/generate, GET /api/v1/priorities, PUT /api/v1/priorities
  - Notes: SSE endpoint: GET /api/v1/priorities/stream

- [ ] **Task 1.5.6:** Priorities Routes 구현
  - File: `backend/src/routes/v1/priorities.routes.ts`
  - Action: 위 endpoints 등록
  - Notes: Auth middleware로 보호

#### Frontend Priorities
- [ ] **Task 1.5.7:** Priorities Types 정의
  - File: `frontend/src/types/priorities.ts`
  - Action: Priority, PriorityItem 타입 정의
  - Notes: id, title, description, order

- [ ] **Task 1.5.8:** Priorities API Layer 구현
  - File: `frontend/src/api/prioritiesApi.ts`
  - Action: generatePriorities(), getPriorities(), updatePriorities()
  - Notes: SSE listener for streaming, useEffect cleanup으로 EventSource.close() 호출 (memory leak 방지, mounted 플래그 사용)

- [ ] **Task 1.5.9:** Priorities Redux Slice 구현
  - File: `frontend/src/store/slices/prioritiesSlice.ts`
  - Action: createAsyncThunk for generate, get, update
  - Notes: Streaming progress state

- [ ] **Task 1.5.10:** usePriorities Hook 구현
  - File: `frontend/src/hooks/usePriorities.ts`
  - Action: generate, priorities, loading, error 반환
  - Notes: Streaming progress tracking

- [ ] **Task 1.5.11:** PriorityCards Component 구현
  - File: `frontend/src/components/dashboard/PriorityCards.tsx`
  - Action: 우선순위 카드 목록 표시, drag & drop으로 순서 변경
  - Notes: @dnd-kit/core 사용, "저장" 버튼으로 변경사항 저장

- [ ] **Task 1.5.12:** DashboardPage에 PriorityCards 통합
  - File: `frontend/src/pages/DashboardPage.tsx`
  - Action: 온보딩 완료 후 자동으로 AI 제안 생성 시작, 결과 표시
  - Notes: Progressive streaming UI

- [ ] **Task 1.5.13:** AI Loading Skeleton Component 구현
  - File: `frontend/src/components/dashboard/AIgeneratingSkeleton.tsx`
  - Action: AI 생성 중 표시할 loading skeleton UI (pulsing dots, 진행률 텍스트)
  - Notes: "AI가 분석 중입니다...", "우선순위를 생성하는 중입니다..." 메시지 표시

---

**Phase 6: 데모 모드 (Story 1.6)**

#### Frontend Demo Mode
- [ ] **Task 1.6.1:** Demo Mode Utils 구현
  - File: `frontend/src/utils/demoMode.ts`
  - Action: isDemoMode(), generateMockUser(), generateMockPriorities(), exitDemoMode()
  - Notes: URL param ?demo=true 또는 localStorage flag, exitDemoMode()는 localStorage 삭제 및 /로 redirect

- [ ] **Task 1.6.2:** DemoModeBanner Component 구현
  - File: `frontend/src/components/dashboard/DemoModeBanner.tsx`
  - Action: "데모 모드입니다. 무제한 사용을 위해 가입하세요!" banner
  - Notes: 항상 상단에 표시, "가입하기" CTA

- [ ] **Task 1.6.3:** Mock Data Interceptor 구현
  - File: `frontend/src/api/mockInterceptor.ts`
  - Action: Axios interceptor로 모든 API 호출을 mock response로 처리
  - Notes: 데모 모드 시에만 활성화

- [ ] **Task 1.6.4:** DemoModePage Component 구현
  - File: `frontend/src/pages/DemoModePage.tsx`
  - Action: 데모 모드 UI (로그인된 것처럼 보이기)
  - Notes: Mock 데이터로 미리 채워진 상태

- [ ] **Task 1.6.5:** Landing Page에 Demo Mode CTA 추가
  - File: `frontend/src/pages/LandingPage.tsx` (새 파일)
  - Action: "데모 모드 체험하기" 버튼
  - Notes: 데모 모드로 진입

- [ ] **Task 1.6.6:** Auth API에 Demo Mode 체크 로직 추가
  - File: `frontend/src/api/authApi.ts`, `frontend/src/api/prioritiesApi.ts`
  - Action: 데모 모드 시 실제 API 호출 대신 mock 데이터 반환
  - Notes: isDemoMode() 체크

---

**Phase 7: 비즈니스 용어 툴팁 (Story 1.7)**

#### Frontend Glossary
- [ ] **Task 1.7.1:** Glossary Seed Data Migration 구현
  - File: `backend/supabase/migrations/YYYYMMDDHHMMSS_seed_glossary.sql`
  - Action: glossary 테이블에 초기 용어 데이터 insert (Lean Startup, PMF, MVP, Pivot, Product-Market Fit, Customer Development, Traction, Churn, CAC, LTV 등 최소 30개)
  - Notes: Migration script로 자동화, 사용자가 수동으로 입력할 필요 없음

- [ ] **Task 1.7.2:** TermTooltip Component 구현
  - File: `frontend/src/components/glossary/TermTooltip.tsx`
  - Action: hover 시 300ms delay 후 툴팁 표시
  - Notes: Shadcn/ui Tooltip 사용, glossary 테이블 조회

- [ ] **Task 1.7.3:** GlossarySearch Component 구현
  - File: `frontend/src/components/glossary/GlossarySearch.tsx`
  - Action: 용어 검색 input, dropdown 결과 표시 (top 5)
  - Notes: 전체 텍스트 검색 (Supabase full-text search)

- [ ] **Task 1.7.4:** user_preferences API 구현
  - Files: `backend/src/controllers/preferences.controller.ts`, `backend/src/routes/v1/preferences.routes.ts`
  - Action: GET /api/v1/preferences, PUT /api/v1/preferences
  - Notes: show_tooltips 토글

- [ ] **Task 1.7.5:** Settings Page 구현 (기본)
  - File: `frontend/src/pages/SettingsPage.tsx` (새 파일)
  - Action: "툴팁 표시" 토글, "온보딩 다시하기" 버튼
  - Notes: 향후 확장 가능

---

### Acceptance Criteria

**Story 1.1: 프로젝트 초기화 및 Supabase 설정**

- [ ] **AC 1.1.1:** Given 프로젝트가 시작될 때, When `npm install` && `npm run dev` 실행하면, Then Frontend dev server가 http://localhost:5173에서 실행된다.
- [ ] **AC 1.1.2:** Given 프로젝트가 시작될 때, When backend에서 `npm run dev` 실행하면, Then Express server가 http://localhost:3000에서 실행되고 GET /health가 200을 반환한다.
- [ ] **AC 1.1.3:** Given Supabase 프로젝트가 생성되었을 때, When migrations 실행하면, Then profiles, onboarding_responses, daily_priorities, glossary, user_preferences 테이블이 생성되고 RLS가 활성화된다.
- [ ] **AC 1.1.4:** Given profiles 테이블이 생성되었을 때, When 새로운 사용자가 Supabase Auth로 가입하면, Then trigger가 자동으로 profiles 레코드를 생성한다.
- [ ] **AC 1.1.5:** Given .env.example 파일이 존재할 때, When 개발자가 환경변수를 설정하면, Then 모든 필수 환경변수가 문서화되어 있다.

**Story 1.2: OAuth 2.0 로그인**

- [ ] **AC 1.2.1:** Given 사용자가 로그인 페이지에 방문했을 때, When "Google로 로그인" 버튼을 클릭하면, Then Google OAuth consent screen으로 redirect된다.
- [ ] **AC 1.2.2:** Given OAuth 인증이 성공했을 때, When Supabase가 callback을 처리하면, Then profiles 테이블에 사용자 레코드가 생성되고 Redux auth state가 업데이트된다.
- [ ] **AC 1.2.3:** Given OAuth 인증이 실패했을 때, When 에러가 발생하면, Then "로그인에 실패했습니다. 다시 시도해주세요." 메시지가 표시된다.
- [ ] **AC 1.2.4:** Given 사용자가 로그인되어 있을 때, When 새로고침하면, Then Supabase가 자동으로 token을 refresh하고 세션이 유지된다.
- [ ] **AC 1.2.5:** Given 사용자가 로그인되어 있을 때, When /dashboard에 접속하면, Then 대시보드 페이지가 표시되고 로그인 페이지로 redirect되지 않는다.

**Story 1.3: 온보딩 플로우**

- [ ] **AC 1.3.1:** Given 사용자가 처음 로그인했을 때 (onboarding_completed=false), When /dashboard에 접속하면, Then /onboarding으로 redirect된다.
- [ ] **AC 1.3.2:** Given 사용자가 온보딩 Step 1에 있을 때, When "비전"을 입력하고 "다음"을 클릭하면, Then 응답이 onboarding_responses 테이블에 저장되고 Step 2로 progress된다.
- [ ] **AC 1.3.3:** Given 사용자가 온보딩 Step 3을 완료했을 때, When "완료"를 클릭하면, Then profiles.onboarding_completed=true로 업데이트되고 "온보딩을 완료했습니다! 🎉" 메시지가 표시된다.
- [ ] **AC 1.3.4:** Given 사용자가 온보딩을 중간에 이탈했을 때, When 다시 로그인하면, Then 마지막으로 완료한 단계부터 재개된다.
- [ ] **AC 1.3.5:** Given 사용자가 온보딩을 완료했을 때, When /dashboard에 접속하면, Then 더 이상 /onboarding으로 redirect되지 않는다.

**Story 1.4: 개인화된 환영 메시지**

- [ ] **AC 1.4.1:** Given 사용자가 온보딩을 완료했을 때, When 처음 /dashboard에 접속하면, Then 환영 메시지 modal이 표시된다.
- [ ] **AC 1.4.2:** Given 환영 메시지가 표시되었을 때, When 메시지를 확인하면, Then 사용자의 온보딩 답변이 포함되어 있다 (예: "[비전]을 위한 여정을 시작하네요!").
- [ ] **AC 1.4.3:** Given 환영 메시지 modal이 표시되었을 때, When "시작하기" 버튼을 클릭하면, Then modal이 닫히고 대시보드가 표시된다.

**Story 1.5: AI 맞춤형 제안**

- [ ] **AC 1.5.1:** Given 사용자가 온보딩을 완료했을 때, When 백그라운드에서 AI 제안 생성이 시작되면, Then 10초 이내에 첫 응답이 progressive streaming으로 표시된다.
- [ ] **AC 1.5.2:** Given AI 제안 생성이 완료되었을 때, When 결과를 확인하면, Then daily_priorities 테이블에 저장되고 대시보드에 표시된다.
- [ ] **AC 1.5.3:** Given 우선순위 카드가 표시되었을 때, When drag & drop으로 순서를 변경하고 "저장"을 클릭하면, Then 변경사항이 daily_priorities 테이블에 저장된다.
- [ ] **AC 1.5.4:** Given Claude API 호출이 실패했을 때, When fallback이 실행되면, Then 3초 이내에 GLM 4.7로 재시도된다.
- [ ] **AC 1.5.5:** Given 3회 모두 실패했을 때, When 에러가 발생하면, Then "제안 생성에 실패했습니다. 나중에 다시 시도해주세요." 메시지가 표시된다.

**Story 1.6: 데모 모드**

- [ ] **AC 1.6.1:** Given 비로그인 사용자가 랜딩 페이지에 방문했을 때, When "데모 모드 체험하기"를 클릭하면, Then 데모 모드로 전환되고 Mock 사용자 계정으로 로그인된 것처럼 UI가 표시된다.
- [ ] **AC 1.6.2:** Given 데모 모드일 때, When 화면을 확인하면, Then 상단에 "데모 모드입니다. 무제한 사용을 위해 가입하세요!" banner가 항상 표시된다.
- [ ] **AC 1.6.3:** Given 데모 모드일 때, When 우선순위 카드를 확인하면, Then Mock 데이터가 자동 생성되어 표시된다.
- [ ] **AC 1.6.4:** Given 데모 모드일 때, When API 호출이 발생하면, Then 실제 API 대신 mock response가 반환된다.
- [ ] **AC 1.6.5:** Given 데모 모드일 때, When "저장"을 시도하면, Then "데모 모드에서는 저장이 불가능합니다. 가입 후 이용해주세요!" alert이 표시된다.

**Story 1.7: 비즈니스 용어 툴팁**

- [ ] **AC 1.7.1:** Given 사용자가 UI를 탐색할 때, When 비즈니스 용어가 포함된 요소에 hover하면, Then 300ms delay 후 툴팁이 표시된다.
- [ ] **AC 1.7.2:** Given 툴팁이 표시되었을 때, When 내용을 확인하면, Then 용어 제목, 정의, 관련 예제 링크가 포함되어 있다.
- [ ] **AC 1.7.3:** Given 사용자가 용어 검색을 실행했을 때, When glossary 테이블에서 검색되면, Then dropdown에 top 5 결과가 표시된다.
- [ ] **AC 1.7.4:** Given 검색 결과가 없을 때, When "검색어 '[용어]'에 대한 결과가 없습니다." 메시지가 표시된다.
- [ ] **AC 1.7.5:** Given Settings에서 "툴팁 표시"를 껐을 때, When 용어에 hover하면, Then 툴팁이 표시되지 않는다.

## Additional Context

### Dependencies

**External Dependencies:**
- Supabase 프로젝트 (사용자가 직접 생성 필요)
- Google Cloud Console (OAuth 2.0 Client ID)
- Naver Developers (OAuth 2.0 Client ID)
- Anthropic API Key (Claude 4.5)
- Zhipu AI API Key (GLM 4.7)

**Epic Dependencies:**
- Story 1.8 (Node UI 가이드 투어)는 Epic 6 완료 후 구현

### Testing Strategy

**Frontend (Vitest):**
- Component 단위 테스트 (React Testing Library)
- Hook 단위 테스트
- Redux Slice 단위 테스트
- Integration 테스트 (Mock Supabase)

**Backend (Supabase Test Environment):**
- API Endpoint 단위 테스트
- Service 로직 단위 테스트
- Migration 테스트
- RLS Policy 테스트

**E2E (Playwright - 선택 사항):**
- 로그인 flow
- 온보딩 flow
- 데모 모드 → 가입 전환 flow

### Notes

**Environment Variables Required:**

Frontend (`.env.local`):
```bash
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx...
VITE_APP_URL=http://localhost:5173
```

Backend (`.env`):
```bash
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
CLAUDE_API_KEY=sk-ant-xxx...
GLM_API_KEY=xxx...
JWT_SECRET=your-secret-key
PORT=3000
NODE_ENV=development
```

**Database Tables to Create:**

1. `profiles` (Supabase Auth 자동 생성 후 RLS로 연동)
2. `onboarding_responses`
3. `daily_priorities`
4. `glossary`
5. `user_preferences`

**Supabase RLS Policies:**
- 모든 테이블은 RLS 활성화
- `auth.uid() = user_id`로 접근 제어
- Backend는 Supabase Admin Client 사용 (RLS 우회 가능하지만 명시적 필터링 필수)
