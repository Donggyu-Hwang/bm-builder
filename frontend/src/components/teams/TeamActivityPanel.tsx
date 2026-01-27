import { useState, useEffect } from 'react';
import { Activity, TrendingUp, FileText, Users, BarChart3 } from 'lucide-react';
import activityService, { ActivityLogWithUser, TeamActivityStats } from '../../api/activity';

interface TeamActivityPanelProps {
  teamId: string;
}

const TeamActivityPanel: React.FC<TeamActivityPanelProps> = ({ teamId }) => {
  const [stats, setStats] = useState<TeamActivityStats | null>(null);
  const [activities, setActivities] = useState<ActivityLogWithUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivityData();
  }, [teamId]);

  const fetchActivityData = async () => {
    setLoading(true);
    try {
      const [statsData, activitiesData] = await Promise.all([
        activityService.getTeamActivityStats(teamId),
        activityService.getTeamActivityLogs(teamId, { limit: 10 }),
      ]);
      setStats(statsData);
      setActivities(activitiesData.activities);
    } catch (error) {
      console.error('Failed to fetch activity data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      created: '생성',
      edited: '수정',
      commented: '댓글',
      shared: '공유',
      deleted: '삭제',
      invited: '초대',
      joined: '참여',
      role_changed: '역할 변경',
    };
    return labels[action] || action;
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'created':
        return <FileText className="w-4 h-4 text-green-500" />;
      case 'edited':
        return <Activity className="w-4 h-4 text-blue-500" />;
      case 'commented':
        return <Activity className="w-4 h-4 text-purple-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 50) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">팀 활동</h3>
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">팀 활동</h3>

      {stats && (
        <>
          {/* Metrics Overview */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {stats.metrics.trend}
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.metrics.total_documents}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">전체 문서</p>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <Users className="w-5 h-5 text-green-600 dark:text-green-400 mb-2" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.metrics.active_members}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">활동 멤버 (7일)</p>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
              <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400 mb-2" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.metrics.this_week.documents_created}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">이번 주 생성</p>
            </div>
          </div>

          {/* Health Score */}
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                팀 건강 점수
              </span>
              <span className={`text-2xl font-bold ${getHealthScoreColor(stats.health_score)}`}>
                {stats.health_score}
              </span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{stats.health_status}</p>
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  stats.health_score >= 80
                    ? 'bg-green-500'
                    : stats.health_score >= 50
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                }`}
                style={{ width: `${stats.health_score}%` }}
              />
            </div>
          </div>

          {/* Recommendations */}
          {stats.recommendations.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                추천 활동
              </h4>
              <ul className="space-y-1">
                {stats.recommendations.map((rec, index) => (
                  <li
                    key={index}
                    className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-2"
                  >
                    <span>•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Most Active Members */}
          {stats.most_active_members.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                가장 활발한 팀원
              </h4>
              <div className="space-y-2">
                {stats.most_active_members.map((member, index) => (
                  <div key={member.user_id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 dark:text-gray-400">{index + 1}.</span>
                      <span className="text-gray-900 dark:text-white">
                        {member.full_name || member.email}
                      </span>
                    </div>
                    <span className="text-gray-600 dark:text-gray-400">
                      {member.activity_count} 활동
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Recent Activity Feed */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">최근 활동</h4>
        {activities.length === 0 ? (
          <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
            활동 내역이 없습니다.
          </div>
        ) : (
          <div className="space-y-3">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 text-sm">
                <div className="mt-0.5">{getActionIcon(activity.action)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-900 dark:text-white">
                    <span className="font-medium">{activity.full_name || '사용자'}</span>님이{' '}
                    {getActionLabel(activity.action)}했습니다
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(activity.created_at).toLocaleDateString('ko-KR', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamActivityPanel;
