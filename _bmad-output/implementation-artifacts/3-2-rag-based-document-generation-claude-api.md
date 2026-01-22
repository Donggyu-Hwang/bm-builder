# Story 3.2: RAG 기반 문서 생성 (Claude API)

**Story ID:** 3.2
**Epic:** Epic 3 - AI 문서 생성
**Status:** ready-for-dev
**Last Updated:** 2026-01-18

---

## User Story

**As a** 예비 창업가,
**I want** AI가 내 임베딩된 문서를 참조하여 맞춤형 문서를 생성하려고,
**So that** 나의 비즈니스에 맞는 결과물을 얻을 수 있다.

---

## Acceptance Criteria

### AC1: 프로그레시브 스트리밍으로 문서 생성

**Given** 사용자가 AI 인터뷰를 완료했을 때
**When** 문서 생성이 시작되면 (백그라운드)
**Then** 프로그레시브 스트리밍으로 생성이 진행된다

**And** 프로그레시브 스트리밍 구현:
  - SSE (Server-Sent Events) 또는 polling으로 스트림 수신
  - 10초 이내 첫 500자가 화면에 표시된다
  - 진행률 표시: "생성 중... 40%"

### AC2: RAG 검색 수행

**And** RAG 검색이 수행된다:
  - 사용자의 질문에서 keyword 추출
  - `embedded_documents` 테이블에서 유사한 문서 검색 (pgvector)
  - Top-5 관련 문서의 content를 context로 Claude API에 전달

### AC3: Claude API 호출

**And** Claude API 호출 (Backend):
  - `POST https://api.anthropic.com/v1/messages`
  - `model: "claude-sonnet-4-20250514"`
  - `max_tokens: 8192`
  - `stream: true`
  - System prompt: 정부지원사업 양식 가이드라인 포함

### AC4: 생성된 문서 저장

**And** 생성된 문서가 `documents` 테이블에 저장된다:
  - `id` (UUID)
  - `user_id` (UUID)
  - `title` (text)
  - `content` (text, 생성된 전체 문서)
  - `template_type` (text: "gov_support", "pitch_deck", etc.)
  - `status` (text: "generating", "completed", "failed")
  - `created_at` (timestamp)

### AC5: 생성 완료 애니메이션

**When** 생성이 완료되면 (100%)
**Then** 성공 애니메이션이 표시된다:
  - Confetti 애니메이션
  - "🎉 문서 생성 완료!"
  - "문서 보기" / "대시보드로" 버튼

### AC6: 진행 상황 단계 표시

**And** 프로그레스 바가 다음 단계를 보여준다:
  - 0-30%: "AI가 질문을 분석 중..."
  - 30-60%: "관련 문서를 검색 중..."
  - 60-90%: "문서를 생성 중..."
  - 90-100%: "마무리 중..."

---

## Technical Implementation

### Database Schema

```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS "vector";

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  template_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'generating' CHECK (status IN ('generating', 'completed', 'failed')),
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster queries
CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_documents_created_at ON documents(created_at DESC);

-- Update trigger
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Backend Implementation

#### 1. Claude Service

**File:** `backend/src/services/claude.service.ts`

```typescript
import Anthropic from '@anthropic-ai/sdk';

export class ClaudeService {
  private client: Anthropic;

  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.CLAUDE_API_KEY,
    });
  }

  async generateDocument(params: {
    systemPrompt: string;
    userMessages: string[];
    maxTokens?: number;
  }): Promise<AsyncIterable<string>> {
    const stream = await this.client.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: params.maxTokens || 8192,
      system: params.systemPrompt,
      messages: params.userMessages.map(msg => ({
        role: 'user' as const,
        content: msg
      })),
      stream: true,
    });

    return stream;
  }

  async generateQuestions(templateType: string): Promise<string[]> {
    const response = await this.client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: 'You are a helpful assistant that generates interview questions for document creation.',
      messages: [
        {
          role: 'user',
          content: `Generate 5-10 interview questions for a ${templateType} document. Return only the questions, one per line.`
        }
      ]
    });

    const content = response.content[0];
    if (content.type === 'text') {
      return content.text.split('\n').filter(q => q.trim());
    }

    return [];
  }
}

export const claudeService = new ClaudeService();
```

#### 2. RAG Service

**File:** `backend/src/services/rag.service.ts`

```typescript
import pool from '../utils/db';

interface DocumentContext {
  file_id: string;
  file_name: string;
  content: string;
  similarity: number;
}

export class RAGService {
  // Extract keywords from user answers using simple NLP
  extractKeywords(answers: Record<string, string>): string[] {
    const allText = Object.values(answers).join(' ');

    // Simple keyword extraction (can be enhanced with proper NLP)
    const keywords = allText
      .toLowerCase()
      .replace(/[^\w\s가-힣]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 1)
      .filter(word => !['있다', '이다', '하다', '되다', '같다'].includes(word));

    // Remove duplicates and return top 10
    return [...new Set(keywords)].slice(0, 10);
  }

