import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, Mail, CheckCircle, XCircle } from 'lucide-react';
import { Navigation } from '../components/navigation/Navigation';
import teamsService, { TeamInvite } from '../api/teams';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-toastify';

const TeamInvitePage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [invite, setInvite] = useState<TeamInvite | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [rejecting, setRejecting] = useState(false);

  useEffect(() => {
    if (token) {
      fetchInvite();
    }
  }, [token]);

  const fetchInvite = async () => {
    if (!token) return;

    try {
      const data = await teamsService.getInviteByToken(token);
      setInvite(data);
    } catch (error: any) {
      toast.error('초대장을 찾을 수 없거나 만료되었습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!token || !user) {
      toast.error('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    setAccepting(true);
    try {
      await teamsService.acceptInvite(token);
      toast.success('팀에 참여했습니다!');
      navigate('/teams');
    } catch (error: any) {
      toast.error(error.response?.data?.error || '팀 참여에 실패했습니다.');
    } finally {
      setAccepting(false);
    }
  };

  const handleReject = async () => {
    if (!token) return;

    setRejecting(true);
    try {
      await teamsService.rejectInvite(token);
      toast.info('초대를 거절했습니다.');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error('초대 거절에 실패했습니다.');
    } finally {
      setRejecting(false);
    }
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      admin: '관리자',
      editor: '편집자',
      viewer: '조회자',
    };
    return labels[role] || role;
  };

  if (loading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">초대장을 불러오는 중...</p>
          </div>
        </div>
      </>
    );
  }

  if (!invite) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-md mx-4 text-center">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              초대장을 찾을 수 없습니다
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              초대장이 만료되었거나 존재하지 않습니다.
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              대시보드로 이동
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 text-center">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-blue-600 dark:text-blue-200" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">팀 초대</h1>
            <p className="text-gray-600 dark:text-gray-400">
              <Mail className="w-4 h-4 inline mr-1" />
              누군가 당신을 팀에 초대했습니다
            </p>
          </div>

          {/* Team Info */}
          <div className="p-6 space-y-4">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                {invite.team_name}
              </h2>
              {invite.team_description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {invite.team_description}
                </p>
              )}
              <div className="flex items-center gap-2 text-sm">
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded-full font-medium">
                  {getRoleLabel(invite.role)}로 초대됨
                </span>
              </div>
            </div>

            {invite.personal_message && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                  "{invite.personal_message}"
                </p>
              </div>
            )}

            {invite.inviter_name && (
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                <span className="font-medium">{invite.inviter_name}</span> 님이 초대했습니다
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700">
            {!user ? (
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  초대를 수락하려면 먼저 로그인해주세요.
                </p>
                <button
                  onClick={() => navigate('/login')}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  로그인하기
                </button>
              </div>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={handleReject}
                  disabled={rejecting || accepting}
                  className="flex-1 px-4 py-3 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {rejecting ? '처리 중...' : '거절'}
                </button>
                <button
                  onClick={handleAccept}
                  disabled={accepting || rejecting}
                  className="flex-1 px-4 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {accepting ? (
                    '처리 중...'
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      수락하기
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 pb-6 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              이 초대장은 {new Date(invite.expires_at).toLocaleDateString('ko-KR')}에 만료됩니다
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default TeamInvitePage;
