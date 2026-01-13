---
project_name: 'bm-builder'
user_name: 'Donggyu'
date: '2026-01-09'
sections_completed: ['discovery', 'technology_stack', 'implementation_rules', 'advanced_nuanced_rules']
workflow_status: 'complete'
last_updated: '2026-01-09'
---

# Project Context for AI Agents

_이 파일은 AI 에이전트가 bm-builder 프로젝트에서 코드를 구현할 때 따라야 할 중요한 규칙과 패턴을 포함합니다. LLM이 놓치기 쉬운 명백하지 않은 세부 사항에 집중합니다._

---

## Technology Stack & Versions

### Frontend
- **Framework**: React 19.0
- **Build Tool**: Vite 5.1
- **Language**: TypeScript 5.3
- **State Management**: Redux Toolkit 2.10.1
- **Routing**: React Router 7.12.0
- **Styling**: Tailwind CSS 3.4
- **HTTP Client**: Axios 1.6.7

### Backend
- **Framework**: Express 4.19
- **Language**: TypeScript 5.3
- **Runtime**: Node.js 20+ LTS
- **Database Client**: Supabase 2.90.1
- **Vector Extension**: pgvector 0.5.0 (PostgreSQL 15)

### Infrastructure
- **Frontend Hosting**: AWS S3 + CloudFront
- **Backend Hosting**: AWS EC2 t3.medium
- **Database**: Supabase (PostgreSQL 15)
- **CI/CD**: GitHub Actions 2.327.1
- **Monitoring**: AWS CloudWatch

---

## Critical Implementation Rules

### 1. TypeScript Configuration

**Strict Mode Required:**
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

**Path Aliases (Monorepo Pattern):**
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@shared/types": ["../shared/types"]
    }
  }
}
```

**Critical Rule**: 절대로 `any` 타입 사용 금지. Unknown을 사용한 뒤 타입 가드(type guard)로 narrowing.

### 2. Naming Conventions

**Database (PostgreSQL):**
- Tables: `snake_case` (예: `user_profiles`, `embedded_documents`)
- Columns: `snake_case` (예: `created_at`, `document_id`)
- Primary Keys: `id` (UUID)
- Foreign Keys: `{table}_id` (예: `user_id`, `document_id`)

**API (Frontend & Backend):**
- API Client Files: `camelCase.ts` (예: `documentApi.ts`, `ragApi.ts`)
- Endpoints: `kebab-case` (예: `/api/v1/document-generation`, `/api/v1/team-members`)
- Request/Response Bodies: `camelCase` (예: `documentId`, `fileName`)

**Frontend Components:**
- Component Files: `PascalCase.tsx` (예: `DocumentEditor.tsx`, `TeamDashboard.tsx`)
- Component Props: `PascalCase` interface (예: `interface DocumentEditorProps`)
- Hooks: `camelCase` with `use` prefix (예: `useDocumentGeneration.ts`)

**Backend Services:**
- Service Files: `camelCase.service.ts` (예: `document.service.ts`, `rag.service.ts`)
- Controller Files: `camelCase.controller.ts` (예: `document.controller.ts`)
- Model Files: `camelCase.model.ts` (예: `document.model.ts`)

**Redux Slices:**
- Slice Files: `camelCaseSlice.ts` (예: `documentSlice.ts`, `authSlice.ts`)
- Actions: `camelCase` (예: `setDocuments`, `addDocument`)
- Selectors: `selectCamelCase` (예: `selectDocuments`, `selectCurrentDocument`)

### 3. Code Organization Patterns

**Frontend Structure (Feature-based):**
```
frontend/src/
├── api/              # ✅ NOT 'services/' - API 호출 레이어
│   ├── documentApi.ts
│   ├── ragApi.ts
│   └── supabase.ts
├── components/       # Reusable UI components
│   ├── ui/          # Generic UI components
│   └── features/    # Feature-specific components
├── hooks/           # Custom React hooks
├── pages/           # Route components
├── store/           # Redux store
│   └── slices/
├── types/           # TypeScript type definitions
└── utils/           # Utility functions
```

**Backend Structure:**
```
backend/src/
├── routes/v1/       # API route definitions
├── controllers/     # Request handlers
├── services/        # Business logic
├── middleware/      # Express middleware
├── models/          # Data models
└── utils/           # Utility functions

