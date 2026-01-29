# Technical Specification: Epic 6 - 정부지원사업 문서 생성

**Epic ID:** Epic-6
**Epic Name:** 정부지원사업 문서 생성 (Government Proposal Document Generation)
**Status:** Ready for Development
**Last Updated:** 2026-01-28
**Author:** Technical Specification (YOLO Mode)

---

## 1. Overview

### 1.1 Problem Statement

**User Pain Points:**
- 완성된 캔버스를 정부지원사업 제안서로 변환하기 어려움
- IR 자료 작성에 시간이 오래 걸림 (2주 이상)
- 정부지원사업 양식에 맞추는 작업이 번거로움

### 1.2 Solution Approach

**Core Capabilities:**
1. **부분 내보내기:** 3개 이상 노드 완료 시 초안 생성 (5초)
2. **AI 기반 변환:** 7개 노드 완료 후 정부지원사업 문서 (10초)
3. **다운로드:** PDF, DOCX, PPTX

### 1.3 In/Out Scope

**In Scope:**
- 3개 노드 완료 시 부분 내보내기 버튼 (Story 6.1)
- AI 기반 문서 변환 (Story 6.2)

**Out Scope:**
- 자동 제출 (수동으로만)
- 정부지원사업 포털 API 연동

---

## 2. Context for Development

### 2.1 Files to Create/Modify

**New Files:**
1. `/Users/donggyu/bm-builder/frontend/src/components/canvas/ExportButton.tsx`
2. `/Users/donggyu/bm-builder/frontend/src/components/export/ExportModal.tsx`
3. `/Users/donggyu/bm-builder/frontend/src/components/export/DocumentPreview.tsx`
4. `/Users/donggyu/bm-builder/frontend/src/api/exportApi.ts`
5. `/Users/donggyu/bm-builder/backend/src/routes/v1/export.routes.ts`
6. `/Users/donggyu/bm-builder/backend/src/services/documentGeneration.service.ts`

**Modified Files:**
1. `/Users/donggyu/bm-builder/frontend/src/components/canvas/ProgressBar.tsx` - Add export button

### 2.2 Technical Decisions

**문서 생성 파이프라인:**
```
Nodes Content → Claude API → Markdown → PDF/DOCX/PPTX
```

**Stage-by-stage 매핑:**
- Stage 1(문제 발굴) → "1. 사업 추진 배경 및 필요성"
- Stage 2(문제 정의) → "2. 문제 정의 및 해결 과제"
- Stage 3(고객 개발) → "3. 타겟 고객 및 시장 분석"
- Stage 4(시장 개발) → "4. 경쟁 현황 및 시장성"
- Stage 5(솔루션) → "5. 제품/서비스 내용"
- Stage 6(비즈니스 모델) → "6. 비즈니스 모델 및 수익 구조"
- Stage 7(IR 자료) → "7. 사업 실행 계획 및 재무 계획"

---

## 3. Implementation Plan

### 3.1 Story 6.1: 3개 노드 완료 시 부분 내보내기 버튼 표시

**Frontend Implementation:**

