# Story 5.2: LocalStorage 백업 및 서버 동기화

Status: done

## Story

As a 캔버스 사용자,
I want LocalStorage 백업 + 서버 동기화 (오프라인 지원),
so that 오프라인에서도 작업할 수 있고 데이터가 안전하게 보호된다.

## Acceptance Criteria (Summary)

**Initial Load:**
- Load from LocalStorage on app init
- Data key: `bm_builder_canvas_data`
- Format: { nodes, connections, timestamp, version }
- Empty canvas if no data

**Server Sync:**
- Fetch from server (GET /api/canvas)
- Compare timestamps
- Use latest data (server or LocalStorage)
- Upload LocalStorage if newer

**Offline Detection:**
- "오프라인 모드로 작동 중입니다" alert
- Orange background (#f97316)
- All operations to LocalStorage only
- Canvas functions normally

**Online Recovery:**
- Auto-sync within 5 seconds
- "온라인 복구: 동기화 중입니다" toast
- Latest timestamp wins
- "동기화 완료" toast when done

**Conflict Resolution:**
- "변경 사항이 있습니다" modal
- Show both timestamps
- Options: "서버 유지" / "로컬 유지"
- Save choice for next time

**LocalStorage Monitoring:**
- Track usage / 5MB capacity
- Warning at 80% usage
- Auto-delete old versions (FIFO: keep 10)

**Backup Creation:**
- Hourly backups to LocalStorage
- Key: `bm_builder_canvas_backup_{timestamp}`
- Maximum 10 backups
- User can restore from settings

**Mobile Support:**
- iOS Safari Private Browsing support
- Quota exceeded error handling
- Fallback to sessionStorage

## Tasks / Subtasks

- [ ] **Implement LocalStorage Manager**
  - [ ] Create load/save functions
  - [ ] Handle quota exceeded errors
  - [ ] Implement FIFO cleanup (keep 10)
  - [ ] Support sessionStorage fallback

- [ ] **Implement Server Sync Logic**
  - [ ] Fetch server data on load
  - [ ] Compare timestamps
  - [ ] Apply latest data
  - [ ] Upload if LocalStorage is newer

- [ ] **Implement Offline Detection**
  - [ ] Monitor navigator.onLine
  - [ ] Show offline alert
  - [ ] Route all saves to LocalStorage
  - [ ] Disable server-dependent features

- [ ] **Implement Online Recovery**
  - [ ] Detect online status change
  - [ ] Trigger sync within 5 seconds
  - [ ] Apply latest timestamp wins logic
  - [ ] Show sync completion toast

- [ ] **Implement Conflict Resolution**
  - [ ] Detect timestamp mismatch
  - [ ] Show conflict modal
  - [ ] Provide "서버 유지" / "로컬 유지" options
  - [ ] Save user preference

- [ ] **Implement Backup System**
  - [ ] Create hourly backups
  - [ ] Maintain maximum 10 backups
  - [ ] Add restore functionality in settings

## Dev Notes

**LocalStorage Schema:**
```typescript
interface CanvasData {
  nodes: Node[];
  connections: Connection[];
  timestamp: number;
  version: number;
}
```

**API Endpoint:**
```
GET /api/canvas
Response: { success: true; data: CanvasData }

PUT /api/canvas
Request: CanvasData
Response: { success: true }
```

**Conflict Resolution:**
- User selects preferred source
- Save preference to localStorage
- Auto-apply next time

**Performance:**
- Sync within 5 seconds of online recovery
- Hourly backup creation

**Testing:**
- Unit tests for sync logic
- Integration tests for conflict resolution
- Offline mode tests

## References
- [Source: architecture.md#API & Communication Patterns]
- [Source: prd-leanstartup-canvas-2026-01-26.md#NFR-013 데이터 - 오프라인 지원]
- [Source: epics-new.md#Epic 5 Story 5.2]

## Dev Agent Record

### Agent Model Used
Claude Sonnet 4.5

### File List
- `/Users/donggyu/bm-builder/frontend/src/services/localStorage.service.ts`
- `/Users/donggyu/bm-builder/frontend/src/services/sync.service.ts`
- `/Users/donggyu/bm-builder/backend/src/routes/canvas.routes.ts`
EOF
echo "Created story 5-2"