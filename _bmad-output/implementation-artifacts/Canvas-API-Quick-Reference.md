# 🚀 Canvas API Quick Reference

**엔드포인트 베이스 URL:** `http://localhost:3000/api/v1`

---

## 🔐 인증

모든 엔드포인트는 JWT 인증이 필요합니다:

```http
Authorization: Bearer <your-jwt-token>
```

---

## 📋 Canvas API

### 1. 캔버스 로드/생성

```http
GET /canvas
```

**설명:** 사용어의 활성 캔버스를 조회하거나 없으면 자동 생성

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "user_id": "user-uuid",
    "nodes": [],
    "edges": [],
    "progressive_disclosure": {
      "unlocked_stages": [1, 2, 3],
      "show_all": false
    },
    "stage_completion": {},
    "title": "린스타트업 캔버스",
    "is_active": true,
    "created_at": "2026-01-28T00:00:00.000Z",
    "updated_at": "2026-01-28T00:00:00.000Z"
  },
  "message": "새 캔버스가 생성되었습니다"
}
```

---

### 2. 캔버스 저장 (자동저장)

```http
PUT /canvas/save
Content-Type: application/json
```

**Body:**
```json
{
  "nodes": [
    {
      "id": "node-1",
      "type": "problem-discovery",
      "position": { "x": 100, "y": 100 },
      "data": {
        "label": "문제 발굴",
        "description": "문제 설명",
        "content": "상세 내용"
      }
    }
  ],
  "edges": [
    {
      "id": "edge-1",
      "source": "node-1",
      "target": "node-2",
      "type": "smoothstep",
      "animated": true
    }
  ],
  "progressive_disclosure": {
    "unlocked_stages": [1, 2, 3, 4],
    "show_all": false
  },
  "stage_completion": {
    "1": true,
    "2": true,
    "3": false
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": { /* 저장된 캔버스 전체 데이터 */ },
  "message": "캔버스가 저장되었습니다"
}
```

---

### 3. 노드 업데이트

```http
PATCH /canvas/nodes/:nodeId
Content-Type: application/json
```

**URL Parameters:**
- `nodeId`: 노드 ID (예: `node-1`)

**Body:**
```json
{
  "data": {
    "label": "수정된 제목",
    "description": "수정된 설명",
    "content": "수정된 내용"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "node-1",
    "type": "problem-discovery",
    "data": {
      "label": "수정된 제목",
      "description": "수정된 설명",
      "content": "수정된 내용"
    },
    "position": { "x": 100, "y": 100 },
    ...
  },
  "message": "노드가 업데이트되었습니다"
}
```

---

### 4. 노드 삭제

```http
DELETE /canvas/nodes/:nodeId
```

**URL Parameters:**
- `nodeId`: 삭제할 노드 ID

**Response:**
```json
{
  "success": true,
  "message": "노드가 삭제되었습니다"
}
```

**참고:** 연결된 모든 엣지도 자동 삭제됩니다.

---

### 5. 스테이지 해제 (Progressive Disclosure)

```http
POST /canvas/unlock-stage
Content-Type: application/json
```

**Body:**
```json
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
- 3개 이상 스테이지 완료 시 전체 자동 해제
- `show_all: true` → 모든 7개 스테이지 노드 타입 표시

---

## 🤖 AI API

### 1. AI 제안 생성

```http
POST /ai/suggestion
Content-Type: application/json
```

**Body:**
```json
{
  "nodeId": "node-1",
  "canvasContext": {}
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "suggestion-1738040000000",
    "nodeId": "node-1",
    "type": "content_enhancement",
    "content": "\"문제 발굴\"에 대한 AI 제안입니다.",
    "reasoning": "이 노드의 내용을 바탕으로 관련 고객 세그먼트와 문제 정의를 개선할 수 있습니다.",
    "createdAt": "2026-01-28T00:00:00.000Z",
    "status": "pending"
  },
  "message": "AI 제안이 생성되었습니다"
}
```

---

### 2. AI 대화

```http
POST /ai/conversation
Content-Type: application/json
```

**Body:**
```json
{
  "nodeId": "node-1",
  "message": "이 문제를 어떻게 정의하면 좋을까요?",
  "conversationHistory": [
    {
      "role": "user",
      "content": "이전 메시지",
      "timestamp": "2026-01-28T00:00:00.000Z"
    },
    {
      "role": "assistant",
      "content": "이전 응답",
      "timestamp": "2026-01-28T00:00:00.000Z"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "msg-1738040000000",
    "role": "assistant",
    "content": "\"문제 발굴\"와 관련하여 \"이 문제를 어떻게 정의하면 좋을까요?\"에 답변합니다.",
    "nodeId": "node-1",
    "timestamp": "2026-01-28T00:00:00.000Z"
  },
  "message": "AI 응답이 생성되었습니다"
}
```

---

## ❌ 에러 응답

모든 엔드포인트는 표준 에러 형식을 따릅니다:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "사용어에게 표시할 에러 메시지"
  }
}
```

**일반적인 에러 코드:**
- `UNAUTHORIZED` (401): 인증되지 않음
- `CANVAS_NOT_FOUND` (404): 캔버스를 찾을 수 없음
- `NODE_NOT_FOUND` (404): 노드를 찾을 수 없음
- `INVALID_REQUEST` (400): 요청 파라미터 오류
- `SAVE_FAILED` (500): 저장 실패
- `LOAD_FAILED` (500): 로드 실패

---

## 🧪 테스트 예제

### cURL 테스트

```bash
# 1. 캔버스 로드
curl -X GET http://localhost:3000/api/v1/canvas \
  -H "Authorization: Bearer YOUR_TOKEN"

