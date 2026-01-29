import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NodeDetailSidebar } from './NodeDetailSidebar';

describe('NodeDetailSidebar', () => {
  const mockNode = {
    id: 'node-1',
    type: '문제 발굴',
    stage: 1,
    content: 'Test content',
    x: 100,
    y: 100,
    width: 200,
    height: 150,
    status: 'not_started',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  it('renders null when node is null', () => {
    const { container } = render(<NodeDetailSidebar node={null} onClose={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders node details when node is provided', () => {
    render(<NodeDetailSidebar node={mockNode} onClose={vi.fn()} />);

    expect(screen.getByText('노드 상세')).toBeInTheDocument();
    expect(screen.getByText('Stage 1')).toBeInTheDocument();
    expect(screen.getByText(mockNode.type)).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(<NodeDetailSidebar node={mockNode} onClose={onClose} />);

    const closeButton = screen.getByLabelText('Close sidebar');
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('displays node status correctly', () => {
    render(<NodeDetailSidebar node={mockNode} onClose={vi.fn()} />);

    expect(screen.getByText('시작 전')).toBeInTheDocument();
  });

  it('displays node position', () => {
    render(<NodeDetailSidebar node={mockNode} onClose={vi.fn()} />);

    expect(screen.getByText(/\(100, 100\)/)).toBeInTheDocument();
  });

  it('renders textarea with node content and allows editing', () => {
    render(<NodeDetailSidebar node={mockNode} onClose={vi.fn()} />);

    const textarea = screen.getByPlaceholderText('노드 내용을 입력하세요...');
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveValue(mockNode.content);

    // Test editing
    fireEvent.change(textarea, { target: { value: 'Updated content' } });
    expect(textarea).toHaveValue('Updated content');
  });

  it('calls onSave with updated content when save button is clicked', () => {
    const onSave = vi.fn();
    render(<NodeDetailSidebar node={mockNode} onClose={vi.fn()} onSave={onSave} />);

    const textarea = screen.getByPlaceholderText('노드 내용을 입력하세요...');
    fireEvent.change(textarea, { target: { value: 'New content' } });

    const saveButton = screen.getByText('저장하기');
    fireEvent.click(saveButton);

    expect(onSave).toHaveBeenCalledWith('node-1', 'New content');
  });

  it('auto-focuses textarea when sidebar opens', async () => {
    render(<NodeDetailSidebar node={mockNode} onClose={vi.fn()} />);

    const textarea = screen.getByPlaceholderText('노드 내용을 입력하세요...');

    await waitFor(() => {
      expect(textarea).toHaveFocus();
    });
  });
});
