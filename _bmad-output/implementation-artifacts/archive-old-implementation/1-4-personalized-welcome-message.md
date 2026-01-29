# Story 1.4: 개인화된 환영 메시지

**Epic:** Epic 1 - 사용자 인증 및 온보딩
**Story ID:** 1.4
**Status:** done
**Created:** 2026-01-18
**Last Updated:** 2026-01-18
**Dependencies:** Story 1.1 (프로젝트 초기화), Story 1.2 (OAuth 로그인), Story 1.3 (온보딩 플로우)

---

## 📋 User Story

**As a** 예비 창업가,
**I want** 온보딩 완료 후 개인화된 환영 메시지를 받으려고,
**So that** AI 공동 창업자와 함께한다는 감정을 느낄 수 있다.

---

## ✅ Acceptance Criteria (BDD Format)

### Scenario 1: 첫 대시보드 접속 시 환영 메시지 표시

**Given** 사용자가 온보딩을 완료했을 때
**When** 사용자가 처음 대시보드에 접속하면
**Then** 환영 메시지 modal이 표시된다

### Scenario 2: 개인화된 환영 메시지 내용

**And** 환영 메시지가 온보딩 답변을 참조하여 개인화된다:
- "[사용자 이름]님, [비전]을 위한 여정을 시작하네요!"
- "당신의 타겟인 [타겟 고객]을 위해 AI가 준비되었어요."
- "[현재 단계]에서 다음 스텝은 무엇일까요?"

### Scenario 3: 환영 메시지 닫기

**And** 환영 메시지에 "시작하기" 버튼이 제공된다

**When** 사용자가 "시작하기"를 클릭하면
**Then** modal이 닫히고 대시보드가 표시된다

### Scenario 4: 환영 메시지 다시 보기

**And** 환영 메시지를 다시 보고 싶으면:
- Settings에서 "환영 메시지 다시 보기" 옵션을 제공한다

---

## 🏗️ Developer Context - Critical Implementation Guide

### 🔴 CRITICAL: First Emotional Touchpoint

**This is the FIRST emotional connection with the user.** It sets the tone for the entire relationship. Make it warm, personal, and motivating.

### 📁 File Structure Requirements

**Welcome Modal Components:**
```
frontend/src/
├── components/
│   └── welcome/
│       ├── WelcomeModal.tsx         # ✅ Main modal container
│       └── WelcomeContent.tsx       # ✅ Personalized content
├── store/
│   └── slices/
│       └── welcomeSlice.ts          # ✅ Welcome modal state
└── pages/
    └── SettingsPage.tsx             # ✅ Update: add "show welcome" option
```

---

## 🛠️ Technical Requirements

### 1. Database Schema Update

#### 1.1 Add welcome_shown Flag to profiles

**Create backend/PostgreSQL/migrations/20240118000005_add_welcome_shown_to_profiles.sql:**
```sql
-- Add welcome_shown flag to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS welcome_shown BOOLEAN DEFAULT FALSE;

-- Create index
CREATE INDEX IF NOT EXISTS profiles_welcome_shown_idx ON public.profiles(welcome_shown);
```

**Push migration:**
```bash
cd backend/PostgreSQL
PostgreSQL db push
```

### 2. Frontend Implementation

#### 2.1 Create Welcome Redux Slice

