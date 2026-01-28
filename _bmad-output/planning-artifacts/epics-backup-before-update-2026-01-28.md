---
stepsCompleted: [1, 2, 3]
inputDocuments:
  - /Users/donggyu/bm-builder/_bmad-output/planning-artifacts/prd.md
  - /Users/donggyu/bm-builder/_bmad-output/planning-artifacts/architecture.md
  - /Users/donggyu/bm-builder/_bmad-output/project-context.md
workflowType: 'create-epics-and-stories'
project_name: 'bm-builder'
user_name: 'Donggyu'
date: '2026-01-09'
epicsApproved: true
totalEpics: 9
totalFRs: 72
totalStories: 52
---

# bm-builder - Epic Breakdown

## Overview

이 문서는 bm-builder의 완전한 Epic과 Story 분석을 제공합니다. PRD, Architecture의 요구사항을 구현 가능한 Stories로 분해합니다.

## Requirements Inventory

### Functional Requirements (72개)

#### 1. User Onboarding & Personalization (FR1-5)
- **FR1:** 사용자는 온보딩 질문 3개에 답변하여 개인화된 경험을 설정할 수 있다 (비전, 타겟, 현재 상황)
- **FR2:** 사용자는 첫 로그인 시 개인화된 환영 메시지와 클라우드 스캔 결과를 확인할 수 있다
- **FR3:** 사용자는 Node UI 기본 사용법을 배우기 위한 1분 가이드 투어를 완료할 수 있다
- **FR4:** 시스템은 사용자의 온보딩 응답을 기반으로 맞춤형 제안을 제공할 수 있다
- **FR5:** 사용자는 온보딩 단계별 완료 시 긍정적인 피드백 메시지를 받을 수 있다

#### 2. Visual Workflow Management (FR6-10)
- **FR6:** 사용자는 노드 기반 캔버스에서 린스타트업 4단계 프로세스를 시각화할 수 있다 (문제 발견 → 고객 인터뷰 → 가설 수립 → 가설 검증)
- **FR7:** 사용자는 노드를 생성, 편집, 연결, 삭제할 수 있다
- **FR8:** 사용자는 무한 캔버스에서 패닝, 줌인/줌아웃을 통해 노드를 탐색할 수 있다
- **FR9:** 사용자는 노드 간 연결을 드래그앤드롭으로 생성하고 수정할 수 있다
- **FR10:** 사용자는 노드를 더블 클릭하여 편집 모드로 진입할 수 있다

#### 3. AI Document Generation (FR11-16)
- **FR11:** 사용자는 AI에게 질문을 받고 답변하여 문서를 생성할 수 있다
- **FR12:** 사용자는 정부지원사업 5개 양식 중 하나를 선택하여 문서를 생성할 수 있다 (예비창업, 초기창업, R&D, 성장, 특화)
- **FR13:** 사용자는 IR 자료 (피칭 데크, 1-pager, 비즈니스 모델 캔버스, 인포그래픽)를 생성할 수 있다
- **FR14:** 사용자는 문서 생성 진행률을 단계별 프로그레스 바로 확인할 수 있다
- **FR15:** 사용자는 문서 생성 완료 시 성공을 축하하는 애니메이션을 경험할 수 있다
- **FR16:** 시스템은 사용자의 입력 또는 임베딩된 문서를 참조하여 맞춤형 문서를 생성할 수 있다

#### 4. Document Embedding & Context Management (FR17-21)
- **FR17:** 사용자는 Google Drive를 연동하여 기존 문서를 임베딩할 수 있다
- **FR18:** 사용자는 임베딩된 문서를 미리 보고 검증할 수 있다
- **FR19:** 시스템은 자동으로 비즈니스 문서와 무시할 문서를 분류할 수 있다
- **FR20:** 사용자는 임베딩할 문서를 수동으로 선택하거나 제외할 수 있다
- **FR21:** 시스템은 PDF, HWP, DOCX 파일 형식을 지원할 수 있다

#### 5. Team Collaboration (FR22-27)
- **FR22:** 사용자는 이메일 링크로 팀원을 초대할 수 있다 (최대 3명)
- **FR23:** 사용자는 팀원에게 Owner, Editor, Viewer 권한을 부여할 수 있다
- **FR24:** 사용자는 팀원과 동시에 문서를 편집할 수 있다 (Polling 5초 간격)
- **FR25:** 사용자는 팀원의 변경 사항을 활동 로그로 확인할 수 있다
- **FR26:** 시스템은 동시 편집 충돌 시 "마지막 저장 우선" 전략을 적용할 수 있다
- **FR27:** 사용자는 팀원을 @멘션하여 알림을 보낼 수 있다

#### 6. Cloud Integration & Data Management (FR28-32)
- **FR28:** 사용자는 Google Drive OAuth 2.0 인증을 통해 연동할 수 있다
- **FR29:** 시스템은 최초 1회 전체 파일 스캔을 수행할 수 있다
- **FR30:** 시스템은 파일 변경 감지 시 자동으로 업데이트할 수 있다
- **FR31:** 사용자는 클라우드 연동 해제를 통해 데이터 접근을 철회할 수 있다
- **FR32:** 시스템은 읽기 전용 권한을 요청하여 문서에 접근할 수 있다

#### 7. User Interface & Experience (FR33-38)
- **FR33:** 사용자는 시스템 설정 Dark Mode를 자동으로 적용받을 수 있다
- **FR34:** 사용자는 Dark Mode를 수동으로 토글할 수 있다
- **FR35:** 사용자는 모바일, 태블릿, 데스크톱 화면 크기에 맞는 반응형 UI를 경험할 수 있다
- **FR36:** 사용자는 모바일에서 폼 기반 입력을 통해 문서를 생성할 수 있다 (Node UI는 데스크톱 권장)
- **FR37:** 사용자는 에러 발생 시 감정적 메시지로 안내를 받을 수 있다
- **FR38:** 사용자는 키보드 내비게이션으로 UI를 조작할 수 있다

#### 8. Content & Template Management (FR39-43)
- **FR39:** 사용자는 생성된 문서를 저장하고 불러올 수 있다
- **FR40:** 사용자는 문서를 삭제할 수 있다
- **FR41:** 사용자는 문서를 복제하여 수정할 수 있다
- **FR42:** 사용자는 문서 내에서 인포그래픽을 자동으로 생성할 수 있다
- **FR43:** 사용자는 생성된 문서를 다운로드할 수 있다 (PDF, PPT)

#### 9. Error Handling & Recovery (FR44-46)
- **FR44:** 사용자는 클라우드 연결 끊김 시 재연결 옵션을 받을 수 있다
- **FR45:** 사용자는 AI 생성 실패 시 재시도 옵션을 받을 수 있다
- **FR46:** 사용자는 시스템 장애 발생 시 투명한 공지를 확인할 수 있다

#### 10. Accessibility & Inclusivity (FR47-50)
- **FR47:** 사용자는 색상 대비 4.5:1 이상을 충족하는 UI를 경험할 수 있다
- **FR48:** 사용자는 스크린 리더로 UI를 탐색할 수 있다 (ARIA 지원)
- **FR49:** 사용자는 200% 확대에서도 모든 기능을 사용할 수 있다
- **FR50:** 사용자는 키보드만으로 모든 기능에 접근할 수 있다

#### 11. Pricing & Subscription (FR51-53)
- **FR51:** 사용자는 데모 모드에서 무제한 체험할 수 있다 (저장 불가)
- **FR52:** 사용자는 프리티어 50회 제한을 확인할 수 있다
- **FR53:** 사용자는 사용량 소진 시 유료 전환 프롬프트를 받을 수 있다

#### 12. Learning & Education (FR54-56)
- **FR54:** 사용자는 노드 클릭 시 비즈니스 용어 설명을 툴팁으로 확인할 수 있다
- **FR55:** 사용자는 용어 설명에서 관련 예제를 확인할 수 있다
- **FR56:** 사용자는 용어 검색 기능을 통해 특정 용어를 찾을 수 있다

#### 13. Productivity & Planning (FR57-59)
- **FR57:** 사용자는 AI로부터 우선순위 제안을 받을 수 있다
- **FR58:** 사용자는 일일 플래너를 통해 오늘의 할 일을 확인할 수 있다
- **FR59:** 사용자는 우선순위를 수동으로 조정할 수 있다

#### 14. Dashboard & Analytics (FR60-61)
- **FR60:** 사용자는 대시보드에서 진행 상황을 시각적으로 확인할 수 있다
- **FR61:** 사용자는 성취감을 주는 진행률 표시를 받을 수 있다 (예: "이번 주 80% 완료!")

#### 15. Real-time Collaboration (FR62-64)
- **FR62:** 사용자는 팀원의 실시간 커서 위치를 확인할 수 있다 (Figma 스타일)
- **FR63:** 사용자는 팀원이 현재 입력 중인지 표시를 받을 수 있다
- **FR64:** 사용자는 팀원의 온라인 상태를 확인할 수 있다

#### 16. Version Management (FR65-67)
- **FR65:** 사용자는 문서 버전 히스토리를 확인할 수 있다
- **FR66:** 사용자는 이전 버전으로 복원할 수 있다
- **FR67:** 사용자는 특정 시점의 버전을 비교할 수 있다

#### 17. Admin & Management (FR68-70)
- **FR68:** 액셀러레이터는 관리자 대시보드에서 팀별 진행 상황을 확인할 수 있다
- **FR69:** 액셀러레이터는 팀별 성과 지표를 비교할 수 있다
- **FR70:** 액셀러레이터는 팀원별 활동 내역을 확인할 수 있다

#### 18. Enterprise Features (FR71-72)
- **FR71:** 액셀러레이터는 벌크 라이선스 구매를 통해 할인을 받을 수 있다
- **FR72:** 액셀러레이터는 팀별 라이선스를 관리할 수 있다

### Non-Functional Requirements (20개)

#### Performance (성능)
- **NFR-P1:** 문서 생성 속도 (간단 30초, 복잡 2분, 초기 500자 10초 progressive streaming, RAG 3초)
- **NFR-P2:** Node UI 반응속도 (노드 조작 100ms, 캔버스 60fps, 인포그래픽 2초)
- **NFR-P3:** 동시 편집 지연 (MVP 10초, Post-MVP 1초 WebSocket)

#### Security (보안)
- **NFR-S1:** 데이터 암호화 (TLS 1.3, AES-256, HTTPS)
- **NFR-S2:** 인증 및 권한 (OAuth 2.0, MFA, 세션 14일)
- **NFR-S3:** 개인정보 보호 (개인정보보호법, GDPR, 30일 데이터 삭제)
- **NFR-S4:** 결제 보안 (PCI-DSS, PG사 미저장, 7년 보관)

#### Scalability (확장성)
- **NFR-SC1:** 동시 사용자 지원 (MVP 100명, 6개월 500명, 12개월 2000명)
- **NFR-SC2:** 데이터 저장 (사용자당 10GB, 단일 파일 50MB, 1000개 문서)
- **NFR-SC3:** API 호출 한도 (프리 50회, Basic 300회, Pro 무제한)

#### Accessibility (접근성)
- **NFR-A1:** WCAG 2.1 Level AA 준수
- **NFR-A2:** 다국어 지원 (한국어 완벽, 영어 기본)
- **NFR-A3:** 반응식 디자인 (Mobile iOS 15+, Android 12+, Desktop Chrome 110+)

#### Integration (통합)
- **NFR-I1:** Google Drive 통합 (OAuth 2.0, hwp/docx/pdf, 5분 감지)
- **NFR-I2:** AI API 통합 (Claude 4.5 주요, GLM 4.7 보조, 3초 fallback)
- **NFR-I3:** RAG 시스템 (pgvector, 70% 정확도, Redis 0.5초 캐싱)

#### Reliability (신뢰성)
- **NFR-R1:** 가용성 (99.9% Uptime, 1분 헬스 체크, 48시간 전 공지)
- **NFR-R2:** 데이터 백업 (일일 새벽 3시, 30일 보관, 리전 간 복제)
- **NFR-R3:** 재해 복구 (RTO 4시간, RPO 1일, 분기별 DR 훈련)
- **NFR-R4:** 장애 대응 (1분 Slack 알림, 자동 복구, 5분 Status 페이지)

### Additional Requirements (Architecture 기반)

#### Starter Template & Project Setup
- Vite React TypeScript + Express TypeScript starter template 사용
- 프로젝트 구조: frontend/, backend/, backend/supabase/, shared/types/, infrastructure/
- Monorepo pattern: `@shared/types` alias for shared TypeScript types

#### Technology Stack (정확한 버전)
- Frontend: React 19.0, Vite 5.1, Redux Toolkit 2.10.1, React Router 7.12.0, Tailwind CSS 3.4
- Backend: Express 4.19, TypeScript 5.3, pg 8.11.3
- Database: PostgreSQL 15 + pgvector 0.5.0
- AI Models: Claude 4.5 (Anthropic) 주요, GLM 4.7 (Zhipu AI) 보조

#### AWS Deployment Architecture
- Frontend: AWS S3 (정적 호스팅) + CloudFront (CDN)
- Backend: AWS EC2 t3.medium (2 vCPU, 4GB RAM) [MVP]
- Database: 자체 PostgreSQL 서버 (MVP) 또는 AWS RDS (프로덕션)
- CI/CD: GitHub Actions 2.327.1
- Monitoring: AWS CloudWatch

#### Infrastructure as Code
- CloudFormation templates for AWS resources (S3, CloudFront, EC2)
- Deploy scripts: deploy-frontend.sh, deploy-backend.sh, setup-ec2.sh
- GitHub Actions workflows: ci.yml, backend-ci.yml, deploy.yml

#### API Design Standards
- REST API with discriminated union response type
- `/api/v1/{resource}` endpoint pattern
- API response wrapper: `{ success: true/false, data/error }`

#### Database Patterns
- PostgreSQL Row Level Security (RLS) policies for all tables
- Tables: profiles, documents, embedded_documents, teams, team_members
- Admin client usage with explicit filtering or RLS bypass only

#### State Management
- Redux Toolkit for global state
- Granular loading/error states per operation
- Selector memoization with reselect

#### Security Implementation
- Passport.js + JWT for OAuth 2.0 (Google, Naver)
- Environment variables: NO `VITE_` prefix for secrets
- Proxy pattern for all backend APIs (Claude, etc.)

#### Testing Requirements
- Vitest for unit tests
- Coverage target: 80%+
- Test file naming: `.test.ts` or `.spec.ts`

#### Performance Optimization
- Progressive streaming for AI document generation (10초 첫 화면)
- Polling 30초 for team collaboration (MVP), WebSocket 1초 (Post-MVP)
- React.memo, useCallback, useMemo optimization patterns
- AbortController + mounted flag for cleanup

### FR Coverage Map

_다음 단계에서 Epic별 FR 매핑을 완성합니다._

## Epic List

_다음 단계에서 Epic 목록을 생성합니다._


## Epic List

### Epic 1: 사용자 인증 및 온보딩
**목표:** 사용자가 가입하여 개인화된 AI 공동 창업자 경험을 시작할 수 있다
- 사용자 등록 (Passport.js OAuth 2.0 + JWT)
- 개인화된 온보딩 (3개 질문: 비전, 타겟, 현재 상황)
- AI 기반 맞춤형 제안
- 우선순위 제안 및 일일 플래너
- 데모 모드
- 비즈니스 용어 학습 지원

**FRs covered:** FR1-5, FR51, FR54-59 (19개)
**Phase:** Phase 1 (MVP 핵심)
**Dependencies:** None (Foundation Epic)

---

### Epic 2: 클라우드 연동 및 문서 임베딩
**목표:** 사용자가 Google Drive의 기존 문서를 연동하여 RAG 시스템 컨텍스트로 활용할 수 있다
- Google Drive OAuth 2.0 연동
- 최초 1회 전체 파일 스캔
- 파일 변경 감지 자동 업데이트 (5분 이내)
- PDF, HWP, DOCX 형식 지원
- 미리 보기 및 검증
- 자동 분류 (비즈니스 vs 무시)
- 수동 선택/제외
- 연동 해제 및 재연결

**FRs covered:** FR17-21, FR28-32, FR44 (10개)
**Phase:** Phase 1 (MVP 핵심)
**Dependencies:** Epic 1 (인증 필요)

---

### Epic 3: AI 문서 생성
**목표:** 사용자가 AI와 협력하여 정부지원사업 양식 및 IR 자료를 생성할 수 있다
- AI 인터뷰 기반 문서 생성 (Claude 4.5)
- 정부지원사업 5개 양식 (예비창업, 초기창업, R&D, 성장, 특화)
- IR 자료 (피칭 데크, 1-pager, 비즈니스 모델 캔버스, 인포그래픽)
- RAG 기반 맞춤형 생성 (임베딩된 문서 참조)
- 프로그레시브 스트리밍 (10초 첫 화면)
- 성공 애니메이션
- 재시도 옵션

**FRs covered:** FR11-16, FR42, FR45 (8개)
**Phase:** Phase 1 (MVP 핵심)
**Dependencies:** Epic 1 (인증), Epic 2 (RAG)

---

### Epic 4: 문서 관리
**목표:** 사용자가 생성된 문서를 저장, 불러오기, 복제, 삭제, 다운로드할 수 있다
- 문서 저장/불러오기
- 문서 복제
- 문서 삭제
- PDF/PPT 다운로드

**FRs covered:** FR39-43, FR46 (6개)
**Phase:** Phase 1 (MVP 핵심)
**Dependencies:** Epic 1 (인증), Epic 3 (AI 생성)

---

### Epic 5: 사용자 인터페이스 및 접근성
**목표:** 사용자가 반응형 UI, Dark Mode, 접근성을 통해 모든 기능에 접근할 수 있다
- Dark Mode (자동/수동 토글)
- 반응식 디자인 (Mobile, Tablet, Desktop)
- 모바일 폼 기반 입력
- WCAG 2.1 Level AA (색상 대비 4.5:1, 스크린 리더, 200% 확대, 키보드 접근)
- 감정적 에러 메시지
- 키보드 내비게이션

**FRs covered:** FR33-38, FR47-50 (13개)
**Phase:** Phase 2 (중요)
**Note:** **Cross-cutting concern** - 모든 Epic에 적용되는 foundation

---

