import { useState, useEffect } from 'react';
import { MessageCircle, Reply, X, Check, User } from 'lucide-react';
import commentsService, { CommentWithUser } from '../../api/comments';
import { toast } from 'react-toastify';

interface CommentsPanelProps {
  documentId: string;
  isOpen: boolean;
  onClose: () => void;
}

const CommentsPanel: React.FC<CommentsPanelProps> = ({ documentId, isOpen, onClose }) => {
  const [comments, setComments] = useState<CommentWithUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  useEffect(() => {
    if (isOpen && documentId) {
      fetchComments();
    }
  }, [isOpen, documentId]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const data = await commentsService.getDocumentComments(documentId);
      setComments(data);
    } catch (error: any) {
      toast.error('댓글을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleResolveToggle = async (commentId: string, isResolved: boolean) => {
    try {
      await commentsService.updateComment(commentId, { is_resolved: !isResolved });
      await fetchComments();
      toast.success(isResolved ? '댓글이 다시 열렸습니다.' : '댓글이 해결되었습니다.');
    } catch (error: any) {
      toast.error('댓글 상태 변경에 실패했습니다.');
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!window.confirm('댓글을 삭제하시겠습니까?')) return;

    try {
      await commentsService.deleteComment(commentId);
      await fetchComments();
      toast.success('댓글이 삭제되었습니다.');
    } catch (error: any) {
      toast.error(error.response?.data?.error || '댓글 삭제에 실패했습니다.');
    }
  };

  const handleReplySubmit = async (parentCommentId: string) => {
    if (!replyContent.trim()) return;

    setSubmittingReply(true);
    try {
      await commentsService.createComment({
        document_id: documentId,
        content: replyContent.trim(),
        parent_comment_id: parentCommentId,
      });
      setReplyContent('');
      setReplyingTo(null);
      await fetchComments();
      toast.success('답글이 추가되었습니다.');
    } catch (error: any) {
      toast.error('답글 추가에 실패했습니다.');
    } finally {
      setSubmittingReply(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-white dark:bg-gray-800 shadow-xl border-l border-gray-200 dark:border-gray-700 flex flex-col z-40">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">댓글</h2>
          <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded-full">
            {comments.length}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Comments List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">로딩 중...</div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
            <p className="text-sm">아직 댓글이 없습니다.</p>
            <p className="text-xs mt-1">문서 내용을 선택하고 댓글을 추가하세요.</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className={`p-3 rounded-lg border ${
                comment.is_resolved
                  ? 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 opacity-70'
                  : 'bg-white dark:bg-gray-800 border-blue-200 dark:border-blue-800'
              }`}
            >
              {/* Comment Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <User className="w-4 h-4 text-blue-600 dark:text-blue-200" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {comment.full_name || '사용자'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(comment.created_at).toLocaleDateString('ko-KR', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {comment.is_resolved && (
                    <span className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 rounded-full">
                      <Check className="w-3 h-3" />
                      해결됨
                    </span>
                  )}
                </div>
              </div>

              {/* Comment Content */}
              {comment.text_anchor && (
                <div className="mb-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 border-l-2 border-yellow-400 dark:border-yellow-600 rounded">
                  <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                    "
                    {comment.text_anchor.length > 100
                      ? comment.text_anchor.substring(0, 100) + '...'
                      : comment.text_anchor}
                    "
                  </p>
                </div>
              )}
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{comment.content}</p>

              {/* Replies */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="ml-4 mt-3 space-y-2 border-l-2 border-gray-200 dark:border-gray-600 pl-3">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="text-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                          <User className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {reply.full_name || '사용자'}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(reply.created_at).toLocaleDateString('ko-KR', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">{reply.content}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Reply Input */}
              {replyingTo === comment.id && (
                <div className="mt-3">
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="답글을 입력하세요..."
                    rows={2}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                    disabled={submittingReply}
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    <button
                      onClick={() => {
                        setReplyingTo(null);
                        setReplyContent('');
                      }}
                      className="px-3 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                      disabled={submittingReply}
                    >
                      취소
                    </button>
                    <button
                      onClick={() => handleReplySubmit(comment.id)}
                      disabled={submittingReply || !replyContent.trim()}
                      className="px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submittingReply ? '전송 중...' : '답글'}
                    </button>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                  className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                >
                  <Reply className="w-3 h-3" />
                  답글
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleResolveToggle(comment.id, comment.is_resolved)}
                    className={`text-xs px-2 py-1 rounded transition-colors ${
                      comment.is_resolved
                        ? 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
                        : 'text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300'
                    }`}
                  >
                    {comment.is_resolved ? '다시 열기' : '해결'}
                  </button>
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                  >
                    삭제
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CommentsPanel;
