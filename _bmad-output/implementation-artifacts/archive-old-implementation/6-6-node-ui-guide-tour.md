# Story 6.6: Node UI 가이드 투어

## Epic 6: Visual Workflow Management (Node UI)

---

## Story Information

**Story ID:** 6.6
**Story Title:** Node UI 가이드 투어
**Status:** ready-for-dev
**Priority:** Medium
**Phase:** Phase 3 (Post-MVP)

---

## User Story

**As a** 예비 창업가,
**I want** 1분 가이드 투어로 Node UI 사용법을 배우려고,
**So that** 빠르게 도구에 익숙해질 수 있다.

---

## Acceptance Criteria

### Given 사용자가 Node UI를 처음 사용할 때
### When 사용자가 캔버스에 접속하면
### Then 가이드 투어가 자동으로 시작된다

### And 가이드 투어가 4단계로 구성된다:
  - **Step 1/4:** "노드 생성" - 빈 캔버스를 하이라이트
  - **Step 2/4:** "노드 연결" - 두 개의 노드를 하이라이트
  - **Step 3/4:** "노드 편집" - 노드 더블 클릭 영역 하이라이트
  - **Step 4/4:** "시작하기" - "이제 모든 것을 준비했습니다!"

### And 각 단계에서:
  - 하이라이트된 영역에 dark overlay 적용
  - Tooltip이 상단에 표시된다
  - "다음" / "건너뛰기" 버튼 제공

### And 사용자가 가이드 투어를 완료하면:
  - 축하 메시지: "가이드 투어를 완료했습니다! 이제 Node UI를 자유롭게 사용해보세요."
  - `user_preferences.node_ui_tour_completed` = true

### And 사용자가 가이드 투어를 건너뛰면:
  - "나중에 Settings에서 다시 볼 수 있습니다." 메시지

### And 가이드 투어를 다시 보고 싶으면:
  - Settings > "Node UI 가이드 투어 다시 보기"

### And 가이드 투어 중간에 앱을 종료 후 다시 접속하면:
  - 마지막 단계부터 재개된다

---

## Technical Implementation Details

### Frontend Components

**1. Tour Provider (`TourProvider.tsx`)**

```typescript
import { createContext, useContext, useState, useEffect } from 'react';

interface TourStep {
  target: string;
  title: string;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

interface TourContextType {
  isTourActive: boolean;
  currentStep: number;
  steps: TourStep[];
  startTour: () => void;
  endTour: () => void;
  nextStep: () => void;
  skipTour: () => void;
}

const TourContext = createContext<TourContextType | null>(null);

export const TourProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isTourActive, setIsTourActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [tourCompleted, setTourCompleted] = useState(false);

  const steps: TourStep[] = [
    {
      target: '.react-flow',
      title: '노드 캔버스',
      content: '이것은 여러분의 워크플로우 캔버스입니다. 여기서 모든 노드를 시각화하고 관리할 수 있습니다.',
      position: 'bottom',
    },
    {
      target: '.react-flow__node',
      title: '노드',
      content: '각 노드는 문서의 섹션을 나타냅니다. 더블 클릭하여 내용을 편집하세요.',
      position: 'right',
    },
    {
      target: '.react-flow__edge',
      title: '연결선',
      content: '노드 간의 연결선은 섹션 간의 흐름을 보여줍니다.',
      position: 'left',
    },
    {
      target: '.zoom-controls',
      title: '컨트롤',
      content: '확대/축소 및 화면 이동 컨트롤을 사용하여 캔버스를 탐색하세요.',
      position: 'top',
    },
  ];

  useEffect(() => {
    // Check if user has completed tour
    const checkTourStatus = async () => {
      const response = await fetch('/api/v1/user/preferences');
      const data = await response.json();
      setTourCompleted(data.node_ui_tour_completed);

      if (!data.node_ui_tour_completed) {
        setIsTourActive(true);
      }
    };

    checkTourStatus();
  }, []);

  const startTour = () => setIsTourActive(true);

  const endTour = async () => {
    setIsTourActive(false);
    setCurrentStep(0);

    // Mark tour as completed
    await fetch('/api/v1/user/preferences', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ node_ui_tour_completed: true }),
    });

    setTourCompleted(true);
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      endTour();
    }
  };

  const skipTour = () => {
    setIsTourActive(false);
    setCurrentStep(0);
  };

  return (
    <TourContext.Provider
      value={{
        isTourActive,
        currentStep,
        steps,
        startTour,
        endTour,
        nextStep,
        skipTour,
      }}
    >
      {children}
    </TourContext.Provider>
  );
};

export const useTour = () => {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error('useTour must be used within TourProvider');
  }
  return context;
};
```

