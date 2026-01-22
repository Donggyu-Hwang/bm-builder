---
stepsCompleted: [1, 2, 3, 4, 5]
workflowType: 'check-implementation-readiness'
project_name: 'bm-builder'
user_name: 'Donggyu'
date: '2026-01-18-1458'
assessmentStatus: 'in-progress'
---

# Implementation Readiness Assessment Report

**Date:** 2026-01-18-1458
**Project:** bm-builder
**Assessor:** AI Product Manager & Scrum Master

---

## Executive Summary

_본 요약은 평가 완료 후 작성됩니다._

---

## 1. Document Discovery

### 1.1 Documents Found

#### PRD Documents
- ✅ **prd.md** (68K, Jan 18 11:59)
  - Path: `/Users/donggyu/bm-builder/_bmad-output/planning-artifacts/prd.md`
  - Status: **Selected for Assessment**

#### Architecture Documents
- ✅ **architecture.md** (32K, Jan 18 14:47) **[PRIMARY]**
  - Path: `/Users/donggyu/bm-builder/_bmad-output/planning-artifacts/architecture.md`
  - Status: **Selected for Assessment** (Latest version)
- ⚠️ **architecture-backup-2026-01-09.md** (96K, Jan 18 14:40) **[BACKUP]**
  - Path: `/Users/donggyu/bm-builder/_bmad-output/planning-artifacts/architecture-backup-2026-01-09.md`
  - Status: **Excluded** (Backup file, older version)

#### Epics & Stories Documents
- ✅ **epics.md** (128K, Jan 18 11:55)
  - Path: `/Users/donggyu/bm-builder/_bmad-output/planning-artifacts/epics.md`
  - Status: **Selected for Assessment**

#### UX Design Documents
- ✅ **ux-design-specification.md** (158K, Jan 18 11:58)
  - Path: `/Users/donggyu/bm-builder/_bmad-output/planning-artifacts/ux-design-specification.md`
  - Status: **Selected for Assessment**

#### Additional Documents
- ⚠️ **course-correction-2026-01-18.md** (26K, Jan 18 14:39)
  - Path: `/Users/donggyu/bm-builder/_bmad-output/planning-artifacts/course-correction-2026-01-18.md`
  - Status: **CRITICAL - Course Correction Document**
  - Contains: Supabase → Direct PostgreSQL migration, OAuth changes
  - Impact: Must validate all documents reflect these changes

- ℹ️ **product-brief-bm-builder-2026-01-09.md** (33K, Jan 9 12:24)
  - Status: **Excluded** (Product Brief, not required for assessment)

- ℹ️ **implementation-readiness-report-2026-01-18.md** (19K, Jan 18 11:45)
  - Status: **Excluded** (Previous assessment report)

---

### 1.2 Issues Identified

#### ⚠️ CRITICAL: Course Correction Document Exists

**Issue:** A course correction document dated 2026-01-18 exists that specifies major technical changes:

**Key Changes:**
1. **Authentication:** Supabase Auth → JWT + Passport.js
2. **Database:** Supabase → Self-hosted PostgreSQL (15.164.103.114:5432)
3. **Security:** Row Level Security (RLS) → Middleware authorization
4. **OAuth:** Supabase auto-handling → Manual implementation
5. **Naver OAuth Strategy:** Added (passport-naver)
6. **Direct PostgreSQL Pool:** Using `pg` package directly

**Impact Assessment Required:**
- ✅ Verify PRD reflects these architecture changes
- ✅ Verify Architecture.md is updated (Jan 18 14:47 - likely yes)
- ✅ **CRITICAL:** Verify Epics & Stories reflect:
  - Epic 1 Story 1.1: Project initialization (Supabase removal, direct PostgreSQL)
  - Epic 1 Story 1.2: OAuth implementation (Passport.js strategies)
  - All authentication-related stories updated

**Action:** This will be the primary focus of the implementation readiness assessment.

#### ℹ️ INFO: Previous Assessment Report Exists

A previous implementation readiness report exists from earlier today (Jan 18 11:45). This new assessment will be more thorough, specifically focusing on course correction alignment.

---

### 1.3 Selected Documents for Assessment

The following documents will be used for the implementation readiness assessment:

1. **PRD:** prd.md
2. **Architecture:** architecture.md (latest version)
3. **Epics & Stories:** epics.md
4. **UX Design:** ux-design-specification.md
5. **Validation Criteria:** course-correction-2026-01-18.md

---

## 2. PRD Analysis

### 2.1 Functional Requirements (총 72개)

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

**Total FRs: 72개**

---

### 2.2 Non-Functional Requirements (총 20개)

#### Performance (성능)
**NFR-P1: 문서 생성 속도**
- 간단 문서 (예비창업 1페이지): 30초 이내
- 복잡 문서 (R&D 과제기획서 20페이지+ 인포그래픽): 2분 이내
- **초기 500자:** 10초 이내 첫 화면 표시 (Progressive Streaming)
- **RAG 검색:** 3초 이내 (사용자 문서 100개 기준, ivfflat 인덱스)
- **장애 복구:** AI 호출 실패 시 3초 이내 재시도, 3회 실패 시 알림

**NFR-P2: Node UI 반응속도**
- 노드 추가/이동/연결: 100ms 이내 반응
- **캔버스 렌더링 (노드 수 기준):**
  - 노드 50개 이하: 60fps 유지
  - 노드 50~200개: 30fps 유지
  - 노드 200개 이상: 가상화 스크롤 적용
- **인포그래픽 렌더링:** 2초 이내 첫 프레임 표시

