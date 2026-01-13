---
stepsCompleted: [1, 2, 3, 4, 6, 7, 8, 9, 10, 11]
inputDocuments:
  - /Users/donggyu/bm-builder/_bmad-output/planning-artifacts/product-brief-bm-builder-2026-01-09.md
workflowType: 'prd'
lastStep: 11
completed: "2026-01-09"
briefCount: 1
researchCount: 0
brainstormingCount: 0
projectDocsCount: 0
---

# Product Requirements Document - bm-builder

**Author:** Donggyu
**Date:** 2026-01-09

## Executive Summary

bm-builder는 창업가가 혼자서 모든 것을 결정하고 실행해야 하는 고립감과 리스크를 해결하기 위해 탄생한 AI 공동 창업자 SaaS 플랫폼입니다. 우리는 단순한 문서 생성 도구가 아니라, 창업가의 여정을 함께하는 능동적 AI 파트너를 만듭니다.

### 핵심 문제

창업가들이 겪는 5가지 핵심 문제를 해결합니다:

1. **의사결정의 고립:** 동료 없이 모든 결정을 혼자 내려야 하는 압박감
2. **문서 작성의 부담:** 린스타트업 7단계부터 IR/정부지원사업 자료까지 수백 시간 소요
3. **지식의 단절:** 기존 문서, 회사 자료를 새로운 문서에 통합하기 어려움
4. **형식의 까다로움:** 정부지원사업 특화 양식, IR 투자자용 포맷을 맞추는 데 큰 노력
5. **품질의 불확실성:** 비전문가가 작성하거나 일반 AI가 생성한 문서는 전문성 부족

### 제품 비전

bm-builder는 다음 5가지 핵심 기능을 제공합니다:

**1. AI 공동 창업자 (능동적 파트너)**
- 단순한 질문/답변이 아니라, 능동적으로 제안하고 분석
- 사용자 비전을 먼저 이해하는 onboarding으로 개인화된 경험 제공
- "이 방향이 맞을까?"라고 함께 고민하는 동료 경험

**2. 기존 문서 임베딩**
- 구글 드라이브, OneDrive, Dropbox 연동으로 hwp, docx, pdf 자동 스캔
- 기존 비즈니스 문서, 회사 자료를 RAG로 컨텍스트로 활용
- 문서 임베딩 전 미리 보기/검증 기능으로 신뢰도 향상
- "우리 회사의 기존 문서를 그대로 활용해줘"

**3. Node 기반 시각적 워크플로우**
- 복잡한 린스타트업 프로세스를 직관적인 노드와 연결선으로 표현
- 드래그앤드롭으로 자유롭게 구성 (비기술자도 쉽게 사용)
- 무한 캔버스로 전체 과정을 한눈에 파악
- 가이드 투어로 낮은 진입 장벽 제공

**4. 인포그래픽 자동 생성**
- Claude 4.5/GLM 4.7의 멀티모달 능력 활용
- 나노 바나나 수준의 전문가급 차트/그래프/Figure
- 논문 수준의 시각 자료를 자동으로 생성

**5. 정부지원사업 특화**
- 정부지원사업 양식에 맞춘 자동 생성
- AI 심사위원의 기준을 이해하여 최적화된 자료
- IR 자료, 사업계획서를 클릭 몇 번으로 완성

### 타겟 사용자별 최적화

**예비 창업가 (박준혁, 이서연):**
- 낮은 진입 장벽: 가이드 투어, demo 모드, 프리티어 월 50회
- 비기술자 친화적 UI: 직관적 Node 기반 인터페이스
- 학습 지원: 튜토리얼, 예제, AI 추천

**Solopreneur (김태현):**
- 1인 전용 모드: 팀 기능 선택적 활성화, 간소화된 인터페이스
- 성취감 강조: 대시보드가 진전 상황을 긍정적으로 시각화
- 효율성: 우선순위 자동 제안, 일일 플래너

**초기 스타트업 창업자 (최민지):**
- 세분화된 권한: Owner, Editor, Viewer, Commenter, Reviewer
- 회사 문서 검증: 임베딩 전 미리 보기, 충돌 해결 메커니즘
- 실시간 협업: 동기 편집, 활동 로그, @멘션

**액셀러레이터 (정진우):**
- 관리자 대시보드: 팀별 진행 상황 모니터링, 리포트
- 파트너십 프로그램: 할인 라이선스, 벌크 구매, 전용 지원

### What Makes This Special

bm-builder는 다음 5가지 차별점으로 경쟁사와 구별됩니다:

**1. AI가 "동료" (Co-founder)가 되는 경험**
- 단순 도구가 아니라, 함께 고민하고 제안하는 파트너
- 능동적인 의사결정 지원: "이렇게 하는 게 어떨까?"
- 컨텍스트 인식: 현재 작업 중인 노드를 이해하고 맥락적 대화

**2. 문서 임베딩의 깊이**
- 단순히 참고가 아니라, 기존 문서의 내용을 "녹여내기"
- RAG로 사용자/회사의 고유한 지식을 결과물에 반영
- "우리 회사만의 맞춤형 자료"가 자동으로 생성됨

**3. Node UI + 정부지원사업 특화의 조합**
- 경쟁사는 Node UI가 있거나 정부지원사업 특화가 있음
- 우리는 둘 다: 시각적 워크플로우 + 정부지원사업 양식 완벽 지원
- 직관적 UI로 복잡한 문서 작성을 단순화

**4. 멀티모달 AI (텍스트 + 이미지)**
- 경쟁사 AI 도구는 주로 텍스트만 생성
- 우리는 인포그래픽까지 자동 생성
- 나노 바나나 수준의 전문가급 시각 자료

**5. 한국 시장 특화**
- 정부지원사업, IR 자료에 대한 깊은 이해
- 한국어 완벽 지원
- 한국 스타트업 생태계에 맞춘 기능

## Project Classification

**Technical Type:** web_app (SaaS platform with Node-based UI)
**Domain:** general (startup tools, no specific domain dependency)
**Complexity:** medium (AI integration, RAG system, multimodal generation, government support specialization)
**Project Context:** Greenfield - new project

**핵심 기술 스택:**
- Frontend: React (Vite), React Flow (Node UI)
- Backend: Node.js (Express)
- Database: Supabase (PostgreSQL + pgvector for RAG)
- AI Models: Claude 4.5 (Anthropic), GLM 4.7 (Zhipu AI)
- Cloud Storage: Google Drive, OneDrive, Dropbox
- Infrastructure: Vercel (frontend), Railway/Render (backend)

**3개월 MVP 범위:**
- 기초 인프라 (인증, 클라우드 연동, AI 연동)
- Node 기반 워크플로우 UI (린스타트업 7단계)
- 문서 작성 & 생성 (템플릿, AI 자동 생성)
- 정부지원사업 특화 (양식 자동 맞춤)
- IR 자료 생성 (피칭 데크, 인포그래픽)
- 팀 협업 기능 (최대 3명, 세분화된 권한: Owner, Editor, Viewer, Commenter, Reviewer)
- 고급 분석 대시보드 (성취감 강조, Solopreneur 모드 지원)
- 프롬프트 템플릿 시스템
- 알림 시스템
- 멀티언어 지원 (한국어, English)
- 커뮤니티 기능 (Discord/Slack 연동)
- 액셀러레이터 관리자 대시보드

**가격 정책:**
- 프리티어: 월 50회 (학습용 demo 모드 포함)
- 프로 티어: 월 5만 원 (무제한 AI 호출)
- 팀 티어: 월 15만 원 (최대 3명, 팀 협업)
- 액셀러레이터: 할인 라이선스, 벌크 구매 지원

## Success Criteria

### User Success

#### "가치 있다" Moment (Aha! Moment)

**정의:** 사용자가 bm-builder를 사용한 보람을 느끼는 순간은 **"제출 가능한 품질의 완성된 결과물"**을 확인했을 때입니다.

**구체적 기준:**
- ✅ AI가 생성한 정부지원사업 문서를 **수정 없이 혹은 최소 수정(10분 이내)으로 바로 제출 가능**
- ✅ IR 피칭 데크와 인포그래픽이 투자자 미팅에 사용 가능한 수준
- ✅ 문서의 형식, 내용, 시각 자료가 모두 전문가급 품질
- ✅ 기존 회사 문서가 자연스럽게 녹아들어 맞춤형 결과물

**감정적 성공:**
- **성취감:** "혼자서 이걸 완성했다"는 자부심
- **자신감:** "전문가가 작성해도 이 정도일걸?"라는 확신
- **동료감:** "AI가 나를 이해하고 함께 만들어갔다"는 경험

**완료 기준 (Completion Criteria):**
1. **정부지원사업 문서 완성:** 사업계획서, 요약서, 예산서, 재무제표, 제품 설명자료, 인포그래픽이 포함된 전체 패키지
2. **IR 자료 완성:** 피칭 데크(10-15장), 1-pager, 비즈니스 모델 캔버스, 인포그래픽, 재무 프로젝션
3. **린스타트업 7단계 완성:** 문제 발견부터 IR 자료까지 전체 워크플로우 완주 (선택적 완료 기준)

#### Leading Indicators (성공으로 가는 신호)

**정부지원사업 수주 전 신호:**
- 서면 심사 통과 (1차 통과)
- 현장 심사(발표) 대상 선정
- 심사 점수 상위 20% 달성
- 예비 지원 사업 통과

**투자유치 성공 전 신호:**
- 투자자 1차 미팅 진입 (월 5회 이상)
- 2차 미팅(실사/상세 검토) 진입률 30% 이상
- 투자意向서(LOI) 또는 투자 제안 받음
- 투자자로부터 긍정적 피드백 (재미있겠어, 발전시켜볼게 등)

### Business Success

#### 1차 성공 지표 (Ultimate Success)

**이분법적 성공 기준:** 다음 **둘 중 하나만 달성**해도 비즈니스 성공

