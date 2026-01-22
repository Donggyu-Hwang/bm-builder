/**
 * Share Link Modal Component
 * Allows users to generate shareable links for the node canvas
 */

import { useState } from 'react';

interface ShareLinkData {
  url: string;
  accessControl: 'anyone' | 'password';
  password?: string;
  expiration: 'never' | '7days' | '30days';
}

interface ShareLinkModalProps {
  documentId: string;
  onClose: () => void;
}

export const ShareLinkModal: React.FC<ShareLinkModalProps> = ({ documentId, onClose }) => {
  const [shareData, setShareData] = useState<ShareLinkData>({
    url: '',
    accessControl: 'anyone',
    expiration: 'never',
  });
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerateLink = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/v1/workflow/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          documentId,
          accessControl: shareData.accessControl,
          password: shareData.password,
          expiration: shareData.expiration,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate share link');
      }

      const data = await response.json();
      setShareData({ ...shareData, url: data.data.url });
    } catch (error) {
      console.error('Failed to generate share link', error);
      alert('공유 링크 생성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareData.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link', error);
      alert('링크 복사에 실패했습니다.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">공유 링크 생성</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="닫기"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-4">
          {!shareData.url ? (
            <>
              {/* Access Control */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  액세스 제어
                </label>
                <select
                  value={shareData.accessControl}
                  onChange={(e) => setShareData({ ...shareData, accessControl: e.target.value as 'anyone' | 'password' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="anyone">링크를 가진 모든 사람</option>
                  <option value="password">비밀번호 보호</option>
                </select>
              </div>

              {/* Password Input (conditional) */}
              {shareData.accessControl === 'password' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    비밀번호
                  </label>
                  <input
                    type="password"
                    value={shareData.password || ''}
                    onChange={(e) => setShareData({ ...shareData, password: e.target.value })}
                    placeholder="비밀번호 입력"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              )}

              {/* Expiration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  만료 기간
                </label>
                <select
                  value={shareData.expiration}
                  onChange={(e) => setShareData({ ...shareData, expiration: e.target.value as 'never' | '7days' | '30days' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="never">만료 없음</option>
                  <option value="7days">7일</option>
                  <option value="30days">30일</option>
                </select>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerateLink}
                disabled={loading || (shareData.accessControl === 'password' && !shareData.password)}
                className="w-full px-4 py-2 text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '생성 중...' : '링크 생성'}
              </button>
            </>
          ) : (
            <>
              {/* Share Link Display */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  공유 링크
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={shareData.url}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-4 py-2 text-purple-600 border border-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
                  >
                    {copied ? '복사됨!' : '복사'}
                  </button>
                </div>
              </div>

              {/* Info Text */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  {shareData.accessControl === 'anyone'
                    ? '이 링크를 가진 모든 사람이 워크플로우를 볼 수 있습니다.'
                    : '비밀번호를 입력한 사람만 워크플로우를 볼 수 있습니다.'
                  }
                </p>
                {shareData.expiration !== 'never' && (
                  <p className="text-sm text-blue-600 mt-2">
                    {shareData.expiration === '7days' ? '7일 후' : '30일 후'}에 링크가 만료됩니다.
                  </p>
                )}
              </div>

              {/* Create New Link Button */}
              <button
                onClick={() => setShareData({ ...shareData, url: '' })}
                className="w-full px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                새 링크 생성
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