### Epic 6: Visual Workflow Management (Node UI)
**목표:** 사용자가 노드 기반 캔버스에서 린스타트업 프로세스를 시각화하고 조작할 수 있다
- 노드 기반 캔버스 (린스타트업 4단계)
- 노드 생성/편집/연결/삭제
- 무한 캔버스 (패닝, 줌인/줌아웃)
- 드래그앤드롭 연결
- 더블 클릭 편집 모드

**FRs covered:** FR6-10 (5개)
**Phase:** Phase 3 (선택적, Post-MVP)
**Note:** Epic 3 (AI 생성)의 결과물을 시각화하는 방법

---

### Epic 7: 팀 협업
**목표:** 사용자가 팀원을 초대하고 세분화된 권한으로 Polling 기반 협업을 할 수 있다
- 이메일 링크 팀원 초대 (최대 3명)
- 권한 관리 (Owner, Editor, Viewer)
- Polling 기반 동시 편집 (10초)
- 활동 로그
- 충돌 해결 ("마지막 저장 우선")
- @멘션 알림

**FRs covered:** FR22-27 (6개)
**Phase:** Phase 2 (중요)
**Dependencies:** Epic 1 (인증), Epic 3 (문서)

---

### Epic 8: 실시간 협업 및 버전 관리
**목표:** 사용자가 WebSocket 기반 실시간 커서와 버전 히스토리로 협업할 수 있다
- 실시간 커서 위치 (Figma 스타일)
- 입력 중 표시
- 온라인 상태
- 버전 히스토리
- 이전 버전 복원
- 버전 비교

**FRs covered:** FR62-67 (6개)
**Phase:** Phase 3 (Post-MVP)
**Note:** Epic 7 (Polling)에서 WebSocket으로 upgrade

---

### Epic 9: 대시보드 및 관리자 (INTEGRATION EPIC)

**목표:** 사용자가 진행 상황을 시각화하고 성취감을 느끼며, 액셀러레이터는 팀을 관리할 수 있다
- 진행 상황 시각화
- 성취감 강조 진행률
- 우선순위 제안
- 관리자 대시보드 (팀별 진행 상황)
- 성과 지표 비교
- 팀원별 활동 내역
- 벌크 라이선스 구매
- 팀별 라이선스 관리

**FRs covered:** FR60-61, FR68-72 (8개)
**Phase:** Phase 2 (일부), Phase 3 (관리자 기능)
**Dependencies:** Epic 1, 2, 3, 7

**⚠️ INTEGRATION EPIC - 복잡성 고려 사항:**
이 Epic은 4개의 이전 Epic(Epic 1, 2, 3, 7)에서 생성된 데이터를 통합하여 대시보드를 제공합니다.

**개발 고려 사항:**
- **독립 개발 어려움:** 모든 의존 Epic이 완료되어야 테스트 가능
- **모 데이터 서비스 권장:** Epic 9 개발 시 가짜 데이터로 UI 개발 권장
- **통합 테스트 필수:** 모든 Epic 완료 후 종단 간 통합 테스트 필요
- **Phase 2/3 분할 고려:** 사용자 대시보드(Phase 2)와 관리자 기능(Phase 3) 분리 권장

**실무적 구현 제안:**
1. **Mock Data Service:** Epic 1, 2, 3, 7의 API 응답 형식을 모방하여 개발
2. **Interface First:** 각 Epic이 제공해야 할 데이터 인터페이스를 먼저 정의
3. **渐进적 통합:** 각 Epic이 완료될 때마다 해당 Epic의 데이터를 Epic 9에 연결
4. **스텁 개발:** Epic 9를 사용자 대시보드(스텁 1)와 관리자 대시보드(스텁 2)로 분리

---

### FR Coverage Map

**Epic 1: 사용자 인증 및 온보딩**
- FR1: 온보딩 질문 3개 (비전, 타겟, 상황)
- FR2: 개인화된 환영 메시지
- FR3: Node UI 가이드 투어
- FR4: AI 맞춤형 제안
- FR5: 단계별 긍정적 피드백
- FR51: 데모 모드
- FR54: 비즈니스 용어 툴팁
- FR55: 용어 설명 예제
- FR56: 용어 검색
- FR57: AI 우선순위 제안
- FR58: 일일 플래너
- FR59: 우선순위 수동 조정

**Epic 2: 클라우드 연동 및 문서 임베딩**
- FR17: Google Drive 연동
- FR18: 임베딩된 문서 미리 보기
- FR19: 자동 분류 (비즈니스 vs 무시)
- FR20: 수동 선택/제외
- FR21: PDF, HWP, DOCX 지원
- FR28: Google Drive OAuth 2.0
- FR29: 최초 1회 전체 스캔
- FR30: 파일 변경 감지 자동 업데이트
- FR31: 클라우드 연동 해제
- FR32: 읽기 전용 권한 요청
- FR44: 클라우드 재연결 옵션

**Epic 3: AI 문서 생성**
- FR11: AI 질문/답변 문서 생성
- FR12: 정부지원사업 5개 양식 선택
- FR13: IR 자료 생성
- FR14: 프로그레스 바 진행률
- FR15: 성공 애니메이션
- FR16: 임베딩된 문서 참조 맞춤형 생성
- FR42: 인포그래픽 자동 생성
- FR45: AI 생성 재시도

**Epic 4: 문서 관리**
- FR39: 문서 저장/불러오기
- FR40: 문서 삭제
- FR41: 문서 복제
- FR43: PDF/PPT 다운로드
- FR46: 시스템 장애 공지

**Epic 5: 사용자 인터페이스 및 접근성**
- FR33: Dark Mode 자동 적용
- FR34: Dark Mode 수동 토글
- FR35: 반응식 UI (Mobile, Tablet, Desktop)
- FR36: 모바일 폼 기반 입력
- FR37: 감정적 에러 메시지
- FR38: 키보드 내비게이션
- FR47: 색상 대비 4.5:1
- FR48: 스크린 리더 (ARIA)
- FR49: 200% 확대 지원
- FR50: 키보드만 접근

**Epic 6: Visual Workflow Management (Node UI)**
- FR6: 노드 기반 캔버스 (린스타트업 4단계)
- FR7: 노드 생성/편집/연결/삭제
- FR8: 무한 캔버스 (패닝, 줌)
- FR9: 드래그앤드롭 연결
- FR10: 더블 클릭 편집 모드

**Epic 7: 팀 협업**
- FR22: 이메일 링크 팀원 초대
- FR23: Owner, Editor, Viewer 권한
- FR24: Polling 기반 동시 편집 (10초)
- FR25: 활동 로그
- FR26: 충돌 해결 ("마지막 저장 우선")
- FR27: @멘션 알림

**Epic 8: 실시간 협업 및 버전 관리**
- FR62: 실시간 커서 위치
- FR63: 입력 중 표시
- FR64: 온라인 상태
- FR65: 버전 히스토리
- FR66: 이전 버전 복원
- FR67: 버전 비교

**Epic 9: 대시보드 및 관리자**
- FR60: 진행 상황 시각화
- FR61: 성취감 강조 진행률
- FR68: 관리자 대시보드 (팀별 진행 상황)
- FR69: 팀별 성과 지표 비교
- FR70: 팀원별 활동 내역
- FR71: 벌크 라이선스 구매
- FR72: 팀별 라이선스 관리

**Total FR Coverage:** 72/72 (100%) ✅


---

## Epic 1: 사용자 인증 및 온보딩

### Epic Goal

사용자가 가입하여 개인화된 AI 공동 창업자 경험을 시작할 수 있다. 온보딩을 통해 사용자의 비전, 타겟, 현재 상황을 이해하고 AI 맞춤형 제안을 제공한다.

**FRs covered:** FR1-5, FR51, FR54-59 (19개)
**Phase:** Phase 1 (MVP 핵심)
**Dependencies:** None (Foundation Epic)
**Total Stories:** 8

---

### Story 1.1: 프로젝트 초기화 및 PostgreSQL 설정

**As a** 개발자,
**I want** Vite React TypeScript + Express TypeScript 프로젝트를 PostgreSQL과 통합하여 초기화하려고,
**So that** 사용자 인증과 데이터 저장 기능을 구현할 수 있다.

**Acceptance Criteria:**

**Given** 프로젝트가 시작될 때
**When** 개발자가 초기화 스크립트를 실행하면
**Then** 다음이 완료된다:
  - Frontend: Vite React TypeScript 프로젝트 생성
  - Backend: Express TypeScript 프로젝트 생성
  - Shared: `shared/types/` 디렉토리 구축 (User, ApiErrors types)
  - Database: PostgreSQL 데이터베이스 생성 및 `profiles` 테이블 생성
  - Environment: `.env.example`, `.env.local.example` 파일 생성
  - Monorepo: `tsconfig.json` paths 설정 (`@shared/types`)

**And** `profiles` 테이블이 다음 컬럼을 포함한다:
  - `id` (UUID, primary key)
  - `email` (text, unique)
  - `full_name` (text)
  - `avatar_url` (text, optional)
  - `onboarding_completed` (boolean, default false)
  - `created_at` (timestamp)

**And** PostgreSQL 연결 설정이 `backend/src/utils/db.ts`에 완료된다

**And** Supabase 패키지가 제거되고 PostgreSQL 직접 연결 방식이 적용된다:
  - `@supabase/supabase-js`, `@supabase/auth-helpers-react` 패키지 제거
  - `pg` PostgreSQL 클라이언트 사용
  - `postgres://` 연결 문자열 사용

**And** 모든 환경변수가 `.env.example`에 문서화된다

---

### Story 1.2: 사용자 OAuth 로그인

**As a** 예비 창업가,
**I want** Google 또는 Naver 계정으로 로그인하려고,
**So that** 별도의 비밀번호 관리 없이 빠르게 서비스를 이용할 수 있다.

**Acceptance Criteria:**

**Given** 사용자가 로그인 페이지에 방문했을 때
**When** 사용자가 "Google로 로그인" 버튼을 클릭하면
**Then** Passport.js OAuth 2.0 전략이 실행되고 Google 로그인 페이지로 redirect된다

**And** Passport.js가 다음을 설정한다:
  - `passport-google-oauth20` 전략 사용
  - Google OAuth 2.0 credentials (client ID, secret) 설정
  - Callback URL: `/api/v1/auth/google/callback`
  - Scope: `profile`, `email`

**And** OAuth 인증이 성공하면:
  - Backend가 JWT token (access token + refresh token)을 생성하여 사용자 session 생성
  - `profiles` 테이블에 사용자 레코드 생성/업데이트 (자동 upsert)
  - Redux Toolkit auth state가 업데이트됨 (`user`, `session`, `isAuthenticated`)
  - 사용자가 대시보드로 redirect된다

**And** OAuth 인증이 실패하면:
  - 에러 메시지가 표시된다 ("로그인에 실패했습니다. 다시 시도해주세요.")
  - 재시도 옵션이 제공된다

**And** 사용자가 로그인을 취소하면:
  - 로그인 페이지로 돌아간다
  - 취소 안내가 표시되지 않는다 (자연스러운 UX)

**And** 이미 가입된 사용자가 다시 로그인하면:
  - 기존 profile이 로드된다
  - `last_login` 타임스탬프가 업데이트된다

**And** session이 만료되면:
  - Backend JWT refresh API를 통해 token이 갱신된다
  - Refresh 실패 시 로그인 페이지로 redirect된다

---

### Story 1.3: 온보딩 플로우

**As a** 예비 창업가,
**I want** 3개의 질문에 답변하여 나의 비전과 타겟을 설정하려고,
**So that** AI가 나에게 맞춤형 제안을 제공할 수 있다.

**Acceptance Criteria:**

**Given** 사용자가 처음 로그인했고 `onboarding_completed = false`일 때
**When** 사용자가 대시보드에 접속하면
**Then** 온보딩 페이지로 redirect된다

**And** 온보딩 페이지가 3단계로 구성된다:
  - **Step 1/3:** "당신의 비전은 무엇인가요?" (text input)
  - **Step 2/3:** "타겟 고객은 누구인가요?" (text input)
  - **Step 3/3:** "현재 어떤 단계인가요?" (dropdown: 아이디어/프로토타입/MVP/성장)

**And** 각 단계에서 "다음" 버튼 클릭 시:
  - 입력값이 검증된다 (empty 체크)
  - `onboarding_responses` 테이블에 임시 저장된다
  - 다음 단계로 progress된다 (progress bar 표시: 33% → 66% → 100%)

**And** 최종 단계 완료 시:
  - `profiles.onboarding_completed = true`로 업데이트된다
  - 긍정적인 피드백 메시지가 표시된다 ("온보딩을 완료했습니다! 🎉")
  - 3초 후 대시보드로 redirect된다

**And** 사용자가 온보딩 중간에 이탈했다가 다시 방문하면:
  - 마지막으로 완료한 단계부터 재개된다
  - 이전 답변이 pre-filled된다

**And** 사용자가 답변을 수정하고 싶으면:
  - Settings 페이지에서 "온보딩 다시하기" 옵션을 제공한다
  - 재온보딩 시 기존 답변이 덮어쓰인다

---

### Story 1.4: 개인화된 환영 메시지

**As a** 예비 창업가,
**I want** 온보딩 완료 후 개인화된 환영 메시지를 받으려고,
**So that** AI 공동 창업자와 함께한다는 감정을 느낄 수 있다.

**Acceptance Criteria:**

**Given** 사용자가 온보딩을 완료했을 때
**When** 사용자가 처음 대시보드에 접속하면
**Then** 환영 메시지 modal이 표시된다

**And** 환영 메시지가 온보딩 답변을 참조하여 개인화된다:
  - "[사용자 이름]님, [비전]을 위한 여정을 시작하네요!"
  - "당신의 타겟인 [타겟 고객]을 위해 AI가 준비되었어요."
  - "[현재 단계]에서 다음 스텝은 무엇일까요?"

**And** 환영 메시지에 "시작하기" 버튼이 제공된다

**When** 사용자가 "시작하기"를 클릭하면
**Then** modal이 닫히고 대시보드가 표시된다

**And** 환영 메시지를 다시 보고 싶으면:
  - Settings에서 "환영 메시지 다시 보기" 옵션을 제공한다

---

### Story 1.5: AI 맞춤형 제안

**As a** 예비 창업가,
**I want** AI가 나의 상황에 맞는 우선순위를 제안해주길 원해서,
**So that** 무엇부터 시작해야 할지 명확해진다.

**Acceptance Criteria:**

**Given** 사용자가 온보딩을 완료했을 때
**When** AI가 제안을 생성하면 (백그라운드 비동기)
**Then** 프로그레시브 스트리밍으로 10초 이내 첫 응답이 표시된다

**And** 제안이 `daily_priorities` 테이블에 저장된다:
  - `user_id` (UUID)
  - `priorities` (JSONB: [{id, title, description, order}])
  - `created_at` (timestamp)
  - `source` (text: "ai_suggestion")

**And** 제안이 다음 형식으로 대시보드에 표시된다:
  - "오늘의 추천 우선순위:"
  - 1. [타겟 고객 인터뷰 질문지 작성]
  - 2. [경쟁사 분석 보고서]
  - 3. [MVP 기능 명세서]

**And** 사용자가 우선순위를 수동으로 조정할 수 있다:
  - Drag & drop으로 순서 변경
  - 항목 삭제
  - 항목 추가
  - "저장" 버튼으로 변경사항 저장

**And** Claude API 호출 실패 시:
  - 3초 이내 GLM 4.7로 fallback된다
  - 3회 실패 시 "제안 생성에 실패했습니다. 나중에 다시 시도해주세요." 메시지

**And** 제안이 너무 일반적이면:
  - "더 구체적인 정보를 입력하시면 맞춤형 제안을 드릴게요!" 안내
  - 온보딩 재수행 권장

---

### Story 1.6: 데모 모드

**As a** 예비 창업가,
**I want** 가입 없이 데모 모드로 체험해보려고,
**So that** 구매 전 서비스 가치를 확인할 수 있다.

**Acceptance Criteria:**

**Given** 비로그인 사용자가 랜딩 페이지에 방문했을 때
**When** 사용자가 "데모 모드 체험하기" 버튼을 클릭하면
**Then** 데모 모드로 전환된다

**And** 데모 모드에서:
  - Mock 사용자 계정으로 로그인된 상태로 UI 표시
  - Mock 데이터 (documents, priorities)가 자동 생성된다
  - 모든 기능이 정상적으로 작동하는 것처럼 보인다

**And** 데모 모드에서 문서 생성을 시도하면:
  - 정상적인 AI 생성 flow가 실행된다
  - 결과물이 표시된다
  - "저장" 버튼 클릭 시 "데모 모드에서는 저장이 불가능합니다. 가입 후 이용해주세요!" alert

**And** 데모 모드에서 API quota가 소진되지 않는다:
  - 모든 API 호출이 mock response로 반환된다
  - 실제 Claude API 호출이 일어나지 않는다

**And** 데모 모드에서 "가입하기" CTA가 항상 표시된다:
  - 상단 banner: "데모 모드입니다. 무제한 사용을 위해 가입하세요!"
  - 문서 생성 완료 후 modal: "이 결과물을 저장하려면 가입이 필요해요"

---

### Story 1.7: 학습 지원 (비즈니스 용어 툴팁)

**As a** 초보 창업가,
**I want** 비즈니스 용어 설명을 툴팁으로 보려고,
**So that** 낯선 용어를 이해하고 학습할 수 있다.

**Acceptance Criteria:**

**Given** 사용자가 UI를 탐색할 때
**When** 사용자가 비즈니스 용어가 포함된 요소에 hover하면
**Then** 툴팁이 300ms delay 후 표시된다

**And** 툴팁이 다음을 포함한다:
  - 용어 제목 (예: "Lean Startup")
  - 정의 (1-2문장)
  - 관련 예제 링크 (선택 사항)

**And** `glossary` 테이블이 다음 컬럼을 포함한다:
  - `id` (UUID, primary key)
  - `term` (text, unique)
  - `definition` (text)
  - `examples` (text, optional)
  - `category` (text)

**And** 사용자가 "용어 검색"을 실행하면:
  - 전체 텍스트 검색이 `glossary` 테이블에서 수행된다
  - 검색 결과가 dropdown으로 표시된다 (top 5)
  - 결과 클릭 시 정의 modal 표시