1. **투자유치 성공:** Seed 또는 Series A 투자 계약 체결
2. **정부지원사업 수주:** R&D, 예비창업, IR 혜택 등 정부 지원 사업 선정

#### 2차 성공 지표 (Leading Indicators)

**사용자 성장:**
- WAU (Weekly Active Users): 3개월 100 → 6개월 500 → 12개월 2,000
- 유료 전환율: 프리미어 → 프로 15%, 팀 10%
- Retention: 2주차 리텐션 60%, 8주차 40%

**참여도:**
- 문서 완성율: 시작한 문서 중 70% 이상 완성
- Node UI 사용深度: 평균 세션당 5개 이상 노드 방문
- 문서 재사용율: 임베딩된 문서가 50% 이상의 새 문서에 활용

**수익:**
- MRR (Monthly Recurring Revenue): 3개월 50만 원 → 6개월 300만 원 → 12개월 1,500만 원
- ARPU (Average Revenue Per User): 프로 5만 원, 팀 5만 원 (15만 원 ÷ 3명)
- CAC 대비 LTV 비율: 3:1 (12개월 목표)

#### 성공 단계 정의 (Progressive Success)

| 단계 | 정의 | 기간 | 지표 |
|------|------|------|------|
| **완전 성공** | 투자유치 또는 정부지원사업 수주 | 12개월 | 1차 성공 지표 달성 |
| **부분 성공** | 투자자 2차 미팅 또는 심사 통과 | 6-12개월 | Leading Indicators 달성 |
| **진전 중** | 투자자 1차 미팅 또는 서면 심사 제출 | 3-6개월 | WAU 100, 문서 완성 10개 |
| **개선 필요** | 활성 사용자 없음 | 3개월 | WAU 20 미만, 리텐션 20% 미만 |

### Technical Success

#### 문서 생성 품질 지표

**제출 가능 품질 기준:**
- **사용자 만족도:** 재작성 없이 바로 제출하는 비율 80% 이상
- **문서 오류율:** 오타, 형식 오류, 내용 불일치 2% 미만
- **전문성 점수:** 사용자 평균 평점 4.5/5.0 이상
- **AI 정확도:** 팩트 체크 통과율 95% 이상

#### 시스템 성능 지표

**반응 속도:**
- 문서 생성 소요 시간: 30초 이내 (단문), 2분 이내 (장문 + 인포그래픽)
- Node UI 반응 속도: 100ms 이내 (노드 드래그, 연결)
- AI 호출 실패율: 0.1% 미만 (999/1000 성공)

**확장성:**
- 동시 사용자 1,000명 지원 (12개월 목표)
- 문서 저장 용량: 사용자당 10GB (RAG 임베딩 포함)

#### RAG 정확도 지표

**문서 활용도:**
- 임베딩된 문서가 실제로 활용되는 비율 70% 이상
- 사용자가 기존 문서 재사용에 만족하는 정도 4.0/5.0 이상
- 관련 없는 문서 제안 false positive 5% 미만

**임베딩 속도:**
- PDF 처리: 10MB 기준 30초 이내
- HWP/DOCX 처리: 5MB 기준 10초 이내

### Measurable Outcomes

#### 3개월 (MVP 완성)

**사용자:**
- WAU: 100명 (프리티어 70, 프로 20, 팀 10)
- 온보딩 완료율: 80% (가이드 투어 완주)
- 문서 완성: 총 500개 (사용자당 평균 5개)

**시간 절감:**
- 문서 작성 시간 단축: 8시간 → 1시간 (87% 절감)
- 사용자 만족도: "이걸로 시간을 엄청 아꼈어" 90%

**비즈니스:**
- MRR: 50만 원 (프로 20명 × 5만 원 + 팀 10명 × 15만 원 ÷ 3)
- 투자자 미팅: 5회 (사용자 성공 사례)
- 정부지원사업 제출: 10건 (서면 심사 진입)

#### 6개월 (Product-Market Fit)

**사용자:**
- WAU: 500명 (프리티어 300, 프로 150, 팀 50)
- 리텐션: 2주차 60%, 8주차 40%
- 문서 완성: 총 5,000개

**비즈니스:**
- MRR: 300만 원
- 정부지원사업 수주: 1건 이상
- 투자자 2차 미팅: 3건 이상
- 액셀러레이터 파트너: 3개사

**성공 단계:** "부분 성공" 또는 "진전 중" 달성

#### 12개월 (Scale)

**사용자:**
- WAU: 2,000명 (프리티어 1,000, 프로 700, 팀 300)
- 리텐션: 2주차 70%, 8주차 50%
- 문서 완성: 총 30,000개

**비즈니스:**
- MRR: 1,500만 원
- 투자유치 성공: Seed 또는 Series A
- 정부지원사업 수상: 2건 이상
- 직원: 5명 (개발 3, 마케팅 1, CS 1)

**성공 단계:** "완전 성공" 달성

### Product Scope

#### MVP (3개월)

**핵심 기능:**
- ✅ Node 기반 워크플로우 UI (린스타트업 7단계)
- ✅ AI 문서 생성 (정부지원사업, IR)
- ✅ 문서 임베딩 (Google Drive, OneDrive)
- ✅ 인포그래픽 자동 생성
- ✅ 팀 협업 (최대 3명, 권한 관리)
- ✅ 고급 분석 대시보드 (성취감 강조)

**품질 기준:**
- 제출 가능한 품질의 문서 생성
- 80% 사용자 만족도
- 2% 미만 문서 오류율

#### Growth (6개월)

**확장 기능:**
- ✅ 더 많은 정부지원사업 템플릿 (50+ 종류)
- ✅ AI 피드백 루프 (사용자 행학 학습)
- ✅ 액셀러레이터 관리자 대시보드
- ✅ 커뮤니티 기능 (Discord/Slack 연동)
- ✅ 맞춤형 AI 튜닝 (사용자별 개인화)

**성과:**
- 정부지원사업 수주 1건
- 투자자 2차 미팅 3건

#### Vision (12개월+)

**장기 비전:**
- ✅ AI 공동 창업자로 완전한 진화
- ✅ 자동 완성된 비즈니스 플랜 (사용자 승인만 필요)
- ✅ 실시간 시장 데이터 연동 (경쟁사 분석, 트렌드)
- ✅ 멀티플랫폼 지원 (Mobile, Desktop)
- ✅ 글로벌 확장 (일본, 동남아)

**성과:**
- 투자유치 성공
- 정부지원사업 수상 2건
- 한국 스타트업 필수 도구

### Risk Mitigation

#### 리스크 1: 프리티어 제한 vs WAU 목표

**문제:** 월 50회 제한으로 100 WAU 달성 가능?

**완화:**
1. **Demo 모드 도입:** 학습용 무제한 체험 (저장 불가)
2. **평가판 기간:** 신규 사용자 14일 무제한
3. **추천 보상:** 친구 초대 시 추가 10회 제공

#### 리스크 2: "투자유치 OR 수주"의 이분법적 리스크

**문제:** 12개월 동안 실패하면 모든 게 실패?

**완화:**
1. **Progressive Success:** 단계적 성공 정의로 팀 사기 유지
2. **Leading Indicators:** 진전 상황을 명확히 시각화
3. **중간 목표 축하:** 심사 통과, 2차 미팅도 성공으로 환영

#### 리스크 3: 문서 품질 기준의 모호함

**문제:** "제출 가능한 품질"이 주관적일 수 있음

**완화:**
1. **체크리스트 제공:** 형식, 내용, 시각 자료 품질 기준 명시
2. **AI 피드백:** "제출하기 전에 이 부분 확인하세요" 자동 검사
3. **사용자 피드백:** "바로 제출했어요" 버튼으로 품질 확인

## User Journeys

### Primary Journeys (핵심 성공 경로 - 각 2분)

#### Journey 1: 박준혁 (34세, 예비 창업가) - "50분 만에 드디어 시작"

**Opening (30초):** 수요일 밤 10시 30분, 야근 후 지하실에서 *"이게 다인가?"* 공허함. 다음 날 bm-builder 발견.

**Rising Action:** 저녁 첫 로그인. *"준혁님, 반갑습니다! 당신의 구글 드라이브를 스캔했어요. Todo 앱 개발 6개월, 월 수입 30만 원... 퇴사 계획 있으신가요? AI가 시뮬레이션해드릴게요."* *"현재 수입 30만 원 vs 퇴사 후 생활비 200만 원. 추천: 정부지원사업 먼저 수주하세요."*

**Climax (1분):** 저녁 8시 30분부터 9시 20분, **단 50분** 만에 첫 번째 가설 문서 완성. *"준혁님, 프리랜서 10명 인터뷰 질문지 자동 작성 완료. 50분 만에 1주일 고민보다 더 많은 진전!"*

2주 후 첫 번째 정부지원사업 지원. 3시간 만에 지원서 완성. 결과: **탈락**.

**Resolution (30초):** AI가 탈락 피드백 분석하고 재시도 전략 제안. 두 번째 지원, **수주 성공** (5,000만 원). 아내와 대화 후 퇴사.

3개월 후 월 매출 150만 원, 6개월 후 시리즈 앤젤 투자 2억 원. 매일 아침 bm-builder로 오늘의 우선순위. *"드디어 시작했어."*

> **📘 Secondary Journey 1:** 첫 번째 탈락에서 배운 것, 퇴사 결정 과정, 타겟 구체화

---

#### Journey 2: 이서연 (29세, 예비 창업가) - "비즈니스 용어, 이제 이해해"

**Opening (30초):** 토요일 오후, *"이게 한국말이야?"* 하고 엑셀을 닫은 이서연. Dribbble에서 bm-builder 발견.

