# Course Correction Document - bm-builder

**Date:** 2026-01-18
**Author:** Product Manager John
**Status:** 🔄 IN PROGRESS
**Trigger:** Backend/Frontend 코드 오류 다수, Node 22 기반 완전 재구축 결정

---

## Executive Summary

기존 코드베이스의 오류와 기술 부채로 인해 **Node.js 22** 기반으로 백엔드/프론트엔드를 완전히 재구축하기로 결정했습니다. 가장 큰 변화는 **Supabase에서 직접 호스팅한 PostgreSQL로의 마이그레이션**입니다.

### 결정 사항

1. ✅ 기존 코드 완전 폐기
2. ✅ 기존 문서(PRD, Architecture, Epics) 기능 모두 구현
3. ✅ 기술 스택: Node.js 22 + Express + PostgreSQL / React + Vite
4. ✅ PostgreSQL: 호스팅 서버 (15.164.103.114:5432)

---

## 1. 기존 아키텍처 검토

### 1.1 기존 기술 스택 (Architecture 문서 기반)

**Frontend:**
- React + Vite
- TypeScript
- Tailwind CSS
- Supabase Auth (`@supabase/supabase-js`)

**Backend:**
- Node.js + Express
- TypeScript
- Supabase Client (`@supabase/supabase-js`)
- PostgreSQL (via Supabase)

**Database:**
- Supabase PostgreSQL
- Supabase Auth (내장)
- pgvector 확장 (RAG)

**Infrastructure:**
- Vercel (Frontend)
- Railway/Render (Backend)

### 1.2 기존 인증 시스템 (Supabase)

```typescript
// 기존 방식 (Supabase)
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY
)

// OAuth 2.0 (Google, Naver)
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google'
})
```

**Supabase Auth 특징:**
- OAuth 2.0 흐름 자동 처리
- JWT 토큰 자동 관리
- 사용자 세션 자동 갱신
- Row Level Security (RLS) 지원

---

## 2. 변경사항 분석

### 2.1 핵심 변경사항

| 구분 | 기존 (Supabase) | 새로운 방식 (직접 PostgreSQL) |
|------|-----------------|------------------------------|
| **인증** | Supabase Auth 내장 | 직접 JWT/Session 구현 |
| **DB 연결** | Supabase Client | `pg` Pool 직접 연결 |
| **OAuth** | Supabase 자동 처리 | Passport.js / 직접 구현 |
| **보안** | RLS (Row Level Security) | 직접 Authorization 미들웨어 |
| **환경변수** | `VITE_SUPABASE_*` | `DB_HOST`, `DB_USER`, 등 |

### 2.2 인증 시스템 재설계 필요

#### 2.2.1 OAuth 2.0 인증 흐름 (Google, Naver)

**기존 (Supabase):**
```typescript
// 프론트엔드에서 직접 Supabase 호출
const { data } = await supabase.auth.signInWithOAuth({
  provider: 'google'
})
```

**새로운 방식 (직접 구현):**
```typescript
// 1. 프론트엔드: 백엔드 OAuth 엔드포인트로 리다이렉트
window.location.href = '/api/v1/auth/google'

// 2. 백엔드: OAuth 제공자로 리다이렉트
app.get('/api/v1/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
)

// 3. 콜백: JWT 토큰 생성 및 세션 저장
app.get('/api/v1/auth/google/callback',
  passport.authenticate('google', { session: false }),
  (req, res) => {
    const token = generateJWT(req.user)
    res.json({ token, user: req.user })
  }
)
```

#### 2.2.2 필요한 패키지

**Backend:**
```json
{
  "dependencies": {
    "pg": "^8.11.3",                    // PostgreSQL 클라이언트
    "passport": "^0.7.0",                // 인증 미들웨어
    "passport-google-oauth20": "^2.0.0", // Google OAuth
    "passport-naver": "^1.0.5",          // Naver OAuth
    "jsonwebtoken": "^9.0.2",            // JWT 생성/검증
    "bcrypt": "^5.1.1",                  // 비밀번호 해싱
    "express-session": "^1.17.3"         // 세션 관리 (선택)
  }
}
```

**Frontend:**
```json
{
  "dependencies": {
    "axios": "^1.6.2"                    // HTTP 클라이언트
  }
}
```

### 2.3 데이터베이스 연결 변경

#### 기존 (Supabase Client)