backend/supabase/    # ✅ NOT at project root - Backend 팀 관리
├── migrations/
└── functions/
```

**Critical Rule**: Frontend `api/`는 API 호출만 담당, Backend `services/`는 비즈니스 로직 담당. 역할 혼동 주의.

### 4. API Design Standards

**REST API Response Wrapper:**
```typescript
// Success Response
{
  "success": true,
  "data": { ... }
}

// Error Response
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": { ... }
  }
}
```

**HTTP Verb Usage:**
- `GET`: 조회 (No side effects)
- `POST`: 생성 (Idempotent NOT guaranteed)
- `PUT`: 전체 업데이트 (Idempotent)
- `PATCH`: 부분 업데이트 (Idempotent NOT guaranteed)
- `DELETE`: 삭제 (Idempotent)

**Endpoint Pattern:**
```
/api/v1/{resource}/{id}/{sub-resource}/{sub-id}
```

**Critical Rule**: 모든 API 응답은 위 wrapper 형식 준수. Client가 일관되게 처리 가능.

### 5. State Management with Redux Toolkit

**Slice Structure:**
```typescript
// documentSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

interface DocumentState {
  documents: Document[];
  currentDocument: Document | null;
  loading: boolean;
  error: string | null;
}

const initialState: DocumentState = {
  documents: [],
  currentDocument: null,
  loading: false,
  error: null,
};

export const fetchDocuments = createAsyncThunk(
  'documents/fetchDocuments',
  async (_, { rejectWithValue }) => {
    try {
      const response = await documentApi.getAllDocuments();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const documentSlice = createSlice({
  name: 'documents',
  initialState,
  reducers: {
    setCurrentDocument: (state, action) => {
      state.currentDocument = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDocuments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDocuments.fulfilled, (state, action) => {
        state.loading = false;
        state.documents = action.payload;
      })
      .addCase(fetchDocuments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setCurrentDocument, clearError } = documentSlice.actions;
export const selectDocuments = (state: RootState) => state.documents.documents;
export const selectCurrentDocument = (state: RootState) => state.documents.currentDocument;
export default documentSlice.reducer;
```

**Critical Rules:**
1. 모든 비동기 로직은 `createAsyncThunk` 사용
2. Loading/Error State는 granular하게 관리 (각 operation별)
3. Selector는 `select{Feature}{Entity}` 패턴
4. 절대로 Component에서 직접 API 호출 금지 → 항상 Thunk 통해 Dispatch

### 6. Error Handling Patterns

**Frontend (React Error Boundary):**
```typescript
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Error logging service에 전송 (예: CloudWatch)
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback message={this.state.error} />;
    }
    return this.props.children;
  }
}
```

**Backend (Express Error Middleware):**
```typescript
// errorHandler.ts
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
      },
    });
  }

  // Unexpected error
  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: '예기치 않은 오류가 발생했습니다',
    },
  });
};
```

**Critical Rule**: 모든 Endpoint는 Error Handler middleware 통해 일관된 에러 응답.

### 7. Database Patterns (Supabase)

**RLS (Row Level Security) Policies:**
```sql
-- Example: documents table
CREATE POLICY "Users can view their own documents"
ON documents
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own documents"
ON documents
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documents"
ON documents
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents"
ON documents
FOR DELETE
USING (auth.uid() = user_id);
```

**Critical Rules:**
1. 모든 테이블은 RLS 활성화
2. `auth.uid()`를 통한 접근 제어
3. Backend에서는 Supabase Admin Client 사용 (RLS 우회 가능)
4. Frontend에서는 Supabase Client 사용 (RLS 적용)

### 8. Testing Patterns

**Unit Test Structure (Vitest):**
```typescript
// documentApi.test.ts
import { describe, it, expect, vi } from 'vitest';
import { fetchDocuments } from './documentApi';

describe('documentApi', () => {
  it('should fetch documents successfully', async () => {
    const mockDocuments = [/* ... */];
    vi.mock('./supabase', () => ({
      supabase: {
        from: () => ({
          select: () => ({
            data: mockDocuments,
            error: null,
          }),
        }),
      },
    }));

    const result = await fetchDocuments();
    expect(result).toEqual(mockDocuments);
  });
});
```

**Critical Rules:**
1. Test 파일은 `.test.ts` 또는 `.spec.ts` suffix
2. Mock은 외부 dependency에만 사용 (Supabase, Claude API)
3. Integration Test는 실제 DB 사용 (Test environment)
4. Coverage 목표: 80% 이상

### 9. Performance Patterns

**Progressive Streaming (AI Document Generation):**
```typescript
// Frontend: SSE (Server-Sent Events) 사용
const eventSource = new EventSource('/api/v1/generate/stream');