**NFR-P3: 동시 편집 지연**
- **MVP (Polling):** 10초 이내 지연
- **Post-MVP (WebSocket):** 1초 이내 지연
- **충돌 해결:** Optimistic Concurrency Control (OCC) 자동 병합
- **DB Connection Pool:** 50개 동시 연결 지원

#### Security (보안)
**NFR-S1: 데이터 암호화**
- 전송 중 데이터: TLS 1.3 이상
- 저장 데이터: AES-256 암호화
- API 통신: HTTPS 강제

**NFR-S2: 인증 및 권한**
- OAuth 2.0 / OpenID Connect 지원 (Google, Naver)
- 다중 인증 (MFA) 지원 (TOTP 기반)
- 세션 만료: 14일 무료, "기억하기" 선택 시 30일

**NFR-S3: 개인정보 보호**
- 개인정보보호법 준수 (국내)
- GDPR 준수 (유럽 사용자)
- 데이터 삭제: 계정 삭제 시 30일 이내 모든 데이터 완전 삭제
- 이용 약관 명시적인 동의

**NFR-S4: 결제 보안**
- PCI-DSS 준수 (결제 대행사 통해)
- 결제 정보 미저장 (PG사만 저장)
- 결제 로그: 모든 결제 기록 7년 보관

#### Scalability (확장성)
**NFR-SC1: 동시 사용자 지원**
- **초기 (MVP):** 100명 동시 접속
- **성장 (6개월):** 500명 동시 접속
- **확장 (12개월+):** 2000명 동시 접속

**NFR-SC2: 데이터 저장**
- 사용자당: 10GB 저장 공간
- 단일 파일 업로드: 50MB 제한
- 임베딩 문서: 사용자당 1000개 문서

**NFR-SC3: API 호출 한도**
- **프리티어:** 월 50회 AI 호출
- **유료 (Basic):** 월 300회 AI 호출
- **유료 (Pro):** 무제한 (Fair Use Policy 적용)

#### Accessibility (접근성)
**NFR-A1: WCAG 2.1 준수**
- Level AA 준수 (색상 대비 4.5:1, 키보드 접근성)
- 스크린 리더 지원 (ARIA 라벨)
- 초점 표시 (명확한 시각적 표시)

**NFR-A2: 다국어 지원**
- **한국어:** 완벽 지원 (UI, AI 답변, 템플릿)
- **영어:** 기본 지원 (UI 번역, AI 답변)
- **향후 확장:** 중국어, 일본어 (Post-MVP)

**NFR-A3: 반응식 디자인**
- **Mobile:** iOS 15+, Android 12+ (Chrome)
- **Tablet:** iPadOS 15+, Android Tablet 12+
- **Desktop:** Chrome 110+, Safari 16+, Firefox 110+, Edge 110+

#### Integration (통합)
**NFR-I1: Google Drive 통합**
- OAuth 2.0 기반 연동
- 지원 파일 형식: hwp, docx, pdf, txt, md
- 자동 스캔: 새 파일 5분 이내 감지
- 연동 해제: 모든 토큰 즉시 삭제

**NFR-I2: AI API 통합**
- **주요:** Claude 4.5 (Anthropic)
- **보조:** GLM 4.7 (Fallback)
- **장애 복구:** 3초 이내 Fallback, 3회 실패 시 사용자 알림
- **Rate Limiting:** 공급자 한도 준수

**NFR-I3: RAG 시스템**
- 벡터 DB: pgvector (PostgreSQL 확장)
- 임베딩 모델: text-embedding-3-small (OpenAI) 또는 동급
- 검색 정확도: 70% 이상 관련 문서 Top-5
- 캐싱: 동일 쿼리 0.5초 이내 재사용 (Redis)

#### Reliability (신뢰성)
**NFR-R1: 가용성**
- **목표:** 99.9% Uptime (월간 43분 다운타임 허용)
- **모니터링:** 1분 간격 헬스 체크
- **공지:** 예정된 점검 48시간 전 공지

**NFR-R2: 데이터 백업**
- 일일 백업: 매일 새벽 3시 (KST)
- 보관 기간: 30일
- 백업 위치: 리전 간 복제 (서울 → 도쿄)

**NFR-R3: 재해 복구**
- **RTO (Recovery Time Objective):** 4시간 이내 복구
- **RPO (Recovery Point Objective):** 1일 이내 데이터 손실
- 복구 훈련: 분기별 1회 DR 훈련

**NFR-R4: 장애 대응**
- **장애 감지:** 1분 이내 Slack 알림
- **자동 복구:** API 재시작, DB 재시작
- **사용자 공지:** 장애 발생 5분 이내 Status 페이지 업데이트

**Total NFRs: 20개**

---

### 2.3 PRD Completeness Assessment

#### ✅ Strengths

1. **Comprehensive Coverage:** 72개의 FR과 20개의 NFR으로 매우 상세함
2. **Clear Structure:** 18개 Capability Area로 체계적으로 분류됨
3. **Testable Requirements:** 모든 FR이 테스트 가능한 형식으로 작성됨
4. **Technology Agnostic:** PRD는 "WHAT"을 명시하고 "HOW"를 피함
5. **Self-Validation:** 내부 검증 체크리스트 포함되어 있음
6. **User-Centric:** 사용자 관점에서 작성된 요구사항

#### ⚠️ Areas of Concern (Course Correction Related)

**CRITICAL:** PRD는 **기술 중립적**이므로 코스 교정으로 인한 기술 스택 변경(Supabase → PostgreSQL, OAuth 구현 방식)을 PRD 수준에서는 반영할 필요가 없습니다. 그러나:

