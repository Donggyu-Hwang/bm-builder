# Epic 4~6 코드 리뷰 보고서

**Date:** 2026-01-22
**Reviewer:** BMad Master
**Epic:** Epic 4 (문서 관리), Epic 5 (UI/UX), Epic 6 (Node UI)
**Status:** ✅ **리뷰 완료**

---

## 📊 Executive Summary

Epic 4~6에 대한 종합 코드 리뷰를 완료했습니다. 전반적으로 코드 품질이 높으며, TypeScript strict mode를 준수하고, parameterized queries로 SQL injection을 방지하고 있습니다. 그러나 일부 개선이 필요한 항목들이 발견되었습니다.

---

## 🎯 리뷰 결과 요약

| 항목 | Epic 4 | Epic 5 | Epic 6 | 종합 |
|------|-------|-------|-------|------|
| **TypeScript 타입 안전성** | ⚠️ 보통 | ✅ 양호 | ⚠️ 보통 | ⚠️ 보통 |
| **보안 (SQL Injection, XSS)** | ✅ 양호 | ✅ 양호 | ✅ 양호 | ✅ 양호 |
| **성능** | ✅ 양호 | ✅ 양호 | ⚠️ 보통 | ⚠️ 보통 |
| **코드 품질 및 유지보수성** | ✅ 양호 | ✅ 양호 | ⚠️ 보통 | ✅ 양호 |
| **테스트 커버리지** | ⚠️ 보통 | ⚠️ 보통 | ⚠️ 보통 | ⚠️ 보통 |
| **접근성** | ⚠️ 보통 | ✅ 양호 | ⚠️ 보통 | ⚠️ 보통 |

---

## 🔍 Epic 4: 문서 관리

### ✅ 잘 구현된 부분

1. **SQL Injection 방지**
   - 모든 queries가 parameterized (`$1, $2`) ✅
   - `documents.service.ts:131` - user_id로 검증 ✅

2. **TypeScript 타입 정의**
   - Interface 정의 완벽 (`GeneratedDocument`, `PaginatedDocuments`) ✅
   - Discriminated union 사용 (`status: 'generating' | 'completed' | 'failed' | 'draft'`) ✅

3. **에러 처리**
   - Try-catch blocks 적절히 사용 ✅
   - Custom error messages ✅

4. **버전 관리**
   - `saveDocumentVersion()` 메서드로 content 업데이트 시 자동 저장 ✅

### ⚠️ 개선이 필요한 부분

#### 1. TypeScript `any` 타입 사용

**위치:** `backend/src/services/documents.service.ts:66, 208`

```typescript
// ❌ 현재
const params: any[] = [userId];
const values: any[] = [];

// ✅ 권장
const params: (string | number)[] = [userId];
const values: (string | number | Date)[] = [];
```

**영향:** 중간 - 타입 안전성 저하
**우선순위:** P2

---

#### 2. Frontend UX 개선 필요

**위치:** `frontend/src/components/documents/GeneratedDocumentList.tsx:40, 49, 59`

```typescript
// ❌ 현재: confirm(), alert() 사용
if (!confirm('정말 이 문서를 삭제하시겠습니까?')) {
  return;
}
alert('문서 삭제에 실패했습니다');

// ✅ 권장: Modal + Toast notification
const [showDeleteModal, setShowDeleteModal] = useState(false);
const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

// Modal component 사용
<DeleteConfirmationModal
  isOpen={showDeleteModal}
  onConfirm={() => handleDeleteConfirmed(deleteTarget)}
  onCancel={() => setShowDeleteModal(false)}
/>

// Toast notification
import { toast } from 'react-toastify';
toast.success('문서가 삭제되었습니다.');
toast.error('문서 삭제에 실패했습니다.');
```

**영향:** 중간 - 사용자 경험 개선
**우선순위:** P1

---

#### 3. Navigation 방식 개선

**위치:** `frontend/src/components/documents/GeneratedDocumentList.tsx:214`

```typescript
// ❌ 현재: window.location.href 직접 할당
onClick={() => (window.location.href = `/documents/${doc.id}/edit`)}

// ✅ 권장: React Router useNavigate() hook
import { useNavigate } from 'react-router-dom';
const navigate = useNavigate();

onClick={() => navigate(`/documents/${doc.id}/edit`)}
```

**영향:** 낮음 - 기능적 문제 없으나 SPA best practice 준수
**우선순위:** P3

---

#### 4. PDF 생성 MVP 구현

**위치:** `backend/src/services/pdfGeneration.service.ts:14-34`

**문제:** 현재는 text-based placeholder이며, 실제 PDF가 아님

```typescript
// ❌ 현재: 단순 텍스트 반환
private createSimplePDF(document): string {
  return `
    ================================================================================
                     ${document.title}
    ================================================================================
    ...
  `;
}
```

**권장:**
```typescript
// ✅ Puppeteer 사용
import puppeteer from 'puppeteer';

async generatePDF(documentId: string, userId: string): Promise<Buffer> {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // HTML template 렌더링
  const html = this.generateHTMLTemplate(document);
  await page.setContent(html);

  const pdf = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: { top: '1cm', right: '1cm', bottom: '1cm', left: '1cm' }
  });

  await browser.close();
  return pdf;
}
```

