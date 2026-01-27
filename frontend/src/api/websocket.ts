/**
 * WebSocket API
 * API methods for WebSocket authentication
 */

import axios from './axios';

/**
 * Get a temporary JWT token for WebSocket authentication
 */
export async function getWebSocketToken(): Promise<string> {
  const response = await axios.post('/websocket/token');
  return response.data.data.token;
}
