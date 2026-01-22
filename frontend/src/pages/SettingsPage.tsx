import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { resetOnboarding } from '@/store/slices/onboardingSlice';
import { openWelcome } from '@/store/slices/welcomeSlice';
import {
  checkConnectionStatus,
  selectIsConnected,
  selectIsConnecting,
  selectIsDisconnecting,
  selectIsReconnecting,
  selectGoogleDriveError,
  reconnectGoogleDrive,
  clearError
} from '@/store/slices/googleDriveSlice';
import { DisconnectGoogleDriveModal } from '@/components/settings/DisconnectGoogleDriveModal';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Navigation } from '@/components/navigation/Navigation';

export const SettingsPage = () => {
  const dispatch = useAppDispatch();
  const [showConfirm, setShowConfirm] = useState(false);
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);

  // Google Drive state
  const isConnected = useAppSelector(selectIsConnected);
  const isConnecting = useAppSelector(selectIsConnecting);
  const isDisconnecting = useAppSelector(selectIsDisconnecting);
  const isReconnecting = useAppSelector(selectIsReconnecting);
  const error = useAppSelector(selectGoogleDriveError);

  useEffect(() => {
    // Check connection status on mount
    dispatch(checkConnectionStatus());
  }, [dispatch]);

  const handleResetOnboarding = async () => {
    await dispatch(resetOnboarding());
    window.location.href = '/onboarding';
  };

  const handleShowWelcome = () => {
    dispatch(openWelcome());
  };

  const handleDisconnect = () => {
    setShowDisconnectModal(true);
  };

  const handleReconnect = async () => {
    await dispatch(reconnectGoogleDrive());
    // Redirect happens automatically
  };

  const handleClearError = () => {
    dispatch(clearError());
  };

  return (
    <>
      {/* Navigation */}
      <Navigation />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="px-0 py-6 sm:px-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6 sm:mb-8">설정</h1>

            {/* Error Message */}
            {error && (
              <div className="mb-4 sm:mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 sm:p-4 flex justify-between items-center">
                <div className="flex-1 pr-4">
                  <h3 className="text-red-900 dark:text-red-400 font-semibold text-sm sm:text-base">오류</h3>
                  <p className="text-red-700 dark:text-red-300 text-xs sm:text-sm">{error}</p>
                </div>
                <button
                  onClick={handleClearError}
                  className="text-red-700 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 text-xl flex-shrink-0"
                  aria-label="오류 메시지 닫기"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Theme Preferences Section */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
              <h2 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-3 sm:mb-4">
                테마 설정
              </h2>

              <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base mb-3 sm:mb-4">
                앱의 테마를 선택하세요. 시스템 설정을 따르거나 라이트/다크 모드를 고정할 수 있습니다.
              </p>

              <ThemeToggle />
            </div>

            {/* Google Drive Integration Section */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
              <h2 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-3 sm:mb-4">
                Google Drive 연동
              </h2>

              <div className="space-y-3 sm:space-y-4">
                {/* Connection Status */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">연동 상태</h3>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {isConnected ? (
                        <span className="text-green-600 dark:text-green-400">
                          ✓ Google Drive가 연동되어 있습니다
                        </span>
                      ) : (
                        <span className="text-gray-600 dark:text-gray-400">
                          Google Drive가 연동되지 않았습니다
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    {isConnected ? (
                      <>
                        <button
                          onClick={handleReconnect}
                          disabled={isReconnecting}
                          className="px-3 sm:px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
                        >
                          {isReconnecting ? '재연동 중...' : '재연동'}
                        </button>
                        <button
                          onClick={handleDisconnect}
                          disabled={isDisconnecting}
                          className="px-3 sm:px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed transition-colors"
                        >
                          {isDisconnecting ? '연동 해제 중...' : '연동 해제'}
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={handleReconnect}
                        disabled={isConnecting}
                        className="px-3 sm:px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-colors"
                      >
                        {isConnecting ? '연결 중...' : 'Google Drive 연동'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 sm:p-4">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-400 mb-2 text-sm sm:text-base">Google Drive 연동 정보</h4>
                  <ul className="text-xs sm:text-sm text-blue-800 dark:text-blue-300 space-y-1">
                    <li>• PDF, HWP, DOCX 파일을 자동으로 스캔합니다</li>
                    <li>• 비즈니스 문서를 자동으로 분류합니다</li>
                    <li>• 연동 해제 시 모든 스캔 데이터가 삭제됩니다</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Show Welcome Section */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
              <h2 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-3 sm:mb-4">
                환영 메시지
              </h2>

              <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base mb-3 sm:mb-4">
                처음 환영 메시지를 다시 볼 수 있습니다.
              </p>

              <button
                onClick={handleShowWelcome}
                className="px-3 sm:px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                환영 메시지 다시 보기
              </button>
            </div>

            {/* Reset Onboarding Section */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-3 sm:mb-4">
                온보딩 재설정
              </h2>

              <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base mb-3 sm:mb-4">
                온보딩을 다시 시작하면 기존 답변이 모두 삭제되고 처음부터 다시 시작하게 됩니다.
              </p>

              {!showConfirm ? (
                <button
                  onClick={() => setShowConfirm(true)}
                  className="px-3 sm:px-4 py-2 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  온보딩 다시하기
                </button>
              ) : (
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={handleResetOnboarding}
                    className="px-3 sm:px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    확인
                  </button>
                  <button
                    onClick={() => setShowConfirm(false)}
                    className="px-3 sm:px-4 py-2 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    취소
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Disconnect Confirmation Modal */}
      <DisconnectGoogleDriveModal
        isOpen={showDisconnectModal}
        onClose={() => setShowDisconnectModal(false)}
      />
    </>
  );
};
