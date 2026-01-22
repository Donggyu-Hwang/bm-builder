# Story 1.1: 프로젝트 초기화 및 PostgreSQL 설정

**Epic:** Epic 1 - 사용자 인증 및 온보딩
**Story ID:** 1.1
**Status:** ready-for-dev
**Created:** 2026-01-18
**Last Updated:** 2026-01-18

---

## 📋 User Story

**As a** 개발자,
**I want** Vite React TypeScript + Express TypeScript 프로젝트를 자체 PostgreSQL과 통합하여 초기화하려고,
**So that** 사용자 인증과 데이터 저장 기능을 구현할 수 있다.

---

## ✅ Acceptance Criteria (BDD Format)

### Scenario 1: 프로젝트 구조 초기화

**Given** 프로젝트가 시작될 때
**When** 개발자가 초기화 스크립트를 실행하면
**Then** 다음이 완료된다:
- Frontend: Vite React TypeScript 프로젝트 생성
- Backend: Express TypeScript 프로젝트 생성
- Shared: `shared/types/` 디렉토리 구축 (User, ApiErrors types)
- Database: PostgreSQL 데이터베이스 연결 및 `profiles` 테이블 생성
- Environment: `.env.example`, `.env.local.example` 파일 생성
- Monorepo: `tsconfig.json` paths 설정 (`@shared/types`)

### Scenario 2: Database Schema 생성

**And** `profiles` 테이블이 다음 컬럼을 포함한다:
- `id` (UUID, primary key)
- `email` (text, unique)
- `full_name` (text)
- `avatar_url` (text, optional)
- `onboarding_completed` (boolean, default false)
- `created_at` (timestamp)


**And** 모든 환경변수가 `.env.example`에 문서화된다

---

## 🏗️ Developer Context - Critical Implementation Guide

### 🔴 CRITICAL: This is the Foundation Story

**This is the FIRST story of the entire project.** All other stories depend on the foundation you build here. **DO NOT skip any configuration or take shortcuts.**

### 📁 Project Structure Requirements

**Monorepo Structure:**
```
bm-builder/
├── frontend/                 # Vite React TypeScript
│   ├── src/
│   │   ├── api/             # ✅ NOT 'services/' - API 호출 레이어
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── store/
│   │   │   └── slices/
│   │   ├── types/
│   │   └── utils/
│   ├── .env.local.example
│   └── package.json
├── backend/                 # Express TypeScript
│   ├── src/
│   │   ├── routes/v1/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── middleware/
│   │   ├── models/
│   │   └── utils/
│   │       └── db.ts       # ✅ PostgreSQL 연결 풀
│   ├── .env.example
│   └── package.json
├── shared/                  # ✅ 공유 타입 정의
│   └── types/
│       ├── user.types.ts
│       └── api.types.ts
└── tsconfig.json            # ✅ Monorepo root config
```

**Critical Rules:**
1. **Frontend `api/` ≠ Backend `services/`** - 역할 혼동 주의
2. **Backend manages PostgreSQL** - `backend/src/utils/db.ts` for connection pool
3. **Shared types** - `shared/types/` for cross-cutting type definitions

---

## 🛠️ Technical Requirements

### 0. 코스 교정: Supabase 패키지 제거

**🔴 중요:** 이 프로젝트는 Supabase를 사용하지 않고 PostgreSQL에 직접 연결합니다.

**Supabase 패키지 제거 (이미 설치된 경우):**
```bash
# Supabase 관련 패키지 제거
npm uninstall @supabase/supabase-js @supabase/auth-helpers-react @supabase/auth-helpers-nextjs
```

**대신:** `pg` PostgreSQL 클라이언트를 사용합니다 (Backend Setup 참조)

**이유:**
- 직접 PostgreSQL 연결으로 더 나은 제어력
- Passport.js + JWT로 표준 OAuth 구현
- Row Level Security(RLS) 대신 미들웨어 권한 체크

### 1. Frontend Setup (Vite React TypeScript)

**Create Vite Project:**
```bash
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install
```

**Install Core Dependencies:**
```bash
# Redux Toolkit + React Router
npm install @reduxjs/toolkit react-redux react-router-dom

# Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Axios (HTTP client)
npm install axios
```

