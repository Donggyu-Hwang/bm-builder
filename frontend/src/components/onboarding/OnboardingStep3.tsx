import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../ui/Card';
import Label from '../ui/Label';
import Button from '../ui/Button';
import Select from '../ui/Select';
import { validateNotEmpty } from '../../utils/validators';
import { ONBOARDING_STEPS, BUSINESS_STAGES } from '../../utils/constants';

interface OnboardingStep3Props {
  initialResponse?: string;
  onNext: (response: string) => void;
  loading: boolean;
}

export default function OnboardingStep3({ initialResponse, onNext, loading }: OnboardingStep3Props) {
  const navigate = useNavigate();
  const [response, setResponse] = useState(initialResponse || '');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateNotEmpty(response, '현재 단계');
    if (validationError) {
      setError(validationError);
      return;
    }

    await onNext(response);
    // Navigate after completion - the parent will handle navigation
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Step 3: {ONBOARDING_STEPS[3].title}</CardTitle>
        <CardDescription>{ONBOARDING_STEPS[3].description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="stage">현재 비즈니스 단계</Label>
            <Select
              id="stage"
              value={response}
              onChange={(e) => {
                setResponse(e.target.value);
                setError(null);
              }}
              options={BUSINESS_STAGES}
              disabled={loading}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          <div className="rounded-md border border-muted bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground">
              <strong>팁:</strong> 솔직하게 답변해 주세요. 현재 단계에 맞는 가이드를 제공해 드립니다.
            </p>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? '저장 중...' : '온보딩 완료'}
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