```typescript
// frontend/src/components/canvas/ExportButton.tsx
import { useAppSelector } from '../../store/hooks';
import { useState } from 'react';
import { ExportModal } from './export/ExportModal';

export function ExportButton() {
  const completedNodes = useAppSelector(state => state.progress.completedNodes);
  const [showModal, setShowModal] = useState(false);

  // 3개 이상 완료 시 버튼 표시
  if (completedNodes.length < 3) {
    return (
      <div className="fixed top-4 right-4 z-50">
        <div className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg">
          3개 이상 노드 완성 시 부분 내보내기가 가능합니다
        </div>
      </div>
    );
  }

  const isFullExport = completedNodes.length === 7;

  return (
    <>
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={() => setShowModal(true)}
          className={`
            px-4 py-2 rounded-lg flex items-center gap-2
            ${isFullExport ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-500 hover:bg-blue-600'}
            text-white font-bold shadow-lg
            animate-pulse
          `}
        >
          📄
          {isFullExport ? '전체 내보내기' : '부분 내보내기'}
        </button>
      </div>

      {showModal && (
        <ExportModal
          completedNodes={completedNodes}
          isFullExport={isFullExport}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
```

```typescript
// frontend/src/components/export/ExportModal.tsx
import { useState } from 'react';
import { useAppSelector } from '../../store/hooks';
import { generatePartialExport, generateFullExport } from '../../api/exportApi';

interface ExportModalProps {
  completedNodes: string[];
  isFullExport: boolean;
  onClose: () => void;
}

export function ExportModal({ completedNodes, isFullExport, onClose }: ExportModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedDoc, setGeneratedDoc] = useState<string | null>(null);
  const nodes = useAppSelector(state => state.canvas.nodes);

  const handleGenerate = async () => {
    setIsGenerating(true);

    try {
      const completedNodeData = nodes.filter(n => completedNodes.includes(n.id));

      if (isFullExport) {
        // 전체 내보내기 (10초)
        const response = await generateFullExport(completedNodeData);

        // 진행률 시뮬레이션
        for (let i = 0; i <= 100; i += 10) {
          setProgress(i);
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        setGeneratedDoc(response.data.markdown);
      } else {
        // 부분 내보내기 (5초)
        const response = await generatePartialExport(completedNodeData);

        for (let i = 0; i <= 100; i += 20) {
          setProgress(i);
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        setGeneratedDoc(response.data.markdown);
      }
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('문서 생성에 실패했습니다');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async (format: 'pdf' | 'docx' | 'pptx') => {
    if (!generatedDoc) return;

    try {
      const response = await downloadExport(generatedDoc, format);
      const blob = new Blob([response.data], {
        type: format === 'pdf' ? 'application/pdf' : format === 'docx' ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' : 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `export-${Date.now()}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[2000]">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">
            {isFullExport ? '전체 내보내기' : '부분 내보내기'}
          </h2>
          <button onClick={onClose} className="text-2xl">✕</button>
        </div>

        {isGenerating ? (
          <div className="text-center py-12">
            <div className="text-xl mb-4">
              {isFullExport ? '정부지원사업 제안서를 생성하고 있습니다...' : '부분 초안을 생성하고 있습니다...'}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-blue-500 h-4 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-2 text-gray-600">{progress}%</div>
          </div>
        ) : generatedDoc ? (
          <>
            <DocumentPreview markdown={generatedDoc} />

            <div className="flex gap-4 mt-6">
              <button
                onClick={() => handleDownload('pdf')}
                className="flex-1 px-6 py-3 bg-red-500 text-white rounded-lg font-bold"
              >
                PDF 다운로드
              </button>
              <button
                onClick={() => handleDownload('docx')}
                className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg font-bold"
              >
                DOCX 다운로드
              </button>
              {isFullExport && (
                <button
                  onClick={() => handleDownload('pptx')}
                  className="flex-1 px-6 py-3 bg-orange-500 text-white rounded-lg font-bold"
                >
                  IR 자료(PPT) 다운로드
                </button>
              )}
              <button
                onClick={() => setGeneratedDoc(null)}
                className="px-6 py-3 bg-gray-500 text-white rounded-lg"
              >
                다시 생성
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="mb-4">
              완료된 {completedNodes.length}개 노드를 기반으로 초안을 생성합니다
            </p>
            {!isFullExport && (
              <p className="text-orange-500 mb-4">
                ⚠️ 미완성 노드가 포함되어 있습니다
              </p>
            )}
            <button
              onClick={handleGenerate}
              className="px-8 py-3 bg-blue-500 text-white rounded-lg font-bold"
            >
              생성 시작
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
```

**API Layer:**

```typescript
// frontend/src/api/exportApi.ts
import { axiosInstance } from './axios';

export async function generatePartialExport(nodes: any[]) {
  const response = await axiosInstance.post('/api/v1/export/partial', { nodes });
  return response.data;
}

export async function generateFullExport(nodes: any[]) {
  const response = await axiosInstance.post('/api/v1/export/full', { nodes });
  return response.data;
}

export async function downloadExport(markdown: string, format: 'pdf' | 'docx' | 'pptx') {
  const response = await axiosInstance.post('/api/v1/export/download', {
    markdown,
    format
  }, {
    responseType: 'blob'
  });
  return response.data;
}
```

### 3.2 Story 6.2: AI 기반 문서 변환

**Backend Implementation:**

```typescript
// backend/src/routes/v1/export.routes.ts
import express from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { generatePartialDocument, generateFullDocument } from '../../services/documentGeneration.service';

const router = express.Router();

router.post('/partial', authenticate, async (req, res) => {
  try {
    const { nodes } = req.body;

    const document = await generatePartialDocument(req.userId, nodes);

    res.json({ success: true, data: { markdown: document } });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'GENERATION_FAILED', message: error.message }
    });
  }
});

router.post('/full', authenticate, async (req, res) => {
  try {
    const { nodes } = req.body;

    const document = await generateFullDocument(req.userId, nodes);

    res.json({ success: true, data: { markdown: document } });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'GENERATION_FAILED', message: error.message }
    });
  }
});

