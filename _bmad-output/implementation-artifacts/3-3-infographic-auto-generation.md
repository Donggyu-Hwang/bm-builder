# Story 3.3: 인포그래픽 자동 생성

**Story ID:** 3.3
**Epic:** Epic 3 - AI 문서 생성
**Status:** ready-for-dev
**Last Updated:** 2026-01-18

---

## User Story

**As a** 예비 창업가,
**I want** AI가 차트와 그래프를 자동으로 생성하려고,
**So that** 전문가급 시각 자료를 얻을 수 있다.

---

## Acceptance Criteria

### AC1: 인포그래픽 생성 트리거

**Given** 문서 생성 중 텍스트가 완료되었을 때
**When** 문서에 인포그래픽이 필요한 부분이 있으면
**Then** Claude 4.5 멀티모달 능력으로 인포그래픽이 생성된다

### AC2: 인포그래픽 형식

**And** 인포그래픽이 다음 형식을 지원한다:
  - Bar chart (시장 규모 비교)
  - Line chart (성장 추세)
  - Pie chart (시장 점유율)
  - Flow chart (비즈니스 프로세스)

### AC3: 인포그래픽 저장

**And** 인포그래픽이 `document_figures` 테이블에 저장된다:
  - `id` (UUID)
  - `document_id` (UUID)
  - `figure_type` (text: "bar", "line", "pie", "flow")
  - `image_url` (text, S3 또는 PostgreSQL bytea)
  - `caption` (text)
  - `order` (integer)

### AC4: 문서에 삽입

**When** 인포그래픽 생성이 완료되면
**Then** 문서 내에서 자동으로 해당 위치에 삽입된다
  - 텍스트: "[그림 1: 시장 규모 비교]" 이미지 placeholder → 실제 이미지로 교체

### AC5: 재생성 기능

**And** 사용자가 인포그래픽을 재생성할 수 있다:
  - 이미지를 클릭 → "재생성" 버튼
  - 프롬프트: "이 차트를 더 명확하게 재생성해줘"

### AC6: 실패 처리

**And** 인포그래픽 생성 실패 시:
  - "인포그래픽 생성에 실패했습니다. 텍스트로 대체됩니다." 메시지
  - 문서는 텍스트로 계속 진행된다

---

## Technical Implementation

### Database Schema

```sql
-- Document figures table
CREATE TABLE IF NOT EXISTS document_figures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  figure_type TEXT NOT NULL CHECK (figure_type IN ('bar', 'line', 'pie', 'flow')),
  image_url TEXT,
  caption TEXT,
  "order" INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_document_figures_document_id ON document_figures(document_id);
```

### Implementation Notes

**For MVP (Phase 1):**
- Use text-based placeholders for figures
- Generate figure descriptions in markdown
- Example: `![시장 규모 비교](GENERATE_FIGURE:bar:data)`

**For Future Enhancement:**
- Integrate DALL-E 3 or Midjourney API
- Use chart.js or similar for data visualization
- Store images in S3 or CloudFlare R2

---

## Testing Checklist

- [ ] 인포그래픱 placeholder가 문서에 삽입됨
- [ ] figure_type별 올바른 형식 적용
- [ ] 재생성 기능이 작동함
- [ ] 실패 시 텍스트 대체가 작동함

---

## Definition of Done

- [x] All acceptance criteria met
- [ ] Placeholder implementation for MVP
- [ ] Future enhancement roadmap documented

---

**Story Status:** ✅ Ready for Development
**Estimated Complexity:** Medium (MVP: text placeholders; Full: image generation API integration)
**Recommended Developer:** Dev agent
**Dependencies:** Story 3.2 (RAG-based Document Generation)
