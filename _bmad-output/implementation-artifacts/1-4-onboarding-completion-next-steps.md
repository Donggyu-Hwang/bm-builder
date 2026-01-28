# Story 1.4: 온보딩 완료 및 다음 단계 안내

Status: done

## Story

As a 첫 방문자 (첫 노드 생성 완료 후),
I want 온보딩 완료 celebration 및 다음 단계 안내,
so that 성취감을 느끼고 다음 단계로 자연스럽게 이어질 수 있다.

## Acceptance Criteria

**Given** 사용자가 첫 번째 노드를 생성하고 내용을 추가했다
**When** 노드 내용이 최소 100자 이상 채워진다
**Then** "첫 번째 노드 완성! 축하합니다! 🎉" celebration 모달이 표시된다
**And** confetti 애니메이션이 2초간 재생된다
**And** "온보딩 완료" 배지가 화면 상단에 표시된다

**Given** "초보자 모드"로 완성했다
**When** celebration 모달이 표시된다
**Then** 메시지: "훌륭하게 시작하셨어요! 이제 7단계 린스타트업 여정을 계속할 수 있어요"
**And** "다음 단계 보기" 버튼이 표시된다
**And** "온보딩 모드 계속하기" 버튼도 제공된다

**Given** "경험자 모드"로 완성했다
**When** celebration 모달이 표시된다
**Then** 메시지: "이미 익숙하시군요! 이제 메인 캔버스의 모든 기능을 사용할 수 있어요"
**And** "메인 캔버스로 전환" 버튼이 표시된다
**And** "계속 온보딩 모드 사용" 버튼도 제공된다

**Given** 사용자가 "다음 단계 보기"를 클릭한다
**When** 다음 단계 안내가 표시된다
**Then** 진행률 바가 "1/7 단계 완료"로 표시된다
**And** "다음 단계: 문제 정의" 카드가 표시된다
**And** 설명: "문제 정의 단계에서는 고객의 관점에서 문제를 명확히 정의합니다"
**And** "지금 시작하기" / "나중에" 2가지 버튼이 제공된다

**Given** 사용자가 "메인 캔버스로 전환"을 클릭한다
**When** 전환 완료 후
**Then** 온보딩 모드가 비활성화된다
**And** 모든 7단계 노드 타입이 표시된다
**And** Progress Disclosure가 해제된다
**And** "메인 캔버스로 전환되었습니다" 토스트가 1초간 표시된다

**Given** 사용자가 "나중에"를 클릭한다
**When** 모달이 닫힌다
**Then** 현재 상태가 유지된다
**And** 우측 상단에 "다음 단계 보기" 버튼이 표시된다 (바로가기)

**Given** 사용자가 3개 이상의 노드를 완성한다
**When** 캔버스를 계속 사용한다
**Then** "온보딩 완료! 이제 메인 캔버스로 자동 전환됩니다" 메시지가 표시된다
**And** 2초 후 자동으로 메인 캔버스로 전환된다
**And** 전환 전 "취소" 버튼이 제공된다

**Given** 모바일 기기에서 완성한다
**When** celebration 모달이 표시된다
**Then** 모달이 전체 화면으로 표시된다
**And** "다음 단계 보기" 버튼이 하단 고정 메뉴로 이동한다

## Tasks / Subtasks

- [ ] **Implement Completion Detection Logic**
  - [ ] Create `frontend/src/hooks/useNodeCompletion.ts`
  - [ ] Detect when node content reaches 100+ characters
  - [ ] Track first node completion event
  - [ ] Trigger celebration modal

- [ ] **Implement Celebration Modal**
  - [ ] Create `frontend/src/components/onboarding/CelebrationModal.tsx`
  - [ ] Display message: "첫 번째 노드 완성! 축하합니다! 🎉"
  - [ ] Show "온보딩 완료" badge
  - [ ] Add confetti animation (2 seconds)
  - [ ] Support both "beginner" and "experienced" mode messages

- [ ] **Implement Confetti Animation**
  - [ ] Install and configure `canvas-confetti` library
  - [ ] Trigger confetti on modal open
  - [ ] Duration: 2 seconds
  - [ ] Performance optimization (use requestAnimationFrame)

- [ ] **Implement Next Steps Guidance**
  - [ ] Create `frontend/src/components/onboarding/NextStepsCard.tsx`
  - [ ] Display progress bar: "1/7 단계 완료"
  - [ ] Show next step: "문제 정의"
  - [ ] Add description text
  - [ ] Provide "Start Now" / "Later" buttons

- [ ] **Implement Main Canvas Transition**
  - [ ] Create transition function in `frontend/src/store/slices/onboardingSlice.ts`
  - [ ] Disable onboarding mode
  - [ ] Unlock all 7 stage node types
  - [ ] Disable Progressive Disclosure
  - [ ] Show toast: "메인 캔버스로 전환되었습니다"

