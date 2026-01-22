---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
inputDocuments:
  - /Users/donggyu/bm-builder/_bmad-output/planning-artifacts/prd.md
  - /Users/donggyu/bm-builder/_bmad-output/planning-artifacts/product-brief-bm-builder-2026-01-09.md
  - /Users/donggyu/bm-builder/_bmad-output/planning-artifacts/course-correction-2026-01-18.md
  - /Users/donggyu/bm-builder/_bmad-output/planning-artifacts/epics.md
  - /Users/donggyu/bm-builder/_bmad-output/planning-artifacts/ux-design-specification.md
  - /Users/donggyu/bm-builder/_bmad-output/project-context.md
workflowType: 'architecture'
project_name: 'bm-builder'
user_name: 'Donggyu'
date: '2026-01-18'
lastStep: 8
status: complete
completedAt: 2026-01-18
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

---

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
총 72개 Functional Requirements (63 MVP + 9 Post-MVP)가 18개 Capability Area로 구성됨:

**MVP 우선순위 (3개월, 코스 교정 반영):**

**Phase 1 - 핵심 (Must-Have):**
1. **AI Document Generation** (FR11-16): Claude 4.5 멀티모달 생성, 5개 정부지원사업 양식, IR 자료
2. **Document Embedding & Context Management** (FR17-21): RAG 시스템 (pgvector), Google Drive 연동, 최대 100개 문서
3. **User Onboarding & Personalization** (FR1-5): AI 기반 비전 이해 인터뷰, 개인화된 경험

**Phase 2 - 중요 (Should-Have):**
4. **User Interface & Experience** (FR33-38): Dark Mode (자동 감지), 반응식 디자인, 프로그레시브 스트리밍 (10초 첫 화면)
5. **Team Collaboration** (FR22-27): 세분화된 권한 (5가지 역할), Polling 기반 협업 (30초 간격)
6. **Dashboard & Analytics** (FR60-61): 진행 상황 시각화, 성취감 강조

**Phase 3 - 선택적 (Nice-to-Have, Post-MVP):**
7. **Visual Workflow Management** (FR6-10): React Flow 기반 Node UI, 무한 캔버스 (6개월 이후)
8. **Real-time Collaboration** (FR62-64): WebSocket 실시간 커서, @멘션 (9개월 이후)
9. **Advanced Features** (FR65-72): 버전 관리, 관리자 대시보드, 벌크 라이선스

**Non-Functional Requirements:**
총 20개 NFR이 아키텍처 결정을 주도:

**Performance (3개) - MVP 현실적 조정:**
- 문서 생성: 30초 (간단)/2분 (복잡), 초기 500자 10초 프로그레시브 스트리밍
- Simple Form UI: 100ms 반응 (Node UI는 Post-MVP)
- 동시 편집: Polling 30초 (MVP), WebSocket 1초 (Post-MVP)

**Security (4개) - ⭐ 코스 교정으로 인한 중요 변경사항:**
- 데이터 암호화: TLS 1.3, AES-256
- 인증: **JWT + Passport.js** (OAuth 2.0: Google, Naver 직접 구현)
- 개인정보: 개인정보보호법, GDPR 준수
- 결제: PCI-DSS (PG사 통해, 6개월 이후)

**Scalability (3개) - 단순화:**
- 동시 사용자: 100명 (MVP) → 500명 (6개월)
- 저장: 5GB/사용자 (기존 10GB 축소), 50MB 단일 파일, 100개 임베딩 문서
- API: 월 50회 (프리티어), 300회 (Basic)

**Accessibility (3개):**
- WCAG 2.1 AA 준수
- 다국어: 한국어 완벽, 영어 (Post-MVP)
- 반응식: iOS 15+, Android 12+, Chrome 110+

**Integration (3개) - ⭐ 코스 교정 반영:**
- Google Drive: **직접 OAuth 2.0 구현** (Passport.js Google Strategy)
- AI API: Claude 4.5만 (GLM Fallback은 Post-MVP)
- RAG: **직접 PostgreSQL + pgvector**, 70% 정확도 Top-5, 100개 문서 한도

**Reliability (4개):**
- 가용성: 99.5% Uptime (기존 99.9% 완화)
- 백업: 일일 새벽 3시, 7일 보관 (기존 30일 축소)
- 재해 복구: RTO 8시간 (기존 4시간 완화)
- 장애 대응: 5분 Slack 알림

**Scale & Complexity:**
- Primary domain: **AI-powered Document Generation SaaS**
- Complexity level: **Medium-High** (기존 Medium에서 상향 조정)
  - 이유: OAuth 직접 구현, JWT 미들웨어, 권한 시스템 재구현, RAG 시스템
