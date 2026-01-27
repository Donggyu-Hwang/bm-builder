/**
 * Tour Provider Context
 * Manages guided tour state for Node UI onboarding
 */

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

export interface TourStep {
  target: string;
  title: string;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  action?: () => void;
}

interface TourContextType {
  isTourActive: boolean;
  currentStep: number;
  steps: TourStep[];
  startTour: () => void;
  endTour: () => void;
  nextStep: () => void;
  skipTour: () => void;
  goToStep: (step: number) => void;
}

const TourContext = createContext<TourContextType | null>(null);

interface TourProviderProps {
  children: ReactNode;
  documentId?: string;
}

export const TourProvider = ({ children, documentId }: TourProviderProps) => {
  const [isTourActive, setIsTourActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [tourCompleted, setTourCompleted] = useState(false);

  const steps: TourStep[] = [
    {
      target: '.react-flow',
      title: '노드 캔버스',
      content:
        '이것은 여러분의 워크플로우 캔버스입니다. 여기서 모든 노드를 시각화하고 관리할 수 있습니다.',
      position: 'bottom',
    },
    {
      target: '.react-flow__node',
      title: '노드',
      content:
        '각 노드는 문서의 섹션을 나타냅니다. 더블 클릭하여 내용을 편집하고, 드래그하여 위치를 변경하세요.',
      position: 'right',
    },
    {
      target: '.react-flow__edge-path',
      title: '연결선',
      content:
        '노드 간의 연결선은 섹션 간의 데이터 흐름을 보여줍니다. 클릭하여 연결을 편집할 수 있습니다.',
      position: 'left',
    },
    {
      target: '.zoom-controls',
      title: '확대/축소 컨트롤',
      content:
        '확대/축소 및 화면 맞추기 버튼을 사용하여 캔버스를 탐색하세요. 키보드 단축키: +/- 확대/축소, 0 초기화',
      position: 'top',
    },
  ];

  // Load tour status from localStorage on mount
  useEffect(() => {
    const storageKey = documentId ? `node-tour-completed-${documentId}` : 'node-tour-completed';
    try {
      const completed = localStorage.getItem(storageKey);
      const savedStep = localStorage.getItem(`node-tour-step-${documentId || 'default'}`);

      if (completed === 'true') {
        setTourCompleted(true);
      } else if (savedStep) {
        // Resume from last step
        const step = parseInt(savedStep, 10);
        if (step < steps.length) {
          setCurrentStep(step);
          setIsTourActive(true);
        }
      } else {
        // First time - start tour after a short delay
        const timer = setTimeout(() => {
          setIsTourActive(true);
        }, 1000);
        return () => clearTimeout(timer);
      }
    } catch (error) {
      console.error('Failed to load tour status:', error);
    }
  }, [documentId]);

  const startTour = useCallback(() => {
    setCurrentStep(0);
    setIsTourActive(true);
  }, []);

  const endTour = useCallback(async () => {
    setIsTourActive(false);
    setCurrentStep(0);

    // Mark tour as completed
    const storageKey = documentId ? `node-tour-completed-${documentId}` : 'node-tour-completed';
    const stepKey = `node-tour-step-${documentId || 'default'}`;

    try {
      localStorage.setItem(storageKey, 'true');
      localStorage.removeItem(stepKey);
      setTourCompleted(true);
    } catch (error) {
      console.error('Failed to save tour status:', error);
    }
  }, [documentId]);

  const nextStep = useCallback(() => {
    if (currentStep < steps.length - 1) {
      const next = currentStep + 1;
      setCurrentStep(next);

      // Save current step
      const stepKey = `node-tour-step-${documentId || 'default'}`;
      try {
        localStorage.setItem(stepKey, next.toString());
      } catch (error) {
        console.error('Failed to save tour step:', error);
      }
    } else {
      endTour();
    }
  }, [currentStep, steps.length, endTour, documentId]);

  const skipTour = useCallback(() => {
    setIsTourActive(false);
    setCurrentStep(0);

    // Clear saved step
    const stepKey = `node-tour-step-${documentId || 'default'}`;
    try {
      localStorage.removeItem(stepKey);
    } catch (error) {
      console.error('Failed to clear tour step:', error);
    }
  }, [documentId]);

  const goToStep = useCallback(
    (step: number) => {
      if (step >= 0 && step < steps.length) {
        setCurrentStep(step);
      }
    },
    [steps.length]
  );

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
        goToStep,
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
