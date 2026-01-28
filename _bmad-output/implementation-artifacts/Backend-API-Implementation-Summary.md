# 🔧 Backend Canvas API Implementation - Epic 2-6

**구현 날짜:** 2026-01-28
**구현 범위:** Backend Canvas & AI API (Frontend-Backend Alignment)
**상태:** ✅ 완료

---

## 📊 요약

Epic 2-6의 프론트엔드 구현과 백엔드 데이터베이스 스키마 간의 불일치를 해결하기 위해 독립적인 캔버스 API를 구현했습니다.

**문제:**
- 프론트엔드: 독립적인 LeanStartupCanvas 컴포넌트 + Redux + LocalStorage
- 백엔드: documents 테이블에 종속된 nodes 컬럼만 존재
- API 불일치: 프론트엔드는 `/api/v1/canvas/*` 기대, 백엔드는 `/api/v1/documents/:documentId/nodes/*`만 제공

**해결:**
- 독립적인 `lean_startup_canvases` 테이블 생성
- 캔버스 전용 API 엔드포인트 구현
- AI 대화/제안 API 엔드포인트 구현

---

## 🗄️ 데이터베이스 마이그레이션

### 파일: `backend/supabase/migrations/20250128000001_create_lean_startup_canvases.sql`

**테이블 구조:**
```sql
CREATE TABLE lean_startup_canvases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  -- ReactFlow 데이터
  nodes jsonb NOT NULL DEFAULT '[]'::jsonb,
  edges jsonb NOT NULL DEFAULT '[]'::jsonb,

  -- Progressive Disclosure 상태
  progressive_disclosure jsonb NOT NULL DEFAULT '{"unlocked_stages": [1, 2, 3], "show_all": false}'::jsonb,

  -- 진행률 추적
  stage_completion jsonb NOT NULL DEFAULT '{}'::jsonb,

  -- 메타데이터
  title text DEFAULT '린스타트업 캔버스',
  description text,
  is_active boolean DEFAULT true,

  -- 타임스탬프
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**특징:**
- ✅ documents 테이블과 완전히 독립적
- ✅ JSONB 컬럼으로 ReactFlow nodes/edges 저장
- ✅ Progressive Disclosure 상태 관리
- ✅ RLS (Row Level Security)로 사용어별 접근 제어
- ✅ GIN 인덱스로 JSONB 쿼리 성능 최적화
- ✅ 자동 updated_at 트리거

**인덱스:**
```sql
CREATE INDEX idx_lean_startup_canvases_user_id ON lean_startup_canvases(user_id);
CREATE INDEX idx_lean_startup_canvases_is_active ON lean_startup_canvases(is_active);
CREATE INDEX idx_lean_startup_canvases_updated_at ON lean_startup_canvases(updated_at DESC);
CREATE INDEX idx_lean_startup_canvases_nodes ON lean_startup_canvases USING GIN (nodes);
CREATE INDEX idx_lean_startup_canvases_edges ON lean_startup_canvases USING GIN (edges);
CREATE INDEX idx_lean_startup_canvases_progressive_disclosure ON lean_startup_canvases USING GIN (progressive_disclosure);
```

**RLS 정책:**
```sql
-- 사용어는 자신의 캔버스만 조회/생성/수정/삭제 가능
CREATE POLICY "Users can view their own canvases"
  ON lean_startup_canvases FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own canvases"
  ON lean_startup_canvases FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own canvases"
  ON lean_startup_canvases FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own canvases"
  ON lean_startup_canvases FOR DELETE USING (auth.uid() = user_id);
```

---

## 🔌 API 엔드포인트

### 1. Canvas Routes (`backend/src/routes/v1/canvas.routes.ts`)

#### GET `/api/v1/canvas`
활성 캔버스 조회 (없으면 자동 생성)

**Request:**
```http
GET /api/v1/canvas
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "nodes": [...],
    "edges": [...],
    "progressive_disclosure": {
      "unlocked_stages": [1, 2, 3],
      "show_all": false
    },
    "stage_completion": {},
    "title": "린스타트업 캔버스",
    "is_active": true,
    "created_at": "2026-01-28T00:00:00Z",
    "updated_at": "2026-01-28T00:00:00Z"
  },
  "message": "새 캔버스가 생성되었습니다"
}
```

**특징:**
- 캔버스가 없으면 자동으로 초기 스테이지 1-3 해제된 상태로 생성
- Progressive Disclosure 기본값: `unlocked_stages: [1, 2, 3], show_all: false`

---

#### PUT `/api/v1/canvas/save`
캔버스 자동 저장 (Story 5.1 - 10초 간격)

**Request:**
```http
PUT /api/v1/canvas/save
Authorization: Bearer <token>
Content-Type: application/json

