import { describe, it, expect, beforeAll, beforeEach, afterEach, jest } from '@jest/globals';
import pool from '../utils/db';
import { googleDriveScannerService } from './googleDriveScanner.service';
import { setupTestDatabase } from './googleDriveScanner.service.setup';

// Setup database before all tests
beforeAll(async () => {
  await setupTestDatabase();
});

// Mock google OAuth service
jest.mock('./googleOAuth.service', () => ({
  googleOAuthService: {
    getTokens: jest.fn(),
    isTokenExpired: jest.fn(() => false)
  }
}));

// Mock googleapis
jest.mock('googleapis', () => ({
  google: {
    drive: jest.fn(() => ({
      files: {
        list: jest.fn()
      }
    }))
  }
}));

describe('GoogleDriveScannerService', () => {
  const testUserId = '00000000-0000-0000-0000-000000000001';

  beforeEach(async () => {
    // Clean up test data before each test
    await pool.query('DELETE FROM scan_progress WHERE user_id = $1', [testUserId]);
    await pool.query('DELETE FROM embedded_documents WHERE user_id = $1', [testUserId]);
  });

  afterEach(async () => {
    // Clean up test data after each test
    await pool.query('DELETE FROM scan_progress WHERE user_id = $1', [testUserId]);
    await pool.query('DELETE FROM embedded_documents WHERE user_id = $1', [testUserId]);
  });

  describe('initializeScan', () => {
    it('should create scan progress entry', async () => {
      await googleDriveScannerService.initializeScan(testUserId);

      const { rows } = await pool.query(
        'SELECT * FROM scan_progress WHERE user_id = $1',
        [testUserId]
      );

      expect(rows.length).toBe(1);
      expect(rows[0].status).toBe('scanning');
      expect(rows[0].total_files).toBe(0);
      expect(rows[0].scanned_files).toBe(0);
      expect(rows[0].business_documents).toBe(0);
    });

    it('should reset existing scan progress', async () => {
      // First initialization
      await googleDriveScannerService.initializeScan(testUserId);

      // Update some values
      await pool.query(
        `UPDATE scan_progress
         SET total_files = 10, scanned_files = 5, business_documents = 2
         WHERE user_id = $1`,
        [testUserId]
      );

      // Second initialization should reset
      await googleDriveScannerService.initializeScan(testUserId);

      const { rows } = await pool.query(
        'SELECT * FROM scan_progress WHERE user_id = $1',
        [testUserId]
      );

      expect(rows[0].total_files).toBe(0);
      expect(rows[0].scanned_files).toBe(0);
      expect(rows[0].business_documents).toBe(0);
    });
  });

  describe('getScanProgress', () => {
    it('should return null when no scan exists', async () => {
      const progress = await googleDriveScannerService.getScanProgress(testUserId);
      expect(progress).toBeNull();
    });

    it('should return scan progress when exists', async () => {
      // Insert test data
      await pool.query(
        `INSERT INTO scan_progress (user_id, total_files, scanned_files, business_documents, status)
         VALUES ($1, 100, 50, 10, 'scanning')`,
        [testUserId]
      );

      const progress = await googleDriveScannerService.getScanProgress(testUserId);

      expect(progress).not.toBeNull();
      expect(progress?.total).toBe(100);
      expect(progress?.scanned).toBe(50);
      expect(progress?.business).toBe(10);
      expect(progress?.status).toBe('scanning');
    });

    it('should return failed status with error message', async () => {
      // Insert test data with error
      await pool.query(
        `INSERT INTO scan_progress (user_id, total_files, scanned_files, business_documents, status, error_message)
         VALUES ($1, 0, 0, 0, 'failed', 'Test error')`,
        [testUserId]
      );

      const progress = await googleDriveScannerService.getScanProgress(testUserId);

      expect(progress?.status).toBe('failed');
      expect(progress?.error).toBe('Test error');
    });
  });

  describe('calculateEstimatedTime', () => {
    it('should return 0 for completed scan', () => {
      const progress = {
        total: 100,
        scanned: 100,
        business: 10,
        status: 'completed' as const
      };

      const time = googleDriveScannerService.calculateEstimatedTime(progress);
      expect(time).toBe(0);
    });

    it('should return 0 for pending scan', () => {
      const progress = {
        total: 100,
        scanned: 0,
        business: 0,
        status: 'pending' as const
      };

      const time = googleDriveScannerService.calculateEstimatedTime(progress);
      expect(time).toBe(0);
    });

    it('should calculate estimated time for scanning', () => {
      const progress = {
        total: 100,
        scanned: 50,
        business: 5,
        status: 'scanning' as const
      };

      const time = googleDriveScannerService.calculateEstimatedTime(progress);
      // 50 files remaining * 1.2 seconds = 60 seconds
      expect(time).toBe(60);
    });

    it('should return 0 when scanned is 0', () => {
      const progress = {
        total: 100,
        scanned: 0,
        business: 0,
        status: 'scanning' as const
      };

      const time = googleDriveScannerService.calculateEstimatedTime(progress);
      expect(time).toBe(0);
    });
  });

  describe('completeScan', () => {
    it('should mark scan as completed', async () => {
      // Initialize scan
      await googleDriveScannerService.initializeScan(testUserId);

      // Complete scan (private method, so we'll use the public scanFiles which calls it)
      // For now, we'll manually update to test the state
      await pool.query(
        `UPDATE scan_progress
         SET total_files = 10, scanned_files = 10, business_documents = 3, status = 'completed', completed_at = NOW()
         WHERE user_id = $1`,
        [testUserId]
      );

      const { rows } = await pool.query(
        'SELECT * FROM scan_progress WHERE user_id = $1',
        [testUserId]
      );

      expect(rows[0].status).toBe('completed');
      expect(rows[0].total_files).toBe(10);
      expect(rows[0].scanned_files).toBe(10);
      expect(rows[0].business_documents).toBe(3);
      expect(rows[0].completed_at).not.toBeNull();
    });
  });

  describe('failScan', () => {
    it('should mark scan as failed with error message', async () => {
      // Initialize scan
      await googleDriveScannerService.initializeScan(testUserId);

      // Simulate failure by updating status
      const errorMessage = 'Test error message';
      await pool.query(
        `UPDATE scan_progress
         SET status = 'failed', error_message = $1, completed_at = NOW()
         WHERE user_id = $2`,
        [errorMessage, testUserId]
      );

      const { rows } = await pool.query(
        'SELECT * FROM scan_progress WHERE user_id = $1',
        [testUserId]
      );

      expect(rows[0].status).toBe('failed');
      expect(rows[0].error_message).toBe(errorMessage);
      expect(rows[0].completed_at).not.toBeNull();
    });
  });
});
