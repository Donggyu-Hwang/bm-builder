import { useState } from 'react';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Label from '../ui/Label';
import Button from '../ui/Button';
import { validateNotEmpty } from '../../utils/validators';
import { ONBOARDING_STEPS } from '../../utils/constants';

interface OnboardingStep2Props {
  initialResponse?: string;
  onNext: (response: string) => void;
  loading: boolean;
}

export default function OnboardingStep2({ initialResponse, onNext, loading }: OnboardingStep2Props) {
  const [response, setResponse] = useState(initialResponse || '');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateNotEmpty(response, '타겟 고객');
    if (validationError) {
      setError(validationError);
      return;
    }

    onNext(response);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Step 2: {ONBOARDING_STEPS[2].title}</CardTitle>
        <CardDescription>{ONBOARDING_STEPS[2].description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="target">타겟 고객</Label>
            <Input
              id="target"
              type="text"
              placeholder="예: 대학생, 자격증을 준비하는 직장인"
              value={response}
              onChange={(e) => {
                setResponse(e.target.value);
                setError(null);
              }}
              disabled={loading}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          <div className="rounded-md border border-muted bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground">
              <strong>팁:</strong> 구체적일수록 좋습니다. 연령, 성별, 직업, 관심사 등을 포함해 보세요.
            </p>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? '저장 중...' : '다음'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function CardHeader({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col space-y-1.5 p-6">{children}</div>;
}

function CardTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-2xl font-semibold leading-none tracking-tight">{children}</h3>;
}

function CardDescription({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-muted-foreground">{children}</p>;
}

function CardContent({ children }: { children: React.ReactNode }) {
  return <div className="p-6 pt-0">{children}</div>;
}
