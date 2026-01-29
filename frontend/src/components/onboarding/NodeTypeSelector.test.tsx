import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { NodeTypeSelector } from './NodeTypeSelector';

describe('NodeTypeSelector', () => {
  it('renders node type options when visible', () => {
    render(<NodeTypeSelector isVisible={true} onSelect={vi.fn()} onClose={vi.fn()} />);

    expect(screen.getByText('노드 타입 선택')).toBeInTheDocument();
    expect(screen.getByText('문제 발굴')).toBeInTheDocument();
    expect(screen.getByText('문제 정의')).toBeInTheDocument();
    expect(screen.getByText('고객 개발')).toBeInTheDocument();
  });

  it('shows only Stage 1-3 node types (Progressive Disclosure)', () => {
    render(<NodeTypeSelector isVisible={true} onSelect={vi.fn()} onClose={vi.fn()} />);

    expect(screen.getByText('Stage 1')).toBeInTheDocument();
    expect(screen.getByText('Stage 2')).toBeInTheDocument();
    expect(screen.getByText('Stage 3')).toBeInTheDocument();
    expect(screen.queryByText('Stage 4')).not.toBeInTheDocument();
  });

  it('calls onSelect when a node type is clicked', () => {
    const onSelect = vi.fn();
    const onClose = vi.fn();

    render(<NodeTypeSelector isVisible={true} onSelect={onSelect} onClose={onClose} />);

    fireEvent.click(screen.getByText('문제 발굴').closest('button')!);
    expect(onSelect).toHaveBeenCalledWith(1, '문제 발굴');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when cancel button is clicked', () => {
    const onSelect = vi.fn();
    const onClose = vi.fn();

    render(<NodeTypeSelector isVisible={true} onSelect={onSelect} onClose={onClose} />);

    fireEvent.click(screen.getByText('취소'));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('does not render when isVisible is false', () => {
    const { container } = render(<NodeTypeSelector isVisible={false} onSelect={vi.fn()} onClose={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });

  it('displays description text for each node type', () => {
    render(<NodeTypeSelector isVisible={true} onSelect={vi.fn()} onClose={vi.fn()} />);

    expect(screen.getByText(/Progressive Disclosure:/)).toBeInTheDocument();
    expect(screen.getByText(/온보딩 모드에서는 처음 3단계/)).toBeInTheDocument();
  });
});
