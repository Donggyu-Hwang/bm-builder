import { describe, it, expect } from 'vitest';
import type { User, UserProfile } from '../../../shared/types/user.types';
import type { ApiResponse, ApiError } from '../../../shared/types/api.types';

describe('Shared Types Import', () => {
  it('should compile without errors when importing User type', () => {
    // Type-only import test - if this compiles, the import works
    const testUser: User = {
      id: 'test-id',
      email: 'test@example.com',
      onboarding_completed: false,
      created_at: new Date().toISOString(),
    };
    expect(testUser.email).toBe('test@example.com');
  });

  it('should compile without errors when importing UserProfile type', () => {
    // Type-only import test - UserProfile extends User
    const testProfile: UserProfile = {
      id: 'test-id',
      email: 'test@example.com',
      onboarding_completed: false,
      created_at: new Date().toISOString(),
    };
    expect(testProfile.email).toBe('test@example.com');
  });

  it('should compile without errors when importing ApiResponse type', () => {
    // Type-only import test - discriminated union
    const successResponse: ApiResponse<string> = {
      success: true,
      data: 'test data',
    };
    expect(successResponse.success).toBe(true);
  });

  it('should compile without errors when importing ApiError type', () => {
    // Type-only import test - error response
    const errorResponse: ApiError = {
      success: false,
      error: {
        code: 'TEST_ERROR',
        message: 'Test error message',
      },
    };
    expect(errorResponse.success).toBe(false);
  });

  it('should create a valid User object with optional fields', () => {
    const user: User = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'test@example.com',
      full_name: 'Test User',
      avatar_url: 'https://example.com/avatar.png',
      onboarding_completed: false,
      created_at: new Date().toISOString(),
    };

    expect(user.id).toBe('123e4567-e89b-12d3-a456-426614174000');
    expect(user.email).toBe('test@example.com');
    expect(user.full_name).toBe('Test User');
    expect(user.onboarding_completed).toBe(false);
  });

  it('should handle discriminated union for success response', () => {
    const successResponse: ApiResponse<string> = {
      success: true,
      data: 'Test data',
    };

    expect(successResponse.success).toBe(true);
    if (successResponse.success) {
      expect(successResponse.data).toBe('Test data');
    }
  });

  it('should handle discriminated union for error response', () => {
    const errorResponse: ApiResponse<never, { code: string; message: string }> = {
      success: false,
      error: {
        code: 'TEST_ERROR',
        message: 'Test error message',
      },
    };

    expect(errorResponse.success).toBe(false);
    if (!errorResponse.success) {
      expect(errorResponse.error.code).toBe('TEST_ERROR');
    }
  });
});