**And** 첫 방문 사용자에게만 툴팁이 표시된다:
  - `user_preferences.show_tooltips` (boolean, default true)
  - Settings에서 "툴팁 표시" 토글 가능

**And** 용어 검색 결과가 0개이면:
  - "검색어 '[용어]'에 대한 결과가 없습니다." 메시지
  - "관리자에게 용어 추가 요청" 옵션

---

## Epic 2: 클라우드 연동 및 문서 임베딩

### Epic Goal

사용자가 Google Drive의 기존 문서를 연동하여 RAG 시스템 컨텍스트로 활용할 수 있다. 자동 스캔, 분류, 임베딩을 통해 AI가 사용자의 문서를 "녹여내어" 맞춤형 결과물을 생성한다.

**FRs covered:** FR17-21, FR28-32, FR44 (10개)
**Phase:** Phase 1 (MVP 핵심)
**Dependencies:** Epic 1 (인증 필요)
**Total Stories:** 5

---

### Story 2.1: Google Drive OAuth 2.0 연동

**As a** 예비 창업가,
**I want** Google Drive를 연동하려고,
**So that** 내 기존 비즈니스 문서를 AI 생성에 활용할 수 있다.

**Acceptance Criteria:**

**Given** 사용자가 로그인했고 대시보드에 접속했을 때
**When** 사용자가 "Google Drive 연동하기" 버튼을 클릭하면
**Then** Passport.js OAuth 2.0 전략을 통한 Google consent screen이 표시된다

**And** Passport.js가 다음을 설정한다:
  - `passport-google-oauth20` 전략 사용 (Google Drive scope)
  - Access type: `offline` (refresh token 발급을 위해)
  - Scope: `https://www.googleapis.com/auth/drive.readonly`
  - Callback URL: `/api/v1/integrations/google-drive/callback`

**And** consent screen이 다음 권한을 요청한다:
  - `https://www.googleapis.com/auth/drive.readonly` (읽기 전용)
  - "bm-builder가 Google Drive의 문서에 접근할 수 있도록 허용합니다"

**When** 사용자가 "허용"을 클릭하면
**Then**:
  - Passport.js가 Google OAuth access token + refresh token을 발급받는다
  - Token들이 `google_tokens` 테이블에 암호화되어 저장된다:
    - `user_id` (UUID)
    - `access_token` (text, encrypted)
    - `refresh_token` (text, encrypted)
    - `token_expires_at` (timestamp)
  - `profiles.google_drive_connected = true`로 업데이트된다
  - "Google Drive가 연동되었습니다! 🎉" 성공 메시지

**And** 최초 1회 전체 파일 스캔이 자동으로 시작된다 (Story 2.2)

**When** 사용자가 OAuth를 거부하면
**Then** "Google Drive 연동이 취소되었습니다. 나중에 Settings에서 다시 연동할 수 있습니다." 메시지

**And** Google API quota 초과 시:
  - "Google API quota를 초과했습니다. 1시간 후에 다시 시도해주세요." 에러 메시지
  - 1시간 후 retry 가능하도록 UI 제한

---

### Story 2.2: 초기 파일 스캔 및 분류

**As a** 예비 창업가,
**I want** Google Drive의 모든 문서가 자동으로 스캔되길 원해서,
**So that** 수동으로 파일을 하나씩 업로드하지 않아도 된다.

**Acceptance Criteria:**

**Given** 사용자가 Google Drive를 연동했을 때
**When** 초기 파일 스캔이 시작되면 (백그라운드)
**Then** progress bar가 표시된다: "스캔 중... 0/100"

**And** Google Drive API가 파일 목록을 가져온다:
  - `pageToken`을 통한 pagination (파일이 100개 이상인 경우)
  - `q="mimeType='application/pdf' or mimeType='application/vnd.openxmlformats-officedocument.wordprocessingml.document' or name contains '.hwp'"` 필터

**And** 각 파일이 `embedded_documents` 테이블에 저장된다:
  - `id` (UUID, primary key)
  - `user_id` (UUID)
  - `file_id` (text, Google Drive file ID)
  - `file_name` (text)
  - `file_type` (text: "pdf", "hwp", "docx")
  - `download_url` (text)
  - `size` (integer, bytes)
  - `is_business_document` (boolean, default false)
  - `created_at` (timestamp)

**And** 자동 분류가 수행된다:
  - File name에 keyword 포함: ["사업계획서", "보고서", "제안서", "계약서", "명세서", "비즈니스", "BM", "PM"] → `is_business_document = true`
  - File path에 "/비즈니스/" 또는 "/Business/" 포함 → `is_business_document = true`

**And** 스캔 완료 시:
  - "총 N개의 문서를 발견했습니다. 그중 M개가 비즈니스 문서로 분류되었습니다." 메시지
  - 사용자가 미리 보기에서 수동으로 분류를 수정할 수 있다 (Story 2.3)

**And** 스캔 진행 상황이 실시간으로 표시된다:
  - Progress bar: "스캔 중... 45/100"
  - 예상 시간: "약 2분 남음"

**And** 스캔 중 오류 발생 시:
  - "파일 스캔 중 오류가 발생했습니다. 다시 시도하시겠습니까?" 메시지
  - "재시도" / "나중에" 옵션

---

### Story 2.3: 문서 미리 보기 및 검증

**As a** 예비 창업가,
**I want** 임베딩할 문서를 미리 보고 검증하려고,
**So that** AI가 내 문서를 정확히 참조할 것이라 확신할 수 있다.

**Acceptance Criteria:**

**Given** 사용자가 파일 스캔을 완료했을 때
**When** 사용자가 "문서 미리 보기" 페이지에 접속하면
**Then** 임베딩된 문서 목록이 표시된다

**And** 목록이 다음 정보를 포함한다:
  - File name
  - File type icon (PDF, HWP, DOCX)
  - 분류 상태 (비즈니스 ✅ / 무시 ❌)
  - File size
  - 스캔 날짜

**When** 사용자가 문서를 클릭하면
**Then** 미리 보기 modal이 표시된다

**And** 미리 보기 modal이 다음을 제공한다:
  - 문서 내용 미리 보기 (text extraction, 최초 500자)
  - "비즈니스 문서" 토글 (수동 변경 가능)
  - "임베딩에서 제외" 체크박스
  - "저장" 버튼

**And** 사용자가 "비즈니스 문서"를 토글하면:
  - `embedded_documents.is_business_document`가 즉시 업데이트된다
  - UI에서 토글 상태가 반영된다

**And** 사용자가 "임베딩에서 제외"를 체크하면:
  - `embedded_documents.is_excluded` = true
  - RAG 검색에서 제외된다
  - 목록에서 회색으로 표시된다

**When** 사용자가 "저장"을 클릭하면
**Then** 변경사항이 데이터베이스에 커밋된다
  - "저장되었습니다!" toast 메시지

**And** 필터 옵션이 제공된다:
  - "전체 보기"
  - "비즈니스 문서만"
  - "제외된 문서만"

---

### Story 2.4: 파일 변경 감지 및 자동 업데이트

**As a** 예비 창업가,
**I want** Google Drive에 새 파일이 추가되면 자동으로 감지되길 원해서,
**So that** 매번 수동으로 동기화하지 않아도 된다.

**Acceptance Criteria:**

**Given** 사용자가 Google Drive를 연동했고 초기 스캔을 완료했을 때
**When** 5분마다 background job이 실행되면
**Then** Google Drive API의 `files.list`를 변경 감지한다 (페이지 토큰 활용)

**And** 새 파일이 발견되면:
  - `embedded_documents` 테이블에 추가된다
  - 자동 분류가 수행된다
  - 사용자에게 알림이 표시된다: "N개의 새 문서를 발견했습니다!"

**And** 기존 파일이 수정되면:
  - `updated_at` 타임스탬프가 업데이트된다
  - 파일이 변경되었음을 표시하는 "업데이트됨" 배지가 목록에 표시된다

**And** 파일이 삭제되면:
  - `embedded_documents.is_deleted` = true로 표시된다 (soft delete)
  - 목록에서 숨겨진다

**When** 사용자가 "지금 동기화" 버튼을 클릭하면
**Then** 수동 동기화가 즉시 실행된다
  - Progress modal 표시: "동기화 중..."
  - 완료 시 "동기화 완료! N개의 변경사항이 있습니다."

**And** 마지막 동기화 시간이 표시된다:
  - "마지막 동기화: 10분 전"

**And** 동기화 실패 시:
  - "동기화에 실패했습니다. 네트워크 연결을 확인해주세요." 에러 메시지
  - 자동으로 5분 후 retry (exponential backoff: 5분 → 10분 → 15분)

---

### Story 2.5: 클라우드 연동 해제 및 재연결

**As a** 예비 창업가,
**I want** Google Drive 연동을 해제하거나 다시 연결할 수 있길 원해서,
**So that** 데이터 접근을 제어할 수 있다.

**Acceptance Criteria:**

**Given** 사용자가 Settings > "연동된 서비스"에 접속했을 때
**When** 사용자가 "Google Drive 연동 해제"를 클릭하면
**Then** 확인 modal이 표시된다:
  - "정말 Google Drive 연동을 해제하시겠습니까?"
  - "임베딩된 모든 문서가 삭제되고 복구할 수 없습니다."
  - "취소" / "해제" 버튼

**When** 사용자가 "해제"를 클릭하면
**Then**:
  - `google_tokens` 테이블에서 사용자의 토큰이 삭제된다
  - `embedded_documents` 테이블에서 사용자의 모든 문서가 삭제된다 (`CASCADE`)
  - `profiles.google_drive_connected = false`로 업데이트된다
  - "Google Drive 연동이 해제되었습니다." 성공 메시지

**When** 사용자가 연동을 해제한 상태에서 "Google Drive 연동하기"를 클릭하면
**Then** Story 2.1 (OAuth 연동)이 다시 실행된다

**And** 재연동 시:
  - 이전에 임베딩된 문서는 복구되지 않는다
  - 새로운 스캔이 시작된다

**And** 연동 해제 실패 시 (네트워크 오류 등):
  - "연동 해제에 실패했습니다. 다시 시도해주세요." 에러 메시지
  - 자동으로 retry 가능

**And** Google Drive API OAuth token이 만료되면:
  - Passport.js가 `google_tokens` 테이블에서 refresh token을 가져와 자동 갱신
  - Refresh token도 만료되면 "Google Drive 세션이 만료되었습니다. 다시 연동해주세요." 메시지
  - 사용자를 Story 2.1 OAuth 플로우로 redirect하여 재인증 유도


---

## Epic 3: AI 문서 생성

### Epic Goal

사용자가 AI와 협력하여 정부지원사업 양식 및 IR 자료를 생성할 수 있다. Claude 4.5의 멀티모달 능력으로 텍스트와 인포그래픽을 자동 생성하며, RAG를 통해 사용자의 임베딩된 문서를 참조하여 맞춤형 결과물을 만든다.

**FRs covered:** FR11-16, FR42, FR45 (8개)
**Phase:** Phase 1 (MVP 핵심)
**Dependencies:** Epic 1 (인증), Epic 2 (RAG)
**Total Stories:** 6

---

### Story 3.1: 문서 생성 플로우 UI

**As a** 예비 창업가,
**I want** AI와 질문/답변으로 문서를 생성하려고,
**So that** 복잡한 양식을 간단하게 완성할 수 있다.

**Acceptance Criteria:**

**Given** 사용자가 대시보드에 접속했을 때
**When** 사용자가 "새 문서 만들기" 버튼을 클릭하면
**Then** 문서 생성 페이지로 이동한다

**And** 문서 생성 페이지가 다음을 제공한다:
  - 양식 선택 dropdown:
    - 정부지원사업: 예비창업, 초기창업, R&D, 성장, 특화
    - IR 자료: 피칭 데크, 1-pager, 비즈니스 모델 캔버스
  - "시작하기" 버튼

**When** 사용자가 양식을 선택하고 "시작하기"를 클릭하면
**Then** AI 인터뷰 modal이 표시된다

**And** AI 인터뷰 modal이 다음을 제공한다:
  - 질문 표시 (Claude 4.5가 생성)
  - 답변 입력 textarea
  - "다음" / "이전" / "완료" 버튼
  - Progress indicator: "질문 3/10"

**And** 각 질문에서:
  - 질문이 로딩 중일 때 스켈레톤 표시
  - 질문이 표시되면 자동으로 textarea에 focus
  - 답변 후 "다음" 클릭 시 다음 질문 로딩

**And** 사용자가 중간에 "나가기"를 클릭하면:
  - "문서 생성을 중단하시겠습니까? 진행 상황은 저장되지 않습니다." 확인 modal
  - 확인 시 대시보드로 돌아감

---

### Story 3.2: RAG 기반 문서 생성 (Claude API)

**As a** 예비 창업가,
**I want** AI가 내 임베딩된 문서를 참조하여 맞춤형 문서를 생성하려고,
**So that** 나의 비즈니스에 맞는 결과물을 얻을 수 있다.

**Acceptance Criteria:**

**Given** 사용자가 AI 인터뷰를 완료했을 때
**When** 문서 생성이 시작되면 (백그라운드)
**Then** 프로그레시브 스트리밍으로 생성이 진행된다

**And** 프로그레시브 스트리밍 구현:
  - SSE (Server-Sent Events) 또는 polling으로 스트림 수신
  - 10초 이내 첫 500자가 화면에 표시된다
  - 진행률 표시: "생성 중... 40%"

**And** RAG 검색이 수행된다:
  - 사용자의 질문에서 keyword 추출
  - `embedded_documents` 테이블에서 유사한 문서 검색 (pgvector)
  - Top-5 관련 문서의 content를 context로 Claude API에 전달

**And** Claude API 호출 (Backend):
  - `POST https://api.anthropic.com/v1/messages`
  - `model: "claude-sonnet-4-20250514"`
  - `max_tokens: 8192`
  - `stream: true`
  - System prompt: 정부지원사업 양식 가이드라인 포함

**And** 생성된 문서가 `documents` 테이블에 저장된다:
  - `id` (UUID)
  - `user_id` (UUID)
  - `title` (text)
  - `content` (text, 생성된 전체 문서)
  - `template_type` (text: "gov_support", "pitch_deck", etc.)
  - `status` (text: "generating", "completed", "failed")
  - `created_at` (timestamp)

**When** 생성이 완료되면 (100%)
**Then** 성공 애니메이션이 표시된다:
  - Confetti 애니메이션
  - "🎉 문서 생성 완료!"
  - "문서 보기" / "대시보드로" 버튼

**And** 프로그레스 바가 다음 단계를 보여준다:
  - 0-30%: "AI가 질문을 분석 중..."
  - 30-60%: "관련 문서를 검색 중..."
  - 60-90%: "문서를 생성 중..."
  - 90-100%: "마무리 중..."

---

### Story 3.3: 인포그래픽 자동 생성

**As a** 예비 창업가,
**I want** AI가 차트와 그래프를 자동으로 생성하려고,
**So that** 전문가급 시각 자료를 얻을 수 있다.

**Acceptance Criteria:**

**Given** 문서 생성 중 텍스트가 완료되었을 때
**When** 문서에 인포그래픽이 필요한 부분이 있으면
**Then** Claude 4.5 멀티모달 능력으로 인포그래픽이 생성된다

**And** Claude API 호출 (이미지 생성):
  - `tool_use: {type: "image_generation"}`
  - 또는 별도 이미지 생성 API (DALL-E 3, Midjourney API)
  - 생성된 이미지가 문서에 임베디드된다

**And** 인포그래픽이 다음 형식을 지원한다:
  - Bar chart (시장 규모 비교)
  - Line chart (성장 추세)
  - Pie chart (시장 점유율)
  - Flow chart (비즈니스 프로세스)

**And** 인포그래픽이 `document_figures` 테이블에 저장된다:
  - `id` (UUID)
  - `document_id` (UUID)
  - `figure_type` (text: "bar", "line", "pie", "flow")
  - `image_url` (text, S3 또는 PostgreSQL bytea)
  - `caption` (text)
  - `order` (integer)

**When** 인포그래픽 생성이 완료되면
**Then** 문서 내에서 자동으로 해당 위치에 삽입된다
  - 텍스트: "[그림 1: 시장 규모 비교]" 이미지 placeholder → 실제 이미지로 교체

**And** 사용자가 인포그래픽을 재생성할 수 있다:
  - 이미지를 클릭 → "재생성" 버튼
  - 프롬프트: "이 차트를 더 명확하게 재생성해줘"

**And** 인포그래픽 생성 실패 시:
  - "인포그래픽 생성에 실패했습니다. 텍스트로 대체됩니다." 메시지
  - 문서는 텍스트로 계속 진행된다

---

### Story 3.4: 정부지원사업 5개 양식 지원

**As a** 예비 창업가,
**I want** 5개 정부지원사업 양식 중 하나를 선택하여 생성하려고,
**So that** 각 양식에 맞는 문서를 얻을 수 있다.

**Acceptance Criteria:**

**Given** 사용자가 문서 생성 페이지에서 양식을 선택할 때
**When** dropdown에서 다음 중 하나를 선택하면
**Then** 해당 양식에 맞는 템플릿이 적용된다:
  - 예비창업 (창업아이디어 공모)
  - 초기창업 (벤처투자 유치)
  - R&D (기업부설지원사업)
  - 성장 (고성장기업 지원)
  - 특화 (지역특화, 플랫폼 특화)

**And** 각 양식이 다른 템플릿을 사용한다:
  - `document_templates` 테이블에서 template_type별 `prompt_template` 로드
  - System prompt가 양식별 요구사항을 포함

**And** 양식별로 다른 섹션이 생성된다:
  - 예비창업: 창업아이디어, 시장성, 사업화 가능성
  - 초기창업: 투자 포트폴리, 팀, 제품, 시장, 비즈니스 모델
  - R&D: 과제 목표, 혁신성, 기술성, 사업화, 추진 전략
  - 성장: 매출 성장, 시장 확장, 조직 확장
  - 특화: 지역 특성, 플랫폼 전략

