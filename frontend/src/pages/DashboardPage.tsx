import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useOnboarding } from '../hooks/useOnboarding';
import { usePriorities } from '../hooks/usePriorities';
import PriorityCards from '../components/dashboard/PriorityCards';
import WelcomeModal from '../components/dashboard/WelcomeModal';
import AIgeneratingSkeleton from '../components/dashboard/AIgeneratingSkeleton';
import { useAppSelector } from '../store/hooks';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { completed, loadResponses, responses } = useOnboarding();
  const { items, loading, generating, generate, load } = usePriorities();

  const showWelcome = useAppSelector((state) => {
    // Check if user has seen welcome modal (you'd store this in user_preferences)
    return false; // For now, always show or use a flag
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }

    if (user && !user.onboarding_completed) {
      navigate('/onboarding');
      return;
    }

    // Load priorities
    if (user?.onboarding_completed) {
      load();

      // Generate priorities if empty
      if (items.length === 0 && !generating) {
        const onboardingData = responses.map(r => r.response).join('\n');
        generate(onboardingData);
      }
    }
  }, [user, authLoading, navigate, items.length, generating, generate, load, responses]);

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary" />
            <span className="text-xl font-bold">BM Builder</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {user.email}
            </span>
            <button
              onClick={() => navigate('/settings')}
              className="text-sm font-medium hover:underline"
            >
              설정
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">대시보드</h1>
          <p className="text-muted-foreground">
            {user.full_name || '사용자'}님, 오늘의 우선순위를 확인하세요.
          </p>
        </div>

        {generating ? (
          <AIgeneratingSkeleton />
        ) : (
          <PriorityCards />
        )}
      </main>

      {/* Welcome Modal */}
      {showWelcome && <WelcomeModal />}
    </div>
  );
}
