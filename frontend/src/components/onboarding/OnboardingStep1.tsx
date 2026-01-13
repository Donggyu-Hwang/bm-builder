import { useState } from 'react';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Label from '../ui/Label';
import Button from '../ui/Button';
import { validateNotEmpty } from '../../utils/validators';
import { ONBOARDING_STEPS } from '../../utils/constants';

interface OnboardingStep1Props {
  initialResponse?: string;
  onNext: (response: string) => void;
  loading: boolean;
}

export default function OnboardingStep1({ initialResponse, onNext, loading }: OnboardingStep1Props) {
  const [response, setResponse] = useState(initialResponse || '');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateNotEmpty(response, '비전');
    if (validationError) {
      setError(validationError);
      return;
    }

    onNext(response);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Step 1: {ONBOARDING_STEPS[1].title}</CardTitle>
        <CardDescription>{ONBOARDING_STEPS[1].description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="vision">당신의 비전</Label>
            <Input
              id="vision"
              type="text"
              placeholder="예: 교육 평등을 위한 AI 튜터링 플랫폼"
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
              <strong>팁:</strong> 구체적이고 명확한 비전일수록 더 좋은 가이드를 받을 수 있습니다.
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