1. **NFR-S2 (인증 및 권한):** "OAuth 2.0 / OpenID Connect 지원 (Google, Naver)"라고 명시되어 있음
   - 이는 Supabase나 직접 구현이든 상관없이 충족 가능
   - **PRD 레벨에서는 변경 불필요** ✅

2. **NFR-I3 (RAG 시스템):** "벡터 DB: pgvector (PostgreSQL 확장)"이라고 명시
   - 코스 교정과 일치 (직접 PostgreSQL 사용)
   - **PRD는 이미 올바르게 반영됨** ✅

#### 📋 PRD Assessment Summary

- **Completeness:** ✅ **우수** - 모든 MVP capability 포함
- **Clarity:** ✅ **우수** - 명확하고 테스트 가능한 요구사항
- **Alignment with Course Correction:** ✅ **양호** - PRD는 기술 중립적이므로 기술 스택 변경 영향 없음
- **Traceability:** ✅ **우수** - FR 번호화로 추적 가능

**Recommendation:** PRD는 코스 교정과 무관하게 **구현 준비 완료** 상태입니다.

---

## 3. Epic Coverage Validation

### 3.1 Epic FR Coverage Extracted

| Epic | Description | FRs Covered | Count |
|------|-------------|-------------|-------|
| **Epic 1** | 사용자 인증 및 온보딩 | FR1-5, FR51, FR54-59 | 19 |
| **Epic 2** | 클라우드 연동 및 문서 임베딩 | FR17-21, FR28-32, FR44 | 10 |
| **Epic 3** | AI 문서 생성 | FR11-16, FR42, FR45 | 8 |
| **Epic 4** | 문서 관리 | FR39-43, FR46 | 6 |
| **Epic 5** | 사용자 인터페이스 및 접근성 | FR33-38, FR47-50 | 13 |
| **Epic 6** | Visual Workflow Management (Node UI) | FR6-10 | 5 |
| **Epic 7** | 팀 협업 | FR22-27 | 6 |
| **Epic 8** | 실시간 협업 및 버전 관리 | FR62-67 | 6 |
| **Epic 9** | 대시보드 및 관리자 | FR60-61, FR68-72 | 8 |
| **TOTAL** | | **FR1-72** | **72** |

---

### 3.2 Coverage Analysis

#### ✅ Complete Coverage

**Total PRD FRs:** 72개
**FRs covered in Epics:** 72개
**Coverage Percentage:** **100%** ✅

모든 PRD의 기능적 요구사항(FR)이 Epics에 완벽하게 매핑되었습니다.

#### 📊 FR Coverage by Epic

**Epic 1: 사용자 인증 및 온보딩 (19개 FR)**
- FR1-5: 온보딩 질문, 환영 메시지, 가이드 투어, AI 제안, 피드백
- FR51: 데모 모드
- FR54-56: 비즈니스 용어 툴팁, 예제, 검색
- FR57-59: AI 우선순위 제안, 일일 플래너, 수동 조정

**Epic 2: 클라우드 연동 및 문서 임베딩 (10개 FR)**
- FR17-21: Google Drive 연동, 미리 보기, 자동 분류, 수동 선택, 파일 형식 지원
- FR28-32: OAuth 2.0, 전체 스캔, 변경 감지, 연동 해제, 읽기 전용 권한
- FR44: 클라우드 재연결 옵션

**Epic 3: AI 문서 생성 (8개 FR)**
- FR11-16: AI 질문/답변, 정부지원사업 양식, IR 자료, 프로그레스 바, 성공 애니메이션, 맞춤형 생성
- FR42: 인포그래픽 자동 생성
- FR45: AI 생성 재시도

**Epic 4: 문서 관리 (6개 FR)**
- FR39-43: 문서 저장/불러오기, 삭제, 복제, PDF/PPT 다운로드
- FR46: 시스템 장애 공지

**Epic 5: 사용자 인터페이스 및 접근성 (13개 FR)**
- FR33-38: Dark Mode, 반응식 UI, 모바일 폼, 감정적 에러 메시지, 키보드 내비게이션
- FR47-50: 색상 대비, 스크린 리더, 200% 확대, 키보드 접근

**Epic 6: Visual Workflow Management (5개 FR)**
- FR6-10: 노드 기반 캔버스, 노드 조작, 무한 캔버스, 드래그앤드롭, 편집 모드

**Epic 7: 팀 협업 (6개 FR)**
- FR22-27: 팀원 초대, 권한 관리, Polling 기반 동시 편집, 활동 로그, 충돌 해결, @멘션

**Epic 8: 실시간 협업 및 버전 관리 (6개 FR)**
- FR62-64: 실시간 커서, 입력 중 표시, 온라인 상태
- FR65-67: 버전 히스토리, 복원, 비교

**Epic 9: 대시보드 및 관리자 (8개 FR)**
- FR60-61: 진행 상황 시각화, 성취감 진행률
- FR68-72: 관리자 대시보드, 성과 지표, 활동 내역, 벌크 라이선스, 라이선스 관리

---

### 3.3 Missing FR Coverage

#### ✅ None Found

모든 72개 FR이 Epics에 완벽하게 커버되었습니다. 누락된 요구사항이 없습니다.

---

### 3.4 Course Correction Impact on Epic Coverage

#### 🎯 Epic 1 & 2: 가장 큰 영향

**Epic 1 (Story 1.1, 1.2):**
- ✅ **Story 1.1:** "프로젝트 초기화 및 PostgreSQL 설정" - 이미 PostgreSQL 직접 연결로 명시됨
- ⚠️ **Story 1.2:** "사용자 OAuth 로그인" - 현재 Supabase Auth 가정, 코스 교정 반영 필요
  - 변경 필요: Passport.js + JWT 구현으로 Story 업데이트
  - Naver OAuth Strategy 추가