```typescript
// backend/src/utils/supabaseAdmin.ts (삭제 예정)
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export { supabase }
```

#### 새로운 방식 (PostgreSQL Pool)

```typescript
// backend/src/utils/db.ts (이미 존재 ✓)
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || '15.164.103.114',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'postgres',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export async function query(text: string, params?: any[]) {
  const res = await pool.query(text, params);
  return res;
}
```

---

## 3. 데이터베이스 스키마 검토

### 3.1 기존 스키마 (init-db.ts)

현재 데이터베이스에 이미 생성된 테이블들:

| 테이블 | 상태 | 비고 |
|--------|------|------|
| `users` | ✓ | 일반 사용자 (비밀번호 인증용) |
| `profiles` | ✓ | OAuth 사용자 + 온보딩 데이터 |
| `business_models` | ✓ | 비즈니스 모델 캔버스 |
| `business_model_blocks` | ✓ | 비즈니스 모델 블록 |
| `projects` | ✓ | 프로젝트 |
| `activity_logs` | ✓ | 활동 로그 |
| `onboarding_responses` | ✓ | 온보딩 응답 |
| `user_preferences` | ✓ | 사용자 설정 |
| `daily_priorities` | ✓ | 일일 우선순위 |
| `glossary` | ✓ | 용어 사전 |

### 3.2 추가로 필요한 테이블 (PRD/Epics 기반)

#### 3.2.1 Epic 2: Google Drive 연동

```sql
-- Google Drive OAuth 토큰 저장
CREATE TABLE google_drive_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    token_expiry TIMESTAMP WITH TIME ZONE,
    connected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_google_drive_tokens_user_id ON google_drive_tokens(user_id);

-- 연동된 문서 메타데이터
CREATE TABLE embedded_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    file_id TEXT NOT NULL,                -- Google Drive File ID
    file_name TEXT NOT NULL,
    file_type TEXT,                       -- 'application/pdf', etc.
    file_size INTEGER,
    embedding_id TEXT,                    -- RAG 벡터 ID
    is_business_doc BOOLEAN DEFAULT FALSE, -- 비즈니스 문서 여부
    is_verified BOOLEAN DEFAULT FALSE,     -- 미리 보기 검증 완료
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, file_id)
);

CREATE INDEX idx_embedded_documents_user_id ON embedded_documents(user_id);
CREATE INDEX idx_embedded_documents_is_business_doc ON embedded_documents(is_business_doc);
```

#### 3.2.2 Epic 3: AI 문서 생성

```sql
-- 생성된 문서 저장
CREATE TABLE generated_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    content_type TEXT NOT NULL,           -- 'government_form', 'ir_pitch_deck', etc.
    template_id TEXT,                     -- 사용된 템플릿 ID
    content JSONB NOT NULL,               -- 문서 구조화된 데이터
    status TEXT DEFAULT 'draft',          -- 'draft', 'generating', 'completed', 'failed'
    claude_api_usage JSONB,               -- API 사용량 추적
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_generated_documents_user_id ON generated_documents(user_id);
CREATE INDEX idx_generated_documents_status ON generated_documents(status);
CREATE INDEX idx_generated_documents_content_type ON generated_documents(content_type);

-- 문서 생성 프롬프트 히스토리
CREATE TABLE document_generation_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    document_id UUID REFERENCES generated_documents(id) ON DELETE SET NULL,
    prompt TEXT NOT NULL,
    context_sources TEXT[],               -- 참조한 임베딩 문서 ID들
    generation_time_ms INTEGER,           -- 생성 시간
    tokens_used INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 3.2.3 Epic 5: Team Collaboration

```sql
-- 팀
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_teams_owner_id ON teams(owner_id);

-- 팀원
CREATE TABLE team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL,                   -- 'owner', 'editor', 'viewer', 'commenter', 'reviewer'
    invited_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(team_id, user_id)
);

CREATE INDEX idx_team_members_team_id ON team_members(team_id);
CREATE INDEX idx_team_members_user_id ON team_members(user_id);

-- 팀원 초대 링크
CREATE TABLE team_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL,
    invited_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    accepted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_team_invitations_token ON team_invitations(token);
CREATE INDEX idx_team_invitations_email ON team_invitations(email);