**Rising Action:** *"서연님, 디자이너시죠? Node 기반 UI라서 직관적이실 거예요. 근데 비즈니스 용어가 낯설면, 각 노드를 클릭하면 설명이 나와요."* 서연이 '고객 세그먼트' 노드 클릭. *"고객 세그먼트 = 누구에게 파는지. 서연님의 경우: '프리랜서 디자이너'가 타겟이네요."*

**Climax (1분):** 일요일 오후, AI 튜터링 1시간으로 용어 학습. 그 다음 2시간은 AI가 질문하고 서연이 답으며 비즈니스 모델 작성. *"서연님, 타겟 구체적으로: 월 수입 얼마인 사람?"* *"200만 원에서 500만 원 사이?"* *"좋아요. '초기 프리랜서 디자이너 (월 200-500만 원)'으로 구체화."* AI가 인포그래픽 생성.

**Resolution (30초):** 1주일 후 IR 자료 완성. AI가 *"문서 이해도 테스트"* 실행. *"서연님, TAM이 뭔가요?"* 서연이 정답. *"완벽해요!"*

3개월 후 정부지원사업 수주 (3,000만 원). 퇴사하고 "Seoyean Studio" 런칭. *"비즈니스는 AI가, 나는 디자인에만 집중."*

> **📘 Secondary Journey 2:** 비즈니스 용어 학습 곡선, 재무 안전망 (프리랜서 병행 5개월)

---

#### Journey 3: 김태현 (34세, Solopreneur) - "매일 밤 고민, 10분 만에 해결"

**Opening (30초):** 월요일 밤 11시 30분, *"기능 추가? 마케팅? SEO?"* 결정 패러리즘. 화요일 아침 첫 로그인.

**Rising Action:** *"태현님, 경쟁사 5개 분석 완료. '프리랜서'로 피벗하는 건 어떨까요? 오늘의 우선순위: '마케팅 채널 테스트'. 이게 맞을까요?"* *"응!"* 30분 고민을 10분으로 줄였습니다.

**Climax (1분):** 2주 후, AI가 제안. *"IR 자료 준비할 시간이네요. 2일이면 충분해요. 근데 먼저 '품질 테스트' 할까요? AI 심사위원이 미리 평가해드릴게요."*

AI가 시뮬레이션 실행. *"Q: 단위 경제는? A: CAC 3만 원, LTV 9만 원. Q: 10개월 후 DAU는? A: ...음, 모르겠는데요?"* *"태현님, '성장 전략' 부분 약해요. 제가 projections 계산해드릴게요: 현재 100명 × 월 20% × 10개월 = 614명."*

화요일: IR 자료 생성 (2시간). 수요일: 앤젤 투자자 10명에게 메일 발송.

**Resolution (30초):** 일주일 후, 7명 무응답, 2명 거절, 1명 미팅 확정 (회신율 10% - 정상). 거절 피드백 분석하고 재접. 한 달 후 두 번째 투자자와 미팅.

*"10개월 후 DAU 614명? 어떻게 나왔지?"* *"현재 100명에서 월 20% 성장이면요."* *"좋아요. 시드 투자 1억 원 제안."*

3개월 후 DAU 523명 달성. 투자금 입금 완료.

> **📘 Secondary Journey 3:** 거절과 재시도 (10명 중 1명 미팅), 투자자 미팅, DAU projections

---

#### Journey 4: 최민지 (33세, 초기 스타트업 창업자) - "팀과 함께 2일 만에 IR 자료"

**Opening (30초):** 화요일 오전 이사회에서 *"시리즈 A 준비 어떻게 되고 있어?"* 압박. 2주간 매일 밤 PPT로 IR 데크 작성. CTO가 보고 *"이거 우리 회사 자료랑 안 이어지는데."*

**Rising Action:** 목요일 첫 로그인. AI가 회사 자료 완벽하게 이해. *"민지님, LTV/CAC 1.5x네요. 투자자들은 3x 원해요. 리텐션 개선 시뮬레이션해볼까요? 리텐션 60% → 80%로 높이면 LTV 60만 원으로 증가."*

**Climax (1분):** 목요일 bm-builder로 IR 자료 생성 시작. 민지가 *"CTO랑 같이 작성하고 싶은데"* 하자, AI가 팀 협업 모드 제안.

**동시 편집 시나리오:**
- 민지: *"비즈니스 모델 작성 중..."* (파란색 커서 "민지")
- CTO: *"기술 아키텍처 작성 중..."* (빨간색 커서 "CTO")
- 둘이 동시에 같은 슬라이드 클릭 → AI: *"민지님이 먼저 편집하세요. CTO님은 잠시 기다려주세요."*

**@멘션:** 민지: *@CTO님, 단위 경계 CAC 30만 원 맞나요?* → CTO의 화면에 알림 → CTO: *@민지님, 맞아요. 근데 LTV는 48만 원으로 수정했어요.*

**활동 로그:** *[오후 2:30] 최민지: LTV 45만 원 → 48만 원 수정* → *[오후 2:31] CTO: 확인 완료*

**Resolution (30초):** 금요일 정부지원사업 지원서 작성. AI가 심사위원 기준별 세부 증빙 자료 안내.

- 기술성: 특허 출원 중, 논문 2편
- 사업성: 단위 경계 CAC 30만 원, LTV 48만 원
- 창업팀: 교육학 석사 + 컴퓨터공학 박사

3시간 만에 지원서 완성. 2주 후 **수주 성공** (55% 통과율). 한 달 후 IR 자료로 앤젤 투자자 5명 만남. 2명 투자 제안 (각 3억 원). Term Sheet 협상, Due Diligence, 투자금 입금.

> **📘 Secondary Journey 4:** 정부지원사업 구체성 (특허, 논문, 단위 경계), 투자유치 전체 (Term Sheet, DD)

---

#### Journey 5: 정진우 (38세, 액셀러레이터) - "팀들의 자가 진단, 시간 50% 절감"

**Opening (30초):** 월요일 오후 2시, Edutech A 팀 IR 자료 리뷰 (2시간). 화요일 오후 3시, Healthcare B 팀 (2시간). 시간 부족으로 모든 팀에 충분한 피드백 불가.

**Rising Action:** 어느 날, bm-builder 사용 팀들의 진행 속도가 빨라서 궁금. *"Edutech A 팀, 지난번보다 IR 자료 품질이 좋아졌는데?"* *"bm-builder 쓰기 시작했어요."*

**Climax (1분):** 정진우가 A/B 테스트 제안. 3개월 후 결과:

**bm-builder 사용 팀 (10개):**
- 평균 IR 자료 작성: **5일** (미사용 14일)
- 정부지원사업 통과율: **55%** (미사용 40%)
- 투자자 2차 미팅: **40%** (미사용 20%)
- 창업가 만족도: **4.7/5.0** (미사용 3.2/5.0)

**품질 유지 확인:** 사용 팀에게 피드백 요청. *"매니저 피드백의 질이 떨졌나요?"* *"아뇨, 오히려 더 좋아졌어요. bm-builder가 심사위원 기준으로 자가 진단해줘서, 매니저님은 전략적 질문만 해주셨거든요."*

**Resolution (30초):** 액셀러레이팅 웨비나에서 Edutech A 팀 데모. 30분 데모 후 성공 사례 공유.

*"우리 프로그램에서 bm-builder를 지원합니다. 관심 있으신 팀은 연락주세요."* (선택권 존중)

30팀 중 25팀 자발적 채택 (83%). 6개월 후 거부했던 5팀 중 3팀 전환.

> **📘 Secondary Journey 5:** A/B 테스트 상세 데이터, 성과 입증 리포트, 성공 사례 데모

---

#### Journey 6: 시스템 관리자 - "다양한 에러, 1개월 만에 오픈소스 전환"

**Opening (30초):** 새벽 2시 17분, PagerDuty 알람. 이번엔 Claude API 레이턴시 스파이크가 아닙니다.

**다양한 에러 타입:**
1. **Rate Limit:** 프리티어 사용자 48회 중 48회 사용 → GLM 4.7로 자동 전환
2. **OAuth 토큰 만료:** Google Drive 연동 만료 → 재인증 이메일 발송
3. **권한 문제:** Dropbox 폴더 접근 거부 → 권한 요청 안내
4. **스토리지 용량 초과:** 10GB 중 9.8GB 사용 → 용량 확장 안내

**사용자 투명 공지:** Slack 공지: *"🚨 장애 발생 (오후 2:15-2:20). 영향: 12명. 조치: 자동 복구 완료."*

**Climax (1분):** 관리자가 모니터링 비용 분석. Datadog 월 200만 원 vs 오픈소스 무료.

**오픈소스 전환 과정 (현실적 타임라인):**
- 1주차: Prometheus, Grafana 설치
- 2주차: 메트릭 정의, 대시보드 구성
- 3-4주차: 알림 튜닝, 안정화
- **총 1개월** 소요

**Resolution (30초):** 월 200만 원 절감. 단, 초기 설정 1개월 소요, 관리자 직접 운영 필요.

6개월 후 완전 자동화: 자동 모니터링 24/7, 자동 복구, 자동 알림 Slack, 자동 리포트 매주 월요일.

> **📘 Secondary Journey 6:** 각 에러 타입별 처리 상세, 오픈소스 운영 (메트릭 정의, 알림 튜닝)

---

#### Journey 7: 고객 지원팀 - "Contextual Help, 티켓 25% 감소"

**Opening (30초):** 월요일 아침 50통 티켓. FAQ 보냈지만 사용자들은 안 읽어.

**Contextual Help 도입:**
- 기존: "도움말" 버튼 → 전체 FAQ 페이지
- 새로운: 화면에 팝업 → *"문서 생성 에러. 다음 중 어떤 상황인가요? (a) 프리티어 제한, (b) 클라우드 연동 안 됨, (c) AI 호출 실패"*

결과: FAQ 순응률 20% → **45%**. 티켓 **25% 감소**.

