import { screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OnboardingCanvas } from './OnboardingCanvas';
import { renderWithRedux } from '../../test/setup';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn(),
};
vi.stubGlobal('localStorage', localStorageMock);

describe('OnboardingCanvas', () => {
  beforeEach(() => {
    // Reset localStorage mock before each test
    localStorageMock.getItem.mockReturnValue(null);
  });
  it('renders header with title', () => {
    renderWithRedux(<OnboardingCanvas mode="beginner" />);
    expect(screen.getByText('Lean Startup Canvas')).toBeInTheDocument();
  });

  it('renders AI Co-Founder subtitle', () => {
    renderWithRedux(<OnboardingCanvas mode="beginner" />);
    expect(screen.getByText('AI Co-Founder와 함께 시작하기')).toBeInTheDocument();
  });

  it('shows beginner mode message when mode is beginner', () => {
    renderWithRedux(<OnboardingCanvas mode="beginner" />);
    // AI guide message, empty state, and hint all contain similar text
    expect(screen.getAllByText(/더블클릭하여/)).toHaveLength(3);
    expect(screen.getByText(/또는 이 영역을 클릭하세요/)).toBeInTheDocument();
  });

  it('shows problem discovery mode message when mode is problem-discovery', () => {
    renderWithRedux(<OnboardingCanvas mode="problem-discovery" />);
    expect(screen.getByText(/왼쪽의 질문에 답변하여 아이디어를 구체화해보세요/)).toBeInTheDocument();
  });

  it('shows team mode message when mode is team', () => {
    renderWithRedux(<OnboardingCanvas mode="team" />);
    expect(screen.getByText(/팀원들과 함께 협업하며 아이디어를 발전시켜 보세요/)).toBeInTheDocument();
  });

  it('displays team invite button only in team mode', () => {
    renderWithRedux(<OnboardingCanvas mode="beginner" />);
    expect(screen.queryByText('팀원 초대')).not.toBeInTheDocument();

    cleanup(); // Clean up before rendering again

    renderWithRedux(<OnboardingCanvas mode="team" />);
    expect(screen.getByText('팀원 초대')).toBeInTheDocument();
  });

  it('shows progress bar with initial 0/3 count', () => {
    renderWithRedux(<OnboardingCanvas mode="beginner" />);
    expect(screen.getByText('0/3')).toBeInTheDocument();
  });

  it('increments node count when canvas is double-clicked and node type is selected', async () => {
    renderWithRedux(<OnboardingCanvas mode="beginner" />);
    const canvas = screen.getByText(/또는 이 영역을 클릭하세요/).closest('div')?.parentElement;

    // Story 2.2: Double-click with 300ms delay to open NodeTypeModal
    fireEvent.click(canvas!);
    fireEvent.click(canvas!);

    // Story 2.1: New NodeTypeModal title is visible
    await waitFor(() => {
      expect(screen.getByText(/노드 타입 선택/)).toBeInTheDocument();
    }, { timeout: 1000 });

    // Select first node type (문제 발굴)
    const nodeTypeButton = screen.getByText('문제 발굴').closest('button');
    fireEvent.click(nodeTypeButton!);

    // Story 2.1: Wait for modal to close after selection (has 150ms delay)
    await waitFor(() => {
      expect(screen.queryByText(/노드 타입 선택/)).not.toBeInTheDocument();
    }, { timeout: 1000 });
  });

  it('shows completion modal when 3+ nodes are created', async () => {
    renderWithRedux(<OnboardingCanvas mode="beginner" />);
    const canvas = screen.getByText(/또는 이 영역을 클릭하세요/).closest('div')?.parentElement;

    // Create 3 nodes by double-clicking and selecting node type
    for (let i = 0; i < 3; i++) {
      // Story 2.2: Double-click with 300ms delay to open NodeTypeModal
      fireEvent.click(canvas!);
      fireEvent.click(canvas!);

      // Story 2.1: Wait for modal to appear and be rendered
      await waitFor(() => {
        expect(screen.getByText(/노드 타입 선택/)).toBeInTheDocument();
      }, { timeout: 1000 });

      // Get all buttons with "문제 발굴" text and click the first one in the modal
      const nodeTypeButtons = screen.getAllByText('문제 발굴');
      const nodeTypeButton = nodeTypeButtons.find(btn => btn.closest('button'))?.closest('button');
      fireEvent.click(nodeTypeButton!);

      // Story 2.1: Wait for modal to close (has 150ms delay)
      await waitFor(() => {
        expect(screen.queryByText(/노드 타입 선택/)).not.toBeInTheDocument();
      }, { timeout: 1000 });
    }

    // Now check for completion modal
    await waitFor(() => {
      expect(screen.getByText(/온보딩 완료!/)).toBeInTheDocument();
      // Check for AutoTransitionModal elements
      expect(screen.getByText(/이제 메인 캔버스로 자동 전환됩니다/)).toBeInTheDocument();
      // Use getAllByText and find the specific button in the modal
      const cancelButtons = screen.getAllByText('취소');
      const cancelButton = cancelButtons.find(btn => {
        const buttonElement = btn.closest('button');
        return buttonElement?.classList.contains('bg-white');
      });
      expect(cancelButton).toBeInTheDocument();
    }, { timeout: 1000 });
  });

  it('renders OnboardingModeBadge', () => {
    renderWithRedux(<OnboardingCanvas mode="beginner" />);
    expect(screen.getByText('초보자 모드')).toBeInTheDocument();
  });

  it('renders AIGuideToggle', () => {
    renderWithRedux(<OnboardingCanvas mode="beginner" />);
    expect(screen.getByText('AI 가이드')).toBeInTheDocument();
  });
});
