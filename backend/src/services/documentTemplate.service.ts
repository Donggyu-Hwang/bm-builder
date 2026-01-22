import pool from '../utils/db';

// Template interfaces
export interface DocumentTemplate {
  id: string;
  template_type: string;
  template_name: string;
  category: 'gov_support' | 'ir_material';
  description: string;
  prompt_template: string;
  questions_min: number;
  questions_max: number;
  created_at: Date;
}

export interface DocumentGenerationSession {
  id: string;
  user_id: string;
  template_type: string;
  status: 'interview' | 'generating' | 'completed' | 'failed' | 'abandoned';
  answers_json: Record<string, string>;
  current_question_number: number;
  created_at: Date;
  updated_at: Date;
}

/**
 * Document Template Service
 * Handles document template management and session tracking
 */
export class DocumentTemplateService {
  /**
   * Get all document templates
   */
  async getAllTemplates(): Promise<DocumentTemplate[]> {
    const { rows } = await pool.query(
      `SELECT id, template_type, template_name, category, description, prompt_template, questions_min, questions_max, created_at
       FROM document_templates
       ORDER BY category, template_name`
    );
    return rows as DocumentTemplate[];
  }

  /**
   * Get templates by category
   */
  async getTemplatesByCategory(category: 'gov_support' | 'ir_material'): Promise<DocumentTemplate[]> {
    const { rows } = await pool.query(
      `SELECT id, template_type, template_name, category, description, prompt_template, questions_min, questions_max, created_at
       FROM document_templates
       WHERE category = $1
       ORDER BY template_name`,
      [category]
    );
    return rows as DocumentTemplate[];
  }

  /**
   * Get template by type
   */
  async getTemplateByType(templateType: string): Promise<DocumentTemplate | null> {
    const { rows } = await pool.query(
      `SELECT id, template_type, template_name, category, description, prompt_template, questions_min, questions_max, created_at
       FROM document_templates
       WHERE template_type = $1`,
      [templateType]
    );

    if (rows.length === 0) {
      return null;
    }

    return rows[0] as DocumentTemplate;
  }

  /**
   * Create a new document generation session
   */
  async createSession(userId: string, templateType: string): Promise<DocumentGenerationSession> {
    const { rows } = await pool.query(
      `INSERT INTO document_generation_sessions (user_id, template_type, status)
       VALUES ($1, $2, 'interview')
       RETURNING id, user_id, template_type, status, answers_json, current_question_number, created_at, updated_at`,
      [userId, templateType]
    );

    return rows[0] as DocumentGenerationSession;
  }

  /**
   * Get session by ID
   */
  async getSession(sessionId: string, userId: string): Promise<DocumentGenerationSession | null> {
    const { rows } = await pool.query(
      `SELECT id, user_id, template_type, status, answers_json, current_question_number, created_at, updated_at
       FROM document_generation_sessions
       WHERE id = $1 AND user_id = $2`,
      [sessionId, userId]
    );

    if (rows.length === 0) {
      return null;
    }

    return rows[0] as DocumentGenerationSession;
  }

  /**
   * Save answer to session
   */
  async saveAnswer(
    sessionId: string,
    userId: string,
    questionNumber: number,
    answer: string
  ): Promise<void> {
    await pool.query(
      `UPDATE document_generation_sessions
       SET answers_json = jsonb_set(
         COALESCE(answers_json, '{}'::jsonb),
         $1,
         $2
       ),
       updated_at = CURRENT_TIMESTAMP
       WHERE id = $3 AND user_id = $4`,
      [`$${questionNumber}`, answer, sessionId, userId]
    );
  }

  /**
   * Update session status
   */
  async updateSessionStatus(
    sessionId: string,
    userId: string,
    status: 'interview' | 'generating' | 'completed' | 'failed' | 'abandoned'
  ): Promise<void> {
    await pool.query(
      `UPDATE document_generation_sessions
       SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND user_id = $3`,
      [status, sessionId, userId]
    );
  }

  /**
   * Update current question number
   */
  async updateCurrentQuestion(sessionId: string, userId: string, questionNumber: number): Promise<void> {
    await pool.query(
      `UPDATE document_generation_sessions
       SET current_question_number = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND user_id = $3`,
      [questionNumber, sessionId, userId]
    );
  }

  /**
   * Get session answers
   */
  async getSessionAnswers(sessionId: string, userId: string): Promise<Record<string, string>> {
    const { rows } = await pool.query(
      `SELECT answers_json
       FROM document_generation_sessions
       WHERE id = $1 AND user_id = $2`,
      [sessionId, userId]
    );

    if (rows.length === 0) {
      return {};
    }

    return rows[0].answers_json as Record<string, string>;
  }
}

// Export singleton instance
export const documentTemplateService = new DocumentTemplateService();
