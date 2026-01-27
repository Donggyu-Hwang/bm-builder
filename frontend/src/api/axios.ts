/**
 * Axios API Client Configuration
 * Uses httpOnly cookies for authentication (secure, XSS-protected)
 */

import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// Create axios instance
export const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  // IMPORTANT: Use httpOnly cookies for authentication (NOT localStorage)
  // This is secure against XSS attacks
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // DO NOT add Authorization header from localStorage
    // httpOnly cookies are automatically sent by the browser
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh token using httpOnly cookie
        await axios.post(`${API_BASE_URL}/api/v1/auth/refresh`, {}, { withCredentials: true });

        // Retry original request
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed - redirect to login
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    if (error.response?.status === 403) {
      console.error('Forbidden: You do not have permission to access this resource');
    } else if (error.response?.status === 500) {
      console.error('Server error: Please try again later');
    } else if (error.code === 'ERR_NETWORK') {
      console.error('Network error: Please check your connection');
    }

    return Promise.reject(error);
  }
);

export default api;
