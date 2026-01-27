import { demoSlice, startDemoMode, endDemoMode, addDemoDocument } from './demoSlice';

describe('demoSlice', () => {
  const initialDocContent = `# 데모 사업계획서

## 1. Executive Summary
이것은 데모 모드에서 생성된 문서입니다. 실제 가입 후 AI를 통해 맞춤형 문서를 생성할 수 있습니다.

## 2. Business Model
비즈니스 모델에 대한 설명...

## 3. Market Analysis
시장 분석 내용...

## 4. Financial Projections
재무 예측...

## 5. Team
팀 소개...
`;

  const initialState = {
    isDemoMode: false,
    demoUser: {
      id: 'demo-user-001',
      name: '데모 사용자',
      email: 'demo@bm-builder.com',
    },
    demoDocuments: [
      {
        id: 'demo-doc-001',
        title: '데모 사업계획서',
        content: initialDocContent,
        created_at: expect.any(String),
      },
    ],
  };

  beforeEach(() => {
    localStorage.clear();
  });

  it('should return initial state', () => {
    expect(demoSlice(undefined, { type: 'unknown' })).toEqual({
      isDemoMode: false,
      demoUser: {
        id: 'demo-user-001',
        name: '데모 사용자',
        email: 'demo@bm-builder.com',
      },
      demoDocuments: [
        {
          id: 'demo-doc-001',
          title: '데모 사업계획서',
          content: initialDocContent,
          created_at: expect.any(String),
        },
      ],
    });
  });

  it('should start demo mode', () => {
    const state = demoSlice(initialState, startDemoMode());
    expect(state.isDemoMode).toBe(true);
    expect(localStorage.getItem('demoMode')).toBe('true');
  });

  it('should end demo mode', () => {
    const stateWithDemo = { ...initialState, isDemoMode: true };
    const state = demoSlice(stateWithDemo, endDemoMode());
    expect(state.isDemoMode).toBe(false);
    expect(localStorage.getItem('demoMode')).toBeNull();
  });

  it('should add demo document', () => {
    const newDoc = {
      id: 'demo-doc-002',
      title: '새 데모 문서',
      content: '내용',
      created_at: new Date().toISOString(),
    };

    const state = demoSlice(initialState, addDemoDocument(newDoc));
    expect(state.demoDocuments).toHaveLength(2);
    expect(state.demoDocuments[1]).toEqual(newDoc);
  });
});
