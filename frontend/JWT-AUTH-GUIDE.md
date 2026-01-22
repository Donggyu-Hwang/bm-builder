# JWT 인증 가이드

## 개요

Supabase 인증에서 JWT 기반 인증 시스템으로 마이그레이션되었습니다.

## Backend API

### 인증 엔드포인트

#### 1. 회원가입
```http
POST /api/v1/users/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123",
  "name": "John Doe"
}
```

**응답:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### 2. 로그인
```http
POST /api/v1/users/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123"
}
```

**응답:**
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### 3. 현재 사용자 정보
```http
GET /api/v1/users/me
Authorization: Bearer <token>
```

#### 4. 비밀번호 변경
```http
POST /api/v1/users/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "OldPass123",
  "newPassword": "NewPass456"
}
```

### 인증된 요청

모든 인증이 필요한 API 요청은 `Authorization` 헤더에 JWT 토큰을 포함해야 합니다:

```http
Authorization: Bearer <your-jwt-token>
```

## Frontend 구현

### 1. Auth Store/Context 생성

```typescript
// src/stores/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  name: string | null;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
  updateUser: (data: { name?: string }) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email, password) => {
        const response = await fetch('/api/v1/users/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error?.message || 'Login failed');
        }

        const data = await response.json();
        set({
          user: data.data.user,
          token: data.data.token,
          isAuthenticated: true,
        });
      },

      register: async (email, password, name) => {
        const response = await fetch('/api/v1/users/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error?.message || 'Registration failed');
        }

        const data = await response.json();
        set({
          user: data.data.user,
          token: data.data.token,
          isAuthenticated: true,
        });
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },

      updateUser: async (data) => {
        const { token } = useAuthStore.getState();
        if (!token) throw new Error('Not authenticated');

        const response = await fetch('/api/v1/users/me', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error('Failed to update user');
        }

        const result = await response.json();
        set({ user: result.data.user });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);
```

### 2. API 클라이언트에 인증 추가

```typescript
// src/api/client.ts
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

class ApiClient {
  private baseUrl: string;
  private getToken: () => string | null;

  constructor(baseUrl: string = API_URL) {
    this.baseUrl = baseUrl;
    this.getToken = () => localStorage.getItem('auth-storage')
      ? JSON.parse(localStorage.getItem('auth-storage')!).state.token
      : null;
  }

  private getHeaders() {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const error = await response.json().catch(() => ({
          message: 'An unknown error occurred',
        }));
        throw new Error(error.error?.message || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
```

### 3. 라우트 보호

```typescript
// src/components/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
```

### 4. 사용 예시

#### 로그인 페이지
```typescript
// src/pages/Login.tsx
import { useAuthStore } from '@/stores/authStore';

export function LoginPage() {
  const { login } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      // 리다이렉트
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <button type="submit">Login</button>
    </form>
  );
}
```

#### Business Models 조회 (인증 필요)
```typescript
import { apiClient } from '@/api/client';
import { useAuthStore } from '@/stores/authStore';

export function BusinessModelList() {
  const { token } = useAuthStore();
  const [models, setModels] = useState([]);

  useEffect(() => {
    if (!token) return;

    apiClient.get('/v1/business-models')
      .then(data => setModels(data.business_models))
      .catch(err => console.error(err));
  }, [token]);

  return (
    <div>
      {models.map(model => (
        <div key={model.id}>{model.name}</div>
      ))}
    </div>
  );
}
```

## 비밀번호 요구사항

- 최소 8자
- 최소 하나의 문자
- 최소 하나의 숫자
- 특수문자 선택사항: @$!%*#?&

## JWT 토큰 만료

- 기본 만료: 7일
- 환경 변수 `JWT_EXPIRES_IN`으로 변경 가능

## 다음 단계

1. ~~인증 시스템 구현~~ ✅ 완료
2. Frontend Supabase 호출을 apiClient로 교체
3. 추가 API 엔드포인트 작성 (Onboarding, Priorities)

## 보안 참고사항

- JWT_SECRET은 프로덕션에서 반드시 변경하세요
- HTTPS 사용 권장
- 비밀번호는 bcrypt로 해싱되어 DB에 저장
- 모든 인증 요청은 Authorization: Bearer <token> 헤더 필요