eventSource.onmessage = (event) => {
  const chunk = JSON.parse(event.data);
  // 점진적 UI 업데이트 (10초 내 첫 500자 표시)
  updateDocumentContent(chunk.content);
};

eventSource.onerror = (error) => {
  console.error('Stream error:', error);
  eventSource.close();
};
```

**Polling (Team Collaboration - Phase 2):**
```typescript
// 30초 간격으로 변경 사항 확인
const POLLING_INTERVAL = 30000;

useEffect(() => {
  const interval = setInterval(async () => {
    await fetchDocumentUpdates(documentId);
  }, POLLING_INTERVAL);

  return () => clearInterval(interval);
}, [documentId]);
```

**Critical Rules:**
1. 장기 실행 작업(2분 이상)은 무조건 Streaming
2. 단순한 상태 확인은 Polling 30초 간격
3. Debounce/Throttle 사용하여 불필요한 API 호출 방지

### 10. Security Patterns

**Environment Variables:**
```bash
# Frontend (.env.local)
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx...
VITE_APP_URL=http://localhost:5173

# Backend (.env)
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJxxx... # ⚠️ Admin key - 절대 Frontend에서 노출 금지
CLAUDE_API_KEY=sk-ant-xxx...
JWT_SECRET=your-secret-key
PORT=3000
NODE_ENV=development
```

**Critical Rules:**
1. 절대로 `.env` 파일을 Git에 커밋 금지
2. `.env.example`, `.env.local.example`만 커밋
3. Backend secret (Service Role Key)은 절대 Frontend 환경변수로 사용 금지
4. 모든 민감 정보는 Backend 환경변수로만 관리

---

## Anti-Patterns to Avoid

❌ **Forbidden Patterns:**

1. **Direct Supabase Client in Frontend Components:**
   ```typescript
   // ❌ BAD
   const { data } = await supabase.from('documents').select('*');
   
   // ✅ GOOD
   const { data } = await documentApi.getAllDocuments();
   ```

2. **State in Component (useState instead of Redux):**
   ```typescript
   // ❌ BAD (global state should be in Redux)
   const [documents, setDocuments] = useState([]);
   
   // ✅ GOOD
   const dispatch = useDispatch();
   const documents = useSelector(selectDocuments);
   ```

3. **API Calls in useEffect without Cleanup:**
   ```typescript
   // ❌ BAD
   useEffect(() => {
     fetchDocuments(); // Memory leak if component unmounts
   }, []);
   
   // ✅ GOOD
   useEffect(() => {
     let mounted = true;
     fetchDocuments().then(data => {
       if (mounted) setDocuments(data);
     });
     return () => { mounted = false; };
   }, []);
   ```

4. **Any Type in TypeScript:**
   ```typescript
   // ❌ BAD
   const process data = (data: any) => { ... };
   
   // ✅ GOOD
   const processData = (data: unknown) => {
     if (isDataValid(data)) {
       // Type narrowing
     }
   };
   ```

5. **Hardcoded API Endpoints:**
   ```typescript
   // ❌ BAD
   fetch('http://localhost:3000/api/v1/documents');
   
   // ✅ GOOD
   const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
   fetch(`${API_BASE_URL}/api/v1/documents`);
   ```

---

## Phase-Based Development Priority

**Phase 1 (MVP - 1개월):**
1. AI Document Generation (Claude API integration)
2. Document Embedding & Context Management (RAG with pgvector)
3. User Onboarding & Personalization (Auth with Supabase)

**Phase 2 (중요 - 2개월):**
4. Team Collaboration (Polling-based)
5. Google Drive Integration
6. Dashboard & Analytics

**Phase 3 (Post-MVP):**
7. WebSocket Real-time Collaboration
8. Advanced Admin Features
9. Version Management

**Critical Rule**: Phase 1 기능부터 우선 구현. Phase 2/3는 Phase 1 완료 후 진행.

---

## Quick Reference

### File Locations
- **Architecture**: `_bmad-output/planning-artifacts/architecture.md`
- **PRD**: `_bmad-output/planning-artifacts/prd.md`
- **Project Context**: `_bmad-output/project-context.md` (이 파일)

### Key Commands
```bash
# Frontend Dev
npm run dev          # Vite dev server (http://localhost:5173)
npm run build        # Production build
npm run preview      # Preview production build

# Backend Dev
npm run dev          # Nodemon (auto-reload)
npm run build        # TypeScript → JavaScript
npm run start        # Production (Node.js)