**Create frontend/src/store/slices/welcomeSlice.ts:**
```typescript
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { PostgreSQL } from '@/utils/PostgreSQL';

interface WelcomeState {
  isOpen: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: WelcomeState = {
  isOpen: false,
  loading: false,
  error: null,
};

// Async thunks
export const checkWelcomeStatus = createAsyncThunk(
  'welcome/checkWelcomeStatus',
  async (_, { rejectWithValue }) => {
    const { data: { user } } = await PostgreSQL.auth.getUser();

    if (!user) {
      return rejectWithValue('User not authenticated');
    }

    const { data, error } = await PostgreSQL
      .from('profiles')
      .select('welcome_shown')
      .eq('id', user.id)
      .single();

    if (error) {
      return rejectWithValue(error.message);
    }

    // Show welcome if not shown yet
    return data?.welcome_shown === false;
  }
);

export const markWelcomeShown = createAsyncThunk(
  'welcome/markWelcomeShown',
  async (_, { rejectWithValue }) => {
    const { data: { user } } = await PostgreSQL.auth.getUser();

    if (!user) {
      return rejectWithValue('User not authenticated');
    }

    const { error } = await PostgreSQL
      .from('profiles')
      .update({ welcome_shown: true })
      .eq('id', user.id);

    if (error) {
      return rejectWithValue(error.message);
    }

    return true;
  }
);

// Slice
const welcomeSlice = createSlice({
  name: 'welcome',
  initialState,
  reducers: {
    openWelcome: (state) => {
      state.isOpen = true;
    },
    closeWelcome: (state) => {
      state.isOpen = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // checkWelcomeStatus
      .addCase(checkWelcomeStatus.fulfilled, (state, action) => {
        state.isOpen = action.payload;
      })

      // markWelcomeShown
      .addCase(markWelcomeShown.fulfilled, (state) => {
        state.isOpen = false;
      });
  },
});

export const { openWelcome, closeWelcome, clearError } = welcomeSlice.actions;

export default welcomeSlice.reducer;
```

#### 2.2 Create Welcome Modal Component

**Create frontend/src/components/welcome/WelcomeContent.tsx:**
```typescript
import React from 'react';
import type { CurrentStage } from '@/types/onboarding.types';

interface WelcomeContentProps {
  userName: string;
  vision: string;
  targetCustomer: string;
  currentStage: CurrentStage;
}

const STAGE_LABELS: Record<CurrentStage, string> = {
  idea: '아이디어 단계',
  prototype: '프로토타입 단계',
  mvp: 'MVP 개발 단계',
  growth: '성장 단계',
};

export const WelcomeContent: React.FC<WelcomeContentProps> = ({
  userName,
  vision,
  targetCustomer,
  currentStage,
}) => {
  const stageLabel = STAGE_LABELS[currentStage];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
          <svg
            className="w-8 h-8 text-indigo-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          {userName}님, 환영합니다! 🎉
        </h2>
        <p className="text-lg text-gray-600">
          AI 공동 창업자가 되어 기뻐요
        </p>
      </div>

      {/* Personalized Message */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6 space-y-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 mt-1">
            <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
          <div>
            <p className="text-gray-900 font-medium">
              "{vision}"을 위한 여정을 시작하네요!
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 mt-1">
            <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
            </svg>
          </div>
          <div>
            <p className="text-gray-900 font-medium">
              당신의 타겟인 <span className="text-indigo-600">{targetCustomer}</span>을 위해 AI가 준비되었어요.
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 mt-1">
            <svg className="w-5 h-5 text-pink-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <p className="text-gray-900 font-medium">
              <span className="text-purple-600">{stageLabel}</span>에서 다음 스텝은 무엇일까요?
            </p>
          </div>
        </div>
      </div>

      {/* Next Steps Hint */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          <span className="font-medium">💡 팁:</span> 대시보드에서 AI가 제안하는 우선순위를 확인하고,
          바로 시작할 수 있어요!
        </p>
      </div>
    </div>
  );
};
```

