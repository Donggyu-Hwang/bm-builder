# Technical Specification: Epic 3 - 7단계 린스타트업 여정

**Epic ID:** Epic-3
**Epic Name:** 7단계 린스타트업 여정 (Lean Startup Journey Visualization)
**Status:** Ready for Development
**Last Updated:** 2026-01-28
**Author:** Technical Specification (YOLO Mode)

---

## 1. Overview

### 1.1 Problem Statement

**User Pain Points:**
- 7단계 진행 상황을 한눈에 파악하기 어려움
- 어느 단계까지 완료했는지 시각적 피드백 부족
- 너무 많은 단계가 한꺼번에 표시되어 정보 과부하

### 1.2 Solution Approach

**Core Capabilities:**
1. **색상 코딩 노드 상태:** 회색(미시작), 노란색(진행 중), 초록색(완료)
2. **헤더 진행률 바:** "완료 X/7" + 그라데이션 바
3. **Progressive Disclosure:** 처음엔 3단계만, 점차 7단계로 확장

### 1.3 In/Out Scope

**In Scope:**
- 색상 코딩 및 노드 상태 시각화 (Story 3.1)
- 헤더 진행률 바 (Story 3.2)
- Progressive Disclosure (Story 3.3)

**Out Scope:**
- 복잡한 진행률 차트 (간단한 바만)
- 달성 목표/배지 시스템

---

## 2. Context for Development

### 2.1 Files to Create/Modify

**New Files:**
1. `/Users/donggyu/bm-builder/frontend/src/components/canvas/ProgressBar.tsx`
2. `/Users/donggyu/bm-builder/frontend/src/components/canvas/NodeStatusIndicator.tsx`
3. `/Users/donggyu/bm-builder/frontend/src/store/slices/progressSlice.ts`

**Modified Files:**
1. `/Users/donggyu/bm-builder/frontend/src/components/node-canvas/LeanStartupNode.tsx` - Add status styling
2. `/Users/donggyu/bm-builder/frontend/src/pages/LeanStartupCanvasPage.tsx` - Add progress header

### 2.2 Technical Decisions

**State Management:**
- Redux Toolkit for 전역 진행 상태
- `completedNodes: number[]` 배열로 완료된 노드 추적

**Color System:**
```typescript
const NODE_STATUS_COLORS = {
  not_started: { bg: '#e5e7eb', border: '#9ca3af', icon: '⭕' },
  in_progress: { bg: '#fef3c7', border: '#f59e0b', icon: '⏳' },
  completed: { bg: '#dcfce7', border: '#22c55e', icon: '✅' }
};
```

---

## 3. Implementation Plan

### 3.1 Story 3.1: 색상 코딩 및 노드 상태 시각화

**Frontend Implementation:**

```typescript
// frontend/src/components/node-canvas/NodeStatusIndicator.tsx
import { NodeProps } from 'reactflow';

export function NodeStatusIndicator({ data }: NodeProps) {
  const statusColors = {
    not_started: 'bg-gray-200 border-gray-400 border-2 border-dashed',
    in_progress: 'bg-yellow-100 border-yellow-500 border-2 border-solid',
    completed: 'bg-green-100 border-green-500 border-3 border-solid'
  };

  const statusIcons = {
    not_started: '⭕',
    in_progress: '⏳',
    completed: '✅'
  };

  return (
    <div className={`absolute top-2 left-2 text-2xl`}>
      {statusIcons[data.status]}
    </div>
  );
}

// LeanStartupNode.tsx 수정
export function LeanStartupNode({ data, selected }: NodeProps<LeanStartupNodeData>) {
  const nodeType = NODE_TYPES.find(nt => nt.id === data.type);

  // Status-based styling
  const statusStyles = {
    not_started: 'bg-gray-200 border-2 border-dashed border-gray-400',
    in_progress: 'bg-yellow-100 border-2 border-solid border-yellow-500',
    completed: 'bg-green-100 border-3 border-solid border-green-500'
  };

  return (
    <div className={`px-4 py-3 rounded-lg transition-all ${statusStyles[data.status]}`}>
      {/* Node content */}
      <NodeStatusIndicator data={data} />
    </div>
  );
}
```

**Status Change Logic:**

