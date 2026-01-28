---
stepsCompleted: [1]
inputDocuments:
  - /Users/donggyu/bm-builder/_bmad-output/planning-artifacts/prd-leanstartup-canvas-2026-01-26.md
  - /Users/donggyu/bm-builder/_bmad-output/planning-artifacts/architecture.md
  - /Users/donggyu/bm-builder/_bmad-output/planning-artifacts/ux-design-specification.md
workflowType: 'create-epics-and-stories'
project_name: 'bm-builder'
user_name: 'Donggyu'
date: '2026-01-28'
---

# bm-builder - Epic Breakdown

## Overview

이 문서는 bm-builder의 완전한 Epic과 Story 분석을 제공합니다. 최신 PRD (린스타트업 캔버스)와 Architecture의 요구사항을 구현 가능한 Stories로 분해합니다.

## Requirements Inventory

### Functional Requirements (11개)

**FR-001:** 캔버스 진입 - 사용자가 루트 경로(`/`)로 접근 시 린스타트업 캔버스가 1초 이내에 로딩되어야 한다.

**FR-002:** 노드 생성 - 사용자가 빈 캔버스 더블클릭 시 7단계 노드 타입 선택 모달이 표시되어야 하며, 타입 선택 후 500ms 이내에 새 노드가 생성되어야 한다.

**FR-003:** 노드 이동 - 사용자가 노드를 드래그하여 캔버스 상에서 자유롭게 이동할 수 있어야 하며, 드래그 응답 지연시간이 100ms 이내여야 하고 드래그 종료 시 위치가 저장되어야 한다.

**FR-004:** 노드 연결 - 사용자가 Shift+드래그로 한 노드에서 다른 노드로 연결선을 생성할 수 있어야 하며, 연결선이 100ms 이내에 렌더링되어야 하고 연결선에 화살표로 방향을 표시할 수 있어야 한다.

**FR-005:** 노드 상세 보기 - 사용자가 노드 클릭 시 우측 사이드바가 200ms 이내에 로딩되어야 하며 해당 노드의 상세 내용을 확인하고, AI와 대화하여 내용을 수정할 수 있어야 한다.

**FR-006:** 진행 상태 시각화 - 시스템이 각 노드의 완료 상태를 색상(회색/노란색/초록색)으로 시각화하고, 헤더에 "완료 X/7"과 진행률 바를 표시해야 한다.

**FR-007:** 온보딩 튜토리얼 - 첫 방문자가 4단계 가이드를 통해 첫 번째 노드를 생성하고 완성할 수 있어야 하며, 온보딩 완료율은 90% 이상, 평균 완료 시간은 5분 이내여야 하고 건너뛰기와 재활성화가 가능해야 한다.

**FR-008:** 정부지원사업 내보내기 - 사용자가 7개 노드 완료 후 AI 기반 문서 변환을 시작해야 한다. AI 변환 성공률은 85% 이상이어야 하고 생성 시간은 10초 이내여야 하며, 생성된 문서를 PDF, DOCX로 다운로드할 수 있어야 한다.

**FR-009:** 부분 진행 상태 내보내기 - 사용자가 3개 이상 노드 완료 시 부분 내보내기 버튼이 표시되어야 하며, 클릭 시 5초 이내에 완성된 노드 내용을 기반으로 초안을 생성해야 한다.

**FR-010:** AI API 에러 처리 - 외부 AI 서비스 호출 실패 시 사용자에게 명활한 에러 메시지를 표시하고, 재시도 버튼을 제공해야 한다. 3회 연속 실패 시 지원 티켓팅 안내를 표시해야 한다.

**FR-011:** 네트워크 오류 안내 - 네트워크 연결 불량 시 "오프라인 모드로 작동 중" 알림을 표시하고, LocalStorage에만 저장한다. 온라인 복구 시 자동으로 서버와 동기화한다.

### NonFunctional Requirements (26개)

**Performance (NFR-P1~P3):**
- NFR-P1: 페이지 로드 (2초 이내, 3G 네트워크 기준)
- NFR-P2: 노드 생성 성능 (500ms 이내)
- NFR-P3: AI 응답 속도

**Scalability (NFR-S1~S3):**
- NFR-S1: 100 WAU 지원
- NFR-S2: 1,000 WAU 지원
- NFR-S3: 10,000 WAU 지원

**AI 비용 최적화 (NFR-A1~A5)**
**접근성 (NFR-AC1~AC5):**
- NFR-AC4: 모바일 UX

**호환성 (NFR-C1~C5)**
**데이터 (NFR-D1~D8):**

### Additional Requirements

**Starter Template:** Custom Monorepo (이미 완전 설정됨)
**인증 시스템:** JWT + Passport.js (코스 교정)
**데이터베이스:** PostgreSQL 15 + pgvector
**API Response:** Discriminated Union
**UI/UX:** 반응형, WCAG 2.1 AA
**State Management:** Redux Toolkit

### FR Coverage Map

{{requirements_coverage_map}}

## Epic List

{{epics_list}}
