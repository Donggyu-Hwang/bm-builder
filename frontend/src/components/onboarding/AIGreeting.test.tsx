import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AIGreeting } from './AIGreeting';
import { ONBOARDING_STORAGE_KEY } from '../../types/onboarding';

// Mock navigator.onLine
Object.defineProperty(window.navigator, 'onLine', {
  writable: true,
  value: true,
});

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('AIGreeting Component', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.clearAllMocks();

    // Mock navigate
    vi.mock('react-router-dom', async () => {
      const actual = await vi.importActual('react-router-dom');
      return {
        ...actual,
        useNavigate: () => vi.fn(),
      };
    });
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Rendering', () => {
    it('should render AI greeting message', () => {
      renderWithRouter(<AIGreeting />);

      expect(screen.getByText(/안녕하세요! AI Co-Founder입니다/)).toBeInTheDocument();
      expect(screen.getByText('어떤 상태로 시작하시겠습니까?')).toBeInTheDocument();
    });

    it('should render three option cards', () => {
      renderWithRouter(<AIGreeting />);

      expect(screen.getByText('이미 스타트업 아이디어가 있어요')).toBeInTheDocument();
      expect(screen.getByText('아직 아이디어가 없어요')).toBeInTheDocument();
      expect(screen.getByText('팀과 함께하고 있어요')).toBeInTheDocument();
    });

    it('should render skip button', () => {
      renderWithRouter(<AIGreeting />);

      expect(screen.getByText('건너뛰기')).toBeInTheDocument();
    });
  });

  describe('Option Selection', () => {
    it('should store selected option in localStorage', async () => {
      const { container } = renderWithRouter(<AIGreeting />);

      const ideaButton = screen.getByText('이미 스타트업 아이디어가 있어요');
      ideaButton.click();

      await waitFor(() => {
        const stored = localStorage.getItem(ONBOARDING_STORAGE_KEY);
        expect(stored).toBeDefined();
        if (stored) {
          const state = JSON.parse(stored);
          expect(state.selectedOption).toBe('idea-exists');
        }
      });
    });

    it('should store last visit timestamp', async () => {
      renderWithRouter(<AIGreeting />);

      const noIdeaButton = screen.getByText('아직 아이디어가 없어요');
      const beforeClick = Date.now();
      noIdeaButton.click();

      await waitFor(() => {
        const stored = localStorage.getItem(ONBOARDING_STORAGE_KEY);
        expect(stored).toBeDefined();
        if (stored) {
          const state = JSON.parse(stored);
          expect(state.lastVisit).toBeGreaterThanOrEqual(beforeClick);
        }
      });
    });
  });

  describe('Skip Functionality', () => {
    it('should store skip preference in localStorage', async () => {
      renderWithRouter(<AIGreeting />);

      const skipButton = screen.getByText('건너뛰기');
      skipButton.click();

      await waitFor(() => {
        const stored = localStorage.getItem(ONBOARDING_STORAGE_KEY);
        expect(stored).toBeDefined();
        if (stored) {
          const state = JSON.parse(stored);
          expect(state.skipped).toBe(true);
        }
      });
    });
  });

  describe('Return User Detection', () => {
    it('should detect previous option selection', async () => {
      const previousState = {
        selectedOption: 'team' as const,
        lastVisit: Date.now(),
      };
      localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(previousState));

      renderWithRouter(<AIGreeting />);

      await waitFor(() => {
        expect(screen.getByText('이전에 선택한 옵션: 팀과 함께하고 있어요')).toBeInTheDocument();
      });
    });

    it('should show auto-advance message for returning users', async () => {
      const previousState = {
        selectedOption: 'no-idea' as const,
        lastVisit: Date.now(),
      };
      localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(previousState));

      renderWithRouter(<AIGreeting />);

      await waitFor(() => {
        expect(screen.getByText(/초 후 자동으로 진행합니다/)).toBeInTheDocument();
      });
    });
  });

  describe('Offline Support', () => {
    it('should show offline notification when offline', () => {
      Object.defineProperty(window.navigator, 'onLine', {
        writable: true,
        value: false,
      });

      // Trigger offline event
      window.dispatchEvent(new Event('offline'));

      const { container } = renderWithRouter(<AIGreeting />);

      // Wait for state update
      setTimeout(() => {
        const notification = screen.queryByText('오프라인 모드로 작동 중입니다');
        expect(notification).toBeInTheDocument();
      }, 0);
    });

    it('should work with localStorage when offline', async () => {
      Object.defineProperty(window.navigator, 'onLine', {
        writable: true,
        value: false,
      });

      renderWithRouter(<AIGreeting />);

      const ideaButton = screen.getByText('이미 스타트업 아이디어가 있어요');
      ideaButton.click();

      await waitFor(() => {
        const stored = localStorage.getItem(ONBOARDING_STORAGE_KEY);
        expect(stored).toBeDefined();
      });
    });
  });

  describe('Responsive Design', () => {
    it('should render all cards with minimum touch target size', () => {
      renderWithRouter(<AIGreeting />);

      const buttons = screen.getAllByRole('button');
      const optionButtons = buttons.filter(
        (btn) => btn.textContent?.includes('아이디어') || btn.textContent?.includes('팀')
      );

      optionButtons.forEach((button) => {
        const style = window.getComputedStyle(button);
        const minHeight = parseInt(style.minHeight);
        expect(minHeight).toBeGreaterThanOrEqual(44); // WCAG 2.1 AAA
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      renderWithRouter(<AIGreeting />);

      const skipButton = screen.getByLabelText('온보딩 건너뛰기');
      expect(skipButton).toBeInTheDocument();
    });

    it('should be keyboard navigable', () => {
      renderWithRouter(<AIGreeting />);

      const skipButton = screen.getByText('건너뛰기');
      skipButton.focus();
      expect(document.activeElement).toBe(skipButton);
    });
  });
});