**Climax (1분):** **AI 답변 품질 개선 (현실적 학습 곡선):**

사용자: *"문서 생성이 안 돼요."*

**AI 초안 v1:** *"구글 드라이브에서 권한 확인..."* (부정확, 사용자는 Dropbox)

CS 팀원 피드백: *"사용자가 Dropbox 쓰는데, 구글 드라이브라고 하네."*

**재학습 루프:**
- 1개월 차: 정확도 65% → 72%
- 3개월 차: 72% → 80%
- 6개월 차: 80% → 85%

**CS 팀원 역량 변화:**
- 기존: 단순 답변 80%, 문제 해결 20%
- 새로운: 단순 답변 30% (AI 자동화), 문제 해결 40%, **사용자 성공 코칭 30%**

**사용자 성공 코칭 예시:** CS 팀원: *"IR 자료 제출 전에 '품질 테스트' 기능 써보셨나요?"* 사용자: *"아, 그런 기능이 있나요? 5분이면 됩니다."*

**Resolution (30초):** 6개월 후 효율 3배 향상: 티켓당 처리 시간 10분→3분 (70% 감소), 사용자 만족도 4.2→4.7/5.0, CS 팀원 만족도 3.5→4.5/5.0.

> **📘 Secondary Journey 7:** AI 학습 루프 상세, 5가지 성공 코칭 시나리오

---

### Journey Requirements Summary

#### 1차 사용자 (Primary Users) 기능

**온보딩과 학습:**
- ✅ 개인화된 온보딩: 비전 이해 질문, 수입 시뮬레이션
- ✅ 인터랙티브 튜토리얼: 노드 클릭 시 용어 설명 (CAC, TAM, LTV)
- ✅ AI 튜터링: 비즈니스 용어 설명, 맞춤형 가이드
- ✅ 문서 이해도 테스트: AI 채팅 모드로 대화 형식 검증

**문서 생성과 품질:**
- ✅ 투자자 시뮬레이션: AI 심사위원이 미리 평가
- ✅ 정부지원사업 탈락 분석: 심사위원 피드백 분석, 재시도 전략
- ✅ 거절 관리: 투자자 거절 후 피드백 분석, 재접 전략

**팀 협업 (최민지):**
- ✅ 실시간 동시 편집: Figma 스타일 커서 표시 (파란색 "민지", 빨간색 "CTO")
- ✅ 충돌 해결: 동시 슬라이드 클릭 시 우선순위 질문
- ✅ @멘션 및 알림: 팀원 태그, 실시간 알림
- ✅ 활동 로그: 수정 내역 추적

**재무와 타이밍:**
- ✅ 퇴사 타이밍 시뮬레이터: 수입 모델 분석, 정부지원사업 타당성
- ✅ 타임라인 플래너: 퇴사 전 정부지원사업 수주 계획

**투자유치:**
- ✅ Term Sheet 협상 도우미: Valuation, Vesting 전략
- ✅ Due Diligence 준비: 법적, 재무, 기술 자료

#### 2차 사용자 (Secondary Users) 기능

**정진우 (액셀러레이터):**
- ✅ 관리자 대시보드: 팀별 Node 그래프로 진행 상황 파악
- ✅ A/B 테스트 도구: 사용 팀 vs 미사용 팀 비교
- ✅ 성과 분석 리포트: 효과 입증 데이터
- ✅ 성공 사례 데모: 30분 데모 영상

**시스템 관리자:**
- ✅ 다양한 에러 처리: Rate Limit, OAuth, 권한, 용량
- ✅ 자동 복구: GLM 4.7 백업, 재인증 이메일, 권한 안내
- ✅ 투명한 장애 알림: 사용자에게 Slack 공지
- ✅ 오픈소스 모니터링: Prometheus, Grafana

**고객 지원팀:**
- ✅ Contextual Help: 화면별 팝업으로 관련 FAQ 표시
- ✅ AI 답변 피드백: CS 팀원 평가, AI 재학습 (3개월 65%→80%)
- ✅ 사용자 성공 코칭: 단순 답변에서 성공 코칭으로 확장

#### 기술적 세부사항 (구현 명세)

**1. 동시 편집 UI:**
```javascript
// Figma 스타일 커서 표시
cursors: {
  "minji": { color: "blue", x: 100, y: 200, label: "민지" },
  "cto": { color: "red", x: 300, y: 400, label: "CTO" }
}
typing: ["민지"]  // typing 중일 때 하단 알림
```

**2. 문서 이해도 테스트:**
```javascript
// AI 채팅 모드
chat: {
  ai: "민지님, TAM이 뭔가요?",
  user: "총 가능 시장?",
  ai: "정확합니다! 다음 질문: LTV/CAC는?"
}
```

**3. Contextual Help:**
```javascript
// 화면별 FAQ 매핑
faq_mapping: {
  "doc_gen": [1, 5, 9],    // 문서 생성 화면
  "team_invite": [2, 6, 10] // 팀 초대 화면
}
```

## Web App Specific Requirements

### Web App Overview

bm-builder는 **React 기반 SPA (Single Page Application)**으로, Node 기반 시각적 워크플로우를 제공하는 SaaS 플랫폼입니다. 예비 창업자부터 초기 스타트업 창업자까지 다양한 사용자가 접근하므로, **Modern Browsers 지원**과 **Mobile First 반응형 디자인**이 필수적입니다.

### Technical Architecture Considerations

#### 1. Frontend Architecture (React SPA)

**Tech Stack:**
- React 18+ (Vite)
- React Flow (Node UI)
- React Router v6+ (Routing)
- Zustand (State Management)
- TanStack Query (Data Fetching)

**Component Architecture:**
- Atomic Design: Atoms → Molecules → Organisms → Templates → Pages
- Feature-based Folder Structure:
  ```
  /src
    /features
      /onboarding
      /document-generation
      /team-collaboration
      /analytics
    /shared
      /components
      /hooks
      /utils
  ```

**Code Splitting Strategy (Party Mode 강화):**
- `/`: Landing (50KB)
- `/dashboard`: Dashboard (80KB)
- `/editor`: Node UI (150KB, lazy load)
- `/onboarding`: Onboarding (60KB)
- **Total Initial Bundle: 300KB** (완화된 목표, gzip 압축)

#### 2. Backend Architecture (Node.js API)

**API Design:**
- REST API (Express.js)
- WebSocket (Socket.io) - 실시간 협업
- GraphQL (Apollo Server) - 선택적 (팀 협업 복잡한 쿼리)

**API Endpoints:**
- `POST /api/documents/generate` - AI 문서 생성 (스트리밍 응답)
- `GET /api/documents/:id` - 문서 조회
- `PUT /api/documents/:id` - 문서 수정
- `DELETE /api/documents/:id` - 문서 삭제
- `POST /api/cloud/sync` - 클라우드 연동
- `WS /api/collaborate` - 실시간 협업

#### 3. Real-time Features

**WebSocket Use Cases:**
1. **Document Collaboration:**
   - 동시 편집 커서 위치 (Figma 스타일)
   - @멘션 알림
   - 활동 로그
2. **AI Generation:**
   - 실시간 생성 진행률 (단계별 프로그레스 바)
   - 스트리밍 응답 (SSE 대안)
3. **Team Updates:**
   - 팀원 온라인 상태
   - 문서 수정 알림

**WebSocket Fallback Strategy (Party Mode 강화):**
1. **WebSocket (Socket.io):** Chrome, Edge, Firefox 최신 버전 (Primary)
2. **Server-Sent Events (SSE):** Safari (WebSocket 연결이 불안정할 때)
3. **Long Polling:** 최후의 수단 (구형 브라우저)

**Connection Recovery:**
- 연결 끊김 시 Local Storage 임시 저장
- 자동 재연결 (Exponential Backoff)
- 오프라인 큐 (재연결 시 일괄 전송)

### Browser Matrix (브라우저 지원 매트릭스)

| 브라우저 | 최소 버전 | 우선순위 | 제한 사항 | Fallback |
|----------|-----------|----------|-----------|----------|
| Chrome | 100+ | P0 (필수) | - | - |
| Edge | 100+ | P0 (필수) | - | - |
| Firefox | 100+ | P1 (권장) | React Flow 성능 저하 가능 | 리스트 뷰 |
| Safari | 15+ | P1 (권장) | WebGL 지원 확인 | SSE |
| **iPadOS** | **15+** | **P1 (Party Mode 추가)** | **Node UI 완전 지원** | - |
| Mobile Safari | 15+ | P2 (지원) | Node UI 터치 최적화 | 폼 기반 |
| Chrome Mobile | 100+ | P2 (지원) | 반응형 UI 필수 | 폼 기반 |

**지원 전략:**
- Progressive Enhancement: 기능 브라우저에서 완전 기능, 구형 브라우저에서 핵심 기능
- WebGL Fallback: 미지원 시 **카드 스타일 리스트 뷰** 자동 전환
- Browser Policy: Last 2 versions, Market share > 1%

### Responsive Design (반응형 디자인)

**Breakpoints:**
- Mobile: < 640px (iPhone SE, Samsung Galaxy)
- **Tablet: 640px - 1024px (iPad, Surface) - Party Mode 강화**
- Desktop: > 1024px (Laptop, Monitor)
- Ultrawide: > 1440px (Node UI 무한 캔버스 최적화)

**Responsive Strategy:**
1. **Mobile First:** 모바일 UX를 기본으로 설계
2. **Node UI Adaption:**
   - **Mobile:** 폼 기반 입력 → 결과만 표시 (노드 편집 불가)
   - **Tablet:** 축소된 노드 그래프 (줌인/줌아웃, 터치 최적화)
   - **Desktop:** 완전한 Node UI + 인피니티 캔버스
3. **Touch Targets:** 최소 44×44px (iOS Human Interface Guidelines)
4. **Typography:** 16px 기본 (Mobile: 14px-18px, Desktop: 16px-20px)