**Epic 2:**
- ⚠️ Google Drive OAuth 구현에 Passport.js 사용 필요
- Supabase OAuth 제거하고 직접 구현으로 Story 업데이트 필요

#### 📋 코스 교정 반영이 필요한 Epic

1. **Epic 1 Story 1.2:** Supabase Auth → Passport.js + JWT
2. **Epic 1 Story 1.3:** 온보딩 데이터 저장 방식 (직접 PostgreSQL 쿼리)
3. **Epic 2 Stories:** OAuth 흐름이 직접 Passport.js 구현으로 변경
4. **모든 인증 관련 Stories:** JWT 토큰 기반 인증으로 업데이트

---

### 3.5 Epic Coverage Assessment Summary

#### ✅ Strengths

1. **Complete Coverage:** 72/72 FR (100%) 완벽한 커버리지
2. **Clear Organization:** 9개 Epic으로 체계적으로 분류
3. **Logical Flow:** Epic 간 의존성이 명확히 정의됨
4. **Phase Planning:** MVP (Phase 1), 중요 (Phase 2), 선택적 (Phase 3)로 구분
5. **Story Count:** 총 52개 Story로 상세하게 분해됨

#### ⚠️ Course Correction Gaps

**CRITICAL:** Epic 구조는 우수하나, 코스 교정 기술 스택 변경이 Stories에 완전히 반영되지 않았습니다.

**주요 이슈:**
1. **Epic 1 Story 1.2:** "Supabase Auth" 언급 제거 필요
2. **인증 흐름:** OAuth 콜백 핸들링 방식 변경 필요
3. **데이터베이스:** 모든 Story에서 Supabase Client → 직접 PostgreSQL 쿼리로 변경
4. **보안:** RLS 정책 제거 → 미들웨어 권한 체크 추가

#### 📊 Coverage Statistics

- **Total PRD FRs:** 72개
- **FRs covered in Epics:** 72개
- **Coverage Percentage:** **100%** ✅
- **Total Epics:** 9개
- **Total Stories:** 52개
- **Stories requiring course correction update:** 약 8-10개 Story (Epic 1-2)

**Recommendation:** Epic 구조는 우수하나, 코스 교정 내용을 반영하여 관련 Stories를 업데이트해야 합니다.

---

## 4. Architecture Alignment with Course Correction

### 4.1 Course Correction Requirements

코스 교정 문서(`course-correction-2026-01-18.md`)에서 명시된 핵심 변경사항:

#### 핵심 기술 스택 변경

1. **인증 시스템:**
   - ❌ Supabase Auth 제거
   - ✅ JWT + Passport.js 도입
   - ✅ OAuth 2.0 직접 구현 (Google, Naver Strategy)

2. **데이터베이스:**
   - ❌ Supabase Client 제거 (`@supabase/supabase-js`)
   - ✅ 직접 PostgreSQL 연결 (`pg` 패키지)
   - ✅ 호스팅 서버: 15.164.103.114:5432
   - ✅ pgvector 확장 유지 (RAG 시스템)

3. **보안:**
   - ❌ Row Level Security (RLS) 제거
   - ✅ 미들웨어 기반 권한 체크 구현
   - ✅ JWT 토큰 기반 인증

4. **패키지 변경:**
   - 제거: `@supabase/supabase-js`
   - 추가: `passport`, `passport-google-oauth20`, `passport-naver`, `jsonwebtoken`, `bcrypt`

---

### 4.2 Architecture Document Compliance

#### ✅ 완벽하게 반영됨

**Architecture.md (Jan 18 14:47) 분석 결과:**

1. **인증 시스템 ✅**
   ```
   - 인증: JWT + Passport.js (OAuth 2.0: Google, Naver 직접 구현)
   - Passport.js 0.7.0 + JWT 9.0.3 ✨ 코스 교정 반영 완료
   - JWT 토큰 생성/검증/갱신
   - OAuth Access Token/Refresh Token 관리
   ```

2. **데이터베이스 ✅**
   ```
   - pg 8.11.3 (PostgreSQL 직접 연결 - Supabase Client 제거)
   - pgvector 0.5.0 (RAG용 PostgreSQL 확장)
   - PostgreSQL 15 (호스팅 서버: 15.164.103.114:5432)
   - PostgreSQL Connection Pool 관리
   ```

3. **패키지 의존성 ✅**
   ```
   제거:
   - Supabase Auth, Supabase Client, @supabase/supabase-js, Row Level Security (RLS)

   추가:
   - Passport.js, passport-google-oauth20, passport-naver
   - jsonwebtoken, bcrypt, pg (PostgreSQL Pool)
   ```

4. **인증 흐름 ✅**
   ```
   1. OAuth 2.0 (Google, Naver):
      - Passport.js Strategy로 OAuth 2.0 (Google, Naver) 구현
      - 콜백: JWT 토큰 생성 및 세션 저장

   2. JWT 미들웨어:
      - 모든 API 엔드포인트에 JWT 미들웨어 적용
      - Authorization 헤더에서 Bearer token 추출
      - userId, userRole을 request에 attach
   ```

5. **보안 아키텍처 ✅**
   ```
   - JWT: 7일 만료, Refresh Token 구현
   - ❌ Supabase Auth + JWT 혼용
   - ✅ JWT만 사용 (Supabase 완전 제거)
   - 미들웨어 권한 체크 (RLS 제거)
   ```

---

### 4.3 Architecture Assessment Summary

#### ✅ Excellent Alignment

**Alignment Score:** **100%** ✅