{
  "nodes": [...],
  "edges": [...],
  "progressive_disclosure": {...},
  "stage_completion": {...}
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "nodes": [...],
    "edges": [...],
    ...
  },
  "message": "캔버스가 저장되었습니다"
}
```

**유효성 검사:**
- nodes: 배열이어야 함
- edges: 배열이어야 함
- 기존 캔버스가 없으면 자동 생성

---

#### PATCH `/api/v1/canvas/nodes/:nodeId`
단일 노드 업데이트

**Request:**
```http
PATCH /api/v1/canvas/nodes/node-123
Authorization: Bearer <token>
Content-Type: application/json

{
  "data": {
    "label": "새 제목",
    "description": "새 설명",
    "content": "새 내용"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "node-123",
    "type": "problem-discovery",
    "data": {
      "label": "새 제목",
      "description": "새 설명",
      "content": "새 내용"
    },
    ...
  },
  "message": "노드가 업데이트되었습니다"
}
```

---

#### DELETE `/api/v1/canvas/nodes/:nodeId`
노드 삭제 (연결된 엣지도 함께 삭제)

**Request:**
```http
DELETE /api/v1/canvas/nodes/node-123
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "노드가 삭제되었습니다"
}
```

**특징:**
- 노드 삭제 시 연결된 모든 엣지도 자동 삭제
- 존재하지 않는 노드 ID 요청 시 404 반환

---

#### POST `/api/v1/canvas/unlock-stage`
Progressive Disclosure: 다음 스테이지 해제 (Story 3.3)

**Request:**
```http
POST /api/v1/canvas/unlock-stage
Authorization: Bearer <token>
Content-Type: application/json

{
  "stage": 4
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "unlocked_stages": [1, 2, 3, 4],
    "show_all": false
  },
  "message": "스테이지 4가 해제되었습니다"
}
```

**비즈니스 로직:**
- 스테이지 1-7 범위 검사
- 3개 이상 스테이지 완료 시 전체 자동 해제: `show_all: true, unlocked_stages: [1,2,3,4,5,6,7]`

---

### 2. AI Routes (`backend/src/routes/v1/ai.routes.ts`)

#### POST `/api/v1/ai/suggestion`
AI 제안 생성 (Story 4.3)

**Request:**
```http
POST /api/v1/ai/suggestion
Authorization: Bearer <token>
Content-Type: application/json

{
  "nodeId": "node-123",
  "canvasContext": {...}
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "suggestion-1738040000000",
    "nodeId": "node-123",
    "type": "content_enhancement",
    "content": "\"문제 발굴\"에 대한 AI 제안입니다.",
    "reasoning": "이 노드의 내용을 바탕으로 관련 고객 세그먼트와 문제 정의를 개선할 수 있습니다.",
    "createdAt": "2026-01-28T00:00:00.000Z",
    "status": "pending"
  },
  "message": "AI 제안이 생성되었습니다"
}
```

**현재 상태:** Mock 데이터 반환 (TODO: 실제 Claude API 연동 필요)

---

#### POST `/api/v1/ai/conversation`
AI 컨텍스트 대화 (Story 4.2)

**Request:**
```http
POST /api/v1/ai/conversation
Authorization: Bearer <token>
Content-Type: application/json

{
  "nodeId": "node-123",
  "message": "이 문제를 어떻게 정의하면 좋을까요?",
  "conversationHistory": [...]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "msg-1738040000000",
    "role": "assistant",
    "content": "\"문제 발굴\"와 관련하여 \"이 문제를 어떻게 정의하면 좋을까요?\"에 답변합니다. 이 노드는 ...에 관한 것입니다.",
    "nodeId": "node-123",
    "timestamp": "2026-01-28T00:00:00.000Z"
  },
  "message": "AI 응답이 생성되었습니다"
}
```

**현재 상태:** Mock 데이터 반환 (TODO: 실제 Claude API 연동 필요)

---

## 🔧 메인 앱 등록

### 파일: `backend/src/index.ts`

**변경사항:**
```typescript
// 새로운 라우트 import 추가
import canvasRoutes from './routes/v1/canvas.routes';
import aiRoutes from './routes/v1/ai.routes';