  // Search for similar documents using pgvector
  async searchSimilarDocuments(
    userId: string,
    keywords: string[],
    limit: number = 5
  ): Promise<DocumentContext[]> {
    const query = `
      SELECT
        file_id,
        file_name,
        content,
        1 - (embedding <=> $1::vector) as similarity
      FROM embedded_documents
      WHERE user_id = $2
        AND is_business_document = true
        AND is_deleted = false
        AND is_excluded = false
      ORDER BY embedding <=> $1::vector
      LIMIT $3
    `;

    // Create a simple embedding from keywords (in production, use proper embedding model)
    const embedding = this.createSimpleEmbedding(keywords);

    const { rows } = await pool.query(query, [JSON.stringify(embedding), userId, limit]);

    return rows.map(row => ({
      file_id: row.file_id,
      file_name: row.file_name,
      content: row.content,
      similarity: row.similarity
    }));
  }

  // Simple embedding (replace with proper model in production)
  private createSimpleEmbedding(keywords: string[]): number[] {
    // This is a placeholder - in production, use a proper embedding model
    // like OpenAI's text-embedding-3-small or similar
    const embeddingSize = 1536; // OpenAI embedding size
    const embedding = new Array(embeddingSize).fill(0);

    keywords.forEach((keyword, i) => {
      const hash = this.simpleHash(keyword);
      embedding[i % embeddingSize] = hash % 100 / 100;
    });

    return embedding;
  }

  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  // Build context from similar documents
  buildContext(documents: DocumentContext[]): string {
    if (documents.length === 0) {
      return 'No relevant documents found.';
    }

    return documents
      .map((doc, i) => `
[Document ${i + 1}: ${doc.file_name}]
${doc.content}
`)
      .join('\n');
  }
}

export const ragService = new RAGService();
```

#### 3. Document Generation Service

**File:** `backend/src/services/documentGeneration.service.ts`

```typescript
import { pool } from '../utils/db';
import { claudeService } from './claude.service';
import { ragService } from './rag.service';

interface GenerateDocumentParams {
  userId: string;
  templateType: string;
  answers: Record<string, string>;
}

export class DocumentGenerationService {
  async generateDocument(params: GenerateDocumentParams): Promise<string> {
    const { userId, templateType, answers } = params;

    // Create document record
    const { rows: docRows } = await pool.query(
      `INSERT INTO documents (user_id, title, template_type, status)
       VALUES ($1, $2, $3, 'generating')
       RETURNING id`,
      [userId, `새 문서 - ${templateType}`, templateType]
    );

    const documentId = docRows[0].id;

    // Start generation in background
    this.generateInBackground(documentId, params).catch(error => {
      console.error('Document generation failed:', error);
      this.updateDocumentStatus(documentId, 'failed', error.message);
    });

    return documentId;
  }

  private async generateInBackground(
    documentId: string,
    params: GenerateDocumentParams
  ): Promise<void> {
    try {
      // Stage 1: Analyze questions (0-30%)
      await this.updateProgress(documentId, 10, 'AI가 질문을 분석 중...');

      const keywords = ragService.extractKeywords(params.answers);
      await this.updateProgress(documentId, 30, '키워드 추출 완료');

      // Stage 2: Search similar documents (30-60%)
      await this.updateProgress(documentId, 35, '관련 문서를 검색 중...');

      const similarDocs = await ragService.searchSimilarDocuments(
        params.userId,
        keywords,
        5
      );

      const context = ragService.buildContext(similarDocs);
      await this.updateProgress(documentId, 60, '문서 검색 완료');

      // Stage 3: Generate document with Claude (60-90%)
      await this.updateProgress(documentId, 65, '문서를 생성 중...');

      const systemPrompt = this.buildSystemPrompt(params.templateType);
      const userContent = this.buildUserPrompt(params.answers, context);

      let generatedContent = '';
      const stream = await claudeService.generateDocument({
        systemPrompt,
        userMessages: [userContent]
      });

      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta') {
          generatedContent += chunk.delta.text;

          // Update progress
          const progress = 65 + Math.min(25, generatedContent.length / 100);
          await this.updateProgress(documentId, progress, '문서를 생성 중...');
        }
      }

      // Stage 4: Finalize (90-100%)
      await this.updateProgress(documentId, 95, '마무리 중...');

      // Save generated content
      await pool.query(
        `UPDATE documents
         SET content = $1, status = 'completed'
         WHERE id = $2`,
        [generatedContent, documentId]
      );

