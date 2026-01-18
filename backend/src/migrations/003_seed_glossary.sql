-- Migration: Seed initial glossary terms
-- Description: Insert common business terms for startup founders

-- Seed initial glossary terms
INSERT INTO public.glossary (term, definition, examples, category) VALUES
('Lean Startup', '에릭 리스가 개발한 린 스타트업 방법론으로, 최소 기능 제품(MVP)을 통해 고객 피드백을 빠르게 얻고 검증된 학습을 반복하는 창업 방식입니다.', '고객 개발, 피봇, 밸리데이션, 빌드-측량-학습(BML) 사이클', 'Startup Methodology'),
('MVP (Minimum Viable Product)', '최소 기능 제품으로, 고객의 문제를 해결하기 위한 핵심 기능만 포함한 초기 제품입니다. 추가 기능 없이 핵심 가치 제안을 검증하는 것이 목적입니다.', '에어비앤비, 드롭박스, 인스타그램 초기 버전', 'Product Development'),
('Product-Market Fit (PMF)', '제품과 시장의 적합성을 의미하며, 제품이 시장의 수요를 충족시키고 고객이 제품을 통해 가치를 얻고 있다는 상태입니다.', '마켓 풀사이트, 제엔드-피트, 슈퍼비자를 위한 제품', 'Growth'),
('Pivot', '창업이 진행하면서 방향 전환을 의미합니다. 기존 전략이나 제품이 시장에서 수요를 충족시키지 못할 때, 데이터와 고객 피드백을 기반으로 새로운 방향으로 전환합니다.', '슬랙에서 게임으로, 넷플릭스에서 DVD 대여로, 유튜브에서 동영상 데이팅으로', 'Strategy'),
('Unit Economics', '단위 경제로, 사업의 경제적 건전성을 평가하는 지표입니다. 한 명의 고객이 평생 가치(LTV), 고객 획득 비용(CAC), 간접비용 등을 분석합니다.', 'LTV:CAC 비율 3:1, 벤처마진 12개월 내 회수', 'Metrics'),
('TAM SAM SOM', '시장 규모 분석 프레임워크입니다. TAM(총 가용 시장), SAM(서비스 가능한 시장), SOM(서비스 획득 가능한 시장)으로 시장 기회를 구체화합니다.', 'TAM: $10B, SAM: $1B, SOM: $100M', 'Market Analysis'),
('Customer Discovery', '고객 발견으로, 스티브 블랭크의 고객 개발 프로세스를 통해 잠재 고객의 문제와 니즈를 깊이 이해하는 활동입니다.', '고객 인터뷰, 문제 인터뷰, 솔루션 인터뷰', 'Customer Development'),
('Burn Rate', '스타트업이 매월 소비하는 현금 흐름입니다. 런웨이(현재 보유 현금)을 버니레이트로 나누어 회사가 생존할 수 있는 기간을 계산합니다.', '월 $50,000 버니레이트, 런웨이 $500K으로 10개월 생존 가능', 'Financial Metrics'),
('Churn Rate', '이탈률로, 일정 기간 내 서비스를 이탈하는 고객의 비율입니다. 월간 이탈률이 낮을수록 건강한 비즈니스를 의미합니다.', '월 5% 이탈률, 연간 63% 잔존률', 'Retention'),
('CAC (Customer Acquisition Cost)', '고객 획득 비용으로, 한 명의 새로운 고객을 획득하는 데 드는 마케팅 및 영업 비용입니다.', '마케팅 $100K / 1,000명 신규 유저 = CAC $100', 'Marketing Metrics')
ON CONFLICT (term) DO NOTHING;

-- Add comment
COMMENT ON TABLE public.glossary IS 'Seeded with 10 initial business terms';
