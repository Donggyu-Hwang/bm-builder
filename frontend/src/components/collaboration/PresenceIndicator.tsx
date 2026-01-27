/**
 * Presence Indicator Component
 * Shows currently connected users in real-time
 */

import React from 'react';
import { Users } from 'lucide-react';
import { PresenceUser } from '../../services/websocket';

interface PresenceIndicatorProps {
  users: PresenceUser[];
  connected: boolean;
}

export const PresenceIndicator: React.FC<PresenceIndicatorProps> = ({ users, connected }) => {
  if (!connected || users.length === 0) {
    return null;
  }

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (userId: string): string => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500',
      'bg-orange-500',
      'bg-red-500',
    ];
    const index = userId.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-800 rounded-full shadow-sm border border-gray-200 dark:border-gray-700">
      <Users className="w-4 h-4 text-gray-500 dark:text-gray-400" />
      <span className="text-sm text-gray-600 dark:text-gray-400">
        {users.length === 1 ? '나만 보는 중' : `${users.length}명이 함께 보고 있어요`}
      </span>

      {/* User avatars */}
      <div className="flex -space-x-2">
        {users.slice(0, 5).map((user) => (
          <div
            key={user.userId}
            className={`w-7 h-7 rounded-full ${getAvatarColor(user.userId)} flex items-center justify-center text-white text-xs font-medium border-2 border-white dark:border-gray-800`}
            title={user.userName}
          >
            {getInitials(user.userName)}
          </div>
        ))}

        {/* Show more indicator if there are more than 5 users */}
        {users.length > 5 && (
          <div className="w-7 h-7 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300 text-xs font-medium border-2 border-white dark:border-gray-800">
            +{users.length - 5}
          </div>
        )}
      </div>
    </div>
  );
};

export default PresenceIndicator;
