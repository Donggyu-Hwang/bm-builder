/**
 * Viewpoint Bookmarks Component
 * Allows users to save and restore canvas viewport positions
 */

import { useReactFlow } from '@reactflow/core';
import { useState, useEffect } from 'react';
import { Bookmark, Trash2, Eye, Plus } from 'lucide-react';

interface ViewpointBookmark {
  id: string;
  name: string;
  x: number;
  y: number;
  zoom: number;
  timestamp: number;
}

interface ViewpointBookmarksProps {
  documentId?: string;
}

export const ViewpointBookmarks: React.FC<ViewpointBookmarksProps> = ({ documentId }) => {
  const { getViewport, setViewport } = useReactFlow();
  const [bookmarks, setBookmarks] = useState<ViewpointBookmark[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [newBookmarkName, setNewBookmarkName] = useState('');

  // Storage key for localStorage
  const storageKey = documentId
    ? `canvas-viewpoints-${documentId}`
    : 'canvas-viewpoints';

  // Load bookmarks from localStorage
  useEffect(() => {
    const loadBookmarks = () => {
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          setBookmarks(JSON.parse(stored));
        }
      } catch (error) {
        console.error('Failed to load bookmarks:', error);
      }
    };

    loadBookmarks();
  }, [storageKey]);

  // Save bookmarks to localStorage
  const saveBookmarks = (updated: ViewpointBookmark[]) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
      setBookmarks(updated);
    } catch (error) {
      console.error('Failed to save bookmarks:', error);
    }
  };

  // Add new bookmark
  const handleAddBookmark = () => {
    if (!newBookmarkName.trim()) {
      alert('북마크 이름을 입력하세요');
      return;
    }

    const viewport = getViewport();
    const newBookmark: ViewpointBookmark = {
      id: `bookmark-${Date.now()}`,
      name: newBookmarkName.trim(),
      x: viewport.x,
      y: viewport.y,
      zoom: viewport.zoom,
      timestamp: Date.now(),
    };

    saveBookmarks([...bookmarks, newBookmark]);
    setNewBookmarkName('');
  };

  // Restore viewport from bookmark
  const handleRestoreBookmark = (bookmark: ViewpointBookmark) => {
    setViewport(
      {
        x: bookmark.x,
        y: bookmark.y,
        zoom: bookmark.zoom,
      },
      { duration: 300 }
    );
  };

  // Delete bookmark
  const handleDeleteBookmark = (bookmarkId: string) => {
    const updated = bookmarks.filter((b) => b.id !== bookmarkId);
    saveBookmarks(updated);
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isOpen) {
      handleAddBookmark();
    }
  };

  return (
    <div className="viewpoint-bookmarks">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="viewpoint-bookmarks-toggle"
        title="뷰포인트 북마크"
        aria-label="뷰포인트 북마크"
        aria-expanded={isOpen}
      >
        <Bookmark size={16} />
        <span className="ml-1">북마크</span>
        {bookmarks.length > 0 && (
          <span className="bookmark-count">({bookmarks.length})</span>
        )}
      </button>

      {isOpen && (
        <div className="viewpoint-bookmarks-panel">
          <div className="viewpoint-bookmarks-header">
            <h3>뷰포인트 북마크</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="viewpoint-bookmarks-close"
              aria-label="닫기"
            >
              ×
            </button>
          </div>

          {/* Add new bookmark */}
          <div className="viewpoint-bookmarks-add">
            <input
              type="text"
              placeholder="북마크 이름..."
              value={newBookmarkName}
              onChange={(e) => setNewBookmarkName(e.target.value)}
              onKeyDown={handleKeyDown}
              className="viewpoint-bookmarks-input"
              aria-label="북마크 이름 입력"
            />
            <button
              onClick={handleAddBookmark}
              className="viewpoint-bookmarks-add-btn"
              title="현재 뷰포인트 저장"
              disabled={!newBookmarkName.trim()}
              aria-label="북마크 추가"
            >
              <Plus size={16} />
            </button>
          </div>

          {/* Bookmarks list */}
          <div className="viewpoint-bookmarks-list">
            {bookmarks.length === 0 ? (
              <div className="viewpoint-bookmarks-empty">
                <p>저장된 북마크가 없습니다</p>
                <p className="text-sm text-gray-500">
                  현재 뷰포인트를 저장하려면 이름을 입력하고 추가 버튼을 클릭하세요
                </p>
              </div>
            ) : (
              <ul>
                {bookmarks.map((bookmark) => (
                  <li key={bookmark.id} className="viewpoint-bookmark-item">
                    <button
                      onClick={() => handleRestoreBookmark(bookmark)}
                      className="viewpoint-bookmark-restore"
                      title={`${bookmark.name}으로 이동`}
                      aria-label={`${bookmark.name}으로 이동`}
                    >
                      <Eye size={14} />
                      <div className="viewpoint-bookmark-info">
                        <div className="viewpoint-bookmark-name">
                          {bookmark.name}
                        </div>
                        <div className="viewpoint-bookmark-meta">
                          Zoom: {Math.round(bookmark.zoom * 100)}%
                        </div>
                      </div>
                    </button>
                    <button
                      onClick={() => handleDeleteBookmark(bookmark.id)}
                      className="viewpoint-bookmark-delete"
                      title="북마크 삭제"
                      aria-label="북마크 삭제"
                    >
                      <Trash2 size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
