/**
 * React Hook for WebSocket Presence
 * Manages real-time collaboration features
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import {
  webSocketClient,
  PresenceUser,
  CursorPosition,
  WebSocketMessage,
} from '../services/websocket';
import * as websocketApi from '../api/websocket';

interface UsePresenceOptions {
  documentId: string;
  enabled?: boolean;
}

interface UsePresenceReturn {
  connected: boolean;
  users: PresenceUser[];
  currentUser: PresenceUser | null;
  cursors: Map<string, CursorPosition>;
  connect: () => Promise<void>;
  disconnect: () => void;
  sendCursorPosition: (position: number, selection?: { start: number; end: number }) => void;
  error: string | null;
}

export function usePresence({ documentId, enabled = true }: UsePresenceOptions): UsePresenceReturn {
  const [connected, setConnected] = useState(false);
  const [users, setUsers] = useState<PresenceUser[]>([]);
  const [cursors, setCursors] = useState<Map<string, CursorPosition>>(new Map());
  const [error, setError] = useState<string | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  const connect = useCallback(async () => {
    if (!enabled) {
      return;
    }

    try {
      setError(null);

      // Get WebSocket token
      const token = await websocketApi.getWebSocketToken();

      await webSocketClient.connect(documentId, token);
      setConnected(true);
    } catch (err) {
      setError('Failed to connect to real-time service');
      console.error('WebSocket connection error:', err);
    }
  }, [documentId, enabled]);

  const disconnect = useCallback(() => {
    unsubscribeRef.current?.();
    unsubscribeRef.current = null;
    webSocketClient.disconnect();
    setConnected(false);
    setUsers([]);
    setCursors(new Map());
  }, []);

  const sendCursorPosition = useCallback(
    (position: number, selection?: { start: number; end: number }) => {
      if (connected) {
        webSocketClient.sendCursorPosition(position, selection);
      }
    },
    [connected]
  );

  useEffect(() => {
    if (!enabled) {
      return;
    }

    // Subscribe to WebSocket messages
    unsubscribeRef.current = webSocketClient.onMessage((message: WebSocketMessage) => {
      switch (message.type) {
        case 'connected':
          setConnected(true);
          break;

        case 'presence':
          if (message.users) {
            setUsers(message.users);
          }
          break;

        case 'user_joined':
          if (message.users) {
            setUsers(message.users);
          }
          // Could show a toast notification here
          break;

        case 'user_left':
          if (message.users) {
            setUsers(message.users);
          }
          // Remove cursor for the user who left
          if (message.user) {
            setCursors((prev) => {
              const next = new Map(prev);
              next.delete(message.user!.userId);
              return next;
            });
          }
          break;

        case 'cursor_move':
          if (message.cursor) {
            setCursors((prev) => {
              const next = new Map(prev);
              next.set(message.cursor!.userId, message.cursor!);
              return next;
            });
          }
          break;

        case 'error':
          setError(message.message || 'WebSocket error');
          break;
      }
    });

    // Connect to WebSocket
    connect();

    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, [documentId, enabled, connect, disconnect]);

  // Get current user from users list
  const currentUser = users.length > 0 ? users[0] : null;

  return {
    connected,
    users,
    currentUser,
    cursors,
    connect,
    disconnect,
    sendCursorPosition,
    error,
  };
}