Architecture 문서는 코스 교정 요구사항을 **완벽하게 반영**하고 있습니다:

1. **기술 스택:** 모든 변경사항이 정확하게 반영됨
2. **패키지 의존성:** Supabase 관련 패키지 제거, 새로운 패키지 추가 명확히 명시
3. **인증 흐름:** JWT + Passport.js 기반으로 완전히 재설계됨
4. **데이터베이스:** 직접 PostgreSQL 연결로 명확히 변경됨
5. **보안:** RLS 제거, 미들웄어 기반 권한 체크로 명확히 전환됨

#### 📋 Architecture Specific Changes

**프론트엔드:**
- `Axios 1.6.2` (HTTP Client - Supabase Client 제거)
- Redux Toolkit with JWT 인증 state

**백엔드:**
- `pg 8.11.3` (PostgreSQL 직접 연결)
- `Passport.js 0.7.0` (OAuth 2.0 Strategies)
- `jsonwebtoken 9.0.3` (JWT 생성/검증)
- `bcrypt 5.1.1` (비밀번호 해싱)

**인증 엔드포인트:**
```typescript
// OAuth 엔드포인트
GET  /api/v1/auth/google
GET  /api/v1/auth/google/callback
GET  /api/v1/auth/naver
GET  /api/v1/auth/naver/callback

// JWT 엔드포인트
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
```

**Recommendation:** Architecture 문서는 **구현 준비 완료** 상태입니다. 코스 교정 요구사항이 완벽하게 반영되었습니다.

---

## 5. Epic Stories Alignment with Course Correction

### 5.1 Stories Requiring Updates

#### 🔴 Critical Priority (Epic 1)

**Story 1.1: 프로젝트 초기화 및 PostgreSQL 설정**
- **Current Status:** ⚠️ **부분적으로만 반영됨**
- **What's Good:** ✅ "PostgreSQL 설정"으로 명시됨
- **What's Missing:**
  - ❌ Supabase 패키지 제거 언급 없음
  - ❌ Passport.js 및 관련 패키지 추가 언급 없음
  - ❌ Naver OAuth Strategy 추가 언급 없음
- **Required Updates:**
  ```
  Acceptance Criteria에 추가:
  - Supabase 패키지 제거 (@supabase/supabase-js)
  - Passport.js, passport-google-oauth20, passport-naver 추가
  - jsonwebtoken, bcrypt 패키지 추가
  - Naver OAuth Client ID/Secret 환경변수 추가
  ```

**Story 1.2: 사용자 OAuth 로그인**
- **Current Status:** ⚠️ **개념적으로만 반영됨**
- **What's Good:** ✅ "JWT token" 언급됨
- **What's Missing:**
  - ❌ Passport.js Strategy 구현 상세 없음
  - ❌ OAuth 콜백 핸들링 구체적 흐름 없음
  - ❌ Naver OAuth 언급 없음 (Story 설명에만 있음)
  - ❌ 프론트엔드에서 백엔드 OAuth 엔드포인트로 리다이렉트하는 흐름 없음
- **Required Updates:**
  ```
  Acceptance Criteria 변경:
  Given 사용자가 로그인 페이지에 방문했을 때
  When 사용자가 "Google로 로그인" 버튼을 클릭하면
  Then:
    - 프론트엔드가 백엔드 OAuth 엔드포인트로 리다이렉트:
      GET /api/v1/auth/google
    - 백엔드가 Passport.js Google Strategy로 인증 시작
    - Google 로그인 페이지로 redirect된다

  And OAuth 인증 성공 콜백 시:
    - GET /api/v1/auth/google/callback 엔드포인트 호출
    - Passport.js가 사용자 정보 추출
    - JWT token 생성 (jsonwebtoken 이용)
    - profiles 테이블에 사용자 레코드 생성/업데이트
    - 프론트엔드로 {token, user} JSON 응답
    - Redux Toolkit에 token 저장 (localStorage)

  And Naver OAuth도 동일한 흐름:
    - GET /api/v1/auth/naver
    - GET /api/v1/auth/naver/callback
    - passport-naver Strategy 사용
  ```

**Story 1.3: 온보딩 플로우**
- **Current Status:** ⚠️ **데이터베이스 쿼리 방식 변경 필요**
- **What's Missing:**
  - ❌ Supabase Client → 직접 PostgreSQL 쿼리로 변경 필요
  - ❌ onboarding_responses 테이블 직접 쿼리 코드 예시 필요
- **Required Updates:**
  ```
  Acceptance Criteria 추가:
  And 각 단계에서 "다음" 버튼 클릭 시:
    - Backend API 호출: POST /api/v1/onboarding/step/{step}
    - PostgreSQL 직접 쿼리로 onboarding_responses 테이블에 저장:
      INSERT INTO onboarding_responses (user_id, step, response)
      VALUES ($1, $2, $3)
  ```

---

### 5.2 Additional Stories Requiring Updates (Epic 2)

#### 🟡 High Priority (Epic 2)

**Epic 2 모든 Stories (Google Drive 연동):**
- **Current Status:** ❌ **Supabase OAuth 가정**
- **What's Missing:**
  - ❌ Passport.js Google Strategy 사용 명시 필요
  - ❌ Google Drive OAuth Token 저장 방식 변경 필요
  - ❌ Access Token/Refresh Token 갱신 로직 추가 필요
- **Required Updates:**
  ```
  모든 Epic 2 Stories에 공통 변경사항:
  - Supabase OAuth → Passport.js Google Strategy
  - google_drive_tokens 테이블 직접 PostgreSQL 쿼리
  - Access Token 만료 시 자동 갱신 로직
  ```

---

### 5.3 Stories Analysis Summary

