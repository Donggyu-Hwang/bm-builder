import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { usePriorities } from '../hooks/usePriorities';
import PriorityCards from '../components/dashboard/PriorityCards';
import DemoModeBanner from '../components/dashboard/DemoModeBanner';
import { setDemoMode } from '../utils/demoMode';

export default function DemoModePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, load } = usePriorities();

  useEffect(() => {
    setDemoMode(true);

    // Load mock data
    load();
  }, [load]);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Demo Mode Banner */}
      <DemoModeBanner />

      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary" />
            <span className="text-xl font-bold">BM Builder (Demo)</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {user.email}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">대시보드</h1>
          <p className="text-muted-foreground">
            데모 모드로 체험 중입니다.
          </p>
        </div>

        <PriorityCards />
      </main>
    </div>
  );
}