**2. Tour Tooltip (`TourTooltip.tsx`)**

```typescript
import { useTour } from './TourProvider';

export const TourTooltip: React.FC = () => {
  const { isTourActive, currentStep, steps, nextStep, skipTour, endTour } = useTour();

  if (!isTourActive) return null;

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  return (
    <>
      {/* Dark overlay */}
      <div className="tour-overlay" />

      {/* Spotlight on target */}
      <div className="tour-spotlight" style={{ target: step.target }} />

      {/* Tooltip */}
      <div className="tour-tooltip" data-position={step.position}>
        <div className="tooltip-header">
          <span className="step-indicator">{currentStep + 1}/{steps.length}</span>
          <h3>{step.title}</h3>
        </div>
        <div className="tooltip-content">
          <p>{step.content}</p>
        </div>
        <div className="tooltip-footer">
          <button onClick={skipTour} className="skip-button">
            건너뛰기
          </button>
          <button onClick={isLastStep ? endTour : nextStep} className="next-button">
            {isLastStep ? '완료' : '다음'}
          </button>
        </div>
      </div>

      {/* Confetti on completion */}
      {isLastStep && <Confetti />}
    </>
  );
};
```

**3. App Integration**

```typescript
// In App.tsx or main component
export const NodeCanvas: React.FC = () => {
  return (
    <TourProvider>
      <NodeCanvasContent />
      <TourTooltip />
    </TourProvider>
  );
};
```

### CSS Styles

```css
/* Tour Overlay */
.tour-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  z-index: 9998;
  pointer-events: none;
}

/* Tour Spotlight */
.tour-spotlight {
  position: absolute;
  border: 3px solid #4CAF50;
  border-radius: 8px;
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.7);
  z-index: 9999;
  pointer-events: none;
  transition: all 0.3s ease;
}

/* Tour Tooltip */
.tour-tooltip {
  position: fixed;
  z-index: 10000;
  background: white;
  border-radius: 8px;
  padding: 16px;
  max-width: 320px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: slideIn 0.3s ease;
}

.tour-tooltip[data-position="top"] {
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: 16px;
}

.tour-tooltip[data-position="bottom"] {
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-top: 16px;
}

.tour-tooltip[data-position="left"] {
  right: 100%;
  top: 50%;
  transform: translateY(-50%);
  margin-right: 16px;
}

.tour-tooltip[data-position="right"] {
  left: 100%;
  top: 50%;
  transform: translateY(-50%);
  margin-left: 16px;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.tooltip-header {
  margin-bottom: 12px;
}

.step-indicator {
  font-size: 12px;
  color: #666;
  font-weight: 500;
}

.tooltip-header h3 {
  margin: 4px 0 0 0;
  font-size: 18px;
  font-weight: 600;
}

.tooltip-content {
  margin-bottom: 16px;
}

.tooltip-content p {
  margin: 0;
  line-height: 1.5;
  color: #333;
}

.tooltip-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.skip-button {
  padding: 8px 16px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.next-button {
  padding: 8px 16px;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
}

.next-button:hover {
  background: #45a049;
}
```

### State Management (Redux)

```typescript
// preferencesSlice.ts
const preferencesSlice = createSlice({
  name: 'preferences',
  initialState: {
    nodeUiTourCompleted: false,
  },
  reducers: {
    setTourCompleted: (state, action) => {
      state.nodeUiTourCompleted = action.payload;
    },
  },
});

export const { setTourCompleted } = preferencesSlice.actions;
```

### API Endpoints

```typescript
// GET /api/v1/user/preferences
router.get('/user/preferences', authenticate, async (req, res) => {
  const preferences = await getUserPreferences(req.user.id);
  res.json({
    success: true,
    data: preferences,
  });
});

// PUT /api/v1/user/preferences
router.put('/user/preferences', authenticate, async (req, res) => {
  const { node_ui_tour_completed } = req.body;

  await updateUserPreferences(req.user.id, {
    node_ui_tour_completed,
  });

  res.json({
    success: true,
    message: 'Preferences updated successfully',
  });
});
```

