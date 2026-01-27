import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  loadPriorities,
  generatePriorities,
  selectPriorities,
} from '@/store/slices/prioritiesSlice';
import { selectOnboarding } from '@/store/slices/onboardingSlice';
import { selectGoogleDrive } from '@/store/slices/googleDriveSlice';
import { WelcomeModal } from '@/components/welcome/WelcomeModal';
import { PrioritiesList } from '@/components/priorities/PrioritiesList';
import { ScanProgress } from '@/components/fileScan/ScanProgress';
import { Navigation } from '@/components/navigation/Navigation';
import { DocumentCreationCTA } from '@/components/dashboard/DocumentCreationCTA';
import { AIProposalModal } from '@/components/dashboard/AIProposalModal';
import dashboardService from '../api/dashboard';
import { FileText, Users, TrendingUp, Target } from 'lucide-react';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const dispatch = useAppDispatch();
  const { items, loading: prioritiesLoading } = useAppSelector(selectPriorities);
  const { responses } = useAppSelector(selectOnboarding);
  const { googleDriveConnected } = useAppSelector(selectGoogleDrive);
  const isDemoMode = useAppSelector((state: any) => state.demo.isDemoMode);

  // MEDIUM FIX: Define proper types instead of 'any'
  interface DashboardStats {
    totalDocuments: number;
    draftDocuments: number;
    completedDocuments: number;
    teamCount: number;
    priorities: {
      high: number;
      medium: number;
      low: number;
    };
  }

  interface ProjectProgress {
    overallProgress: number;
    completedEpics: number;
    completedStories: number;
    totalStories: number;
  }

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [progress, setProgress] = useState<ProjectProgress | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [showAIProposal, setShowAIProposal] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setStatsLoading(true);
        const [statsData, progressData] = await Promise.all([
          dashboardService.getUserDashboardStats(),
          dashboardService.getProjectProgress(),
        ]);
        setStats(statsData);
        setProgress(progressData);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setStatsLoading(false);
      }
    };

    if (user && user.onboarding_completed) {
      fetchDashboardData();
    }
  }, [user]);

  useEffect(() => {
    if (!isLoading && !isDemoMode) {
      if (!user) {
        navigate('/login', { replace: true });
      } else if (!user.onboarding_completed) {
        navigate('/onboarding', { replace: true });
      }
    }
  }, [user, isLoading, navigate, isDemoMode]);

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

  // Show AI Proposal for first-time visitors after onboarding
  useEffect(() => {
    const hasSeenProposal = sessionStorage.getItem('aiProposalSeen');
    if (
      user &&
      user.onboarding_completed &&
      !hasSeenProposal &&
      stats &&
      stats.totalDocuments === 0
    ) {
      // Delay showing the modal for a better UX
      const timer = setTimeout(() => {
        setShowAIProposal(true);
        sessionStorage.setItem('aiProposalSeen', 'true');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [user, stats]);

  if (!isDemoMode && (isLoading || !user || !user.onboarding_completed)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">로딩 중...</div>
    );
  }

  return (
    <>
      {/* Navigation */}
      <Navigation />

      {/* Welcome Modal */}
      <WelcomeModal />

      {/* AI Proposal Modal */}
      {!isDemoMode && (
        <AIProposalModal
          vision={responses.vision}
          targetCustomer={responses.target_customer}
          currentStage={responses.current_stage}
          isOpen={showAIProposal}
          onClose={() => setShowAIProposal(false)}
          onCreateDocument={() => {
            setShowAIProposal(false);
            navigate('/create');
          }}
        />
      )}

      {/* Dashboard Content */}
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="px-0 sm:px-0">
            {/* Header */}
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                {isDemoMode ? '데모 모드' : '대시보드'}
              </h1>
              <p className="mt-2 text-base sm:text-lg text-gray-600 dark:text-gray-400">
                {isDemoMode
                  ? '데모 모드로 체험해보세요! 가입 후 모든 기능을 이용할 수 있습니다.'
                  : `환영합니다, ${user?.full_name || user?.email}님!`}
              </p>
            </div>

            {/* Document Creation CTA */}
            {!statsLoading && stats && (
              <DocumentCreationCTA totalDocuments={stats.totalDocuments} />
            )}

            {/* Stats Cards */}
            {!statsLoading && stats && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 sm:mb-8">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-2">
                    <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    <span className="text-xs text-gray-500 dark:text-gray-400">전체 문서</span>
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                    {stats.totalDocuments}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {stats.draftDocuments} 초안 / {stats.completedDocuments} 완료
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Users className="w-8 h-8 text-green-600 dark:text-green-400" />
                    <span className="text-xs text-gray-500 dark:text-gray-400">팀</span>
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                    {stats.teamCount}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">참여 중인 팀</p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Target className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                    <span className="text-xs text-gray-500 dark:text-gray-400">우선순위</span>
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                    {stats.priorities.high + stats.priorities.medium + stats.priorities.low}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    높음 {stats.priorities.high} / 중간 {stats.priorities.medium} / 낮음{' '}
                    {stats.priorities.low}
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-2">
                    <TrendingUp className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                    <span className="text-xs text-gray-500 dark:text-gray-400">진행률</span>
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                    {progress?.overallProgress || 0}%
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {progress?.completedStories || 0} / {progress?.totalStories || 0} 스토리 완료
                  </p>
                </div>
              </div>
            )}

            {/* Progress Section */}
            {!statsLoading && progress && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6 mb-6 sm:mb-8">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  프로젝트 진행 상황
                </h2>

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      전체 진행률
                    </span>
                    <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                      {progress.overallProgress}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${progress.overallProgress}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {progress.completedEpics}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">완료된 에픽</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {progress.completedStories}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">완료된 스토리</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {progress.totalStories - progress.completedStories}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">남은 스토리</p>
                  </div>
                </div>
              </div>
            )}

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