- [ ] **Implement "View Next Steps" Shortcut**
  - [ ] Add button in top-right corner
  - [ ] Show when user clicks "Later"
  - [ ] Open NextStepsCard on click

- [ ] **Implement Auto-Transition Logic**
  - [ ] Detect when 3+ nodes completed
  - [ ] Show message: "온보딩 완료! 자동 전환됩니다"
  - [ ] 2-second countdown
  - [ ] Add "Cancel" button
  - [ ] Execute main canvas transition

- [ ] **Implement Mobile Responsive Modal**
  - [ ] Full-screen modal on mobile devices
  - [ ] Move "View Next Steps" to bottom fixed menu
  - [ ] Adjust button sizes for touch (minimum 44px)

## Dev Notes

### Architecture Compliance

**Tech Stack Versions:**
- React 19.0 + Vite 7.3.1
- TypeScript 5.3.3 (Strict Mode)
- Redux Toolkit 2.10.1
- Tailwind CSS 3.4.1
- canvas-confetti (animation library)

**Code Patterns:**
- Custom hooks for completion detection
- Redux slices for onboarding state
- Modal component with Portal rendering
- Event-driven state transitions

**File Structure:**
```
frontend/src/
├── components/onboarding/
│   ├── CelebrationModal.tsx
│   └── NextStepsCard.tsx
├── hooks/
│   └── useNodeCompletion.ts
├── store/slices/
│   ├── onboardingSlice.ts
│   └── nodesSlice.ts
├── utils/
│   └── confetti.ts
└── types/
    └── onboarding.ts
```

### Technical Requirements

**Performance Requirements:**
- Modal display time: 300ms or less
- Confetti animation: 60fps, 2-second duration
- Auto-transition countdown: 2 seconds
- Main canvas transition: 500ms or less

**Completion Detection:**
```typescript
interface NodeCompletion {
  nodeId: string;
  contentLength: number;
  completed: boolean;
  completedAt?: timestamp;
}

// Trigger completion when content.length >= 100
```

**Onboarding State Transitions:**
```typescript
interface OnboardingState {
  mode: 'beginner' | 'experienced';
  completed: boolean;
  nodesCompleted: number;
  progressiveDisclosureEnabled: boolean;
  unlockedStages: number[];
}

// Transition to main canvas:
// - completed: true
// - progressiveDisclosureEnabled: false
// - unlockedStages: [1, 2, 3, 4, 5, 6, 7]
```

**Progressive Disclosure Unlock:**
```typescript
// Onboarding mode: [1, 2, 3]
// Main canvas mode: [1, 2, 3, 4, 5, 6, 7]
```

**Confetti Animation Configuration:**
```typescript
import confetti from 'canvas-confetti';

confetti({
  particleCount: 100,
  spread: 70,
  origin: { y: 0.6 },
  duration: 2000
});
```

**Auto-Transition Logic:**
```typescript
// When nodesCompleted >= 3
const triggerAutoTransition = () => {
  showMessage("온보딩 완료! 이제 메인 캔버스로 자동 전환됩니다");
  setTimeout(() => {
    transitionToMainCanvas();
  }, 2000);
};
```

**Accessibility Requirements (NFR-010):**
- WCAG 2.1 AA compliance
- Modal with proper ARIA roles (`role="dialog"`)
- Focus trap in modal
- Escape key to close modal
- Screen reader announcements

**Mobile Responsive Design:**
- Modal: Full-screen on devices < 768px
- "View Next Steps" button: Bottom fixed menu (position: fixed, bottom: 0)
- Touch target size: Minimum 44px height

**Testing Requirements:**
- Unit tests with Vitest:
  - Completion detection logic
  - Auto-transition trigger
  - Onboarding state transitions
- Integration tests:
  - End-to-end completion flow
  - Modal interaction
  - Canvas transition
- Visual regression tests for confetti animation

### References

- [Source: architecture.md#Frontend Architecture]
- [Source: architecture.md#State Management]
- [Source: prd-leanstartup-canvas-2026-01-26.md#FR-007 온보딩 튜토리얼]
- [Source: epics-new.md#Epic 1 Story 1.4]

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.5

### Debug Log References


### Completion Notes List


### File List

- `/Users/donggyu/bm-builder/frontend/src/components/onboarding/CelebrationModal.tsx`
- `/Users/donggyu/bm-builder/frontend/src/components/onboarding/NextStepsCard.tsx`
- `/Users/donggyu/bm-builder/frontend/src/hooks/useNodeCompletion.ts`
- `/Users/donggyu/bm-builder/frontend/src/utils/confetti.ts`
- `/Users/donggyu/bm-builder/frontend/src/types/onboarding.ts`