**Component Responsiveness:**
- **온보딩:**
  - Mobile: 1단계 심플 버전 (이름, 비전, 1개 질문)
  - Desktop: 3단계 사이드바
- **문서 생성:**
  - Mobile: 하단 시트 (Bottom Sheet)
  - Desktop: 모달
  - AI 생성: 모든 화면에서 프로그레스 바 (단계별 진행률)
- **팀 협업:**
  - Mobile: 푸시 알림
  - Desktop: 실시간 커서

**Tablet UI (Party Mode 강화):**
- iPad Pro: Node UI 완전 지원 (M1 칩 WebGL 성능 충분)
- iPad: 축소된 노드 그래프 (줌 기본)
- 터치 타겟: 44×44px 이상
- Magic Keyboard 지원 (키보드 내비게이션)

### Performance Targets (성능 목표)

**Core Web Vitals (Google Standards):**
- LCP (Largest Contentful Paint): < 2.5초
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1

**Custom Targets:**
- **Initial Load: < 3초** (프리티어, 4G 네트워크)
- **Node Rendering: < 100ms** (노드 드래그, 연결)
- **AI Generation:**
  - 단문: < 30초
  - 장문 + 인포그래픽: < 2분
  - **프로그레스 바: 단계별 진행률 표시** (Party Mode 강화)
- **WebSocket Latency: < 50ms** (실시간 협업)

**Optimization Strategy:**
1. **Code Splitting:** React.lazy(), Suspense
2. **Asset Optimization:** Vite 최적화, 이미지 WebP
3. **Caching:** Service Worker (PWA), CDN (Vercel)
4. **AI Response Streaming:** 단계별 진행률 (SSE 대안)
5. **RAG Query Optimization:** Vector 인덱스, 캐싱

**Performance Budget (Party Mode 완화):**
- **Initial Bundle: 300KB** (gzipped) - 200KB에서 완화
- Each Route: < 100KB (gzipped)
- Total Page Weight: < 2MB (images 포함)

### SEO Strategy (SEO 전략)

**Priority: Low (SaaS 플랫폼)**

**Marketing Pages (Public):**
- Landing Page: 정적 생성 (Vercel)
- Blog: 정적 생성 (MDX)
- Pricing: SSR (Search Console)

**App Pages (Private - No Index):**
- Dashboard: `noindex` (로그인 필요)
- Document Editor: `noindex`
- Team Workspace: `noindex`

**SEO Checklist:**
- Meta Tags: Title, Description, Open Graph
- Structured Data: Schema.org (Organization, WebApplication)
- Sitemap: 자동 생성 (Vercel)
- Robots.txt: Disallow /app, /dashboard

**Content Strategy:**
- "정부지원사업 따는 법" 블로그 시리즈
- "창업가를 위한 AI" 가이드
- 성공 사례 케이스 스터디

### Accessibility Level (접근성 수준)

**Target: WCAG 2.1 AA (준준수)**

**Perceivable (인지 가능):**
1. **Color Contrast:**
   - Normal Text: 4.5:1 이상
   - Large Text: 3:1 이상 (18pt+)
   - UI Components: 3:1 이상
2. **Alternative Text:**
   - 인포그래픽: AI 생성 alt 텍스트
   - Node 아이콘: aria-label
3. **Captions:** 데모 비디오에 자막 제공

**Operable (조작 가능):**
1. **Keyboard Navigation:**
   - Tab: 노드 이동
   - Enter/Space: 노드 선택
   - Escape: 모달 닫기
   - Arrow Keys: 노드 내 이동
2. **Focus Visible:** 명확한 포커스 표시 (outline: 2px solid blue)
3. **No Seizure Triggers:** 깜빡이는 효과 없음 (3회/초 미만)

**Understandable (이해 가능):**
1. **Language:** 한국어 기본 (lang="ko")
2. **Error Prevention:** 온보딩에서 취소 가능
3. **Error Identification:** 명확한 에러 메시지
   - **Party Mode 강화:** 감정적 에러 메시지
     - *"오류가 발생했습니다"* → *"준혁님, 구글 드라이브 연결이 끊겼어요. 다시 연결할까요?"*
     - *"잠시만 기다려주세요"* → *"준혁님의 비즈니스 모델을 분석 중이에요... 30초 남았어요"*

**Robust (견고함):**
1. **ARIA Attributes:** Role, Label, Describedby
2. **Screen Reader:** NVDA (Windows), VoiceOver (macOS/iOS)
   - **Party Mode 강화:** ARIA Live Region으로 AI 생성 진행률 announcements
3. **Zoom:** 200% 확대에서도 기능 유지

**Accessibility Testing:**
- Automated: axe-core, Lighthouse
- Manual: Keyboard-only navigation
- User Testing: 시각 장애인 피드백

### Dark Mode (Party Mode 추가)

**구현 방식:**
- 시스템 설정 자동 감지 (`prefers-color-scheme: dark`)
- 수동 토글 버튼 (헤더)
- 사용자 설정 Local Storage 저장

**색상 대비:**
- Light Mode: 4.5:1 이상
- Dark Mode: 4.5:1 이상 (어두운 배경에서도)

**사용 시나리오:**
- 밤늦게 작업하는 창업자 (야근 후 지하실)
- 장시간 작업 시 눈의 피로 감소

### Emotional UX (Party Mode 추가)

**1. AI 생성 진행률 (프로그레스 바):**
```
Step 1/3: 문서 구조 생성... ✓
Step 2/3: 비즈니스 모델 작성 중... (30초 남았어요)
Step 3/4: 인포그래픽 생성 대기 중...
```

**2. 성공 피드백:**
- 문서 완성 시 **Confetti 애니메이션**
- *"🎉 드디어 시작했어요! 50분 만에 첫 번째 가설 문서를 완성했어요."*
- 온보딩 단계 완료 시 *"Step 1/3 완료! 훌륭해요, 준혁님!"*

**3. Mobile UX 제한 투명 공지:**
- *"노드 UI로 자유롭게 편집하세요! 데스크톱에서 열어보세요"*
- 모바일에서는 "폼 기반 입력"만 제공, 결과만 표시

### Implementation Considerations

#### Phase 1: MVP (3개월)

**Browser Support:**
- Chrome/Edge 100+ (P0)
- Firefox 100+ (P1)
- Safari 15+ (P1, known issues 허용)
- **iPadOS 15+ (P1, Party Mode 추가)**

**Performance:**
- Initial Load: < 5초 (완화된 목표)
- Node Rendering: < 200ms
- AI Generation: < 2분
- **프로그레스 바: 기본 단계별 진행률**

**Accessibility:**
- WCAG 2.1 A (최소 수준)
- 키보드 내비게이션: 기본 기능만
- 색상 대비: 4.5:1
- **Dark Mode: 시스템 설정 자동 감지 (Party Mode 추가)**

**Mobile:**
- 폼 기반 입력 + 결과 표시
- Node UI 미지원 (데스크톱 권유)

#### Phase 2: Growth (6개월)

**Browser Support:**
- 모든 P0, P1 브라우저 완전 지원
- **iPad에서 Node UI 완전 지원 (Party Mode 추가)**
- Mobile Safari 최적화

**Performance:**
- Initial Load: < 3초
- Node Rendering: < 100ms
- Code Splitting 구현 (라우트별 구체화)

**Accessibility:**
- WCAG 2.1 AA
- 스크린 리더 테스트
- 키보드 전체 기능 지원
- **감정적 에러 메시지 (Party Mode 추가)**
- **Confetti 애니메이션 (Party Mode 추가)**

#### Phase 3: Scale (12개월+)

**Browser Support:**
- P2 브라우저 지원 (Mobile, Legacy)
- Custom Polyfills

**Performance:**
- Core Web Vitals 달성
- PWA 완전 구현

**Accessibility:**
- WCAG 2.1 AAA (목표)
- 자동화된 접근성 테스트
- 정기 접근성 감사
- **ARIA Live Region (Party Mode 추가)**

---

## Project Scoping & Phased Development

### MVP Strategy & Philosophy

**MVP Approach:** **Experience MVP** (경험 중심)

**핵심 철학:**
- 사용자가 *"이건 쓸만하다!"*라고 느끼는 **"Aha! Moment"** 조기 경험
- 4가지 사용자 타겟의 핵심 경험을 모두 전달
- **AI Co-founder 경험**을 MVP 단계에서 보여주기

**Resource Requirements:**
- **팀:** 2명 (기술 1, 비즈니스 1) + 프리랜서 1명 (AI, 파트타임)
- **기간:** 3개월
- **예산:** Bootstrapping + 정부지원사업 수주

**Project Scope Classification:** **Medium Scope**
- 기술적 복잡도: 중간 (React SPA, RAG, AI 통합)
- 사용자 다양성: 4가지 타겟 (예비 창업가, Solopreneur, 초기 창업가, 액셀러레이터)
- 혁신 요소: 13가지 혁신 포인트 (다수는 MVP 이후 구현)

### MVP Feature Set (Phase 1 - 3개월)

#### Core User Journeys Supported

**✅ Fully Supported (MVP):**

**1. 박준혁 (예비 창업가) - "50분 만에 드디어 시작"**
- 온보딩: 개인화된 질문 3개 (비전, 타겟, 현재 상황)
- 첫 번째 가설 문서 생성 (린스타트업 4단계)
- 정부지원사업 지원서 작성 (5개 양식)
- **축약:** 탈락 분석 제외 (Post-MVP)

**2. 최민지 (초기 스타트업 창업자) - "팀과 함께 2일 만에 IR 자료"**
- 회사 문서 임베딩: Google Drive 연동
- 팀 협업: 최대 3명, 기본 권한 (Owner, Editor, Viewer)
- 실시간 동시 편집: Polling (5초 간격, WebSocket은 Post-MVP)
- 정부지원사업 지원서 작성 (심사위원 기준 안내)