**Create frontend/src/components/welcome/WelcomeModal.tsx:**
```typescript
import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  selectWelcome,
  checkWelcomeStatus,
  markWelcomeShown,
  closeWelcome,
} from '@/store/slices/welcomeSlice';
import { selectOnboarding } from '@/store/slices/onboardingSlice';
import { selectUser } from '@/store/slices/authSlice';
import { WelcomeContent } from './WelcomeContent';

export const WelcomeModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isOpen } = useAppSelector(selectWelcome);
  const { responses } = useAppSelector(selectOnboarding);
  const user = useAppSelector(selectUser);

  useEffect(() => {
    // Check if welcome should be shown
    dispatch(checkWelcomeStatus() as any);
  }, [dispatch]);

  const handleClose = async () => {
    await dispatch(markWelcomeShown() as any);
  };

  if (!isOpen || !user) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full p-8 transform transition-all">
          {/* Content */}
          <WelcomeContent
            userName={user.full_name || user.email?.split('@')[0] || '사용자'}
            vision={responses.vision || '비즈니스 성공'}
            targetCustomer={responses.target_customer || '고객'}
            currentStage={responses.current_stage || 'idea'}
          />

          {/* Actions */}
          <div className="mt-8 flex justify-end space-x-4">
            <button
              onClick={handleClose}
              className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              시작하기 🚀
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
```

#### 2.3 Update Dashboard Page

**Update frontend/src/pages/DashboardPage.tsx:**
```typescript
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { WelcomeModal } from '@/components/welcome/WelcomeModal';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  useEffect(() => {
    // Redirect to onboarding if not completed
    if (user && !user.onboarding_completed) {
      navigate('/onboarding', { replace: true });
    }
  }, [user, navigate]);

  if (!user || !user.onboarding_completed) {
    return null;
  }

  return (
    <>
      {/* Welcome Modal */}
      <WelcomeModal />

      {/* Dashboard Content */}
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-bold">BM Builder</h1>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">
                  {user?.full_name || user?.email}
                </span>
                <button
                  onClick={signOut}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  로그아웃
                </button>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  환영합니다, {user?.full_name || '사용자'}님! 🎉
                </h2>
                <p className="text-gray-600">
                  대시보드가 준비되었습니다
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};
```

#### 2.4 Update Settings Page

**Update frontend/src/pages/SettingsPage.tsx:**
```typescript
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '@/store/hooks';
import { resetOnboarding } from '@/store/slices/onboardingSlice';
import { openWelcome } from '@/store/slices/welcomeSlice';

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const handleResetOnboarding = async () => {
    await dispatch(resetOnboarding() as any);
    window.location.href = '/onboarding';
  };

  const handleShowWelcome = () => {
    dispatch(openWelcome());
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">설정</h1>

          {/* Show Welcome Section */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              환영 메시지
            </h2>

            <p className="text-gray-600 mb-4">
              처음 환영 메시지를 다시 볼 수 있습니다.
            </p>

            <button
              onClick={handleShowWelcome}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              환영 메시지 다시 보기
            </button>
          </div>

          {/* Reset Onboarding Section */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              온보딩 재설정
            </h2>

            <p className="text-gray-600 mb-4">
              온보딩을 다시 시작하면 기존 답변이 모두 삭제되고 처음부터 다시 시작하게 됩니다.
            </p>

            {!showConfirmReset ? (
              <button
                onClick={() => setShowConfirmReset(true)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                온보딩 다시하기
              </button>
            ) : (
              <div className="space-x-2">
                <button
                  onClick={handleResetOnboarding}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  확인
                </button>
                <button
                  onClick={() => setShowConfirmReset(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  취소
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
```

#### 2.5 Add Settings Route

**Update frontend/src/App.tsx:**
```typescript
import { SettingsPage } from '@/pages/SettingsPage';

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute>
                <OnboardingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}
```

---

## 🚫 Anti-Patterns to Avoid

### ❌ Forbidden: Non-Personalized Welcome Message

```typescript
// ❌ BAD: Generic message
<h2>환영합니다!</h2>
<p>서비스를 시작해보세요.</p>

// ✅ GOOD: Personalized with user data
<h2>{userName}님, 환영합니다! 🎉</h2>
<p>"{vision}"을 위한 여정을 시작하네요!</p>
```

### ❌ Forbidden: Missing Data Fallbacks

