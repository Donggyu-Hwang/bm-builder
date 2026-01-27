/**
 * Audit API Client
 * API methods for audit logs and system logs
 */

import axios from './axios';

export interface AuditLog {
  id: string;
  user_id: string;
  user_email?: string;
  user_name?: string;
  action: string;
  entity: string;
  entity_id: string;
  changes: Record<string, any>;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

export interface SystemLog {
  id: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  service: string;
  message: string;
  metadata: Record<string, any>;
  user_id?: string;
  user_email?: string;
  user_name?: string;
  created_at: string;
}

export interface AuditStatistics {
  totalActions: number;
  actionsByUser: Array<{ userId: string; userName: string; userEmail: string; count: number }>;
  actionsByEntity: Array<{ entity: string; count: number }>;
  actionsByDay: Array<{ date: string; count: number }>;
}

export interface AuditLogFilters {
  userId?: string;
  action?: string;
  entity?: string;
  entityId?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export interface SystemLogFilters {
  level?: 'info' | 'warn' | 'error' | 'debug';
  service?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

/**
 * Get audit logs with filters
 */
export async function getAuditLogs(filters: AuditLogFilters = {}): Promise<{
  logs: AuditLog[];
  total: number;
  limit: number;
  offset: number;
}> {
  const params = new URLSearchParams();

  if (filters.userId) params.append('userId', filters.userId);
  if (filters.action) params.append('action', filters.action);
  if (filters.entity) params.append('entity', filters.entity);
  if (filters.entityId) params.append('entityId', filters.entityId);
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);
  params.append('limit', (filters.limit || 100).toString());
  params.append('offset', (filters.offset || 0).toString());

  const response = await axios.get(`/api/v1/audit/logs?${params.toString()}`);
  return response.data;
}

/**
 * Get audit statistics
 */
export async function getAuditStatistics(days: number = 30): Promise<AuditStatistics> {
  const response = await axios.get(`/api/v1/audit/statistics?days=${days}`);
  return response.data.data;
}

/**
 * Export audit logs as CSV
 */
export async function exportAuditLogs(filters: AuditLogFilters = {}): Promise<void> {
  const params = new URLSearchParams();

  if (filters.userId) params.append('userId', filters.userId);
  if (filters.action) params.append('action', filters.action);
  if (filters.entity) params.append('entity', filters.entity);
  if (filters.entityId) params.append('entityId', filters.entityId);
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);

  window.open(`/api/v1/audit/export?${params.toString()}`, '_blank');
}

/**
 * Get system logs with filters
 */
export async function getSystemLogs(filters: SystemLogFilters = {}): Promise<{
  logs: SystemLog[];
  total: number;
  limit: number;
  offset: number;
}> {
  const params = new URLSearchParams();

  if (filters.level) params.append('level', filters.level);
  if (filters.service) params.append('service', filters.service);
  if (filters.userId) params.append('userId', filters.userId);
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);
  params.append('limit', (filters.limit || 100).toString());
  params.append('offset', (filters.offset || 0).toString());

  const response = await axios.get(`/api/v1/system/logs?${params.toString()}`);
  return response.data;
}

/**
 * Cleanup old logs
 */
export async function cleanupOldLogs(retentionDays: number = 90): Promise<{
  auditLogsDeleted: number;
  systemLogsDeleted: number;
}> {
  const response = await axios.post('/api/v1/audit/cleanup', { retentionDays });
  return response.data.data;
}