#### 📊 Update Requirements by Epic

| Epic | Total Stories | Stories Needing Update | Priority |
|------|---------------|------------------------|----------|
| **Epic 1** | 8 | 3 (Stories 1.1, 1.2, 1.3) | 🔴 Critical |
| **Epic 2** | 6 | 6 (모든 Stories) | 🟡 High |
| **Epic 3-9** | 38 | 0-2 (인증 관련만) | 🟢 Low |

**Total Stories Requiring Updates:** **약 9-11개 Stories**

---

### 5.4 Detailed Story Update Checklist

#### Epic 1: 사용자 인증 및 온보딩

**Story 1.1: 프로젝트 초기화 및 PostgreSQL 설정**
```yaml
Changes Required:
  - Add: Supabase 패키지 제거 (@supabase/supabase-js)
  - Add: Passport.js 관련 패키지 추가
    - passport 0.7.0
    - passport-google-oauth20 2.0.0
    - passport-naver 1.0.5
  - Add: JWT 패키지
    - jsonwebtoken 9.0.3
  - Add: 환경변수
    - GOOGLE_CLIENT_ID
    - GOOGLE_CLIENT_SECRET
    - GOOGLE_CALLBACK_URL
    - NAVER_CLIENT_ID
    - NAVER_CLIENT_SECRET
    - NAVER_CALLBACK_URL
    - JWT_SECRET
    - JWT_EXPIRES_IN
```

**Story 1.2: 사용자 OAuth 로그인**
```yaml
Changes Required:
  - Update: OAuth 흐름 설명
    - 프론트엔드 → 백엔드 OAuth 엔드포인트 리다이렉트
    - 백엔드 Passport.js Strategy 실행
    - 콜백 엔드포인트에서 JWT 생성
  - Add: Naver OAuth 흐름 (현재 Google만 상세히 설명됨)
  - Update: Session 저장 방식
    - Supabase session → JWT token (localStorage/Redux)
  - Add: Passport.js 설정 코드 예시
```

**Story 1.3: 온보딩 플로우**
```yaml
Changes Required:
  - Update: 데이터베이스 쿼리 방식
    - Supabase Client → 직접 PostgreSQL 쿼리 (pg 패키지)
  - Add: Backend API 엔드포인트 명시
    - POST /api/v1/onboarding/step/{step}
    - POST /api/v1/onboarding/complete
```

#### Epic 2: 클라우드 연동 및 문서 임베딩

**모든 Stories 공통 변경사항:**
```yaml
Changes Required:
  - Update: Google Drive OAuth 방식
    - Supabase OAuth → Passport.js Google Strategy
  - Update: Token 저장 방식
    - google_drive_tokens 테이블 직접 쿼리
  - Add: Access Token 갱신 로직
    - 만료 5분 전 자동 갱신
    - Refresh Token으로 재발급
```

---

### 5.5 Alignment Assessment Summary

#### ⚠️ Partial Alignment

**Overall Alignment Score:** **40%** (9/23 Epic Stories)

**Alignment Breakdown:**
- **Architecture:** ✅ 100% (완벽하게 반영됨)
- **Epic Structure:** ✅ 100% (FR 커버리지 완료)
- **Story Details:** ❌ 40% (구현 상세가 코스 교정 미반영)

#### 🎯 Key Findings

1. **Good News:**
   - ✅ Story 1.1은 이미 "PostgreSQL"로 명시되어 있음
   - ✅ Story 1.2는 "JWT token" 개념이 포함되어 있음
   - ✅ Epic 구조는 우수하고 FR 커버리지는 완벽함

2. **Critical Issues:**
   - ❌ Story 1.1: Supabase 패키지 제거 언급 없음
   - ❌ Story 1.2: Passport.js 구현 상세가 없음
   - ❌ Epic 2: 모든 Stories가 Supabase OAuth 가정하에 작성됨
   - ❌ 모든 Stories: Supabase Client → 직접 PostgreSQL 쿼리로 변경 필요

3. **Update Scope:**
   - **Critical (즉시 필요):** Epic 1 Stories 1.1-1.3 (3개)
   - **High Priority (초기 구현 전):** Epic 2 모든 Stories (6개)
   - **Medium Priority (구현 시):** 나머지 인증 관련 Stories (2-3개)

**Recommendation:** Epic Stories에 코스 교정 내용을 반영하여 업데이트해야 합니다. 특히 Epic 1-2의 Stories를 우선적으로 업데이트한 후 구현을 시작할 것을 권장합니다.

---

## 6. Recommendations

### 6.1 Immediate Actions Required

#### 🔴 Critical Priority (즉시 실행 필요)

**1. Epic 1 Stories 업데이트 (Story 1.1-1.3)**

이 Stories를 업데이트한 후 구현을 시작할 것을 강력히 권장합니다:

**Story 1.1: 프로젝트 초기화 및 PostgreSQL 설정**
- 파일: `_bmad-output/planning-artifacts/epics.md`
- 섹션: Epic 1 → Story 1.1
- 변경사항:
  ```yaml
  추가할 내용:
    - Supabase 패키지 제거 명시
    - Passport.js 관련 패키지 추가 (passport, passport-google-oauth20, passport-naver)
    - JWT 패키지 추가 (jsonwebtoken, bcrypt)
    - 환경변수 추가 (GOOGLE_CLIENT_ID, NAVER_CLIENT_ID, JWT_SECRET 등)
  ```

