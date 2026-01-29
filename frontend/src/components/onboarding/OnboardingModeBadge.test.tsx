import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { OnboardingModeBadge } from './OnboardingModeBadge';

describe('OnboardingModeBadge', () => {
  it('renders beginner mode label correctly', () => {
    render(<OnboardingModeBadge mode="beginner" />);
    expect(screen.getByText('초보자 모드')).toBeInTheDocument();
  });

  it('renders problem-discovery mode label correctly', () => {
    render(<OnboardingModeBadge mode="problem-discovery" />);
    expect(screen.getByText('문제 발굴 모드')).toBeInTheDocument();
  });

  it('renders team mode label correctly', () => {
    render(<OnboardingModeBadge mode="team" />);
    expect(screen.getByText('팀 온보딩 모드')).toBeInTheDocument();
  });

  it('has proper positioning classes with mobile responsive design', () => {
    const { container } = render(<OnboardingModeBadge mode="beginner" />);
    const badge = container.querySelector('.fixed');
    expect(badge).toHaveClass('bottom-16', 'left-1/2', '-translate-x-1/2');
    expect(badge).toHaveClass('md:top-6', 'md:left-auto', 'md:translate-x-0', 'md:right-36');
  });
});
