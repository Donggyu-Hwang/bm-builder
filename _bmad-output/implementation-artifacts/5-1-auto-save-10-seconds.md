# Story 5.1: 자동 저장 (10초마다)

Status: backlog

## Story

As a 캔버스 사용자,
I want 10초마다 자동으로 작업 내용 저장,
so that 데이터 손실을 방지하고 안심하고 작업할 수 있다.

## Acceptance Criteria (Summary)

**Auto-Save Trigger:**
- Every 10 seconds automatically
- Save all nodes (position, content, status)
- Save all connections
- Show "저장됨" toast (1 second)
- Record timestamp

**Change-Based Save:**
- Debounce 2s after any change
- Reset 10s periodic timer
- Incremental save (only changed nodes/connections)

**API Call:**
- POST /api/canvas/save
- Request: { success: boolean, data: { nodes, connections, timestamp } }
- Timeout: 5 seconds
- Background operation (no indicator)

**LocalStorage First:**
- Save to LocalStorage immediately
- Then call server API (async)
- Optimistic UI update
- Maintain LocalStorage regardless of server success

**Error Handling:**
- "저장 실패: 로컬에만 저장되었습니다" toast
- Maintain LocalStorage data
- Count consecutive failures
- "네트워크 연결을 확인해주세요" alert after 3 failures

**Manual Save:**
- "지금 저장" button
- Click "마지막 저장: X분 전" text
- Immediate save (ignore debounce)
- Show "저장 중..." indicator

**Last Save Display:**
- "마지막 저장: X분 전" in header
- "방금 전" for < 1 minute
- Click to reveal "지금 저장" button

**Offline Support:**
- LocalStorage only when offline
- "오프라인: 로컬에 저장되었습니다" toast

## Tasks / Subtasks

- [ ] **Implement Periodic Auto-Save**
  - [ ] Set 10-second interval timer
  - [ ] Collect all nodes and connections
  - [ ] Call save API
  - [ ] Show "저장됨" toast
  - [ ] Record timestamp

- [ ] **Implement Change-Based Save**
  - [ ] Detect node/connection changes
  - [ ] Debounce by 2 seconds
  - [ ] Reset 10s timer
  - [ ] Perform incremental save

- [ ] **Implement API Integration**
  - [ ] Create POST /api/canvas/save endpoint
  - [ ] Set 5-second timeout
  - [ ] Handle success/failure responses

- [ ] **Implement LocalStorage First Strategy**
  - [ ] Save to LocalStorage immediately
  - [ ] Perform server API call asynchronously
  - [ ] Update UI optimistically
  - [ ] Maintain LocalStorage data

- [ ] **Implement Error Handling**
  - [ ] Detect API failures
  - [ ] Show error toast
  - [ ] Track consecutive failures
  - [ ] Show network alert after 3 failures

- [ ] **Implement Manual Save**
  - [ ] Add "지금 저장" button
  - [ ] Trigger immediate save
  - [ ] Show loading indicator
  - [ ] Display success toast

## Dev Notes

**API Endpoint:**
```typescript
POST /api/canvas/save
Request: {
  canvasId: string;
  nodes: Node[];
  connections: Connection[];
  timestamp: number;
}
Response: {
  success: true;
  data: { saved: true; timestamp: number };
}
```

**LocalStorage Schema:**
```typescript
// Key: 'bm_builder_canvas_data'
{
  nodes: Node[];
  connections: Connection[];
  timestamp: number;
}
```

**Performance:**
- Auto-save interval: 10 seconds
- Change debounce: 2 seconds
- API timeout: 5 seconds

**Testing:**
- Unit tests for save logic
- Integration tests for API calls
- Error handling tests

## References
- [Source: architecture.md#API & Communication Patterns]
- [Source: prd-leanstartup-canvas-2026-01-26.md#NFR-012 데이터 - 상태 관리 및 저장]
- [Source: epics-new.md#Epic 5 Story 5.1]

## Dev Agent Record

### Agent Model Used
Claude Sonnet 4.5

### File List
- `/Users/donggyu/bm-builder/frontend/src/hooks/useAutoSave.ts`
- `/Users/donggyu/bm-builder/backend/src/routes/canvas.routes.ts`
- `/Users/donggyu/bm-builder/backend/src/services/canvas.service.ts`
EOF
echo "Created story 5-1"