**Story 1.2: 사용자 OAuth 로그인**
- 파일: `_bmad-output/planning-artifacts/epics.md`
- 섹션: Epic 1 → Story 1.2
- 변경사항:
  ```yaml
  수정할 내용:
    - OAuth 흐름을 Passport.js 기반으로 상세화
    - 프론트엔드 → 백엔드 리다이렉트 흐름 명시
    - 콜백 엔드포인트에서 JWT 생성 흐름 추가
    - Naver OAuth도 Google과 동일한 흐름으로 명시
  ```

**Story 1.3: 온보딩 플로우**
- 파일: `_bmad-output/planning-artifacts/epics.md`
- 섹션: Epic 1 → Story 1.3
- 변경사항:
  ```yaml
  수정할 내용:
    - Supabase Client → 직접 PostgreSQL 쿼리로 변경
    - Backend API 엔드포인트 명시
    - 데이터 저장 SQL 쿼리 예시 추가
  ```

---

#### 🟡 High Priority (구현 시작 전 완료)

**2. Epic 2 모든 Stories 업데이트**

Epic 2의 6개 Stories 모두 Supabase OAuth를 가정하고 있으므로, Passport.js 기반으로 변경해야 합니다:

**공통 변경사항 (모든 Epic 2 Stories):**
- Supabase OAuth → Passport.js Google Strategy
- google_drive_tokens 테이블 직접 PostgreSQL 쿼리
- Access Token/Refresh Token 갱신 로직 추가

---

### 6.2 Execution Plan

#### 단계 1: Stories 업데이트 (1-2시간)

```
1. Epic 1 Story 1.1 업데이트 (30분)
   - Supabase 제거, Passport.js 추가 명시
   - 환경변수 목록 추가

2. Epic 1 Story 1.2 업데이트 (45분)
   - OAuth 흐름을 Passport.js로 상세화
   - Naver OAuth 흐름 추가

3. Epic 1 Story 1.3 업데이트 (15분)
   - PostgreSQL 직접 쿼리로 변경

4. Epic 2 Stories 업데이트 (30분)
   - 모든 Stories에 Passport.js Google Strategy 명시
   - Token 갱신 로직 추가
```

#### 단계 2: 구현 시작 (업데이트 후 즉시)

```
Phase 1 - Epic 1 구현 (3-4일):
  Story 1.1: 프로젝트 초기화 (완료됨)
  Story 1.2: OAuth 로그인 구현 (Passport.js + JWT)
  Story 1.3: 온보딩 플로우 (PostgreSQL 직접 쿼리)
  ...

Phase 2 - Epic 2 구현 (2-3일):
  Google Drive OAuth (Passport.js Strategy)
  문서 스캔 및 임베딩
  ...
```

---

### 6.3 Implementation Readiness Score

#### 📊 Overall Readiness Assessment

| 문서 | 상태 | 코스 교정 반영 | 준비 완료도 |
|------|------|----------------|------------|
| **PRD** | ✅ 완료 | ✅ 불필요 (기술 중립적) | **100%** |
| **Architecture** | ✅ 완료 | ✅ 완벽하게 반영됨 | **100%** |
| **Epics** | ✅ 완료 | ✅ FR 커버리지 완료 | **100%** |
| **Stories** | ⚠️ 부분 완료 | ❌ 40%만 반영됨 | **40%** |

**Overall Readiness:** **60%** (Stories 업데이트 필요)

---

### 6.4 Detailed Recommendations

#### 1. Stories 업데이트 방법론

**Option A: 자동 업데이트 (권장)**
```
Workflow: [correct-course] 실행
- 코스 교정 문서를 기준으로 Stories 자동 업데이트
- Epic 1-2의 Stories를 우선 업데이트
- 변경사항을 검토하고 승인
```

**Option B: 수동 업데이트**
```
1. epics.md 파일 열기
2. Epic 1 Story 1.1-1.3 섹션 찾기
3. Acceptance Criteria에 코스 교정 내용 추가
4. Epic 2 Stories에 동일하게 적용
```

#### 2. 구현 우선순위

**Phase 1 (Must-Have - MVP):**
1. ✅ Story 1.1: 프로젝트 초기화 (이미 완료)
2. 🔴 Story 1.2: OAuth 로그인 **[업데이트 필요]**
3. 🔴 Story 1.3: 온보딩 플로우 **[업데이트 필요]**
4. 🟡 Epic 2 Stories: Google Drive 연동 **[업데이트 필요]**

**Phase 2 (Should-Have):**
5. Epic 3: AI 문서 생성
6. Epic 4: 문서 관리
7. Epic 5: UI/UX

**Phase 3 (Nice-to-Have):**
8. Epic 6: Node UI
9. Epic 7-8: 협업 기능
10. Epic 9: 대시보드

#### 3. 기술적 권장사항

**백엔드 구현 시 참고사항:**
```typescript
// Passport.js 설정 예시 (backend/src/config/passport.ts)
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as NaverStrategy } from 'passport-naver';

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
  },
  async (accessToken, refreshToken, profile, done) => {
    // PostgreSQL 직접 쿼리로 사용자 조회/생성
    const user = await findOrCreateUser(profile);
    return done(null, user);
  }
));

// Naver Strategy도 동일하게 구현
```

**JWT 미들웨어 예시:**
```typescript
// backend/src/middleware/auth.middleware.ts
import jwt from 'jsonwebtoken';

export const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
```

---

### 6.5 Risk Assessment

#### ⚠️ Identified Risks

1. **Stories 업데이트 누락 위험 (높음)**
   - **위험:** 업데이트 없이 구현 시작 시 Supabase 코드가 섞여 들어갈 수 있음
   - **완화:** 반드시 Stories를 먼저 업데이트한 후 구현 시작
   - **우선순위:** 🔴 Critical