- 핵심 복잡도: RAG 시스템 (pgvector), AI API 통합 (Claude 4.5), OAuth 2.0 인증 흐름, 멀티 테넌시

### Technical Constraints & Dependencies

**기술적 제약사항 (MVP 단순화 + 코스 교정 반영):**

**Frontend:**
- React 19 (Vite 5.1) - Simple Form UI (React Flow는 Post-MVP)
- TypeScript 5.3 (Strict Mode)
- Tailwind CSS 3.4
- Redux Toolkit 2.10.1 (상태 관리)
- **Axios 1.6.2** (HTTP Client - Supabase Client 제거)

**Backend:**
- **Node.js 22 LTS** (기존 Node.js 20+에서 업그레이드)
- Express 4.19
- TypeScript 5.3 (Strict Mode)
- **pg 8.11.3** (PostgreSQL 직접 연결 - Supabase Client 제거)
- **pgvector 0.5.0** (RAG용 PostgreSQL 확장)

**Database:**
- **PostgreSQL 15** (호스팅 서버: 15.164.103.114:5432)
- **pgvector 확장** (벡터 임베딩, 유사도 검색)
- **JWT 인증** (Supabase Auth 제거)
- **Passport.js** (OAuth 2.0: Google, Naver Strategy)

**AI Model:**
- Claude 4.5만 (GLM 4.7은 Post-MVP)

**Infrastructure:**
- Frontend: AWS S3 + CloudFront (기존 Vercel 유지 가능)
- Backend: AWS EC2 t3.medium (기존 Railway/Render에서 변경)
- Database: 호스팅 서버 PostgreSQL (Supabase 제거)

**⭐ 코스 교정으로 인한 기술적 의존성 변경:**
- **제거:** Supabase Auth, Supabase Client, `@supabase/supabase-js`, Row Level Security (RLS)
- **추가:** Passport.js, passport-google-oauth20, passport-naver, jsonwebtoken, bcrypt, pg (PostgreSQL Pool)

**필수 통합 (MVP):**
- Google Drive API (OAuth 2.0 - Passport.js Google Strategy)
- Claude API (Anthropic)
- PostgreSQL (pgvector 확장 + JWT 인증)

### Cross-Cutting Concerns Identified

**1. 인증 및 권한 관리 (Authentication & Authorization)** ⭐ 가장 중요
- **모든 API 엔드포인트에 JWT 미들웨어 적용**
- Passport.js Strategy로 OAuth 2.0 (Google, Naver) 구현
- 역할 기반 접근 제어 (RBAC): Owner, Editor, Viewer, Commenter, Reviewer
- JWT 토큰 생성/검증/갱신
- OAuth Access Token/Refresh Token 관리 (Google Drive)

**2. 사용자 컨텍스트 (User Context)**
- RAG로 개인화된 문서 생성
- 사용자별 임베딩된 문서 활용
- 온보딩 응답 기반 AI 제안

**3. 멀티 테넌시 (Multi-tenancy)**
- 팀별 권한 격리
- 소유권 확인 (모든 쿼리에 `user_id` 필터링)
- 팀원 역할별 권한 체크

**4. 성능 최적화 (Performance)**
- 프로그레시브 스트리밍 (AI 문서 생성)
- PostgreSQL Connection Pool 관리
- Polling vs WebSocket 전략 (MVP: Polling 30초, Post-MVP: WebSocket)
- 캐싱 전략 (Redis 선택사항)

**5. 보안 (Security)** ⭐ 코스 교정으로 인해 중요도 상승
- **SQL Injection 방지:** 모든 쿼리는 parameterized query ($1, $2, ...)만 사용
- **HTTPS 강제:** 모든 API는 HTTPS만
- **환경변수 관리:** 민감 정보 (DB_PASSWORD, CLAUDE_API_KEY, JWT_SECRET)는 Backend 환경변수로만
- **CORS 설정:** Frontend URL만 허용

**6. 데이터 일관성 (Data Consistency)**
- Transaction으로 원자성 보장 (연관된 쿼리는 묶어서 실행)
- Optimistic Locking (동시 편집 충돌 해결)
- "마지막 저장 우선" 전략 (MVP), OT/CRDT (Post-MVP)

**7. 에러 처리 (Error Handling)**
- 일관된 API Response Wrapper (discriminated union)
- 감정적 에러 메시지 (사용자 친화적)
- SLA 기반 장애 알림 (5분 Slack 알림)

