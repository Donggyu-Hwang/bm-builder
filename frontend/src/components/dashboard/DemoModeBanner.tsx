import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import { X } from 'lucide-react';

export default function DemoModeBanner() {
  const navigate = useNavigate();

  return (
    <div className="bg-primary px-4 py-3 text-primary-foreground">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-semibold">데모 모드입니다.</span>
          <span className="text-sm opacity-90">
            무제한 사용을 위해 가입하세요!
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => navigate('/login')}
          >
            가입하기
          </Button>
        </div>
      </div>
    </div>
  );
}
