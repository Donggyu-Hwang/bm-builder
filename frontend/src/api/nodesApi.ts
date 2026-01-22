/**
 * Node Canvas API
 * API client for node management operations
 * Story 6.2: Node Drag-and-Drop and Editing
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Node data structure
 */
export interface NodeData {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: {
    label: string;
    title?: string;
    status?: string;
    wordCount?: number;
    lastEdited?: string;
    color?: string;
    icon?: string;
    notes?: string;
  };
}

/**
 * Update nodes for a document
 * @param documentId - Document ID
 * @param nodes - Array of nodes with positions and metadata
 * @returns Updated nodes data
 */
export async function updateDocumentNodes(
  documentId: string,
  nodes: NodeData[]
): Promise<{ nodes: any[] }> {
  const token = localStorage.getItem('token');

  const response = await axios.put(
    `${API_BASE_URL}/api/v1/documents/${documentId}/nodes`,
    { nodes },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  return response.data.data;
}

/**
 * Update a single node's data
 * @param documentId - Document ID
 * @param nodeId - Node ID
 * @param updates - Node updates (title, color, icon, notes, position)
 * @returns Updated node data
 */
export async function updateNode(
  documentId: string,
  nodeId: string,
  updates: Partial<NodeData>
): Promise<any> {
  const token = localStorage.getItem('token');

  const response = await axios.patch(
    `${API_BASE_URL}/api/v1/documents/${documentId}/nodes/${nodeId}`,
    updates,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  return response.data.data;
}

/**
 * Delete a node
 * @param documentId - Document ID
 * @param nodeId - Node ID
 */
export async function deleteNode(documentId: string, nodeId: string): Promise<void> {
  const token = localStorage.getItem('token');

  await axios.delete(
    `${API_BASE_URL}/api/v1/documents/${documentId}/nodes/${nodeId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
}

/**
 * Duplicate a node
 * @param documentId - Document ID
 * @param nodeId - Node ID to duplicate
 * @returns Duplicated node data
 */
export async function duplicateNode(
  documentId: string,
  nodeId: string
): Promise<any> {
  const token = localStorage.getItem('token');

  const response = await axios.post(
    `${API_BASE_URL}/api/v1/documents/${documentId}/nodes/${nodeId}/duplicate`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  return response.data.data;
}

export const nodesApi = {
  updateDocumentNodes,
  updateNode,
  deleteNode,
  duplicateNode,
};