# Testing
npm run test         # Vitest unit tests
npm run test:watch   # Watch mode
npm run test:coverage # Coverage report
```

### Environment Setup Reference
- `docs/environment-variables.md` (Architecture Document 참조)

---

**Last Updated:** 2026-01-09  
**Architecture Version:** v1.0  
**Status:** Ready for Implementation


---

## Advanced Nuanced Rules (Critical Edge Cases)

_이 섹션은 AI 에이전트가 놓치기 쉬운 미묘하지만 중요한 규칙을 다룹니다. 일반적인 패턴을 넘어선 실전 경험에서 나온 뉘앙스를 포함합니다._

### 1. TypeScript: Discriminated Unions for API Safety

**문제점:** API 응답의 타입 안전성 확보

```typescript
// ❌ BAD: Optional 속성으로 오류 처리 (런타임 검증 필요)
interface ApiResponse<T> {
  data?: T;
  error?: string;
}

// ✅ GOOD: Discriminated union으로 컴파일타임 보장
type ApiResponse<T, E = ApiError> = 
  | { success: true; data: T }
  | { success: false; error: E };

// 사용 시 타입 좁히기 강제
const response = await fetchDocuments();
if (response.success) {
  // TypeScript가 response.data 타입 추론 가능
  console.log(response.data.title);
} else {
  // TypeScript가 response.error 타입 추론 가능
  console.error(response.error.code);
}
```

**Critical Rule:** 모든 API 응답은 discriminated union pattern 사용. 런타임 오류를 컴파일타임에 방지.

---

### 2. Redux Toolkit: Draft State Mutation Pitfall

**문제점:** Immer의 draft state와 실제 state 혼동으로 인한 버그

```typescript
// ❌ BAD: Draft state에서 외부 참조 반환
const documentSlice = createSlice({
  name: 'documents',
  initialState,
  reducers: {
    setActiveDocument: (state, action) => {
      const doc = state.documents.find(d => d.id === action.payload);
      state.active = doc;  // ⚠️ draft state의 임시 객체 (다음 리렌더링时 사라짐)
    }
  }
});

// ✅ GOOD: 값 복사 또는 ID만 저장
const documentSlice = createSlice({
  name: 'documents',
  initialState,
  reducers: {
    setActiveDocumentId: (state, action) => {
      state.activeDocumentId = action.payload;  // ✅ primitive 값 (불변)
    },
  }
});

// Selector로 안전하게 접근
export const selectActiveDocument = createSelector(
  [(state: RootState) => state.documents.items, (state: RootState) => state.documents.activeDocumentId],
  (documents, activeId) => documents.find(d => d.id === activeId) ?? null
);
```

**Critical Rule:** Draft state 객체를 직접 참조하거나 반환 금지. 항상 값 복사 또는 ID 참조 후 Selector로 접근.

---

### 3. Supabase: RLS Policy & Admin Client Boundary

**문제점:** Admin Client의 RLS 우회로 인한 보안 취약점

```typescript
// ❌ BAD: Backend에서 무분별하게 Admin Client 사용
// backend/src/controllers/document.controller.ts
import { supabaseAdmin } from '../config/database';

export const getDocument = async (req, res) => {
  const { data, error } = await supabaseAdmin  // ⚠️ RLS 우회 - 모든 document 접근 가능
    .from('documents')
    .select('*')
    .eq('id', req.params.id);
  
  res.json({ success: true, data });
};

// ✅ GOOD: 명시적 권한 체크 + Admin Client 제한적 사용
export const getDocument = async (req, res) => {
  const userId = req.user.id;  // JWT에서 추출
  
  // RLS 활용: 명시적 필터링
  const { data, error } = await supabaseAdmin
    .from('documents')
    .select('*')
    .eq('id', req.params.id)
    .eq('user_id', userId);  // ✅ 항상 user_id로 필터링
    
  if (error || !data.length) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: '문서를 찾을 수 없습니다' }
    });
  }
  
  res.json({ success: true, data: data[0] });
};

// ✅ BETTER: RPC 함수로 권한 체크
const { data: hasAccess } = await supabaseAdmin.rpc('check_document_access', {
  document_id: req.params.id,
  user_id: userId
});