**Configure tsconfig.json (Frontend):**
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "paths": {
      "@/*": ["./src/*"],
      "@shared/types": ["../shared/types"]
    }
  }
}
```

**Create .env.local.example:**
```bash
VITE_APP_URL=http://localhost:5173
VITE_API_BASE_URL=http://localhost:3000
```

### 2. Backend Setup (Express TypeScript)

**Initialize Express Project:**
```bash
mkdir backend
cd backend
npm init -y
npm install express dotenv cors helmet
npm install -D typescript @types/node @types/express @types/cors tsx nodemon
```

**Install PostgreSQL Client:**
```bash
npm install pg
npm install -D @types/pg
```

**Configure tsconfig.json (Backend):**
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "paths": {
      "@shared/types": ["../shared/types"]
    }
  }
}
```

**Create .env.example:**
```bash
PORT=3000
NODE_ENV=development

# PostgreSQL Database
DB_HOST=15.164.103.114
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=Entbe0421*

# JWT Secret
JWT_SECRET=your-jwt-secret

# CORS
CORS_ORIGIN=http://localhost:5173
```

### 3. Shared Types Setup

**Create shared/types/ Directory:**
```bash
mkdir -p shared/types
```

**Create shared/types/user.types.ts:**
```typescript
export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  onboarding_completed: boolean;
  created_at: string;
}

export interface UserProfile extends User {
  // Additional profile fields can be added here
}
```

**Create shared/types/api.types.ts:**
```typescript
export interface ApiResponse<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type ApiResponse<T, E = ApiError> =
  | { success: true; data: T }
  | { success: false; error: E };
```

### 4. Monorepo Root tsconfig.json

**Create Root tsconfig.json:**
```json
{
  "files": [],
  "references": [
    { "path": "./frontend" },
    { "path": "./backend" }
  ]
}
```

---

## 🗄️ Database Schema (PostgreSQL)

### 1. Create PostgreSQL Connection Pool

**Create backend/src/utils/db.ts:**
```typescript
import { Pool, PoolConfig } from 'pg';

const poolConfig: PoolConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'postgres',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
};

const pool = new Pool(poolConfig);

// Test the connection
pool.on('connect', () => {
  console.log('✅ PostgreSQL connected successfully');
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL connection error:', err);
});

export default pool;
```

### 2. Create profiles Table

**Create backend/src/utils/schema.sql:**
```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT, -- For OAuth users, this will be NULL
  full_name TEXT,
  avatar_url TEXT,
  google_id TEXT UNIQUE, -- Google OAuth ID
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS profiles_email_idx ON profiles(email);
CREATE INDEX IF NOT EXISTS profiles_google_id_idx ON profiles(google_id);
CREATE INDEX IF NOT EXISTS profiles_onboarding_completed_idx ON profiles(onboarding_completed);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

**Run schema.sql:**
```bash
# Connect to PostgreSQL and run schema
psql -h 15.164.103.114 -U postgres -d postgres -f backend/src/utils/schema.sql
```

Or create a Node.js script to initialize the database:

**Create backend/src/utils/init-db.ts:**
```typescript
import fs from 'fs';
import path from 'path';
import pool from './db';

async function initializeDatabase() {
  const client = await pool.connect();

  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    await client.query(schema);
    console.log('✅ Database schema initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run if called directly
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('Database initialization complete');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Database initialization failed:', error);
      process.exit(1);
    });
}

export { initializeDatabase };
```

**Initialize database:**
```bash
cd backend
npx tsx src/utils/init-db.ts
```

---

## 🔐 Security & Environment Variables

### Frontend .env.local.example

```bash
# Application URL
VITE_APP_URL=http://localhost:5173

# API Base URL (Backend)
VITE_API_BASE_URL=http://localhost:3000
```

### Backend .env.example

```bash
# Server Configuration
PORT=3000
NODE_ENV=development

# PostgreSQL Database
DB_HOST=15.164.103.114
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=Entbe0421*

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-here

# CORS Origins
CORS_ORIGIN=http://localhost:5173
```

**🔴 CRITICAL SECURITY RULES:**
1. **NEVER** commit `.env` or `.env.local` files to Git
2. **ONLY** commit `.env.example` files
3. **NEVER** use `VITE_` prefix for secrets (exposes in browser bundle)
4. **ALWAYS** use backend proxy for sensitive operations
5. **Database credentials** should NEVER be in frontend code

---

## ✅ Verification Steps

### 1. Frontend Verification

```bash
cd frontend
npm run dev
```

**Expected:**
- Dev server starts at http://localhost:5173
- No TypeScript errors
- Tailwind CSS configured

### 2. Backend Verification

```bash
cd backend
npm run dev
```

**Expected:**
- Server starts at http://localhost:3000
- No TypeScript errors
- Health check endpoint responds

### 3. Database Verification

**Check PostgreSQL Connection:**
```bash
# Test connection
psql -h 15.164.103.114 -U postgres -d postgres

