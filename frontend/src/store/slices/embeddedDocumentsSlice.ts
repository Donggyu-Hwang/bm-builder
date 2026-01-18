import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  embeddedDocumentsApi,
  EmbeddedDocument,
  DocumentStats,
  UpdateDocumentInput,
  DocumentFilter,
} from '../../api/embeddedDocumentsApi';

/**
 * Embedded Documents State
 */
interface EmbeddedDocumentsState {
  documents: EmbeddedDocument[];
  stats: DocumentStats | null;
  selectedDocument: EmbeddedDocument | null;
  preview: string | null;
  loading: boolean;
  updating: boolean;
  error: string | null;
  filter: DocumentFilter;
  search: string;
}

const initialState: EmbeddedDocumentsState = {
  documents: [],
  stats: null,
  selectedDocument: null,
  preview: null,
  loading: false,
  updating: false,
  error: null,
  filter: 'all',
  search: ''
};

/**
 * Async Thunks
 */
export const fetchDocuments = createAsyncThunk(
  'embeddedDocuments/fetchDocuments',
  async (
    { filter, search }: { filter?: DocumentFilter; search?: string },
    { rejectWithValue }
  ) => {
    try {
      const documents = await embeddedDocumentsApi.getDocuments(filter, search);
      return documents;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : '문서 목록을 가져오는데 실패했습니다';
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchDocumentStats = createAsyncThunk(
  'embeddedDocuments/fetchDocumentStats',
  async (_, { rejectWithValue }) => {
    try {
      const stats = await embeddedDocumentsApi.getStats();
      return stats;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : '통계를 가져오는데 실패했습니다';
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchDocumentPreview = createAsyncThunk(
  'embeddedDocuments/fetchDocumentPreview',
  async (documentId: string, { rejectWithValue }) => {
    try {
      const preview = await embeddedDocumentsApi.getPreview(documentId);
      return preview;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : '미리보기를 가져오는데 실패했습니다';
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateDocument = createAsyncThunk(
  'embeddedDocuments/updateDocument',
  async (
    { documentId, updates }: { documentId: string; updates: UpdateDocumentInput },
    { rejectWithValue }
  ) => {
    try {
      const updatedDocument = await embeddedDocumentsApi.updateDocument(
        documentId,
        updates
      );
      return updatedDocument;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : '문서 업데이트에 실패했습니다';
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Embedded Documents Slice
 */
const embeddedDocumentsSlice = createSlice({
  name: 'embeddedDocuments',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setFilter: (state, action: PayloadAction<DocumentFilter>) => {
      state.filter = action.payload;
    },
    setSearch: (state, action: PayloadAction<string>) => {
      state.search = action.payload;
    },
    setSelectedDocument: (state, action: PayloadAction<EmbeddedDocument | null>) => {
      state.selectedDocument = action.payload;
      state.preview = null; // Reset preview when changing document
    },
    clearPreview: (state) => {
      state.preview = null;
    },
    resetState: (state) => {
      state.documents = [];
      state.stats = null;
      state.selectedDocument = null;
      state.preview = null;
      state.error = null;
      state.filter = 'all';
      state.search = '';
    }
  },
  extraReducers: (builder) => {
    // fetchDocuments
    builder
      .addCase(fetchDocuments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDocuments.fulfilled, (state, action) => {
        state.loading = false;
        state.documents = action.payload;
      })
      .addCase(fetchDocuments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // fetchDocumentStats
    builder
      .addCase(fetchDocumentStats.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchDocumentStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      .addCase(fetchDocumentStats.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // fetchDocumentPreview
    builder
      .addCase(fetchDocumentPreview.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchDocumentPreview.fulfilled, (state, action) => {
        state.preview = action.payload;
      })
      .addCase(fetchDocumentPreview.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // updateDocument
    builder
      .addCase(updateDocument.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateDocument.fulfilled, (state, action) => {
        state.updating = false;
        // Update document in list
        const index = state.documents.findIndex(
          (doc) => doc.id === action.payload.id
        );
        if (index !== -1) {
          state.documents[index] = action.payload;
        }
        // Update selected document if it matches
        if (state.selectedDocument?.id === action.payload.id) {
          state.selectedDocument = action.payload;
        }
      })
      .addCase(updateDocument.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload as string;
      });
  }
});

/**
 * Actions
 */
export const {
  clearError,
  setFilter,
  setSearch,
  setSelectedDocument,
  clearPreview,
  resetState,
} = embeddedDocumentsSlice.actions;

/**
 * Selectors
 */
export const selectDocuments = (state: {
  embeddedDocuments: EmbeddedDocumentsState
}) => state.embeddedDocuments.documents;

export const selectStats = (state: {
  embeddedDocuments: EmbeddedDocumentsState
}) => state.embeddedDocuments.stats;

export const selectSelectedDocument = (state: {
  embeddedDocuments: EmbeddedDocumentsState
}) => state.embeddedDocuments.selectedDocument;

export const selectPreview = (state: {
  embeddedDocuments: EmbeddedDocumentsState
}) => state.embeddedDocuments.preview;

export const selectDocumentsLoading = (state: {
  embeddedDocuments: EmbeddedDocumentsState
}) => state.embeddedDocuments.loading;

export const selectDocumentsUpdating = (state: {
  embeddedDocuments: EmbeddedDocumentsState
}) => state.embeddedDocuments.updating;

export const selectDocumentsError = (state: {
  embeddedDocuments: EmbeddedDocumentsState
}) => state.embeddedDocuments.error;

export const selectFilter = (state: {
  embeddedDocuments: EmbeddedDocumentsState
}) => state.embeddedDocuments.filter;

export const selectSearch = (state: {
  embeddedDocuments: EmbeddedDocumentsState
}) => state.embeddedDocuments.search;

/**
 * Reducer
 */
export default embeddedDocumentsSlice.reducer;
