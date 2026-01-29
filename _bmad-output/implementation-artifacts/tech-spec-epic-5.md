# Technical Specification: Epic 5 - 진행 상태 저장 및 복구

**Epic ID:** Epic-5
**Epic Name:** 진행 상태 저장 및 복구 (State Management & Persistence)
**Status:** Ready for Development
**Last Updated:** 2026-01-28
**Author:** Technical Specification (YOLO Mode)

---

## 1. Overview

### 1.1 Problem Statement

**User Pain Points:**
- 작업 중 데이터가 손실될까 봐 걱정
- 오프라인 상태에서 작업할 수 없음
- 실수로 노드를 삭제했을 때 복구할 방법이 없음

### 1.2 Solution Approach

**Core Capabilities:**
1. **자동 저장:** 10초마다 자동 저장
2. **LocalStorage 백업:** 오프라인 지원 + 서버 동기화
3. **버전 관리:** 최근 10개 버전 스냅샷 (1분마다)

### 1.3 In/Out Scope

**In Scope:**
- 자동 저장 (Story 5.1)
- LocalStorage 백업 (Story 5.2)
- 버전 관리 (Story 5.3)

**Out Scope:**
- 실시간 협업 충돌 해결 (OT/CRDT) - Post-MVP
- 무제한 버전 히스토리

---

## 2. Context for Development

### 2.1 Files to Create/Modify

**New Files:**
1. `/Users/donggyu/bm-builder/frontend/src/hooks/useAutoSave.ts`
2. `/Users/donggyu/bm-builder/frontend/src/hooks/useVersionHistory.ts`
3. `/Users/donggyu/bm-builder/frontend/src/utils/localStorage.ts`
4. `/Users/donggyu/bm-builder/backend/src/routes/v1/canvas.routes.ts` (extend)
5. `/Users/donggyu/bm-builder/backend/src/services/canvas.service.ts` (extend)

**Modified Files:**
1. `/Users/donggyu/bm-builder/frontend/src/store/slices/canvasSlice.ts` - Add persistence

### 2.2 Technical Decisions

**LocalStorage First Strategy:**
1. 즉시 LocalStorage에 저장 (optimistic update)
2. 비동기로 서버 API 호출
3. 서버 실패 시 LocalStorage 데이터 유지

**LocalStorage Keys:**
```typescript
const STORAGE_KEYS = {
  CANVAS_DATA: 'bm_builder_canvas_data',
  SNAPSHOTS: 'bm_builder_canvas_snapshots',
  LAST_SAVE: 'bm_builder_last_save_timestamp'
};
```

---

## 3. Implementation Plan

### 3.1 Story 5.1: 자동 저장 (10초마다)

**Frontend Implementation:**

```typescript
// frontend/src/hooks/useAutoSave.ts
import { useEffect, useRef } from 'react';
import { useAppSelector } from '../../store/hooks';
import { saveCanvas } from '../../api/canvasApi';
import { saveToLocalStorage } from '../../utils/localStorage';

export function useAutoSave() {
  const nodes = useAppSelector(state => state.canvas.nodes);
  const edges = useAppSelector(state => state.canvas.edges);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Debounce 2s 후 저장
    const debouncedSave = setTimeout(() => {
      performSave();
    }, 2000);

    return () => clearTimeout(debouncedSave);
  }, [nodes, edges]);

  // 10초마다 주기적 저장
  useEffect(() => {
    const interval = setInterval(() => {
      performSave();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const performSave = async () => {
    const canvasData = { nodes, edges, timestamp: Date.now() };

    // 1. LocalStorage First (즉시 완료)
    saveToLocalStorage(STORAGE_KEYS.CANVAS_DATA, canvasData);

    // 2. Server API (비동기)
    try {
      await saveCanvas(canvasData);
      toast.success('저장됨', { autoClose: 1000 });
    } catch (error) {
      console.error('Save failed:', error);
      toast.error('저장 실패: 로컬에만 저장되었습니다');
    }
  };

  return { performSave };
}
```

**API Layer:**

```typescript
// frontend/src/api/canvasApi.ts
import { axiosInstance } from './axios';

export async function saveCanvas(data: any) {
  const response = await axiosInstance.post('/api/v1/canvas/save', data);
  return response.data;
}

export async function loadCanvas() {
  const response = await axiosInstance.get('/api/v1/canvas');
  return response.data;
}
```

