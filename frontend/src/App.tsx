import { OnboardingCanvas } from './components/onboarding/OnboardingCanvas';
import './App.css';

function App() {
  // For demo purposes, default to beginner mode
  // In production, this would be loaded from localStorage based on user's onboarding choice
  const mode: 'beginner' | 'problem-discovery' | 'team' = 'beginner';

  return <OnboardingCanvas mode={mode} />;
}

export default App;
