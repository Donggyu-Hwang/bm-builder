import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchScanProgress, retryScan, clearError, setPolling } from '../../store/slices/fileScanSlice';
import {
  selectScanProgress,
  selectScanLoading,
  selectScanError,
  selectScanPolling
} from '../../store/slices/fileScanSlice';

/**
 * ScanProgress Component
 * Displays file scanning progress with real-time updates
 */
export const ScanProgress = () => {
  const dispatch = useDispatch();
  const progress = useSelector(selectScanProgress);
  const loading = useSelector(selectScanLoading);
  const error = useSelector(selectScanError);
  const polling = useSelector(selectScanPolling);

  /**
   * Poll scan progress every 2 seconds
   */
  const startPolling = useCallback(() => {
    dispatch(setPolling(true));

    const interval = setInterval(() => {
      dispatch(fetchScanProgress());
    }, 2000);

    return () => clearInterval(interval);
  }, [dispatch]);

  /**
   * Stop polling
   */
  const stopPolling = useCallback(() => {
    dispatch(setPolling(false));
  }, [dispatch]);

  /**
   * Handle retry
   */
  const handleRetry = () => {
    dispatch(clearError());
    dispatch(retryScan());
  };

  /**
   * Start/stop polling based on scan status
   */
  useEffect(() => {
    if (!progress) {
      // No progress data yet, fetch once
      dispatch(fetchScanProgress());
      return;
    }

    // Start polling if scanning
    if (progress.status === 'scanning' && !polling) {
      const cleanup = startPolling();
      return cleanup;
    }

    // Stop polling if completed or failed
    if ((progress.status === 'completed' || progress.status === 'failed') && polling) {
      stopPolling();
    }
  }, [progress, polling, dispatch, startPolling, stopPolling]);

  /**
   * Error state
   */
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-red-800 mb-2">
          파일 스캔 중 오류가 발생했습니다
        </h3>
        <p className="text-red-700 mb-4">{error}</p>
        <div className="flex gap-2">
          <button
            onClick={handleRetry}
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '재시도 중...' : '재시도'}
          </button>
          <button
            onClick={() => dispatch(clearError())}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            나중에
          </button>
        </div>
      </div>
    );
  }

  /**
   * No progress data
   */
  if (!progress || progress.status === 'pending') {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <p className="text-blue-800">파일 스캔 대기 중...</p>
      </div>
    );
  }

  /**
   * Completed state
   */
  if (progress.status === 'completed') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-green-800 mb-2">
          스캔 완료! 🎉
        </h3>
        <p className="text-green-700">
          총 {progress.total}개의 문서를 발견했습니다. 그중 {progress.business}개가 비즈니스
          문서로 분류되었습니다.
        </p>
      </div>
    );
  }

  /**
   * Scanning state
   */
  const percentage = progress.total > 0 ? Math.round((progress.scanned / progress.total) * 100) : 0;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">파일 스캔 중...</h3>
        <span className="text-sm text-gray-600 font-medium">
          {progress.scanned}/{progress.total}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-4 mb-4 overflow-hidden">
        <div
          className="bg-blue-600 h-4 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Percentage */}
      <p className="text-sm text-gray-600 mb-2">{percentage}% 완료</p>

      {/* Estimated Time */}
      {progress.estimatedTimeRemaining && (
        <p className="text-sm text-gray-600 mb-2">약 {progress.estimatedTimeRemaining} 남음</p>
      )}

      {/* Business Document Count */}
      <p className="text-sm text-gray-600">
        비즈니스 문서: <span className="font-semibold">{progress.business}개</span>
      </p>
    </div>
  );
};
