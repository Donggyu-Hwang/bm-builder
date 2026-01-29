/**
 * NodeTypeCard Component Tests
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import NodeTypeCard from './NodeTypeCard';
import { NODE_TYPES } from '../../config/nodeTypes';

describe('NodeTypeCard', () => {
  const mockNodeType = NODE_TYPES[0];
  const mockOnSelect = vi.fn();

  beforeEach(() => {
    mockOnSelect.mockClear();
  });

  it('should render node type label', () => {
    render(<NodeTypeCard nodeType={mockNodeType} onSelect={mockOnSelect} />);

    expect(screen.getByText(mockNodeType.label)).toBeInTheDocument();
  });

  it('should render node type description', () => {
    render(<NodeTypeCard nodeType={mockNodeType} onSelect={mockOnSelect} />);

    expect(screen.getByText(mockNodeType.description)).toBeInTheDocument();
  });

  it('should render stage number', () => {
    render(<NodeTypeCard nodeType={mockNodeType} onSelect={mockOnSelect} />);

    expect(screen.getByText(`STAGE ${mockNodeType.stage}`)).toBeInTheDocument();
  });

  it('should render icon', () => {
    const { container } = render(<NodeTypeCard nodeType={mockNodeType} onSelect={mockOnSelect} />);

    const icon = container.querySelector('.text-4xl');
    expect(icon).toHaveTextContent(mockNodeType.icon);
  });

  it('should call onSelect when clicked', () => {
    render(<NodeTypeCard nodeType={mockNodeType} onSelect={mockOnSelect} />);

    const card = screen.getByRole('button');
    fireEvent.click(card);

    expect(mockOnSelect).toHaveBeenCalledTimes(1);
  });

  it('should have correct background color', () => {
    const { container } = render(<NodeTypeCard nodeType={mockNodeType} onSelect={mockOnSelect} />);

    const button = container.querySelector('button');
    expect(button).toHaveStyle({ backgroundColor: mockNodeType.color });
  });

  it('should show focus ring when selected', () => {
    const { container } = render(
      <NodeTypeCard nodeType={mockNodeType} onSelect={mockOnSelect} isSelected />
    );

    const button = container.querySelector('button');
    expect(button).toHaveClass('ring-4');
  });

  it('should call onSelect on Enter key press', () => {
    render(<NodeTypeCard nodeType={mockNodeType} onSelect={mockOnSelect} />);

    const card = screen.getByRole('button');
    fireEvent.keyDown(card, { key: 'Enter' });

    expect(mockOnSelect).toHaveBeenCalledTimes(1);
  });

  it('should call onSelect on Space key press', () => {
    render(<NodeTypeCard nodeType={mockNodeType} onSelect={mockOnSelect} />);

    const card = screen.getByRole('button');
    fireEvent.keyDown(card, { key: ' ' });

    expect(mockOnSelect).toHaveBeenCalledTimes(1);
  });

  it('should have accessible name', () => {
    render(<NodeTypeCard nodeType={mockNodeType} onSelect={mockOnSelect} />);

    const card = screen.getByRole('button');
    expect(card).toHaveAttribute('aria-label');
  });

  it('should indicate pressed state when selected', () => {
    const { container } = render(
      <NodeTypeCard nodeType={mockNodeType} onSelect={mockOnSelect} isSelected />
    );

    const button = container.querySelector('button');
    expect(button).toHaveAttribute('aria-pressed', 'true');
  });
});
