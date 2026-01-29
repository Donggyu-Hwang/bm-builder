import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AIQuestionMode } from './AIQuestionMode';

describe('AIQuestionMode', () => {
  it('renders countdown timer when visible', () => {
    render(<AIQuestionMode isVisible={true} onStart={vi.fn()} onSkip={vi.fn()} onCreateNode={vi.fn()} />);

    expect(screen.getByText(/초 후 자동으로 시작됩니다/)).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('shows Start Now and Skip buttons during countdown', () => {
    const onStart = vi.fn();
    const onSkip = vi.fn();

    render(<AIQuestionMode isVisible={true} onStart={onStart} onSkip={onSkip} onCreateNode={vi.fn()} />);

    expect(screen.getByText('지금 시작하기')).toBeInTheDocument();
    expect(screen.getByText('건너뛰기')).toBeInTheDocument();
  });

  it('calls onStart when Start Now is clicked', () => {
    const onStart = vi.fn();
    const onSkip = vi.fn();

    render(<AIQuestionMode isVisible={true} onStart={onStart} onSkip={onSkip} onCreateNode={vi.fn()} />);

    fireEvent.click(screen.getByText('지금 시작하기'));
    expect(onStart).toHaveBeenCalledTimes(1);
  });

  it('calls onSkip when Skip is clicked', () => {
    const onStart = vi.fn();
    const onSkip = vi.fn();

    render(<AIQuestionMode isVisible={true} onStart={onStart} onSkip={onSkip} onCreateNode={vi.fn()} />);

    fireEvent.click(screen.getByText('건너뛰기'));
    expect(onSkip).toHaveBeenCalledTimes(1);
  });

  it('calls onCreateNode when Start Now is clicked and text is entered', () => {
    const onCreateNode = vi.fn();
    const onStart = vi.fn();

    render(<AIQuestionMode isVisible={true} onStart={onStart} onSkip={vi.fn()} onCreateNode={onCreateNode} />);

    // Click "Start Now" to skip countdown
    fireEvent.click(screen.getByText('지금 시작하기'));

    // Now the question input should be visible
    const textarea = screen.getByPlaceholderText(/예: 핀테크 스타트업/);
    fireEvent.change(textarea, { target: { value: '테스트 스타트업 아이디어' } });

    const createButton = screen.getByText('노드 생성');
    fireEvent.click(createButton);

    expect(onCreateNode).toHaveBeenCalledWith('테스트 스타트업 아이디어');
  });

  it('does not render when isVisible is false', () => {
    const { container } = render(<AIQuestionMode isVisible={false} onStart={vi.fn()} onSkip={vi.fn()} onCreateNode={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });
});