**🟡 Partially Supported (MVP):**

**3. 이서연 (예비 창업가) - "비즈니스 용어, 이제 이해해"**
- 온보딩: 단순화
- Node UI: 직관적 (그러나 용어 설명 수동 → FAQ 제공)
- 문서 생성: 가능
- **축약:** AI 튜터링 제외

**4. 김태현 (Solopreneur) - "매일 밤 고민, 10분 만에 해결"**
- 문서 생성: 가능
- 우선순위 제안: 수동으로
- **축약:** 우선순위 자동 제안 제외

**❌ Not Supported (Post-MVP):**

**5. 정진우 (액셀러레이터) - "팀들의 자가 진단, 시간 50% 절감"**
- **축약:** 관리자 대시보드 제외
- 대안: Google Sheets로 팀 진행 상황 추천

#### Must-Have Capabilities (MVP)

**1. 온보딩 (Onboarding)**
- **3단계 질문:**
  1. 비전: *"당신의 비전은 무엇인가요?"*
  2. 타겟: *"누구에게 가치를 제공하나요?"*
  3. 현재 상황: *"현재 어떤 단계인가요?"* (예비 창업 / 초기 창업 / 성장)
- **개인화된 첫 화면:** *"준혁님, 반갑습니다! 당신의 구글 드라이브를 스캔했어요..."*
- **가이드 투어:** Node UI 기본 사용법 (1분)

**2. Node 기반 시각적 워크플로우 (린스타트업 4단계)**
```
노드 1: 문제 발견 → 노드 2: 고객 인터뷰 → 노드 3: 가설 수립 → 노드 4: 가설 검증
```

**Node UI 기본 기능:**
- 노드 생성: "+" 버튼 클릭
- 노드 편집: 더블 클릭
- 노드 연결: 드래그앤드롭
- 노드 삭제: 선택 후 Delete 키
- 줌인/줌아웃: 마우스 휠
- 무한 캔버스: 패닝 (드래그)

**3. AI 문서 생성 (정부지원사업 5개 + IR 자료)**

**정부지원사업 5개 양식:**

**1. 예비창업 패키지 (RISA)**
- 사업계획서 (5장)
- 요약서 (1장)
- 예산서 (1장)
- 타당성 검토 보고서 (3장)

**2. 초기창업 패키지 (K-Startup)**
- 사업계획서 (10장)
- 요약서 (2장)
- 재무제표 (3장)
- 제품 설명자료 (5장)
- 인포그래픽 (3개)

**3. R&D 자금지원 (과제기획서)**
- 연구개발계획서 (15장)
- 요약서 (2장)
- 연구비 내역서 (3장)
- 기술성 평가 자료 (5장)
- 인포그래픽 (5개)

**4. 성장 지원 (스케일업)**
- 성장계획서 (10장)
- 요약서 (2장)
- 재무프로젝션 (5장)
- 시장 분석 (5장)
- 인포그래픽 (3개)

**5. 특화 분야 (예: AI/데이터)**
- 특화 기획서 (10장)
- 요약서 (2장)
- 기술 설명 자료 (5장)
- 인증/특허 계획 (2장)
- 인포그래픽 (3개)

**IR 자료 (투자유치):**
- 피칭 데크 (10-15장)
- 1-pager (1장)
- 비즈니스 모델 캔버스 (1장)
- 인포그래픽 (3개)

**AI 생성 프로세스:**
1. 사용자가 노드 선택
2. AI가 질문: *"준혁님, 이 노드에 대해 알려주세요"*
3. 사용자 입력 (또는 문서 임베딩에서 참조)
4. AI가 문서 생성 (단계별 프로그레스 바)
5. 생성 완료: Confetti 애니메이션 *"🎉 드디어 시작했어요!"*

**4. 문서 임베딩 (RAG)**
- Google Drive 연동만
- 지원 파일: PDF, HWP, DOCX
- 임베딩 전 미리 보기
- 자동 문서 분류 (비즈니스 문서 vs 무시)

**5. 팀 협업 (최대 3명)**
- 권한: Owner, Editor, Viewer
- 팀 초대: 이메일 링크
- 동시 편집: **Polling (5초 간격)** - WebSocket은 Post-MVP
- 충돌 해결: "마지막 저장 우선"
- 활동 로그: *"민지님이 LTV를 45만 원 → 48만 원 수정했어요"*

**6. 클라우드 연동 (Google Drive)**
- OAuth 2.0 인증
- 파일 스캔: 최초 1회 + 변경 감지
- 권한 요청: 읽기 전용

**7. Dark Mode**
- 시스템 설정 자동 감지 (`prefers-color-scheme`)
- 수동 토글 버튼

**8. 감정적 UX (Emotional UX)**
- AI 생성 진행률 (단계별 프로그레스 바)
- 성공 시 Confetti 애니메이션
- 감정적 에러 메시지: *"준혁님, 구글 드라이브 연결이 끊겼어요. 다시 연결할까요?"*
- 온보딩 단계 완료 시 *"Step 1/3 완료! 훌륭해요, 준혁님!"*

### Post-MVP Features

#### Phase 2 (6개월) - Growth

**추가 정부지원사업 양식:**
- 총 **50+ 템플릿** (지방자치단체, 공공기관 포함)

**향상된 기능:**
- 린스타트업 **7단계 완성** (현재 4단계 → 7단계)
- **AI 피드백 루프** (사용자 행동 학습)
- **우선순위 자동 제안** (현재 수동 → 자동)
- **투자자 시뮬레이션** (AI 심사위원)
- **AI 튜터링** (비즈니스 용어 설명)
- **WebSocket 실시간 협업** (현재 Polling → Figma 스타일 커서)
- **탈락 분석** (정부지원사업 심사 기준)
- **거절 관리** (투자자 피드백 분석)

**새로운 사용자 타겟:**
- 액셀러레이터: **관리자 대시보드**

**성공 지표:**
- WAU: 500명 (MVP 100명 → 5배 성장)
- 정부지원사업 수주: 5건
- Retention: 40% (2주차)

#### Phase 3 (12개월+) - Scale

**플랫폼화:**
- **정부지원사업 포털 API 연동** (원클릭 제출)
- **시장 데이터 자동 연동** (경쟁사 분석, 트렌드)
- **AI 공동 창업자** (자율 실행 에이전트)
- **Multi-language** (일본어, 영어)
- **글로벌 확장** (일본, 동남아)

**성공 지표:**
- WAU: 2,000명
- 정부지원사업 수주: 20건
- 투자유치 성공 (Seed)

### Risk Mitigation Strategy

#### Technical Risks (기술적 리스크)

**리스크 1: AI 문서 생성 품질**
- **문제:** 사용자가 *"제출 가능한 품질"*이라고 느끼지 못함
- **완화:**
  - MVP: 인간 전문가 리뷰 (하이브리드)
  - Week 1: 베타 테스터 10명으로 품질 검증
  - Week 2: 품질이 4.0/5.0 미만이면 프롬프트 튜닝
- **결정적 질문 (Decision Gates):**
  - *"Week 3에 10명 중 5명도 '제출 가능'이라고 하지 않으면?"* → 즉시 프롬프트 재작성

**리스크 2: Node UI 성능**
- **문제:** 노드 10개 이상에서 렌더링 느림
- **완화:**
  - MVP: 가상화 (react-window)
  - 노드 50개까지 제한 (Post-MVP 확장)

**리스크 3: RAG 정확도**
- **문제:** 문서 임베딩이 정확하지 않음
- **완화:**
  - MVP: 사용자가 수동으로 문서 선택
  - Post-MVP: 자동 추천 (AI 학습)

#### Market Risks (시장적 리스크)

**리스크 1: ChatGPT/Claude 경쟁**
- **문제:** 사용자가 *"그냥 ChatGPT 쓰면 되는데?"*
- **완화:**
  - **"정부지원사업 특화의 깊이"**로 차별화
  - 5개 양식은 ChatGPT가 가지고 있지 않음 (한국 시장 특화)
  - **One Thing:** *"ChatGPT는 답변해주지만, bm-builder는 창업을 지속하게 해줘"*

**리스크 2: 채택 장벽**
- **문제:** 온보딩 탈락률 60%+
- **완화:**
  - 가이드 투어 (1분)
  - 데모 모드 (저장 불가, 무제한 체험)
  - Contextual Help (화면별 FAQ)

**리스크 3: 수익화 실패**
- **문제:** 프리미엄 전환율 3% 미만
- **완화:**
  - Month 3: freemium → 베타 유료 (50회 제한)
  - Month 6: 유료 전환율 10% 목표
  - Month 9: 기업 라이선스 (B2B)

#### Resource Risks (자원 리스크)

**리스크 1: 개발 속도 지연**
- **문제:** 3개월 MVP → 6개월
- **완화:**
  - MVP 범위 축소: 정부지원사업 **3개만** (나머지 2개는 Post-MVP)
  - No-code/Low-code 도구 활용 (Supabase, Vercel)
  - Node UI: React Flow 커스터마이징 최소화

**리스크 2: 팀 규모**
- **문제:** 2명 창업자로 부족
- **완화:**
  - **최소 팀:** 기술 1명 + 비즈니스 1명
  - 프리랜서: AI 엔지니어 1명 (파트타임)
  - 액셀러레이팅 프로그램 활용 (매니저 1명)

**리스크 3: 자금 고갈**
- **문제:** 6개월 전에 투자 유치 실패
- **완화:**
  - Bootstrapping: 3개월 MVP
  - 정부지원사업 수주로 자금 확보 (1개월 목표)
  - Pre-seed: 사용자 100명 달성 후 투자 유치

---

## Innovation & Novel Patterns

### 혁신 정의: "창업가의 생존 필수 도구"