**영향:** 높음 - 현재는 실제 PDF가 아님
**우선순위:** P1 (Story 4.3 AC2 명시되어 있음)

---

## 🔍 Epic 5: UI/UX 및 접근성

### ✅ 잘 구현된 부분

1. **Dark Mode 구현**
   - ThemeContext 잘 구현됨 ✅
   - System theme detection 포함 (`prefers-color-scheme`) ✅
   - localStorage 저장 ✅

2. **Tailwind CSS Dark Mode**
   - `darkMode: ['class']` 설정 ✅
   - CSS variables로 색상 체계 정의 ✅

3. **Responsive Breakpoints**
   - 5개 breakpoints 정의 ✅
   - Mobile-first approach ✅

### ⚠️ 개선이 필요한 부분

#### 1. Dark Mode Classes 누락

**위치:** `frontend/src/components/documents/GeneratedDocumentList.tsx`

```typescript
// ❌ 현재: Dark mode classes 없음
<h2 className="text-2xl font-bold text-gray-900">내 문서</h2>

// ✅ 권장
<h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">내 문서</h2>
<input className="... border-gray-300 dark:border-gray-600 ..." />
```

**영향:** 중간 - Dark mode에서 UI 깨짐
**우선순위:** P1

---

#### 2. Theme Context Error Handling

**위치:** `frontend/src/contexts/ThemeContext.tsx:24`

```typescript
// ❌ 현재: typeof window === 'undefined' 체크만
if (typeof window === 'undefined') return defaultTheme;

// ✅ 권장: try-catch로 localStorage 접근 에러 처리
try {
  const stored = localStorage.getItem(storageKey) as Theme;
  return stored || defaultTheme;
} catch (error) {
  console.warn('localStorage access denied:', error);
  return defaultTheme;
}
```

**영향:** 낮음 - private mode에서 에러 발생 가능
**우선순위:** P3

---

## 🔍 Epic 6: Node UI (시각적 워크플로우)

### ✅ 잘 구현된 부분

1. **React Flow 통합**
   - React Flow 11.11.4 최신 버전 사용 ✅
   - Custom nodes 잘 구현됨 ✅
   - Edge types (Custom, Animated) 구현 ✅

2. **기능 구현**
   - Pan/Zoom/Controls ✅
   - Node drag-and-drop ✅
   - Viewport persistence ✅

3. **Custom Hooks**
   - `useCanvasShortcuts` - 키보드 shortcuts ✅
   - `useViewportPersistence` - 뷰포트 저장 ✅
   - `useFlowSimplification` - 플로우 단순화 ✅

### ⚠️ 개선이 필요한 부분

#### 1. 파일 크기 너무 큼음

**위치:** `frontend/src/pages/NodeCanvasPage.tsx` (22,979 lines!)

**문제:** 단일 파일이 너무 커서 유지보수가 어려움

**권장:** 파일 분할

```typescript
// ✅ 권장: 여러 파일로 분할
// components/node-canvas/
//   - NodeCanvas/index.tsx (메인 캔버스)
//   - NodeCanvas/DocumentLoader.ts (문서 로딩)
//   - NodeCanvas/NodeGenerator.ts (노드 생성)
//   - NodeCanvas/EdgeGenerator.ts (엣지 생성)
//   - NodeCanvas/CanvasControls.tsx (컨트롤)
```

**영향:** 높음 - 유지보수성 저하
**우선순위:** P1

---

#### 2. TypeScript `any` 타입 사용

**위치:** `frontend/src/pages/NodeCanvasPage.tsx:81`

```typescript
// ❌ 현재
const [slides, setSlides] = useState<any[]>([]);

// ✅ 권장
interface Slide {
  id: string;
  title: string;
  content: string;
  order: number;
  [key: string]: unknown;
}

const [slides, setSlides] = useState<Slide[]>([]);
```

**영향:** 중간 - 타입 안전성 저하
**우선순위:** P2

---

#### 3. localStorage에 Token 저장 (보안 위험)

**위치:** `frontend/src/pages/NodeCanvasPage.tsx:135`

```typescript
// ❌ 현재: localStorage에 token 저장 (XSS 위험)
'Authorization': `Bearer ${localStorage.getItem('token')}`

// ✅ 권장: Redux store 또는 secure cookie 사용
import { useAppSelector } from '@/store/hooks';
const token = useAppSelector((state) => state.auth.accessToken);

// 또는 axios interceptor 설정
axios.interceptors.request.use((config) => {
  const token = useAppSelector((state) => state.auth.accessToken);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

**영향:** 높음 - XSS 공격에 취약
**우선순위:** P0 (보안)

---

#### 4. alert() 사용

**위치:** `frontend/src/pages/NodeCanvasPage.tsx:120`

```typescript
// ❌ 현재
alert('문서를 불러오는데 실패했습니다');

