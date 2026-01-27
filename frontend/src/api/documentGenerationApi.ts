/**
 * Document Generation API Client
 * Handles all API calls for document generation feature
 * Uses axios with httpOnly cookies for authentication (secure, XSS-protected)
 */

import api from './axios';
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

/**
 * Get all document templates
 */
export const getAllTemplates = async (): Promise<DocumentTemplate[]> => {
  const response = await api.get('/document-generation/templates');
  return response.data.data as DocumentTemplate[];
};

/**
 * Get templates by category
 */
export const getTemplatesByCategory = async (
  category: 'gov_support' | 'ir_material'
): Promise<DocumentTemplate[]> => {
  const response = await api.get(`/document-generation/templates/category/${category}`);
  return response.data.data as DocumentTemplate[];
};

/**
 * Start a new document generation session
 */
export const startSession = async (request: StartSessionRequest): Promise<StartSessionResponse> => {
  const response = await api.post('/document-generation/start', request);
  return response.data.data as StartSessionResponse;
};

/**
 * Save answer to current question
 */
export const saveAnswer = async (
  sessionId: string,
  request: SaveAnswerRequest
): Promise<SaveAnswerResponse> => {
  const response = await api.post(`/document-generation/${sessionId}/answer`, request);
  return response.data.data as SaveAnswerResponse;
};

/**
 * Complete the interview phase
 */
export const completeInterview = async (sessionId: string): Promise<CompleteInterviewResponse> => {
  const response = await api.post(`/document-generation/${sessionId}/complete-interview`);
  return response.data.data as CompleteInterviewResponse;
};

/**
 * Abandon the current session
 */
export const abandonSession = async (sessionId: string): Promise<AbandonSessionResponse> => {
  const response = await api.delete(`/document-generation/${sessionId}`);
  return response.data.data as AbandonSessionResponse;
};

/**
 * Get session progress
 */
export const getSessionProgress = async (sessionId: string): Promise<SessionProgress> => {
  const response = await api.get(`/document-generation/${sessionId}/progress`);
  return response.data.data as SessionProgress;
};
