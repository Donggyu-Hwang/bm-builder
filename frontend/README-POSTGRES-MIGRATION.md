# PostgreSQL Migration Guide

## PostgreSQL 설정 완료

### Backend API

서버가 `http://localhost:3000`에서 실행 중입니다.

#### 사용 가능한 API 엔드포인트:

**Business Models API:**
- `GET /api/v1/business-models` - 모든 비즈니스 모델 조회
- `GET /api/v1/business-models/:id` - 특정 비즈니스 모델 조회
- `POST /api/v1/business-models` - 새 비즈니스 모델 생성
- `PUT /api/v1/business-models/:id` - 비즈니스 모델 수정
- `DELETE /api/v1/business-models/:id` - 비즈니스 모델 삭제
- `POST /api/v1/business-models/:id/blocks` - 블록 추가

**인증 헤더:**
모든 요청에 `x-user-id` 헤더를 포함해야 합니다:

```typescript
const userId = 'user-uuid-here'; // 실제 사용자 UUID
```

### Frontend 사용법

#### 1. apiClient 가져오기

```typescript
import { apiClient } from '@/api/client';
```

#### 2. Business Models 조회

```typescript
// 모든 비즈니스 모델 가져오기
const getBusinessModels = async () => {
  try {
    const response = await apiClient.get('/v1/business-models');
    return response.business_models;
  } catch (error) {
    console.error('Failed to fetch business models:', error);
  }
};
```

#### 3. 특정 비즈니스 모델 조회

```typescript
const getBusinessModel = async (id: string) => {
  try {
    const response = await apiClient.get(`/v1/business-models/${id}`);
    return response.business_model;
  } catch (error) {
    console.error('Failed to fetch business model:', error);
  }
};
```

#### 4. 새 비즈니스 모델 생성

```typescript
const createBusinessModel = async (data: {
  name: string;
  description?: string;
  canvas_data?: object;
  tags?: string[];
}) => {
  try {
    const response = await apiClient.post('/v1/business-models', data);
    return response.business_model;
  } catch (error) {
    console.error('Failed to create business model:', error);
  }
};
```

#### 5. 비즈니스 모델 수정

```typescript
const updateBusinessModel = async (
  id: string,
  data: {
    name?: string;
    description?: string;
    canvas_data?: object;
    status?: string;
    tags?: string[];
  }
) => {
  try {
    const response = await apiClient.put(`/v1/business-models/${id}`, data);
    return response.business_model;
  } catch (error) {
    console.error('Failed to update business model:', error);
  }
};
```

#### 6. 비즈니스 모델 삭제

```typescript
const deleteBusinessModel = async (id: string) => {
  try {
    await apiClient.delete(`/v1/business-models/${id}`);
    return true;
  } catch (error) {
    console.error('Failed to delete business model:', error);
    return false;
  }
};
```

#### 7. 블록 추가

```typescript
const addBlock = async (
  businessModelId: string,
  block: {
    section: string;
    content: string;
    position_x?: number;
    position_y?: number;
    width?: number;
    height?: number;
    color?: string;
    order_index?: number;
  }
) => {
  try {
    const response = await apiClient.post(
      `/v1/business-models/${businessModelId}/blocks`,
      block
    );
    return response.block;
  } catch (error) {
    console.error('Failed to add block:', error);
  }
};
```

### React 컴포넌트 예시

```typescript
import React, { useEffect, useState } from 'react';
import { apiClient } from '@/api/client';

interface BusinessModel {
  id: string;
  name: string;
  description: string | null;
  canvas_data: object;
  status: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export function BusinessModelList() {
  const [models, setModels] = useState<BusinessModel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      // Note: 현재는 userId를 헤더로 전달하지 않음
      // 실제로는 인증 시스템 구현 후 userId 헤더 추가 필요
      const response = await apiClient.get('/v1/business-models');
      setModels(response.business_models || []);
    } catch (error) {
      console.error('Failed to fetch models:', error);
    } finally {
      setLoading(false);
    }
  };

  const createModel = async () => {
    try {
      const newModel = await apiClient.post('/v1/business-models', {
        name: 'New Business Model',
        description: 'A new business model canvas',
        canvas_data: {},
      });
      setModels([...models, newModel.business_model]);
    } catch (error) {
      console.error('Failed to create model:', error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <button onClick={createModel}>Create New Model</button>
      <ul>
        {models.map((model) => (
          <li key={model.id}>{model.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

### 데이터베이스 스키마

**테이블:**
- `users` - 사용자 정보
- `business_models` - 비즈니스 모델 캔버스
- `business_model_blocks` - 비즈니스 모델 블록/스티키
- `projects` - 프로젝트
- `activity_logs` - 활동 로그

**Users 테이블:**
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

**Business Models 테이블:**
```sql
CREATE TABLE business_models (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    canvas_data JSONB NOT NULL DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'draft',
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 다음 단계

1. **인증 시스템 구현** - 현재는 `x-user-id` 헤더로 간단히 처리
2. **Frontend 컴포넌트 업데이트** - 기존 Supabase 호출을 apiClient로 교체
3. **에러 처리 개선** - API 에러를 사용자에게 표시
4. **로딩 상태 관리** - API 호출 중 로딩 표시
5. **캐싱 구현** - React Query 또는 SWR 사용 고려

### 주요 변경사항

- **Supabase 제거**: `@supabase/supabase-js` 패키지 제거
- **PostgreSQL 직접 연결**: `pg` 패키지 사용
- **RESTful API**: 백엔드 API를 통해 데이터베이스 접근
- **타입스크립트 타입**: apiClient에 제네릭 타입 지원

### 테스트

```bash
# Health check
curl http://localhost:3000/health

# Get all business models (userId 헤더 필요)
curl -H "x-user-id: test-user-id" http://localhost:3000/api/v1/business-models
```
