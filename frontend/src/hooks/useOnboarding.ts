import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  saveResponse,
  getResponses,
  completeOnboarding,
  setCurrentStep,
} from '../store/slices/onboardingSlice';
import type { OnboardingStep, OnboardingResponse } from '../types/onboarding';

export function useOnboarding() {
  const dispatch = useAppDispatch();
  const currentStep = useAppSelector((state) => state.onboarding.currentStep);
  const responses = useAppSelector((state) => state.onboarding.responses);
  const loading = useAppSelector((state) => state.onboarding.loading);
  const completed = useAppSelector((state) => state.onboarding.completed);
  const error = useAppSelector((state) => state.onboarding.error);

  const saveStepResponse = async (step: OnboardingStep, response: string) => {
    await dispatch(saveResponse({ step, response }) as any);
  };

  const loadResponses = async () => {
    await dispatch(getResponses() as any);
  };

  const finishOnboarding = async () => {
    await dispatch(completeOnboarding() as any);
  };

  const goToStep = (step: OnboardingStep) => {
    dispatch(setCurrentStep(step));
  };

  const getResponseByStep = (step: OnboardingStep): string | undefined => {
    return responses.find((r) => r.step_number === step)?.response;
  };

  return {
    currentStep,
    responses,
    loading,
    completed,
    error,
    saveResponse: saveStepResponse,
    loadResponses,
    completeOnboarding: finishOnboarding,
    goToStep,
    getResponseByStep,
  };
}
