# BM Builder

비즈니스 모델 빌더 - AI 기반 창업 지원 플랫폼

## 프로젝트 구조

```
bm-builder/
├── frontend/           # Vite React TypeScript
├── backend/            # Express TypeScript
├── shared/             # 공유 타입 정의
└── infrastructure/     # AWS 배포 설정 (추후)
```

## 기술 스택

- **Frontend:** React 19.0, Vite 5.1, TypeScript 5.3, Redux Toolkit, React Router, Tailwind CSS
- **Backend:** Express 4.19, TypeScript 5.3, PostgreSQL 15
- **Database:** PostgreSQL 15 (자체 서버)
- **State Management:** Redux Toolkit 2.10.1

## 시작하기

### 사전 요구사항

- Node.js 18+
- PostgreSQL 15+

### 설치

1. **프론트엔드 설정**
```bash
cd frontend
cp .env.local.example .env.local
npm install --legacy-peer-deps
npm run dev
```

2. **백엔드 설정**
```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

3. **데이터베이스 초기화**
```bash
cd backend
npx tsx src/utils/init-db.ts
```

### 환경 변수

**Frontend (.env.local):**
```bash
VITE_APP_URL=http://localhost:5173
VITE_API_BASE_URL=http://localhost:3000
```

**Backend (.env):**
```bash
PORT=3000
NODE_ENV=development
DB_HOST=your-db-host
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your-password
JWT_SECRET=your-jwt-secret
CORS_ORIGIN=http://localhost:5173
```

## 스크립트

### Frontend
- `npm run dev` - 개발 서버 시작
- `npm run build` - 프로덕션 빌드
- `npm run preview` - 빌드 미리보기

### Backend
- `npm run dev` - 개발 서버 시작 (nodemon)
- `npm run build` - TypeScript 컴파일
- `npm run start` - 프로덕션 서버 시작

## 개발 가이드

### Monorepo 구조

공유 타입은 `@shared/types` 별칭으로 import:

```typescript
import type { User } from '@shared/types/user.types';
import type { ApiResponse } from '@shared/types/api.types';
```

### API 레이어

- **Frontend:** `src/api/` - API 호출 함수들
- **Backend:** `src/services/` - 비즈니스 로직

### 데이터베이스

- 직접 PostgreSQL 연결 사용 (`pg` 패키지)
- 연결 풀: `backend/src/utils/db.ts`
- 스키마: `backend/src/utils/schema.sql`

## 문서

- [PRD](./_bmad-output/planning-artifacts/prd.md)
- [Architecture](./_bmad-output/planning-artifacts/architecture.md)
- [Epics & Stories](./_bmad-output/planning-artifacts/epics.md)

## 라이선스

MIT
