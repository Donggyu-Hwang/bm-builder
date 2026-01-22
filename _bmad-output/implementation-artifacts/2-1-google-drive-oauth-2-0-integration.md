# Story 2.1: Google Drive OAuth 2.0 연동

**Story ID:** 2.1
**Epic:** Epic 2 - 클라우드 연동 및 문서 임베딩
**Status:** ready-for-dev
**Last Updated:** 2026-01-18

---

## User Story

**As a** 예비 창업가,
**I want** Google Drive를 연동하려고,
**So that** 내 기존 비즈니스 문서를 AI 생성에 활용할 수 있다.

---

## Acceptance Criteria

### AC1: OAuth Consent Screen 표시

**Given** 사용자가 로그인했고 대시보드에 접속했을 때
**When** 사용자가 "Google Drive 연동하기" 버튼을 클릭하면
**Then** Google OAuth 2.0 consent screen이 표시된다

**And** consent screen이 다음 권한을 요청한다:
  - `https://www.googleapis.com/auth/drive.readonly` (읽기 전용)
  - "bm-builder가 Google Drive의 문서에 접근할 수 있도록 허용합니다"

### AC2: OAuth 토큰 저장 및 성공 메시지

**When** 사용자가 "허용"을 클릭하면
**Then**:
  - Google OAuth access token이 발급된다
  - Access token이 `google_tokens` 테이블에 저장된다:
    - `user_id` (UUID)
    - `access_token` (text, encrypted)
    - `refresh_token` (text, encrypted)
    - `token_expires_at` (timestamp)
  - `profiles.google_drive_connected = true`로 업데이트된다
  - "Google Drive가 연동되었습니다! 🎉" 성공 메시지

**And** 최초 1회 전체 파일 스캔이 자동으로 시작된다 (Story 2.2)

### AC3: OAuth 거부 처리

**When** 사용자가 OAuth를 거부하면
**Then** "Google Drive 연동이 취소되었습니다. 나중에 Settings에서 다시 연동할 수 있습니다." 메시지

### AC4: API Quota 초과 처리

**And** Google API quota 초과 시:
  - "Google API quota를 초과했습니다. 1시간 후에 다시 시도해주세요." 에러 메시지
  - 1시간 후 retry 가능하도록 UI 제한

---

## Technical Implementation

### Database Schema

```sql
-- Google OAuth tokens table
CREATE TABLE IF NOT EXISTS google_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  token_expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);

-- Update profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS google_drive_connected BOOLEAN DEFAULT FALSE;
```

### Backend Implementation

#### 1. Google OAuth Configuration

**File:** `backend/src/config/google.config.ts`

```typescript
export const googleOAuthConfig = {
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5173/auth/google/callback',
  scopes: [
    'https://www.googleapis.com/auth/drive.readonly'
  ]
};
```

#### 2. OAuth Service

**File:** `backend/src/services/googleOAuth.service.ts`

```typescript
import { google } from 'googleapis';
import { pool } from '../utils/db';

interface OAuthToken {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export class GoogleOAuthService {
  private oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  // Generate authorization URL
  getAuthUrl(state: string): string {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/drive.readonly'],
      state,
      prompt: 'consent'
    });
  }

  // Exchange code for tokens
  async exchangeCodeForTokens(code: string): Promise<OAuthToken> {
    const { tokens } = await this.oauth2Client.getToken(code);
    return {
      access_token: tokens.access_token!,
      refresh_token: tokens.refresh_token!,
      expires_in: tokens.expiry_date ? Math.floor((tokens.expiry_date - Date.now()) / 1000) : 3600
    };
  }

  // Save tokens to database (encrypted)
  async saveTokens(userId: string, tokens: OAuthToken): Promise<void> {
    const encryptedAccess = this.encrypt(tokens.access_token);
    const encryptedRefresh = this.encrypt(tokens.refresh_token);
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);

    await pool.query(
      `INSERT INTO google_tokens (user_id, access_token, refresh_token, token_expires_at)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id)
       DO UPDATE SET
         access_token = $2,
         refresh_token = $3,
         token_expires_at = $4,
         updated_at = CURRENT_TIMESTAMP`,
      [userId, encryptedAccess, encryptedRefresh, expiresAt]
    );

    // Update profile
    await pool.query(
      'UPDATE profiles SET google_drive_connected = true WHERE id = $1',
      [userId]
    );
  }

  // Simple encryption (use proper encryption in production)
  private encrypt(text: string): string {
    const crypto = require('crypto');
    const algorithm = 'aes-256-cbc';
    const key = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex');
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return `${iv.toString('hex')}:${encrypted}`;
  }
}

export const googleOAuthService = new GoogleOAuthService();
```

