import { useEffect, useState } from 'react';
import { OnboardingCanvas } from '../components/onboarding/OnboardingCanvas';
import { ONBOARDING_STORAGE_KEY } from '../types/onboarding';
import type { OnboardingMode } from '../types/canvas';

export const OnboardingPage = () => {
  const [mode, setMode] = useState<OnboardingMode>('beginner');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load user's selected option from localStorage
    try {
      const stored = localStorage.getItem(ONBOARDING_STORAGE_KEY);
      if (stored) {
        const state = JSON.parse(stored);
        if (state.selectedOption) {
          // Map user option to onboarding mode
          const optionToMode: Record<string, OnboardingMode> = {
            'idea-exists': 'beginner',
            'no-idea': 'problem-discovery',
            team: 'team',
          };
          setMode(optionToMode[state.selectedOption] || 'beginner');
        }
      }
    } catch (error) {
      console.error('Failed to load onboarding mode:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">온보딩 로딩 중...</p>
        </div>
      </div>
    );
  }

  return <OnboardingCanvas mode={mode} />;
};