**Backend Implementation:**

```typescript
// backend/src/routes/v1/canvas.routes.ts
import express from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { saveCanvas, loadCanvas } from '../../services/canvas.service';

const router = express.Router();

router.post('/save', authenticate, async (req, res) => {
  try {
    const { nodes, edges, timestamp } = req.body;

    const result = await saveCanvas(req.userId, {
      nodes,
      edges,
      timestamp
    });

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'SAVE_FAILED', message: error.message }
    });
  }
});

router.get('/', authenticate, async (req, res) => {
  try {
    const canvas = await loadCanvas(req.userId);
    res.json({ success: true, data: canvas });
  } catch (error) {
    res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Canvas not found' }
    });
  }
});

export default router;
```

```typescript
// backend/src/services/canvas.service.ts
import { pool } from '../utils/db';

export async function saveCanvas(userId: string, data: any) {
  const query = `
    INSERT INTO canvases (user_id, nodes, edges, timestamp, updated_at)
    VALUES ($1, $2, $3, $4, NOW())
    ON CONFLICT (user_id) DO UPDATE SET
      nodes = $2,
      edges = $3,
      timestamp = $4,
      updated_at = NOW()
    RETURNING *
  `;
  const result = await pool.query(query, [
    userId,
    JSON.stringify(data.nodes),
    JSON.stringify(data.edges),
    data.timestamp
  ]);
  return result.rows[0];
}

export async function loadCanvas(userId: string) {
  const query = `
    SELECT nodes, edges, timestamp FROM canvases WHERE user_id = $1
  `;
  const result = await pool.query(query, [userId]);
  return result.rows[0];
}
```

**Database Schema:**

```sql
CREATE TABLE IF NOT EXISTS canvases (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  nodes JSONB NOT NULL,
  edges JSONB NOT NULL,
  timestamp BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 3.2 Story 5.2: LocalStorage 백업 및 서버 동기화

**Frontend Implementation:**

```typescript
// frontend/src/utils/localStorage.ts
const STORAGE_KEYS = {
  CANVAS_DATA: 'bm_builder_canvas_data',
  SNAPSHOTS: 'bm_builder_canvas_snapshots',
  LAST_SAVE: 'bm_builder_last_save_timestamp'
};

export function saveToLocalStorage(key: string, data: any) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    if (error.name === 'QuotaExceededError') {
      console.error('LocalStorage quota exceeded');
      // Fallback to IndexedDB (Story 5.3)
    }
  }
}

export function loadFromLocalStorage(key: string) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Failed to load from LocalStorage:', error);
    return null;
  }
}

export function clearLocalStorage(key: string) {
  localStorage.removeItem(key);
}
```

**오프라인/온라ine 감지:**

```typescript
// frontend/src/hooks/useNetworkStatus.ts
import { useEffect, useState } from 'react';

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('온라인 복구: 동기화 중입니다...');
      syncWithServer();
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.warning('오프라인 모드로 작동 중입니다');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline };
}

async function syncWithServer() {
  const localData = loadFromLocalStorage(STORAGE_KEYS.CANVAS_DATA);

  if (localData) {
    try {
      await saveCanvas(localData);
      toast.success('동기화 완료');
    } catch (error) {
      console.error('Sync failed:', error);
    }
  }
}
```

**충돌 해결:**

```typescript
// frontend/src/components/canvas/ConflictResolutionModal.tsx
interface ConflictData {
  local: any;
  server: any;
}

export function ConflictResolutionModal({ conflict, onResolve }: {
  conflict: ConflictData;
  onResolve: (version: 'local' | 'server') => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[2000]">
      <div className="bg-white rounded-lg p-6 max-w-2xl">
        <h2 className="text-xl font-bold mb-4">변경 사항이 있습니다</h2>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <h3 className="font-bold mb-2">로컬 버전</h3>
            <p className="text-sm text-gray-600">
              마지막 수정: {new Date(conflict.local.timestamp).toLocaleString()}
            </p>
          </div>
          <div>
            <h3 className="font-bold mb-2">서버 버전</h3>
            <p className="text-sm text-gray-600">
              마지막 수정: {new Date(conflict.server.timestamp).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onResolve('server')}
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded"
          >
            서버 유지
          </button>
          <button
            onClick={() => onResolve('local')}
            className="flex-1 px-4 py-2 bg-green-500 text-white rounded"
          >
            로컬 유지
          </button>
        </div>
      </div>
    </div>
  );
}
```

### 3.3 Story 5.3: 버전 관리 (최근 10개)

**Frontend Implementation:**

```typescript
// frontend/src/hooks/useVersionHistory.ts
import { useState, useCallback } from 'react';
import { loadFromLocalStorage, saveToLocalStorage } from '../../utils/localStorage';

