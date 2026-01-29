# Story 1.7: 학습 지원 (비즈니스 용어 툴팁)

**Epic:** Epic 1 - 사용자 인증 및 온보딩
**Story ID:** 1.7
**Status:** ready-for-dev
**Created:** 2026-01-18
**Last Updated:** 2026-01-18
**Dependencies:** Story 1.1 (프로젝트 초기화), Story 1.2 (OAuth 로그인)

---

## 📋 User Story

**As a** 초보 창업가,
**I want** 비즈니스 용어 설명을 툴팁으로 보려고,
**So that** 낯선 용어를 이해하고 학습할 수 있다.

---

## ✅ Acceptance Criteria (BDD Format)

### Scenario 1: 비즈니스 용어 툴팁 표시

**Given** 사용자가 UI를 탐색할 때
**When** 사용자가 비즈니스 용어가 포함된 요소에 hover하면
**Then** 툴팁이 300ms delay 후 표시된다

**And** 툴팁이 다음을 포함한다:
- 용어 제목 (예: "Lean Startup")
- 정의 (1-2문장)
- 관련 예제 링크 (선택 사항)

### Scenario 2: 용어 데이터베이스

**And** `glossary` 테이블이 다음 컬럼을 포함한다:
- `id` (UUID, primary key)
- `term` (text, unique)
- `definition` (text)
- `examples` (text, optional)
- `category` (text)

### Scenario 3: 용어 검색

**And** 사용자가 "용어 검색"을 실행하면:
- 전체 텍스트 검색이 `glossary` 테이블에서 수행된다
- 검색 결과가 dropdown으로 표시된다 (top 5)
- 결과 클릭 시 정의 modal 표시

### Scenario 4: 툴팁 표시 설정

**And** 첫 방문 사용자에게만 툴팁이 표시된다:
- `user_preferences.show_tooltips` (boolean, default true)
- Settings에서 "툴팁 표시" 토글 가능

### Scenario 5: 검색 결과 없음

**And** 용어 검색 결과가 0개이면:
- "검색어 '[용어]'에 대한 결과가 없습니다." 메시지
- "관리자에게 용어 추가 요청" 옵션

---

## 🏗️ Developer Context - Critical Implementation Guide

### 🔴 CRITICAL: Educational Enhancement Story

**This is the LAST story of Epic 1.** It adds educational value without blocking core functionality. Implement as a polished, non-intrusive feature.

### 📁 File Structure Requirements

**Glossary Components:**
```
frontend/src/
├── components/
│   └── glossary/
│       ├── Tooltip.tsx               # ✅ Custom tooltip component
│       ├── TermSearch.tsx            # ✅ Search input + dropdown
│       └── DefinitionModal.tsx       # ✅ Full definition modal
├── hooks/
│   └── useTooltip.ts                # ✅ Tooltip hook with 300ms delay
└── store/
    └── slices/
        └── glossarySlice.ts          # ✅ Glossary state

backend/src/
├── routes/v1/
│   └── glossary.routes.ts           # ✅ Glossary API endpoints
└── services/
    └── glossary.service.ts          # ✅ Glossary business logic
```

---

## 🛠️ Technical Requirements

### 1. Database Schema Setup

#### 1.1 Create glossary Table

