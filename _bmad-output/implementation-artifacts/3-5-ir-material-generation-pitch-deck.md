# Story 3.5: IR 자료 생성 (피칭 데크)

**Story ID:** 3.5
**Epic:** Epic 3 - AI 문서 생성
**Status:** ready-for-dev
**Last Updated:** 2026-01-18

---

## User Story

**As a** 예비 창업가,
**I want** 피칭 데크를 자동으로 생성하려고,
**So that** 투자자 미팅을 준비할 수 있다.

---

## Acceptance Criteria

### AC1: 피칭 데크 구조

**Given** 사용자가 IR 자료 > "피칭 데크"를 선택했을 때
**When** AI 인터뷰가 완료되면
**Then** 10-15장의 피칭 데크가 생성된다

**And** 피칭 데크가 다음 구조를 따른다:
  - Slide 1: Title, Tagline, Logo
  - Slide 2: Problem (문제 정의)
  - Slide 3: Solution (해결책)
  - Slide 4: Market Opportunity (시장 기회)
  - Slide 5: Product (제품/서비스)
  - Slide 6: Business Model (비즈니스 모델)
  - Slide 7: Traction (성과)
  - Slide 8: Competition (경쟁사)
  - Slide 9: Team (팀 소개)
  - Slide 10: Financials (재무)
  - Slide 11-15: Appendix (부록)

### AC2: Slide 구성

**And** 각 Slide가 다음을 포함한다:
  - Title (대제목)
  - Content (본문, bullet points)
  - Figure (인포그래픽, 선택 사항)
  - Notes (발표자 노트, 선택 사항)

### AC3: Slide 저장

**And** 생성된 피칭 데크가 다음 형식으로 저장된다:
  - `document_slides` 테이블:
    - `document_id` (UUID)
    - `slide_number` (integer)
    - `title` (text)
    - `content` (text, markdown)
    - `figure_id` (UUID, foreign key to `document_figures`, nullable)
  - PPTX로 다운로드 가능 (Story 4.3)

### AC4: 완료 메시지

**When** 피칭 데크 생성이 완료되면
**Then** "피칭 데크가 준비되었습니다! 📊" 메시지
  - 미리보기 modal: Slide 1부터 carousel로 표시
  - "다운로드" / "편집" / "대시보드로" 버튼

### AC5: 순서 변경

**And** 사용자가 Slide를 순서를 변경할 수 있다:
  - Drag & drop으로 재배열
  - "저장" 버튼으로 순서 업데이트

---

## Technical Implementation

### Database Schema

```sql
-- Document slides table
CREATE TABLE IF NOT EXISTS document_slides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  slide_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  figure_id UUID REFERENCES document_figures(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(document_id, slide_number)
);

CREATE INDEX idx_document_slides_document_id ON document_slides(document_id);
```

### Backend Implementation

**File:** `backend/src/services/pitchDeck.service.ts`

```typescript
import { pool } from '../utils/db';
import { claudeService } from './claude.service';

interface GeneratePitchDeckParams {
  userId: string;
  answers: Record<string, string>;
}

export class PitchDeckService {
  async generatePitchDeck(params: GeneratePitchDeckParams): Promise<string> {
    // Create document record
    const { rows: docRows } = await pool.query(
      `INSERT INTO documents (user_id, title, template_type, status)
       VALUES ($1, $2, 'pitch_deck', 'generating')
       RETURNING id`,
      [params.userId, '피칭 데크']
    );

    const documentId = docRows[0].id;

    // Generate slides
    await this.generateSlides(documentId, params.answers);

    return documentId;
  }

  private async generateSlides(
    documentId: string,
    answers: Record<string, string>
  ): Promise<void> {
    const systemPrompt = `You are an expert pitch deck creator.
Generate 10-15 slides following standard pitch deck structure.
Each slide should have a title and bullet points.
Format as markdown.`;

    const userPrompt = `
Create a pitch deck based on these interview responses:
${JSON.stringify(answers, null, 2)}

Generate slides in the following format:
---
SLIDE 1: Title
Title: [Company Name]
Tagline: [One-line description]
---

SLIDE 2: Problem
Title: The Problem
- [Problem point 1]
- [Problem point 2]
- [Problem point 3]
---

[Continue for all slides]
`;

    const stream = await claudeService.generateDocument({
      systemPrompt,
      userMessages: [userPrompt]
    });

    let generatedContent = '';
    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta') {
        generatedContent += chunk.delta.text;
      }
    }

    // Parse and save slides
    await this.parseAndSaveSlides(documentId, generatedContent);
  }

  private async parseAndSaveSlides(
    documentId: string,
    content: string
  ): Promise<void> {
    const slides = content.split('---').filter(s => s.trim());

    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i];
      const titleMatch = slide.match(/Title: (.+)/);
      const title = titleMatch ? titleMatch[1] : `Slide ${i + 1}`;

      await pool.query(
        `INSERT INTO document_slides (document_id, slide_number, title, content)
         VALUES ($1, $2, $3, $4)`,
        [documentId, i + 1, title, slide.trim()]
      );
    }
  }

  async getSlides(documentId: string): Promise<any[]> {
    const { rows } = await pool.query(
      `SELECT * FROM document_slides
       WHERE document_id = $1
       ORDER BY slide_number`,
      [documentId]
    );

    return rows;
  }

  async reorderSlide(
    slideId: string,
    newOrder: number
  ): Promise<void> {
    await pool.query(
      `UPDATE document_slides
       SET slide_number = $1
       WHERE id = $2`,
      [newOrder, slideId]
    );
  }
}

export const pitchDeckService = new PitchDeckService();
```

---

## Testing Checklist

- [ ] 10-15장의 슬라이드가 생성됨
- [ ] 각 슬라이드가 올바른 구조를 따름
- [ ] 미리보기 carousel이 작동함
- [ ] Drag & drop으로 순서 변경 가능
- [ ] PPTX 다운로드 가능 (Story 4.3)

---

## Definition of Done

- [x] All acceptance criteria met
- [ ] Pitch deck structure validated
- [ ] Slide parsing tested
- [ ] Preview carousel implemented
- [ ] Drag & drop reorder tested

---

**Story Status:** ✅ Ready for Development
**Estimated Complexity:** High (slide parsing, carousel UI, drag & drop)
**Recommended Developer:** Dev agent
**Dependencies:** Story 3.1 (Document Generation UI), Story 3.2 (RAG-based Generation)
