import { useEffect, useState } from 'react';
import {
  Users,
  FileText,
  TrendingUp,
  BarChart3,
  Activity,
  Shield,
  Bug,
  Download,
  Trash2,
  Search,
  Heart,
  Cpu,
  HardDrive,
  Database,
  Settings,
} from 'lucide-react';
import dashboardService from '../api/dashboard';
import * as auditApi from '../api/audit';
import * as healthApi from '../api/health';
import { toast } from 'react-toastify';

interface AdminStats {
  totalUsers: number;
  totalTeams: number;
  totalDocuments: number;
  activeUsers: number;
  premiumSubscriptions: number;
}

const AdminDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'audit' | 'system' | 'health'>(
    'overview'
  );
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Audit logs state
  const [auditLogs, setAuditLogs] = useState<auditApi.AuditLog[]>([]);
  const [auditTotal, setAuditTotal] = useState(0);
  const [auditPage, setAuditPage] = useState(0);
  const [auditStats, setAuditStats] = useState<auditApi.AuditStatistics | null>(null);

  // System logs state
  const [systemLogs, setSystemLogs] = useState<auditApi.SystemLog[]>([]);
  const [systemTotal, setSystemTotal] = useState(0);
  const [systemPage, setSystemPage] = useState(0);

  // Health monitoring state
  const [healthStatus, setHealthStatus] = useState<healthApi.HealthStatus | null>(null);
  const [systemInfo, setSystemInfo] = useState<healthApi.SystemInfo | null>(null);
  const [thresholds, setThresholds] = useState<healthApi.HealthThresholds | null>(null);

  useEffect(() => {
    fetchAdminStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'audit') {
      fetchAuditLogs();
      fetchAuditStatistics();
    } else if (activeTab === 'system') {
      fetchSystemLogs();
    } else if (activeTab === 'health') {
      fetchHealthData();
    }
  }, [activeTab, auditPage, systemPage]);

  const fetchAuditLogs = async () => {
    try {
      const result = await auditApi.getAuditLogs({ limit: 50, offset: auditPage * 50 });
      setAuditLogs(result.logs);
      setAuditTotal(result.total);
    } catch (error) {
      toast.error('감사 로그를 불러오는데 실패했습니다.');
    }
  };

  const fetchAuditStatistics = async () => {
    try {
      const stats = await auditApi.getAuditStatistics(30);
      setAuditStats(stats);
    } catch (error) {
      console.error('Failed to fetch audit statistics:', error);
    }
  };

  const fetchSystemLogs = async () => {
    try {
      const result = await auditApi.getSystemLogs({ limit: 50, offset: systemPage * 50 });
      setSystemLogs(result.logs);
      setSystemTotal(result.total);
    } catch (error) {
      toast.error('시스템 로그를 불러오는데 실패했습니다.');
    }
  };

  const handleExportAuditLogs = () => {
    auditApi.exportAuditLogs();
    toast.success('감사 로그 내보내기 시작...');
  };

  const handleCleanupLogs = async () => {
    if (!confirm('90일 이상 된 로그를 삭제하시겠습니까?')) return;

    try {
      const result = await auditApi.cleanupOldLogs(90);
      toast.success(
        `${result.auditLogsDeleted}개의 감사 로그와 ${result.systemLogsDeleted}개의 시스템 로그를 삭제했습니다.`
      );
      fetchAuditLogs();
      fetchSystemLogs();
    } catch (error) {
      toast.error('로그 삭제에 실패했습니다.');
    }
  };

  const fetchHealthData = async () => {
    try {
      const [status, info, thresh] = await Promise.all([
        healthApi.getHealthStatus(),
        healthApi.getSystemInfo(),
        healthApi.getThresholds(),
      ]);
      setHealthStatus(status);
      setSystemInfo(info);
      setThresholds(thresh);
    } catch (error) {
      console.error('Failed to fetch health data:', error);
      toast.error('시스템 상태를 불러오는데 실패했습니다.');
    }
  };

  const fetchAdminStats = async () => {
    try {
      setLoading(true);
      const data = await dashboardService.getAdminDashboardStats();
      setStats(data);
    } catch (error: any) {
      toast.error('관리자 데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">관리자 대시보드</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            플랫폼 전체의 현황과 사용자 활동을 한눈에 확인하세요.
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <TrendingUp className="w-4 h-4 inline mr-2" />
              개요
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'audit'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Shield className="w-4 h-4 inline mr-2" />
              감사 로그
            </button>
            <button
              onClick={() => setActiveTab('system')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'system'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Bug className="w-4 h-4 inline mr-2" />
              시스템 로그
            </button>
            <button
              onClick={() => setActiveTab('health')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'health'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Heart className="w-4 h-4 inline mr-2" />
              시스템 상태
            </button>
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && stats && (
          <>
            {/* Overview Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm text-gray-500 dark:text-gray-400">전체 사용자</span>
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {stats.totalUsers}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <Users className="w-8 h-8 text-green-600 dark:text-green-400" />
                  <span className="text-sm text-gray-500 dark:text-gray-400">활동 사용자</span>
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {stats.activeUsers}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">지난 7일</p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <FileText className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                  <span className="text-sm text-gray-500 dark:text-gray-400">전체 문서</span>
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {stats.totalDocuments}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <Activity className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                  <span className="text-sm text-gray-500 dark:text-gray-400">전체 팀</span>
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {stats.totalTeams}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <BarChart3 className="w-8 h-8 text-pink-600 dark:text-pink-400" />
                  <span className="text-sm text-gray-500 dark:text-gray-400">프리미엄</span>
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {stats.premiumSubscriptions}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">구독자</p>
              </div>
            </div>

            {/* User Growth Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                <TrendingUp className="w-5 h-5 inline mr-2 text-blue-600 dark:text-blue-400" />
                사용자 증가 추이 (최근 30일)
              </h2>
              <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-gray-500 dark:text-gray-400">
                  📊 차트 구현 예정 (실시간 데이터 연결 필요)
                </p>
              </div>
            </div>

            {/* Activity Heatmap */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                <Activity className="w-5 h-5 inline mr-2 text-green-600 dark:text-green-400" />
                팀별 활동 히맵
              </h2>
              <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-gray-500 dark:text-gray-400">
                  🗺️ 히맵 구현 예정 (실시간 데이터 연결 필요)
                </p>
              </div>
            </div>
          </>
        )}

        {/* Audit Logs Tab */}
        {activeTab === 'audit' && (
          <>
            {/* Audit Statistics */}
            {auditStats && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">총 액션 수 (30일)</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {auditStats.totalActions}
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    가장 활발한 사용자
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {auditStats.actionsByUser[0]?.userName || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {auditStats.actionsByUser[0]?.count || 0} 회
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">가장 많은 액션</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {auditStats.actionsByEntity[0]?.entity || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {auditStats.actionsByEntity[0]?.count || 0} 회
                  </p>
                </div>
              </div>
            )}

            {/* Audit Logs */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  <Shield className="w-5 h-5 inline mr-2 text-blue-600 dark:text-blue-400" />
                  감사 로그
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={handleExportAuditLogs}
                    className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center gap-1"
                  >
                    <Download className="w-4 h-4" />
                    내보내기
                  </button>
                  <button
                    onClick={handleCleanupLogs}
                    className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm flex items-center gap-1"
                  >
                    <Trash2 className="w-4 h-4" />
                    오래된 로그 정리
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        시간
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        사용자
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        액션
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        엔티티
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        IP 주소
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                          {new Date(log.created_at).toLocaleString('ko-KR')}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                          <div>
                            <div className="font-medium">{log.user_name || '알 수 없음'}</div>
                            <div className="text-xs text-gray-500">{log.user_email || ''}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                            {log.action}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                          {log.entity}:{log.entity_id?.slice(0, 8)}...
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                          {log.ip_address || '-'}
                        </td>
                      </tr>
                    ))}
                    {auditLogs.length === 0 && (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                        >
                          감사 로그가 없습니다.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {auditTotal > 50 && (
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    총 {auditTotal}개 중 {auditPage * 50 + 1}-
                    {Math.min((auditPage + 1) * 50, auditTotal)}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setAuditPage(Math.max(0, auditPage - 1))}
                      disabled={auditPage === 0}
                      className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50"
                    >
                      이전
                    </button>
                    <button
                      onClick={() => setAuditPage(auditPage + 1)}
                      disabled={(auditPage + 1) * 50 >= auditTotal}
                      className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50"
                    >
                      다음
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* System Logs Tab */}
        {activeTab === 'system' && (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  <Bug className="w-5 h-5 inline mr-2 text-orange-600 dark:text-orange-400" />
                  시스템 로그
                </h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        시간
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        레벨
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        서비스
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        메시지
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        사용자
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {systemLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                          {new Date(log.created_at).toLocaleString('ko-KR')}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              log.level === 'error'
                                ? 'bg-red-100 text-red-800'
                                : log.level === 'warn'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : log.level === 'debug'
                                    ? 'bg-gray-100 text-gray-800'
                                    : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {log.level}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                          {log.service}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white max-w-md truncate">
                          {log.message}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                          {log.user_email || '-'}
                        </td>
                      </tr>
                    ))}
                    {systemLogs.length === 0 && (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                        >
                          시스템 로그가 없습니다.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {systemTotal > 50 && (
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    총 {systemTotal}개 중 {systemPage * 50 + 1}-
                    {Math.min((systemPage + 1) * 50, systemTotal)}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSystemPage(Math.max(0, systemPage - 1))}
                      disabled={systemPage === 0}
                      className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50"
                    >
                      이전
                    </button>
                    <button
                      onClick={() => setSystemPage(systemPage + 1)}
                      disabled={(systemPage + 1) * 50 >= systemTotal}
                      className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50"
                    >
                      다음
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Health Tab */}
        {activeTab === 'health' && healthStatus && systemInfo && (
          <>
            {/* Overall Health Status */}
            <div
              className={`bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6 ${
                healthStatus.healthy ? 'border-l-4 border-green-500' : 'border-l-4 border-red-500'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Heart
                      className={`w-6 h-6 ${healthStatus.healthy ? 'text-green-600' : 'text-red-600'}`}
                    />
                    시스템 상태: {healthStatus.healthy ? '정상' : '경고'}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    마지막 업데이트:{' '}
                    {new Date(healthStatus.metrics.timestamp).toLocaleString('ko-KR')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500 dark:text-gray-400">가동 시간</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {Math.floor(healthStatus.metrics.uptime / 86400)}일{' '}
                    {Math.floor((healthStatus.metrics.uptime % 86400) / 3600)}시간
                  </p>
                </div>
              </div>

              {/* Alerts */}
              {healthStatus.alerts.length > 0 && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <p className="font-semibold text-red-900 dark:text-red-300 mb-2">경고:</p>
                  <ul className="list-disc list-inside text-red-800 dark:text-red-400 space-y-1">
                    {healthStatus.alerts.map((alert, index) => (
                      <li key={index}>{alert}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Health Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {/* CPU */}
              <div
                className={`bg-white dark:bg-gray-800 rounded-lg shadow p-4 ${
                  healthStatus.metrics.cpu.usage >= (thresholds?.cpu.critical || 90)
                    ? 'border-l-4 border-red-500'
                    : healthStatus.metrics.cpu.usage >= (thresholds?.cpu.warning || 70)
                      ? 'border-l-4 border-yellow-500'
                      : 'border-l-4 border-green-500'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold text-gray-900 dark:text-white">CPU</span>
                  </div>
                  <span
                    className={`text-2xl font-bold ${
                      healthStatus.metrics.cpu.usage >= 90
                        ? 'text-red-600'
                        : healthStatus.metrics.cpu.usage >= 70
                          ? 'text-yellow-600'
                          : 'text-green-600'
                    }`}
                  >
                    {healthStatus.metrics.cpu.usage.toFixed(1)}%
                  </span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <p>코어: {healthStatus.metrics.cpu.cores}</p>
                  <p>
                    Load: {healthStatus.metrics.cpu.loadAverage.map((l) => l.toFixed(2)).join(', ')}
                  </p>
                </div>
              </div>

              {/* Memory */}
              <div
                className={`bg-white dark:bg-gray-800 rounded-lg shadow p-4 ${
                  healthStatus.metrics.memory.usage >= (thresholds?.memory.critical || 95)
                    ? 'border-l-4 border-red-500'
                    : healthStatus.metrics.memory.usage >= (thresholds?.memory.warning || 80)
                      ? 'border-l-4 border-yellow-500'
                      : 'border-l-4 border-green-500'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-5 h-5 text-purple-600" />
                    <span className="font-semibold text-gray-900 dark:text-white">메모리</span>
                  </div>
                  <span
                    className={`text-2xl font-bold ${
                      healthStatus.metrics.memory.usage >= 95
                        ? 'text-red-600'
                        : healthStatus.metrics.memory.usage >= 80
                          ? 'text-yellow-600'
                          : 'text-green-600'
                    }`}
                  >
                    {healthStatus.metrics.memory.usage.toFixed(1)}%
                  </span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <p>
                    사용: {(healthStatus.metrics.memory.used / 1024 / 1024 / 1024).toFixed(2)} GB
                  </p>
                  <p>
                    전체: {(healthStatus.metrics.memory.total / 1024 / 1024 / 1024).toFixed(2)} GB
                  </p>
                </div>
              </div>

              {/* Database */}
              <div
                className={`bg-white dark:bg-gray-800 rounded-lg shadow p-4 ${
                  !healthStatus.metrics.database.connected
                    ? 'border-l-4 border-red-500'
                    : healthStatus.metrics.database.latency >=
                        (thresholds?.databaseLatency.critical || 500)
                      ? 'border-l-4 border-red-500'
                      : healthStatus.metrics.database.latency >=
                          (thresholds?.databaseLatency.warning || 100)
                        ? 'border-l-4 border-yellow-500'
                        : 'border-l-4 border-green-500'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-gray-900 dark:text-white">
                      데이터베이스
                    </span>
                  </div>
                  <span
                    className={`text-2xl font-bold ${
                      !healthStatus.metrics.database.connected
                        ? 'text-red-600'
                        : healthStatus.metrics.database.latency >= 500
                          ? 'text-red-600'
                          : healthStatus.metrics.database.latency >= 100
                            ? 'text-yellow-600'
                            : 'text-green-600'
                    }`}
                  >
                    {healthStatus.metrics.database.latency}ms
                  </span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <p>상태: {healthStatus.metrics.database.connected ? '연결됨' : '연결 안됨'}</p>
                  <p>
                    Pool: {healthStatus.metrics.database.pool.idle}/
                    {healthStatus.metrics.database.pool.total}
                  </p>
                </div>
              </div>

              {/* System Info */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border-l-4 border-gray-500">
                <div className="flex items-center gap-2 mb-2">
                  <Settings className="w-5 h-5 text-gray-600" />
                  <span className="font-semibold text-gray-900 dark:text-white">시스템 정보</span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <p>
                    OS: {systemInfo.platform} {systemInfo.architecture}
                  </p>
                  <p>Node: {systemInfo.nodeVersion}</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;