router.post('/download', authenticate, async (req, res) => {
  try {
    const { markdown, format } = req.body;

    let buffer: Buffer;
    let contentType: string;
    let filename: string;

    if (format === 'pdf') {
      buffer = await generatePDF(markdown);
      contentType = 'application/pdf';
      filename = `document-${Date.now()}.pdf`;
    } else if (format === 'docx') {
      buffer = await generateDOCX(markdown);
      contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      filename = `document-${Date.now()}.docx`;
    } else if (format === 'pptx') {
      buffer = await generatePPTX(markdown);
      contentType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
      filename = `ir-deck-${Date.now()}.pptx`;
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'DOWNLOAD_FAILED', message: error.message }
    });
  }
});

export default router;
```

```typescript
// backend/src/services/documentGeneration.service.ts
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

export async function generatePartialDocument(userId: string, nodes: any[]) {
  const systemPrompt = `
You are an expert in writing government proposal documents for startups in Korea.

Generate a partial draft based on the provided Lean Startup canvas nodes.

IMPORTANT:
- Keep completed sections as-is
- Mark incomplete sections as "⚠️ 미완성: [Stage Name]"
- Add 3 or fewer recommendations for completion
`;

  const userPrompt = `
Generate a partial government proposal document based on these completed nodes:

${nodes.map(n => `- ${n.data.label}: ${n.data.content}`).join('\n')}

Incomplete stages: ${getIncompleteStages(nodes)}
`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 4000,
    temperature: 0.5,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }]
  });

  return response.content[0].type === 'text' ? response.content[0].text : '';
}

export async function generateFullDocument(userId: string, nodes: any[]) {
  const systemPrompt = `
You are an expert in writing government R&D proposal documents for Korean startups.

Generate a complete government proposal document based on the Lean Startup canvas.

Stage Mapping:
- Stage 1(문제 발굴) → "1. 사업 추진 배경 및 필요성"
- Stage 2(문제 정의) → "2. 문제 정의 및 해결 과제"
- Stage 3(고객 개발) → "3. 타겟 고객 및 시장 분석"
- Stage 4(시장 개발) → "4. 경쟁 현황 및 시장성"
- Stage 5(솔루션) → "5. 제품/서비스 내용"
- Stage 6(비즈니스 모델) → "6. 비즈니스 모델 및 수익 구조"
- Stage 7(IR 자료) → "7. 사업 실행 계획 및 재무 계획"

Format: Professional government proposal style with clear headings, bullet points, and structured sections.
`;

  const userPrompt = `
Generate a complete government proposal document based on these 7 Lean Startup canvas nodes:

${nodes.map(n => `## ${n.data.label}\n${n.data.content}`).join('\n\n')}
`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 8000,
    temperature: 0.7,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }]
  });

  return response.content[0].type === 'text' ? response.content[0].text : '';
}

function getIncompleteStages(nodes: any[]) {
  const completedStages = nodes.map(n => n.data.stage);
  const allStages = [1, 2, 3, 4, 5, 6, 7];
  return allStages.filter(s => !completedStages.includes(s));
}

// PDF generation using puppeteer
async function generatePDF(markdown: string): Promise<Buffer> {
  const { default: marked } = await import('marked');
  const html = marked(markdown);

  // Use puppeteer to generate PDF
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(html);
  const pdf = await page.pdf({ format: 'A4' });
  await browser.close();

  return pdf;
}

// DOCX generation
async function generateDOCX(markdown: string): Promise<Buffer> {
  // Use officegen or similar library
  const docx = require('officegen');
  // Implementation details...
  return Buffer.from([]);
}

// PPTX generation
async function generatePPTX(markdown: string): Promise<Buffer> {
  const PptxGenJS = require('pptxgenjs');

  let pptx = new PptxGenJS();

  // Parse markdown and create slides
  // Slide 1: Title
  // Slide 2: Problem
  // Slide 3: Solution
  // Slide 4: Market
  // Slide 5: Business Model
  // Slide 6: Execution Plan
  // Slide 7: Financials

  return pptx.write({ outputType: 'nodebuffer' });
}
```

---

## 4. Acceptance Criteria

**AC 6.1.1:** 3개 노드 완료 시 "부분 내보내기" 버튼 표시, 5초 내 초안 생성
**AC 6.1.2:** 미완성 노드 "⚠️ 미완성: [노드명]" 형식 명시
**AC 6.2.1:** 7개 노드 완료 후 AI 기반 문서 변환 10초 이내
**AC 6.2.2:** PDF, DOCX, PPTX 다운로드 지원

---

## 5. Performance Targets

**NFR-003:** 문서 생성 시간
- 부분 내보내기: 5초 이내
- 전체 내보내기: 10초 이내

**NFR-006:** 10,000 WAU 지원
- CDN 배포, 읽기 전용 인스턴스 분리
- P95 < 2초 응답 시간 유지

---

**Tech-spec-epic-6.md - Ready for Development** ✅
