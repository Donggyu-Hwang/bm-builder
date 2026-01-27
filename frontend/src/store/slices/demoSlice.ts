import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface DemoUser {
  id: string;
  name: string;
  email: string;
}

interface DemoDocument {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

interface DemoState {
  isDemoMode: boolean;
  demoUser: DemoUser;
  demoDocuments: DemoDocument[];
}

const initialState: DemoState = {
  isDemoMode: localStorage.getItem('demoMode') === 'true',
  demoUser: {
    id: 'demo-user-001',
    name: '데모 사용자',
    email: 'demo@bm-builder.com',
  },
  demoDocuments: [
    {
      id: 'demo-doc-001',
      title: '데모 사업계획서',
      content: `# 데모 사업계획서

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
`,
      created_at: new Date().toISOString(),
    },
  ],
};

const demoSliceObject = createSlice({
  name: 'demo',
  initialState,
  reducers: {
    startDemoMode: (state) => {
      state.isDemoMode = true;
      localStorage.setItem('demoMode', 'true');
    },
    endDemoMode: (state) => {
      state.isDemoMode = false;
      localStorage.removeItem('demoMode');
    },
    addDemoDocument: (state, action: PayloadAction<DemoDocument>) => {
      state.demoDocuments.push(action.payload);
    },
  },
});

export const { startDemoMode, endDemoMode, addDemoDocument } = demoSliceObject.actions;
export const demoSlice = demoSliceObject.reducer;
export default demoSliceObject.reducer;
