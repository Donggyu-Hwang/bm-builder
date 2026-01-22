# Story 4.3: 문서 다운로드 (PDF/PPT)

**Story ID:** 4.3
**Epic:** Epic 4 - 문서 관리
**Status:** ready-for-dev
**Last Updated:** 2026-01-18

---

## User Story

**As a** 예비 창업가,
**I want** 생성된 문서를 PDF나 PPT로 다운로드하려고,
**So that** 제출하거나 공유할 수 있다.

---

## Acceptance Criteria

### AC1: 다운로드 옵션 Modal

**Given** 사용자가 문서 상세보기 modal에 있을 때
**When** 사용자가 "다운로드" 버튼을 클릭하면
**Then** 다운로드 옵션 modal이 표시된다:
  - "PDF로 다운로드"
  - "PPT (피칭 데크용) 다운로드" (피칭 데크만 해당)

### AC2: PDF 다운로드

**When** 사용자가 "PDF로 다운로드"를 선택하면
**Then** 문서가 PDF로 변환된다:
  - Backend: Puppeteer 또는 Headless Chrome 사용
  - HTML → PDF 변환
  - 파일명: "[문서 제목]_YYYYMMDD.pdf"

**And** 다운로드가 자동으로 시작된다:
  - Browser download trigger
  - "다운로드가 시작되었습니다." 메시지

**And** PDF가 다음을 포함한다:
  - 전체 문서 내용
  - 인포그래픽 (이미지로 임베디드)
  - 페이지 번호
  - Footer: "bm-builder로 생성됨"

### AC3: PPT 다운로드 (피칭 데크)

**Given** 피칭 데크 문서일 때
**When** 사용자가 "PPT 다운로드"를 선택하면
**Then** PPTX 파일이 생성된다:
  - Backend: `officegen` 또는 `pptxgenjs` 라이브러리 사용
  - 각 Slide가 별도 PPT slide로 변환
  - 파일명: "[문서 제목]_PitchDeck_YYYYMMDD.pptx"

**And** PPTX가 다음을 포함한다:
  - 10-15개 slides
  - 텍스트 (bullet points)
  - 인포그래픽 (이미지로 삽입)
  - 일관된 디자인 테마

### AC4: 에러 처리

**When** PDF/PPT 변환이 실패하면
**Then** "다운로드에 실패했습니다. 다시 시도해주세요." 에러 메시지
  - Support ticket 옵션: "문의하기"

### AC5: 다운로드 히스토리 추적

**And** 다운로드 히스토리가 추적된다:
  - `document_downloads` 테이블:
    - `user_id` (UUID)
    - `document_id` (UUID)
    - `format` (text: "pdf", "pptx")
    - `downloaded_at` (timestamp)

---

## Technical Implementation

### Database Schema

```sql
-- Document downloads table
CREATE TABLE IF NOT EXISTS document_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  format TEXT NOT NULL CHECK (format IN ('pdf', 'pptx')),
  downloaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_document_downloads_user_id ON document_downloads(user_id);
```

### PDF Generation Service

**File:** `backend/src/services/pdfGeneration.service.ts`

```typescript
import puppeteer from 'puppeteer';
import { pool } from '../utils/db';

export class PDFGenerationService {
  async generatePDF(documentId: string, userId: string): Promise<Buffer> {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
      const page = await browser.newPage();

      // Get document content
      const { rows: [doc] } = await pool.query(
        'SELECT * FROM documents WHERE id = $1 AND user_id = $2',
        [documentId, userId]
      );

      if (!doc) {
        throw new Error('Document not found');
      }

      // Create HTML from content
      const html = this.createHTML(doc);

      await page.setContent(html, { waitUntil: 'networkidle0' });

      // Generate PDF
      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '1cm',
          right: '1cm',
          bottom: '1cm',
          left: '1cm'
        }
      });

      return pdf;
    } finally {
      await browser.close();
    }
  }

  private createHTML(document: any): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Noto Sans KR', sans-serif; line-height: 1.6; padding: 2cm; }
    h1, h2, h3 { color: #333; margin-top: 1.5em; }
    p { margin-bottom: 1em; text-align: justify; }
    .footer { position: fixed; bottom: 0; left: 0; right: 0; text-align: center; font-size: 10px; color: #999; }
    img { max-width: 100%; margin: 1em 0; }
  </style>
</head>
<body>
  ${document.content}
  <div class="footer">bm-builder로 생성됨 - ${new Date().toLocaleDateString('ko-KR')}</div>
</body>
</html>
    `;
  }
}

export const pdfGenerationService = new PDFGenerationService();
```

---

## Testing Checklist

- [ ] PDF 다운로드가 작동함
- [ ] PPT 다운로드가 작동함
- [ ] 파일명이 올바르게 설정됨
- [ ] 다운로드 히스토리가 기록됨
- [ ] 변환 실패 시 에러 메시지 표시

---

## Dependencies

**Backend:**
- `puppeteer`: latest (PDF generation)
- `pptxgenjs`: latest (PPTX generation)

**Notes:**
- Puppeteer requires Chrome/Chromium installation
- For MVP, consider using API services like CloudConvert
- PDF generation can be resource-intensive

---

**Story Status:** ✅ Ready for Development
**Estimated Complexity:** High (PDF/PPT generation)
**Recommended Developer:** Dev agent
**Dependencies:** Story 4.1 (Document Save and Load), Story 3.5 (Pitch Deck)