### Database Schema

```sql
ALTER TABLE profiles ADD COLUMN node_ui_tour_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN tour_current_step INTEGER DEFAULT 0;
```

---

## Testing Requirements

### Unit Tests

```typescript
describe('TourProvider', () => {
  it('should start tour on first visit', async () => {
    const { result } = renderHook(() => useTour());

    await waitFor(() => {
      expect(result.current.isTourActive).toBe(true);
    });
  });

  it('should not start tour if completed', async () => {
    // Mock tour completed
    const { result } = renderHook(() => useTour());

    expect(result.current.isTourActive).toBe(false);
  });

  it('should advance to next step', () => {
    const { result } = renderHook(() => useTour());

    act(() => {
      result.current.nextStep();
    });

    expect(result.current.currentStep).toBe(1);
  });

  it('should complete tour on last step', () => {
    const { result } = renderHook(() => useTour());

    act(() => {
      result.current.setCurrentStep(result.current.steps.length - 1);
      result.current.nextStep();
    });

    expect(result.current.isTourActive).toBe(false);
  });
});
```

### Integration Tests

```typescript
describe('Tour E2E', () => {
  it('should complete full tour', async () => {
    render(<NodeCanvas />);

    // Wait for tour to start
    await waitFor(() => {
      expect(screen.getByText('1/4')).toBeInTheDocument();
    });

    // Click next through all steps
    for (let i = 0; i < 4; i++) {
      const nextButton = screen.getByText('다음');
      await fireEvent.click(nextButton);
    }

    // Verify completion
    expect(screen.getByText('가이드 투어를 완료했습니다!')).toBeInTheDocument();
  });

  it('should skip tour', async () => {
    render(<NodeCanvas />);

    const skipButton = await screen.findByText('건너뛰기');
    await fireEvent.click(skipButton);

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });
});
```

---

## Dependencies

```json
{
  "dependencies": {
    "canvas-confetti": "^1.6.0"
  }
}
```

### Prerequisite Stories

- [x] Story 6.1: Node-based Canvas 기본 구조
- [x] Story 6.2: Node Drag-and-Drop 및 편집
- [x] Story 6.3: Node Connection Lines 및 Flow Visualization
- [x] Story 6.4: Infinite Canvas 및 Navigation
- [x] Story 6.5: Node UI Export 및 공유

---

## Definition of Done

- [x] Story 파일 생성됨
- [ ] 4-step tour 구현 완료
- [ ] Dark overlay + spotlight 구현
- [ ] Auto-start on first visit 구현
- [ ] Skip functionality 구현
- [ ] Resume from last step 구현
- [ ] Completion persistence 구현
- [ ] Settings replay option 구현
- [ ] Confetti celebration on completion
- [ ] Unit tests 작성 완료
- [ ] Integration tests 작성 완료
- [ ] Code review 완료
- [ ] 배포 및 QA 통과

---

## Implementation Notes

### User Experience Best Practices

1. **Tour Flow:**
   - Keep it short: 4 steps maximum
   - Clear, concise language
   - Visual highlights (spotlight)
   - Progress indicators (1/4, 2/4, etc.)

2. **Accessibility:**
   - Keyboard navigation (Esc to skip, Enter to next)
   - Screen reader announcements
   - High contrast mode support
   - Focus management

3. **Persistence:**
   - Save tour status to database
   - Resume from last step if interrupted
   - Allow replay from settings

### Technical Considerations

1. **Positioning:**
   - Auto-position tooltip based on available space
   - Handle edge cases (near screen edges)
   - Responsive design for mobile

2. **Performance:**
   - Lazy load tour components
   - Don't block UI initialization
   - Smooth animations (60fps)

3. **Edge Cases:**
   - User navigates away during tour → Pause tour
   - Target element not found → Skip step or show alternative
   - Window resize → Reposition tooltip

### Celebration

```typescript
import confetti from 'canvas-confetti';

const celebrateCompletion = () => {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
  });
};
```

---

## References

- [React Tour Libraries](https://github.com/elrumordelaluz/reactour)
- [User Onboarding Best Practices](https://www.nngroup.com/articles/user-onboarding/)
- [Canvas Confetti](https://github.com/catdad/canvas-confetti)

---

**Last Updated:** 2026-01-18
**Status:** ready-for-dev
**Assignee:** TBD
**Sprint:** TBD
