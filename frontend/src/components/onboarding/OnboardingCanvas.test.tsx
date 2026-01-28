import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { OnboardingCanvas } from './OnboardingCanvas';
import type { OnboardingMode } from '../../types/canvas';

// Mock useMediaQuery hook
vi.mock('../../hooks/useMediaQuery', () => ({
  useMediaQuery: vi.fn(),
}));

import { useMediaQuery } from '../../hooks/useMediaQuery';

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

vi.stubGlobal('localStorage', mockLocalStorage);

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('OnboardingCanvas Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
    // Default to desktop view
    (useMediaQuery as vi.Mock).mockReturnValue(false);
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Rendering', () => {
    it('should render beginner mode', () => {
      renderWithRouter(<OnboardingCanvas mode="beginner" />);

      expect(screen.getByText('온보딩 모드:')).toBeInTheDocument();
      expect(screen.getByText('초보자 모드')).toBeInTheDocument();
    });

    it('should render problem-discovery mode', () => {
      renderWithRouter(<OnboardingCanvas mode="problem-discovery" />);

      expect(screen.getByText('문제 발굴 모드')).toBeInTheDocument();
      expect(screen.getByText('어떤 분야에서 문제를 발견하고 싶으신가요?')).toBeInTheDocument();
    });

    it('should render team mode', () => {
      renderWithRouter(<OnboardingCanvas mode="team" />);

      expect(screen.getByText('팀 온보딩 모드')).toBeInTheDocument();
      expect(screen.getByText('팀 온보딩 팁')).toBeInTheDocument();
    });

    it('should render AI guide toggle', () => {
      renderWithRouter(<OnboardingCanvas mode="beginner" />);

      expect(screen.getByLabelText('AI 가이드 켜기/끄기')).toBeInTheDocument();
      expect(screen.getByText('AI 가이드')).toBeInTheDocument();
    });
  });

  describe('AI Guide Toggle', () => {
    it('should toggle AI guide on click', () => {
      renderWithRouter(<OnboardingCanvas mode="beginner" />);

      const toggle = screen.getByLabelText('AI 가이드 켜기/끄기');
      fireEvent.click(toggle);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('bm_builder_ai_guide_toggle', 'false');
    });

    it('should load AI guide state from localStorage', async () => {
      mockLocalStorage.getItem.mockReturnValue('false');

      renderWithRouter(<OnboardingCanvas mode="beginner" />);

      await waitFor(() => {
        expect(screen.getByText('꺼짐')).toBeInTheDocument();
      });
    });
  });

  describe('Node Creation Tracking', () => {
    it('should track node count when node is created', () => {
      renderWithRouter(<OnboardingCanvas mode="beginner" />);

      const addButton = screen.getByText('노드 추가 (데모)');
      fireEvent.click(addButton);

      expect(screen.getByText(/노드 수: 1\/3/)).toBeInTheDocument();
    });

    it('should show completion modal after 3 nodes', async () => {
      renderWithRouter(<OnboardingCanvas mode="beginner" />);

      const addButton = screen.getByText('노드 추가 (데모)');

      // Add 3 nodes
      fireEvent.click(addButton);
      fireEvent.click(addButton);
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByText('온보딩 완료!')).toBeInTheDocument();
      });
    });
  });

  describe('Problem Discovery Mode', () => {
    it('should display 3 questions', () => {
      renderWithRouter(<OnboardingCanvas mode="problem-discovery" />);

      expect(screen.getByText('질문 1/3')).toBeInTheDocument();
      expect(screen.getByText('어떤 분야에서 문제를 발견하고 싶으신가요?')).toBeInTheDocument();
    });

    it('should navigate between questions', () => {
      renderWithRouter(<OnboardingCanvas mode="problem-discovery" />);

      const nextButton = screen.getByText('다음');
      fireEvent.click(nextButton);

      expect(screen.getByText('질문 2/3')).toBeInTheDocument();
    });
  });

  describe('Team Mode', () => {
    it('should show team tips', () => {
      renderWithRouter(<OnboardingCanvas mode="team" />);

      expect(screen.getByText('팀 온보딩 팁')).toBeInTheDocument();
      expect(screen.getByText(/팀원 초대/)).toBeInTheDocument();
    });

    it('should render invite team button', () => {
      renderWithRouter(<OnboardingCanvas mode="team" />);

      const inviteButton = screen.getByText('팀원 초대 (다음 에픽에서 구현 예정)');
      expect(inviteButton).toBeInTheDocument();
      expect(inviteButton.tagName).toBe('BUTTON');
      expect(inviteButton).toBeDisabled();
    });
  });

  describe('Completion Modal', () => {
    it('should have two action buttons', async () => {
      renderWithRouter(<OnboardingCanvas mode="beginner" />);

      const addButton = screen.getByText('노드 추가 (데모)');

      // Add 3 nodes
      fireEvent.click(addButton);
      fireEvent.click(addButton);
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByText('계속 온보딩 모드 사용')).toBeInTheDocument();
        expect(screen.getByText('메인 캔버스로 전환')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      renderWithRouter(<OnboardingCanvas mode="beginner" />);

      const badge = screen.getByRole('status');
      expect(badge).toBeInTheDocument();

      const toggle = screen.getByLabelText('AI 가이드 켜기/끄기');
      expect(toggle).toBeInTheDocument();
    });

    it('should be keyboard navigable', () => {
      renderWithRouter(<OnboardingCanvas mode="beginner" />);

      const toggle = screen.getByLabelText('AI 가이드 켜기/끄기');
      toggle.focus();
      expect(document.activeElement).toBe(toggle);

      fireEvent.keyDown(toggle, { key: 'Enter' });
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('Responsive Layout', () => {
    it('should render desktop header on desktop', () => {
      (useMediaQuery as vi.Mock).mockReturnValue(false);
      renderWithRouter(<OnboardingCanvas mode="beginner" />);

      // Desktop header should be visible
      expect(screen.getByText('AI 가이드')).toBeInTheDocument();
    });

    it('should render mobile bottom bar on mobile', () => {
      (useMediaQuery as vi.Mock).mockReturnValue(true);
      renderWithRouter(<OnboardingCanvas mode="beginner" />);

      // Mobile bottom bar should show mode badge and toggle
      expect(screen.getByText('AI 가이드')).toBeInTheDocument();
      expect(screen.getByText('초보자 모드')).toBeInTheDocument();
    });
  });
});
