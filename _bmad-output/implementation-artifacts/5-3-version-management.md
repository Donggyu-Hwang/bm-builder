# Story 5.3: 버전 관리 (최근 10개)

Status: done

## Story

As a 캔버스 사용자,
I want 버전 이력 관리 (최근 10개) 및 실행 취소,
so that 실수를 되돌릴 수 있고 이전 버전으로 복구할 수 있다.

## Acceptance Criteria (Summary)

**Snapshot Creation:**
- Auto-create every 1 minute
- Or on user input/node creation/deletion
- Snapshot data: { id, timestamp, nodes, connections, description }
- UUID v4 for snapshot ID
- Maximum 10 snapshots (FIFO)

**Undo/Redo:**
- Ctrl+Z: Undo to previous snapshot
- Ctrl+Y (Cmd+Shift+Z on Mac): Redo
- Maximum 10 steps
- Show "실행 취소됨" / "다시 실행됨" toast
- Update canvas immediately

**Version History UI:**
- "버전 기록" menu
- List recent 10 snapshots
- Show timestamp and auto-generated description
- "복원" button for each snapshot

**Restore Snapshot:**
- Confirmation modal: "이 버전으로 복원하시겠습니까?"
- Restore canvas to selected snapshot
- "버전 복원됨: {timestamp}" toast
- Save to server

**Version Diff:**
- Select 2 snapshots
- "변경 사항 보기" modal
- Green highlight for added nodes
- Red strikethrough for deleted nodes
- Blue for modified nodes
- Side-by-side content comparison

**Auto-Description:**
- Node created: "노드 '{title}' 생성됨"
- Node deleted: "노드 '{title}' 삭제됨"
- Node moved: "노드 이동됨"
- Content edited: "노드 '{title}' 수정됨" (100+ chars)
- Connection created: "연결 생성됨"
- Connection deleted: "연결 삭제됨"

**Manual Version:**
- "버전 저장" button
- Prompt for custom description
- Immediate snapshot creation
- "버전 '{name}' 저장됨" toast

**Keyboard Shortcuts:**
- Ctrl+Z / Cmd+Z (Mac)
- Ctrl+Y / Cmd+Shift+Z (Mac)
- Global scope (includes sidebar)
- Screen reader announcements

**IndexedDB Upgrade:**
- Auto-migrate when LocalStorage 5MB limit reached
- "데이터베이스 업그레이드 중..." toast
- Expand from 10 to 100 snapshots
- Database: `bm_builder_canvas_v2`
- Use `idb` library

## Tasks / Subtasks

- [ ] **Implement Snapshot System**
  - [ ] Create snapshot data structure
  - [ ] Auto-create every 1 minute
  - [ ] Create on user actions
  - [ ] Maintain maximum 10 (FIFO)

- [ ] **Implement Undo/Redo**
  - [ ] Add Ctrl+Z / Ctrl+Y listeners
  - [ ] Support Mac shortcuts (Cmd+Z, Cmd+Shift+Z)
  - [ ] Navigate snapshot history
  - [ ] Update canvas immediately

- [ ] **Implement Version History UI**
  - [ ] Create "버전 기록" modal
  - [ ] List 10 recent snapshots
  - [ ] Show timestamp and description
  - [ ] Add "복원" buttons

- [ ] **Implement Restore Function**
  - [ ] Show confirmation modal
  - [ ] Restore canvas state
  - [ ] Save to server
  - [ ] Show success toast

- [ ] **Implement Version Diff**
  - [ ] Compare 2 snapshots
  - [ ] Highlight changes (add/delete/modify)
  - [ ] Side-by-side comparison view

- [ ] **Implement Auto-Description**
  - [ ] Generate description based on action
  - [ ] Use templates for each action type
  - [ ] Track content changes (>100 chars)

- [ ] **Implement Manual Version Save**
  - [ ] Add "버전 저장" button
  - [ ] Prompt for description
  - [ ] Create immediate snapshot

- [ ] **Implement IndexedDB Migration**
  - [ ] Detect LocalStorage limit (5MB)
  - [ ] Auto-migrate to IndexedDB
  - [ ] Use `idb` library
  - [ ] Expand to 100 snapshots

## Dev Notes

**Snapshot Schema:**
```typescript
interface Snapshot {
  id: string; // UUID v4
  timestamp: number;
  nodes: Node[];
  connections: Connection[];
  description: string;
}
```

**LocalStorage:**
```typescript
// Key: 'bm_builder_canvas_snapshots'
{
  snapshots: Snapshot[];
  currentIndex: number;
}
```

**IndexedDB:**
```typescript
// Database: bm_builder_canvas_v2
// Store: snapshots
// Key: id (UUID)
// Max snapshots: 100
```

**Performance:**
- Snapshot interval: 1 minute
- Immediate canvas update on undo/redo
- Diff comparison: < 500ms

**Testing:**
- Unit tests for snapshot logic
- Integration tests for undo/redo
- IndexedDB migration tests

## References
- [Source: architecture.md#Data Architecture]
- [Source: prd-leanstartup-canvas-2026-01-26.md#NFR-014 데이터 - 버전 관리]
- [Source: epics-new.md#Epic 5 Story 5.3]

## Dev Agent Record

### Agent Model Used
Claude Sonnet 4.5

### File List
- `/Users/donggyu/bm-builder/frontend/src/services/snapshot.service.ts`
- `/Users/donggyu/bm-builder/frontend/src/hooks/useUndoRedo.ts`
- `/Users/donggyu/bm-builder/frontend/src/components/history/VersionHistory.tsx`
EOF
echo "Created story 5-3"