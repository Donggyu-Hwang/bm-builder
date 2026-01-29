import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

export interface ConnectionCreateRequest {
  sourceNodeId: string;
  targetNodeId: string;
  sourceAnchor: 'top' | 'bottom' | 'left' | 'right';
  targetAnchor: 'top' | 'bottom' | 'left' | 'right';
}

export interface ConnectionResponse {
  success: true;
  data: {
    id: string;
    sourceNodeId: string;
    targetNodeId: string;
    sourceAnchor: string;
    targetAnchor: string;
    createdAt: string;
  };
}

/**
 * Create a new connection via API
 *
 * Story 2.4: POST /api/v1/connections
 * Creates connection between two nodes with specified anchor points
 */
export async function createConnection(
  request: ConnectionCreateRequest
): Promise<ConnectionResponse> {
  try {
    const response = await axios.post<ConnectionResponse>(
      `${API_BASE_URL}/connections`,
      request
    );
    return response.data;
  } catch (error) {
    console.error('[API] Failed to create connection:', error);
    throw error;
  }
}

/**
 * Delete a connection via API
 *
 * Story 2.4: DELETE /api/v1/connections/:id
 * Removes connection from database
 */
export async function deleteConnection(
  connectionId: string
): Promise<{ success: true }> {
  try {
    const response = await axios.delete<{ success: true }>(
      `${API_BASE_URL}/connections/${connectionId}`
    );
    return response.data;
  } catch (error) {
    console.error('[API] Failed to delete connection:', error);
    throw error;
  }
}

/**
 * Get all connections for a specific node
 *
 * Optional: Used for loading existing connections
 */
export async function getNodeConnections(
  nodeId: string
): Promise<ConnectionResponse> {
  try {
    const response = await axios.get<ConnectionResponse>(
      `${API_BASE_URL}/nodes/${nodeId}/connections`
    );
    return response.data;
  } catch (error) {
    console.error('[API] Failed to fetch node connections:', error);
    throw error;
  }
}
