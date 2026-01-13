// Type guards for validation
export function isNotEmpty(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export function isValidEmail(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
}

export function hasMinLength(value: unknown, min: number): value is string {
  return typeof value === 'string' && value.trim().length >= min;
}

export function hasMaxLength(value: unknown, max: number): value is string {
  return typeof value === 'string' && value.trim().length <= max;
}

export function isValidLength(value: unknown, min: number, max: number): value is string {
  return hasMinLength(value, min) && hasMaxLength(value, max);
}

export function validateNotEmpty(value: string, fieldName: string): string | null {
  if (!isNotEmpty(value)) {
    return `${fieldName}은(는) 필수 항목입니다.`;
  }
  return null;
}

export function validateEmail(value: string): string | null {
  if (!isValidEmail(value)) {
    return '올바른 이메일 주소를 입력해주세요.';
  }
  return null;
}

export function validateLength(
  value: string,
  min: number,
  max: number,
  fieldName: string
): string | null {
  if (!isValidLength(value, min, max)) {
    return `${fieldName}은(는) ${min}자 이상 ${max}자 이하여야 합니다.`;
  }
  return null;
}

export function validateOnboardingResponse(value: string, step: number): string | null {
  const questions: Record<number, string> = {
    1: '비전',
    2: '타겟 고객',
    3: '현재 단계',
  };

  return validateNotEmpty(value, questions[step]);
}