**Before (Problem):**
- ChatGPT로 3시간 질문하고 포기
- 혼자 모든 결정 내려야 하는 고립감
- 문서 작성에 수백 시간 소진
- 전문성 부족으로 탈락

**After (Solution):**
- bm-builder로 50분 만에 첫 번째 가설 문서
- AI가 능동적으로 제안하는 동료 경험
- 제출 가능한 품질의 문서 자동 생성
- 전문가급 문서로 수주 성공

**Core Value Proposition:**
"ChatGPT는 답변해주지만, bm-builder는 창업을 지속하게 해줘"

### 13가지 혁신 포인트

#### 1. AI Co-founder Paradigm (능동적 파트너)
- 단순 질문/답변이 아닌 능동적 제안
- "이 방향이 맞을까?"라고 함께 고민
- 컨텍스트 인지형 대화 (현재 작업 노드 이해)

#### 2. Node UI + 정부지원사업 특화 조합
- 경쟁사: Node UI만 있거나 정부지원사업만 있음
- 우리: 둘 다 완벽하게 지원
- 직관적 시각화 + 깊이 있는 도메인 전문성

#### 3. 문서 임베딩의 깊이 (RAG)
- 단순 참고가 아니라 기존 문서를 "녹여내기"
- 사용자/회사의 고유한 지식을 결과물에 반영
- "우리 회사만의 맞춤형 자료" 자동 생성

#### 4. 멀티모달 AI (텍스트 + 인포그래픽)
- 경쟁사 AI: 주로 텍스트만 생성
- 우리: 나노 바나나 수준의 전문가급 차트/그래프
- 논문 수준 시각 자료 자동 생성

#### 5. 한국 시장 특화
- 정부지원사업, IR 자료에 대한 깊은 이해
- 한국어 완벽 지원
- 한국 스타트업 생태계에 최적화

#### 6. Super Platform (정부지원사업 포털 API 연동)
- 정부지원사업 포털과 API 연동
- 원클릭 제출로 Zero-Friction 경험
- 지원사업 발표 일정 자동 동기화

#### 7. Zero-Friction Onboarding (원클릭 시작)
- 구글 드라이브 연동으로 기존 문서 자동 스캔
- 첫 로그인부터 개인화된 제안
- "준혁님, 당신의 Todo 앱 개발 6개월... 발견했어요"

#### 8. GitHub Copilot 패턴 적응 (실시간 AI 제안)
- 사용자가 노드를 클릭하면 AI가 실시간 제안
- "이 노드를 확장하면 어떨까요?"
- 수동적 질문 없이 능동적 가이드

#### 9. 상황 인식형 AI (Context-Aware)
- 현재 진행 상황에 맞는 제안
- 3개월 차: 투자유치 준비 제안
- 6개월 차: 정부지원사업 타겟팅
- 12개월 차: 확장 전략 제안

#### 10. Mutual Learning (AI ↔ 사용자 상호 학습)
- AI가 사용자 스타일 학습
- 사용자는 AI와 대화하며 비즈니스 학습
- 상호 발전하는 지적 파트너십

#### 11. 결정적 질문 프레임워크 (Decision Gates)
- 각 Phase별 성공/실패 기준 정의
- "Month 3에 10명도 수주 못 하면 → 즉시 튜닝"
- "Month 6에 retention 30% 미만이면 → 피벗 고려"

#### 12. Human-in-the-Loop 전략적 활용
- Month 1-2: 인간 전문가와 AI 하이브리드
- Month 3 이후: AI 자동화 (품질 검증 후)
- 단계적 자동화로 품질 보장

#### 13. 네트워크 효과 설계
- 초기 100명 → 1,000명 → 10,000명
- 데이터가 많을수록 RAG 품질 향상 (Quality ∝ √Users)
- 성공 사례가 쌓일수록 신규 유저 성공 확률 증가

### 단계적 혁신 로드맵 (Phased Rollout)

#### Phase 1: Coach (MVP, 0-3개월)
**포지션:** "능동적인 코치"
- 사용자가 질문하면 답변
- 가끔 제안: "이것도 고려해보세요"
- 기본 기능: 문서 생성, Node UI, RAG

#### Phase 2: Co-founder (6개월)
**포지션:** "공동 창업자"
- 능동적 제안: "이 방향으로 가는 게 어떨까요?"
- 함께 고민: "이 타이밍에 퇴사하면 위험해요"
- 진단: "이 문서는 심사위관 점수가 낮을 거예요"

#### Phase 3: Autonomous Agent (12개월+)
**포지션:** "자율 실행 에이전트"
- 사용자 승인만 있으면 자동 실행
- 시장 데이터 자동 수집 및 분석
- 경쟁사 동향 자동 모니터링

### Before/After 메트릭스 (증거 기반 혁신 입증)

**Before (ChatGPT만 사용):**
- 문서 작성 시간: 8시간
- 첫 번째 수주 성공률: 20%
- 사용자 만족도: 3.2/5.0
- 지속성: 3개월 후 60% 탈락

**After (bm-builder 사용):**
- 문서 작성 시간: 1시간 (87% 절감)
- 첫 번째 수주 성공률: 55% (2.75배 향상)
- 사용자 만족도: 4.7/5.0
- 지속성: 3개월 후 80% 리텐션

### Emotional Narrative (감정적 혁신)

**Before:**
"ChatGPT가 답변은 주는데... 이게 맞는지 모르겠어. 혼자 결정해야 하는 게 무서워. 3시간 질문하다 포기."

**After:**
"드디어 시작했다!'라는 감동. AI가 나를 이해하고 함께 만들어갔어. 50분 만에 첫 번째 가설. 2주 후 첫 수주. '혼자가 아니야'라는 안심."

### Validation Strategy (혁신 검증 전략)

#### 1. Beta Tester 증언
- 100명 베타 테스터 모집
- 성공 사례 인터뷰 (비디오)
- "이거 없이 창업 못 해요"라는 입소문

#### 2. Before/After 메트릭스
- A/B 테스트: ChatGPT만 사용 vs bm-builder 사용
- 문서 작성 시간, 수주 성공률, 만족도 비교
- 통계적 유의성 검증

#### 3. Market Traction
- 월간 활성 사용자 10,000명 (12개월 목표)
- 정부지원사업 수주 100건/월
- 바이럴 계수 > 1.0

### Risk Mitigation for Innovation

#### 1. ChatGPT/Claude 경쟁
- **완화:** "정부지원사업 특화"라는 깊이로 차별화
- 한국 시장 데이터 독점 (사용자가 많을수록 RAG 품질 향상)
- 네트워크 효과: 커뮤니티 + 성공 사례

#### 2. AI 품질 리스크
- **완화:** Human-in-the-loop (Month 1-2)
- 사용자 피드백 루프 (매주 개선)
- 전문가 리뷰 시스템

#### 3. 채택 장벽
- **완화:** 온보딩 A/B 테스트
- Contextual Help (화면별 FAQ)
- Demo 모드 (저장 불가, 무제한 체험)

#### 4. 비즈니스 모델
- **완화:** Month 3에 freemium → 베타 유료 전환
- Month 6에 유료 전환율 10% 목표
- Month 9에 기업 라이선스 (B2B)로 수익 다각화

### Innovation Summary

**One Thing:**
"bm-builder는 창업가의 생존 필수 도구다. ChatGPT는 답변해주지만, bm-builder는 창업을 지속하게 해준다."

**Key Differentiators:**
1. 정부지원사업 특화의 깊이 (Domain Expertise)
2. 능동적 AI Co-founder 경험 (Active Partnership)
3. 네트워크 효과로 강화되는 플랫폼 (Network Effects)

**Success Metric:**
"bm-builder 없이 지원서 쓰는 건 미친 짊"이라는 입소문

---

## Functional Requirements

### 1. User Onboarding & Personalization (사용자 온보딩 및 개인화)

- **FR1:** 사용자는 온보딩 질문 3개에 답변하여 개인화된 경험을 설정할 수 있다 (비전, 타겟, 현재 상황)
- **FR2:** 사용자는 첫 로그인 시 개인화된 환영 메시지와 클라우드 스캔 결과를 확인할 수 있다
- **FR3:** 사용자는 Node UI 기본 사용법을 배우기 위한 1분 가이드 투어를 완료할 수 있다
- **FR4:** 시스템은 사용자의 온보딩 응답을 기반으로 맞춤형 제안을 제공할 수 있다
- **FR5:** 사용자는 온보딩 단계별 완료 시 긍정적인 피드백 메시지를 받을 수 있다

### 2. Visual Workflow Management (시각적 워크플로우 관리)

- **FR6:** 사용자는 노드 기반 캔버스에서 린스타트업 4단계 프로세스를 시각화할 수 있다 (문제 발견 → 고객 인터뷰 → 가설 수립 → 가설 검증)
- **FR7:** 사용자는 노드를 생성, 편집, 연결, 삭제할 수 있다
- **FR8:** 사용자는 무한 캔버스에서 패닝, 줌인/줌아웃을 통해 노드를 탐색할 수 있다
- **FR9:** 사용자는 노드 간 연결을 드래그앤드롭으로 생성하고 수정할 수 있다
- **FR10:** 사용자는 노드를 더블 클릭하여 편집 모드로 진입할 수 있다

### 3. AI Document Generation (AI 문서 생성)

- **FR11:** 사용자는 AI에게 질문을 받고 답변하여 문서를 생성할 수 있다
- **FR12:** 사용자는 정부지원사업 5개 양식 중 하나를 선택하여 문서를 생성할 수 있다 (예비창업, 초기창업, R&D, 성장, 특화)
- **FR13:** 사용자는 IR 자료 (피칭 데크, 1-pager, 비즈니스 모델 캔버스, 인포그래픽)를 생성할 수 있다
- **FR14:** 사용자는 문서 생성 진행률을 단계별 프로그레스 바로 확인할 수 있다
- **FR15:** 사용자는 문서 생성 완료 시 성공을 축하하는 애니메이션을 경험할 수 있다
- **FR16:** 시스템은 사용자의 입력 또는 임베딩된 문서를 참조하여 맞춤형 문서를 생성할 수 있다

