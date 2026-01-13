import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { setDemoMode } from '../utils/demoMode';
import Button from '../components/ui/Button';

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleStartDemo = () => {
    setDemoMode(true);
    navigate('/demo');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/10 to-background">
      {/* Header */}
      <header className="border-b bg-background/50 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary" />
            <span className="text-xl font-bold">BM Builder</span>
          </div>
          <div className="flex gap-4">
            {isAuthenticated ? (
              <Button onClick={() => navigate('/dashboard')}>대시보드</Button>
            ) : (
              <>
                <Button variant="ghost" onClick={() => navigate('/login')}>
                  로그인
                </Button>
                <Button onClick={handleStartDemo}>데모 체험하기</Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-20 text-center">
        <h1 className="mb-6 text-5xl font-bold tracking-tight">
          AI 공동 창업자와 함께
          <br />
          비즈니스 모델을 구축하세요
        </h1>
        <p className="mb-8 text-xl text-muted-foreground">
          Lean Startup 방법론을 기반으로 AI가 개인화된 가이드를 제공합니다.
          <br />
          아이디어부터 성장까지, 함께 여정을 떠나보세요.
        </p>
        <div className="flex justify-center gap-4">
          <Button size="lg" onClick={handleStartDemo}>
            무료로 시작하기
          </Button>
          <Button size="lg" variant="outline" onClick={() => navigate('/login')}>
            로그인
          </Button>
        </div>

        {/* Features */}
        <div className="mt-20 grid gap-8 md:grid-cols-3">
          <div className="rounded-lg border p-6">
            <div className="mb-4 text-4xl">🎯</div>
            <h3 className="mb-2 text-lg font-semibold">개인화된 가이드</h3>
            <p className="text-sm text-muted-foreground">
              귀하의 비전과 상황에 맞춘 맞춤형 우선순위를 AI가 제안합니다.
            </p>
          </div>
          <div className="rounded-lg border p-6">
            <div className="mb-4 text-4xl">📊</div>
            <h3 className="mb-2 text-lg font-semibold">Lean Startup 기반</h3>
            <p className="text-sm text-muted-foreground">
              검증된 방법론을 따라 빠르게 비즈니스 모델을 검증하고迭代하세요.
            </p>
          </div>
          <div className="rounded-lg border p-6">
            <div className="mb-4 text-4xl">🤝</div>
            <h3 className="mb-2 text-lg font-semibold">24/7 AI 파트너</h3>
            <p className="text-sm text-muted-foreground">
              언제든지 질문하고, AI가 즉시 인사이트를 제공합니다.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
