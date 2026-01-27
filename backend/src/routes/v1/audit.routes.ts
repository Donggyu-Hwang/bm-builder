/**
 * Audit Routes
 * API endpoints for audit logs and system logs
 */

import express from 'express';
import auditService from '../../services/audit.service';
import { requireAuth, requireAdmin } from '../../middleware/auth.middleware';

const router = express.Router();

/**
 * GET /api/v1/audit/logs
 * Get audit logs with filters (admin only)
 */
// MEDIUM FIX: Use requireAuth instead of authenticateToken for consistency
router.get('/audit/logs', requireAuth, requireAdmin, async (req, res) => {
  try {
    const {
      userId,
      action,
      entity,
      entityId,
      startDate,
      endDate,
      limit = '100',
      offset = '0',
    } = req.query;

    const filters = {
      userId: userId as string | undefined,
      action: action as string | undefined,
      entity: entity as string | undefined,
      entityId: entityId as string | undefined,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      limit: parseInt(limit as string, 10),
      offset: parseInt(offset as string, 10),
    };

    const result = await auditService.getAuditLogs(filters);
    res.json({
      success: true,
      data: result.logs,
      total: result.total,
      limit: filters.limit,
      offset: filters.offset,
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch audit logs',
    });
  }
});

/**
 * GET /api/v1/audit/statistics
 * Get audit statistics (admin only)
 */
router.get('/audit/statistics', requireAuth, requireAdmin, async (req, res) => {
  try {
    const days = req.query.days ? parseInt(req.query.days as string, 10) : 30;
    const stats = await auditService.getAuditStatistics(days);
    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error fetching audit statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch audit statistics',
    });
  }
});

/**
 * GET /api/v1/audit/export
 * Export audit logs as CSV (admin only)
 */
router.get('/audit/export', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { userId, action, entity, entityId, startDate, endDate } = req.query;

    const filters = {
      userId: userId as string | undefined,
      action: action as string | undefined,
      entity: entity as string | undefined,
      entityId: entityId as string | undefined,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
    };

    const csv = await auditService.exportAuditLogs(filters);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="audit-logs-${Date.now()}.csv"`);
    res.send(csv);
  } catch (error) {
    console.error('Error exporting audit logs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export audit logs',
    });
  }
});

/**
 * GET /api/v1/system/logs
 * Get system logs with filters (admin only)
 */
router.get('/system/logs', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { level, service, userId, startDate, endDate, limit = '100', offset = '0' } = req.query;

    const filters = {
      level: level as 'info' | 'warn' | 'error' | 'debug' | undefined,
      service: service as string | undefined,
      userId: userId as string | undefined,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      limit: parseInt(limit as string, 10),
      offset: parseInt(offset as string, 10),
    };

    const result = await auditService.getSystemLogs(filters);
    res.json({
      success: true,
      data: result.logs,
      total: result.total,
      limit: filters.limit,
      offset: filters.offset,
    });
  } catch (error) {
    console.error('Error fetching system logs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch system logs',
    });
  }
});

/**
 * POST /api/v1/system/logs
 * Create a system log entry (internal use)
 */
router.post('/system/logs', async (req, res) => {
  try {
    const { level, service, message, metadata, userId } = req.body;

    if (!level || !service || !message) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: level, service, message',
      });
    }

    const log = await auditService.createSystemLog({
      level,
      service,
      message,
      metadata,
      userId,
    });

    res.json({
      success: true,
      data: log,
    });
  } catch (error) {
    console.error('Error creating system log:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create system log',
    });
  }
});

/**
 * POST /api/v1/audit/cleanup
 * Cleanup old logs (admin only)
 */
router.post('/audit/cleanup', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { retentionDays = 90 } = req.body;
    const result = await auditService.cleanupOldLogs(retentionDays);
    res.json({
      success: true,
      data: result,
      message: `Deleted ${result.auditLogsDeleted} audit logs and ${result.systemLogsDeleted} system logs`,
    });
  } catch (error) {
    console.error('Error cleaning up logs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cleanup logs',
    });
  }
});

export default router;
