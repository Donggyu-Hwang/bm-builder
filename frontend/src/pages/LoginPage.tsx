import { useAuth } from '../hooks/useAuth';
import OAuthButton from '../components/auth/OAuthButton';

export default function LoginPage() {
  const { loading } = useAuth();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-primary/10 to-background">
      <div className="w-full max-w-md space-y-8 rounded-lg border bg-background p-8 shadow-lg">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold">BM Builder</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            AI 공동 창업자와 함께 비즈니스 모델을 구축하세요
          </p>
        </div>

        {/* OAuth Buttons */}
        <div className="space-y-4">
          <OAuthButton provider="google" disabled={loading} />
          <OAuthButton provider="naver" disabled={loading} />
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>로그인하여 개인화된 가이드를 시작하세요</p>
        </div>
      </div>
    </div>
  );
}
