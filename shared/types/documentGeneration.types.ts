/**
 * Document Generation Types
 * Shared types for document generation feature
 */

export type DocumentCategory = 'gov_support' | 'ir_material';

export type SessionStatus = 'interview' | 'generating' | 'completed' | 'failed' | 'abandoned';

export interface DocumentTemplate {
  id: string;
  template_type: string;
  template_name: string;
  category: DocumentCategory;
  description: string;
  prompt_template: string;
  questions_min: number;
  questions_max: number;
  created_at: string;
}

export interface DocumentGenerationSession {
  id: string;
  user_id: string;
  template_type: string;
  status: SessionStatus;
  answers_json: Record<string, string>;
  current_question_number: number;
  created_at: string;
  updated_at: string;
}

export interface InterviewQuestion {
  question_number: number;
  question_text: string;
  answer?: string;
}

export interface SessionProgress {
  session_id: string;
  template_type: string;
  template_name: string;
  category: DocumentCategory;
  status: SessionStatus;
  current_question: number;
  total_questions: number;
  answers: Record<string, string>;
  answer_count: number;
}

// API Request/Response Types
export interface StartSessionRequest {
  template_type: string;
}

export interface StartSessionResponse {
  session_id: string;
  template_type: string;
  template_name: string;
  category: DocumentCategory;
}

export interface SaveAnswerRequest {
  question_number: number;
  answer: string;
}

export interface SaveAnswerResponse {
  message: string;
}

export interface CompleteInterviewResponse {
  message: string;
  session_id: string;
  answer_count: number;
}

export interface AbandonSessionResponse {
  message: string;
}
