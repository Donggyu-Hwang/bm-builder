import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useOnboarding } from '../hooks/useOnboarding';
import OnboardingFlow from '../components/onboarding/OnboardingFlow';

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentStep, loadResponses, completed } = useOnboarding();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user?.onboarding_completed) {
      navigate('/dashboard');
      return;
    }

    // Load existing responses
    loadResponses();
  }, [user, navigate, loadResponses]);

  if (!user) {
    return null;
  }

  if (completed) {
    navigate('/dashboard');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/10 to-background">
      <OnboardingFlow />
    </div>
  );
}