#### 3. OAuth Routes

**File:** `backend/src/routes/v1/googleDrive.routes.ts`

```typescript
import { Router } from 'express';
import { googleOAuthService } from '../../services/googleOAuth.service';
import { requireAuth } from '../../middleware/auth.middleware';

const router = Router();

// GET /api/v1/google-drive/auth-url - Get authorization URL
router.get('/auth-url', requireAuth, async (req, res) => {
  try {
    const state = Math.random().toString(36).substring(7); // Simple state
    const authUrl = googleOAuthService.getAuthUrl(state);

    res.json({
      success: true,
      data: { authUrl, state }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'OAUTH_ERROR',
        message: 'OAuth URL 생성에 실패했습니다'
      }
    });
  }
});

// POST /api/v1/google-drive/callback - Handle OAuth callback
router.post('/callback', requireAuth, async (req, res) => {
  try {
    const { code, state } = req.body;
    const userId = req.user.id;

    if (!code) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_CODE',
          message: 'OAuth 코드가 없습니다'
        }
      });
    }

    // Exchange code for tokens
    const tokens = await googleOAuthService.exchangeCodeForTokens(code);

    // Save to database
    await googleOAuthService.saveTokens(userId, tokens);

    res.json({
      success: true,
      data: {
        message: 'Google Drive가 연동되었습니다! 🎉',
        googleDriveConnected: true
      }
    });
  } catch (error: any) {
    // Handle API quota exceeded
    if (error.code === 429) {
      return res.status(429).json({
        success: false,
        error: {
          code: 'QUOTA_EXCEEDED',
          message: 'Google API quota를 초과했습니다. 1시간 후에 다시 시도해주세요.'
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'OAUTH_FAILED',
        message: 'OAuth 연동에 실패했습니다'
      }
    });
  }
});

// GET /api/v1/google-drive/status - Check connection status
router.get('/status', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    const { rows } = await pool.query(
      'SELECT google_drive_connected FROM profiles WHERE id = $1',
      [userId]
    );

    res.json({
      success: true,
      data: {
        googleDriveConnected: rows[0]?.google_drive_connected || false
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'STATUS_CHECK_FAILED',
        message: '연동 상태 확인에 실패했습니다'
      }
    });
  }
});

export default router;
```

### Frontend Implementation

#### 1. Google Drive API Client

**File:** `frontend/src/api/googleDriveApi.ts`

```typescript
import axiosInstance from './client';

interface AuthUrlResponse {
  authUrl: string;
  state: string;
}

interface CallbackResponse {
  message: string;
  googleDriveConnected: boolean;
}

interface StatusResponse {
  googleDriveConnected: boolean;
}

export const googleDriveApi = {
  // Get OAuth authorization URL
  getAuthUrl: async (): Promise<AuthUrlResponse> => {
    const { data } = await axiosInstance.get('/api/v1/google-drive/auth-url');
    return data.data;
  },

  // Handle OAuth callback
  handleCallback: async (code: string, state: string): Promise<CallbackResponse> => {
    const { data } = await axiosInstance.post('/api/v1/google-drive/callback', {
      code,
      state
    });
    return data.data;
  },

  // Check connection status
  getStatus: async (): Promise<StatusResponse> => {
    const { data } = await axiosInstance.get('/api/v1/google-drive/status');
    return data.data;
  }
};
```

#### 2. Redux Slice

**File:** `frontend/src/store/slices/googleDriveSlice.ts`

