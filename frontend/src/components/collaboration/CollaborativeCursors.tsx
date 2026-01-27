/**
 * Collaborative Cursors Component
 * Shows other users' cursor positions in real-time
 */

import React from 'react';
import { CursorPosition, PresenceUser } from '../../services/websocket';

interface CollaborativeCursorsProps {
  cursors: Map<string, CursorPosition>;
  users: Map<string, PresenceUser>;
  currentUserId: string;
  containerRef: React.RefObject<HTMLElement>;
}

export const CollaborativeCursors: React.FC<CollaborativeCursorsProps> = ({
  cursors,
  users,
  currentUserId,
  containerRef,
}) => {
  const [cursorPositions, setCursorPositions] = React.useState<
    Array<{
      userId: string;
      userName: string;
      color: string;
      x: number;
      y: number;
      visible: boolean;
    }>
  >([]);

  // Calculate cursor positions
  React.useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const positions: Array<{
      userId: string;
      userName: string;
      color: string;
      x: number;
      y: number;
      visible: boolean;
    }> = [];

    cursors.forEach((cursor, userId) => {
      if (userId === currentUserId) return;

      const user = users.get(userId);
      if (!user) return;

      // For now, we'll use a simple position based on cursor index
      // In a real implementation, this would calculate actual DOM coordinates
      const index = cursor.position || 0;
      const lineHeight = 24; // Approximate line height
      const charWidth = 8; // Approximate character width

      positions.push({
        userId,
        userName: user.userName,
        color: getCursorColor(userId),
        x: (index % 80) * charWidth, // Wrap every 80 characters
        y: Math.floor(index / 80) * lineHeight,
        visible: true,
      });
    });

    setCursorPositions(positions);
  }, [cursors, users, currentUserId, containerRef]);

  const getCursorColor = (userId: string): string => {
    const colors = [
      '#3B82F6', // blue
      '#10B981', // green
      '#8B5CF6', // purple
      '#EC4899', // pink
      '#6366F1', // indigo
      '#14B8A6', // teal
      '#F97316', // orange
      '#EF4444', // red
    ];
    return colors[userId.charCodeAt(0) % colors.length];
  };

  if (cursorPositions.length === 0) {
    return null;
  }

  return (
    <div className="pointer-events-none">
      {cursorPositions.map((cursor) => (
        <div
          key={cursor.userId}
          className="absolute transition-all duration-150 ease-out"
          style={{
            left: cursor.x,
            top: cursor.y,
            opacity: cursor.visible ? 1 : 0,
          }}
        >
          {/* Cursor */}
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            style={{ color: cursor.color }}
          >
            <path
              d="M1 1L5 1L8 8L6 9L8 12L11 9L13 15L1 1Z"
              fill={cursor.color}
              stroke="white"
              strokeWidth="1"
            />
          </svg>

          {/* Name tag */}
          <div
            className="px-2 py-0.5 text-xs text-white rounded whitespace-nowrap ml-2"
            style={{
              backgroundColor: cursor.color,
            }}
          >
            {cursor.userName}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CollaborativeCursors;
