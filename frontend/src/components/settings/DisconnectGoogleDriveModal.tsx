import { useDispatch } from 'react-redux';
import { disconnectGoogleDrive } from '@/store/slices/googleDriveSlice';

interface DisconnectGoogleDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DisconnectGoogleDriveModal = ({
  isOpen,
  onClose
}: DisconnectGoogleDriveModalProps) => {
  const dispatch = useDispatch();

  const handleDisconnect = async () => {
    const result = await dispatch(disconnectGoogleDrive());

    if (disconnectGoogleDrive.fulfilled.match(result)) {
      // Successfully disconnected
      onClose();
    } else if (disconnectGoogleDrive.rejected.match(result)) {
      // Handle error - error will be in Redux state
      // Modal stays open so user can see error
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Google Drive 연동 해제
        </h2>

        <div className="space-y-4 text-gray-600 mb-6">
          <p>
            정말로 Google Drive 연동을 해제하시겠습니까?
          </p>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="font-semibold text-red-900 mb-2">
              주의: 모든 데이터가 삭제됩니다
            </h3>
            <ul className="text-sm text-red-800 space-y-1">
              <li>• 스캔된 모든 파일 정보</li>
              <li>• 분류된 비즈니스 문서 목록</li>
              <li>• 진행 중인 스캔 상태</li>
            </ul>
          </div>

          <p className="text-sm">
            이 작업은 되돌릴 수 없습니다. 나중에 다시 연동하면 처음부터 다시 스캔해야 합니다.
          </p>
        </div>

        <div className="flex space-x-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleDisconnect}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            연동 해제
          </button>
        </div>
      </div>
    </div>
  );
};