```typescript
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { googleDriveApi } from '../../api/googleDriveApi';

interface GoogleDriveState {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
}

const initialState: GoogleDriveState = {
  isConnected: false,
  isConnecting: false,
  error: null
};

export const checkConnectionStatus = createAsyncThunk(
  'googleDrive/checkStatus',
  async () => {
    return await googleDriveApi.getStatus();
  }
);

export const connectGoogleDrive = createAsyncThunk(
  'googleDrive/connect',
  async () => {
    const { authUrl } = await googleDriveApi.getAuthUrl();
    // Redirect to Google OAuth
    window.location.href = authUrl;
  }
);

const googleDriveSlice = createSlice({
  name: 'googleDrive',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkConnectionStatus.fulfilled, (state, action) => {
        state.isConnected = action.payload.googleDriveConnected;
      })
      .addCase(connectGoogleDrive.pending, (state) => {
        state.isConnecting = true;
        state.error = null;
      })
      .addCase(connectGoogleDrive.fulfilled, (state) => {
        state.isConnecting = false;
      })
      .addCase(connectGoogleDrive.rejected, (state, action) => {
        state.isConnecting = false;
        state.error = action.payload as string;
      });
  }
});

export const { clearError } = googleDriveSlice.actions;
export const selectIsConnected = (state: RootState) => state.googleDrive.isConnected;
export const selectIsConnecting = (state: RootState) => state.googleDrive.isConnecting;

export default googleDriveSlice.reducer;
```

#### 3. OAuth Callback Handler Component

**File:** `frontend/src/components/auth/GoogleOAuthCallback.tsx`

```typescript
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { googleDriveApi } from '../../api/googleDriveApi';

const GoogleOAuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const error = searchParams.get('error');

      if (error) {
        // User denied OAuth
        navigate('/dashboard', {
          state: {
            message: 'Google Drive 연동이 취소되었습니다. 나중에 Settings에서 다시 연동할 수 있습니다.',
            type: 'info'
          }
        });
        return;
      }

      if (code) {
        try {
          const response = await googleDriveApi.handleCallback(code, state || '');

          // Show success message and redirect
          navigate('/dashboard', {
            state: {
              message: response.message,
              type: 'success'
            }
          });

          // Trigger file scan (Story 2.2)
          // This will be implemented in Story 2.2
        } catch (error: any) {
          navigate('/dashboard', {
            state: {
              message: error.response?.data?.error?.message || 'OAuth 연동에 실패했습니다',
              type: 'error'
            }
          });
        }
      }
    };

    handleCallback();
  }, [searchParams, navigate, dispatch]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Google Drive 연동 처리 중...</p>
      </div>
    </div>
  );
};

export default GoogleOAuthCallback;
```

---

## Environment Variables

**File:** `backend/.env`

```bash
# Google OAuth 2.0
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:5173/auth/google/callback

# Encryption (for token storage)
ENCRYPTION_KEY=32-byte-hex-key-for-token-encryption
```

---

## Testing Checklist

- [ ] OAuth consent screen이 올바른 권한으로 표시된다
- [ ] 사용자가 "허용" 시 토큰이 데이터베이스에 암호화되어 저장된다
- [ ] `profiles.google_drive_connected`가 true로 업데이트된다
- [ ] 성공 메시지가 표시된다
- [ ] 사용자가 OAuth를 거부 시 적절한 메시지가 표시된다
- [ ] API quota 초과 시 429 에러와 메시지가 반환된다
- [ ] 토큰 만료 시 자동으로 refresh token으로 갱신된다

---

## Dependencies

**Backend:**
- `googleapis`: ^133.0.0 (Google API client library)
- `crypto`: Built-in Node.js module

**Frontend:**
- Existing dependencies (React Router, Redux Toolkit)

---

## Notes

- **Security**: Access/refresh tokens must be encrypted at rest
- **Token Refresh**: Implement background job to refresh tokens before expiry
- **Rate Limiting**: Google Drive API has quota limits (10,000 requests/day)
- **Next Step**: After successful OAuth, automatically trigger Story 2.2 (Initial File Scan)

---

## Definition of Done

- [x] All acceptance criteria met
- [ ] Code review completed
- [ ] Unit tests written (OAuth flow, token encryption)
- [ ] Integration tests with Google API sandbox
- [ ] Environment variables documented
- [ ] API endpoints documented in OpenAPI spec
- [ ] Security audit (token encryption, OAuth flow)
- [ ] Deployed to staging environment
- [ ] Tested with real Google OAuth flow

---

**Story Status:** ✅ Ready for Development
**Estimated Complexity:** Medium (OAuth flow + encryption)
**Recommended Developer:** Dev agent
**Dependencies:** Epic 1 (Authentication), Google Cloud Console setup
