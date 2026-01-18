import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore, type EnhancedStore } from '@reduxjs/toolkit';
import { useAuth } from './useAuth';
import authReducer from '../store/slices/authSlice';
import type { RootState } from '../store/store';

// Mock fetch globally
global.fetch = vi.fn();

// Helper to create a test store with auth state
function createTestStore(preloadedState?: Partial<RootState>): EnhancedStore {
  return configureStore({
    reducer: {
      auth: authReducer,
    },
    preloadedState,
  } as any);
}

describe('useAuth Hook (Redux Integration)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with loading state and check auth', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: false,
    });

    const store = createTestStore();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('should set authenticated state when token is valid', async () => {
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      full_name: 'Test User',
      avatar_url: 'https://example.com/avatar.png',
      onboarding_completed: false,
      created_at: new Date().toISOString(),
    };

    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: { user: mockUser },
      }),
    });

    const store = createTestStore();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(mockUser);
  });

  it('should set unauthenticated state when token is invalid', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: false,
    });

    const store = createTestStore();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it('should handle fetch errors gracefully', async () => {
    (global.fetch as any).mockRejectedValue(new Error('Network error'));

    const store = createTestStore();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it('should logout and redirect to /login', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
      }),
    });

    // Mock window.location
    const originalLocation = window.location;
    delete (window as any).location;
    (window as any).location = { href: '' };

    const store = createTestStore();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Call logout
    await result.current.logout();

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/auth/logout',
      {
        method: 'POST',
        credentials: 'include',
      }
    );

    expect((window as any).location.href).toBe('/login');

    // Restore window.location
    (window as any).location = originalLocation;
  });

  it('should provide fetchWithAuth function', async () => {
    const store = createTestStore();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(typeof result.current.fetchWithAuth).toBe('function');
  });
});
