# Story 4.1: 노드 사이드바 렌더링

Status: done

## Story

As a 캔버스 사용자,
I want 노드 클릭 시 우측 사이드바에서 상세 내용 확인 및 수정,
so that 노드 내용을 체계적으로 개발하고 관리할 수 있다.

## Acceptance Criteria

**Given** 사용자가 캔버스 상의 노드를 클릭한다
**When** 클릭 이벤트가 발생한다
**Then** 우측 사이드바가 200ms 이내에 열린다
**And** 사이드바는 React Portal로 렌더링되어 z-index 900으로 표시된다
**And** 사이드바 너비는 400px(데스크톱) 또는 전체 화면(모바일)이다
**And** 사이드바는 오른쪽에서 슬라이드 인으로 표시된다 (transition: 300ms ease)

**Given** 사이드바가 열린다
**When** 렌더링이 완료된다
**Then** 사이드바 상단에 노드 타이틀(Stage + 타입명)이 표시된다
**And** 노드 상태(⭕ 미시작 / ⏳ 진행 중 / ✅ 완료)가 표시된다
**And** "닫기" 버튼이 우측 상단에 표시된다
**And** Skeleton UI가 200ms 동안 표시된 후 실제 내용이 로딩된다

**Given** 사이드바 내용이 표시된다
**When** 콘텐츠를 확인한다
**Then** 2개 탭이 제공된다: "내용" / "AI 대화"
**And** 기본 탭은 "내용"이다
**And** "내용" 탭에는 노드 제목 입력 필드가 표시된다
**And** "내용" 탭에는 노드 본문 텍스트에어리어가 표시된다
**And** 텍스트에어리어는 자동 높이 조정(autosize)이 지원된다

**Given** 사용자가 "AI 대화" 탭을 클릭한다
**When** 탭 전환이 발생한다
**Then** 300ms 이내에 "AI 대화" 탭으로 전환된다
**And** AI Co-Founder와의 대화 인터페이스가 표시된다
**And** 대화 히스토리가 채팅 형식으로 표시된다
**And** 입력 필드가 하단에 고정된다

**Given** 사용자가 "닫기" 버튼을 클릭한다
**When** 사이드바가 닫힌다
**Then** 사이드바가 오른쪽으로 슬라이드 아웃된다 (300ms)
**And** 사이드바가 닫힌 후 노드 선택이 해제된다
**And** ESC 키로도 사이드바가 닫힌다

**Given** 모바일 기기에서 접속한다
**When** 사이드바가 열린다
**Then** 사이드바가 전체 화면 모달로 표시된다
**And** 하단에서 슬라이드 업으로 표시된다 (bottom sheet)
**And** 탭이 하단 네비게이션 바로 이동한다
**And** "닫기" 버튼이 좌측 상단 화살표로 변경된다

**Given** 키보드만 사용한다
**When** 노드를 선택한다
**Then** 포커스가 사이드바로 이동한다
**And** Tab 키로 탭 간 이동이 가능하다
**And** Enter 키로 입력 필드에 텍스트가 입력된다
**And** ESC 키로 사이드바가 닫힌다

**Given** 사이드바에서 내용을 수정한다
**When** 수정이 발생한다
**Then** debounce 2s 후 자동 저장이 트리거된다
**And** 저장 성공 시 "저장됨" 토스트가 1초간 표시된다
**And** 캔버스 상의 노드가 실시간으로 업데이트된다

## Tasks / Subtasks

- [ ] **Implement Sidebar Component**
  - [ ] Create `frontend/src/components/sidebar/NodeSidebar.tsx`
  - [ ] Render with React Portal (z-index 900)
  - [ ] Width: 400px (desktop), 100% (mobile)
  - [ ] Slide-in animation from right (300ms ease)
  - [ ] Open within 200ms of node click

- [ ] **Implement Sidebar Header**
  - [ ] Display node title (Stage + Type name)
  - [ ] Display node status icon (⭕ ⏳ ✅)
  - [ ] Add "Close" button in top-right
  - [ ] Implement Skeleton UI (200ms loading)

- [ ] **Implement Tab System**
  - [ ] Create 2 tabs: "내용" / "AI 대화"
  - [ ] Default to "내용" tab
  - [ ] Tab transition: 300ms
  - [ ] Active tab highlighting

- [ ] **Implement Content Tab**
  - [ ] Add node title input field
  - [ ] Add node body textarea with autosize
  - [ ] Implement auto-save (debounce 2s)
  - [ ] Show "저장됨" toast on save

- [ ] **Implement AI Chat Tab**
  - [ ] Create chat interface
  - [ ] Display conversation history
  - [ ] Fix input field at bottom
  - [ ] (Detailed implementation in Story 4.2)

- [ ] **Implement Mobile Responsive Layout**
  - [ ] Full-screen modal on mobile
  - [ ] Slide-up animation from bottom
  - [ ] Move tabs to bottom navigation bar
  - [ ] Change close button to arrow icon (top-left)

- [ ] **Implement Keyboard Navigation**
  - [ ] Move focus to sidebar on node select
  - [ ] Tab key navigation between tabs
  - [ ] ESC key to close sidebar
  - [ ] Screen reader announcements

## Dev Notes

### Architecture Compliance

**Tech Stack:**
- React 19 + TypeScript 5.3.3
- Redux Toolkit 2.10.1
- Tailwind CSS 3.4.1
- React Portal for sidebar rendering

**File Structure:**
```
frontend/src/
├── components/sidebar/
│   ├── NodeSidebar.tsx
│   ├── SidebarHeader.tsx
│   ├── ContentTab.tsx
│   └── AIChatTab.tsx
├── hooks/
│   └── useSidebar.ts
└── store/slices/
    └── sidebarSlice.ts
```

**Sidebar State:**
```typescript
interface SidebarState {
  isOpen: boolean;
  selectedNodeId: string | null;
  activeTab: 'content' | 'ai-chat';
}
```

**Auto-Save Logic:**
```typescript
const debouncedSave = useDebounce(() => {
  // Call PATCH /api/v1/nodes/:id
  // Show "저장됨" toast
}, 2000);
```

**Performance Requirements:**
- Sidebar open: 200ms or less (FR-005)
- Tab transition: 300ms
- Auto-save debounce: 2s

**Accessibility (NFR-010):**
- WCAG 2.1 AA compliance
- Focus management
- Keyboard navigation (Tab, ESC)
- Screen reader support

**Mobile Responsive:**
- Desktop: 400px width, right-aligned
- Mobile: Full-screen, bottom sheet
- Touch targets: Minimum 44px

**Testing:**
- Unit tests for sidebar logic
- Integration tests for tab switching
- Visual regression tests for animations

## References

- [Source: architecture.md#Frontend Architecture]
- [Source: prd-leanstartup-canvas-2026-01-26.md#FR-005 노드 상세 보기]
- [Source: epics-new.md#Epic 4 Story 4.1]

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.5

### Completion Notes List


### File List

- `/Users/donggyu/bm-builder/frontend/src/components/sidebar/NodeSidebar.tsx`
- `/Users/donggyu/bm-builder/frontend/src/components/sidebar/SidebarHeader.tsx`
- `/Users/donggyu/bm-builder/frontend/src/components/sidebar/ContentTab.tsx`
- `/Users/donggyu/bm-builder/frontend/src/hooks/useSidebar.ts`
- `/Users/donggyu/bm-builder/frontend/src/store/slices/sidebarSlice.ts`
