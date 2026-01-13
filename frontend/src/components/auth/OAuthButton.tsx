import { useAuth } from '../../hooks/useAuth';
import Button from '../ui/Button';

interface OAuthButtonProps {
  provider: 'google' | 'naver';
  disabled?: boolean;
}

const providerConfig = {
  google: {
    label: 'Google로 계속하기',
    icon: 'G',
    bgColor: 'bg-white',
    textColor: 'text-gray-900',
    borderColor: 'border-gray-300',
  },
  naver: {
    label: 'Naver로 계속하기',
    icon: 'N',
    bgColor: 'bg-green-500',
    textColor: 'text-white',
    borderColor: 'border-green-500',
  },
};

export default function OAuthButton({ provider, disabled }: OAuthButtonProps) {
  const { signIn, loading } = useAuth();
  const config = providerConfig[provider];

  const handleClick = () => {
    signIn(provider);
  };

  return (
    <Button
      onClick={handleClick}
      disabled={disabled || loading}
      variant="outline"
      className={cn(
        'w-full',
        config.bgColor,
        config.textColor,
        config.borderColor,
        'hover:opacity-90'
      )}
    >
      <span className="mr-2 font-bold">{config.icon}</span>
      {config.label}
    </Button>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