**When** 사용자가 양식을 선택하면
**Then** AI 인터뷰가 해당 양식에 맞는 질문을 생성한다
  - 예비창업: "어떤 사회문제를 해결하나요?"
  - 초기창업: "타겟 시장 규모는 얼마인가요?"
  - R&D: "핵심 기술의 혁신성은 무엇인가요?"

**And** 생성된 문서가 양식별 요구사항을 충족한다:
  - 페이지 수 (예비창업: 5-10페이지, R&D: 20-30페이지)
  - 필수 섹션 포함
  - 포맷팅 (글꼴, 줄 간격, 헤더 스타일)

---

### Story 3.5: IR 자료 생성 (피칭 데크)

**As a** 예비 창업가,
**I want** 피칭 데크를 자동으로 생성하려고,
**So that** 투자자 미팅을 준비할 수 있다.

**Acceptance Criteria:**

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

**And** 각 Slide가 다음을 포함한다:
  - Title (대제목)
  - Content (본문, bullet points)
  - Figure (인포그래픽, 선택 사항)
  - Notes (발표자 노트, 선택 사항)

**And** 생성된 피칭 데크가 다음 형식으로 저장된다:
  - `document_slides` 테이블:
    - `document_id` (UUID)
    - `slide_number` (integer)
    - `title` (text)
    - `content` (text, markdown)
    - `figure_id` (UUID, foreign key to `document_figures`, nullable)
  - PPTX로 다운로드 가능 (Story 4.3)

**When** 피칭 데크 생성이 완료되면
**Then** "피칭 데크가 준비되었습니다! 📊" 메시지
  - 미리보기 modal: Slide 1부터 carousel로 표시
  - "다운로드" / "편집" / "대시보드로" 버튼

**And** 사용자가 Slide를 순서를 변경할 수 있다:
  - Drag & drop으로 재배열
  - "저장" 버튼으로 순서 업데이트

---

### Story 3.6: AI 생성 실패 처리 및 재시도

**As a** 예비 창업가,
**I want** AI 생성 실패 시 재시도할 수 있길 원해서,
**So that** 문서를 성공적으로 생성할 수 있다.

**Acceptance Criteria:**

**Given** 사용자가 문서 생성 중일 때
**When** Claude API 호출이 실패하면
**Then** 다음이 수행된다:
  - 3초 이내 GLM 4.7로 fallback (NFR-I2)
  - Fallback도 실패 시 사용자에게 에러 메시지 표시

**And** 에러 메시지가 다음을 포함한다:
  - "문서 생성에 실패했습니다. 다시 시도하시겠습니까?"
  - 에러 원인 (선택 사항): "Claude API 일시 오류입니다."
  - "재시도" / "나중에" / "새로 만들기" 버튼

**When** 사용자가 "재시도"를 클릭하면
**Then** 이전 진행 상황이 유지된다:
  - 이미 생성된 부분이 있으면 표시 (프로그레시브 스트리밍 덕분)
  - 다시 Claude API 호출
  - 최대 3회 재시도

**And** 3회 실패 시:
  - "문서 생성에 지속적으로 실패하고 있습니다. 잠시 후 다시 시도해주세요." 메시지
  - "고객센터에 문의" 옵션

**When** 사용자가 "나중에"를 클릭하면
**Then** `documents` 테이블에 draft가 저장된다:
  - `status: "draft"`
  - `content` (부분적으로 생성된 내용)
  - "임시 저장되었습니다. 대시보드에서 다시 시작할 수 있습니다."

**And** 장애 복구를 위해 retry 전략이 적용된다:
  - Exponential backoff: 1초 → 2초 → 4초
  - Jitter: random(0-1초) 추가
  - Circuit breaker: 5분 동안 10회 실패 시 해당 API 일시 중단


---

## Epic 4: 문서 관리

### Epic Goal

사용자가 생성된 문서를 저장, 불러오기, 복제, 삭제, 다운로드할 수 있다. 문서 CRUD 기능을 제공하여 사용자가 결과물을 관리할 수 있다.

**FRs covered:** FR39-43, FR46 (6개)
**Phase:** Phase 1 (MVP 핵심)
**Dependencies:** Epic 1 (인증), Epic 3 (AI 생성)
**Total Stories:** 4

---

### Story 4.1: 문서 저장 및 불러오기

**As a** 예비 창업가,
**I want** 생성된 문서를 저장하고 나중에 불러올 수 있길 원해서,
**So that** 작업을 중단했다가 다시 시작할 수 있다.

**Acceptance Criteria:**

**Given** 사용자가 문서 생성을 완료했을 때
**When** 문서가 자동으로 저장된다 (Story 3.2)
**Then** `documents` 테이블에 최종 버전이 저장된다:
  - `status: "completed"`
  - `content` (전체 문서)
  - `completed_at` (timestamp)

**When** 사용자가 대시보드에서 "내 문서"를 클릭하면
**Then** 문서 목록이 표시된다

**And** 문서 목록이 다음을 포함한다:
  - Document title
  - Template type badge (정부지원사업, IR 자료)
  - 생성 날짜
  - 미리보기 (첫 200자)
  - "보기" / "편집" / "복제" / "삭제" / "다운로드" 버튼

**And** 목록이 정렬 가능하다:
  - "최신순" (default)
  - "오래된순"
  - "이름순"

**When** 사용자가 "보기"를 클릭하면
**Then** 문서 상세보기 modal이 표시된다
  - 전체 문서 내용
  - 인포그래픽 포함
  - "편집" / "다운로드" / "닫기" 버튼

**And** 문서가 불러올 때 자동 저장된다:
  - 마지막으로 저장된 위치로 scroll
  - "자동 저장되었습니다" 토스트

**And** 검색 기능이 제공된다:
  - Search bar: "문서 제목으로 검색"
  - Real-time filtering (입력 시 즉시 필터링)
  - 결과 0개: "검색 결과가 없습니다."

---

### Story 4.2: 문서 복제 및 삭제

**As a** 예비 창업가,
**I want** 문서를 복제하고 삭제할 수 있길 원해서,
**So that** 변형을 실험하고 불필요한 문서를 정리할 수 있다.

**Acceptance Criteria:**

**Given** 사용자가 문서 목록에 있을 때
**When** 사용자가 "복제" 버튼을 클릭하면
**Then** 문서 복제 modal이 표시된다:
  - "제목: [원본 제목] (복사)"
  - Title 입력 field (editable)
  - "복제" / "취소" 버튼

**When** 사용자가 "복제"를 클릭하면
**Then** 새 문서가 `documents` 테이블에 생성된다:
  - `title`: 사용자가 입력한 제목 (default: "[원본] (복사)")
  - `content`: 원본과 동일
  - `original_document_id` (UUID, foreign key to 원본)
  - `is_copy: true`
  - `status: "completed"`

**And** 성공 메시지: "문서가 복제되었습니다."
**And** 대시보드가 새 문서로 refresh된다

**Given** 사용자가 문서를 삭제하려고 할 때
**When** 사용자가 "삭제" 버튼을 클릭하면
**Then** 확인 modal이 표시된다:
  - "정말 이 문서를 삭제하시겠습니까?"
  - "삭제된 문서는 복구할 수 없습니다."
  - "취소" / "삭제" 버튼

**When** 사용자가 "삭제"를 확인하면
**Then** soft delete가 수행된다:
  - `documents.is_deleted: true`로 업데이트
  - 목록에서 숨겨진다

**And** 삭제된 문서는 30일 후 영구 삭제된다:
  - Background job: 매일 자정 0시에 30일 전 문서 삭제
  - `WHERE is_deleted = true AND deleted_at < NOW() - INTERVAL '30 days'`

**When** 사용자가 "삭제"를 실행할 때 오류가 발생하면
**Then** "삭제에 실패했습니다. 다시 시도해주세요." 에러 메시지

---

### Story 4.3: 문서 다운로드 (PDF/PPT)

**As a** 예비 창업가,
**I want** 생성된 문서를 PDF나 PPT로 다운로드하려고,
**So that** 제출하거나 공유할 수 있다.

**Acceptance Criteria:**

**Given** 사용자가 문서 상세보기 modal에 있을 때
**When** 사용자가 "다운로드" 버튼을 클릭하면
**Then** 다운로드 옵션 modal이 표시된다:
  - "PDF로 다운로드"
  - "PPT (피칭 데크용) 다운로드" (피칭 데크만 해당)

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

**When** PDF/PPT 변환이 실패하면
**Then** "다운로드에 실패했습니다. 다시 시도해주세요." 에러 메시지
  - Support ticket 옵션: "문의하기"

**And** 다운로드 히스토리가 추적된다:
  - `document_downloads` 테이블:
    - `user_id` (UUID)
    - `document_id` (UUID)
    - `format` (text: "pdf", "pptx")
    - `downloaded_at` (timestamp)

---

### Story 4.4: 문서 편집

**As a** 예비 창업가,
**I want** 생성된 문서를 편집할 수 있길 원해서,
**So that** AI가 생성한 초안을 수정할 수 있다.

**Acceptance Criteria:**

**Given** 사용자가 문서 상세보기 modal에 있을 때
**When** 사용자가 "편집" 버튼을 클릭하면
**Then** 문서 편집 페이지로 이동한다

**And** 편집 페이지가 다음을 제공한다:
  - WYSIWYG 에디터 (Tiptap 또는 Quill)
  - Toolbar: bold, italic, underline, heading, list, image
  - 문서 내용 editable
  - "저장" / "취소" / "미리보기" 버튼

**When** 사용자가 에디터에서 내용을 수정하면
**Then** 자동 저장이 수행된다:
  - 30초마다 auto-save
  - "저장 중..." / "저장됨" 토스트
  - `documents.updated_at` 업데이트

**And** 사용자가 인포그래픽을 편집할 수 있다:
  - 이미지를 클릭 → "교체" / "삭제" / "재생성" 옵션
  - 새 이미지 업로드 가능
  - 캡션 수정 가능

**When** 사용자가 "저장"을 클릭하면
**Then** 최종 저장이 수행된다:
  - `documents.content` 업데이트
  - `documents.is_edited: true`
  - "저장되었습니다!" 성공 메시지
  - 문서 상세보기 modal로 redirect

**And** 버전 히스토리가 관리된다:
  - `document_versions` 테이블:
    - `document_id` (UUID)
    - `version_number` (integer)
    - `content` (text)
    - `saved_at` (timestamp)
  - 저장 시마다 새 버전 생성
  - 최대 10개 버전 보관 (이후 old 버전 삭제)

**When** 편집 중 충돌이 발생하면 (다른 기기에서 동시 편집)
**Then** "마지막 저장 우선" 전략이 적용된다:
  - 가장 최근 저장이 우선됨
  - 이전 편집은 덮어씌워짐
  - "다른 사용자가 저장했습니다. 최신 버전을 불러옵니다." 알림

**And** 편집을 취소하면:
  - "편집을 취소하시겠습니까? 저장되지 않은 변경사항이 손실됩니다." 확인
  - 확인 시 대시보드로 돌아감


---

## Epic 5: 사용자 인터페이스 및 접근성

### Epic Goal

사용자가 Dark Mode, 반응식 UI, WCAG 2.1 Level AA 준수를 통해 모든 기능에 접근할 수 있다. 이 Epic은 모든 다른 Epics에 적용되는 cross-cutting concern으로, 병행으로 개발된다.

**FRs covered:** FR33-38, FR47-50 (13개)
**Phase:** Phase 2 (중요)
**Dependencies:** None (Foundation UI)
**Total Stories:** 4
**Note:** Cross-cutting concern - 모든 Epic에 적용

---

### Story 5.1: Dark Mode 구현

**As a** 사용자,
**I want** Dark Mode를 사용하려고,
**So that** 눈의 피로를 줄이고 야간에 편안하게 사용할 수 있다.

**Acceptance Criteria:**

**Given** 사용자가 시스템 설정을 확인했을 때
**When** OS 설정이 Dark Mode이면
**Then** 자동으로 Dark Mode가 적용된다

**And** 사용자가 수동으로 Dark Mode를 토글할 수 있다:
  - Header에 "🌙" / "☀️" 버튼
  - Settings에서 "Dark Mode" toggle
  - `user_preferences.dark_mode` (boolean, default: OS 설정 따름)

**When** Dark Mode가 활성화되면
**Then** 모든 UI 컴포넌트가 dark theme를 사용한다:
  - Background: `#1a1a1a`
  - Surface: `#2d2d2d`
  - Primary text: `#e0e0e0`
  - Secondary text: `#b0b0b0`
  - Accent color: `#4CAF50` (green)

**And** Dark Mode 전환이 smooth하게 이루어진다:
  - CSS transition: `background-color 0.3s ease, color 0.3s ease`
  - 깜빡지는 flash 없음

**And** Tailwind CSS `dark:` 클래스가 활용된다:
  - `<div class="bg-white dark:bg-gray-900">`
  - `<span class="text-black dark:text-white">`

**When** 사용자가 Light Mode로 전환하면
**Then** 반대로 light theme가 적용된다:
  - Background: `#ffffff`
  - Surface: `#f5f5f5`
  - Primary text: `#000000`
  - Secondary text: `#666666`

**And** Dark Mode 설정이 로컬 스토리지에 저장된다:
  - `localStorage.setItem('darkMode', 'true')`
  - 다음 접속 시 설정 유지

---

### Story 5.2: 반응식 디자인 (Mobile, Tablet, Desktop)

**As a** 사용자,
**I want** 모바일, 태블릿, 데스크톱에서 모두 사용할 수 있길 원해서,
**So that** 어떤 기기에서든 접근할 수 있다.

**Acceptance Criteria:**

**Given** 사용자가 데스크톱 (1200px+)에서 접속했을 때
**Then** 데스크톱 레이아웃이 적용된다:
  - Sidebar navigation (왼쪽)
  - Main content area (오른쪽)
  - 3-column 레이아웃 (문서 목록, 편집기, 미리보기)

**Given** 사용자가 태블릿 (768px - 1199px)에서 접속했을 때
**Then** 태블릿 레이아웃이 적용된다:
  - Collapsible sidebar (햄버거 메뉴)
  - 2-column 레이아웃
  - Touch-friendly button sizes (최소 44x44px)

**Given** 사용자가 모바일 (320px - 767px)에서 접속했을 때
**Then** 모바일 레이아웃이 적용된다:
  - Hidden sidebar (하단 navigation bar)
  - 1-column stack 레이아웃
  - Bottom tab navigation: "홈", "문서", "생성", "설정"
  - Full-width modals

**And** 반응형 breakpoints가 Tailwind CSS로 구현된다:
  - Mobile: `<div class="sm:hidden">` (기본)
  - Tablet: `<div class="hidden sm:block lg:hidden">`
  - Desktop: `<div class="hidden lg:block">`

**When** 사용자가 모바일에서 Node UI를 사용하려고 하면
**Then** "Node UI는 데스크톱에서 최적화되어 있습니다. 데스크톱에서 접속해주세요." 안내 modal
  - "데스크톱으로 보내기" 옵션 (이메일 링크 또는 QR code)

**And** touch targets가 WCAG 2.1을 준수한다:
  - 최소 크기: 44x44px (추천), 48x48px (권장)
  - Spacing: 인접한 버튼 간 8px 이상 간격

**And** orientation change가 지원된다:
  - 세로 → 가로 화면 회전 시 layout 재계산
  - 현재 scroll position 유지

---

### Story 5.3: WCAG 2.1 Level AA 준수

**As a** 장애인 사용자,
**I want** 스크린 리더와 키보드로 모든 기능을 사용할 수 있길 원해서,
**So that** 다양한 보조 기술로 접근할 수 있다.

**Acceptance Criteria:**

**Given** 시각 장애인 사용자가 스크린 리더를 사용할 때
**When** 사용자가 UI를 탐색하면
**Then** 모든 interactive 요소에 ARIA 라벨이 제공된다:
  - `<button aria-label="문서 생성">`
  - `<input aria-label="제목 입력">`
  - `<img src="logo.png" alt="bm-builder 로고">`

**And** 색상 대비가 4.5:1 이상을 충족한다:
  - Normal text: #000000 on #ffffff (21:1)
  - Large text (18pt+): #595959 on #ffffff (7:1)
  - Icons: #4CAF50 on #ffffff (4.5:1)

**And** focus indicator가 명확하게 표시된다:
  - Keyboard focus: 2px solid #4CAF50 outline
  - Never remove focus indicator (outline: none 금지)

**Given** 키보드 전용 사용자일 때
**When** 사용자가 Tab 키로 탐색하면
**Then** focus order가 논리적이다 (왼쪽→오른쪽, 위→아래)
**And** 모든 interactive 요소가 키보드로 접근 가능하다:
  - Skip links: "주요 내용으로 건너뛰기"
  - Focus trap: modal 안에서 focus가 빠져나가지 않음
  - Escape key: modal 닫기

**When** 사용자가 Enter 또는 Space로 버튼을 활성화하면
**Then** Click과 동일한 동작이 수행된다

**Given** 저시력 사용자일 때
**When** 사용자가 200%로 확대하면
**Then** 모든 기능이 사용 가능하다:
  - Horizontal scroll 없음 (viewport에 맞춰 reflow)
  - Text가 자동으로 줄바꿈
  - Images가 viewport 너비에 맞춰 resize

**And** 모든 기능이 키보드만으로 완료 가능하다:
  - Drag & drop 제외 (keyboard alternative 제공)
  - "편집 모드로 들어가기" 버튼으로 spacebar 대체

**When** 스크린 리더가 사용될 때
**Then** Live regions이 올바르게 announced된다:
  - `<div role="status" aria-live="polite">` ("저장되었습니다" - 사용자 요청 시)
  - `<div role="alert" aria-live="assertive">` ("오류가 발생했습니다" - 즉시 알림)

---

### Story 5.4: 감정적 에러 메시지 및 키보드 내비게이션

**As a** 사용자,
**I want** 에러 발생 시 감정적인 메시지를 받고 키보드로 UI를 조작할 수 있길 원해서,
**So that** UX가 더 친숙하고 효율적이다.

**Acceptance Criteria:**

**Given** 사용자가 에러 상황에 처했을 때
**When** 에러가 발생하면
**Then** 감정적이고 친근한 에러 메시지가 표시된다:
  - "문서 생성에 실패했어요. 다시 시도해볼까요? 😊"
  - "네트워크 연결이 끊겼습니다. 인터넷 연결을 확인해주세요!"
  - "저장권한이 없습니다. 로그인해주세요."

