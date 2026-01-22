/**
 * Document Generation API Client
 * Handles all API calls for document generation feature
 */

import {
  DocumentTemplate,
  SessionProgress,
  StartSessionRequest,
  StartSessionResponse,
  SaveAnswerRequest,
  SaveAnswerResponse,
  CompleteInterviewResponse,
  AbandonSessionResponse,
} from '../../../shared/types/documentGeneration.types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

/**
 * Get authentication token from localStorage
 */
const getAuthToken = (): string => {
  const token = localStorage.getItem('auth_token');
  if (!token) {
    throw new Error('No authentication token found');
  }
  return token;
};

/**
 * Make authenticated API request
 */
const authenticatedFetch = async (url: string, options?: RequestInit): Promise<Response> => {
  const token = getAuthToken();
  return fetch(url, {
    ...options,
    headers: {
      ...options?.headers,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
};

/**
 * Get all document templates
 */
export const getAllTemplates = async (): Promise<DocumentTemplate[]> => {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/api/v1/document-generation/templates`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch templates: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data as DocumentTemplate[];
};

/**
 * Get templates by category
 */
export const getTemplatesByCategory = async (
  category: 'gov_support' | 'ir_material'
): Promise<DocumentTemplate[]> => {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/api/v1/document-generation/templates/category/${category}`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch templates for category ${category}: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data as DocumentTemplate[];
};

/**
 * Start a new document generation session
 */
export const startSession = async (
  request: StartSessionRequest
): Promise<StartSessionResponse> => {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/api/v1/document-generation/start`,
    {
      method: 'POST',
      body: JSON.stringify(request),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to start session: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data as StartSessionResponse;
};

/**
 * Save answer to current question
 */
export const saveAnswer = async (
  sessionId: string,
  request: SaveAnswerRequest
): Promise<SaveAnswerResponse> => {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/api/v1/document-generation/${sessionId}/answer`,
    {
      method: 'POST',
      body: JSON.stringify(request),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to save answer: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data as SaveAnswerResponse;
};

/**
 * Complete the interview phase
 */
export const completeInterview = async (
  sessionId: string
): Promise<CompleteInterviewResponse> => {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/api/v1/document-generation/${sessionId}/complete-interview`,
    {
      method: 'POST',
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to complete interview: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data as CompleteInterviewResponse;
};

/**
 * Abandon the current session
 */
export const abandonSession = async (
  sessionId: string
): Promise<AbandonSessionResponse> => {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/api/v1/document-generation/${sessionId}`,
    {
      method: 'DELETE',
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to abandon session: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data as AbandonSessionResponse;
};

/**
 * Get session progress
 */
export const getSessionProgress = async (
  sessionId: string
): Promise<SessionProgress> => {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/api/v1/document-generation/${sessionId}/progress`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch session progress: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data as SessionProgress;
};