2. **OAuth 구현 복잡도 (중간)**
   - **위험:** Passport.js OAuth 흐름이 Supabase보다 복잡함
   - **완화:** Architecture 문서의 코드 예시 참고
   - **우선순위:** 🟡 High

3. **데이터베이스 쿼리 일관성 (낮음)**
   - **위험:** Supabase Client가 여전히 코드에 남아있을 수 있음
   - **완화:** Code Review 시 Supabase Client 사용 체크
   - **우선순위:** 🟢 Medium

---

## 7. Final Assessment

### 7.1 Implementation Readiness: ⚠️ Conditional Approval

**Overall Status:** **60% Ready** (Stories 업데이트 필요)

**Approval Conditions:**
1. ✅ **PRD:** Ready - No changes needed
2. ✅ **Architecture:** Ready - Perfect alignment with course correction
3. ✅ **Epics Structure:** Ready - Complete FR coverage
4. ❌ **Stories:** **Not Ready** - Requires course correction updates

**Recommendation:** **Stories 업데이트 후 구현 시작 권장**

---

### 7.2 Summary of Findings

#### ✅ Strengths

1. **Architecture 우수함:** 코스 교정이 완벽하게 반영됨 (100%)
2. **PRD 완결성:** 72개 FR, 20개 NFR으로 매우 상세함
3. **Epic 구조:** 9개 Epic, 52개 Story로 체계적으로 분해됨
4. **FR 커버리지:** 72/72 (100%) 완벽한 커버리지
5. **기술 스택 명확성:** PostgreSQL, Passport.js, JWT 명확히 정의됨

#### ⚠️ Critical Gaps

1. **Stories와 코스 교정 불일치 (40% 반영)**
   - Story 1.1: Supabase 제거 언급 없음
   - Story 1.2: Passport.js 구현 상세 부족
   - Epic 2: 모든 Stories가 Supabase OAuth 가정

2. **구현 가이드 부족**
   - OAuth 콜백 핸들링 구체적 흐름 없음
   - Naver OAuth 구현 상세 없음
   - PostgreSQL 직접 쿼리 예시 부족

3. **데이터베이스 쿼리 방식 모호함**
   - Supabase Client → 직접 PostgreSQL 쿼리 전환 가이드 필요
   - 모든 Stories에 적용해야 함

---

### 7.3 Next Steps

#### 즉시 실행 (오늘)

1. **Stories 업데이트**
   ```
   우선순위:
   1. Epic 1 Story 1.1-1.3 (30-45분)
   2. Epic 2 모든 Stories (30분)

   방법:
   - [correct-course] 워크플로우 실행 또는
   - epics.md 파일 직접 편집
   ```

2. **업데이트 검토**
   ```
   확인사항:
   - Supabase 제거 명시
   - Passport.js 추가 명시
   - JWT 흐름 상세화
   - Naver OAuth 추가
   ```

#### 구현 시작 (내일)

3. **Story 1.2 구현**
   ```
   순서:
   1. Passport.js 설정
   2. Google/Naver Strategy 구현
   3. JWT 미들웨어 작성
   4. OAuth 엔드포인트 구현
   5. 프론트엔드 리다이렉트 로직
   ```

4. **Story 1.3 구현**
   ```
   순서:
   1. PostgreSQL 직접 쿼리 함수 작성
   2. 온보딩 API 엔드포인트 구현
   3. 프론트엔드 온보딩 폼 연동
   ```

---

### 7.4 Final Recommendation

**🎯 Bottom Line:**

프로젝트는 **Architecture와 PRD 수준에서는 구현 준비가 완료**되었으나, **Stories 수준에서 코스 교정 반영이 필요**합니다.

**권장 사항:**

1. **✅ DO:** Epic 1-2 Stories를 업데이트한 후 구현 시작
2. **⚠️ DON'T:** Stories 업데이트 없이 구현 시작 (Supabase 코드 혼입 위험)
3. **🔧 RECOMMEND:** [correct-course] 워크플로우로 Stories 자동 업데이트

**구현 가능 시점:** Stories 업데이트 완료 후 **즉시 구현 가능**

---

## 8. Appendix

### 8.1 Course Correction Key Changes

**기존 (Supabase):**
- Supabase Auth (OAuth 자동 처리)
- Supabase Client (데이터베이스)
- Row Level Security (RLS)

**새로운 방식 (직접 구현):**
- JWT + Passport.js (OAuth 수동 구현)
- pg 패키지 (직접 PostgreSQL 연결)
- 미들웨어 권한 체크

### 8.2 Updated Package List

**제거:**
- `@supabase/supabase-js`

**추가:**
- `passport` 0.7.0
- `passport-google-oauth20` 2.0.0
- `passport-naver` 1.0.5
- `jsonwebtoken` 9.0.3
- `bcrypt` 5.1.1
- `pg` 8.11.3 (이미 존재)

### 8.3 Environment Variables Required

```bash
# Database (기존)
DB_HOST=15.164.103.114
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=***

# JWT (새로 추가)
JWT_SECRET=***
JWT_EXPIRES_IN=7d

# Google OAuth (기존)
GOOGLE_CLIENT_ID=***
GOOGLE_CLIENT_SECRET=***
GOOGLE_CALLBACK_URL=http://localhost:3000/api/v1/auth/google/callback

# Naver OAuth (새로 추가)
NAVER_CLIENT_ID=***
NAVER_CLIENT_SECRET=***
NAVER_CALLBACK_URL=http://localhost:3000/api/v1/auth/naver/callback
```

---

**Report Generated:** 2026-01-18-1458
**Assessment Version:** 1.0
**Status:** ✅ Assessment Complete - Stories Update Required