**And** 에러 메시지가 다음을 포함한다:
  - 문제가 무엇인지 설명
  - 해결 방안 제안
  - 긍정적인 어조

**And** 에러 아이콘이 사용된다:
  - Alert: ⚠️
  - Info: ℹ️
  - Success: ✅
  - Error: ❌

**Given** 사용자가 키보드 단축키를 사용할 때
**When** 단축키가 활용 가능하면
**Then** 다음 global shortcuts가 제공된다:
  - `Cmd/Ctrl + K`: 문서 검색
  - `Cmd/Ctrl + N`: 새 문서 만들기
  - `Cmd/Ctrl + /`: 키보드 shortcuts 도움말
  - `Escape`: Modal 닫기

**And** 단축키가 tooltip로 표시된다:
  - "새 문서 만들기 (⌘K)"
  - Hover 시 키보드 shortcuts 표시

**And** menu navigation이 키보드로 가능하다:
  - Arrow keys: Up/Down으로 메뉴 이동
  - Enter: 메뉴 항목 선택
  - Escape: 메뉴 닫기
  - First letter navigation: "H" 키로 "Help" 메뉴로 이동

**When** 사용자가 `Cmd/Ctrl + /`를 누르면
**Then** keyboard shortcuts modal이 표시된다:
  - 모든 shortcuts 목록
  - 검색 기능
  - "닫기" (Escape)


---

## Epic 6: Visual Workflow Management (Node UI)

**Phase**: 3 (Post-MVP)
**Priority**: Medium
**User Value**: 시각적 워크플로우 관리로 복잡한 문서 생성 과정을 직관적으로 이해하고 제어
**FRs Covered**: FR44, FR45, FR46, FR47, FR48

### Story 6.1: Node-based Canvas 기본 구조

**As a** 사용자,
**I want** 노드 기반 캔버스에서 문서 생성 워크플로우를 시각화할 수 있길 원해서,
**So that** 복잡한 문서 구조를 직관적으로 이해하고 관리할 수 있다.

**Acceptance Criteria:**

**Given** 인증된 사용자가 문서 생성을 완료했을 때
**When** 사용자가 "Node UI 보기" 버튼을 클릭하면
**Then** React Flow 기반 캔버스가 렌더링된다:
  - `<ReactFlow>` 컴포넌트 초기화
  - Canvas size: 100% viewport width/height
  - Background: Dot pattern (20px gap)

**And** 다음 nodes가 자동 생성된다:
  - Start node: "문서 시작" (rounded rectangle, green)
  - Section nodes: 각 문서 섹션 (rectangle, blue)
  - AI generation nodes: AI가 생성한 콘텐츠 (diamond, purple)
  - End node: "완성된 문서" (rounded rectangle, green)

**And** nodes가 다음 정보를 표시한다:
  - Node title (섹션명)
  - Status badge: "완료" | "진행중" | "대기중"
  - Word count: "2,500자"
  - Last edited: "2024-01-09 14:30"

**When** 사용자가 캔버스를 조작하면
**Then** 다음 interactions이 가능하다:
  - Pan: Mouse wheel drag + Space + drag
  - Zoom: Mouse wheel (0.5x - 2x)
  - Fit view: "화면에 맞추기" 버튼

**Given** 사용자가 mobile 화면일 때
**When** 캔버스가 로드되면
**Then** Touch gestures가 지원된다:
  - Two-finger pan
  - Pinch-to-zoom
  - Double-tap to zoom in

---

### Story 6.2: Node Drag-and-Drop 및 편집

**As a** 사용자,
**I want** 노드를 drag-and-drop으로 재배치하고 직접 편집할 수 있길 원해서,
**So that** 워크플로우를 자유롭게 커스터마이즈할 수 있다.

**Acceptance Criteria:**

**Given** 사용자가 Node UI에 있을 때
**When** 사용자가 node를 drag하면
**Then** Node가 실시간으로 이동한다:
  - Smooth animation (60fps)
  - Snap-to-grid: 20px grid
  - Connection lines이 자동으로 업데이트

**And** 다음 drag behaviors이 적용된다:
  - Drag threshold: 5px (click 방지)
  - Boundary constraint: Canvas bounds 내에서만 이동
  - Collision detection: Nodes가 겹치지 않도록 auto-position

**When** 사용자가 node를 double-click하면
**Then** Node detail modal이 열린다:
  - Section title: "프로젝트 개요"
  - Content preview: First 200 characters
  - "편집" 버튼: WYSIWYG editor로 이동
  - "복제" 버튼: Node 복제
  - "삭제" 버튼: Node 삭제 (confirmation required)

**And** Modal에서 다음 편집이 가능하다:
  - Title 수정: Input field
  - Color 선택: Color picker (6 preset colors)
  - Icon 선택: Icon picker (12 icons)
  - Notes 추가: Textarea for notes

**When** 사용자가 node를 삭제하면
**Then** Confirmation modal이 표시된다:
  - "이 섹션을 삭제하시겠습니까?"
  - "연결된 모든 콘텐츠가 삭제됩니다."
  - "취소" | "삭제" 버튼

**Given** 사용자가 multiple nodes를 선택했을 때
**When** 사용자가 Shift + click으로 nodes를 선택하면
**Then** Multi-selection이 활성화된다:
  - Selected nodes: Blue outline (2px)
  - Group drag: 모든 selected nodes가 함께 이동
  - Group delete: 모두 한번에 삭제

---

### Story 6.3: Node Connection Lines 및 Flow Visualization

**As a** 사용자,
**I want** 노드 간 연결 선을 명확하게 보고 flow를 이해할 수 있길 원해서,
**So that** 문서 생성 논리를 시각적으로 파악할 수 있다.

**Acceptance Criteria:**

**Given** 사용자가 Node UI에 있을 때
**When** Node connections이 렌더링되면
**Then** 다음 connection styles이 적용된다:
  - Line type: Bezier curve (smooth)
  - Line width: 2px
  - Color: #94a3b8 (slate-400)
  - Arrow: 마지막 node에 화살표

**And** Connection lines이 다음을 표시한다:
  - Flow direction: Start → End
  - Data flow: "AI 생성" nodes에서 나오는 lines은 dashed
  - Dependency: Mandatory paths는 solid, optional은 gray

**When** 사용자가 connection line을 hover하면
**Then** Connection detail tooltip이 표시된다:
  - Source node: "프로젝트 개요"
  - Target node: "시장 분석"
  - Relationship type: "Sequential"
  - Data flow: "AI에서 1,500자 복사"

**And** Connection이 강조표시된다:
  - Line width: 3px
  - Color: #4CAF50 (green)
  - Connected nodes: Subtle glow

**Given** 사용자가 connection을 클릭할 때
**When** Connection line을 click하면
**Then** Connection edit modal이 열린다:
  - Relationship type: "Sequential" | "Parallel" | "Conditional"
  - Label: "AI 생성에서 복사"
  - "연결 해제" 버튼

**When** 사용자가 "연결 해제"를 클릭하면
**Then** Connection이 삭제되고 nodes가 분리된다:
  - Confirmation required
  - Undo 가능 (Ctrl/Cmd + Z)

**Given** 복잡한 flow가 있을 때
**When** User가 "Simplify view"를 toggle하면
**Then** Minor connections이 숨겨진다:
  - AI generation connections 숨김
  - Major sections만 연결 표시
  - Toggle button: "간단히 보기" | "자세히 보기"

---

### Story 6.4: Infinite Canvas 및 Navigation

**As a** 사용자,
**I want** 무한 캔버스에서 확대/축소하고 원하는 영역으로 이동할 수 있길 원해서,
**So that** 대규모 워크플로우도 효율적으로 탐색할 수 있다.

**Acceptance Criteria:**

**Given** 사용자가 Node UI에 있을 때
**When** 사용자가 zoom controls을 사용하면
**Then** 다음 zoom options이 제공된다:
  - Zoom buttons: `+` `-` buttons (bottom-right)
  - Zoom levels: 25%, 50%, 75%, 100%, 150%, 200%
  - Current zoom: "100%" 표시
  - Fit to screen: "화면에 맞추기" button

**And** Zoom animations이 적용된다:
  - Duration: 200ms
  - Easing: ease-in-out
  - Center on zoom: 마우스 위치 중심으로 zoom

**When** 사용자가 pan하면
**Then** 다음 pan gestures가 지원된다:
  - Mouse drag + Space key pressed
  - Middle mouse button drag
  - Touch: Two-finger drag
  - Mini-map: Small overview map (bottom-left)

**And** Mini-map이 다음을 표시한다:
  - All nodes: Small rectangles
  - Viewport: Blue rectangle overlay
  - Draggable viewport: Mini-map에서 drag하여 pan
  - Size: 200x150px

**Given** 사용자가 특정 node를 찾을 때
**When** 사용자가 "노드 찾기"를 클릭하면
**Then** Node search modal이 열린다:
  - Search input: Node title 검색
  - Results: Matching nodes 목록
  - "이동" 버튼: 해당 node로 focus + zoom in

**And** Node로 이동할 때:
  - Smooth pan animation (500ms)
  - Auto zoom: Node가 화면 중앙에 위치
  - Highlight: Node가 1초간 pulse animation

**When** 사용자가 "Reset view"를 클릭하면
**Then** Canvas가 초기 상태로 복귀한다:
  - Zoom: 100%
  - Position: (0, 0)
  - All nodes visible

**Given** 100+ nodes가 있을 때
**When** Canvas가 렌더링되면
**Then** Virtualization이 적용된다:
  - Only visible nodes rendered (viewport + 50% margin)
  - Off-screen nodes: Unmounted
  - Performance: 60fps maintained with 500+ nodes

---

### Story 6.5: Node UI Export 및 공유

**As a** 사용자,
**I want** Node UI를 이미지나 PDF로 export하고 공유할 수 있길 원해서,
**So that** 워크플로우를 팀원과 공유하고 문서화할 수 있다.

**Acceptance Criteria:**

**Given** 사용자가 Node UI에 있을 때
**When** 사용자가 "Export" 버튼을 클릭하면
**Then** Export options modal이 열린다:
  - Format: "PNG" | "SVG" | "PDF"
  - Resolution: "1x" | "2x" (Retina) | "3x" (Print)
  - Include: ☑ Background | ☑ Grid | ☑ Legend
  - "Export" 버튼

**When** 사용자가 PNG를 선택하고 Export하면
**Then** Canvas가 PNG로 다운로드된다:
  - Format: PNG (lossless)
  - Resolution: Selected resolution (1x/2x/3x)
  - Filename: `workflow-YYYY-MM-DD.png`
  - Full canvas: All nodes included (pan 필요 없음)

**And** Export가 다음을 포함한다:
  - All visible nodes
  - Connection lines
  - Background (if selected)
  - Grid (if selected)
  - Legend (if selected)

**When** 사용자가 SVG를 선택하고 Export하면
**Then** Canvas가 SVG로 다운로드된다:
  - Format: SVG (vector)
  - Editable: Adobe Illustrator, Figma에서 편집 가능
  - Text: Selectable text (not rasterized)
  - Filename: `workflow-YYYY-MM-DD.svg`

**When** 사용자가 PDF를 선택하고 Export하면
**Then** Canvas가 PDF로 다운로드된다:
  - Format: PDF (A4 or custom size)
  - Page size: "A4" | "Letter" | "Custom"
  - Multi-page: Large canvas가 여러 페이지로 분할
  - Filename: `workflow-YYYY-MM-DD.pdf`

**Given** 사용자가 공유 링크를 생성할 때
**When** 사용자가 "공유 링크 생성"을 클릭하면
**Then** Shareable link가 생성된다:
  - URL: `https://app.bm-builder.com/workflow/share/{uuid}`
  - Access control: "Anyone with link" | "Password protected"
  - Expiration: "Never" | "7 days" | "30 days"
  - "Copy link" 버튼

**And** Public share page가 다음을 표시한다:
  - Node canvas (read-only)
  - Document title
  - Created date
  - "bm-builder에서 열기" button (app deep link)

**When** 사용자가 link를 복사하면
**Then** Clipboard에 저장되고 성공 메시지가 표시된다:
  - Toast: "링크가 복사되었습니다!"
  - Link validity: Server-side validation

---

### Story 6.5: Node UI 가이드 투어

**As a** 예비 창업가,
**I want** 1분 가이드 투어로 Node UI 사용법을 배우려고,
**So that** 빠르게 도구에 익숙해질 수 있다.

**Acceptance Criteria:**

**Given** 사용자가 Node UI를 처음 사용할 때
**When** 사용자가 캔버스에 접속하면
**Then** 가이드 투어가 자동으로 시작된다

**And** 가이드 투어가 4단계로 구성된다:
  - **Step 1/4:** "노드 생성" - 빈 캔버스를 하이라이트
  - **Step 2/4:** "노드 연결" - 두 개의 노드를 하이라이트
  - **Step 3/4:** "노드 편집" - 노드 더블 클릭 영역 하이라이트
  - **Step 4/4:** "시작하기" - "이제 모든 것을 준비했습니다!"

**And** 각 단계에서:
  - 하이라이트된 영역에 dark overlay 적용
  - Tooltip이 상단에 표시된다
  - "다음" / "건너뛰기" 버튼 제공

**And** 사용자가 가이드 투어를 완료하면:
  - 축하 메시지: "가이드 투어를 완료했습니다! 이제 Node UI를 자유롭게 사용해보세요."
  - `user_preferences.node_ui_tour_completed` = true

**And** 사용자가 가이드 투어를 건너뛰면:
  - "나중에 Settings에서 다시 볼 수 있습니다." 메시지

**And** 가이드 투어를 다시 보고 싶으면:
  - Settings > "Node UI 가이드 투어 다시 보기"

**And** 가이드 투어 중간에 앱을 종료 후 다시 접속하면:
  - 마지막 단계부터 재개된다

---


## Epic 7: 팀 협업

**Phase**: 2 (중요)
**Priority**: High
**User Value**: 팀원들과 문서를 공유하고 협업하여 생산성 향상
**FRs Covered**: FR22, FR23, FR24, FR25, FR26, FR27

### Story 7.1: 팀 생성 및 초대

**As a** 사용자,
**I want** 팀을 생성하고 팀원을 초대할 수 있길 원해서,
**So that** 함께 프로젝트를 진행할 수 있다.

**Acceptance Criteria:**

**Given** 인증된 사용자가 팀에 속해 있지 않을 때
**When** 사용자가 "새 팀 만들기" 버튼을 클릭하면
**Then** 팀 생성 모달이 표시된다:
  - Team name: Input field (required, max 50 chars)
  - Team description: Textarea (optional, max 200 chars)
  - "만들기" | "취소" 버튼

**And** 팀이 생성되면 다음이 설정된다:
  - User가 team admin으로 지정됨
  - Team이 PostgreSQL `teams` table에 생성됨
  - Team membership이 `team_members` table에 기록됨

**Given** 사용자가 팀 admin일 때
**When** 사용자가 "팀원 초대" 버튼을 클릭하면
**Then** 초대 모달이 표시된다:
  - Email inputs: Multiple email addresses (comma-separated)
  - Role selection: "Editor" | "Viewer"
  - Personal message: Textarea (optional)
  - "초대장 보내기" | "취소" 버튼

**And** 초대장이 다음을 포함한다:
  - Invitation link: `https://app.bm-builder.com/invite/{invite_token}`
  - Inviter name: "John Doe 님이 초대했습니다"
  - Team name: "Acme Startup 팀"
  - Role: "Editor" | "Viewer"
  - Personal message (if provided)
  - "수락" | "거절" 버튼

**When** 초대받은 사용자가 링크를 클릭하면
**Then** 초대 수락 페이지가 표시된다:
  - Team 정보: Name, description, member count
  - Role: "Editor로 초대되었습니다"
  - "수락하기" | "거절하기" 버튼

**And** "수락하기"를 클릭하면:
  - User가 team에 추가됨
  - `team_members` table에 기록됨
  - Dashboard로 redirect

**Given** 사용자가 이미 팀에 속해 있을 때
**When** 다른 팀에서 초대를 보내면
**Then** User가 multiple teams에 속할 수 있다:
  - Team switcher: Profile dropdown에서 팀 선택
  - Active team indicator: Current team 표시
  - Team context: 모든 작업이 active team에서 수행됨

---

### Story 7.2: 권한 시스템 및 역할

**As a** 팀 admin,
**I want** 팀원들의 역할과 권한을 관리할 수 있길 원해서,
**So that** 보안과 접근 제어를 유지할 수 있다.

**Acceptance Criteria:**

**Given** 팀 admin이 팀원 관리 페이지에 있을 때
**When** 팀원 목록이 표시되면
**Then** 각 팀원의 정보가 표시된다:
  - Avatar + Name
  - Email
  - Role: "Admin" | "Editor" | "Viewer"
  - Status: "Active" | "Pending"
  - Actions: "역할 변경" | "제거"

**And** Role별 permissions이 다음과 같다:
  - **Admin**: 모든 권한 + 팀원 초대 + 역할 변경 + 팀 설정
  - **Editor**: 문서 생성/편집/삭제 + 공유 + 댓글
  - **Viewer**: 문서 보기 + 댓글 (편집/삭제 불가)

**When** Admin이 팀원의 역할을 변경하면
**Then** 역할 변경 모달이 열린다:
  - Member name: "John Doe"
  - Current role: "Editor"
  - New role: Radio buttons (Admin/Editor/Viewer)
  - Role permissions: 현재 선택된 role의 permissions 표시
  - "변경" | "취소" 버튼

**And** 역할 변경 시 다음이 발생한다:
  - `team_members` table에서 role 업데이트
  - Member에게 email 알림: "역할이 Editor로 변경되었습니다"
  - 즉시 적용 (다음 login부터 반영)

**Given** Admin이 팀원을 제거할 때
**When** "제거" 버튼을 클릭하면
**Then** Confirmation 모달이 표시된다:
  - "John Doe 님을 팀에서 제거하시겠습니까?"
  - "제거된 멤버는 더 이상 팀 문서에 접근할 수 없습니다."
  - "제거" | "취소" 버튼

