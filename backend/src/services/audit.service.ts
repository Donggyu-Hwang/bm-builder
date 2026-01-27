/**
 * Audit Service
 * Tracks all system actions for security and compliance
 */

import pool from '../utils/db';

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entity: string;
  entityId: string;
  // MEDIUM FIX: Replace 'any' with proper type
  changes: Record<string, unknown>;
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
}

export interface SystemLog {
  id: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  service: string;
  message: string;
  // MEDIUM FIX: Replace 'any' with proper type
  metadata: Record<string, unknown>;
  userId?: string;
  createdAt: Date;
}

export interface AuditLogFilters {
  userId?: string;
  action?: string;
  entity?: string;
  entityId?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

export interface SystemLogFilters {
  level?: 'info' | 'warn' | 'error' | 'debug';
  service?: string;
  userId?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

class AuditService {
  /**
   * Create an audit log entry
   */
  async createAuditLog(data: {
    userId: string;
    action: string;
    entity: string;
    entityId: string;
    // MEDIUM FIX: Replace 'any' with proper type
    changes?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<AuditLog> {
    const result = await pool.query(
      `INSERT INTO audit_logs
       (user_id, action, entity, entity_id, changes, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        data.userId,
        data.action,
        data.entity,
        data.entityId,
        JSON.stringify(data.changes || {}),
        data.ipAddress || null,
        data.userAgent || null,
      ]
    );

    return result.rows[0];
  }

  /**
   * Get audit logs with filters
   */
  async getAuditLogs(filters: AuditLogFilters = {}): Promise<{ logs: AuditLog[]; total: number }> {
    const conditions: string[] = [];
    // MEDIUM FIX: Replace 'any[]' with proper type
    const params: (string | number | Date)[] = [];
    let paramIndex = 1;

    if (filters.userId) {
      conditions.push(`user_id = $${paramIndex++}`);
      params.push(filters.userId);
    }

    if (filters.action) {
      conditions.push(`action = $${paramIndex++}`);
      params.push(filters.action);
    }

    if (filters.entity) {
      conditions.push(`entity = $${paramIndex++}`);
      params.push(filters.entity);
    }

    if (filters.entityId) {
      conditions.push(`entity_id = $${paramIndex++}`);
      params.push(filters.entityId);
    }

    if (filters.startDate) {
      conditions.push(`created_at >= $${paramIndex++}`);
      params.push(filters.startDate);
    }

    if (filters.endDate) {
      conditions.push(`created_at <= $${paramIndex++}`);
      params.push(filters.endDate);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const limit = filters.limit || 100;
    const offset = filters.offset || 0;

    // Get total count
    const countResult = await pool.query(
      `SELECT COUNT(*) as count FROM audit_logs ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count, 10);

    // Get logs
    const logsResult = await pool.query(
      `SELECT
        al.*,
        u.email as user_email,
        u.name as user_name
       FROM audit_logs al
       LEFT JOIN users u ON al.user_id = u.id
       ${whereClause}
       ORDER BY al.created_at DESC
       LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
      [...params, limit, offset]
    );

    return {
      logs: logsResult.rows,
      total,
    };
  }

  /**
   * Create a system log entry
   */
  async createSystemLog(data: {
    level: 'info' | 'warn' | 'error' | 'debug';
    service: string;
    message: string;
    // MEDIUM FIX: Replace 'any' with proper type
    metadata?: Record<string, unknown>;
    userId?: string;
  }): Promise<SystemLog> {
    const result = await pool.query(
      `INSERT INTO system_logs
       (level, service, message, metadata, user_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        data.level,
        data.service,
        data.message,
        JSON.stringify(data.metadata || {}),
        data.userId || null,
      ]
    );

    return result.rows[0];
  }

  /**
   * Get system logs with filters
   */
  async getSystemLogs(
    filters: SystemLogFilters = {}
  ): Promise<{ logs: SystemLog[]; total: number }> {
    const conditions: string[] = [];
    // MEDIUM FIX: Replace 'any[]' with proper type
    const params: (string | number | Date)[] = [];
    let paramIndex = 1;

    if (filters.level) {
      conditions.push(`level = $${paramIndex++}`);
      params.push(filters.level);
    }

    if (filters.service) {
      conditions.push(`service = $${paramIndex++}`);
      params.push(filters.service);
    }

    if (filters.userId) {
      conditions.push(`user_id = $${paramIndex++}`);
      params.push(filters.userId);
    }

    if (filters.startDate) {
      conditions.push(`created_at >= $${paramIndex++}`);
      params.push(filters.startDate);
    }

    if (filters.endDate) {
      conditions.push(`created_at <= $${paramIndex++}`);
      params.push(filters.endDate);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const limit = filters.limit || 100;
    const offset = filters.offset || 0;

    // Get total count
    const countResult = await pool.query(
      `SELECT COUNT(*) as count FROM system_logs ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count, 10);

    // Get logs
    const logsResult = await pool.query(
      `SELECT
        sl.*,
        u.email as user_email,
        u.name as user_name
       FROM system_logs sl
       LEFT JOIN users u ON sl.user_id = u.id
       ${whereClause}
       ORDER BY sl.created_at DESC
       LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
      [...params, limit, offset]
    );

    return {
      logs: logsResult.rows,
      total,
    };
  }

  /**
   * Get audit statistics
   */
  async getAuditStatistics(days: number = 30): Promise<{
    totalActions: number;
    actionsByUser: Array<{ userId: string; userName: string; userEmail: string; count: number }>;
    actionsByEntity: Array<{ entity: string; count: number }>;
    actionsByDay: Array<{ date: string; count: number }>;
  }> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [totalResult, byUserResult, byEntityResult, byDayResult] = await Promise.all([
      pool.query(`SELECT COUNT(*) as count FROM audit_logs WHERE created_at >= $1`, [startDate]),
      pool.query(
        `SELECT
          al.user_id,
          u.name as user_name,
          u.email as user_email,
          COUNT(*) as count
         FROM audit_logs al
         LEFT JOIN users u ON al.user_id = u.id
         WHERE al.created_at >= $1
         GROUP BY al.user_id, u.name, u.email
         ORDER BY count DESC
         LIMIT 10`,
        [startDate]
      ),
      pool.query(
        `SELECT
          entity,
          COUNT(*) as count
         FROM audit_logs
         WHERE created_at >= $1
         GROUP BY entity
         ORDER BY count DESC`,
        [startDate]
      ),
      pool.query(
        `SELECT
          DATE(created_at) as date,
          COUNT(*) as count
         FROM audit_logs
         WHERE created_at >= $1
         GROUP BY DATE(created_at)
         ORDER BY date DESC`,
        [startDate]
      ),
    ]);

    return {
      totalActions: parseInt(totalResult.rows[0].count, 10),
      actionsByUser: byUserResult.rows,
      actionsByEntity: byEntityResult.rows,
      actionsByDay: byDayResult.rows,
    };
  }

  /**
   * Cleanup old logs
   */
  async cleanupOldLogs(
    retentionDays: number = 90
  ): Promise<{ auditLogsDeleted: number; systemLogsDeleted: number }> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const [auditResult, systemResult] = await Promise.all([
      pool.query(`DELETE FROM audit_logs WHERE created_at < $1 RETURNING COUNT(*)`, [cutoffDate]),
      pool.query(`DELETE FROM system_logs WHERE created_at < $1 RETURNING COUNT(*)`, [cutoffDate]),
    ]);

    return {
      auditLogsDeleted: parseInt(auditResult.rows[0].count, 10),
      systemLogsDeleted: parseInt(systemResult.rows[0].count, 10),
    };
  }

  /**
   * Export audit logs as CSV
   */
  async exportAuditLogs(filters: AuditLogFilters = {}): Promise<string> {
    const { logs } = await this.getAuditLogs({ ...filters, limit: 10000 });

    const headers = [
      'ID',
      'User ID',
      'User Email',
      'Action',
      'Entity',
      'Entity ID',
      'Changes',
      'IP Address',
      'User Agent',
      'Created At',
    ];
    const rows = logs.map((log) => [
      log.id,
      log.userId,
      '', // User email not available in AuditLog
      log.action,
      log.entity,
      log.entityId,
      JSON.stringify(log.changes),
      log.ipAddress || '',
      log.userAgent || '',
      log.createdAt,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    return csvContent;
  }
}

export default new AuditService();