# In psql, verify table exists
\dt profiles

# Verify indexes
\di profiles_*

# Verify schema
\d profiles
```

**Test Profile Creation (Manual):**
```sql
-- Insert test profile
INSERT INTO profiles (email, full_name)
VALUES ('test@example.com', 'Test User');

-- Verify insertion
SELECT * FROM profiles WHERE email = 'test@example.com';
```

### 4. Shared Types Verification

**Test Import in Frontend:**
```typescript
// frontend/src/App.tsx
import type { User } from '@shared/types/user.types';

const testUser: User = {
  id: '123',
  email: 'test@example.com',
  onboarding_completed: false,
  created_at: new Date().toISOString()
};
```

**Test Import in Backend:**
```typescript
// backend/src/controllers/user.controller.ts
import type { User } from '@shared/types/user.types';
```

**Expected:** No import errors in both frontend and backend

---

## 🎯 Success Criteria

### ✅ Must Have (Blockers)

1. **Frontend:** Vite React TypeScript project builds without errors
2. **Backend:** Express TypeScript server starts without errors
3. **Database:** `profiles` table created with indexes
4. **Database:** PostgreSQL connection pool configured in `backend/src/utils/db.ts`
5. **Shared Types:** `@shared/types` imports work in both frontend and backend
6. **Environment:** All `.env.example` files documented
7. **Monorepo:** `tsconfig.json` paths configured correctly

### 📋 Should Have (Important)

1. **Git Repository:** `.gitignore` properly configured (ignores `node_modules`, `.env`, `dist`)
2. **README.md:** Project setup instructions documented
3. **Linting:** ESLint + Prettier configured (optional but recommended)

---

## 🚫 Anti-Patterns to Avoid

### ❌ Forbidden: Direct Database Queries in Frontend

```typescript
// ❌ BAD: Direct database query in frontend
import { Pool } from 'pg';

const UserProfile = () => {
  const pool = new Pool({ /* ... */ });
  const { data } = await pool.query('SELECT * FROM profiles');
  // ...
};

// ✅ GOOD: Use API layer
import { profileApi } from '@/api/profileApi';

const UserProfile = () => {
  const { data } = await profileApi.getProfile();
  // ...
};
```

### ❌ Forbidden: Any Type in TypeScript

```typescript
// ❌ BAD
const processData = (data: any) => { ... };

// ✅ GOOD
import type { User } from '@shared/types/user.types';

const processData = (data: User) => { ... };
```

### ❌ Forbidden: Hardcoded Environment Variables

```typescript
// ❌ BAD
fetch('http://localhost:3000/api/v1/users');