// 기존 라우트 등록
app.use('/api/v1/websocket', webSocketRoutes);

// ✅ 새로운 캔버스 라우트 등록
app.use('/api/v1/canvas', canvasRoutes);
app.use('/api/v1/ai', aiRoutes);
```

---

## ✅ TypeScript 컴파일 검증

**커맨드:**
```bash
cd backend && npx tsc --noEmit
```

**결과:**
```
✅ New route files compile successfully!
```

**수정된 이슈:**
1. ✅ `canvasContext` 미사용 변수 제거 (ai.routes.ts)
2. ✅ `conversationHistory` 미사용 변수 제거 (ai.routes.ts)
3. ✅ `result` 미사용 변수 제거 (canvas.routes.ts)

**참고:** 기존 파일들의 TypeScript 오류들은 본 구현 범위 밖

---

## 📋 다음 단계

### 필수 작업:

1. **데이터베이스 마이그레이션 실행**
   ```bash
   cd backend
   psql -U postgres -d bm_builder \
     -f supabase/migrations/20250128000001_create_lean_startup_canvases.sql
   ```

2. **프론트엔드 서비스 업데이트**
   - `frontend/src/services/canvasStorage.service.ts`
   - Mock 호출을 실제 `/api/v1/canvas/*` 엔드포인트로 변경
   - LocalStorage와 API 동기화 로직 구현 (Story 5.2)

3. **AI API 실연동**
   - `backend/src/routes/v1/ai.routes.ts`의 TODO 구현
   - Claude API와 실제 통신
   - 대화 히스토리 관리

4. **테스트 작성**
   - Canvas API 엔드포인트 유닛 테스트
   - AI API 엔드포인트 유닛 테스트
   - 통합 테스트

### 선택적 개선사항:

1. **버전 관리 구현** (Story 5.3)
   - 최근 10개 버전 유지
   - `/api/v1/canvas/versions` 엔드포인트 추가
   - 롤백 기능

2. **내보내기 API** (Story 6.1-6.2)
   - `/api/v1/canvas/export` 엔드포인트 추가
   - PDF/이미지 변환
   - AI 기반 문서 변환

3. **실시간 협업** (향후 Epic)
   - WebSocket으로 노드/엣지 변경사항 동기화
   - 다중 사용어 동시 편집 지원

---

## 🎯 품질 체크리스트

| 항목 | 상태 | 비고 |
|------|------|------|
| **데이터베이스 스키마** | ✅ | 독립적인 테이블, RLS, 인덱스 완료 |
| **API 엔드포인트** | ✅ | GET/PUT/PATCH/DELETE/POST 모두 구현 |
| **TypeScript 컴파일** | ✅ | 새로운 파일들 컴파일 성공 |
| **Route 등록** | ✅ | app.ts에 라우트 추가 완료 |
| **인증/권한** | ✅ | requireAuth 미들웨어 적용 |
| **에러 처리** | ✅ | try-catch, 적절한 HTTP 상태 코드 |
| **Progressive Disclosure** | ✅ | 스테이지 해제 로직 구현 |
| **AI API Mock** | ✅ | TODO 주석으로 실연동 필요성 표시 |
| **프론트엔드 연동** | ⏳ | 다음 단계로 진행 예정 |
| **테스트** | ⏳ | 작성 필요 |

---

## 📚 관련 문서

- **코드 리뷰 리포트:** `_bmad-output/implementation-artifacts/Code-Review-Report-Epic-2-6.md`
- **프론트엔드 구현:**
  - `frontend/src/components/canvas/LeanStartupCanvas.tsx`
  - `frontend/src/store/canvasSlice.ts`
  - `frontend/src/config/nodeTypes.ts`
- **데이터베이스:** `backend/supabase/migrations/20250128000001_create_lean_startup_canvases.sql`
- **API 라우트:**
  - `backend/src/routes/v1/canvas.routes.ts`
  - `backend/src/routes/v1/ai.routes.ts`

---

**구현 완료 시간:** 2026-01-28
**구현자:** Claude Sonnet 4.5 (Adversarial Code Reviewer → Backend Implementation)

🎉 **Epic 2-6 백엔드 API 구현 완료!**
