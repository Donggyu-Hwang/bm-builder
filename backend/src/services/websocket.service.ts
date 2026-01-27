/**
 * WebSocket Service
 * Manages real-time connections for collaborative editing and presence
 */

import { WebSocketServer, WebSocket } from 'ws';
import jwt from 'jsonwebtoken';
import pool from '../utils/db';
import collaborativeEditorService from './collaborative-editor.service';
import { getJWTAccessSecret } from '../utils/auth';

interface ConnectedUser {
  userId: string;
  userName: string;
  userEmail: string;
  documentId: string;
  ws: WebSocket;
  lastSeen: Date;
}

interface PresenceMessage {
  type: 'presence' | 'user_joined' | 'user_left' | 'cursor_move';
  documentId: string;
  users: Array<{
    userId: string;
    userName: string;
    userEmail: string;
  }>;
  user?: {
    userId: string;
    userName: string;
    userEmail: string;
  };
  cursor?: {
    userId: string;
    position: number;
    selection?: { start: number; end: number };
  };
}

interface WebSocketMessage {
  type:
    | 'join'
    | 'leave'
    | 'cursor_move'
    | 'edit'
    | 'presence_request'
    | 'sync_request'
    | 'sync_update';
  documentId?: string;
  token?: string;
  data?: any;
  update?: Uint8Array | string; // Can be Uint8Array or base64 string after JSON serialization
}

class WebSocketService {
  private wss: WebSocketServer | null = null;
  private connectedUsers: Map<string, ConnectedUser> = new Map();

  // Rate limiting: Track connection attempts per IP
  private connectionAttempts: Map<string, { count: number; resetTime: number }> = new Map();
  private readonly MAX_CONNECTIONS_PER_IP = 10;
  private readonly RATE_LIMIT_WINDOW_MS = 60000; // 1 minute

  // Rate limiting: Track cursor moves per user
  private cursorMoveTimestamps: Map<string, number> = new Map();
  private readonly CURSOR_MOVE_RATE_LIMIT_MS = 100; // HIGH FIX: Max 10 updates/sec (was 50ms, too strict)

  // Heartbeat/Ping settings
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private readonly HEARTBEAT_INTERVAL_MS = 30000; // 30 seconds

