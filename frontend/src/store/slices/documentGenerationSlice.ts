/**
 * Document Generation Redux Slice
 * Manages state for document generation feature
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  DocumentTemplate,
  SessionProgress,
  StartSessionRequest,
  SaveAnswerRequest,
  CompleteInterviewResponse,
  AbandonSessionResponse,
} from '../../../shared/types/documentGeneration.types';
import * as documentGenerationApi from '../../api/documentGenerationApi';

// Async Thunks
export const fetchAllTemplates = createAsyncThunk(
  'documentGeneration/fetchAllTemplates',
  async () => {
    return await documentGenerationApi.getAllTemplates();
  }
);

export const fetchTemplatesByCategory = createAsyncThunk(
  'documentGeneration/fetchTemplatesByCategory',
  async (category: 'gov_support' | 'ir_material') => {
    return await documentGenerationApi.getTemplatesByCategory(category);
  }
);

export const startNewSession = createAsyncThunk(
  'documentGeneration/startNewSession',
  async (request: StartSessionRequest) => {
    return await documentGenerationApi.startSession(request);
  }
);

export const saveQuestionAnswer = createAsyncThunk(
  'documentGeneration/saveQuestionAnswer',
  async ({ sessionId, request }: { sessionId: string; request: SaveAnswerRequest }) => {
    return await documentGenerationApi.saveAnswer(sessionId, request);
  }
);

export const completeSessionInterview = createAsyncThunk(
  'documentGeneration/completeSessionInterview',
  async (sessionId: string) => {
    return await documentGenerationApi.completeInterview(sessionId);
  }
);

export const abandonCurrentSession = createAsyncThunk(
  'documentGeneration/abandonCurrentSession',
  async (sessionId: string) => {
    return await documentGenerationApi.abandonSession(sessionId);
  }
);

export const fetchSessionProgress = createAsyncThunk(
  'documentGeneration/fetchSessionProgress',
  async (sessionId: string) => {
    return await documentGenerationApi.getSessionProgress(sessionId);
  }
);

// State Interface
interface DocumentGenerationState {
  // Templates
  templates: DocumentTemplate[];
  templatesByCategory: Record<string, DocumentTemplate[]>;
  templatesLoading: boolean;
  templatesError: string | null;

  // Current Session
  currentSession: {
    sessionId: string | null;
    templateType: string | null;
    templateName: string | null;
    category: 'gov_support' | 'ir_material' | null;
    status: 'interview' | 'generating' | 'completed' | 'failed' | 'abandoned' | null;
    currentQuestion: number;
    totalQuestions: number;
    answers: Record<string, string>;
  };
  sessionLoading: boolean;
  sessionError: string | null;

  // UI State
  selectedCategory: 'all' | 'gov_support' | 'ir_material';
  showExitConfirmation: boolean;
  interviewModalOpen: boolean;
}

// Initial State
const initialState: DocumentGenerationState = {
  templates: [],
  templatesByCategory: {},
  templatesLoading: false,
  templatesError: null,
  currentSession: {
    sessionId: null,
    templateType: null,
    templateName: null,
    category: null,
    status: null,
    currentQuestion: 1,
    totalQuestions: 5,
    answers: {},
  },
  sessionLoading: false,
  sessionError: null,
  selectedCategory: 'all',
  showExitConfirmation: false,
  interviewModalOpen: false,
};

// Slice
const documentGenerationSlice = createSlice({
  name: 'documentGeneration',
  initialState,
  reducers: {
    setSelectedCategory: (
      state,
      action: PayloadAction<'all' | 'gov_support' | 'ir_material'>
    ) => {
      state.selectedCategory = action.payload;
    },
    setShowExitConfirmation: (state, action: PayloadAction<boolean>) => {
      state.showExitConfirmation = action.payload;
    },
    setInterviewModalOpen: (state, action: PayloadAction<boolean>) => {
      state.interviewModalOpen = action.payload;
    },
    setCurrentQuestion: (state, action: PayloadAction<number>) => {
      state.currentSession.currentQuestion = action.payload;
    },
    resetSession: (state) => {
      state.currentSession = {
        sessionId: null,
        templateType: null,
        templateName: null,
        category: null,
        status: null,
        currentQuestion: 1,
        totalQuestions: 5,
        answers: {},
      };
    },
    clearTemplatesError: (state) => {
      state.templatesError = null;
    },
    clearSessionError: (state) => {
      state.sessionError = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch All Templates
    builder
      .addCase(fetchAllTemplates.pending, (state) => {
        state.templatesLoading = true;
        state.templatesError = null;
      })
      .addCase(fetchAllTemplates.fulfilled, (state, action) => {
        state.templatesLoading = false;
        state.templates = action.payload;
        // Group by category
        state.templatesByCategory = action.payload.reduce((acc, template) => {
          if (!acc[template.category]) {
            acc[template.category] = [];
          }
          acc[template.category].push(template);
          return acc;
        }, {} as Record<string, DocumentTemplate[]>);
      })
      .addCase(fetchAllTemplates.rejected, (state, action) => {
        state.templatesLoading = false;
        state.templatesError = action.error.message || 'Failed to fetch templates';
      });

    // Start New Session
    builder
      .addCase(startNewSession.pending, (state) => {
        state.sessionLoading = true;
        state.sessionError = null;
      })
      .addCase(startNewSession.fulfilled, (state, action) => {
        state.sessionLoading = false;
        state.currentSession.sessionId = action.payload.session_id;
        state.currentSession.templateType = action.payload.template_type;
        state.currentSession.category = action.payload.category;
        // Find template name from templates
        const template = state.templates.find(
          (t) => t.template_type === action.payload.template_type
        );
        state.currentSession.templateName = template?.template_name || null;
        state.currentSession.status = 'interview';
        state.currentSession.currentQuestion = 1;
        state.currentSession.answers = {};
      })
      .addCase(startNewSession.rejected, (state, action) => {
        state.sessionLoading = false;
        state.sessionError = action.error.message || 'Failed to start session';
      });

    // Save Answer
    builder
      .addCase(saveQuestionAnswer.fulfilled, (state, action) => {
        // Answer saved successfully, next question will be handled by UI
      })
      .addCase(saveQuestionAnswer.rejected, (state, action) => {
        state.sessionError = action.error.message || 'Failed to save answer';
      });

    // Complete Interview
    builder
      .addCase(completeSessionInterview.pending, (state) => {
        state.sessionLoading = true;
      })
      .addCase(completeSessionInterview.fulfilled, (state) => {
        state.sessionLoading = false;
        state.currentSession.status = 'completed';
      })
      .addCase(completeSessionInterview.rejected, (state, action) => {
        state.sessionLoading = false;
        state.sessionError = action.error.message || 'Failed to complete interview';
      });

    // Abandon Session
    builder
      .addCase(abandonCurrentSession.fulfilled, (state) => {
        state.currentSession = {
          sessionId: null,
          templateType: null,
          templateName: null,
          category: null,
          status: null,
          currentQuestion: 1,
          totalQuestions: 5,
          answers: {},
        };
        state.showExitConfirmation = false;
        state.interviewModalOpen = false;
      })
      .addCase(abandonCurrentSession.rejected, (state, action) => {
        state.sessionError = action.error.message || 'Failed to abandon session';
      });

    // Fetch Session Progress
    builder
      .addCase(fetchSessionProgress.fulfilled, (state, action) => {
        state.currentSession.sessionId = action.payload.session_id;
        state.currentSession.templateType = action.payload.template_type;
        state.currentSession.status = action.payload.status;
        state.currentSession.currentQuestion = action.payload.current_question;
        state.currentSession.answers = action.payload.answers;
        const template = state.templates.find(
          (t) => t.template_type === action.payload.template_type
        );
        state.currentSession.templateName = template?.template_name || null;
        state.currentSession.category = template?.category || null;
      });
  },
});

// Actions
export const {
  setSelectedCategory,
  setShowExitConfirmation,
  setInterviewModalOpen,
  setCurrentQuestion,
  resetSession,
  clearTemplatesError,
  clearSessionError,
} = documentGenerationSlice.actions;

// Selectors
export const selectTemplates = (state: { documentGeneration: DocumentGenerationState }) =>
  state.documentGeneration.templates;

export const selectTemplatesByCategory = (
  state: { documentGeneration: DocumentGenerationState },
  category: 'all' | 'gov_support' | 'ir_material'
) => {
  if (category === 'all') {
    return state.documentGeneration.templates;
  }
  return state.documentGeneration.templatesByCategory[category] || [];
};

export const selectCurrentSession = (state: {
  documentGeneration: DocumentGenerationState;
}) => state.documentGeneration.currentSession;

export const selectTemplatesLoading = (state: {
  documentGeneration: DocumentGenerationState;
}) => state.documentGeneration.templatesLoading;

export const selectSessionLoading = (state: {
  documentGeneration: DocumentGenerationState;
}) => state.documentGeneration.sessionLoading;

export const selectSelectedCategory = (state: {
  documentGeneration: DocumentGenerationState;
}) => state.documentGeneration.selectedCategory;

export const selectShowExitConfirmation = (state: {
  documentGeneration: DocumentGenerationState;
}) => state.documentGeneration.showExitConfirmation;

export const selectInterviewModalOpen = (state: {
  documentGeneration: DocumentGenerationState;
}) => state.documentGeneration.interviewModalOpen;

export default documentGenerationSlice.reducer;