**And** 제거 시 다음이 발생한다:
  - `team_members` table에서 record 삭제 (soft delete)
  - Member의 access revoked 즉시
  - Member에게 email 알림: "Acme Startup 팀에서 제거되었습니다"

**Given** Viewer가 편집을 시도할 때
**When** Viewer가 "문서 편집" 버튼을 클릭하면
**Then** Permission denied 메시지가 표시된다:
  - "편집 권한이 없습니다."
  - "Admin에게 문의하여 권한을 요청하세요."
  - "확인" 버튼

---

### Story 7.3: 공유 문서 작업 공간

**As a** 팀원,
**I want** 팀원들과 문서를 공유하고 함께 작업할 수 있길 원해서,
**So that** 협업할 수 있다.

**Acceptance Criteria:**

**Given** 팀원이 문서를 생성했을 때
**When** 문서 생성이 완료되면
**Then** 문서가 자동으로 팀 workspace에 추가된다:
  - Document visibility: "Team only" (default)
  - Owner: 생성자
  - Created at: Timestamp
  - Team documents 목록에 표시

**And** 문서 목록이 다음을 표시한다:
  - Document title
  - Owner: "By John Doe"
  - Last edited: "2 hours ago"
  - Status: "Draft" | "Review" | "Final"
  - Actions: "열기" | "공유 설정" | "복제"

**Given** 팀원이 문서를 열 때
**When** Document editor가 로드되면
**Then** Editor header에 collaboration info가 표시된다:
  - Active viewers: "John, Jane, Bob viewing now"
  - Avatars: 3개 avatars + "+2 more"
  - Last edited by: "Jane Doe edited 5 minutes ago"
  - "공유" 버튼

**When** 팀원이 문서를 편집하면
**Then** Changes가 auto-save되고 팀원에게 표시된다:
  - Auto-save: 30초마다 또는 변경 시
  - "저장됨" indicator: Top-right
  - Polling: 30초마다 changes check (Epic 7: Polling-based)
  - Other viewers: "New changes available" banner

**Given** 팀원이 "공유" 버튼을 클릭할 때
**When** Share modal이 열리면
**Then** 다음 share options이 제공된다:
  - Link sharing: Toggle on/off
  - Access: "Anyone with link" | "Team only" | "Specific people"
  - Permission: "View" | "Edit" | "Comment"
  - "Copy link" 버튼
  - Invite people: Email inputs

**And** Link sharing이 활성화되면:
  - Shareable link 생성: `https://app.bm-builder.com/doc/{uuid}`
  - Link expiration: Optional (7/30/never days)
  - Access password: Optional

**When** 팀원이 공유 링크를 복사하면
**Then** Clipboard에 저장되고 toast가 표시된다:
  - "링크가 복사되었습니다!"
  - Link가 document metadata에 저장됨

---

### Story 7.4: 댓글 및 피드백

**As a** 팀원,
**I want** 문서에 댓글을 달고 피드백을 제공할 수 있길 원해서,
**So that** 협업과 커뮤니케이션이 개선된다.

**Acceptance Criteria:**

**Given** 팀원이 문서를 보고 있을 때
**When** 문서 content를 선택하면
**Then** "댓글 추가" tooltip이 표시된다:
  - Tooltip: 선택된 text 근처에
  - Icon: 💬 bubble icon
  - Click: 댓글 input 열기

**When** 팀원이 댓글을 추가하면
**Then** 댓글 input modal이 표시된다:
  - Selected text: Highlighted and quoted
  - Comment textarea: Placeholder "피드백을 입력하세요..."
  - "Submit" | "Cancel" 버튼

**And** 댓글이 제출되면 다음이 발생한다:
  - Comment 저장: `comments` table
  - Document association: `document_id` + `text_anchor`
  - Highlight: Selected text에 yellow background
  - Comment thread indicator: Number badge (💬 3)

**Given** 팀원이 댓글을 view할 때
**When** Document에서 highlighted text를 클릭하면
**Then** Comment thread sidebar가 열린다:
  - Thread title: First comment의 text (100 chars)
  - Comments: All comments in thread
  - Each comment: Avatar, Name, Timestamp, Text
  - "Reply" button: Each comment에

**And** Comment thread이 다음을 표시한다:
  - Total count: "3 comments"
  - Participants: "John, Jane, Bob"
  - Last activity: "2 hours ago"
  - Resolve thread: "해결됨" checkbox

**When** 팀원이 댓글에 reply하면
**Then** Reply가 추가되고 알림이 전송된다:
  - Reply 저장: `comments` table (parent_comment_id)
  - Notification: Original commenter에게
  - Email: "Jane Doe 님이 댓글에 답글을 달았습니다"
  - Thread order: Most recent first

**Given** Admin이 comment thread를 resolve할 때
**When** "해결됨"을 체크하면
**Then** Thread가 resolved로 표시된다:
  - Highlight 제거: Yellow background removed
  - Thread indicator: Grayed out
  - Status: "✓ Resolved by John"
  - Reopen 가능: "Unresolve" button

**Given** Viewer가 comment를 남길 때
**When** Comment가 제출되면
**Then** Viewer도 comment를 남길 수 있다:
  - Viewer role: Comments allowed
  - Edit/Delete: 본인의 comments만
  - Admin permissions: All comments 삭제 가능

---

### Story 7.5: 버전 기반 협업 (Polling)

**As a** 팀원,
**I want** Polling-based으로 다른 팀원의 변경 사항을 확인할 수 있길 원해서,
**So that** 실시간 협업 (Epic 8) 없이도 기본적인 협업이 가능하다.

**Acceptance Criteria:**

**Given** 팀원이 문서를 편집할 때
**When** Another member가 같은 문서를 편집하면
**Then** Polling이 changes를 감지한다:
  - Polling interval: 30초마다
  - Endpoint: `GET /api/documents/{id}/changes?since={timestamp}`
  - Response: New changes 또는 304 Not Modified

**And** New changes가 감지되면 다음이 표시된다:
  - Banner: "New changes available"
  - Preview: "Jane Doe가 3 sections을 수정했습니다"
  - Actions: "지금 새로고침" | "나중에"
  - Dismissible: "X"로 닫기 가능

**When** 사용자가 "지금 새로고침"을 클릭하면
**Then** Document가 reload되고 changes가 적용된다:
  - Current changes: Auto-saved locally (localStorage)
  - Merge strategy: Last-write-wins (Section 단위)
  - Conflict detection: Same section edited 알림

**And** Conflict가 감지되면:
  - Conflict modal: "Same section edited by Jane Doe"
  - Options: "Keep mine" | "Use theirs" | "Compare"
  - Compare: Side-by-side diff view
  - Resolution: User 선택 적용

**Given** 사용자가 문서를 닫을 때
**When** 페이지를 leave하면
**Then** Auto-save가 triggered된다:
  - Unsaved changes: Server에 저장
  - Last edited timestamp: 업데이트
  - Session cleanup: Polling 중단

**And** Exponential backoff이 적용된다:
  - Initial interval: 30초
  - Failed requests: 30초 → 60초 → 120초
  - Max interval: 5분
  - Success: Reset to 30초

**When** User가 offline일 때
**Then** Polling이 일시중지된다:
  - Offline detection: `navigator.onLine`
  - Queued changes: localStorage에 저장
  - Reconnect: Auto-resume polling + queued changes upload

**And** Offline indicator가 표시된다:
  - Banner: "오프라인 - 변경 사항이 로컬에 저장됩니다"
  - Icon: ⚠️ warning
  - Auto-hide: Online when reconnect

---

### Story 7.6: 팀 활동 대시보드

**As a** 팀원,
**I want** 팀 활동과 최근 변경 사항을 볼 수 있길 원해서,
**So that** 팀의 진행 상황을 파악할 수 있다.

**Acceptance Criteria:**

**Given** 팀원이 dashboard에 있을 때
**When** Team activity section이 표시되면
**Then** 다음 activity metrics이 표시된다:
  - Total documents: Count
  - Active members: Count (last 7 days active)
  - This week: "12 documents created", "45 comments"
  - Trend: "↑ 20% vs last week"

**And** Recent activity feed가 표시된다:
  - Each activity: Avatar + Name + Action + Timestamp
  - Actions: "created", "edited", "commented", "shared"
  - Relative time: "2 hours ago", "Yesterday"
  - Limit: Last 20 activities
  - "Load more" button

**Given** Admin이 dashboard를 볼 때
**When** Team analytics section이 표시되면
**Then** 다음 metrics이 추가로 표시된다:
  - Most active members: Top 5 by contributions
  - Most viewed documents: Top 5 by views
  - Storage usage: "2.4 GB / 10 GB"
  - Member growth chart: Last 30 days

**And** Team health score가 표시된다:
  - Score: 0-100
  - Factors: Activity level, engagement, collaboration
  - Status: "Excellent" | "Good" | "Needs attention"
  - Recommendations: Actionable insights

**When** 사용자가 activity를 클릭하면
**Then** 관련 document로 이동한다:
  - Click: "Jane Doe edited Project Proposal"
  - Action: Open document in editor
  - Scroll: Related section으로 scroll (if applicable)

**Given** 사용자가 activity를 filter할 때
**When** Filter dropdown을 사용하면
**Then** 다음 filter options이 제공된다:
  - Activity type: "All" | "Documents" | "Comments" | "Sharing"
  - Member: "All members" | Specific member 선택
  - Date range: "Last 7 days" | "Last 30 days" | "Custom"
  - Apply: 즉시 filter 적용

**And** Filter results이 실시간으로 업데이트된다:
  - Loading indicator: Spinner
  - Result count: "15 activities found"
  - Clear filter: "필터 지우기" button

**When** 사용자가 "Load more"를 클릭하면
**Then** 다음 20 activities가 로드된다:
  - Infinite scroll: Auto-load when reaching bottom
  - Pagination: `?page=2`, `?page=3`
  - Performance: Caching with 5-minute TTL

---


## Epic 8: 실시간 협업 및 버전 관리

**Phase**: 3 (Post-MVP)
**Priority**: Medium
**User Value**: WebSocket-based 실시간 협업으로 매끄러운 동시 편집 경험
**FRs Covered**: FR62, FR63, FR64, FR65, FR66, FR67

### Story 8.1: WebSocket 연결 및 Presence

**As a** 팀원,
**I want** 다른 팀원이 문서를 보고 편집하는 것을 실시간으로 볼 수 있길 원해서,
**So that** 진정한 실시간 협업이 가능하다.

**Acceptance Criteria:**

**Given** 팀원이 문서를 열 때
**When** Document editor가 로드되면
**Then** WebSocket 연결이 설정된다:
  - Protocol: `wss://api.bm-builder.com/ws`
  - Connection: Socket.IO client (v4.6.0)
  - Authentication: JWT token via query param
  - Room: Join document-specific room (`doc_{document_id}`)

**And** Connection handshake이 다음을 포함한다:
  - Client emits: `join` event with `{ documentId, userId, userName }`
  - Server confirms: `joined` event with `{ roomId, currentUsers }`
  - Error handling: Connection failure → Retry with exponential backoff

**When** 다른 팀원이 같은 문서에 join하면
**Then** Presence indicator가 업데이트된다:
  - User list: Header에 현재 접속자 표시
  - Avatars: "John, Jane, Bob viewing now"
  - Cursor indicators: 각 user의 cursor position
  - Status badges: "Viewing" | "Editing" | "Idle"

**And** 각 user의 cursor가 표시된다:
  - Cursor color: Unique color per user (8 preset colors)
  - Cursor label: Name 표시 (hover시)
  - Cursor position: Real-time tracking (throttled: 100ms)
  - Smooth movement: CSS transition (0.1s ease)

**Given** 사용자가 typing을 시작할 때
**When** Keyboard input이 감지되면
**Then** Typing indicator가 전송된다:
  - Event: `typing:start` with `{ userId, position }`
  - Broadcast: Other users에게 표시
  - Visual: "Jane is typing..." badge
  - Timeout: 3초 후 자동 사라짐

**When** 사용자가 idle 상태가 되면
**Then** Presence status가 변경된다:
  - Idle timeout: 5분 no activity
  - Status: "Editing" → "Idle"
  - Visual: Avatar grays out
  - Re-activate: Any activity로 "Editing" 복귀

**Given** 사용자가 문서를 닫을 때
**When** 페이지를 leave하면
**Then** WebSocket 연결이 정리된다:
  - Event: `leave` with `{ userId, documentId }`
  - Room: Leave document room
  - Broadcast: Other users에게 "John left"
  - Presence: User list에서 제거

**And** Connection cleanup이 실행된다:
  - Socket disconnect: Graceful disconnect
  - Event listeners: Remove all listeners
  - Memory: Clear references

**When** WebSocket 연결이 실패하면
**Then** Fallback to Polling (Epic 7):
  - Auto-fallback: 30초 polling으로 전환
  - Notification: "실시간 협업 연결 실패 - 폴링 모드로 전환"
  - Retry: WebSocket 재연결 시도 (1분 간격)
  - Success 시: WebSocket으로 자동 복귀

---

### Story 8.2: 실시간 동시 편집 (OT/CRDT)

**As a** 팀원,
**I want** 다른 팀원과 동시에 같은 문서를 편집할 수 있길 원해서,
**So that** Conflict 없는 매끄러운 협업이 가능하다.

**Acceptance Criteria:**

**Given** 여러 팀원이 같은 문서를 편집할 때
**When** User A가 text를 입력하면
**Then** Operational Transformation (OT)이 적용된다:
  - Library: Y.js (v13.6.8) for CRDT
  - Document type: `Y.Text` for text content
  - Conflict resolution: Automatic merge
  - Consistency: Eventually consistent

**And** Changes가 실시간으로 broadcast된다:
  - Event: `document:update` with `{ updates, vectorClock }`
  - Broadcast: Room의 모든 users에게
  - Apply: Local Y.js document에 apply
  - UI: React re-render

**When** User A & B가 동시에 같은 paragraph를 편집하면
**Then** CRDT algorithm이 merges를 처리한다:
  - No data loss: 모든 changes preserved
  - Order: Timestamp-based ordering
  - Merge: Characters interleave correctly
  - Visual: Both users see same final text

**And** Conflict indicators가 표시되지 않는다:
  - Seamless merge: User-transparent
  - No "conflict" alerts
  - Smooth UX: Natural editing experience