**8. 모니터링 및 로깅 (Monitoring & Logging)**
- AWS CloudWatch (Backend 로그, 메트릭)
- AI API 사용량 추적
- 사용자 활동 로그 (누가 무엇을 수정했는지)

---

**다음 단계:** Starter Template Evaluation (Step 3)

---

## Starter Template Evaluation

### Primary Technology Domain

**Full-stack Web Application** (React + Node.js/Express + PostgreSQL)
- Monorepo 구조 (frontend/, backend/, shared/)
- SaaS 플랫폼
- AI-powered 문서 생성
- Medium-High 복잡도 (OAuth 직접 구현, JWT 미들웨어, RAG 시스템)

### Starter Options Considered

**1. Vite React TypeScript Starter (2026)**

검토: [The 2026 Frontend Stack: React 19, Vite 7](https://javascript.plainenglish.io/%EC%9D%B4%EB%A0%88%EA%B2%8C-%EC%8B%9C%EC%9E%91%ED%95%98%EC%84%B8%EC%9A%94-react-19-vite-7-%EC%B5%9C%EC%A0%81%EC%9D%B8-spa-%EC%8A%A4%ED%83%9D-17cda4841e2d)

- 최신 React 19 + Vite 7
- Tailwind CSS v4
- TypeScript strict mode
- 장점: 최신 스택, 빠른 빌드
- 단점: Backend 포함 안 함

**2. Express TypeScript Boilerplate**

검토: [w3tecch/express-typescript-boilerplate](https://github.com/w3tecch/express-typescript-boilerplate)

- Express + TypeScript + PostgreSQL
- Passport.js 인증
- Jest 테스트
- 장점: Backend 완벽, PostgreSQL 지원
- 단점: Frontend 포함 안 함

**3. Full-Stack Monorepo Starter**

검토: [MajorLift/typescript-fullstack-monorepo-starter](https://github.com/MajorLift/typescript-fullstack-monorepo-starter)

- Monorepo 구조
- Webpack + TypeScript
- 장점: 전체 스택
- 단점: Vite 사용 안 함 (우리는 Vite 선호)

### Selected Starter: Custom Monorepo (Already Configured)

**Rationale for Selection:**

기존 프로젝트가 **이미 최신 버전**으로 완벽하게 설정되어 있습니다! 새로운 starter template 사용 불필요.

**기존 설정의 장점:**
1. **Frontend:** React 19.0 + Vite 7.3.1 + TypeScript 5.3.3 (최신)
2. **Backend:** Express 4.19.2 + TypeScript 5.3.3 (안정적 최신)
3. **Database:** pg 8.11.3 (PostgreSQL 직접 연결) ✨ 코스 교정 반영 완료
4. **인증:** Passport.js 0.7.0 + JWT 9.0.3 ✨ 코스 교정 반영 완료
5. **Monorepo:** frontend/, backend/, shared/ 구조
6. **상태 관리:** Redux Toolkit 2.10.1
7. **라우팅:** React Router 7.12.0
8. **스타일링:** Tailwind CSS 3.4.1

**필요한 작업 (코스 교정):**
- ✅ Supabase 제거 (`@supabase/supabase-js` 패키지)
- ✅ Naver OAuth Strategy 추가 (`passport-naver`)
- ✅ 기존 코드 정리 및 재구성

### Architectural Decisions Provided by Starter

**Language & Runtime:**
- **Frontend:** TypeScript 5.3.3 (Strict Mode), React 19.0
- **Backend:** TypeScript 5.3.3 (Strict Mode), Node.js 22 LTS
- **모듈 시스템:** ES Modules (`"type": "module"`)

**Styling Solution:**
- **Tailwind CSS 3.4.1** (Utility-first)
- **PostCSS** + **Autoprefixer**
- **clsx** + **tailwind-merge** (조건부 스타일링)
- **lucide-react** (아이콘)

**Build Tooling:**
- **Frontend:** Vite 7.3.1
  - HMR (Hot Module Replacement)
  - 빠른 빌드 시간
  - Production 최적화
- **Backend:** tsc (TypeScript Compiler)
  - ts-node (개발용)
  - nodemon (자동 재시작)

**Testing Framework:**
- **Frontend:** Vitest 1.2.2 + Testing Library
- **Backend:** Jest 29.7.0 + ts-jest

**Code Organization:**
- **Monorepo 패턴:**
  ```
  bm-builder/
  ├── frontend/          # React + Vite
  │   ├── src/
  │   │   ├── api/              # API 호출
  │   │   ├── components/       # UI 컴포넌트
  │   │   ├── hooks/            # Custom React Hooks
  │   │   ├── pages/            # 페이지/라우트
  │   │   ├── store/            # Redux Toolkit
  │   │   └── types/            # TypeScript 타입
  │   └── package.json
  ├── backend/           # Express + TypeScript
  │   ├── src/
  │   │   ├── controllers/      # Request handlers
  │   │   ├── middleware/       # Express middleware
  │   │   ├── routes/           # API routes
  │   │   ├── services/         # Business logic
  │   │   └── utils/            # Helpers (db.ts, auth.ts)
  │   └── package.json
  ├── shared/types/      # 공통 타입 정의
  └── _bmad-output/      # 문서 출력
  ```
- **Path Aliases:** `@/*` (frontend), `@shared/types` (전체)

**Development Experience:**
- **Frontend:**
  - Vite dev server (http://localhost:5173)
  - HMR 지원
  - TypeScript strict mode
  - ESLint (선택사항)
- **Backend:**
  - nodemon (자동 재시작)
  - ts-node (타입스크립트 직접 실행)
  - 환경변수 관리 (dotenv)

**초기화 명령어:**

프로젝트가 이미 초기화되어 있으므로 다음 작업만 필요:

```bash
# 1. Supabase 패키지 제거 (Frontend)
cd frontend
npm uninstall @supabase/supabase-js

# 2. Naver OAuth Strategy 추가 (Backend)
cd ../backend
npm install passport-naver

# 3. 개발 서버 시작
# Frontend
cd frontend && npm run dev

# Backend
cd backend && npm run dev
```

**Note:** 프로젝트 초기화는 이미 완료되었습니다! 첫 번째 구현 스토리는 "Supabase 제거 및 Naver OAuth 추가"입니다.


---

## Core Architectural Decisions

### Decision Priority Analysis

**⭐ 가장 중요한 결정 (P0 - 코스 교정 핵심):**

1. **인증 시스템 (Authentication System)**
   - JWT + Passport.js (Supabase Auth 제거)
   - OAuth 2.0 Strategies: Google, Naver
   - 미들웨어 기반 권한 체크 (RLS 제거)
   
2. **데이터베이스 연결 (Database Connection)**
   - 직접 PostgreSQL Pool (`pg` 패키지)
   - parameterized queries only (SQL Injection 방지)
   
3. **API Response 형식 (API Response Format)**
   - Discriminated Union (성공/실패 타입 안전성)

**중요한 결정 (P1):**

4. **상태 관리 (State Management)**
   - Redux Toolkit (Frontend)
   - createAsyncThunk (비동기 로직)
   
5. **실시간 협업 (Real-time Collaboration)**
   - MVP: Polling 30초
   - Post-MVP: WebSocket

**선택적 결정 (P2 - Post-MVP):**

6. **Node UI** (React Flow, 6개월 이후)
7. **WebSocket** (실시간 커서, 9개월 이후)

### Frontend Architecture

**컴포넌트 구조:**
```
src/
├── pages/              # 라우트 페이지
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   └── DocumentGenerationPage.tsx
├── components/
│   ├── ui/             # 재사용 가능한 UI 컴포넌트
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   └── Modal.tsx
│   └── features/       # 기능별 컴포넌트
│       ├── onboarding/
│       ├── documents/
│       └── team/
├── hooks/              # Custom React Hooks
│   ├── useAuth.ts      # 인증 로직
│   └── useDocumentGeneration.ts
├── api/                # API 호출 레이어
│   ├── client.ts       # Axios 인스턴스
│   ├── authApi.ts
│   └── documentApi.ts
├── store/              # Redux Toolkit
│   └── slices/
│       ├── authSlice.ts
│       └── documentSlice.ts
└── types/              # TypeScript 타입
```

**상태 관리 전략:**
- **전역 상태:** Redux Toolkit (인증, 사용자, 팀)
- **로컬 상태:** useState, useReducer (컴포넌트 내부)
- **서버 상태:** React Query/SWR (선택사항, Post-MVP)

### Data Architecture

**데이터베이스 스키마 (PostgreSQL):**

**기존 테이블 (이미 생성됨):**
- `users` - 일반 사용자 (비밀번호 인증용)
- `profiles` - OAuth 사용자 + 온보딩 데이터
- `business_models` - 비즈니스 모델 캔버스
- `business_model_blocks` - 비즈니스 모델 블록
- `projects` - 프로젝트
- `activity_logs` - 활동 로그
- `onboarding_responses` - 온보딩 응답
- `user_preferences` - 사용자 설정
- `daily_priorities` - 일일 우선순위
- `glossary` - 용어 사전

**추가 필요한 테이블 (Epic 2-8):**
- `google_drive_tokens` - Google Drive OAuth 토큰
- `embedded_documents` - 임베딩된 문서 메타데이터
- `document_chunks` - RAG용 문서 청크 (pgvector)
- `generated_documents` - 생성된 문서
- `teams` - 팀
- `team_members` - 팀원
- `team_invitations` - 팀원 초대
- `comments` - 댓글
- `document_versions` - 문서 버전

**데이터 접근 패턴:**
```typescript
// backend/src/services/document.service.ts
import { pool } from '../utils/db';

export async function getUserDocuments(userId: string) {
  const result = await pool.query(
    'SELECT * FROM documents WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  );
  return result.rows;
}
```

**RAG 시스템 (pgvector):**
```typescript
// Vector similarity search
const result = await pool.query(
  `SELECT id, content, 1 - (embedding <=> $1) as similarity
   FROM document_chunks
   WHERE user_id = $2
   ORDER BY embedding <=> $1
   LIMIT 5`,
  [queryEmbedding, userId]
);
```

### Authentication & Security

**⭐ 인증 흐름 (JWT + Passport.js):**

**1. OAuth 2.0 (Google, Naver):**
```typescript
// backend/src/routes/auth.routes.ts
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/api/v1/auth/google/callback'
  },
  async (accessToken, refreshToken, profile, done) => {
    // 사용자 생성/업데이트
    const user = await upsertUser(profile);
    return done(null, user);
  }
));

// OAuth 엔드포인트
app.get('/auth/google', passport.authenticate('google'));
app.get('/auth/google/callback', 
  passport.authenticate('google', { session: false }),
  (req, res) => {
    const token = generateJWT(req.user);
    res.json({ success: true, data: { token, user: req.user }});
  }
);
```

**2. JWT 미들웨어:**
```typescript
// backend/src/middleware/auth.middleware.ts
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
      return res.status(401).json({ 
        success: false, 
        error: { code: 'NO_TOKEN', message: '토큰이 없습니다' }
      });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    
    next();
  } catch (error) {
    res.status(401).json({ 
      success: false, 
      error: { code: 'INVALID_TOKEN', message: '유효하지 않은 토큰' }
    });
  }
};

export const authorize = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.userRole || !roles.includes(req.userRole)) {
      return res.status(403).json({ 
        success: false, 
        error: { code: 'INSUFFICIENT_PERMISSIONS', message: '권한이 부족합니다' }
      });
    }
    next();
  };
};
```

**3. 사용 예시:**
```typescript
// protected route
router.get('/documents', authenticate, async (req: AuthRequest, res) => {
  const result = await pool.query(
    'SELECT * FROM documents WHERE user_id = $1',
    [req.userId]  // ✅ 항상 user_id 필터링
  );
  res.json({ success: true, data: result.rows });
});

// admin only route
router.delete('/documents/:id', 
  authenticate, 
  authorize(['owner', 'admin']),
  async (req: AuthRequest, res) => {
    // ...
  }
);
```

**보안 레이어:**
1. **TLS 1.3:** 모든 통신은 HTTPS만
2. **JWT:** 7일 만료, Refresh Token 구현
3. **Bcrypt:** 비밀번호 해싱 (rounds: 10)
4. **Helmet.js:** 보안 헤더 설정
5. **CORS:** Frontend URL만 허용
6. **Rate Limiting:** API 호출 제한 (express-rate-limit)

### API & Communication Patterns

**RESTful API 설계:**
```
GET    /api/v1/documents          # 목록 조회
GET    /api/v1/documents/:id      # 단일 조회
POST   /api/v1/documents          # 생성
PUT    /api/v1/documents/:id      # 전체 업데이트
PATCH  /api/v1/documents/:id      # 부분 업데이트
DELETE /api/v1/documents/:id      # 삭제
```

**API Response Wrapper (Discriminated Union):**
```typescript
// shared/types/api.ts
export type ApiResponse<T, E = ApiError> = 
  | { success: true; data: T }
  | { success: false; error: E };

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

// 사용 예시
const response = await fetchDocuments();
if (response.success) {
  console.log(response.data.title);  // ✅ TypeScript가 타입 추론
} else {
  console.error(response.error.code); // ✅ TypeScript가 타입 추론
}
```

**에러 처리:**
```typescript
// backend/src/utils/errorHandler.ts
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string
  ) {
    super(message);
  }
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message
      }
    });
  }
  
  // Unexpected error
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: '예기치 않은 오류가 발생했습니다'
    }
  });
};
```

**비동기 작업 처리 (AI 문서 생성):**
```typescript
// Progressive Streaming (Server-Sent Events)
app.get('/api/v1/documents/generate/:id/stream', authenticate, async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  
  const stream = await claudeService.streamDocument(prompt);
  
  for await (const chunk of stream) {
    res.write(`data: ${JSON.stringify({ chunk: chunk.content })}\n\n`);
  }
  
  res.end();
});
```

### Infrastructure & Deployment

**프로덕션 환경:**

**Frontend:**
- **호스팅:** AWS S3 + CloudFront
- **CDN:** CloudFront (글로벌 분산)
- **HTTPS:** ACM (AWS Certificate Manager)
- **빌드:** `npm run build` → `dist/` 폴더
- **배포:** S3에 업로드 + CloudFront 캐시 무효화

**Backend:**
- **호스팅:** AWS EC2 t3.medium
- **OS:** Ubuntu 22.04 LTS
- **Process Manager:** PM2 (Node.js 프로세스 관리)
- **Reverse Proxy:** Nginx
- **HTTPS:** Let's Encrypt (Certbot)

**Database:**
- **호스팅:** 호스팅 서버 (15.164.103.114:5432)
- **PostgreSQL:** 15
- **확장:** pgvector 0.5.0
- **백업:** 일일 새벽 3시, 7일 보관

**CI/CD:**
```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build & Deploy
        run: |
          cd frontend
          npm install
          npm run build
          aws s3 sync dist/ s3://bm-builder-frontend
          aws cloudfront create-invalidation --distribution-id XXX

  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to EC2
        run: |
          ssh ubuntu@ec2-xxx "cd /app && git pull && npm install && npm run build && pm2 restart all"
```

**모니터링:**
- **AWS CloudWatch:** 로그, 메트릭, 알림
- **Health Check:** `/health` 엔드포인트
- **SLA:** 99.5% Uptime

---

## Implementation Patterns & Consistency Rules

### 충돌 방지 패턴 (AI 에이전트를 위한 규칙)

이 섹션은 AI 에이전트가 코드를 구현할 때 따라야 할 **중요한 규칙과 패턴**을 정의합니다. 충돌을 방지하고 일관성을 유지하기 위한 가이드라인입니다.

### 5.1 충돌 포인트 분석

**🔴 높은 충돌 위험 (Critical):**

1. **인증 방식 혼용** ⭐ 가장 중요
   - ❌ Supabase Auth + JWT 혼용
   - ✅ **JWT만 사용** (Supabase 완전 제거)
   
2. **데이터베이스 쿼리 방식**
   - ❌ String concatenation 쿼리
   - ✅ **Parameterized queries only** ($1, $2, ...)
   
3. **API Response 형식**
   - ❌ Optional 속성 (`data?: T`)
   - ✅ **Discriminated Union** (`{ success: true; data: T } | { success: false; error: E }`)

**🟡 중간 충돌 위험 (Medium):**

4. **상태 관리**
   - ❌ useState로 전역 상태 관리
   - ✅ **Redux Toolkit** (전역 상태)
   
5. **API 호출 위치**
   - ❌ 컴포넌트에서 직접 axios 호출
   - ✅ **api/ 폴더에서만 호출** → Redux Thunk

### 5.2 네이밍 패턴

**5.2.1 데이터베이스 테이블 & 컬럼 (PostgreSQL)**
- **테이블:** `snake_case` (예: `user_profiles`, `embedded_documents`)
- **컬럼:** `snake_case` (예: `created_at`, `document_id`)
- **Primary Keys:** `id` (UUID)
- **Foreign Keys:** `{table}_id` (예: `user_id`, `document_id`)

**5.2.2 API 엔드포인트 (Express REST)**
- **엔드포인트:** `kebab-case` (예: `/api/v1/document-generation`)
- **Request/Response Bodies:** `camelCase` (예: `documentId`, `fileName`)

**5.2.3 React 컴포넌트**
- **파일명:** `PascalCase.tsx` (예: `DocumentEditor.tsx`, `TeamDashboard.tsx`)
- **Props:** `PascalCase` interface (예: `interface DocumentEditorProps`)
- **Hooks:** `camelCase` with `use` prefix (예: `useDocumentGeneration.ts`)

**5.2.4 Redux Toolkit Slices**
- **파일명:** `camelCaseSlice.ts` (예: `documentSlice.ts`, `authSlice.ts`)
- **Actions:** `camelCase` (예: `setDocuments`, `addDocument`)
- **Selectors:** `selectCamelCase` (예: `selectDocuments`, `selectCurrentDocument`)

**5.2.5 Backend Services**
- **파일명:** `camelCase.service.ts` (예: `document.service.ts`, `rag.service.ts`)
- **Controllers:** `camelCase.controller.ts` (예: `document.controller.ts`)

**5.2.6 TypeScript 타입**
- **Shared Types:** `@shared/types` import (예: `import { User } from '@shared/types'`)

### 5.3 구조 패턴

**5.3.1 프로젝트 디렉토리 구조**

```
bm-builder/
├── frontend/
│   ├── src/
│   │   ├── api/              # ✅ API 호출 레이어
│   │   │   ├── client.ts      # Axios HTTP client
│   │   │   ├── authApi.ts     # 인증 API
│   │   │   └── documentApi.ts # 문서 API
│   │   ├── components/
│   │   │   ├── ui/            # 재사용 가능한 UI
│   │   │   └── features/      # 기능별 컴포넌트
│   │   ├── hooks/             # Custom React Hooks
│   │   ├── pages/             # 페이지/라우트
│   │   ├── store/             # Redux Toolkit
│   │   │   └── slices/
│   │   ├── types/             # TypeScript 타입
│   │   └── utils/             # 유틸리티 함수
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── controllers/       # Request handlers
│   │   ├── middleware/        # Express middleware
│   │   │   ├── auth.middleware.ts    # JWT 인증
│   │   │   └── errorHandler.ts       # 에러 처리
│   │   ├── routes/            # API routes
│   │   │   └── v1/
│   │   ├── services/          # Business logic
│   │   │   ├── auth.service.ts
│   │   │   ├── document.service.ts
│   │   │   └── claude.service.ts
│   │   └── utils/
│   │       ├── db.ts          # PostgreSQL Pool
│   │       └── auth.ts        # JWT 생성/검증
│   └── package.json
└── shared/
    └── types/
        ├── api.ts             # 공통 API 타입
        ├── user.ts            # 사용자 타입
        └── document.ts        # 문서 타입
```

**5.3.2 파일 organization 규칙**

**Frontend:**
- `api/` - API 호출만 담당, 비즈니스 로직 ❌
- `store/slices/` - 전역 상태만, 로컬 상태는 useState
- `hooks/` - 재사용 가능한 로직만

**Backend:**
- `controllers/` - Request 처리, Response 반환
- `services/` - 비즈니스 로직, 데이터베이스 쿼리
- `middleware/` - 인증, 에러 처리, 로깅
- `utils/` - 헬퍼 함수 (db.ts, auth.ts)

### 5.4 포맷 패턴

**5.4.1 API Response 형식 (Standardized Wrapper)**

```typescript
// ✅ GOOD: Discriminated Union
type ApiResponse<T, E = ApiError> = 
  | { success: true; data: T }
  | { success: false; error: E };

// ❌ BAD: Optional 속성
interface ApiResponse<T> {
  data?: T;
  error?: string;  // 런타임 에러 가능!
}
```

**5.4.2 데이터 교환 형식**

**Request Body:**
```typescript
// ✅ camelCase
interface CreateDocumentRequest {
  title: string;
  content: string;
  templateId?: string;
}
```

**Database Response:**
```typescript
// ✅ snake_case (DB) → camelCase (API)
interface UserRow {
  user_id: string;
  full_name: string;
  created_at: Date;
}

interface User {
  userId: string;
  fullName: string;
  createdAt: Date;
}

// 변환 함수
function toUser(row: UserRow): User {
  return {
    userId: row.user_id,
    fullName: row.full_name,
    createdAt: row.created_at
  };
}
```

**5.4.3 Redux State 구조**

```typescript
// ✅ GOOD: Normalized state
interface DocumentState {
  entities: Record<string, Document>;
  ids: string[];
  currentId: string | null;
  loading: boolean;
  error: string | null;
}

// ❌ BAD: Array only
interface DocumentState {
  documents: Document[];  // 중복, 업데이트 어려움
}
```

### 5.5 통신 패턴

**5.5.1 이벤트 네이밍 (Redux, Analytics)**

```typescript
// ✅ GOOD: 동사 + 객체
fetchDocuments.pending
fetchDocuments.fulfilled
fetchDocuments.rejected

// ❌ BAD: 불명확한 네이밍
LOAD_DATA
DATA_SUCCESS
```

**5.5.2 에러 처리 패턴**

```typescript
// ✅ GOOD: Discriminated Union으로 타입 좁히기
const response = await fetchDocuments();
if (response.success) {
  return response.data;  // TypeScript가 타입 추론
} else {
  throw new Error(response.error.message);
}

// ❌ BAD: Optional 체크
const response = await fetchDocuments();
if (response.data) {
  return response.data;  // 타입 좁히기 안 됨
}
```

### 5.6 보안 패턴 (Critical)

**5.6.1 SQL Injection 방지**

```typescript
// ✅ GOOD: Parameterized query
const result = await pool.query(
  'SELECT * FROM documents WHERE id = $1 AND user_id = $2',
  [docId, userId]
);

// ❌ BAD: String concatenation
const query = `SELECT * FROM documents WHERE id = '${docId}'`;  // SQL Injection!
```

**5.6.2 환경변수 관리**

```bash
# ✅ GOOD: Backend 환경변수만
DB_PASSWORD=secret
JWT_SECRET=secret
CLAUDE_API_KEY=sk-xxx

# ❌ BAD: Frontend 환경변수 (번들에 노출됨)
VITE_CLAUDE_API_KEY=sk-xxx
```

```typescript
// ✅ GOOD: 민감 정보는 Backend에서만 사용
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;  // 서버에서만 실행

// ❌ BAD: Frontend에서 API key 직접 사용
const response = await fetch('https://api.anthropic.com/...', {
  headers: { 'x-api-key': 'sk-xxx' }  // 브라우저에 노출!
});
```

### 5.7 성능 패턴

**5.7.1 Progressive Streaming (AI 문서 생성)**

```typescript
// Frontend: Server-Sent Events
const eventSource = new EventSource('/api/v1/generate/stream');

eventSource.onmessage = (event) => {
  const chunk = JSON.parse(event.data);
  updateDocumentContent(chunk.content);  // 점진적 UI 업데이트
};
```

**5.7.2 Polling vs WebSocket**

**MVP (Polling):**
```typescript
useEffect(() => {
  const interval = setInterval(async () => {
    await fetchDocumentUpdates(documentId);
  }, 30000);  // 30초
  
  return () => clearInterval(interval);
}, [documentId]);
```

**Post-MVP (WebSocket):**
```typescript
const ws = new WebSocket('wss://api.example.com/collaborate');
ws.onmessage = (event) => {
  const update = JSON.parse(event.data);
  applyUpdate(update);
};
```

### 5.8 테스트 패턴

**5.8.1 단위 테스트 (Vitest)**

```typescript
// api/documentApi.test.ts
import { describe, it, expect, vi } from 'vitest';
import { fetchDocuments } from './documentApi';

describe('documentApi', () => {
  it('should fetch documents successfully', async () => {
    vi.mock('./client', () => ({
      axiosInstance: {
        get: vi.fn().mockResolvedValue({ 
          success: true, 
          data: { documents: [] } 
        })
      }
    }));
    
    const result = await fetchDocuments();
    expect(result.success).toBe(true);
  });
});
```

**5.8.2 통합 테스트 (Jest)**

```typescript
// services/document.service.test.ts
import { getUserDocuments } from './document.service';

describe('documentService', () => {
  it('should return user documents', async () => {
    const result = await getUserDocuments('user-123');
    expect(result).toHaveLength(3);
  });
});
```

---

## 요약: AI 에이전트를 위한 핵심 규칙

### 절대 금지사항 (Forbidden Patterns):

1. ❌ Supabase Auth + JWT 혼용 → **JWT만 사용**
2. ❌ String concatenation 쿼리 → **Parameterized queries only**
3. ❌ Optional 속성 (`data?: T`) → **Discriminated Union**
4. ❌ 컴포넌트에서 직접 API 호출 → **api/ 폴더에서만**
5. ❌ `any` 타입 → **Unknown + 타입 가드**
6. ❌ 민감 정보 Frontend 환경변수 → **Backend 환경변수만**

### 필수 준수사항 (Must Follow):

1. ✅ JWT 인증 (모든 protected 라우트)
2. ✅ `user_id` 필터링 (모든 SELECT 쿼리)
3. ✅ Discriminated Union Response
4. ✅ TypeScript Strict Mode
5. ✅ 네이밍 패턴 (snake_case DB, camelCase API)
6. ✅ 에러 처리 미들웨어

---

**아키텍처 문서 완료!** 🎉

**다음 단계:**
1. [quick-dev] 워크플로우로 인증 시스템 구현 시작
2. 또는 [sprint-planning] 스프린트 계획 수립

