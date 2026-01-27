/**
 * Health Monitoring API Client
 * API methods for system health monitoring
 */

import axios from './axios';

export interface HealthMetrics {
  timestamp: string;
  uptime: number;
  cpu: {
    usage: number;
    cores: number;
    loadAverage: number[];
  };
  memory: {
    total: number;
    used: number;
    free: number;
    usage: number;
  };
  database: {
    connected: boolean;
    pool: {
      total: number;
      idle: number;
      waiting: number;
    };
    latency: number;
  };
  api: {
    endpoints: number;
    activeConnections: number;
  };
}

export interface HealthStatus {
  healthy: boolean;
  metrics: HealthMetrics;
  alerts: string[];
}

export interface SystemInfo {
  platform: string;
  architecture: string;
  nodeVersion: string;
  hostname: string;
  cpuModel: string;
  totalMemory: string;
  uptime: string;
}

export interface HealthHistory {
  cpu: Array<{ timestamp: string; usage: number }>;
  memory: Array<{ timestamp: string; usage: number }>;
  database: Array<{ timestamp: string; latency: number }>;
}

export interface HealthThresholds {
  cpu: { warning: number; critical: number };
  memory: { warning: number; critical: number };
  databaseLatency: { warning: number; critical: number };
}

/**
 * Get health metrics
 */
export async function getHealthMetrics(): Promise<HealthMetrics> {
  const response = await axios.get('/api/v1/health/metrics');
  return response.data.data;
}

/**
 * Get health status with alerts
 */
export async function getHealthStatus(): Promise<HealthStatus> {
  const response = await axios.get('/api/v1/health/status');
  return response.data.data;
}

/**
 * Get system information
 */
export async function getSystemInfo(): Promise<SystemInfo> {
  const response = await axios.get('/api/v1/health/system-info');
  return response.data.data;
}

/**
 * Get health history
 */
export async function getHealthHistory(hours: number = 24): Promise<HealthHistory> {
  const response = await axios.get(`/api/v1/health/history?hours=${hours}`);
  return response.data.data;
}

/**
 * Get thresholds
 */
export async function getThresholds(): Promise<HealthThresholds> {
  const response = await axios.get('/api/v1/health/thresholds');
  return response.data.data;
}

/**
 * Update thresholds
 */
export async function updateThresholds(
  thresholds: Partial<HealthThresholds>
): Promise<HealthThresholds> {
  const response = await axios.put('/api/v1/health/thresholds', thresholds);
  return response.data.data;
}
