# Story 3.3: Progressive Disclosure 구현

Status: done

## Story

As a 캔버스 사용자,
I want 처음엔 3단계만 보여주고, 점차 7단계로 확장,
so that 정보 과부하를 방지하고 단계적으로 학습할 수 있다.

## Acceptance Criteria

**Given** 사용자가 처음 캔버스에 진입한다
**When** 화면이 로딩된다
**Then** Progress Disclosure가 초기화된다
**And** 처음엔 Stage 1-3 노드 타입만 표시된다
**And** Stage 1: 문제 발굴, Stage 2: 문제 정의, Stage 3: 고객 개발
**And** Stage 4-7 타입은 완전히 숨겨진다 (placeholder 없음)

**Given** 사용자가 Stage 1-3 중 모두 완료한다
**When** 3개 Stage가 완료된다
**Then** Stage 4(시장 개발)가 자동으로 해제된다
**And** "새로운 단계가 해제되었습니다: 시장 개발" 토스트가 2초간 표시된다
**And** confetti 애니메이션이 1초간 재생된다
**And** Stage 4 노드 타입이 노드 타입 선택 모달에 추가된다

**Given** n개 Stage가 완료된다
**When** 자동 해제 로직이 실행된다
**Then** n+1 Stage가 해제된다
**And** 최대 7개 Stage까지 확장된다
**And** 각 Stage 해제 시 토스트 및 confetti가 표시된다

**Given** 사용자가 "다음 단계 보기" 토글을 켠다
**When** 수동으로 다음 단계를 해제한다
**Then** 다음 미해제 Stage가 표시된다
**And** 토글 상태가 localStorage에 저장된다
**And** "다음 단계를 수동으로 해제했습니다" 토스트가 표시된다

**Given** "다음 단계 보기" 토글이 제공된다
**When** 헤더를 확인한다
**Then** 토글 스위치가 우측 상단에 표시된다
**And** 토글 라벨: "다음 단계 보기"
**And** 토글 설명: "다음 단계를 미리 볼 수 있습니다"
**And** 토글 기본값은 OFF이다

**Given** 경험자 모드로 진입한다
**When** 사용자가 이미 경험이 있다
**Then** 모든 7단계가 처음부터 표시된다
**And** localStorage에 `show_all_stages: true`가 저장된다
**And** "모든 단계 표시 모드가 활성화되었습니다" 토스트가 표시된다

**Given** Progress Disclosure가 활성화된다
**When** 노드 타입 선택 모달을 연다
**Then** 해제된 Stage 타입만 표시된다
**And** 미해제 Stage는 완전히 숨겨진다 (회색 placeholder 없음)
**And** "현재 X단계까지 해제되었습니다" 안내가 모달 하단에 표시된다

**Given** 캔버스 데이터 구조를 설계한다
**When** Progress Disclosure 상태를 저장한다
**Then** `progressiveDisclosure` 객체가 존재한다
**And** `{unlockedStages: [1, 2, 3], showAll: false}` 형식이다
**And** 각 Stage 완료 시 `unlockedStages` 배열에 추가된다
**And** `showAll`이 true이면 모든 Stage 표시

**Given** 모바일 기기에서 접속한다
**When** "다음 단계 보기" 토글을 확인한다
**Then** 토글이 하단 고정 메뉴로 이동한다
**And** 토글 라벨이 "다음 단계"로 단축된다
**And** 토글이 엄지손가락으로 쉽게 접근 가능한 위치이다

## Tasks / Subtasks

- [ ] **Implement Progressive Disclosure State**
  - [ ] Create `progressiveDisclosure` slice in Redux
  - [ ] Define state: { unlockedStages: number[], showAll: boolean }
  - [ ] Initialize with { unlockedStages: [1, 2, 3], showAll: false }
  - [ ] Persist to localStorage

- [ ] **Implement Stage Unlock Logic**
  - [ ] Detect when all nodes in current stages completed
  - [ ] Auto-unlock next stage (n → n+1)
  - [ ] Trigger toast notification (2 seconds)
  - [ ] Trigger confetti animation (1 second)
  - [ ] Update node type modal with new stage

- [ ] **Implement Manual Unlock Toggle**
  - [ ] Add "다음 단계 보기" toggle switch in header
  - [ ] Label: "다음 단계 보기"
  - [ ] Description: "다음 단계를 미리 볼 수 있습니다"
  - [ ] Default: OFF
  - [ ] Save toggle state to localStorage

- [ ] **Implement Experienced Mode**
  - [ ] Check for experienced user on mount
  - [ ] Set showAll: true for experienced users
  - [ ] Display all 7 stages immediately
  - [ ] Show activation toast

- [ ] **Implement Node Type Filtering**
  - [ ] Filter node types based on unlockedStages
  - [ ] Hide locked stages completely (no placeholder)
  - [ ] Display "현재 X단계까지 해제되었습니다" in modal

- [ ] **Implement Mobile Responsive Layout**
  - [ ] Move toggle to bottom fixed menu on mobile
  - [ ] Shorten label to "다음 단계"
  - [ ] Position for easy thumb access

## Dev Notes

### Architecture Compliance

**Tech Stack:**
- React 19 + TypeScript 5.3.3
- Redux Toolkit 2.10.1
- Tailwind CSS 3.4.1

**File Structure:**
```
frontend/src/
├── components/header/
│   └── ProgressiveDisclosureToggle.tsx
├── store/slices/
│   └── progressiveDisclosureSlice.ts
└── hooks/
    └── useProgressiveDisclosure.ts
```

**State Structure:**
```typescript
interface ProgressiveDisclosureState {
  unlockedStages: number[];
  showAll: boolean;
}

// Initial: { unlockedStages: [1, 2, 3], showAll: false }
// Experienced mode: { unlockedStages: [1,2,3,4,5,6,7], showAll: true }
```

**Unlock Logic:**
```typescript
const unlockNextStage = (completedStages: number[]) => {
  const maxCompleted = Math.max(...completedStages);
  const nextStage = maxCompleted + 1;
  
  if (nextStage <= 7 && !unlockedStages.includes(nextStage)) {
    // Unlock next stage
    showToast(`새로운 단계가 해제되었습니다: ${STAGE_NAMES[nextStage]}`);
    triggerConfetti();
  }
};
```

**LocalStorage:**
```typescript
// Key: 'bm_builder_progressive_disclosure'
{
  unlockedStages: [1, 2, 3];
  showAll: false;
}
```

**Toggle Component:**
- Desktop: Top-right header
- Mobile: Bottom fixed menu
- Touch target: Minimum 44px

**Testing:**
- Unit tests for unlock logic
- Integration tests for stage progression
- Visual tests for node type filtering

## References

- [Source: architecture.md#Frontend Architecture]
- [Source: prd-leanstartup-canvas-2026-01-26.md#FR-007 온보딩 튜토리얼]
- [Source: epics-new.md#Epic 3 Story 3.3]

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.5

### Completion Notes List


### File List

- `/Users/donggyu/bm-builder/frontend/src/components/header/ProgressiveDisclosureToggle.tsx`
- `/Users/donggyu/bm-builder/frontend/src/store/slices/progressiveDisclosureSlice.ts`
- `/Users/donggyu/bm-builder/frontend/src/hooks/useProgressiveDisclosure.ts`
