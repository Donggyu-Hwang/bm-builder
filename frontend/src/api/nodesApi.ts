import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

export interface NodePosition {
  x: number;
  y: number;
}

export interface NodeUpdateRequest {
  position: NodePosition;
}

export interface NodeResponse {
  success: true;
  data: {
    id: string;
    x: number;
    y: number;
    updated_at: string;
  };
}

/**
 * Update node position via API
 *
 * Story 2.3: Debounce 300ms 후 서버 API가 호출된다
 * This function is called after drag ends with debouncing
 */
export async function updateNodePosition(
  nodeId: string,
  position: NodePosition
): Promise<NodeResponse> {
  try {
    const response = await axios.patch<NodeResponse>(
      `${API_BASE_URL}/nodes/${nodeId}`,
      { position }
    );
    return response.data;
  } catch (error) {
    console.error('[API] Failed to update node position:', error);
    throw error;
  }
}

/**
 * Batch update multiple node positions (for multi-select drag)
 *
 * Story 2.3: Shift+Click multi-select drag
 */
export async function updateMultipleNodePositions(
  updates: Array<{ nodeId: string; position: NodePosition }>
): Promise<NodeResponse[]> {
  try {
    const response = await axios.patch<NodeResponse[]>(
      `${API_BASE_URL}/nodes/batch`,
      { updates }
    );
    return response.data;
  } catch (error) {
    console.error('[API] Failed to batch update node positions:', error);
    throw error;
  }
}