```typescript
// hooks/useNodeStatus.ts
export function useNodeStatus() {
  const updateNodeStatus = useCallback((nodeId: string, content: string) => {
    let status: 'not_started' | 'in_progress' | 'completed';

    if (content.length === 0) {
      status = 'not_started';
    } else if (content.length >= 100) {
      status = 'completed';
    } else {
      status = 'in_progress';
    }

    // Dispatch Redux action
    dispatch(updateNodeStatusAction(nodeId, status));

    // Trigger celebration if completed
    if (status === 'completed') {
      triggerConfetti();
    }
  }, [dispatch]);

  return { updateNodeStatus };
}
```

### 3.2 Story 3.2: 헤더 진행률 바

**Frontend Implementation:**

```typescript
// frontend/src/components/canvas/ProgressBar.tsx
import { useAppSelector } from '../../store/hooks';

export function ProgressBar() {
  const { completedNodes, totalNodes } = useAppSelector(state => state.canvas);
  const progress = (completedNodes.length / totalNodes) * 100;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-white rounded-lg shadow-lg px-6 py-3">
        <div className="flex items-center gap-4">
          {/* "완료 X/7" text */}
          <div className="font-bold text-lg">
            완료 {completedNodes.length}/7
          </div>

          {/* Progress bar */}
          <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Tooltip on hover */}
          <div className="relative group">
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 hidden group-hover:block bg-black text-white text-xs px-2 py-1 rounded">
              {7 - completedNodes.length}단계 남음
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

**Redux Slice:**

```typescript
// store/slices/progressSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ProgressState {
  completedNodes: string[];
  totalNodes: number;
}

const initialState: ProgressState = {
  completedNodes: [],
  totalNodes: 7
};

const progressSlice = createSlice({
  name: 'progress',
  initialState,
  reducers: {
    markNodeCompleted: (state, action: PayloadAction<string>) => {
      if (!state.completedNodes.includes(action.payload)) {
        state.completedNodes.push(action.payload);
      }
    },
    markNodeIncomplete: (state, action: PayloadAction<string>) => {
      state.completedNodes = state.completedNodes.filter(id => id !== action.payload);
    }
  }
});

export const { markNodeCompleted, markNodeIncomplete } = progressSlice.actions;
export default progressSlice.reducer;
```

### 3.3 Story 3.3: Progressive Disclosure

**Frontend Implementation:**

```typescript
// hooks/useProgressiveDisclosure.ts
export function useProgressiveDisclosure() {
  const completedStages = useAppSelector(state => state.progress.completedStages);
  const [unlockedStages, setUnlockedStages] = useState<number[]>([1, 2, 3]);

  useEffect(() => {
    // n개 Stage 완료 시 n+1 Stage 해제
    const maxStage = Math.max(...completedStages, 0);
    if (maxStage >= 3 && maxStage < 7) {
      const newStage = maxStage + 1;
      if (!unlockedStages.includes(newStage)) {
        setUnlockedStages(prev => [...prev, newStage]);

        // Celebration
        toast.success(`새로운 단계가 해제되었습니다: Stage ${newStage}`);
        triggerConfetti();
      }
    }
  }, [completedStages, unlockedStages]);

  return { unlockedStages };
}
```

---

## 4. Acceptance Criteria

**AC 3.1.1:** 노드가 생성되면 상태는 "not_started", 배경색 회색(#e5e7eb), 테두리 점선
**AC 3.2.1:** 헤더에 "완료 X/7" 표시, 진행률 바 그라데이션
**AC 3.3.1:** 처음엔 Stage 1-3만 표시, 3개 완료 시 Stage 4 자동 해제

---

## 5. Performance Targets

**WCAG 2.1 AA:** 색맹 모드에서 아이콘(⭕ ⏳ ✅)으로 명확히 구분
**Transition:** 300ms ease 부드러운 애니메이션

---

## 6. Testing Strategy

**Unit Tests:**
- `ProgressBar.test.tsx`: 진행률 계산, 렌더링
- `useProgressiveDisclosure.test.ts`: Stage 해제 로직

**Integration Tests:**
- 노드 완료 → 진행률 바 업데이트
- Progressive Disclosure: 3단계 → 7단계 확장

---

**Tech-spec-epic-3.md - Ready for Development** ✅
