import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { NodeCreationHint } from './NodeCreationHint';

describe('NodeCreationHint', () => {
  it('renders hint message when visible', () => {
    render(<NodeCreationHint isVisible={true} onDoubleClick={vi.fn()} />);

    expect(screen.getByText(/더블클릭하여 노드를 생성하세요/)).toBeInTheDocument();
  });

  it('shows additional guidance text', () => {
    render(<NodeCreationHint isVisible={true} onDoubleClick={vi.fn()} />);

    expect(screen.getByText(/또는 우측의 AI 가이드를 사용하세요/)).toBeInTheDocument();
  });

  it('does not render when isVisible is false', () => {
    const { container } = render(<NodeCreationHint isVisible={false} onDoubleClick={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });

  it('has fixed positioning at bottom center', () => {
    const { container } = render(<NodeCreationHint isVisible={true} onDoubleClick={vi.fn()} />);
    const hint = container.querySelector('.fixed');
    expect(hint).toHaveClass('bottom-8');
  });
});