if (!hasAccess) {
  return res.status(403).json({
    success: false,
    error: { code: 'FORBIDDEN', message: '접근 권한 없음' }
  });
}
```

**Critical Rule:** Admin Client는 무조건 RLS 정책 또는 명시적 권한 체크 후 사용. 절대로 무조건 조회 금지.

---

### 4. React: useEffect Cleanup Trap in Streaming

**문제점:** Progressive streaming 중 컴포넌트 unmount 시 메모리 누수 + state update warning

```typescript
// ❌ BAD: Cleanup 없이 EventSource 생성
useEffect(() => {
  const eventSource = new EventSource('/api/v1/generate/stream');
  
  eventSource.onmessage = (event) => {
    const chunk = JSON.parse(event.data);
    setDocumentContent(prev => prev + chunk.content);  // ⚠️ unmount 후 state 업데이트 시도
  };
  
  // ⚠️ eventSource.close() 누락 - 메모리 누수
}, [documentId]);

// ✅ GOOD: AbortController + Mounted 플래그
useEffect(() => {
  const abortController = new AbortController();
  let mounted = true;  // ✅ mounted 플래그
  
  const streamDocument = async () => {
    try {
      const response = await fetch(`/api/v1/generate/${documentId}`, {
        signal: abortController.signal
      });
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done || !mounted) break;  // ✅ mounted 체크로 early exit
        
        const chunk = decoder.decode(value);
        if (mounted) {
          setDocumentContent(prev => prev + chunk);  // ✅ mounted 체크 후 state 업데이트
        }
      }
    } catch (error) {
      if (error.name !== 'AbortError' && mounted) {
        setError(error.message);
      }
    }
  };
  
  streamDocument();
  
  return () => {
    mounted = false;  // ✅ cleanup 플래그 설정
    abortController.abort();  // ✅ fetch 취소
  };
}, [documentId]);
```

**Critical Rule:** 모든 async operation은 AbortController + mounted 플래그로 cleanup. unmount 후 state 업데이트 방지.

---

### 5. Security: Environment Variable Leakage in Client Bundles

**문제점:** Vite의 환경변수 처리로 인한 실수 민감 정보 노출

```bash
# ❌ BAD: VITE_ prefix로 민감 정보 정의 (번들에 노출됨)
# .env.local (Frontend)
VITE_SUPABASE_SERVICE_ROLE_KEY=eyJxxx...  # ⚠️ dist/index.js에 포함!
VITE_CLAUDE_API_KEY=sk-ant-xxx...          # ⚠️ 브라우저 DevTools로 노출!

# ✅ GOOD: 백엔드 환경변수로만 사용
# .env.local (Frontend)
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx...  # ✅ Public key만 노출 (RLS로 보호)

# .env (Backend)
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...  # ✅ 백엔드 전용
CLAUDE_API_KEY=sk-ant-xxx...          # ✅ 백엔드 전용
```

```typescript
// ❌ BAD: Frontend에서 백엔드 API 직접 호출
// frontend/src/api/claudeApi.ts
const CLAUDE_API_KEY = import.meta.env.VITE_CLAUDE_API_KEY;  // ⚠️ 번들에 노출

export async function generateDocument(prompt: string) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    headers: {
      'x-api-key': CLAUDE_API_KEY,  // ⚠️ 브라우저에 노출 (크롤링 가능)
    }
  });
}

// ✅ GOOD: 항상 백엔드 통해 프록시
// frontend/src/api/documentApi.ts
export async function generateDocument(prompt: string) {
  const response = await fetch('/api/v1/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt })
  });
  // 백엔드가 Claude API 호출 (API key 보호)
}

// backend/src/services/claude.service.ts
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;  // ✅ 서버에서만 사용 (노출 안됨)
```

**Critical Rule:** 
- 민감 정보는 절대 `VITE_` prefix로 정의 금지
- 민한 정보는 항상 백엔드 환경변수 + 프록시 패턴 사용
- Frontend bundle 확인: `npm run build && grep -r "SERVICE_ROLE\|CLAUDE_API_KEY" dist/`

---

## Summary: Advanced Rules Impact

| 규칙 | 발견된 문제 | 영향도 | 방지하는 버그 |
|------|-----------|--------|--------------|
| **Discriminated Unions** | Optional 속성으로 인한 런타임 null access | 🔴 High | `Cannot read property of undefined` |
| **Draft State** | Immer draft 참조로 state corruption | 🔴 High | 데이터 사라짐, stale state |
| **RLS Boundary** | Admin Client 무분별 사용으로 보안 취약점 | 🔴 High | 데이터 유출, 인증 우회 |
| **Cleanup Trap** | Streaming 중 unount 시 메모리 누수 | 🟡 Medium | Memory leak, React warning |
| **Secret Leakage** | VITE_ prefix로 API key 노출 | 🔴 Critical | API key 탈취, 과금 파괴 |