interface Snapshot {
  id: string;
  timestamp: number;
  data: any;
  description: string;
}

export function useVersionHistory() {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // 1분마다 스냅샷 생성
  useEffect(() => {
    const interval = setInterval(() => {
      createSnapshot();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const createSnapshot = useCallback(() => {
    const canvasData = loadFromLocalStorage(STORAGE_KEYS.CANVAS_DATA);

    if (!canvasData) return;

    const newSnapshot: Snapshot = {
      id: `snapshot-${Date.now()}`,
      timestamp: Date.now(),
      data: canvasData,
      description: generateDescription(canvasData)
    };

    // 최대 10개 유지 (FIFO)
    setSnapshots(prev => {
      const updated = [...prev, newSnapshot];
      return updated.slice(-10);
    });

    saveToLocalStorage(STORAGE_KEYS.SNAPSHOTS, snapshots);
  }, [snapshots]);

  const generateDescription = (data: any): string => {
    // Auto-generate description based on changes
    const nodeCount = data.nodes?.length || 0;
    const edgeCount = data.edges?.length || 0;
    return `노드 ${nodeCount}개, 연결 ${edgeCount}개`;
  };

  const restoreSnapshot = useCallback((snapshotId: string) => {
    const snapshot = snapshots.find(s => s.id === snapshotId);
    if (snapshot) {
      saveToLocalStorage(STORAGE_KEYS.CANVAS_DATA, snapshot.data);
      toast.success(`버전 복원됨: ${new Date(snapshot.timestamp).toLocaleString()}`);
    }
  }, [snapshots]);

  // Ctrl+Z 실행 취소
  useEffect(() => {
    const handleUndo = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (currentIndex > 0) {
          const prevSnapshot = snapshots[currentIndex - 1];
          restoreSnapshot(prevSnapshot.id);
          setCurrentIndex(currentIndex - 1);
          toast.success('실행 취소됨');
        }
      }
    };

    window.addEventListener('keydown', handleUndo);
    return () => window.removeEventListener('keydown', handleUndo);
  }, [snapshots, currentIndex]);

  return { snapshots, restoreSnapshot, currentIndex };
}
```

**IndexedDB 업그레이드 (LocalStorage 5MB 초과 시):**

```typescript
// frontend/src/utils/indexedDB.ts
import { openDB } from 'idb';

export async function initIndexedDB() {
  const db = await openDB('bm_builder_canvas_v2', 1, {
    upgrade(db) {
      db.createObjectStore('snapshots', { keyPath: 'id' });
      db.createObjectStore('canvasData', { keyPath: 'timestamp' });
    }
  });
  return db;
}

export async function saveToIndexedDB(storeName: string, data: any) {
  const db = await initIndexedDB();
  await db.put(storeName, data);
}

export async function loadFromIndexedDB(storeName: string, key: string) {
  const db = await initIndexedDB();
  return await db.get(storeName, key);
}
```

---

## 4. Acceptance Criteria

**AC 5.1.1:** 10초마다 자동 저장 트리거, LocalStorage + 서버
**AC 5.2.1:** 오프라인 시 LocalStorage만, 온라인 복구 5초 내 동기화
**AC 5.3.1:** 1분마다 스냅샷, 최대 10개, Ctrl+Z 실행 취소

---

## 5. Performance Targets

**NFR-012:** 10초마다 자동 저장, debounce 2s
**NFR-013:** 온라인 복구 5초 이내 자동 동기화
**NFR-014:** 최근 10개 버전, 1분마다 스냅샷

---

**Tech-spec-epic-5.md - Ready for Development** ✅