### 4. Document Embedding & Context Management (문서 임베딩 및 컨텍스트 관리)

- **FR17:** 사용자는 Google Drive를 연동하여 기존 문서를 임베딩할 수 있다
- **FR18:** 사용자는 임베딩된 문서를 미리 보고 검증할 수 있다
- **FR19:** 시스템은 자동으로 비즈니스 문서와 무시할 문서를 분류할 수 있다
- **FR20:** 사용자는 임베딩할 문서를 수동으로 선택하거나 제외할 수 있다
- **FR21:** 시스템은 PDF, HWP, DOCX 파일 형식을 지원할 수 있다

### 5. Team Collaboration (팀 협업)

- **FR22:** 사용자는 이메일 링크로 팀원을 초대할 수 있다 (최대 3명)
- **FR23:** 사용자는 팀원에게 Owner, Editor, Viewer 권한을 부여할 수 있다
- **FR24:** 사용자는 팀원과 동시에 문서를 편집할 수 있다 (Polling 5초 간격)
- **FR25:** 사용자는 팀원의 변경 사항을 활동 로그로 확인할 수 있다
- **FR26:** 시스템은 동시 편집 충돌 시 "마지막 저장 우선" 전략을 적용할 수 있다
- **FR27:** 사용자는 팀원을 @멘션하여 알림을 보낼 수 있다

### 6. Cloud Integration & Data Management (클라우드 통합 및 데이터 관리)

- **FR28:** 사용자는 Google Drive OAuth 2.0 인증을 통해 연동할 수 있다
- **FR29:** 시스템은 최초 1회 전체 파일 스캔을 수행할 수 있다
- **FR30:** 시스템은 파일 변경 감지 시 자동으로 업데이트할 수 있다
- **FR31:** 사용자는 클라우드 연동 해제를 통해 데이터 접근을 철회할 수 있다
- **FR32:** 시스템은 읽기 전용 권한을 요청하여 문서에 접근할 수 있다

### 7. User Interface & Experience (사용자 인터페이스 및 경험)

- **FR33:** 사용자는 시스템 설정 Dark Mode를 자동으로 적용받을 수 있다
- **FR34:** 사용자는 Dark Mode를 수동으로 토글할 수 있다
- **FR35:** 사용자는 모바일, 태블릿, 데스크톱 화면 크기에 맞는 반응형 UI를 경험할 수 있다
- **FR36:** 사용자는 모바일에서 폼 기반 입력을 통해 문서를 생성할 수 있다 (Node UI는 데스크톱 권장)
- **FR37:** 사용자는 에러 발생 시 감정적 메시지로 안내를 받을 수 있다
- **FR38:** 사용자는 키보드 내비게이션으로 UI를 조작할 수 있다

### 8. Content & Template Management (콘텐츠 및 템플릿 관리)

- **FR39:** 사용자는 생성된 문서를 저장하고 불러올 수 있다
- **FR40:** 사용자는 문서를 삭제할 수 있다
- **FR41:** 사용자는 문서를 복제하여 수정할 수 있다
- **FR42:** 사용자는 문서 내에서 인포그래픽을 자동으로 생성할 수 있다
- **FR43:** 사용자는 생성된 문서를 다운로드할 수 있다 (PDF, PPT)

### 9. Error Handling & Recovery (에러 처리 및 복구)

- **FR44:** 사용자는 클라우드 연결 끊김 시 재연결 옵션을 받을 수 있다
- **FR45:** 사용자는 AI 생성 실패 시 재시도 옵션을 받을 수 있다
- **FR46:** 사용자는 시스템 장애 발생 시 투명한 공지를 확인할 수 있다

### 10. Accessibility & Inclusivity (접근성 및 포용성)

- **FR47:** 사용자는 색상 대비 4.5:1 이상을 충족하는 UI를 경험할 수 있다
- **FR48:** 사용자는 스크린 리더로 UI를 탐색할 수 있다 (ARIA 지원)
- **FR49:** 사용자는 200% 확대에서도 모든 기능을 사용할 수 있다
- **FR50:** 사용자는 키보드만으로 모든 기능에 접근할 수 있다

### 11. Pricing & Subscription (가격 정책 및 구독)

- **FR51:** 사용자는 데모 모드에서 무제한 체험할 수 있다 (저장 불가)
- **FR52:** 사용자는 프리티어 50회 제한을 확인할 수 있다
- **FR53:** 사용자는 사용량 소진 시 유료 전환 프롬프트를 받을 수 있다

### 12. Learning & Education (학습 및 교육)

- **FR54:** 사용자는 노드 클릭 시 비즈니스 용어 설명을 툴팁으로 확인할 수 있다
- **FR55:** 사용자는 용어 설명에서 관련 예제를 확인할 수 있다
- **FR56:** 사용자는 용어 검색 기능을 통해 특정 용어를 찾을 수 있다

### 13. Productivity & Planning (생산성 및 계획)

- **FR57:** 사용자는 AI로부터 우선순위 제안을 받을 수 있다
- **FR58:** 사용자는 일일 플래너를 통해 오늘의 할 일을 확인할 수 있다
- **FR59:** 사용자는 우선순위를 수동으로 조정할 수 있다

### 14. Dashboard & Analytics (대시보드 및 분석)

- **FR60:** 사용자는 대시보드에서 진행 상황을 시각적으로 확인할 수 있다
- **FR61:** 사용자는 성취감을 주는 진행률 표시를 받을 수 있다 (예: "이번 주 80% 완료!")

### 15. Real-time Collaboration (실시간 협업)

- **FR62:** 사용자는 팀원의 실시간 커서 위치를 확인할 수 있다 (Figma 스타일)
- **FR63:** 사용자는 팀원이 현재 입력 중인지 표시를 받을 수 있다
- **FR64:** 사용자는 팀원의 온라인 상태를 확인할 수 있다

### 16. Version Management (버전 관리)

- **FR65:** 사용자는 문서 버전 히스토리를 확인할 수 있다
- **FR66:** 사용자는 이전 버전으로 복원할 수 있다
- **FR67:** 사용자는 특정 시점의 버전을 비교할 수 있다

### 17. Admin & Management (관리자 및 관리)

- **FR68:** 액셀러레이터는 관리자 대시보드에서 팀별 진행 상황을 확인할 수 있다
- **FR69:** 액셀러레이터는 팀별 성과 지표를 비교할 수 있다
- **FR70:** 액셀러레이터는 팀원별 활동 내역을 확인할 수 있다

### 18. Enterprise Features (기업 기능)

- **FR71:** 액셀러레이터는 벌크 라이선스 구매를 통해 할인을 받을 수 있다
- **FR72:** 액셀러레이터는 팀별 라이선스를 관리할 수 있다

---

## ✅ Self-Validation (완전성 검증)

**Completeness Check:**
1. ✅ MVP scope의 모든 capability를 포함했나? → 예 (온보딩, Node UI, AI 생성, 팀 협업, 클라우드 연동, Dark Mode)
2. ✅ 정부지원사업 5개 양식을 포함했나? → 예 (FR12)
3. ✅ Web app 특정 요구사항을 포함했나? → 예 (FR35: 반응형, FR33-34: Dark Mode, FR47-50: Accessibility)
4. ✅ UX Designer가 FRs만 읽고 디자인할 수 있나? → 예 (capability 중심)
5. ✅ Architect가 FRs만 보고 시스템을 설계할 수 있나? → 예 (기술 중립적)
6. ✅ User Persona Focus Group에서 발견된 누락된 needs를 포함했나? → 예 (FR51-72: 22개 추가)

**Altitude Check:**
1. ✅ "WHAT capability"인가? → 예 (모든 FR이 "사용자는 ~할 수 있다" 형식)
2. ✅ "HOW implementation"이 없는가? → 예 (구현 세부사항 없음)
3. ✅ 다양한 구현 방식이 가능한가? → 예 (Polling vs WebSocket, OAuth 2.0 vs SSO 등)

**Quality Check:**
1. ✅ 각 FR이 테스트 가능한가? → 예
2. ✅ 각 FR이 독립적인가? → 예
3. ✅ 모호한 용어("좋은", "빠른")를 피했나? → 예

---

## 📊 FRs Summary (User Persona Focus Group 후)

- **총 FR 개수:** **72개** (기존 50개 + 추가 22개)
- **Capability Areas:** **18개** (기존 10개 + 추가 8개)
- **MVP FRs:** 68개 (FR68-72: 액셀러레이터 관리자 대시보드는 Post-MVP)

**추가된 Capability Areas:**
- 11. Pricing & Subscription (FR51-53)
- 12. Learning & Education (FR54-56)
- 13. Productivity & Planning (FR57-59)
- 14. Dashboard & Analytics (FR60-61)
- 15. Real-time Collaboration (FR62-64)
- 16. Version Management (FR65-67)
- 17. Admin & Management (FR68-70)
- 18. Enterprise Features (FR71-72)

**이 FRs는 이제 binding합니다:**
- 이 목록에 없는 기능은 최종 제품에 존재하지 않습니다!
- 추후 추가하려면 명시적으로 FR을 추가해야 합니다.

---

## Non-Functional Requirements (비기능적 요구사항)

### Performance (성능)

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

### Security (보안)

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

### Scalability (확장성)

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

### Accessibility (접근성)

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

### Integration (통합)

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

### Reliability (신뢰성)

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
- **복구 훈련:** 분기별 1회 DR 훈련

**NFR-R4: 장애 대응**
- **장애 감지:** 1분 이내 Slack 알림
- **자동 복구:** API 재시작, DB 재시작
- **사용자 공지:** 장애 발생 5분 이내 Status 페이지 업데이트

---