**Given** User A가 text를 삭제할 때
**When** User B가 같은 text를 편집 중이면
**Then** Deletion이 모든 users에게 동기화된다:
  - OT transform: Deletion과 insert가 merge됨
  - Result: Consistent state across all clients
  - Rollback: 방지 (no undo for other users' changes)

**When** User가 undo를 실행할 때 (Ctrl/Cmd + Z)
**Then** Local undo만 수행된다:
  - Undo scope: Own changes only
  - Others' changes: Preserved
  - Stack: Per-user undo stack

**Given** Network partition이 발생할 때
**When** 일부 users가 offline이 되면
**Then** CRDT가 offline editing을 지원한다:
  - Local edits: Continue in Y.js document
  - Queue: Changes queued locally
  - Reconnect: Auto-sync on reconnect
  - Merge: Automatic merge with server state

**And** Merge conflict이 자동으로 해결된다:
  - Last-write-wins: Not used (CRDT handles)
  - Divergence: Temporary, then converges
  - User awareness: "Syncing changes..." indicator

**When** Document가 큰 경우 (>100KB)
**Then** Performance가 최적화된다:
  - Lazy loading: Load visible sections only
  - Incremental updates: Send only changed ranges
  - Compression: Binary protocol (MessagePack)
  - Target: 100ms sync latency

---

### Story 8.3: 실시간 댓글 및 Discussion

**As a** 팀원,
**I want** 댓글과 discussion을 실시간으로 볼 수 있길 원해서,
**So that** 즉각적인 피드백과 커뮤니케이션이 가능하다.

**Acceptance Criteria:**

**Given** 팀원이 댓글을 달 때
**When** Comment가 제출되면
**Then** WebSocket을 통해 실시간으로 broadcast된다:
  - Event: `comment:new` with `{ commentId, documentId, text, userId, timestamp }`
  - Broadcast: Room의 모든 users
  - UI: Comment thread sidebar에 즉시 표시
  - Notification: @mention된 users에게

**And** @mention이 자동완성된다:
  - Trigger: "@" 입력
  - Dropdown: Team members 목록
  - Filter: Name/email로 검색
  - Select: Member 선택 → "@Jane Doe" 삽입

**When** @mentioned user가 문서를 보고 있으면
**Then** Real-time notification이 표시된다:
  - Toast: "Jane Doe mentioned you in Project Proposal"
  - Sound: Subtle notification sound (optional)
  - Badge: Comment thread indicator 증가
  - Navigate: Click to scroll to comment

**Given** 팀원이 comment를 resolve할 때
**When** "해결됨"을 체크하면
**Then** Status가 모든 users에게 sync된다:
  - Event: `comment:resolve` with `{ commentId, resolved, resolvedBy }`
  - UI: Thread grays out everywhere
  - Checkmark: ✓ badge 표시
  - Reopen: Any user가 가능

**When** 팀원이 comment에 reply하면
**Then** Reply가 실시간으로 추가된다:
  - Event: `comment:reply` with `{ parentId, replyId, text, userId }`
  - UI: Thread에 즉시 표시
  - Unread: Bold text for unread replies
  - Mark read: Click when read

**Given** User가 comment thread를 collapse할 때
**When** "Collapse" 버튼을 클릭하면
**Then** Thread가 접힌다:
  - UI: Only top-level comment visible
  - Badge: "3 replies" 표시
  - Expand: Click to expand
  - State: Local preference (localStorage)

**When** User가 comment를 edit할 때
**Then** Edit이 실시간으로 sync된다:
  - Permission: Own comments only (admin can edit all)
  - Edit window: 5 minutes (after that, delete + re-comment)
  - Event: `comment:edit` with `{ commentId, newText, editedAt }`
  - History: "Edited 2 minutes ago" badge

---

### Story 8.4: 버전 히스토리 및 복원

**As a** 팀원,
**I want** 문서의 모든 버전을 보고 이전 버전으로 복원할 수 있길 원해서,
**So that** 실수를 되돌리거나 변경 이력을 추적할 수 있다.

**Acceptance Criteria:**

**Given** 팀원이 문서를 편집할 때
**When** Changes가 save될 때마다
**Then** Version snapshot이 생성된다:
  - Trigger: Manual save + Auto-save (5분 간격)
  - Storage: `document_versions` table
  - Content: Full document state (JSON)
  - Metadata: `{ versionNumber, savedBy, savedAt, changeSummary }`

**And** Version retention policy이 적용된다:
  - Max versions: 100 versions per document
  - Cleanup: Old versions auto-deleted (FIFO)
  - Important versions: "Star"로 보존 가능
  - Archive: 1년 이상 된 versions를 cold storage

**When** 사용자가 "버전 히스토리"를 열면
**Then** Version timeline이 표시된다:
  - Visual: Vertical timeline
  - Each version: Avatar + Name + Timestamp + Summary
  - Diff indicator: "12 changes from previous"
  - Starred: ⭐ 표시
  - Actions: "Compare" | "Restore" | "Star"

**And** Version diff가 표시된다:
  - Side-by-side: Before vs After
  - Highlight: Changed text (red/green)
  - Sections: Collapsible sections
  - Character-level: Precise diff

**Given** 사용자가 버전을 복원할 때
**When** "Restore" 버튼을 클릭하면
**Then** Confirmation modal이 표시된다:
  - "Version #12 (Jan 5, 2024)로 복원하시겠습니까?"
  - "현재 변경 사항이 덮어씌워집니다."
  - "복원" | "취소" 버튼

**And** 복원 시 다음이 발생한다:
  - Document content: Restored from version
  - New version: Created as #13 "Restored from #12"
  - Notification: "Version #12로 복원되었습니다"
  - Undo: 가능 (Ctrl/Cmd + Z)

**Given** Admin이 version을 star할 때
**When** ⭐ star를 클릭하면
**Then** Version이 중요로 표시된다:
  - Star: ⭐ icon 표시
  - Preservation: Auto-cleanup에서 제외
  - Label: User가 label 추가 가능 ("Milestone version")
  - Filter: "Starred only" filter

**When** 사용자가 version을 비교할 때
**Then** Advanced diff viewer가 표시된다:
  - Modes: "Side-by-side" | "Inline" | "Unified"
  - Navigation: "Next change" | "Previous change"
  - Statistics: "3 sections added, 2 removed, 1,250 chars changed"
  - Export: "Export diff as PDF"

---

### Story 8.5: Conflict Resolution 및 Merge

**As a** 팀원,
**I want** 실시간 충돌을 명확하게 보고 해결할 수 있길 원해서,
**So that** 데이터 손실 없이 동시 작업이 가능하다.

**Acceptance Criteria:**

**Note**: Epic 8은 CRDT (Y.js)를 사용하므로 automatic conflict resolution이 기본 동작입니다. 이 Story는 manual conflict resolution이 필요한 edge cases를 다룹니다.

**Given** CRDT가 자동 merge를 할 수 없는 rare case에서
**When** Conflicting changes가 감지되면
**Then** Conflict resolution modal이 표시된다:
  - Scenario: Same sentence deleted by A, edited by B
  - Modal: "Conflict detected - choose resolution"
  - Options: "Keep A's version" | "Keep B's version" | "Merge both"
  - Preview: 각 option의 결과 미리보기

**And** Conflict가 UI에서 highlight된다:
  - Visual: Red dashed underline
  - Tooltip: "Conflicting change - click to resolve"
  - Count: "3 conflicts need resolution"
  - Navigation: "Next conflict" button

**When** 사용자가 resolution을 선택하면
**Then** 선택이 모든 users에게 sync된다:
  - Event: `conflict:resolve` with `{ conflictId, resolution, resolvedBy }`
  - Apply: 모든 clients에 동일하게 적용
  - UI: Highlight 제거
  - Update: Version history에 기록

**Given** User가 offline에서 다시 온라인으로 돌아올 때
**When** Divergent changes가 감지되면
**Then** Auto-merge가 시도된다:
  - CRDT merge: Automatic if non-overlapping
  - Success: 95%+ cases
  - Manual: Only if semantic conflicts (e.g., contradictory decisions)

**And** Merge conflict이 UI에 표시된다:
  - Banner: "Your changes and John's changes need merge"
  - Diff: Side-by-side comparison
  - Actions: "Accept mine" | "Accept theirs" | "Manual merge"
  - Manual editor: Split-pane editor for custom merge

**When** 사용자가 manual merge를 선택하면
**Then** Advanced merge editor가 열린다:
  - Left pane: My version
  - Right pane: Their version
  - Center pane: Merged result
  - Copy: Click to copy from left/right to center
  - Save: "Complete merge" button

**Given** Conflict가 해결된 후
**When** Resolution이 저장되면
**Then** 다음이 기록된다:
  - Version history: "Merge conflict resolved by John"
  - Conflict ID: Unique ID for traceability
  - Resolution type: "Auto-merged" | "Manual - A's version" | "Manual - Custom"
  - Participants: "John, Jane involved"

---

### Story 8.6: 실시간 Collaborative Cursors 및 Selection

**As a** 팀원,
**I want** 다른 팀원의 cursor와 text selection을 실시간으로 보길 원해서,
**So that** 협업이 더 직관적이고 매끄럽다.

**Acceptance Criteria:**

**Given** 여러 팀원이 같은 문서를 볼 때
**When** User가 text를 선택하면
**Then** Selection이 실시간으로 broadcast된다:
  - Event: `cursor:select` with `{ userId, start, end, color }`
  - Visual: 다른 users에게 selection 표시
  - Color: User's unique color (semi-transparent background)
  - Label: User's name (selection 옆에)

**And** Selection이 multi-line을 지원한다:
  - Range: Character-based (start, end indices)
  - Visual: Continuous highlight across lines
  - Performance: Throttled (100ms) to reduce bandwidth

**When** User가 text를 drag하여 선택할 때
**Then** Selection이 real-time으로 업데이트된다:
  - Drag: Live update (50ms throttling)
  - Smooth: 60fps animation
  - Cleanup: Selection 해제 시 broadcast

**Given** User가 cursor를 이동할 때
**When** Mouse click 또는 arrow key로 이동하면
**Then** Cursor position이 broadcast된다:
  - Event: `cursor:move` with `{ userId, position }`
  - Visual: Other users에게 cursor 표시
  - Cursor: Colored pointer with name label
  - Hide: 3초 idle 후 자동 숨김

**And** Cursor label이 다음을 표시한다:
  - Name: "Jane Doe"
  - Avatar: Small avatar (16x16px)
  - Color: User's unique color
  - Position: Cursor 위에 표시 (offset: 20px)

**When** User가 다른 user의 cursor를 hover하면
**Then** Extended info가 표시된다:
  - Tooltip: Name + Email + "Viewing this document"
  - Click: User profile modal로 이동
  - Action: "Send message" option

**Given** User가 mobile 화면일 때
**When** Touch로 text를 선택하면
**Then** Touch selection이 지원된다:
  - Long press: Start selection
  - Drag handles: Resize selection
  - Broadcast: Same as desktop
  - Visual: Touch-optimized handles

**When** Selection이 겹칠 때
**Then** Multiple selections이 다른 colors로 표시된다:
  - User A: Blue highlight
  - User B: Pink highlight
  - Overlap: Transparency로 겹치는 부분 표시
  - Clear: 각 selection 구분 가능

**Given** User가 "Follow user"를 클릭할 때
**When** 다른 user의 avatar를 click하면
**Then** Auto-follow mode가 활성화된다:
  - Action: "Follow Jane" button
  - Behavior: Jane의 cursor 위치로 자동 scroll
  - Indicator: "Following Jane" badge
  - Stop: "Stop following" 버튼 또는 ESC

**And** View가 자동으로 이동한다:
  - Smooth scroll: 300ms ease-in-out
  - Center: Jane's cursor가 화면 중앙에
  - Zoom: Auto-adjust if needed
  - Visual: Jane's cursor pulse animation

---


## Epic 9: 대시보드 및 관리자 기능

**Phase**: 2 (중요) / 3 (Post-MVP) mixed
**Priority**: High (analytics), Medium (admin)
**User Value**: 진행 상황 시각화, 시스템 관리, 성과 추적
**FRs Covered**: FR60, FR61, FR68, FR69, FR70, FR71, FR72

### Story 9.1: 개인 진행 상황 대시보드

**As a** 사용자,
**I want** 내 문서 생성 진행 상황과 성과를 한눈에 볼 수 있길 원해서,
**So that** 목표 달성 여부를 파악하고 동기를 부여받을 수 있다.

**Acceptance Criteria:**

**Given** 인증된 사용자가 dashboard에 접속할 때
**When** Dashboard가 로드되면
**Then** Progress overview가 표시된다:
  - Total documents: Count
  - Documents this week: "+12" (trend indicator)
  - Completion rate: "85%" (goal vs actual)
  - Time saved: "Estimated 3.5 hours saved"

**And** Visual progress charts이 표시된다:
  - Line chart: Documents created (last 30 days)
  - Pie chart: Document types (사업계획서, IR, 제안서)
  - Bar chart: Weekly productivity
  - Library: Recharts (v2.10.0) 또는 Chart.js (v4.4.0)

**When** 사용자가 "Recent Documents"를 view하면
**Then** 최근 문서 목록이 표시된다:
  - Each card: Title, Type, Created date, Status badge
  - Thumbnail: Document preview image (first page)
  - Actions: "열기" | "복제" | "삭제"
  - Limit: Last 10 documents

**And** 문서가 다음 status로 표시된다:
  - Draft: Gray badge
  - In Progress: Blue badge
  - Completed: Green badge
  - Archived: Gray badge

**Given** 사용자가 goal을 설정했을 때
**When** Goals section이 표시되면
**Then** Weekly/Monthly goals이 표시된다:
  - Goal: "Create 10 documents this week"
  - Progress: "7/10 completed (70%)"
  - Progress bar: Visual bar (70% filled)
  - Time remaining: "3 days left"

**And** Goal achievement이 축하될 때:
  - Trigger: Goal 달성 시
  - Animation: Confetti 🎉
  - Modal: "축하합니다! 이번 주 목표를 달성했습니다!"
  - Stats: "이전보다 20% 향상되었습니다"

**When** 사용자가 "Set Goal"을 클릭하면
**Then** Goal 설정 modal이 열린다:
  - Goal type: "Weekly" | "Monthly" | "Custom"
  - Target: Number input (documents)
  - Period: Date range picker
  - "Save goal" 버튼

**Given** 사용자가 Quick Actions을 사용할 때
**When** Dashboard에서 quick actions이 제공되면
**Then** 다음 actions이 표시된다:
  - "새 문서 만들기" → Document creation wizard
  - "클라우드 연동하기" → Google Drive OAuth
  - "데모 모드 시작" → Demo mode
  - "도움말 보기" → Help center

**And** Quick action cards이 다음을 포함한다:
  - Icon: 각 action에 맞는 icon
  - Description: Short description (1 line)
  - Arrow: → (hover시 확장)
  - Hover effect: Scale + shadow

---

### Story 9.2: 문서 분석 및 성과 리포트

**As a** 사용자,
**I want** 내 문서 생성 활동을 분석한 리포트를 볼 수 있길 원해서,
**So that** 패턴을 이해하고 개선할 수 있다.

**Acceptance Criteria:**

**Given** 사용자가 dashboard에서 "Analytics"를 클릭할 때
**When** Analytics page가 로드되면
**Then** Detailed analytics가 표시된다:
  - Period selector: "Last 7 days" | "Last 30 days" | "Last 3 months" | "Custom"
  - Key metrics grid: 4 key metrics cards
  - Charts: Multiple visualization charts
  - Export: "Export as PDF" 버튼

**And** Key metrics이 다음을 포함한다:
  - Total documents created: Count
  - Total word count: Sum of all documents
  - Avg. documents per week: Average
  - Time saved estimate: "Calculated based on avg. manual writing time"

**When** 사용자가 "Document Types"을 view하면
**Then** Document type breakdown이 표시된다:
  - Donut chart: Document types distribution
  - Table: Type, Count, Percentage, Avg. word count
  - Examples:
    - 사업계획서: 15 (45%) - 2,500 words avg
    - IR 자료: 10 (30%) - 3,200 words avg
    - 제안서: 8 (25%) - 1,800 words avg

**Given** 사용자가 "Productivity Trend"를 view할 때
**When** Trend chart이 표시되면
**Then** Productivity over time이 시각화된다:
  - Line chart: Daily/Weekly document count
  - Trend line: Moving average (7 days)
  - Annotations: Key events (e.g., "Started using AI", "Team collaboration")
  - Comparison: Previous period comparison (+/- %)

**When** 사용자가 "Peak Hours"를 view하면
**Then** Most active hours이 표시된다:
  - Heatmap: Hour of day vs Day of week
  - Color intensity: Activity level
  - Peak: "Most active: Tuesday 10AM - 12PM"
  - Insight: "You're most productive on weekday mornings"

**Given** 사용자가 "AI Usage"를 view할 때
**When** AI usage metrics이 표시되면
**Then** AI-generated content statistics이 표시된다:
  - Total AI generations: Count
  - AI-generated word count: Total words
  - Avg. AI confidence score: "92% high quality"
  - Time saved: "Estimated 8 hours vs manual writing"

**And** Popular AI templates이 표시된다:
  - Top templates: 사업계획서, IR, 제안서
  - Usage count: Each template usage
  - Success rate: "95% satisfied with AI output"

**When** 사용자가 "Export Report"를 클릭하면
**Then** PDF report가 생성된다:
  - Format: Professional PDF report
  - Sections: All charts + Key insights + Recommendations
  - Branding: bm-builder logo + footer
  - Filename: `analytics-report-YYYY-MM-DD.pdf`

**And** Email로 전송 가능하다:
  - "Send to email" checkbox
  - Email input: Default to user's email
  - Send: Button click → Email with PDF attachment

---

### Story 9.3: 팀 관리자 대시보드

**As a** 팀 Admin,
**I want** 팀 전체의 활동과 성과를 모니터링할 수 있길 원해서,
**So that** 팀의 생산성과 건강 상태를 파악할 수 있다.

**Acceptance Criteria:**

**Given** 팀 Admin이 dashboard에 접속할 때
**When** Admin dashboard가 로드되면
**Then** Team overview가 표시된다:
  - Team name: "Acme Startup"
  - Total members: Count (active + pending)
  - Total documents: Count
  - Activity level: "High" | "Medium" | "Low" (with indicator)

**And** Team health score가 표시된다:
  - Score: 0-100
  - Visual: Circular progress (color-coded)
  - Status: "Excellent" (90-100) | "Good" (70-89) | "Fair" (50-69) | "Needs attention" (<50)
  - Factors breakdown: Activity, Engagement, Collaboration

**When** Admin이 "Member Activity"를 view하면
**Then** Member ranking이 표시된다:
  - Table: Rank, Avatar, Name, Documents, Comments, Last active
  - Sorting: Most documents, Most comments, Recently active
  - Filters: "Active members only" | "Inactive last 30 days"
  - Actions: "View profile" | "Send reminder" (for inactive)

**And** Activity heatmap이 각 member에 표시된다:
  - Visual: 7x30 grid (days x weeks)
  - Color intensity: Activity level (gray → green)
  - Hover: Date + Activity count tooltip
  - Empty cells: No activity

**Given** Admin이 "Team Documents"를 view할 때
**When** Team document analytics이 표시되면
**Then** Team-wide document stats이 표시된다:
  - Total created: Count
  - By type: Breakdown by document type
  - By status: Draft (40%), In Progress (35%), Completed (25%)
  - Most viewed: Top 5 documents by views

**And** Document collaboration metrics이 표시된다:
  - Avg. collaborators per document: "2.3 people"
  - Most collaborative: Documents with most contributors
  - Comments per document: Average
  - Co-authoring: "15 documents co-authored by 2+ people"

**When** Admin이 "Storage Usage"를 view하면
**Then** Storage analytics가 표시된다:
  - Used: "2.4 GB" / Total: "10 GB"
  - Progress bar: 24% filled
  - By member: Top 5 storage consumers
  - By file type: Documents (60%), Images (30%), Other (10%)

**And** Storage trends이 표시된다:
  - Line chart: Storage growth (last 6 months)
  - Projection: "Current trend → Full in 8 months"
  - Recommendation: "Consider upgrading plan or cleaning up old documents"

---

### Story 9.4: 팀원 관리 및 권한 제어

**As a** 팀 Admin,
**I want** 팀원을 관리하고 권한을 제어할 수 있길 원해서,
**So that** 팀의 보안과 접근을 유지할 수 있다.

**Acceptance Criteria:**

**Given** 팀 Admin이 "Team Members" 페이지에 있을 때
**When** Members list가 표시되면
**Then** 각 member의 상세 정보가 표시된다:
  - Avatar (32x32px)
  - Full name + Email
  - Role: Admin | Editor | Viewer (badge)
  - Status: Active | Pending (last login date)
  - Actions: ⋮ (more options menu)

**And** 다음 actions이 제공된다:
  - "Change role": Role selection modal
  - "Remove from team": Confirmation modal
  - "View activity": Individual activity page
  - "Send reminder": "Rejoin team" email (for inactive)

**When** Admin이 "Change role"을 클릭하면
**Then** Role 변경 modal이 열린다:
  - Member name: "John Doe"
  - Current role: "Editor"
  - New role: Radio buttons (Admin/Editor/Viewer)
  - Role description: 각 role의 권한 설명
  - "Save" | "Cancel" 버튼

**And** Role 변경 시 다음이 발생한다:
  - Database: `team_members` table에서 role 업데이트
  - Notification: Member에게 email ("Your role was changed to Editor")
  - Effective: 즉시 (next login부터 반영)
  - Audit log: "Admin changed John's role from Viewer to Editor"

**Given** Admin이 팀원을 초대할 때
**When** "Invite members" 버튼을 클릭하면
**Then** Bulk invite modal이 열린다:
  - Email inputs: Textarea for multiple emails (comma/newline separated)
  - Default role: "Editor" (selectable)
  - Personal message: Optional textarea
  - Validation: Email format validation
  - "Send invites" | "Cancel" 버튼

**And** Invites가 전송된다:
  - Rate limit: Max 50 invites per day
  - Expiration: 7 days
  - Pending invites: "View pending invites" 링크
  - Resend: "Resend" button for expired invites

**When** Admin이 팀원을 제거할 때
**Then** Confirmation modal이 표시된다:
  - "Remove John Doe from team?"
  - "They will lose access to all team documents."
  - "Keep their documents: ☑ Transfer to team (Admin becomes owner)"
  - "Remove" | "Cancel" 버튼

**And** 제거가 완료되면:
  - Access revoked: 즉시
  - Documents: Transfer to Admin (if checked) or delete
  - Notification: Removed member에게 email
  - Audit log: "Admin removed John Doe from team"

**Given** Admin이 pending invites를 관리할 때
**When** "Pending invites"를 view하면
**Then** Pending invites 목록이 표시된다:
  - Email: Invitee email
  - Role: Assigned role
  - Sent: "2 days ago"
  - Status: "Pending" | "Expired"
  - Actions: "Resend" | "Revoke"

**When** "Resend"를 클릭하면
**Then** Invite email이 재전송된다:
  - New expiration: 7 days from resend
  - Notification: "Invitation resent to john@example.com"
  - Limit: Max 3 resends per invite

---

### Story 9.5: 시스템 설정 및 환경설정

**As a** 팀 Admin,
**I want** 팀과 시스템 설정을 관리할 수 있길 원해서,
**So that** 조직 요구사항에 맞게 플랫폼을 커스터마이즈할 수 있다.

**Acceptance Criteria:**

**Given** 팀 Admin이 "Settings" 페이지에 있을 때
**When** Settings navigation이 표시되면
**Then** 다음 sections이 제공된다:
  - General: Team name, description, logo
  - Members: Team member management
  - Billing: Subscription plan, payment method
  - Security: 2FA, SSO, session timeout
  - Notifications: Email preferences
  - Integrations: Google Drive, Notion, Slack

**When** Admin이 "General"을 클릭하면
**Then** General settings이 표시된다:
  - Team name: Input field (required)
  - Team description: Textarea (optional)
  - Team logo: File upload (max 2MB, PNG/JPG)
  - Default role: New invites의 기본 role
  - "Save changes" 버튼

**And** Logo upload가 다음을 지원한다:
  - Drag & drop: 파일 drag하면 upload
  - Preview: 100x100px circular preview
  - Crop: Built-in croper (square aspect ratio)
  - Delete: "Remove logo" button

**Given** Admin이 "Security"를 클릭할 때
**When** Security settings이 표시되면
**Then** 다음 options이 제공된다:
  - Two-factor authentication: ☑ Require 2FA for all members
  - Session timeout: "30 minutes" | "1 hour" | "4 hours" | "1 day"
  - IP whitelist: Textarea for allowed IP ranges (optional)
  - Password policy: Minimum length, special chars required

**And** SSO 설정이 표시된다:
  - SSO provider: "Google Workspace" | "Okta" | "Azure AD" | "Custom SAML"
  - Enable SSO: Toggle
  - SSO config: Provider-specific settings (SSO URL, certificate)
  - Test connection: "Test SSO" button

**When** Admin이 security 설정을 변경하면
**Then** 다음이 적용된다:
  - Immediate: Session timeout 변경 (기존 sessions에도 적용)
  - Next login: 2FA requirement
  - Audit log: "Admin changed security settings"
  - Notification: Team members에게 email ("Security settings updated")

**Given** Admin이 "Integrations"를 클릭할 때
**When** Integration settings이 표시되면
**Then** 다음 integrations이 표시된다:
  - Google Drive: "Connected" | "Connect" button
  - Notion: "Not connected" | "Connect" button
  - Slack: "Connected" (#general channel)
  - Custom: "Add custom integration" button

**And** 각 integration이 다음을 표시한다:
  - Status: Connected | Not connected | Error
  - Last synced: "2 hours ago"
  - Actions: "Configure" | "Disconnect" | "Sync now"
  - Description: Integration benefits 설명

**When** Admin이 Slack을 connect하면
**Then** Slack OAuth flow가 시작된다:
  - Redirect: Slack OAuth authorization page
  - Scope: `chat:write`, `channels:read`
  - Callback: Redirect back to bm-builder
  - Channel selector: Select default notification channel

**And** Slack notifications이 전송된다:
  - Triggers: Document created, Team member joined, Comments
  - Channel: Selected Slack channel
  - Format: Rich formatted message (attachments)
  - Frequency: Real-time or daily digest

---

### Story 9.6: 결제 및 플랜 관리

**As a** 팀 Admin,
**I want** 팀의 subscription plan과 결제를 관리할 수 있길 원해서,
**So that** 비용을 제어하고 필요한 기능을 이용할 수 있다.

**Acceptance Criteria:**

**Given** 팀 Admin이 "Billing" 페이지에 있을 때
**When** Billing overview가 표시되면
**Then** 다음 정보가 표시된다:
  - Current plan: "Pro Plan - $29/month"
  - Next billing date: "January 15, 2024"
  - Payment method: "Visa ending in 4242"
  - Usage: "2.4 GB / 10 GB storage, 8 / 10 members"

**And** Plan comparison이 표시된다:
  - Free: "0 documents, 1 member, 100 MB storage"
  - Pro: "Unlimited docs, 10 members, 10 GB storage - $29/mo"
  - Enterprise: "Unlimited everything, custom limits - Contact sales"
  - Highlight: Current plan highlighted

**When** Admin이 "Upgrade plan"을 클릭하면
**Then** Plan selection modal이 열린다:
  - Plan cards: Free, Pro, Enterprise
  - Features: 각 plan의 features listed
  - Price: Monthly/Annual toggle (Annual: 20% discount)
  - "Select plan" button (각 plan에)

**And** Upgrade flow가 진행된다:
  - Confirmation: "Upgrade to Pro Plan?"
  - Proration: "You'll be charged $15.43 today (prorated)"
  - Payment: Confirm payment method
  - Success: "Upgrade successful! 🎉"

**Given** Admin이 payment method를 업데이트할 때
**When** "Update payment method"를 클릭하면
**Then** Payment method modal이 열린다:
  - Card number: Input (**** **** **** 4242)
  - Expiry: MM/YY input
  - CVC: 3-digit input
  - Name on card: Input
  - "Save" 버튼

**And** Stripe를 통해 결제가 처리된다:
  - PCI compliance: Stripe Elements for secure input
  - Validation: Real-time card validation
  - Error: Clear error messages ("Card declined", "Invalid CVC")
  - Success: "Payment method updated"

**When** Admin이 invoice를 다운로드하면
**Then** Invoice PDF가 생성된다:
  - Format: Professional invoice PDF
  - Content: Invoice #, Date, Amount, Line items, Tax
  - Branding: bm-builder logo + company info
  - Download: Automatic download 시작

**And** Invoice history가 표시된다:
  - Table: Date, Invoice #, Amount, Status, Download
  - Status: "Paid" | "Pending" | "Failed"
  - Actions: "Download PDF" | "Resend email"
  - Filter: By date range

**Given** Admin이 plan을 취소할 때
**When** "Cancel subscription"을 클릭하면
**Then** Cancellation flow가 시작된다:
  - Warning: "Are you sure? You'll lose Pro features at period end."
  - Retention: "Your data will be retained for 30 days"
  - Reactivation: "You can reactivate anytime"
  - Feedback: Optional survey for cancellation reason

**And** 취소가 완료되면:
  - Status: "Plan will downgrade to Free on Jan 15, 2024"
  - Access: Pro features를 period end까지 계속 이용
  - Notification: Email confirmation
  - Data export: "Export your data" option 제공

---

### Story 9.7: 시스템 로그 및 감사 추적

**As a** 팀 Admin,
**I want** 모든 시스템 활동과 변경 사항을 추적할 수 있길 원해서,
**So that** 보안 문제를 조사하고 규정 준수를 유지할 수 있다.

**Acceptance Criteria:**

**Given** 팀 Admin이 "Audit Log" 페이지에 있을 때
**When** Audit log가 표시되면
**Then** 모든 system events이 기록된다:
  - Timestamp: ISO 8601 format
  - Actor: "John Doe (john@example.com)"
  - Action: "Created document", "Changed role", "Deleted team member"
  - Target: Affected resource (document, user, team)
  - IP address: Actor's IP (optional, privacy consideration)
  - User agent: Browser/device info

**And** Log가 다음 events을 포함한다:
  - Authentication: Login, logout, failed attempts, password reset
  - Documents: Create, edit, delete, share, download
  - Team: Invite, join, leave, role change
  - Settings: Security, billing, integration changes
  - Admin: All admin actions logged

**When** Admin이 audit log를 filter하면
**Then** 다음 filter options이 제공된다:
  - Date range: "Last 24 hours" | "Last 7 days" | "Last 30 days" | "Custom"
  - Actor: Specific user 선택
  - Action type: "All" | "Authentication" | "Documents" | "Team" | "Admin"
  - Severity: "All" | "Critical" | "Warning" | "Info"

**And** Filter results이 실시간으로 업데이트된다:
  - Loading: Spinner during filter
  - Count: "156 events found"
  - Export: "Export filtered logs" (CSV/JSON)
  - Clear: "Clear filters" button

**Given** Critical event가 발생했을 때
**When** Security event가 감지되면
**Then** Alert가 Admin에게 전송된다:
  - Critical: Multiple failed logins, suspicious activity, data export
  - Email: Immediate email to all Admins
  - Dashboard: Red badge indicator
  - In-app: "⚠️ Critical security events require attention"

**And** Critical events이 highlight된다:
  - Visual: Red background
  - Icon: ⚠️ warning icon
  - Priority: Top of audit log
  - Action required: "Review now" button

**When** Admin이 event를 클릭하면
**Then** Event detail modal이 열린다:
  - Full event data: JSON format
  - Related events: Links to related events
  - Actor profile: Link to user profile
  - Actions: "Mark as reviewed" | "Add note"

**And** Admin이 note를 추가할 수 있다:
  - Note: Textarea for investigation notes
  - Visibility: Only Admins can see notes
  - Timestamp: Note creation time
  - Edit: Notes can be edited/deleted

**Given** Audit log가 커질 때
**When** Log retention policy가 적용되면
**Then** 다음 rules이 적용된다:
  - Retention: 90 days (Free plan), 1 year (Pro), 3 years (Enterprise)
  - Archive: Old logs를 cold storage로 이동
  - Export: Logs archive를 export 가능
  - Delete: Automatic deletion after retention period

**When** Admin이 logs를 export하면
**Then** Export file이 생성된다:
  - Format: CSV 또는 JSON
  - Date range: Filtered date range
  - Compression: GZIP if large (>10MB)
  - Download: Email에 download link 또는 즉시 download

---

### Story 9.8: 관리자 시스템 건전성 모니터링

**As a** 시스템 Admin (Super Admin),
**I want** 시스템 건전성과 성능을 모니터링할 수 있길 원해서,
**So that** 문제를 조기에 발견하고 서비스 가용성을 유지할 수 있다.

**Acceptance Criteria:**

**Note**: 이 Story는 bm-builder platform 자체의 시스템 Admin을 위한 기능입니다.

**Given** 시스템 Admin이 "System Health" 페이지에 있을 때
**When** System metrics이 표시되면
**Then** 다음 health metrics이 표시된다:
  - Status: "All systems operational" 🟢 | "Degraded performance" 🟡 | "Outage" 🔴
  - Uptime: "99.95% (last 30 days)"
  - Response time: "142ms avg (p95: 320ms)"
  - Error rate: "0.02%"

**And** Service status가 표시된다:
  - Web app: 🟢 Operational
  - API: 🟢 Operational
  - Database: 🟢 Operational
  - Redis: 🟢 Operational
  - AI Service (Claude API): 🟡 Degraded (slower responses)
  - Email service: 🟢 Operational

**When** 시스템 Admin이 resource usage를 view하면
**Then** Resource metrics이 표시된다:
  - CPU: "45% avg (peak: 78%)"
  - Memory: "6.2 GB / 16 GB (39%)"
  - Disk: "124 GB / 500 GB (25%)"
  - Network: "120 MB/s in, 85 MB/s out"

**And** Real-time charts이 표시된다:
  - Line chart: CPU/Memory/Disk over time (last 24 hours)
  - Refresh: Auto-refresh every 30 seconds
  - Interactive: Zoom, pan on chart
  - Threshold: Warning/critical lines

**Given** Performance issue가 감지되면
**When** Slow endpoint가 identified되면
**Then** Performance alert가 표시된다:
  - Endpoint: "POST /api/documents/generate"
  - Avg response time: "2.3s (SLA: <500ms)"
  - Status: 🔴 Critical
  - Impact: "450 users affected"

**And** Alert가 다음 정보를 포함한다:
  - Severity: Critical | Warning | Info
  - Duration: "Started 15 minutes ago"
  - Trend: "Degrading" | "Stable" | "Improving"
  - Actions: "View logs" | "Restart service" | "Escalate"

**When** 시스템 Admin이 "View logs"를 클릭하면
**Then** Structured log viewer가 열린다:
  - Real-time: Live log streaming
  - Filter: By service, level, error type
  - Search: Full-text search across logs
  - Highlight: Error logs in red

**And** Log aggregation이 다음을 포함한다:
  - Services: Web, API, Worker, Cron
  - Levels: Error, Warning, Info, Debug
  - Source: Server/host identifier
  - Correlation: Request ID for distributed tracing

**Given** Database performance를 모니터링할 때
**When** DB metrics이 표시되면
**Then** 다음 metrics이 포함된다:
  - Connections: "245 / 500 (49%)"
  - Query performance: "45ms avg (p95: 120ms)"
  - Slow queries: "3 queries >1s in last hour"
  - Table sizes: Top 10 tables by size

**And** Slow queries이 상세히 표시된다:
  - Query: SQL query text
  - Duration: "1.2s"
  - Count: "Executed 156 times"
  - Recommendation: "Add index on documents.created_at"

**When** 시스템 Admin이 backup status를 view하면
**Then** Backup health가 표시된다:
  - Last backup: "2 hours ago (Jan 9, 2024 14:30)"
  - Status: 🟢 Success
  - Size: "2.4 GB"
  - Retention: "30 daily backups, 12 monthly backups"

**And** Backup restoration이 테스트된다:
  - Last restoration test: "7 days ago"
  - Result: ✅ Success (1.2 GB restored in 8m 32s)
  - Next test: "Scheduled in 23 days"

**Given** User가 error를 report할 때
**When** Error reports이 수집되면
**Then** Error analytics이 표시된다:
  - Total errors: "156 errors (last 24 hours)"
  - Top errors: Ranked by frequency
  - Error rate: "0.02% of requests"
  - Trend: "↓ 15% vs previous period"

**And** Error detail이 제공된다:
  - Error type: "DocumentGenerationTimeout"
  - Stack trace: Full stack trace
  - User affected: "45 users encountered this error"
  - First seen: "3 hours ago"
  - Last seen: "2 minutes ago"
  - Status: "Investigating" | "Fix deployed" | "Resolved"

**When** 시스템 Admin이 maintenance mode를 활성화하면
**Then** Maintenance scheduling이 가능하다:
  - Schedule: Date/time picker for maintenance window
  - Duration: "30 minutes" | "1 hour" | "2 hours"
  - Notification: "Notify users 1 hour before"
  - Message: Custom maintenance message

**And** Maintenance mode가 활성화되면:
  - Redirect: All users to maintenance page
  - Banner: "Scheduled maintenance - Back in 30 minutes"
  - API: Read-only mode (writes disabled)
  - Admin access: Admins can still access

---


---

## Summary

이 문서는 bm-builder 프로젝트를 위한 총 **9개 Epic**과 **47개 Story**를 정의합니다.

### Epic Breakdown by Phase

#### Phase 1: MVP Foundation (Epic 1-5)
- **Epic 1: 사용자 인증 및 온보딩** - 8 stories
- **Epic 2: 클라우드 연동 및 문서 임베딩** - 5 stories
- **Epic 3: AI 문서 생성** - 6 stories
- **Epic 4: 문서 관리** - 4 stories
- **Epic 5: 사용자 인터페이스 및 접근성** - 4 stories

**Total: 27 stories** - Core functionality for MVP launch

#### Phase 2: Important Features (Epic 7, 9)
- **Epic 7: 팀 협업** - 6 stories
- **Epic 9: 대시보드 및 관리자** - 8 stories

**Total: 14 stories** - Team collaboration and administration

#### Phase 3: Post-MVP Enhancements (Epic 6, 8)
- **Epic 6: Visual Workflow Management (Node UI)** - 5 stories
- **Epic 8: 실시간 협업 및 버전 관리** - 6 stories

**Total: 11 stories** - Advanced collaboration features

### FR Coverage Mapping

| Epic | FRs Covered | Count |
|------|-------------|-------|
| Epic 1 | FR1-5 | 5 |
| Epic 2 | FR17-21 | 5 |
| Epic 3 | FR11-16 | 6 |
| Epic 4 | FR28-31 | 4 |
| Epic 5 | FR32-35, FR49-59 | 13 |
| Epic 6 | FR6-10 | 5 |
| Epic 7 | FR22-27 | 6 |
| Epic 8 | FR62-67 | 6 |
| Epic 9 | FR60-61, FR68-72 | 8 |
| **Total** | **All 72 FRs** | **72** |

### Cross-Cutting Concerns

- **UI/접근성 (Epic 5)**: 모든 Epics에 적용되는 cross-cutting concern
- **Security (FR36-41)**: 모든 Epics에 보안 요구사항 포함
- **Performance (FR42-43)**: 전체 시스템 성능 target 포함

### Next Steps

1. **Sprint Planning**: Epic과 Stories를 Sprint에 할당
2. **Story Preparation**: 각 Story에 tech spec 작성
3. **Implementation**: 개발 시작 (Phase 1 → Phase 2 → Phase 3)

### Implementation Priority

**MVP (Phase 1)**: Epic 1 → Epic 2 → Epic 3 → Epic 4 → Epic 5 (순차적 개발 권장)

**Post-MVP (Phase 2)**: Epic 7 → Epic 9 (동시 개발 가능)

**Enhancement (Phase 3)**: Epic 6 → Epic 8 (Epic 7 완료 후 권장)

---

*This document was generated as part of the BMM Create Epics and Stories workflow*
*Date: 2026-01-09*
*Workflow completed: Steps 1, 2, 3*