**Create backend/PostgreSQL/migrations/20240118000007_create_glossary.sql:**
```sql
-- Create glossary table
CREATE TABLE IF NOT EXISTS public.glossary (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  term TEXT NOT NULL UNIQUE,
  definition TEXT NOT NULL,
  examples TEXT,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.glossary ENABLE ROW LEVEL SECURITY;

-- RLS Policies (public read, admin write)
CREATE POLICY "Anyone can view glossary"
ON public.glossary
FOR SELECT
USING (true);

CREATE POLICY "Only admins can insert glossary"
ON public.glossary
FOR INSERT
WITH CHECK (auth.uid() IN (SELECT id FROM auth.users WHERE is_admin = true));

CREATE POLICY "Only admins can update glossary"
ON public.glossary
FOR UPDATE
USING (auth.uid() IN (SELECT id FROM auth.users WHERE is_admin = true));

-- Create indexes
CREATE INDEX IF NOT EXISTS glossary_term_idx ON public.glossary USING gin(term gin_trgm_ops);
CREATE INDEX IF NOT EXISTS glossary_category_idx ON public.glossary(category);

-- Enable pg_trgm extension for full-text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Trigger for updated_at
CREATE TRIGGER update_glossary_updated_at
BEFORE UPDATE ON public.glossary
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

**Push migration:**
```bash
cd backend/PostgreSQL
PostgreSQL db push
```

#### 1.2 Create user_preferences Table

**Create backend/PostgreSQL/migrations/20240118000008_create_user_preferences.sql:**
```sql
-- Create user_preferences table
CREATE TABLE IF NOT EXISTS public.user_preferences (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  show_tooltips BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own preferences"
ON public.user_preferences
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
ON public.user_preferences
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
ON public.user_preferences
FOR UPDATE
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_user_preferences_updated_at
BEFORE UPDATE ON public.user_preferences
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

**Push migration:**
```bash
PostgreSQL db push
```

#### 1.3 Seed Initial Glossary Terms

**Create backend/PostgreSQL/migrations/20240118000009_seed_glossary.sql:**
```sql
-- Seed initial glossary terms
INSERT INTO public.glossary (term, definition, examples, category) VALUES
('Lean Startup', '에릭 리스가 개발한 린 스타트업 방법론으로, 최소 기능 제품(MVP)을 통해 고객 피드백을 빠르게 얻고 검증된 학습을 반복하는 창업 방식입니다.', '고객 개발, 피봇 밸리데이션, 빌드-측량-학습(BML) 사이클', 'Startup Methodology'),
('MVP (Minimum Viable Product)', '최소 기능 제품으로, 고객의 문제를 해결하기 위한 핵심 기능만 포함한 초기 제품입니다. 추가 기능 없이 핵심 가치 제안을 검증하는 것이 목적입니다.', '에어비앤비, 드롭박스, 인스타그램 초기 버전', 'Product Development'),
('Product-Market Fit (PMF)', '제품과 시장의 적합성을 의미하며, 제품이 시장의 수요를 충족시키고 고객이 제품을 통해 가치를 얻고 있다는 상태입니다.', '마켓 풀사이트, 제엔드-피트, 슈퍼비자를 위한 제품', 'Growth'),
('Pivot', '창업이 진행하면서 방향 전환을 의미합니다. 기존 전략이나 제품이 시장에서 수요를 충족시키지 못할 때, 데이터와 고객 피드백을 기반으로 새로운 방향으로 전환합니다.', '슬랙에서 트위터로, 넷플릭스에서 DVD 대여로, 유튜브에서 동영상 스트리밍으로', 'Strategy'),
('Unit Economics', '단위 경제로, 사업의 경제적 건전성을 평가하는 지표입니다. 한 명의 고객이 평생 가치(LTV), 고객 획득 비용(CAC), 간접비용 등을 분석합니다.', 'LTV:CAC 비율 3:1, 벤처마진 12개월 내 회수', 'Metrics'),
('TAM SAM SOM', '시장 규모 분석 프레임워크입니다. TAM(총 가용 시장), SAM(서비스 가능한 시장), SOM(서비스 획득 가능한 시장)으로 시장 기회를 구체화합니다.', 'TAM: $10B, SAM: $1B, SOM: $100M', 'Market Analysis'),
('Customer Discovery', '고객 발견으로, 스티브 블랭크의 고객 개발 프로세스를 통해 잠재 고객의 문제와 니즈를 깊이 이해하는 활동입니다.', '고객 인터뷰, 문제 인터뷰, 솔루션 인터뷰', 'Customer Development'),
('Burn Rate', '스타트업이 매월 소비하는 현금 흐름입니다. 런웨이(현재 보유 현금)을 버니레이트로 나누어 회사가 생존할 수 있는 기간을 계산합니다.', '월 $50,000 버니레이트, 런웨이 $500K으로 10개월 생존 가능', 'Financial Metrics'),
('Churn Rate', '이탈률로, 일정 기간 내 서비스를 이탈하는 고객의 비율입니다. 월간 이탈률이 낮을수록 건강한 비즈니스를 의미합니다.', '월 5% 이탈률, 연간 63% 잔존률', 'Retention'),
('CAC (Customer Acquisition Cost)', '고객 획득 비용으로, 한 명의 새로운 고객을 획득하는 데 드는 마케팅 및 영업 비용입니다.', '마케팅 $100K / 1,000명 신규 유저 = CAC $100', 'Marketing Metrics')
ON CONFLICT (term) DO NOTHING;
```

**Push migration:**
```bash
PostgreSQL db push
```

### 2. Backend Implementation

#### 2.1 Create Glossary Service

**Create backend/src/services/glossary.service.ts:**
```typescript
interface GlossaryTerm {
  id: string;
  term: string;
  definition: string;
  examples?: string;
  category: string;
}

export class GlossaryService {
  /**
   * Search glossary terms by query
   */
  async searchTerms(query: string): Promise<GlossaryTerm[]> {
    if (!query || query.trim().length < 2) {
      return [];
    }

    // Use PostgreSQL full-text search
    const { data, error } = await PostgreSQLAdmin
      .from('glossary')
      .select('*')
      .or(`term.ilike.%${query}%,definition.ilike.%${query}%`)
      .limit(5)
      .order('term', { ascending: true });

    if (error) {
      console.error('Error searching glossary:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Get term by ID
   */
  async getTermById(id: string): Promise<GlossaryTerm | null> {
    const { data, error } = await PostgreSQLAdmin
      .from('glossary')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching term:', error);
      return null;
    }

    return data;
  }

  /**
   * Get all terms (for admin)
   */
  async getAllTerms(): Promise<GlossaryTerm[]> {
    const { data, error } = await PostgreSQLAdmin
      .from('glossary')
      .select('*')
      .order('category', { ascending: true })
      .order('term', { ascending: true });

    if (error) {
      console.error('Error fetching terms:', error);
      return [];
    }

    return data || [];
  }
}

export const glossaryService = new GlossaryService();
```

#### 2.2 Create Glossary Routes

**Create backend/src/routes/v1/glossary.routes.ts:**
```typescript
import { Router } from 'express';
import { glossaryService } from '../services/glossary.service';

const router = Router();

// Search terms (public)
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== 'string') {
      return res.json({
        success: true,
        data: [],
      });
    }

    const terms = await glossaryService.searchTerms(q);

    res.json({
      success: true,
      data: terms,
    });
  } catch (error) {
    console.error('Error searching terms:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: '검색 실패' },
    });
  }
});

// Get term by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const term = await glossaryService.getTermById(id);

    if (!term) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: '용어를 찾을 수 없습니다' },
      });
    }

    res.json({
      success: true,
      data: term,
    });
  } catch (error) {
    console.error('Error fetching term:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: '조회 실패' },
    });
  }
});

export default router;
```

#### 2.3 Create User Preferences Routes

**Create backend/src/routes/v1/user-preferences.routes.ts:**
```typescript
import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';
import { PostgreSQLAdmin } from '../utils/PostgreSQLAdmin';

const router = Router();
router.use(authMiddleware);

// Get preferences
router.get('/', async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: '인증이 필요합니다' },
      });
    }

    const { data, error } = await PostgreSQLAdmin
      .from('user_preferences')
      .select('*')
      .eq('user_id', req.user.id)
      .maybeSingle(); // Returns null if no row

    if (error) {
      return res.json({
        success: true,
        data: { show_tooltips: true }, // Default
      });
    }

    res.json({
      success: true,
      data: data || { show_tooltips: true },
    });
  } catch (error) {
    console.error('Error fetching preferences:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: '조회 실패' },
    });
  }
});

// Update preferences
router.put('/', async (req: AuthRequest, res) => {
  try {
    const { show_tooltips } = req.body;

    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: '인증이 필요합니다' },
      });
    }

    const { data, error } = await PostgreSQLAdmin
      .from('user_preferences')
      .upsert({
        user_id: req.user.id,
        show_tooltips: show_tooltips !== undefined ? show_tooltips : true,
      });

    if (error) {
      return res.status(500).json({
        success: false,
        error: { code: 'DB_ERROR', message: '저장 실패' },
      });
    }

    res.json({
      success: true,
      data: { show_tooltips },
    });
  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: '저장 실패' },
    });
  }
});

export default router;
```

### 3. Frontend Implementation

#### 3.1 Create Tooltip Hook

**Create frontend/src/hooks/useTooltip.ts:**
```typescript
import { useState, useEffect, useRef } from 'react';
import type { GlossaryTerm } from '@/types/glossary.types';

interface UseTooltipResult {
  visible: boolean;
  position: { x: number; y: number };
  term: GlossaryTerm | null;
  showTooltip: (term: GlossaryTerm, x: number, y: number) => void;
  hideTooltip: () => void;
}

export const useTooltip(delay: number = 300): UseTooltipResult => {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [term, setTerm] = useState<GlossaryTerm | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showTooltip = (newTerm: GlossaryTerm, x: number, y: number) => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      setTerm(newTerm);
      setPosition({ x, y });
      setVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setVisible(false);
    setTerm(null);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    visible,
    position,
    term,
    showTooltip,
    hideTooltip,
  };
};
```

#### 3.2 Create Tooltip Component

**Create frontend/src/components/glossary/Tooltip.tsx:**
```typescript
import React, { useEffect, useRef } from 'react';
import type { GlossaryTerm } from '@/types/glossary.types';

interface TooltipProps {
  visible: boolean;
  term: GlossaryTerm | null;
  position: { x: number; y: number };
  onClose: () => void;
}

export const Tooltip: React.FC<TooltipProps> = ({ visible, term, position, onClose }) => {
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (visible) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [visible, onClose]);

  if (!visible || !term) {
    return null;
  }

  return (
    <div
      ref={tooltipRef}
      className="fixed z-50 w-80 bg-gray-900 text-white rounded-lg shadow-xl p-4 pointer-events-auto"
      style={{
        left: `${position.x}px`,
        top: `${position.y + 20}px`, // Offset below trigger
      }}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-bold text-indigo-300">{term.term}</h4>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white ml-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <p className="text-sm text-gray-300 mb-2">{term.definition}</p>

      {term.examples && (
        <div className="mt-2 pt-2 border-t border-gray-700">
          <p className="text-xs text-gray-400 mb-1">예시:</p>
          <p className="text-xs text-gray-400">{term.examples}</p>
        </div>
      )}

      <div className="mt-2 pt-2 border-t border-gray-700">
        <span className="text-xs text-gray-500">{term.category}</span>
      </div>
    </div>
  );
};
```

#### 3.3 Create Term Search Component

**Create frontend/src/components/glossary/TermSearch.tsx:**
```typescript
import React, { useState, useRef, useEffect } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { searchGlossary } from '@/store/slices/glossarySlice';
import type { GlossaryTerm } from '@/types/glossary.types';

export const TermSearch: React.FC = () => {
  const dispatch = useAppDispatch();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GlossaryTerm[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const search = async () => {
      if (query.trim().length >= 2) {
        const result = await dispatch(searchGlossary(query) as any);
        if (searchGlossary.fulfilled.match(result.type)) {
          setResults(result.payload || []);
        }
        setIsOpen(true);
      } else {
        setResults([]);
        setIsOpen(false);
      }
    };

    const timeoutId = setTimeout(search, 300);
    return () => clearTimeout(timeoutId);
  }, [query, dispatch]);

  return (
    <div className="relative w-64" ref={searchRef}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="용어 검색..."
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
      />

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
          {results.length > 0 ? (
            results.map((term) => (
              <button
                key={term.id}
                onClick={() => {
                  // Open definition modal
                  // You can dispatch an action to open modal
                  setIsOpen(false);
                }}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors"
              >
                <div className="font-medium text-gray-900">{term.term}</div>
                <div className="text-sm text-gray-600 truncate">{term.definition}</div>
              </button>
            ))
          ) : (
            <div className="px-4 py-3 text-gray-500 text-sm">
              "{query}"에 대한 결과가 없습니다.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
```

---

## 🚫 Anti-Patterns to Avoid

### ❌ Forbidden: Instant Tooltip Appearance

```typescript
// ❌ BAD: Tooltip shows immediately on hover
onMouseEnter={() => setShowTooltip(true)}

// ✅ GOOD: 300ms delay
const showTooltip = () => {
  setTimeout(() => setShowTooltip(true), 300);
};
```

### ❌ Forbidden: Blocking UI During Search

```typescript
// ❌ BAD: Synchronous search blocks typing
const handleSearch = (query) => {
  const results = searchGlossary(query); // Blocks
  setResults(results);
};

// ✅ GOOD: Debounced async search
useEffect(() => {
  const timeoutId = setTimeout(async () => {
    const results = await searchGlossary(query);
    setResults(results);
  }, 300);
  return () => clearTimeout(timeoutId);
}, [query]);
```

### ❌ Forbidden: No User Preference Persistence

```typescript
// ❌ BAD: Local state only
const [showTooltips, setShowTooltips] = useState(true);

// ✅ GOOD: Persist to database
const { show_tooltips } = useUserPreferences();
await updateUserPreferences({ show_tooltips: false });
```

---

## ✅ Verification Steps

### 1. Tooltip Display Verification

**Steps:**
1. Hover over a business term (if implemented in UI)
2. **Expected:** Tooltip appears after 300ms delay
3. **Expected:** Tooltip shows term, definition, examples, category

### 2. Term Search Verification

**Steps:**
1. Type "Lean Startup" in search box
2. **Expected:** Dropdown appears with matching results
3. **Expected:** Results show term and definition preview

### 3. No Results Verification

**Steps:**
1. Type "xyzabc" (non-existent term) in search box
2. **Expected:** "xyzabc에 대한 결과가 없습니다" message

### 4. Settings Toggle Verification

**Steps:**
1. Go to Settings
2. Toggle "툴팁 표시" off
3. Hover over business term
4. **Expected:** No tooltip appears

---

## 🎯 Success Criteria

### ✅ Must Have (Blockers)

1. **Database Tables:** glossary and user_preferences created
2. **Tooltip Component:** 300ms delay tooltip with all fields
3. **Search Functionality:** Full-text search with dropdown results
4. **User Preferences:** show_tooltips toggle in settings
5. **Seed Data:** Initial glossary terms populated
6. **API Endpoints:** Search and get term endpoints working

### 📋 Should Have (Important)

1. **UX Polish:** Smooth animations and transitions
2. **Mobile Responsive:** Tooltip and search work on mobile
3. **Accessibility:** Keyboard navigation support
4. **Category Display:** Term category shown in tooltip

---

## 📚 References

**Previous Stories:**
- **Story 1.1:** 프로젝트 초기화 (database setup)
- **Story 1.2:** OAuth 로그인 (auth required)

**This is the FINAL story of Epic 1!**

---

## ✅ Story Completion Checklist

- [ ] glossary table created with migrations
- [ ] user_preferences table created with migrations
- [ ] Initial glossary terms seeded (10 terms)
- [ ] Backend glossary service created
- [ ] Backend glossary routes created
- [ ] Backend user preferences routes created
- [ ] Frontend useTooltip hook created
- [ ] Tooltip component created
- [ ] TermSearch component created
- [ ] Redux glossary slice created
- [ ] Settings page updated with tooltip toggle
- [ ] All verification steps passed
- [ ] Database records verified

---

**Status:** ready-for-dev
**Ready for:** Dev Agent Implementation
**This completes Epic 1!**

**Next Epic:** Epic 2 - 클라우드 연동 및 문서 임베딩
