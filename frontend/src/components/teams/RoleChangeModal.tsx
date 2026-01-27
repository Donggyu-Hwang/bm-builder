import { useState } from 'react';
import { X, Crown, Edit, Eye, Info } from 'lucide-react';
import teamsService from '../../api/teams';
import { toast } from 'react-toastify';

interface RoleChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: string;
  member: {
    id: string;
    full_name?: string;
    email?: string;
    role: 'admin' | 'editor' | 'viewer';
  };
  onRoleChanged: () => void;
}

const ROLE_INFO = {
  admin: {
    label: 'Admin',
    labelKo: '관리자',
    icon: Crown,
    color: 'yellow',
    description: '모든 권한 + 팀원 초대 + 역할 변경 + 팀 설정',
  },
  editor: {
    label: 'Editor',
    labelKo: '편집자',
    icon: Edit,
    color: 'blue',
    description: '문서 생성/편집/삭제 + 공유 + 댓글',
  },
  viewer: {
    label: 'Viewer',
    labelKo: '조회자',
    icon: Eye,
    color: 'gray',
    description: '문서 보기 + 댓글 (편집/삭제 불가)',
  },
} as const;

const RoleChangeModal: React.FC<RoleChangeModalProps> = ({
  isOpen,
  onClose,
  teamId,
  member,
  onRoleChanged,
}) => {
  const [selectedRole, setSelectedRole] = useState<'admin' | 'editor' | 'viewer'>(member.role);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedRole === member.role) {
      onClose();
      return;
    }

    setIsSubmitting(true);
    try {
      await teamsService.updateMemberRole(teamId, member.id, selectedRole);
      toast.success(`${member.full_name || member.email} 님의 역할이 변경되었습니다.`);
      onRoleChanged();
      handleClose();
    } catch (error: any) {
      toast.error(error.response?.data?.error || '역할 변경에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedRole(member.role);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 dark:bg-opacity-70">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">역할 변경</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {member.full_name || member.email}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              현재 역할
            </label>
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
              {(() => {
                const Icon = ROLE_INFO[member.role].icon;
                return <Icon className={`w-4 h-4 text-${ROLE_INFO[member.role].color}-500`} />;
              })()}
              <span className="font-medium text-gray-900 dark:text-white">
                {ROLE_INFO[member.role].labelKo}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              새 역할
            </label>
            <div className="space-y-2">
              {(Object.keys(ROLE_INFO) as Array<'admin' | 'editor' | 'viewer'>).map((role) => {
                const info = ROLE_INFO[role];
                const Icon = info.icon;
                return (
                  <label
                    key={role}
                    className={`flex items-start p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedRole === role
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={role}
                      checked={selectedRole === role}
                      onChange={(e) =>
                        setSelectedRole(e.target.value as 'admin' | 'editor' | 'viewer')
                      }
                      className="mt-1 mr-3"
                      disabled={isSubmitting}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className={`w-4 h-4 text-${info.color}-500`} />
                        <span className="font-medium text-gray-900 dark:text-white">
                          {info.labelKo}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{info.description}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex gap-2">
              <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-900 dark:text-blue-200">
                역할 변경은 즉시 적용됩니다. 변경된 역할은 다음 로그인부터 완전히 반영됩니다.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting || selectedRole === member.role}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? '변경 중...' : '변경'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoleChangeModal;
