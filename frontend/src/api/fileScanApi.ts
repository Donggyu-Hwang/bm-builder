import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true
});

/**
 * File Scan API Response Types
 */
export interface ScanProgressResponse {
  total: number;
  scanned: number;
  business: number;
  status: 'pending' | 'scanning' | 'completed' | 'failed';
  error?: string;
  estimatedTimeRemaining?: string;
}

export interface StartScanResponse {
  message: string;
  status: string;
}

export interface IncrementalScanResponse {
  message: string;
  status: string;
}

export interface RetryScanResponse {
  message: string;
  status: string;
}

/**
 * File Scan API Client
 */
export const fileScanApi = {
  /**
   * Start file scan
   */
  startScan: async (): Promise<StartScanResponse> => {
    const { data } = await axiosInstance.post<{ success: true; data: StartScanResponse }>(
      '/api/v1/file-scan/start'
    );
    return data.data;
  },

  /**
   * Start incremental file scan (only new or modified files)
   */
  startIncrementalScan: async (): Promise<IncrementalScanResponse> => {
    const { data } = await axiosInstance.post<{ success: true; data: IncrementalScanResponse }>(
      '/api/v1/file-scan/incremental'
    );
    return data.data;
  },

  /**
   * Get scan progress
   */
  getProgress: async (): Promise<ScanProgressResponse> => {
    const { data } = await axiosInstance.get<{
      success: true;
      data: ScanProgressResponse;
    }>('/api/v1/file-scan/progress');
    return data.data;
  },

  /**
   * Retry failed scan
   */
  retryScan: async (): Promise<RetryScanResponse> => {
    const { data } = await axiosInstance.post<{ success: true; data: RetryScanResponse }>(
      '/api/v1/file-scan/retry'
    );
    return data.data;
  }
};
