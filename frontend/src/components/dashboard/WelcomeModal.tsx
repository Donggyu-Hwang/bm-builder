import { useState, useEffect } from 'react';
import Dialog from '../ui/Dialog';
import Button from '../ui/Button';
import { useOnboarding } from '../../hooks/useOnboarding';

export default function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(true);
  const { responses } = useOnboarding();

  const vision = responses.find(r => r.step_number === 1)?.response || '귀하의 비전';
  const target = responses.find(r => r.step_number === 2)?.response || '타겟 고객';

  const handleClose = () => {
    setIsOpen(false);
    // Mark welcome as seen in user_preferences
  };

  return (
    <Dialog open={isOpen} onClose={handleClose}>
      <div className="space-y-4">
        <div className="text-center">
          <div className="mb-4 text-6xl">🎉</div>
          <h2 className="text-2xl font-bold">
            온보딩을 완료하셨습니다!
          </h2>
          <p className="mt-2 text-muted-foreground">
            &quot;{vision}&quot;을(를) 위한 여정을 시작하네요!
          </p>
        </div>

        <div className="rounded-lg border bg-muted/50 p-4">
          <p className="text-sm">
            AI가 귀하의 비전과 타겟 고객(&quot;{target}&quot;)을 분석하여
            맞춤형 우선순위를 생성했습니다.
          </p>
        </div>

        <div className="flex justify-center">
          <Button onClick={handleClose} size="lg">
            시작하기
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
