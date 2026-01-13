import { useState } from 'react';
import { useOnboarding } from '../../hooks/useOnboarding';
import OnboardingStep1 from './OnboardingStep1';
import OnboardingStep2 from './OnboardingStep2';
import OnboardingStep3 from './OnboardingStep3';
import Progress from '../ui/Progress';

export default function OnboardingFlow() {
  const { currentStep, saveResponse, getResponseByStep } = useOnboarding();
  const [isSaving, setIsSaving] = useState(false);

  const handleNext = async (response: string) => {
    setIsSaving(true);
    await saveResponse(currentStep, response);
    setIsSaving(false);
  };

  const getProgress = () => {
    switch (currentStep) {
      case 1:
        return 33;
      case 2:
        return 66;
      case 3:
        return 100;
      default:
        return 0;
    }
  };

  return (
    <div className="container mx-auto min-h-screen px-4 py-8">
      <div className="mx-auto max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium">진행률</span>
            <span className="text-sm text-muted-foreground">{getProgress()}%</span>
          </div>
          <Progress value={getProgress()} max={100} />
        </div>

        {/* Steps */}
        {currentStep === 1 && (
          <OnboardingStep1
            initialResponse={getResponseByStep(1)}
            onNext={handleNext}
            loading={isSaving}
          />
        )}
        {currentStep === 2 && (
          <OnboardingStep2
            initialResponse={getResponseByStep(2)}
            onNext={handleNext}
            loading={isSaving}
          />
        )}
        {currentStep === 3 && (
          <OnboardingStep3
            initialResponse={getResponseByStep(3)}
            onNext={handleNext}
            loading={isSaving}
          />
        )}
      </div>
    </div>
  );
}
