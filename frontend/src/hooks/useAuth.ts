import { useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store/store';
import { checkAuth, logoutUser, refreshToken, clearAuth } from '../store/slices/authSlice';

// Typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector = <T>(selector: (state: RootState) => T): T => useSelector(selector);

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const isCheckingRef = useRef(false);
  const isRefreshingRef = useRef(false);

  // Selectors
  const user = useAppSelector((state) => state.auth.user);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const isLoading = useAppSelector((state) => state.auth.isLoading);
  const error = useAppSelector((state) => state.auth.error);

  // Check auth on mount
  useEffect(() => {
    if (!isCheckingRef.current) {
      isCheckingRef.current = true;
      dispatch(checkAuth());
    }
  }, [dispatch]);

  // Auto token refresh on 401 responses
  const fetchWithAuth = useCallback(async (url: string, options: RequestInit = {}) => {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

    try {
      const response = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        credentials: 'include',
      });

      // If 401 and not already refreshing, try to refresh token
      if (response.status === 401 && !isRefreshingRef.current) {
        isRefreshingRef.current = true;

        try {
          const refreshResult = await dispatch(refreshToken());

          if (refreshToken.fulfilled.match(refreshResult)) {
            // Token refreshed successfully, retry original request
            isRefreshingRef.current = false;
            return fetch(`${API_BASE_URL}${url}`, {
              ...options,
              credentials: 'include',
            });
          } else {
            // Refresh failed, clear auth and redirect to login
            isRefreshingRef.current = false;
            dispatch(clearAuth());
            window.location.href = '/login';
            throw new Error('Token refresh failed');
          }
        } catch (refreshError) {
          isRefreshingRef.current = false;
          dispatch(clearAuth());
          window.location.href = '/login';
          throw refreshError;
        }
      }

      return response;
    } catch (error) {
      // Network error or other issue
      if (error instanceof TypeError && error.message.includes('fetch')) {
        // Don't clear auth on network errors, might be temporary
        throw error;
      }

      // For other errors, clear auth state
      dispatch(clearAuth());
      throw error;
    }
  }, [dispatch]);

  const logout = useCallback(async () => {
    await dispatch(logoutUser());
    window.location.href = '/login';
  }, [dispatch]);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    logout,
    fetchWithAuth,
  };
};