```typescript
// ❌ BAD: Crash if data missing
<WelcomeContent
  vision={vision} // Can be undefined
  targetCustomer={targetCustomer} // Can be undefined
/>

// ✅ GOOD: Provide fallbacks
<WelcomeContent
  vision={vision || '비즈니스 성공'}
  targetCustomer={targetCustomer || '고객'}
  currentStage={currentStage || 'idea'}
/>
```

### ❌ Forbidden: Not Marking Welcome as Shown

```typescript
// ❌ BAD: Welcome shows every time
const handleClose = () => {
  dispatch(closeWelcome());
};

// ✅ GOOD: Mark as shown in database
const handleClose = async () => {
  await dispatch(markWelcomeShown() as any);
};
```

---

## ✅ Verification Steps

### 1. First Dashboard Visit Verification

**Steps:**
1. Complete onboarding (welcome_shown = false)
2. Navigate to /dashboard
3. **Expected:** Welcome modal appears with personalized message

### 2. Personalization Verification

**Steps:**
1. Check modal content shows:
   - User name (or email username if name missing)
   - Vision from onboarding
   - Target customer from onboarding
   - Current stage from onboarding
2. **Expected:** All fields personalized correctly

### 3. Close Modal Verification

**Steps:**
1. Click "시작하기 🚀" button
2. **Expected:** Modal closes, dashboard visible, welcome_shown = true in database

### 4. Subsequent Visits Verification

**Steps:**
1. Logout and login again
2. Navigate to /dashboard
3. **Expected:** Welcome modal NOT shown (welcome_shown = true)

### 5. Settings "Show Welcome" Verification

**Steps:**
1. Go to /settings
2. Click "환영 메시지 다시 보기"
3. **Expected:** Welcome modal appears again

### 6. Database Verification

**Check PostgreSQL:**
1. Go to Table Editor → profiles
2. Verify welcome_shown column exists
3. Verify welcome_shown = true after closing modal

---

## 🎯 Success Criteria

### ✅ Must Have (Blockers)

1. **Modal Display:** Welcome modal shows on first dashboard visit
2. **Personalization:** All 3 fields personalized (vision, target, stage)
3. **Close Action:** "시작하기" button closes modal and marks as shown
4. **Database Flag:** welcome_shown column created and updated
5. **Re-show Option:** Settings page can re-show welcome message
6. **Subsequent Visits:** Welcome NOT shown after first dismissal

### 📋 Should Have (Important)

1. **Visual Design:** Warm, inviting modal design with icons
2. **Fallback Handling:** Graceful defaults for missing data
3. **User Name:** Uses full_name or email username as fallback
4. **Stage Labels:** Korean labels for each stage (아이디어/프로토타입/MVP/성장)
5. **UX Polish:** Smooth animations and transitions

---

## 📚 References

**Previous Stories:**
- **Story 1.1:** 프로젝트 초기화 (database setup)
- **Story 1.2:** OAuth 로그인 (auth required)
- **Story 1.3:** 온보딩 플로우 (provides personalization data)

**Next Stories:**
- **Story 1.5:** AI 맞춤형 제안 (next step suggestion)
- **Story 1.6:** 데모 모드 (alternative to full onboarding)

---

## ✅ Story Completion Checklist

- [ ] welcome_shown column added to profiles table
- [ ] welcome Redux slice created
- [ ] WelcomeContent component created
- [ ] WelcomeModal component created
- [ ] Dashboard updated to include WelcomeModal
- [ ] Settings updated with "show welcome" option
- [ ] /settings route configured
- [ ] Personalization verified with real onboarding data
- [ ] Modal closes and marks welcome_shown = true
- [ ] Subsequent visits don't show welcome
- [ ] Settings "show welcome" works
- [ ] All fallback scenarios tested
- [ ] Mobile responsive verified
- [ ] Database records verified

---

**Status:** ready-for-dev
**Ready for:** Dev Agent Implementation
**Next Story:** Story 1.5 - AI 맞춤형 제안