// ✅ 권장: Toast notification
import { toast } from 'react-toastify';
toast.error('문서를 불러오는데 실패했습니다.');
```

**영향:** 중간 - 사용자 경험 저하
**우선순위:** P2

---

#### 5. Fetch 직접 사용

**위치:** `frontend/src/pages/NodeCanvasPage.tsx:133-137`

```typescript
// ❌ 현재: fetch 직접 사용
const response = await fetch(`/api/documents/${docId}/slides`, {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
  },
});

// ✅ 권장: API client 사용
import { slidesApi } from '@/api/slidesApi';
const slides = await slidesApi.getDocumentSlides(docId);
```

**영향:** 중간 - 코드 일관성 및 에러 처리
**우선순위:** P2

---

#### 6. Performance Optimization

**문제:** 많은 nodes/edges가 있을 때 성능 저하 가능

**권장:**
- React.memo()로 node 컴포넌트 wrapping
- Virtualization for 100+ nodes
- Debounce viewport save (현재 500ms - 적절함)

**영향:** 중간 - 대규모 워크플로우에서 성능 저하
**우선순위:** P2

---

## 🎯 종합 우선순위

### P0 (즉시 수정 필요)
- **Epic 6:** localStorage token 저장 → Redux store 또는 secure cookie (보안)

### P1 (중요)
- **Epic 4:** PDF 생성 MVP → Puppeteer 실제 PDF 생성
- **Epic 4:** confirm() → Modal, alert() → Toast notification
- **Epic 5:** Dark mode classes 추가
- **Epic 6:** NodeCanvasPage 파일 분할 (22,979 lines → 5개 파일)

### P2 (권장)
- **Epic 4, 6:** `any` 타입 제거
- **Epic 6:** Fetch → API client, alert() → Toast
- **Epic 6:** Performance optimization (Virtualization, React.memo)

### P3 (선택)
- **Epic 4:** window.location.href → useNavigate()
- **Epic 5:** localStorage error handling

---

## 🧪 테스트 커버리지 현황

### Epic 4: 문서 관리
- ✅ Service layer tests 존재
- ⚠️ Frontend component tests 부족

### Epic 5: UI/UX
- ⚠️ ThemeContext tests 없음
- ⚠️ Responsive design tests 없음

### Epic 6: Node UI
- ✅ Node components tests 존재
- ⚠️ Integration tests 부족

**권장:**
1. Jest + React Testing Library로 component tests 추가
2. Playwright로 E2E tests 작성
3. Accessibility tests (axe-core) 추가

---

## 📊 점수표 (0-10)

| 항목 | Epic 4 | Epic 5 | Epic 6 |
|------|-------|-------|-------|
| TypeScript 타입 안전성 | 7/10 | 9/10 | 7/10 |
| 보안 | 9/10 | 9/10 | 6/10 |
| 성능 | 8/10 | 9/10 | 6/10 |
| 코드 품질 | 8/10 | 9/10 | 6/10 |
| 테스트 커버리지 | 6/10 | 5/10 | 6/10 |
| 접근성 | 6/10 | 9/10 | 7/10 |
| **종합** | **7.3/10** | **8.3/10** | **6.3/10** |

---

## 🚀 개선 로드맵

### Week 1 (P0, P1)
1. Epic 6: localStorage token → Redux store (보안)
2. Epic 4: PDF 생성 → Puppeteer
3. Epic 4: confirm/alert → Modal/Toast
4. Epic 5: Dark mode classes 추가

### Week 2 (P1, P2)
1. Epic 6: NodeCanvasPage 파일 분할
2. Epic 4, 6: `any` 타입 제거
3. Epic 6: Fetch → API client, alert → Toast

### Week 3 (P2, P3)
1. Epic 6: Performance optimization
2. Epic 4: window.location.href → useNavigate()
3. Epic 5: localStorage error handling
4. E2E tests 작성

---

## 💡 추가 권장사항

1. **ESLint/Prettier 설정 강화**
   - `@typescript-eslint/no-explicit-any` rule 추가
   - `@typescript-eslint/strict` mode 활성화

2. **Husky pre-commit hooks**
   - Commit 전 lint 실행
   - Test 실행

3. **CI/CD 통합**
   - GitHub Actions로 lint/test 자동화
   - Lighthouse CI로 접근성/성능 점수

4. **문서화**
   - JSDoc 주석 추가
   - API 문서 (Swagger)

---

## 📝 결론

Epic 4~6의 코드는 전반적으로 **양호한 수준**입니다. 특히:
- ✅ SQL injection 방지 (parameterized queries)
- ✅ TypeScript strict mode 대부분 준수
- ✅ React Flow 통합
- ✅ Dark Mode 구현

그러나 다음 개선이 필요합니다:
- ⚠️ 보안: localStorage token 저장 → Redux store
- ⚠️ 성능: NodeCanvasPage 파일 분할
- ⚠️ UX: confirm/alert → Modal/Toast
- ⚠️ 기능: 실제 PDF 생성 (Puppeteer)

**전체 점수: 7.3/10** (보통 → 양호 사이)

---

**리뷰어:** BMad Master
**Date:** 2026-01-22
**Version:** v1.0
**Next Review:** After P0/P1 fixes completed

---

**Generated by:** BMad Master
**Date:** 2026-01-22
**Version:** v1.0
