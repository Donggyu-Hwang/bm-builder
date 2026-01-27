/**
 * Health Monitoring Routes
 * API endpoints for system health monitoring
 */

import express from 'express';
import healthService from '../../services/health.service';
import { authenticateToken, requireAdmin } from '../../middleware/auth.middleware';

const router = express.Router();

/**
 * GET /api/v1/health/metrics
 * Get current health metrics (admin only)
 */
router.get('/health/metrics', authenticateToken, requireAdmin, async (_req, res) => {
  try {
    const metrics = await healthService.getHealthMetrics();
    res.json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    console.error('Error fetching health metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch health metrics',
    });
  }
});

/**
 * GET /api/v1/health/status
 * Get health status with alerts (admin only)
 */
router.get('/health/status', authenticateToken, requireAdmin, async (_req, res) => {
  try {
    const status = await healthService.getHealthStatus();
    res.json({
      success: true,
      data: status,
    });
  } catch (error) {
    console.error('Error fetching health status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch health status',
    });
  }
});

/**
 * GET /api/v1/health/system-info
 * Get detailed system information (admin only)
 */
router.get('/health/system-info', authenticateToken, requireAdmin, async (_req, res) => {
  try {
    const systemInfo = await healthService.getSystemInfo();
    res.json({
      success: true,
      data: systemInfo,
    });
  } catch (error) {
    console.error('Error fetching system info:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch system info',
    });
  }
});

/**
 * GET /api/v1/health/history
 * Get historical health data (admin only)
 */
router.get('/health/history', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const hours = req.query.hours ? parseInt(req.query.hours as string, 10) : 24;
    const history = await healthService.getHealthHistory(hours);
    res.json({
      success: true,
      data: history,
    });
  } catch (error) {
    console.error('Error fetching health history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch health history',
    });
  }
});

/**
 * PUT /api/v1/health/thresholds
 * Update health thresholds (admin only)
 */
router.put('/health/thresholds', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const thresholds = req.body;
    healthService.setThresholds(thresholds);
    const updated = healthService.getThresholds();
    res.json({
      success: true,
      data: updated,
      message: 'Thresholds updated successfully',
    });
  } catch (error) {
    console.error('Error updating thresholds:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update thresholds',
    });
  }
});

/**
 * GET /api/v1/health/thresholds
 * Get current thresholds (admin only)
 */
router.get('/health/thresholds', authenticateToken, requireAdmin, async (_req, res) => {
  try {
    const thresholds = healthService.getThresholds();
    res.json({
      success: true,
      data: thresholds,
    });
  } catch (error) {
    console.error('Error fetching thresholds:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch thresholds',
    });
  }
});

export default router;
