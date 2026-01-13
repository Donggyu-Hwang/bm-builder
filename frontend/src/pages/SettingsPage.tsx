import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { Label } from '../ui/Label';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <button
            onClick={() => navigate(-1)}
            className="text-sm font-medium hover:underline"
          >
            ← 뒤로가기
          </button>
          <h1 className="text-xl font-bold">설정</h1>
          <div className="w-16" />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto max-w-2xl px-4 py-8">
        <div className="space-y-6">
          {/* User Info */}
          <Card>
            <div className="p-6">
              <h2 className="mb-4 text-lg font-semibold">계정 정보</h2>
              <div className="space-y-2">
                <div>
                  <Label>이메일</Label>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
                {user?.full_name && (
                  <div>
                    <Label>이름</Label>
                    <p className="text-sm text-muted-foreground">{user.full_name}</p>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Preferences */}
          <Card>
            <div className="p-6">
              <h2 className="mb-4 text-lg font-semibold">환경 설정</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>툴팁 표시</Label>
                    <p className="text-sm text-muted-foreground">
                      비즈니스 용어 툴팁을 표시합니다
                    </p>
                  </div>
                  <button
                    className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary transition-colors"
                  >
                    <span className="inline-block h-4 w-4 transform translate-x-6 rounded-full bg-white transition" />
                  </button>
                </div>
              </div>
            </div>
          </Card>

          {/* Actions */}
          <Card>
            <div className="p-6">
              <h2 className="mb-4 text-lg font-semibold">작업</h2>
              <div className="space-y-4">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate('/onboarding')}
                >
                  온보딩 다시하기
                </Button>
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={handleSignOut}
                >
                  로그아웃
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
