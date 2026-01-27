/**
 * Health Monitoring Service
 * Tracks system health metrics including CPU, memory, database connections
 */

import os from 'os';
import pool from '../utils/db';

export interface HealthMetrics {
  timestamp: Date;
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

export interface HealthThresholds {
  cpu: { warning: number; critical: number };
  memory: { warning: number; critical: number };
  databaseLatency: { warning: number; critical: number };
}

class HealthMonitoringService {
  private thresholds: HealthThresholds = {
    cpu: { warning: 70, critical: 90 },
    memory: { warning: 80, critical: 95 },
    databaseLatency: { warning: 100, critical: 500 },
  };

  /**
   * Get current system health metrics
   */
  async getHealthMetrics(): Promise<HealthMetrics> {
    const startTime = Date.now();

    // Database latency check
    let dbConnected = false;
    let dbLatency = 0;
    try {
      await pool.query('SELECT 1');
      dbConnected = true;
      dbLatency = Date.now() - startTime;
    } catch (error) {
      console.error('Database health check failed:', error);
    }

    // CPU usage calculation
    const cpus = os.cpus();
    const numCores = cpus.length;
    const loadAverage = os.loadavg();

    // Calculate CPU usage (simplified)
    const cpuUsage = this.calculateCPUUsage();

    // Memory usage
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const memoryUsage = (usedMem / totalMem) * 100;

    return {
      timestamp: new Date(),
      uptime: process.uptime(),
      cpu: {
        usage: cpuUsage,
        cores: numCores,
        loadAverage: loadAverage.map((avg) => avg / numCores), // Normalize by core count
      },
      memory: {
        total: totalMem,
        used: usedMem,
        free: freeMem,
        usage: memoryUsage,
      },
      database: {
        connected: dbConnected,
        pool: {
          total: pool.totalCount,
          idle: pool.idleCount,
          waiting: pool.waitingCount,
        },
        latency: dbLatency,
      },
      api: {
        endpoints: 0, // Could track active routes
        activeConnections: 0, // Could track from HTTP server
      },
    };
  }

  /**
   * Get health status with alerts
   */
  async getHealthStatus(): Promise<{
    healthy: boolean;
    metrics: HealthMetrics;
    alerts: string[];
  }> {
    const metrics = await this.getHealthMetrics();
    const alerts: string[] = [];

    // CPU alerts
    if (metrics.cpu.usage >= this.thresholds.cpu.critical) {
      alerts.push(`CRITICAL: CPU usage at ${metrics.cpu.usage.toFixed(1)}%`);
    } else if (metrics.cpu.usage >= this.thresholds.cpu.warning) {
      alerts.push(`WARNING: CPU usage at ${metrics.cpu.usage.toFixed(1)}%`);
    }

    // Memory alerts
    if (metrics.memory.usage >= this.thresholds.memory.critical) {
      alerts.push(`CRITICAL: Memory usage at ${metrics.memory.usage.toFixed(1)}%`);
    } else if (metrics.memory.usage >= this.thresholds.memory.warning) {
      alerts.push(`WARNING: Memory usage at ${metrics.memory.usage.toFixed(1)}%`);
    }

    // Database alerts
    if (!metrics.database.connected) {
      alerts.push('CRITICAL: Database connection lost');
    } else if (metrics.database.latency >= this.thresholds.databaseLatency.critical) {
      alerts.push(`CRITICAL: Database latency at ${metrics.database.latency}ms`);
    } else if (metrics.database.latency >= this.thresholds.databaseLatency.warning) {
      alerts.push(`WARNING: Database latency at ${metrics.database.latency}ms`);
    }

    // Load average alerts
    const highLoad = metrics.cpu.loadAverage.filter((load) => load > 1.0);
    if (highLoad.length > 0) {
      alerts.push(
        `WARNING: High load average: ${metrics.cpu.loadAverage.map((l) => l.toFixed(2)).join(', ')}`
      );
    }

    return {
      healthy: alerts.length === 0 && metrics.database.connected,
      metrics,
      alerts,
    };
  }

  /**
   * Get historical health data for charts
   */
  async getHealthHistory(_hours: number = 24): Promise<{
    cpu: Array<{ timestamp: Date; usage: number }>;
    memory: Array<{ timestamp: Date; usage: number }>;
    database: Array<{ timestamp: Date; latency: number }>;
  }> {
    // In a production system, this would query a health_metrics table
    // For now, return empty data with structure
    return {
      cpu: [],
      memory: [],
      database: [],
    };
  }

  /**
   * Set custom thresholds
   */
  setThresholds(thresholds: Partial<HealthThresholds>): void {
    this.thresholds = { ...this.thresholds, ...thresholds };
  }

  /**
   * Get current thresholds
   */
  getThresholds(): HealthThresholds {
    return { ...this.thresholds };
  }

  /**
   * Calculate CPU usage percentage
   */
  private calculateCPUUsage(): number {
    const cpus = os.cpus();
    let totalIdle = 0;
    let totalTick = 0;

    cpus.forEach((cpu) => {
      // MEDIUM FIX: Use proper type instead of 'any'
      const times = cpu.times;
      totalTick += times.user + times.nice + times.sys + times.idle + times.irq;
      totalIdle += cpu.times.idle;
    });

    const idle = totalIdle / cpus.length;
    const total = totalTick / cpus.length;
    const usage = 100 - ~~((100 * idle) / total);

    return usage;
  }

  /**
   * Get detailed system information
   */
  async getSystemInfo(): Promise<{
    platform: string;
    architecture: string;
    nodeVersion: string;
    hostname: string;
    cpuModel: string;
    totalMemory: string;
    uptime: string;
  }> {
    return {
      platform: os.platform(),
      architecture: os.arch(),
      nodeVersion: process.version,
      hostname: os.hostname(),
      cpuModel: os.cpus()[0]?.model || 'Unknown',
      totalMemory: `${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)} GB`,
      uptime: this.formatUptime(process.uptime()),
    };
  }

  /**
   * Format uptime in human-readable format
   */
  private formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);

    return parts.join(' ') || '< 1m';
  }
}

export default new HealthMonitoringService();
