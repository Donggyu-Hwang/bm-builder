import { useEffect, useState } from 'react';
import { Users, Plus, Settings, Trash2, Mail, Crown, Edit, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '../components/navigation/Navigation';
import teamsService, { Team, TeamMember } from '../api/teams';
import CreateTeamModal from '../components/teams/CreateTeamModal';
import InviteTeamMemberModal from '../components/teams/InviteTeamMemberModal';
import RoleChangeModal from '../components/teams/RoleChangeModal';
import TeamActivityPanel from '../components/teams/TeamActivityPanel';
import DeleteConfirmationModal from '../components/common/DeleteConfirmationModal';
import { toast } from 'react-toastify';

const TeamManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showRoleChangeModal, setShowRoleChangeModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState<Team | null>(null);
  const [memberToDelete, setMemberToDelete] = useState<TeamMember | null>(null);
  const [memberToChangeRole, setMemberToChangeRole] = useState<TeamMember | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const data = await teamsService.getTeams();
      setTeams(data);
      if (data.length > 0 && !selectedTeam) {
        handleTeamSelect(data[0]);
      }
    } catch (error: any) {
      toast.error('팀 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamMembers = async (teamId: string) => {
    try {
      const data = await teamsService.getTeamMembers(teamId);
      setMembers(data);
    } catch (error: any) {
      toast.error('팀원 목록을 불러오는데 실패했습니다.');
    }
  };

  const handleTeamSelect = async (team: Team) => {
    setSelectedTeam(team);
    await fetchTeamMembers(team.id);
  };

  const handleTeamCreated = async (team: Team) => {
    setTeams((prev) => [team, ...prev]);
    await handleTeamSelect(team);
  };

  const handleInvitesSent = async () => {
    if (selectedTeam) {
      await fetchTeamMembers(selectedTeam.id);
    }
  };

  const handleDeleteTeam = async () => {
    if (!teamToDelete) return;

    setIsDeleting(true);
    try {
      await teamsService.deleteTeam(teamToDelete.id);
      toast.success('팀이 삭제되었습니다.');
      setTeams((prev) => prev.filter((t) => t.id !== teamToDelete.id));
      if (selectedTeam?.id === teamToDelete.id) {
        setSelectedTeam(null);
        setMembers([]);
      }
      setShowDeleteModal(false);
      setTeamToDelete(null);
    } catch (error: any) {
      toast.error(error.response?.data?.error || '팀 삭제에 실패했습니다.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!memberToDelete || !selectedTeam) return;

    setIsDeleting(true);
    try {
      await teamsService.removeMember(selectedTeam.id, memberToDelete.id);
      toast.success('팀원이 제거되었습니다.');
      await fetchTeamMembers(selectedTeam.id);
      setShowDeleteModal(false);
      setMemberToDelete(null);
    } catch (error: any) {
      toast.error(error.response?.data?.error || '팀원 제거에 실패했습니다.');
    } finally {
      setIsDeleting(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'editor':
        return <Edit className="w-4 h-4 text-blue-500" />;
      case 'viewer':
        return <Eye className="w-4 h-4 text-gray-500" />;
      default:
        return null;
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

  return (
    <>
      {/* Navigation */}
      <Navigation />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">팀 관리</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              팀을 생성하고 팀원을 초대하여 협업하세요
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Teams List */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">내 팀</h2>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    title="새 팀 만들기"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>

                <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-96 overflow-y-auto">
                  {loading ? (
                    <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                      로딩 중...
                    </div>
                  ) : teams.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                      <Users className="w-12 h-12 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                      <p className="text-sm">팀이 없습니다.</p>
                      <button
                        onClick={() => setShowCreateModal(true)}
                        className="mt-2 text-sm text-blue-600 hover:text-blue-700"
                      >
                        첫 번째 팀 만들기
                      </button>
                    </div>
                  ) : (
                    teams.map((team) => (
                      <button
                        key={team.id}
                        onClick={() => handleTeamSelect(team)}
                        className={`w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                          selectedTeam?.id === team.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 dark:text-white truncate">
                              {team.name}
                            </h3>
                            {team.description && (
                              <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-1">
                                {team.description}
                              </p>
                            )}
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                              {team.member_count || 0}명의 팀원
                            </p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setTeamToDelete(team);
                              setShowDeleteModal(true);
                            }}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                            title="팀 삭제"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Team Details */}
            <div className="lg:col-span-2">
              {selectedTeam ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {selectedTeam.name}
                      </h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {selectedTeam.description || '설명 없음'}
                      </p>
                    </div>
                    <button
                      onClick={() => setShowInviteModal(true)}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Mail className="w-4 h-4" />
                      팀원 초대
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Members Section */}
                    <div>
                      <div className="p-4">
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                          팀원 ({members.length})
                        </h3>

                        {members.length === 0 ? (
                          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            <Users className="w-12 h-12 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                            <p className="text-sm">팀원이 없습니다.</p>
                            <button
                              onClick={() => setShowInviteModal(true)}
                              className="mt-2 text-sm text-blue-600 hover:text-blue-700"
                            >
                              첫 번째 팀원 초대하기
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-2 max-h-96 overflow-y-auto">
                            {members.map((member) => (
                              <div
                                key={member.id}
                                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                    <span className="text-sm font-medium text-blue-600 dark:text-blue-200">
                                      {member.full_name?.charAt(0) ||
                                        member.email?.charAt(0) ||
                                        '?'}
                                    </span>
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                      {member.full_name || '이름 없음'}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                      {member.email}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => {
                                      setMemberToChangeRole(member);
                                      setShowRoleChangeModal(true);
                                    }}
                                    className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
                                    title="역할 변경"
                                  >
                                    {getRoleIcon(member.role)}
                                    <span>{getRoleLabel(member.role)}</span>
                                  </button>
                                  {member.status === 'pending' && (
                                    <span className="px-2 py-1 text-xs font-medium bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-full">
                                      대기 중
                                    </span>
                                  )}
                                  <button
                                    onClick={() => {
                                      setMemberToDelete(member);
                                      setShowDeleteModal(true);
                                    }}
                                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                    title="팀원 제거"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Activity Panel */}
                    <div>
                      <TeamActivityPanel teamId={selectedTeam.id} />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
                  <Users className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    팀을 선택하세요
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    팀을 선택하거나 새 팀을 만들어 시작하세요
                  </p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />새 팀 만들기
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modals */}
        <CreateTeamModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onTeamCreated={handleTeamCreated}
        />

        {selectedTeam && (
          <InviteTeamMemberModal
            isOpen={showInviteModal}
            onClose={() => setShowInviteModal(false)}
            teamId={selectedTeam.id}
            teamName={selectedTeam.name}
            onInvitesSent={handleInvitesSent}
          />
        )}

        {selectedTeam && memberToChangeRole && (
          <RoleChangeModal
            isOpen={showRoleChangeModal}
            onClose={() => {
              setShowRoleChangeModal(false);
              setMemberToChangeRole(null);
            }}
            teamId={selectedTeam.id}
            member={memberToChangeRole}
            onRoleChanged={async () => {
              await fetchTeamMembers(selectedTeam.id);
            }}
          />
        )}

        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          title={teamToDelete ? '팀 삭제' : '팀원 제거'}
          message={
            teamToDelete
              ? `"${teamToDelete.name}" 팀을 삭제하시겠습니까? 모든 문서와 데이터가 영구적으로 삭제됩니다.`
              : memberToDelete
                ? `"${memberToDelete.full_name || memberToDelete}" 님을 팀에서 제거하시겠습니까?`
                : ''
          }
          confirmText={teamToDelete ? '삭제' : '제거'}
          cancelText="취소"
          onConfirm={teamToDelete ? handleDeleteTeam : handleRemoveMember}
          onCancel={() => {
            setShowDeleteModal(false);
            setTeamToDelete(null);
            setMemberToDelete(null);
          }}
          isLoading={isDeleting}
        />
      </div>
    </>
  );
};

export default TeamManagementPage;
