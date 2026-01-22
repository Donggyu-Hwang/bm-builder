/**
 * Exit Confirmation Modal Component
 * Modal for confirming exit from document generation
 */

import { useDispatch, useSelector } from 'react-redux';
import {
  abandonCurrentSession,
  selectCurrentSession,
  setShowExitConfirmation,
  selectShowExitConfirmation,
} from '../../store/slices/documentGenerationSlice';
import { RootState, AppDispatch } from '../../store/store';

const ExitConfirmationModal = () => {
  const dispatch = useDispatch<AppDispatch>();
  const currentSession = useSelector(selectCurrentSession);
  const showExitConfirmation = useSelector(selectShowExitConfirmation);

  const handleConfirmExit = async () => {
    if (currentSession.sessionId) {
      await dispatch(abandonCurrentSession(currentSession.sessionId)).unwrap();
    }
  };

  const handleCancelExit = () => {
    dispatch(setShowExitConfirmation(false));
  };

  if (!showExitConfirmation) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
        <h3 className="text-xl font-bold text-slate-900 mb-2">
          문서 생성을 중단하시겠습니까?
        </h3>
        <p className="text-slate-600 mb-6">
          지금 중단하면 현재까지의 답변이 저장되지 않습니다. 계속 진행하시겠습니까?
        </p>

        <div className="flex gap-3">
          <button
            onClick={handleCancelExit}
            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
          >
            계속하기
          </button>
          <button
            onClick={handleConfirmExit}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            중단하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExitConfirmationModal;