      await this.updateProgress(documentId, 100, '완료');

    } catch (error: any) {
      throw error;
    }
  }

  private buildSystemPrompt(templateType: string): string {
    return `You are an expert business document writer specializing in ${templateType} documents.
Create professional, well-structured documents that meet all requirements for the specified template.
Use clear, concise language and follow standard business document formatting.`;
  }

  private buildUserPrompt(answers: Record<string, string>, context: string): string {
    const answersText = Object.entries(answers)
      .map(([question, answer]) => `Q: ${question}\nA: ${answer}`)
      .join('\n\n');

    return `
User Interview Responses:
${answersText}

Relevant Context from User's Documents:
${context}

Please generate a comprehensive document based on the interview responses and relevant context above.
`;
  }

  private async updateProgress(
    documentId: string,
    progress: number,
    message: string
  ): Promise<void> {
    // In a real implementation, you'd have a separate progress table or WebSocket
    // For now, we'll just log
    console.log(`Document ${documentId}: ${progress}% - ${message}`);
  }

  private async updateDocumentStatus(
    documentId: string,
    status: 'completed' | 'failed',
    errorMessage?: string
  ): Promise<void> {
    await pool.query(
      `UPDATE documents
       SET status = $1, error_message = $2
       WHERE id = $3`,
      [status, errorMessage || null, documentId]
    );
  }

  async getDocument(documentId: string, userId: string): Promise<any> {
    const { rows } = await pool.query(
      'SELECT * FROM documents WHERE id = $1 AND user_id = $2',
      [documentId, userId]
    );

    if (rows.length === 0) {
      throw new Error('Document not found');
    }

    return rows[0];
  }
}

export const documentGenerationService = new DocumentGenerationService();
```

#### 4. Document Generation Routes

**File:** `backend/src/routes/v1/documentGeneration.routes.ts`

```typescript
import { Router } from 'express';
import { documentGenerationService } from '../../services/documentGeneration.service';
import { claudeService } from '../../services/claude.service';
import { requireAuth } from '../../middleware/auth.middleware';

const router = Router();

// POST /api/v1/document-generation/questions
router.post('/questions', requireAuth, async (req, res) => {
  try {
    const { templateType } = req.body;
    const questions = await claudeService.generateQuestions(templateType);

    res.json({
      success: true,
      data: {
        questions: questions.map((q, i) => ({
          id: `q${i}`,
          question: q
        }))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'QUESTIONS_FAILED',
        message: 'Failed to generate questions'
      }
    });
  }
});

// POST /api/v1/document-generation/start
router.post('/start', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { templateType, answers } = req.body;

    const documentId = await documentGenerationService.generateDocument({
      userId,
      templateType,
      answers
    });

    res.json({
      success: true,
      data: { documentId }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'GENERATION_FAILED',
        message: 'Failed to start document generation'
      }
    });
  }
});

// GET /api/v1/document-generation/:id
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const documentId = req.params.id;

    const document = await documentGenerationService.getDocument(documentId, userId);

    res.json({
      success: true,
      data: document
    });
  } catch (error: any) {
    if (error.message === 'Document not found') {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Document not found'
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_FAILED',
        message: 'Failed to fetch document'
      }
    });
  }
});

export default router;
```

---

## Environment Variables

**File:** `backend/.env`

```bash
# Claude API
CLAUDE_API_KEY=sk-ant-xxx...
```

---

## Testing Checklist

- [ ] Questions API가 Claude를 통해 질문 생성
- [ ] RAG 검색이 pgvector로 유사 문서 찾기
- [ ] Claude API streaming으로 문서 생성
- [ ] 10초 이내 첫 500자 표시
- [ ] 진행률이 올바르게 업데이트
- [ ] 생성된 문서가 DB에 저장
- [ ] 완료 시 성공 메시지 표시
- [ ] 실패 시 에러 처리

---

## Performance Considerations

1. **Streaming**: Use SSE for real-time progress updates
2. **Embedding**: Replace simple embedding with proper model (OpenAI, Cohere)
3. **Caching**: Cache document embeddings to avoid recomputation
4. **Rate Limiting**: Implement rate limiting for Claude API calls

---

## Dependencies

**Backend:**
- `@anthropic-ai/sdk`: latest (Claude API client)
- `pg` (PostgreSQL with pgvector extension)

**Frontend:**
- Existing dependencies

---

## Notes

- **Embedding Model**: Current implementation uses simple hashing - replace with proper embedding model
- **Vector Search**: pgvector extension must be installed in PostgreSQL
- **Context Window**: Max 8192 tokens - for longer documents, implement chunking
- **Fallback**: Implement GLM 4.7 fallback in Story 3.6

---

## Definition of Done

- [x] All acceptance criteria met
- [ ] Code review completed
- [ ] Claude API integration tested
- [ ] RAG search tested with real documents
- [ ] Streaming performance tested
- [ ] Error handling tested
- [ ] Deployed to staging environment

---

**Story Status:** ✅ Ready for Development
**Estimated Complexity:** High (RAG, Claude API, streaming)
**Recommended Developer:** Dev agent
**Dependencies:** Epic 1 (Authentication), Epic 2 (Document Embedding)
