import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ProblemDiscovery } from './ProblemDiscovery';

describe('ProblemDiscovery', () => {
  it('renders all three questions when visible', () => {
    render(<ProblemDiscovery isVisible={true} />);

    expect(screen.getByText('Q1.')).toBeInTheDocument();
    expect(screen.getByText('어떤 분야에서 문제를 발견하고 싶으신가요?')).toBeInTheDocument();
  });

  it('renders example answers for each question', () => {
    render(<ProblemDiscovery isVisible={true} />);

    expect(screen.getByText(/예: 핀테크, 헬스케어, 교육, 이커머스 등/)).toBeInTheDocument();
    expect(screen.getByText(/예: 서비스 이용 중 겪은 문제, 시간 낭비, 비용 부담 등/)).toBeInTheDocument();
    expect(screen.getByText(/예: 구체적인痛点\(pain point\)나 개선하고 싶은 프로세스/)).toBeInTheDocument();
  });

  it('does not render when isVisible is false', () => {
    const { container } = render(<ProblemDiscovery isVisible={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders textareas for user input', () => {
    render(<ProblemDiscovery isVisible={true} />);
    const textareas = screen.getAllByPlaceholderText('답변을 입력하세요...');
    expect(textareas).toHaveLength(3);
  });

  it('has completion button', () => {
    render(<ProblemDiscovery isVisible={true} />);
    expect(screen.getByRole('button', { name: '답변 완료' })).toBeInTheDocument();
  });
});
