# Story ${story_id}: ${title}

**Story ID:** ${story_id}
**Epic:** Epic 8 - 실시간 협업 및 버전 관리
**Status:** ready-for-dev
**Last Updated:** 2026-02-02

---

## User Story

**As a** 예비 창업가,
**I want** 팀원들과 실시간으로 협업하고 싶어서,
**So that** 즉각적으로 피드백을 주고받을 수 있다.

---

## Acceptance Criteria

### AC1: WebSocket 연결
**Given** 팀 문서에 여러 팀원이 접속했을 때
**When** 문서가 열리면
**Then** WebSocket 연결이-established된다:
  - 각 사용자의 접속을 추적
  - "2명이 문서를 보고 있습니다" presence 표시
  - 접속 해제 시 즉시 반영

### AC2: OT/CRDT 기반 동시 편집
**When** 두 명 이상이 동시에 같은 문단을 편집하면
**Then** OT (Operational Transformation) 또는 CRDT (Conflict-free Replicated Data Type)로 충돌 해결:
  - Yjs (CRDT library) 또는 자체 구현
  - 충돌 없이 실시간 동기화
  - 각 사용자의 cursor 위치 표시

### AC3: 실시간 댓글
**When** 팀원이 댓글을 달면
**Then** WebSocket을 통해 실시간으로 다른 팀원에게 전송된다:
  - "새 댓글이 달렸습니다" 토스트
  - 댓글 섹션이 즉시 업데이트됨

### AC4: 버전 히스토리
**When** 문서가 저장될 때마다
**Then** 버전 snapshot이 생성된다:
  - `document_versions` 테이블에 version_number 증가
  - 전체 content 저장
  - 타임스탬프 포함 (누가 누가, 어떤 내용 수정)

### AC5: 버전 복원
**And** 사용자가 "이전 버전으로 되돌리기"를 클릭하면
**Then** 버전 비교 modal이 표시된다:
  - 현재 버전 vs 이전 버전 비교 (side-by-side)
  - "이 버전으로 되돌리기" / "취소" 버튼

---

## Technical Implementation

### WebSocket Service

**File:** \`backend/src/services/websocket.service.ts\`

\`\`\`typescript
import { WebSocketServer } from 'ws';

export class WebSocketService {
  private wss: WebSocketServer;

  initialize(server: any) {
    this.wss = new WebSocketServer({ server, path: '/ws' });

    this.wss.on('connection', (ws, req) => {
      const userId = this.extractUserId(req);
      console.log(\`User \${userId} connected\`);

      // Send current state
      ws.send(JSON.stringify({
        type: 'connected',
        userId,
        currentUsers: this.getConnectedUsers()
      }));
    });

    this.wss.on('disconnect', (ws, req) => {
      const userId = this.extractUserId(req);
      console.log(\`User \${userId} disconnected\`);
      this.broadcastPresence();
    });
  }

  broadcastPresence() {
    const message = JSON.stringify({
      type: 'presence',
      users: this.getConnectedUsers()
    });

    this.wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  private extractUserId(req: any): string {
    // JWT 토큰에서 user_id 추출
    const token = req.headers['sec-websocket-protocol'];
    // ... implementation
  }

  private getConnectedUsers(): string[] {
    // 현재 접속된 사용자 목록 반환
    // ... implementation
    return [];
  }
}

export const webSocketService = new WebSocketService();
\`\`\`

### CRDT Implementation

**Library:** Yjs (CRDT library)

**Installation:**
\`\`\`bash
npm install yjs y-websocket y-provider\n\`\`\`

**File:** \`frontend/src/components/collaboration/CollaborativeEditor.tsx\`\`

\`\`\`typescript
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { useSnackbar } from 'notistack';

export const CollaborativeEditor = ({ documentId }) => {  const { enqueueSnackbar } = useSnackbar();
  const [yDoc] = Y.Doc.fromString('{\\"root\\":{\\"text\\":\\"Hello\\"}}');

  // ... implementation
};
\`\`\`

---

**Story Status:** ✅ Ready for Development
**Estimated Complexity:** Very High (WebSocket, CRDT, 충돌 해결)
**Recommended Developer:** Dev agent
**Dependencies:** Epic 1 (Authentication), Epic 7 (Team Collaboration)
