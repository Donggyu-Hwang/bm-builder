import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { googleDriveApi } from '../../api/googleDriveApi';
import { setConnected } from '../../store/slices/googleDriveSlice';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store/store';

const GoogleOAuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const error = searchParams.get('error');

      if (error) {
        // User denied OAuth
        navigate('/dashboard', {
          state: {
            message: 'Google Drive 연동이 취소되었습니다. 나중에 Settings에서 다시 연동할 수 있습니다.',
            type: 'info'
          }
        });
        return;
      }

      if (code) {
        try {
          const response = await googleDriveApi.handleCallback(code, state || '');

          if (response.success) {
            // Update Redux state
            dispatch(setConnected(true));

            // Show success message and redirect
            navigate('/dashboard', {
              state: {
                message: response.data.message,
                type: 'success'
              }
            });

            // Trigger file scan (Story 2.2)
            // This will be implemented in Story 2.2
          } else {
            // Error case - discriminated union ensures error exists
            navigate('/dashboard', {
              state: {
                message: response.error.message,
                type: 'error'
              }
            });
          }
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'OAuth 연동에 실패했습니다';
          navigate('/dashboard', {
            state: {
              message: errorMessage,
              type: 'error'
            }
          });
        }
      }
    };

    handleCallback();
  }, [searchParams, navigate, dispatch]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Google Drive 연동 처리 중...</p>
      </div>
    </div>
  );
};

export default GoogleOAuthCallback;
