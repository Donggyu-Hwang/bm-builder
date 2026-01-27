/**
 * WebSocket Client Service
 * Manages real-time connection for collaborative features
 */

import ReconnectingWebSocket from 'reconnecting-websocket';

export interface PresenceUser {
  userId: string;
  userName: string;
  userEmail: string;
}

export interface CursorPosition {
  userId: string;
  position: number;
  selection?: { start: number; end: number };
}

export interface WebSocketMessage {
  type: 'connected' | 'presence' | 'user_joined' | 'user_left' | 'cursor_move' | 'error';
  documentId?: string;
  users?: PresenceUser[];
  user?: PresenceUser;
  cursor?: CursorPosition;
  message?: string;
}

type MessageHandler = (message: WebSocketMessage) => void;

class WebSocketClient {
  private ws: ReconnectingWebSocket | null = null;
  private messageHandlers: Set<MessageHandler> = new Set();
  private currentDocumentId: string | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  /**
   * Connect to WebSocket server
   */
  connect(documentId: string, token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Close existing connection if any
      if (this.ws) {
        this.ws.close();
      }

      this.currentDocumentId = documentId;

      const wsUrl = `${this.getWebSocketURL()}/ws`;
      this.ws = new ReconnectingWebSocket(wsUrl, [], {
        connectionTimeout: 10000,
        maxRetries: this.maxReconnectAttempts,
      });

      this.ws.onopen = () => {
        console.log('WebSocket connected');

        // Send join message
        this.send({
          type: 'join',
          documentId,
          token,
        });

        this.reconnectAttempts = 0;
        resolve();
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          this.notifyHandlers(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        reject(error);
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.reconnectAttempts++;

        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          console.error('Max reconnection attempts reached');
          this.notifyHandlers({
            type: 'error',
            message: 'Connection lost. Please refresh the page.',
          });
        }
      };
    });
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (this.ws && this.currentDocumentId) {
      this.send({
        type: 'leave',
        documentId: this.currentDocumentId,
      });
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.currentDocumentId = null;
    this.reconnectAttempts = 0;
  }

  /**
   * Send cursor position
   */
  sendCursorPosition(position: number, selection?: { start: number; end: number }): void {
    if (!this.ws || !this.currentDocumentId) return;

    this.send({
      type: 'cursor_move',
      documentId: this.currentDocumentId,
      data: { position, selection },
    });
  }

  /**
   * Request presence update
   */
  requestPresence(): void {
    if (!this.ws || !this.currentDocumentId) return;

    this.send({
      type: 'presence_request',
      documentId: this.currentDocumentId,
    });
  }

  /**
   * Send message to WebSocket server
   */
  private send(data: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  /**
   * Subscribe to WebSocket messages
   */
  onMessage(handler: MessageHandler): () => void {
    this.messageHandlers.add(handler);

    // Return unsubscribe function
    return () => {
      this.messageHandlers.delete(handler);
    };
  }

  /**
   * Notify all message handlers
   */
  private notifyHandlers(message: WebSocketMessage): void {
    this.messageHandlers.forEach((handler) => {
      try {
        handler(message);
      } catch (error) {
        console.error('Error in message handler:', error);
      }
    });
  }

  /**
   * Get WebSocket URL based on current location
   */
  private getWebSocketURL(): string {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = process.env.REACT_APP_WS_URL || window.location.host;
    return `${protocol}//${host}`;
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  /**
   * Get current document ID
   */
  getCurrentDocumentId(): string | null {
    return this.currentDocumentId;
  }
}

export const webSocketClient = new WebSocketClient();
export default webSocketClient;
