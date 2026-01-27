import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { ProgressBar } from './ProgressBar';
import { OnboardingStep1, OnboardingStep2, OnboardingStep3 } from './OnboardingSteps';
import {
  selectOnboarding,
  loadOnboarding,
  saveOnboardingStep,
  completeOnboarding,
  setCurrentStep,
} from '../../store/slices/onboardingSlice';

export const OnboardingFlow = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentStep, responses, loading } = useAppSelector(selectOnboarding);

  const [localInput, setLocalInput] = useState(responses);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadOnboardingData = async () => {
      await dispatch(loadOnboarding());
      setIsLoading(false);
    };
    loadOnboardingData();
  }, [dispatch]);

  useEffect(() => {
    setLocalInput(responses);
  }, [responses]);

  const handleInputChange = (input: Partial<typeof localInput>) => {
    setLocalInput((prev: typeof localInput) => ({ ...prev, ...input }));
  };

  const handleNext = async () => {
    if (currentStep === 1 && (!localInput.vision || localInput.vision.trim().length < 10)) {
      alert('비전을 최소 10자 이상 입력해주세요');
      return;
    }

    if (
      currentStep === 2 &&
      (!localInput.target_customer || localInput.target_customer.trim().length < 10)
    ) {
      alert('타겟 고객을 최소 10자 이상 입력해주세요');
      return;
    }

    if (currentStep === 3 && !localInput.current_stage) {
      alert('현재 단계를 선택해주세요');
      return;
    }

    // Try to save, but continue even if it fails (for demo mode)
    await dispatch(saveOnboardingStep({ step: currentStep, input: localInput }));

    if (currentStep < 3) {
      dispatch(setCurrentStep((currentStep + 1) as 1 | 2 | 3));
    } else {
      await dispatch(completeOnboarding());
      alert('온보딩을 완료했습니다! 🎉');
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <OnboardingStep1 vision={localInput.vision || ''} onChange={handleInputChange} />;
      case 2:
        return (
          <OnboardingStep2
            targetCustomer={localInput.target_customer || ''}
            onChange={handleInputChange}
          />
        );
      case 3:
        return (
          <OnboardingStep3 currentStage={localInput.current_stage} onChange={handleInputChange} />
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            온보딩 정보를 불러오는 중...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6 lg:p-8">
          <div className="mb-4 sm:mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                온보딩
              </span>
              <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                {currentStep}/3
              </span>
            </div>
            <ProgressBar currentStep={currentStep} />
          </div>

          <div className="mb-6 sm:mb-8">{renderStep()}</div>

          <div className="flex justify-end">
            <button
              onClick={handleNext}
              disabled={loading}
              className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? '저장 중...' : currentStep === 3 ? '완료하기' : '다음'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
