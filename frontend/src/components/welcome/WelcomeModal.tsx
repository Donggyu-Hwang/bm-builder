import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  selectWelcomeIsOpen,
  checkWelcomeStatus,
  markWelcomeShown,
} from '@/store/slices/welcomeSlice';
import { selectOnboarding } from '@/store/slices/onboardingSlice';
import { selectUser } from '@/store/slices/authSlice';
import { WelcomeContent } from './WelcomeContent';

export const WelcomeModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector(selectWelcomeIsOpen);
  const { responses } = useAppSelector(selectOnboarding);
  const user = useAppSelector(selectUser);

  useEffect(() => {
    // Check if welcome should be shown
    if (user) {
      dispatch(checkWelcomeStatus());
    }
  }, [dispatch, user]);

  const handleClose = () => {
    dispatch(markWelcomeShown());
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    // Only close if clicking directly on backdrop
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen || !user) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full p-8 transform transition-all">
          {/* Content */}
          <WelcomeContent
            userName={user.full_name || user.email?.split('@')[0] || '사용자'}
            vision={responses.vision || '비즈니스 성공'}
            targetCustomer={responses.target_customer || '고객'}
            currentStage={responses.current_stage || 'idea'}
          />

          {/* Actions */}
          <div className="mt-8 flex justify-end space-x-4">
            <button
              onClick={handleClose}
              className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              시작하기 🚀
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