-- 댓글
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type TEXT NOT NULL,            -- 'document', 'business_model', etc.
    entity_id UUID NOT NULL,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES comments(id) ON DELETE CASCADE, -- 대댓글
    content TEXT NOT NULL,
    mentions UUID[],                      -- @멘션한 사용자 ID들
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_comments_entity ON comments(entity_type, entity_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
```

#### 3.2.4 Epic 8: 버전 관리

```sql
-- 문서 버전
CREATE TABLE document_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES generated_documents(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    content JSONB NOT NULL,
    created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    change_summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(document_id, version_number)
);

CREATE INDEX idx_document_versions_document_id ON document_versions(document_id);
CREATE INDEX idx_document_versions_created_at ON document_versions(created_at DESC);
```

### 3.3 pgvector 확장 (RAG)

```sql
-- RAG를 위한 벡터 임베딩
CREATE EXTENSION IF NOT EXISTS vector;

-- 문서 청크 (Document Chunks for RAG)
CREATE TABLE document_chunks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES embedded_documents(id) ON DELETE CASCADE,
    chunk_index INTEGER NOT NULL,
    content TEXT NOT NULL,
    embedding vector(1536),               -- OpenAI embedding dimension
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_document_chunks_document_id ON document_chunks(document_id);
CREATE INDEX idx_document_chunks_embedding ON document_chunks USING ivfflat (embedding vector_cosine_ops);

-- Vector similarity search 함수
CREATE OR REPLACE FUNCTION match_documents(
    query_embedding vector(1536),
    match_count INT DEFAULT 5,
    user_id_filter UUID DEFAULT NULL
)
RETURNS TABLE (
    chunk_id UUID,
    document_id UUID,
    content TEXT,
    similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        dc.id as chunk_id,
        dc.document_id,
        dc.content,
        1 - (dc.embedding <=> query_embedding) as similarity
    FROM document_chunks dc
    JOIN embedded_documents ed ON dc.document_id = ed.id
    WHERE
        (user_id_filter IS NULL OR ed.user_id = user_id_filter)
    ORDER BY dc.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;
```

---

## 4. 환경 변수 변경

### 4.1 Backend (.env)

```bash
# 기존 (삭제)
SUPABASE_URL=your-project-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key

# 새로운 (추가)
DB_HOST=15.164.103.114
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=Entbe0421*

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=7d

# OAuth 2.0
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/v1/auth/google/callback

NAVER_CLIENT_ID=your-naver-client-id
NAVER_CLIENT_SECRET=your-naver-client-secret
NAVER_CALLBACK_URL=http://localhost:3000/api/v1/auth/naver/callback

# Claude API
ANTHROPIC_API_KEY=your-anthropic-api-key

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

### 4.2 Frontend (.env.local)

```bash
# 기존 (삭제)
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key

# 새로운 (추가)
VITE_API_URL=http://localhost:3000
VITE_APP_URL=http://localhost:5173
```

---

## 5. 아키텍처 업데이트

### 5.1 레이어드 아키텍처 (기존과 동일)

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend Layer                       │
│  (React + Vite + TypeScript + Tailwind CSS)            │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐ │
│  │   Pages     │  │  Components  │  │     Store      │ │
│  │  (Routes)   │  │   (UI/UX)    │  │   (Redux/Zustand)│ │
│  └─────────────┘  └──────────────┘  └────────────────┘ │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP (REST API)
                       ↓
┌─────────────────────────────────────────────────────────┐
│                   Backend Layer                         │
│              (Node.js + Express)                        │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐ │
│  │   Routes    │  │ Controllers  │  │   Middleware   │ │
│  │  (/api/v1/) │  │  (Business)  │  │ (Auth/Error)   │ │
│  └─────────────┘  └──────────────┘  └────────────────┘ │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐ │
│  │  Services   │  │    Utils     │  │   External     │ │
│  │  (Logic)    │  │  (Helpers)   │  │     APIs       │ │
│  └─────────────┘  └──────────────┘  └────────────────┘ │
└──────────────────────┬──────────────────────────────────┘
                       │ pg (Connection Pool)
                       ↓
┌─────────────────────────────────────────────────────────┐
│                  Database Layer                         │
│              (PostgreSQL + pgvector)                    │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐ │
│  │    Users    │  │  Documents   │  │     Teams      │ │
│  │  (Auth)     │  │  (RAG/Vectors)│  │  (Collaboration)│ │
│  └─────────────┘  └──────────────┘  └────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### 5.2 인증 흐름 변경

#### 기존 (Supabase)

```
Frontend                 Supabase
  │                         │
  ├─ signInWithOAuth() ────→│
  │                         ├─ OAuth Provider
  │                         │  (Google/Naver)
  │                         │←
  ├─ session ───────────────│
  │  (auto-refresh)         │
  │                         │
  ├─ authenticated request ─→
  │  (with JWT)             │← RLS check
  │← data                   │
```

#### 새로운 방식

```
Frontend                Backend              OAuth Provider
  │                       │                      │
  ├─ /auth/google ───────→│                      │
  │                       ├─ redirect ──────────→│
  │                       │                      │
  │                       │← callback ───────────│
  │                       │                      │
  │← {token, user} ───────┤                      │
  │                       │                      │
  ├─ /api/* (JWT header) ─→│                      │
  │                       ├─ verify JWT          │
  │                       ├─ check permissions   │
  │← data ─────────────────┤                      │
```

### 5.3 보안 계층 변경

#### 기존 (Supabase RLS)

```sql
-- Supabase RLS (Row Level Security)
ALTER TABLE business_models ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see own models"
ON business_models
FOR SELECT
USING (auth.uid() = user_id);
```

**장점:** 데이터베이스 레벨에서 자동 보안
**단점:** Supabase 종속

#### 새로운 방식 (미들웨어)

```typescript
// middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    req.userId = decoded.userId;
    req.userRole = decoded.role;

    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

export const authorize = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.userRole || !roles.includes(req.userRole)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};
```

**사용:**
```typescript
// routes/businessModels.routes.ts
router.get(
  '/',
  authenticate,
  async (req: AuthRequest, res) => {
    const result = await query(
      'SELECT * FROM business_models WHERE user_id = $1',
      [req.userId]
    );
    res.json(result.rows);
  }
);
```

---

## 6. 이전 가능한 코드 vs 다시 작성해야 하는 코드

### 6.1 그대로 사용 가능

| 구분 | 상태 | 비고 |
|------|------|------|
| **DB 스키마** | ✓ | `init-db.ts` 이미 PostgreSQL 직접 연결 |
| **DB Pool** | ✓ | `db.ts` 이미 `pg` 사용 |
| **Business Models API** | ✓ | 이미 PostgreSQL 쿼리 사용 |
| **프로젝트 구조** | ✓ | Monorepo 구조 유지 |
| **타입 정의** | ✓ | `shared/types/` 그대로 사용 |

### 6.2 완전히 다시 작성 필요

| 구분 | 원인 | 예상 작업량 |
|------|------|------------|
| **인증 시스템** | Supabase Auth → JWT/Passport.js | 2-3일 |
| **OAuth 흐름** | Supabase 자동 처리 → 직접 구현 | 1-2일 |
| **프론트엔드 Auth Hook** | `useSupabase()` → `useAuth()` | 1일 |
| **API Client** | Supabase Client → axios/fetch | 0.5일 |
| **환경 변수** | `.env` 파일 전면 재작성 | 0.5일 |
| **RLS 정책** | DB RLS → 미들웨어 권한 체크 | 1일 |
| **세션 관리** | Supabase 자동 → 직접 구현 | 1일 |

**총 예상 작업량: 7-9일**

---

## 7. 영향 평가 (Epics별)

### 7.1 Epic 1: User Onboarding & Personalization (영향: 낮음)

- **영향받는 부분:**
  - `profiles` 테이블 이미 존재 ✓
  - `onboarding_responses` 테이블 이미 존재 ✓
  - OAuth 로그인만 변경 필요

- **작업:**
  - OAuth 콜백 후 `profiles` 테이블에 사용자 생성/업데이트
  - JWT 토큰 발급

### 7.2 Epic 2: Google Drive Integration (영향: 중간)

- **영향받는 부분:**
  - OAuth 2.0 흐름 재구현 필요
  - Access Token/Refresh Token 저장 로직

- **작업:**
  - `google_drive_tokens` 테이블 생성
  - Passport.js Google Strategy 구현
  - Token 갱신 로직 구현

### 7.3 Epic 3: AI Document Generation (영향: 낮음)

- **영향받는 부분:**
  - Claude API 호출 로직은 동일
  - RAG 쿼리는 `pgvector` 사용으로 동일

- **작업:**
  - 인증된 사용자만 생성 가능하도록 미들웨어 추가

### 7.4 Epic 5: Team Collaboration (영향: 높음)

- **영향받는 부분:**
  - 권한 시스템 전면 재구현
  - Supabase RLS → 미들웨어 권한 체크

- **작업:**
  - `team_members` 테이블의 `role` 필드 활용
  - `authorize(['owner', 'editor'])` 미들웨어 구현

### 7.5 Epic 8: Real-time Collaboration (영향: 중간)

- **영향받는 부분:**
  - 실시간 동시 편집 (Polling → WebSocket)
  - 충돌 해결 전략

- **작업:**
  - WebSocket 연결 시 JWT 인증 필요
  - 사용자별 권한 체크

---

## 8. 위험 요소 및 완화 계획

### 8.1 위험 요소

| 위험 | 영향 | 확률 | 완화 계획 |
|------|------|------|----------|
| **OAuth 구현 복잡도** | 높음 | 중간 | Passport.js 사용, 테스트 커버리지 확보 |
| **JWT 보안** | 높음 | 낮음 | HTTPS 강제, 짧은 만료, Refresh Token 구현 |
| **RLS 제거로 인한 보안 취약점** | 높음 | 중간 | 모든 쿼리에 `user_id` 체크, 단위 테스트 강화 |
| **세션 관리 버그** | 중간 | 중간 | 명확한 세션 정책, 로그아웃 처리 |
| **마이그레이션 데이터 유실** | 높음 | 낮음 | 백업 후 마이그레이션, 롤백 계획 |

### 8.2 롤백 계획

**마이그레이션 실패 시:**
1. 기존 Supabase 프로젝트 유지 (읽기 전용)
2. 데이터베이스 덤프에서 복구
3. Git 이전 커밋으로 롤백

---

## 9. 다음 단계 (Action Items)

### Phase 1: 인증 시스템 재구현 (3-4일)

1. **Backend - Passport.js 설정**
   - [ ] Google OAuth Strategy 구현
   - [ ] Naver OAuth Strategy 구현
   - [ ] JWT 생성/검증 미들웨어 작성
   - [ ] 인증 라우트 작성 (`/api/v1/auth/*`)

2. **Database - OAuth 테이블**
   - [ ] `profiles` 테이블에 `google_id`, `naver_id` 추가 (이미 있음)
   - [ ] `google_drive_tokens` 테이블 생성
   - [ ] Access Token 갱신 로직

3. **Frontend - Auth Context**
   - [ ] `useAuth` Hook 작성
   - [ ] 로그인 페이지 구현
   - [ ] OAuth 리다이렉트 핸들링

### Phase 2: API 업데이트 (2-3일)

1. **모든 라우트에 인증 미들웨어 추가**
   - [ ] `authenticate` 미들웨어 적용
   - [ ] `authorize` 미들웨어 적용 (팀 기능)

2. **쿼리에 `user_id` 필터링 추가**
   - [ ] 모든 SELECT 쿼리에 `WHERE user_id = $1` 추가
   - [ ] 단위 테스트로 권한 체크

3. **Supabase Client 제거**
   - [ ] `@supabase/supabase-js` 패키지 제거
   - [ ] 환경 변수 정리

### Phase 3: 테스트 및 디버깅 (2일)

1. **인테그레이션 테스트**
   - [ ] OAuth 흐름 테스트 (Google, Naver)
   - [ ] JWT 만료/갱신 테스트
   - [ ] 권한 체크 테스트

2. **프론트엔드 테스트**
   - [ ] 로그인/로그아웃 흐름
   - [ ] API 호출 인증 헤더
   - [ ] 401/403 에러 핸들링

---

## 10. 결론

### 핵심 변화 요약

1. **인증:** Supabase Auth → JWT + Passport.js
2. **데이터베이스:** Supabase → 직접 호스팅 PostgreSQL
3. **보안:** RLS → 미들웨어 권한 체크
4. **OAuth:** 자동 처리 → 직접 구현

### 예상 소요 시간

- **인증 시스템 재구현:** 3-4일
- **API 업데이트:** 2-3일
- **테스트 및 디버깅:** 2일
- **총:** 7-9일

### 승인 필요 사항

이 코스 교정 문서를 승인하면 다음 워크플로우를 진행합니다:

1. **[create-architecture]** - 업데이트된 아키텍처 문서 작성
2. **[quick-dev]** - 인증 시스템부터 단계별 구현

---

**상태:** 🔄 승인 대기 중

**작성자:** Product Manager John
**승인자:** ___________________ (Donggyu)

**승인일:** ___________________