  /**
   * Initialize WebSocket server
   */
  initialize(server: any) {
    this.wss = new WebSocketServer({ server, path: '/ws' });

    this.wss.on('connection', (ws: WebSocket, req) => {
      const ip = req.socket.remoteAddress;

      // Rate limiting: Check connection attempts per IP
      if (ip && !this.checkRateLimit(ip)) {
        console.warn(`Rate limit exceeded for IP: ${ip}`);
        ws.close(1008, 'Rate limit exceeded. Please try again later.');
        return;
      }

      console.log('New WebSocket connection attempt');

      // Send initial connection message
      ws.send(
        JSON.stringify({
          type: 'connected',
          message: 'WebSocket connection established',
        })
      );

      // Handle incoming messages
      ws.on('message', async (data: Buffer) => {
        try {
          // Size limit: Reject messages larger than 100KB
          if (data.length > 100000) {
            ws.close(1009, 'Message too large');
            return;
          }

          const message: WebSocketMessage = JSON.parse(data.toString());

          // Input validation
          const validationError = this.validateMessage(message);
          if (validationError) {
            ws.send(
              JSON.stringify({
                type: 'error',
                message: validationError,
              })
            );
            return;
          }

          await this.handleMessage(ws, message);
        } catch (error) {
          console.error('Error handling WebSocket message:', error);
          ws.send(
            JSON.stringify({
              type: 'error',
              message: 'Invalid message format',
            })
          );
        }
      });

      // Handle disconnection
      ws.on('close', () => {
        this.handleDisconnect(ws);
      });

      // Handle errors
      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
      });
    });

    // Clean up inactive connections every 30 seconds
    setInterval(() => {
      this.cleanupInactiveConnections();
    }, 30000);

    // Start heartbeat/ping to detect dead connections
    this.startHeartbeat();

    console.log('WebSocket server initialized on /ws');
  }

  /**
   * Start heartbeat/ping mechanism
   */
  private startHeartbeat(): void {
    if (this.heartbeatInterval) {
      return;
    }

    this.heartbeatInterval = setInterval(() => {
      this.wss?.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.ping();
        }
      });
    }, this.HEARTBEAT_INTERVAL_MS);

    console.log('WebSocket heartbeat started (30s interval)');
  }

  /**
   * Stop heartbeat
   * @deprecated Used in graceful shutdown, exposed for cleanup
   */
  public stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Handle incoming WebSocket messages
   */
  private async handleMessage(ws: WebSocket, message: WebSocketMessage) {
    // For all message types except 'join', verify the connection is authenticated
    if (message.type !== 'join') {
      if (!message.documentId) {
        ws.send(
          JSON.stringify({
            type: 'error',
            message: 'Missing documentId',
          })
        );
        return;
      }
      const connectionKey = this.getConnectionKeyForWebSocket(ws, message.documentId);
      if (!connectionKey) {
        ws.send(
          JSON.stringify({
            type: 'error',
            message: 'Not authenticated. Please join the document first.',
          })
        );
        return;
      }
    }

    switch (message.type) {
      case 'join':
        await this.handleJoin(ws, message);
        break;
      case 'leave':
        await this.handleLeave(ws, message);
        break;
      case 'cursor_move':
        await this.handleCursorMove(ws, message);
        break;
      case 'presence_request':
        await this.handlePresenceRequest(ws, message);
        break;
      case 'sync_request':
        await this.handleSyncRequest(ws, message);
        break;
      case 'sync_update':
        await this.handleSyncUpdate(ws, message);
        break;
      default:
        ws.send(
          JSON.stringify({
            type: 'error',
            message: `Unknown message type: ${message.type}`,
          })
        );
    }
  }

  /**
   * Handle user joining a document
   */
  private async handleJoin(ws: WebSocket, message: WebSocketMessage) {
    try {
      const { token, documentId } = message;

      if (!token || !documentId) {
        ws.send(
          JSON.stringify({
            type: 'error',
            message: 'Missing token or documentId',
          })
        );
        return;
      }

      // CRITICAL FIX: Use centralized JWT validation function
      let decoded: { userId: string; email: string };
      try {
        const jwtSecret = getJWTAccessSecret();
        decoded = jwt.verify(token, jwtSecret) as {
          userId: string;
          email: string;
        };
      } catch (error) {
        console.error('JWT verification failed:', error);
        ws.send(
          JSON.stringify({
            type: 'error',
            message: 'Authentication system not properly configured',
          })
        );
        ws.close(1008, 'Authentication configuration error');
        return;
      }

      // Get user details
      const userResult = await pool.query('SELECT id, name, email FROM users WHERE id = $1', [
        decoded.userId,
      ]);

      if (userResult.rows.length === 0) {
        ws.send(
          JSON.stringify({
            type: 'error',
            message: 'User not found',
          })
        );
        return;
      }

      const user = userResult.rows[0];

      // Check if user has access to the document with proper permission validation
      const accessResult = await pool.query(
        `SELECT d.*, dp.permission_level as direct_permission
         FROM documents d
         LEFT JOIN team_members tm ON tm.team_id = d.team_id
           AND tm.user_id = $2
           AND tm.status = 'active'
           AND (tm.expires_at IS NULL OR tm.expires_at > NOW())
         LEFT JOIN document_permissions dp ON dp.document_id = d.id AND dp.user_id = $2
         WHERE d.id = $1
           AND (d.user_id = $2 OR tm.id IS NOT NULL OR dp.permission_level IS NOT NULL)
         LIMIT 1`,
        [documentId, decoded.userId]
      );

      if (accessResult.rows.length === 0) {
        ws.send(
          JSON.stringify({
            type: 'error',
            message: 'Access denied to this document',
          })
        );
        return;
      }

      // Verify user has at least read permission
      const doc = accessResult.rows[0];
      const hasPermission =
        doc.user_id === decoded.userId ||
        doc.direct_permission === 'read' ||
        doc.direct_permission === 'write' ||
        doc.direct_permission === 'admin';

      if (!hasPermission) {
        ws.send(
          JSON.stringify({
            type: 'error',
            message: 'Insufficient permissions for this document',
          })
        );
        return;
      }

      // Check if user is already connected to this document
      const connectionKey = `${decoded.userId}:${documentId}`;
      if (this.connectedUsers.has(connectionKey)) {
        // Update existing connection
        const existingUser = this.connectedUsers.get(connectionKey)!;
        existingUser.ws = ws;
        existingUser.lastSeen = new Date();
      } else {
        // Add new connection
        const connectedUser: ConnectedUser = {
          userId: user.id,
          userName: user.name,
          userEmail: user.email,
          documentId,
          ws,
          lastSeen: new Date(),
        };
        this.connectedUsers.set(connectionKey, connectedUser);

        // Broadcast user joined event
        this.broadcastToDocument(
          documentId,
          {
            type: 'user_joined',
            documentId,
            users: this.getUsersForDocument(documentId),
            user: {
              userId: user.id,
              userName: user.name,
              userEmail: user.email,
            },
          } as PresenceMessage,
          connectionKey
        );
      }

      // Send current presence to the joining user
      ws.send(
        JSON.stringify({
          type: 'presence',
          documentId,
          users: this.getUsersForDocument(documentId),
        } as PresenceMessage)
      );

      console.log(`User ${user.email} joined document ${documentId}`);
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        ws.send(
          JSON.stringify({
            type: 'error',
            message: 'Invalid token',
          })
        );
      } else {
        console.error('Error handling join:', error);
        ws.send(
          JSON.stringify({
            type: 'error',
            message: 'Failed to join document',
          })
        );
      }
    }
  }

  /**
   * Handle user leaving a document
   */
  private async handleLeave(ws: WebSocket, message: WebSocketMessage) {
    const { documentId } = message;

    if (!documentId) {
      ws.send(
        JSON.stringify({
          type: 'error',
          message: 'Missing documentId',
        })
      );
      return;
    }

    // Find the connection for THIS ws and documentId
    const connectionKey = this.getConnectionKeyForWebSocket(ws, documentId);

    if (!connectionKey) {
      ws.send(
        JSON.stringify({
          type: 'error',
          message: 'Not connected to this document',
        })
      );
      return;
    }

    // Get user info before removing
    const user = this.connectedUsers.get(connectionKey);
    if (!user) {
      return;
    }

    const userName = user.userName;
    this.connectedUsers.delete(connectionKey);

    // Broadcast user left event
    this.broadcastToDocument(documentId, {
      type: 'user_left',
      documentId,
      users: this.getUsersForDocument(documentId),
      user: {
        userId: user.userId,
        userName: user.userName,
        userEmail: user.userEmail,
      },
    } as PresenceMessage);

    console.log(`User ${userName} left document ${documentId}`);
  }

  /**
   * Handle cursor movement
   */
  private async handleCursorMove(ws: WebSocket, message: WebSocketMessage) {
    const { documentId, data } = message;

    // Find the user
    for (const [key, user] of this.connectedUsers.entries()) {
      if (user.ws === ws && user.documentId === documentId) {
        // Rate limiting: Check cursor move frequency
        const cursorKey = `${user.userId}:${documentId}`;
        const now = Date.now();
        const lastMove = this.cursorMoveTimestamps.get(cursorKey) || 0;

        if (now - lastMove < this.CURSOR_MOVE_RATE_LIMIT_MS) {
          // Drop this update - too frequent
          return;
        }

        this.cursorMoveTimestamps.set(cursorKey, now);

        // Broadcast cursor movement to other users in the same document
        this.broadcastToDocument(
          documentId,
          {
            type: 'cursor_move',
            documentId,
            cursor: {
              userId: user.userId,
              position: data.position,
              selection: data.selection,
            },
          } as PresenceMessage,
          key
        );

        break;
      }
    }
  }

  /**
   * Handle presence request
   */
  private async handlePresenceRequest(ws: WebSocket, message: WebSocketMessage) {
    const { documentId } = message;

    if (!documentId) {
      ws.send(
        JSON.stringify({
          type: 'error',
          message: 'Missing documentId',
        })
      );
      return;
    }

    // Find the user for this document
    let requestingUser = null;
    for (const [_key, user] of this.connectedUsers.entries()) {
      if (user.ws === ws && user.documentId === documentId) {
        requestingUser = user;
        break;
      }
    }

    if (!requestingUser) {
      ws.send(
        JSON.stringify({
          type: 'error',
          message: 'Not connected to this document',
        })
      );
      return;
    }

    // Send current presence
    ws.send(
      JSON.stringify({
        type: 'presence',
        documentId,
        users: this.getUsersForDocument(documentId),
      } as PresenceMessage)
    );
  }

  /**
   * Handle sync request - sends current document state to newly joined user
   */
  private async handleSyncRequest(ws: WebSocket, message: WebSocketMessage) {
    const { documentId } = message;

    if (!documentId) {
      ws.send(
        JSON.stringify({
          type: 'error',
          message: 'Missing documentId',
        })
      );
      return;
    }

    // Get document state from Yjs
    const state = collaborativeEditorService.getState(documentId);

    // Convert Uint8Array to base64 for JSON serialization
    const updateBase64 = Buffer.from(state).toString('base64');

    ws.send(
      JSON.stringify({
        type: 'sync',
        documentId,
        update: updateBase64,
      })
    );

    // Track state for broadcastToDocument call
  }

  /**
   * Handle sync update - apply Yjs update from another user
   */
  private async handleSyncUpdate(ws: WebSocket, message: WebSocketMessage) {
    const { documentId, update } = message;

    if (!documentId || !update) {
      ws.send(
        JSON.stringify({
          type: 'error',
          message: 'Missing documentId or update',
        })
      );
      return;
    }

    // Handle both Uint8Array and base64 string
    let updateArray: Uint8Array;
    if (update instanceof Uint8Array) {
      updateArray = update;
    } else if (typeof update === 'string') {
      updateArray = Buffer.from(update, 'base64');
    } else {
      ws.send(
        JSON.stringify({
          type: 'error',
          message: 'Invalid update format',
        })
      );
      return;
    }

    // Apply update to Yjs document
    collaborativeEditorService.applyUpdate(documentId, updateArray);

    // Broadcast the update to all other connected users in the document
    const connectionKey = this.getConnectionKeyForWebSocket(ws, documentId);

    this.broadcastToDocument(
      documentId,
      {
        type: 'sync_update',
        documentId,
        update: update,
      } as any,
      connectionKey
    );
  }

  /**
   * Get connection key for a WebSocket and document
   */
  private getConnectionKeyForWebSocket(ws: WebSocket, documentId: string): string | undefined {
    for (const [key, user] of this.connectedUsers.entries()) {
      if (user.ws === ws && user.documentId === documentId) {
        return key;
      }
    }
    return undefined;
  }

  /**
   * Handle WebSocket disconnection
   */
  private handleDisconnect(ws: WebSocket) {
    const disconnectedUsers: Array<{ documentId: string; userName: string }> = [];

    for (const [key, user] of this.connectedUsers.entries()) {
      if (user.ws === ws) {
        disconnectedUsers.push({
          documentId: user.documentId,
          userName: user.userName,
        });
        this.connectedUsers.delete(key);

        // Broadcast user left event
        this.broadcastToDocument(user.documentId, {
          type: 'user_left',
          documentId: user.documentId,
          users: this.getUsersForDocument(user.documentId),
          user: {
            userId: user.userId,
            userName: user.userName,
            userEmail: user.userEmail,
          },
        } as PresenceMessage);
      }
    }

    disconnectedUsers.forEach(({ documentId, userName }) => {
      console.log(`User ${userName} disconnected from document ${documentId}`);
    });
  }

  /**
   * Get all users currently connected to a specific document
   */
  private getUsersForDocument(documentId: string): Array<{
    userId: string;
    userName: string;
    userEmail: string;
  }> {
    const users: Array<{
      userId: string;
      userName: string;
      userEmail: string;
    }> = [];

    for (const user of this.connectedUsers.values()) {
      if (user.documentId === documentId) {
        users.push({
          userId: user.userId,
          userName: user.userName,
          userEmail: user.userEmail,
        });
      }
    }

    return users;
  }

  /**
   * Broadcast a message to all users in a document
   */
  private broadcastToDocument(documentId: string, message: PresenceMessage, excludeKey?: string) {
    const messageStr = JSON.stringify(message);

    for (const [key, user] of this.connectedUsers.entries()) {
      if (user.documentId === documentId && user.ws.readyState === WebSocket.OPEN) {
        if (excludeKey && key === excludeKey) continue;
        user.ws.send(messageStr);
      }
    }
  }

  /**
   * Clean up inactive connections
   * HIGH FIX: Also cleanup expired rate limit records to prevent memory leak
   */
  private cleanupInactiveConnections() {
    const now = Date.now();
    const timeout = 60000; // 1 minute timeout

    // Clean up inactive connections
    for (const [key, user] of this.connectedUsers.entries()) {
      const inactiveTime = now - user.lastSeen.getTime();
      if (inactiveTime > timeout) {
        console.log(`Cleaning up inactive connection: ${user.userEmail}`);
        user.ws.terminate();
        this.connectedUsers.delete(key);

        // Broadcast user left event
        this.broadcastToDocument(user.documentId, {
          type: 'user_left',
          documentId: user.documentId,
          users: this.getUsersForDocument(user.documentId),
          user: {
            userId: user.userId,
            userName: user.userName,
            userEmail: user.userEmail,
          },
        } as PresenceMessage);
      }
    }

    // Clean up expired rate limit records to prevent memory leak
    for (const [ip, record] of this.connectionAttempts.entries()) {
      if (now > record.resetTime) {
        this.connectionAttempts.delete(ip);
      }
    }

    // Clean up old cursor move timestamps
    const cursorTimestampThreshold = now - 60000; // 1 minute ago
    for (const [key, timestamp] of this.cursorMoveTimestamps.entries()) {
      if (timestamp < cursorTimestampThreshold) {
        this.cursorMoveTimestamps.delete(key);
      }
    }
  }

  /**
   * Get the number of connected users for a document
   */
  getConnectedUserCount(documentId: string): number {
    let count = 0;
    for (const user of this.connectedUsers.values()) {
      if (user.documentId === documentId) {
        count++;
      }
    }
    return count;
  }

  /**
   * Get all connected users
   */
  getAllConnectedUsers(): ConnectedUser[] {
    return Array.from(this.connectedUsers.values());
  }

  /**
   * Check if IP address is within rate limit
   */
  private checkRateLimit(ip: string): boolean {
    const now = Date.now();
    const record = this.connectionAttempts.get(ip);

    // Clean up expired records
    if (record && now > record.resetTime) {
      this.connectionAttempts.delete(ip);
      return true;
    }

    // Check if limit exceeded
    if (record && record.count >= this.MAX_CONNECTIONS_PER_IP) {
      return false;
    }

    // Increment counter
    if (record) {
      record.count++;
    } else {
      this.connectionAttempts.set(ip, {
        count: 1,
        resetTime: now + this.RATE_LIMIT_WINDOW_MS,
      });
    }

    return true;
  }

  /**
   * Validate WebSocket message structure and content
   */
  private validateMessage(message: WebSocketMessage): string | null {
    // Validate message type
    const validTypes = [
      'join',
      'leave',
      'cursor_move',
      'edit',
      'presence_request',
      'sync_request',
      'sync_update',
    ];
    if (!message.type || !validTypes.includes(message.type)) {
      return 'Invalid message type';
    }

    // Validate documentId format (UUID or string)
    if (message.documentId !== undefined) {
      if (typeof message.documentId !== 'string' || message.documentId.length > 100) {
        return 'Invalid document ID';
      }
    }

    // Validate token length
    if (message.token !== undefined) {
      if (typeof message.token !== 'string' || message.token.length > 5000) {
        return 'Invalid token';
      }
    }

    // Validate data object size
    if (message.data !== undefined) {
      if (typeof message.data !== 'object' || JSON.stringify(message.data).length > 10000) {
        return 'Invalid data payload';
      }
    }

    // Type-specific validation
    switch (message.type) {
      case 'join':
        if (!message.token || !message.documentId) {
          return 'Join requires token and documentId';
        }
        break;

      case 'leave':
      case 'cursor_move':
      case 'sync_request':
        if (!message.documentId) {
          return `${message.type} requires documentId`;
        }
        break;

      case 'sync_update':
        if (!message.documentId || !message.update) {
          return 'Sync update requires documentId and update';
        }
        break;
    }

    return null;
  }
}

export const webSocketService = new WebSocketService();
export default webSocketService;
