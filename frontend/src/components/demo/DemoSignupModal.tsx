import React from 'react';
import { CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DemoSignupModalProps {
  open: boolean;
  onClose: () => void;
}

export const DemoSignupModal: React.FC<DemoSignupModalProps> = ({ open, onClose }) => {
  const navigate = useNavigate();

  const handleSignup = () => {
    onClose();
    navigate('/login');
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6 rounded-t-lg">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <CheckCircle className="w-6 h-6" />
            문서 생성 완료!
          </h2>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-lg mb-4">데모 모드에서 문서가 성공적으로 생성되었습니다!</p>

          {/* Warning Box */}
          <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 rounded">
            <p className="font-bold text-yellow-800 mb-2">⚠️ 저장 안내</p>
            <p className="text-sm text-gray-700 mb-2">데모 모드에서는 문서를 저장할 수 없습니다.</p>
            <p className="text-sm text-gray-700">
              지금 가입하시면 무제한으로 문서를 생성하고 저장할 수 있습니다!
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 justify-end p-6 pt-0">
          <button
            onClick={onClose}
            className="px-4 py-2 border-2 border-indigo-500 text-indigo-500 rounded-lg hover:bg-indigo-50 transition-colors font-semibold"
          >
            데모 계속하기
          </button>
          <button
            onClick={handleSignup}
            className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all font-semibold shadow-md"
          >
            지금 가입하기
          </button>
        </div>
      </div>
    </div>
  );
};
