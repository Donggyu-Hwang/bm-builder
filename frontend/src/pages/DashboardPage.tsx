import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loadPriorities, generatePriorities, selectPriorities } from '@/store/slices/prioritiesSlice';
import { selectOnboarding } from '@/store/slices/onboardingSlice';
import { selectGoogleDrive } from '@/store/slices/googleDriveSlice';
import { WelcomeModal } from '@/components/welcome/WelcomeModal';
import { PrioritiesList } from '@/components/priorities/PrioritiesList';
import { ScanProgress } from '@/components/fileScan/ScanProgress';
import { Navigation } from '@/components/navigation/Navigation';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const dispatch = useAppDispatch();
  const { items, loading: prioritiesLoading } = useAppSelector(selectPriorities);
  const { responses } = useAppSelector(selectOnboarding);
  const { googleDriveConnected } = useAppSelector(selectGoogleDrive);

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        navigate('/login', { replace: true });
      } else if (!user.onboarding_completed) {
        navigate('/onboarding', { replace: true });
      }
    }
  }, [user, isLoading, navigate]);

  useEffect(() => {
    // Load existing priorities when user is authenticated
    if (user && user.onboarding_completed) {
      dispatch(loadPriorities());
    }
  }, [dispatch, user]);

  useEffect(() => {
    // Generate AI priorities if:
    // 1. User has completed onboarding
    // 2. No priorities exist
    // 3. Not currently loading
    // 4. Onboarding responses are available
    if (
      user &&
      user.onboarding_completed &&
      items.length === 0 &&
      !prioritiesLoading &&
      responses.vision &&
      responses.target_customer &&
      responses.current_stage
    ) {
      dispatch(
        generatePriorities({
          vision: responses.vision,
          target_customer: responses.target_customer,
          current_stage: responses.current_stage,
        })
      );
    }
  }, [dispatch, user, items.length, prioritiesLoading, responses]);

  if (isLoading || !user || !user.onboarding_completed) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">로딩 중...</div>;
  }

  return (
    <>
      {/* Navigation */}
      <Navigation />

      {/* Welcome Modal */}
      <WelcomeModal />

      {/* Dashboard Content */}
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="px-0 sm:px-0">
            {/* Header */}
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">대시보드</h1>
              <p className="mt-2 text-base sm:text-lg text-gray-600">
                환영합니다, {user.full_name || user.email}님!
              </p>
            </div>

            {/* File Scan Progress Section */}
            {googleDriveConnected && (
              <div className="mt-6 sm:mt-8">
                <ScanProgress />
              </div>
            )}

            {/* Priorities Section */}
            <div className="mt-6 sm:mt-8">
              <PrioritiesList />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