# 2. 캔버스 저장
curl -X PUT http://localhost:3000/api/v1/canvas/save \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nodes": [],
    "edges": [],
    "progressive_disclosure": {"unlocked_stages": [1,2,3], "show_all": false}
  }'

# 3. AI 제안 생성
curl -X POST http://localhost:3000/api/v1/ai/suggestion \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"nodeId": "node-1"}'

# 4. 스테이지 해제
curl -X POST http://localhost:3000/api/v1/canvas/unlock-stage \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"stage": 4}'
```

### JavaScript/Fetch 테스트

```javascript
// 캔버스 로드
const response = await fetch('http://localhost:3000/api/v1/canvas', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const { success, data, message } = await response.json();

// 캔버스 저장
await fetch('http://localhost:3000/api/v1/canvas/save', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    nodes: [],
    edges: [],
    progressive_disclosure: { unlocked_stages: [1,2,3], show_all: false }
  })
});
```

---

## 📊 Progressive Disclosure 스테이지

| 스테이지 | 노드 타입 | 초기 표시 |
|---------|----------|---------|
| 1 | problem-discovery | ✅ |
| 2 | problem-definition | ✅ |
| 3 | customer-development | ✅ |
| 4 | market-development | ⚡ 해제 필요 |
| 5 | solution | ⚡ 해제 필요 |
| 6 | business-model-canvas | ⚡ 해제 필요 |
| 7 | pitch-deck | ⚡ 해제 필요 |

**초기 상태:** Stage 1-3만 표시
**전체 해제 조건:** 3개 이상 스테이지 완료 시 `show_all: true`

---

## 🔗 관련 파일

- **데이터베이스:** `backend/supabase/migrations/20250128000001_create_lean_startup_canvases.sql`
- **Canvas Routes:** `backend/src/routes/v1/canvas.routes.ts`
- **AI Routes:** `backend/src/routes/v1/ai.routes.ts`
- **프론트엔드 캔버스:** `frontend/src/components/canvas/LeanStartupCanvas.tsx`
- **Redux Store:** `frontend/src/store/canvasSlice.ts`

---

**마지막 업데이트:** 2026-01-28
