import { Router, Response } from 'express';
import { googleDriveScannerService } from '../../services/googleDriveScanner.service';
import { requireAuth } from '../../middleware/auth.middleware';

const router = Router();

/**
 * POST /api/v1/file-scan/start
 * Start file scan from Google Drive
 */
router.post('/start', requireAuth, async (req: unknown, res: Response) => {
  try {
    const request = req as { user: { id: string } };
    const userId = request.user.id;

    // Start scan in background (don't await)
    googleDriveScannerService.scanFiles(userId).catch((error) => {
      console.error('Background scan failed:', error);
    });

    res.json({
      success: true,
      data: {
        message: '파일 스캔을 시작했습니다',
        status: 'started'
      }
    });
  } catch (error: unknown) {
    console.error('Error starting scan:', error);

    const errorMessage = error instanceof Error ? error.message : '파일 스캔 시작에 실패했습니다';

    res.status(500).json({
      success: false,
      error: {
        code: 'SCAN_START_FAILED',
        message: errorMessage
      }
    });
  }
});

/**
 * POST /api/v1/file-scan/incremental
 * Start incremental file scan (only new or modified files since last sync)
 */
router.post('/incremental', requireAuth, async (req: unknown, res: Response) => {
  try {
    const request = req as { user: { id: string } };
    const userId = request.user.id;

    // Start incremental scan in background (don't await)
    googleDriveScannerService.scanFilesIncremental(userId).catch((error) => {
      console.error('Background incremental scan failed:', error);
    });

    res.json({
      success: true,
      data: {
        message: '증분 파일 스캔을 시작했습니다',
        status: 'incremental_started'
      }
    });
  } catch (error: unknown) {
    console.error('Error starting incremental scan:', error);

    const errorMessage = error instanceof Error ? error.message : '증분 파일 스캔 시작에 실패했습니다';

    res.status(500).json({
      success: false,
      error: {
        code: 'INCREMENTAL_SCAN_START_FAILED',
        message: errorMessage
      }
    });
  }
});

/**
 * GET /api/v1/file-scan/progress
 * Get scan progress
 */
router.get('/progress', requireAuth, async (req: unknown, res: Response) => {
  try {
    const request = req as { user: { id: string } };
    const userId = request.user.id;
    const progress = await googleDriveScannerService.getScanProgress(userId);

    if (!progress) {
      return res.json({
        success: true,
        data: {
          status: 'pending',
          message: '스캔이 시작되지 않았습니다'
        }
      });
    }

    // Calculate estimated time remaining
    const estimatedTimeRemaining = googleDriveScannerService.calculateEstimatedTime(progress);

    // Format time remaining
    let formattedTime: string | undefined;
    if (estimatedTimeRemaining > 0) {
      const minutes = Math.floor(estimatedTimeRemaining / 60);
      const seconds = estimatedTimeRemaining % 60;
      formattedTime = minutes > 0 ? `${minutes}분 ${seconds}초` : `${seconds}초`;
    }

    res.json({
      success: true,
      data: {
        total: progress.total,
        scanned: progress.scanned,
        business: progress.business,
        status: progress.status,
        error: progress.error,
        estimatedTimeRemaining: formattedTime
      }
    });
  } catch (error) {
    console.error('Error getting progress:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'PROGRESS_CHECK_FAILED',
        message: '진행 상황 확인에 실패했습니다'
      }
    });
  }
});

/**
 * POST /api/v1/file-scan/retry
 * Retry failed scan
 */
router.post('/retry', requireAuth, async (req: unknown, res: Response) => {
  try {
    const request = req as { user: { id: string } };
    const userId = request.user.id;

    // Check if there was a failed scan
    const progress = await googleDriveScannerService.getScanProgress(userId);

    if (!progress || progress.status !== 'failed') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_FAILED_SCAN',
          message: '재시도할 실패한 스캔이 없습니다'
        }
      });
    }

    // Start scan in background
    googleDriveScannerService.scanFiles(userId).catch((error) => {
      console.error('Background scan retry failed:', error);
    });

    res.json({
      success: true,
      data: {
        message: '파일 스캔을 재시작합니다',
        status: 'retrying'
      }
    });
  } catch (error) {
    console.error('Error retrying scan:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SCAN_RETRY_FAILED',
        message: '스캔 재시작에 실패했습니다'
      }
    });
  }
});

export default router;