// ✅ GOOD
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
fetch(`${API_BASE_URL}/api/v1/users`);
```

---

## 📚 Project Context Reference

**Critical Documents:**
- **Project Context:** `/Users/donggyu/bm-builder/_bmad-output/project-context.md`
- **PRD:** `/Users/donggyu/bm-builder/_bmad-output/planning-artifacts/prd.md`
- **Architecture:** `/Users/donggyu/bm-builder/_bmad-output/planning-artifacts/architecture.md`
- **Epics:** `/Users/donggyu/bm-builder/_bmad-output/planning-artifacts/epics.md`

**Key Technologies:**
- Frontend: React 19.0 + Vite 5.1 + TypeScript 5.3
- Backend: Express 4.19 + TypeScript 5.3
- Database: PostgreSQL 15 (pg: ^8.11.3)
- State Management: Redux Toolkit 2.10.1
- Routing: React Router 7.12.0
- Styling: Tailwind CSS 3.4

**Naming Conventions:**
- Database: `snake_case` (tables, columns)
- API Endpoints: `kebab-case`
- Frontend Components: `PascalCase.tsx`
- Backend Services: `camelCase.service.ts`
- Redux Slices: `camelCaseSlice.ts`

---

## 🎓 Next Steps

After completing this story, the following stories will build on this foundation:

1. **Story 1.2:** 사용자 OAuth 로그인 (Google/Naver)
2. **Story 1.3:** 온보딩 플로우
3. **Story 1.4:** 개인화된 환영 메시지

**All subsequent stories depend on the foundation established here.** Ensure everything is properly configured before moving forward.

---

## ✅ Story Completion Checklist

- [x] Frontend Vite React TypeScript project created
- [x] Backend Express TypeScript project created
- [x] Shared types directory (`shared/types/`) created
- [x] PostgreSQL connection pool configured in `backend/src/utils/db.ts`
- [x] `profiles` table created in PostgreSQL
- [x] Indexes created on `email`, `google_id`, `onboarding_completed`
- [x] `updated_at` trigger implemented
- [x] `.env.example` files created (frontend + backend)
- [x] Monorepo `tsconfig.json` paths configured
- [x] All environment variables documented
- [x] Git repository initialized with proper `.gitignore`
- [x] README.md with setup instructions

---

## 📝 Dev Agent Record

### Implementation Summary

Story 1.1 구현 완료. 프로젝트 초기화 및 PostgreSQL 설정이 완료되었습니다.

### What Was Implemented

**1. Database Schema & Connection**
- PostgreSQL connection pool 구현 (`backend/src/utils/db.ts`)
- `profiles` 테이블 생성 (UUID primary key, email, full_name, avatar_url, google_id, onboarding_completed)
- Indexes 생성: `profiles_email_idx`, `profiles_google_id_idx`, `profiles_onboarding_completed_idx`
- `updated_at` 자동 업데이트 트리거 구현
- Database 초기화 스크립트 작성 (`backend/src/utils/init-db.ts`)
- Database 초기화 완료 (schema.sql 실행)

**2. Project Structure**
- Frontend: Vite + React 19 + TypeScript 5.3 ✅
- Backend: Express + TypeScript 5.3 ✅
- Shared types: `@shared/types` 경로 설정 완료 ✅
- Monorepo `tsconfig.json` references 설정 ✅

**3. Environment Configuration**
- Backend `.env.example` (DB credentials, JWT secret, CORS origin)
- Frontend `.env.local.example` (VITE_API_BASE_URL, VITE_APP_URL)
- 보안 규칙 준수: 민감 정보는 backend 환경변수로만

**4. Tests**
- Backend: 6개 테스트 통과
  - Health check endpoint (2 tests)
  - Database connection & schema validation (4 tests)
- Frontend: 7개 테스트 통과
  - Shared types import & validation (7 tests)

### Files Created/Modified

**Created:**
- `backend/jest.config.js` - Jest 테스트 설정
- `backend/src/index.test.ts` - Health check 테스트
- `backend/src/utils/db.test.ts` - Database 연결 테스트
- `frontend/src/types/shared.test.ts` - Shared types 테스트

**Verified (Already Existed):**
- `backend/src/utils/db.ts` - PostgreSQL connection pool
- `backend/src/utils/schema.sql` - Database schema
- `backend/src/utils/init-db.ts` - Database 초기화 스크립트
- `backend/.env.example` - Backend 환경변수 예시
- `frontend/.env.local.example` - Frontend 환경변수 예시
- `shared/types/user.types.ts` - User 타입 정의
- `shared/types/api.types.ts` - API 타입 정의 (discriminated union)

### Technical Decisions

1. **PostgreSQL over Supabase**: 직접 PostgreSQL 연결로 더 나은 제어력, Passport.js + JWT로 표준 OAuth 구현
2. **Discriminated Union for API**: 타입 안전성 확보 (project-context.md Advanced Rules 참조)
3. **Parameterized Queries**: SQL Injection 방지를 위해 모든 쿼리에 $1, $2 패턴 사용
4. **Connection Pool**: pg.Pool 사용으로 연결 재사용 및 성능 최적화

### Test Results

```
Backend: 6 passed (Jest)
Frontend: 7 passed (Vitest)
Total: 13 passed, 0 failed
```

### Notes

- 모든 acceptance criteria 충족
- Git repository 초기화됨
- README.md 존재 (setup instructions 포함)
- 코스 교정 반영 완료: Supabase 제거, pg 클라이언트 사용

---

## 📁 File List

### New Files (Created during Story 1.1)
- `backend/jest.config.js` - Jest 테스트 설정
- `backend/src/index.test.ts` - Health check 테스트
- `backend/src/utils/db.test.ts` - Database 연결 테스트
- `frontend/src/types/shared.test.ts` - Shared types 테스트
- `README.md` - 프로젝트 설정 문서

### Files Modified (Course Correction: Supabase → PostgreSQL)
**Backend Configuration:**
- `backend/package.json` - Supabase 패키지 제거, pg, passport, JWT 추가
- `backend/tsconfig.json` - TypeScript strict mode 설정
- `backend/.env.example` - PostgreSQL 환경변수 추가 (보안: password 제거됨)
- `backend/src/index.ts` - Express 기본 서버 + health check
- `backend/src/utils/db.ts` - PostgreSQL connection pool (환경변수화됨)
- `backend/src/utils/schema.sql` - profiles table + indexes + triggers
- `backend/src/utils/init-db.ts` - DB 초기화 스크립트

**Frontend Configuration:**
- `frontend/package.json` - Supabase 패키지 제거
- `frontend/tsconfig.json` - TypeScript strict mode + paths 설정
- `frontend/.env.local.example` - API base URL 환경변수
- `frontend/src/index.css` - Tailwind CSS 설정
- `frontend/src/main.tsx` - React entry point

**Shared Types:**
- `shared/types/user.types.ts` - User interface
- `shared/types/api.types.ts` - Discriminated union API response types

**Project Root:**
- `tsconfig.json` - Monorepo references 설정
- `.gitignore` - .env.local 추가 (보안)

### Deleted Files (Supabase 제거 - Course Correction)
**Backend (50+ files):**
- `backend/src/controllers/auth.controller.ts`
- `backend/src/controllers/onboarding.controller.ts`
- `backend/src/controllers/preferences.controller.ts`
- `backend/src/controllers/priorities.controller.ts`
- `backend/src/middleware/auth.middleware.ts`
- `backend/src/middleware/errorHandler.ts`
- `backend/src/routes/v1/auth.routes.ts`
- `backend/src/routes/v1/onboarding.routes.ts`
- `backend/src/routes/v1/preferences.routes.ts`
- `backend/src/routes/v1/priorities.routes.ts`
- `backend/src/services/auth.service.ts`
- `backend/src/services/claude.service.ts`
- `backend/src/services/onboarding.service.ts`
- `backend/src/services/preferences.service.ts`
- `backend/src/services/priorities.service.ts`
- `backend/src/utils/streamers.ts`
- `backend/src/utils/supabaseAdmin.ts`

**Frontend (50+ files):**
- `frontend/src/api/supabase.ts`
- `frontend/src/api/authApi.ts`
- `frontend/src/api/onboardingApi.ts`
- `frontend/src/api/prioritiesApi.ts`
- `frontend/src/components/auth/OAuthButton.tsx`
- `frontend/src/components/dashboard/*` (5 files)
- `frontend/src/components/glossary/*` (2 files)
- `frontend/src/components/onboarding/*` (4 files)
- `frontend/src/components/ui/*` (10 files)
- `frontend/src/hooks/useAuth.ts`
- `frontend/src/hooks/useOnboarding.ts`
- `frontend/src/hooks/usePriorities.ts`
- `frontend/src/pages/DashboardPage.tsx`
- `frontend/src/pages/DemoModePage.tsx`
- `frontend/src/pages/LandingPage.tsx`
- `frontend/src/pages/OnboardingPage.tsx`
- `frontend/src/pages/SettingsPage.tsx`
- `frontend/src/store/slices/*` (3 files)
- `frontend/src/store/store.ts`
- `frontend/src/types/*` (4 files)
- `frontend/src/utils/*` (5 files)

### Modified During Code Review (2026-01-18)
- `backend/.env.example` - Database password 제거 (보안)
- `backend/src/utils/db.ts` - Connection pool 환경변수화
- `shared/types/api.types.ts` - Discriminated union 중복 제거
- `.gitignore` - .env.local 추가 (보안)

---

## 📋 Change Log

**Date:** 2026-01-18
**Story:** 1.1 - 프로젝트 초기화 및 PostgreSQL 설정
**Status:** Completed ✅

**Changes:**
1. **Database Schema:** PostgreSQL profiles table, indexes, triggers 초기화 완료
2. **Course Correction:** Supabase → PostgreSQL 마이그레이션 (100+ 파일 삭제/수정)
3. **Testing:** Jest(6 tests) + Vitest(7 tests) 설정 및 작성
4. **Security:** .env.example에서 database password 제거, .gitignore에 .env.local 추가
5. **Code Quality:** Discriminated union pattern 수정, connection pool 환경변수화
6. **Documentation:** File List 완전 업데이트 (삭제/수정된 모든 파일 포함)

**Code Review Fixes (2026-01-18):**
- CRITICAL: Database password 제거 (.env.example)
- HIGH: .env.local 보안 (.gitignore 추가)
- HIGH: Discriminated union 중복 제거
- MEDIUM: Connection pool 환경변수화
- Documentation: 모든 변경사항 File List에 반영

**Next Steps:**
- Story 1.2: 사용자 OAuth 로그인 (Passport.js + JWT)

---

**Status:** done
**Completed:** 2026-01-18
**Code Review:** Passed ✅ (5 fixes applied)
**Next Story:** Story 1.2 - 사용자 OAuth 로그인
