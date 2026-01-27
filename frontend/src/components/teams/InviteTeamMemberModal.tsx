import { useState } from 'react';
import { X, Mail } from 'lucide-react';
import teamsService, { InviteMembersRequest } from '../../api/teams';
import { toast } from 'react-toastify';

interface InviteTeamMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: string;
  teamName: string;
  onInvitesSent: () => void;
}

const ROLE_OPTIONS = [
  { value: 'editor', label: 'Editor', description: '문서 생성/편집/삭제, 공유, 댓글 작성' },
  { value: 'viewer', label: 'Viewer', description: '문서 보기, 댓글 작성' },
] as const;

const InviteTeamMemberModal: React.FC<InviteTeamMemberModalProps> = ({
  isOpen,
  onClose,
  teamId,
  teamName,
  onInvitesSent,
}) => {
  const [emails, setEmails] = useState('');
  const [role, setRole] = useState<'editor' | 'viewer'>('editor');
  const [personalMessage, setPersonalMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailList = emails
      .split(',')
      .map((email) => email.trim())
      .filter((email) => email.length > 0);

    if (emailList.length === 0) {
      toast.error('최소 한 명의 팀원을 초대해주세요.');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalidEmails = emailList.filter((email) => !emailRegex.test(email));

    if (invalidEmails.length > 0) {
      toast.error(`잘못된 이메일 주소: ${invalidEmails.join(', ')}`);
      return;
    }

    setIsSubmitting(true);
    try {
      const data: InviteMembersRequest = {
        emails: emailList,
        role,
        personal_message: personalMessage.trim() || undefined,
      };

      const invites = await teamsService.inviteMembers(teamId, data);

      if (invites.length === 0) {
        toast.warn('이미 초대되었거나 팀에 속한 사용자입니다.');
      } else {
        toast.success(`${invites.length}명의 팀원에게 초대장을 보냈습니다!`);
        onInvitesSent();
        handleClose();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || '초대장 전송에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setEmails('');
    setRole('editor');
    setPersonalMessage('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 dark:bg-opacity-70">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">팀원 초대</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{teamName}</p>
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
            <label
              htmlFor="emails"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              이메일 주소 <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                id="emails"
                value={emails}
                onChange={(e) => setEmails(e.target.value)}
                placeholder="user@example.com, user2@example.com"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                disabled={isSubmitting}
              />
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              쉼표(,)로 여러 이메일 주소를 구분하여 입력하세요
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              역할
            </label>
            <div className="space-y-2">
              {ROLE_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className={`flex items-start p-3 border rounded-lg cursor-pointer transition-colors ${
                    role === option.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={option.value}
                    checked={role === option.value}
                    onChange={(e) => setRole(e.target.value as 'editor' | 'viewer')}
                    className="mt-1 mr-3"
                    disabled={isSubmitting}
                  />
                  <div>
                    <span className="block font-medium text-gray-900 dark:text-white">
                      {option.label}
                    </span>
                    <span className="block text-sm text-gray-500 dark:text-gray-400">
                      {option.description}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label
              htmlFor="message"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              개인 메시지 <span className="text-gray-400">(선택 사항)</span>
            </label>
            <textarea
              id="message"
              value={personalMessage}
              onChange={(e) => setPersonalMessage(e.target.value)}
              rows={3}
              placeholder="팀에 함께하게 되어 기쁩니다!"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
              disabled={isSubmitting}
            />
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-900 dark:text-blue-200">
              초대장이 보내지면 초대받은 사용자는 이메일로 초대 링크를 받게 됩니다. 링크를 클릭하여
              팀에 참여할 수 있습니다.
            </p>
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
              disabled={isSubmitting || !emails.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? '전송 중...' : '초대장 보내기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InviteTeamMemberModal;
