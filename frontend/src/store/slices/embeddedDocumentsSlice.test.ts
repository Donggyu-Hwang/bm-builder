import { describe, it, expect, beforeEach, vi } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import embeddedDocumentsReducer, {
  fetchDocuments,
  fetchDocumentStats,
  fetchDocumentPreview,
  updateDocument,
  clearError,
  setFilter,
  setSearch,
  setSelectedDocument,
  clearPreview,
  resetState,
  selectDocuments,
  selectStats,
  selectSelectedDocument,
  selectPreview,
  selectDocumentsLoading,
  selectDocumentsUpdating,
  selectDocumentsError,
  selectFilter,
  selectSearch,
} from './embeddedDocumentsSlice';
import { embeddedDocumentsApi } from '../../api/embeddedDocumentsApi';

// Mock the API
vi.mock('../../api/embeddedDocumentsApi', () => ({
  embeddedDocumentsApi: {
    getDocuments: vi.fn(),
    getStats: vi.fn(),
    getDocument: vi.fn(),
    getPreview: vi.fn(),
    updateDocument: vi.fn(),
    batchUpdate: vi.fn(),
  },
  DocumentFilter: {
    ALL: 'all',
    BUSINESS: 'business',
    EXCLUDED: 'excluded',
  },
}));

const mockStore = () =>
  configureStore({
    reducer: {
      embeddedDocuments: embeddedDocumentsReducer,
    },
  });

describe('embeddedDocumentsSlice', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const store = mockStore();
      const state = store.getState().embeddedDocuments;

      expect(state.documents).toEqual([]);
      expect(state.stats).toBeNull();
      expect(state.selectedDocument).toBeNull();
      expect(state.preview).toBeNull();
      expect(state.loading).toBe(false);
      expect(state.updating).toBe(false);
      expect(state.error).toBeNull();
      expect(state.filter).toBe('all');
      expect(state.search).toBe('');
    });
  });

  describe('Actions', () => {
    it('should clear error', () => {
      const store = mockStore();
      store.dispatch(clearError());
      const state = store.getState().embeddedDocuments;

      expect(state.error).toBeNull();
    });

    it('should set filter', () => {
      const store = mockStore();
      store.dispatch(setFilter('business'));
      const state = store.getState().embeddedDocuments;

      expect(state.filter).toBe('business');
    });

    it('should set search', () => {
      const store = mockStore();
      store.dispatch(setSearch('test'));
      const state = store.getState().embeddedDocuments;

      expect(state.search).toBe('test');
    });

    it('should set selected document', () => {
      const store = mockStore();
      const mockDoc = {
        id: 'doc-1',
        file_name: 'test.pdf',
        file_type: 'pdf' as const,
        size: 1024,
        is_business_document: true,
        is_excluded: false,
        is_deleted: false,
        created_at: new Date(),
        updated_at: new Date(),
      };

      store.dispatch(setSelectedDocument(mockDoc));
      const state = store.getState().embeddedDocuments;

      expect(state.selectedDocument).toEqual(mockDoc);
      expect(state.preview).toBeNull(); // Preview should be reset
    });

    it('should clear preview', () => {
      const store = mockStore();
      store.dispatch({ type: 'any', payload: { preview: 'test' } } as any);
      store.dispatch(clearPreview());
      const state = store.getState().embeddedDocuments;

      expect(state.preview).toBeNull();
    });

    it('should reset state', () => {
      const store = mockStore();
      store.dispatch(setFilter('business'));
      store.dispatch(setSearch('test'));
      store.dispatch(resetState());
      const state = store.getState().embeddedDocuments;

      expect(state.documents).toEqual([]);
      expect(state.stats).toBeNull();
      expect(state.selectedDocument).toBeNull();
      expect(state.preview).toBeNull();
      expect(state.error).toBeNull();
      expect(state.filter).toBe('all');
      expect(state.search).toBe('');
    });
  });

  describe('Async Thunks - fetchDocuments', () => {
    it('should fetch documents successfully', async () => {
      const mockDocuments = [
        {
          id: 'doc-1',
          file_name: 'test.pdf',
          file_type: 'pdf' as const,
          size: 1024,
          is_business_document: true,
          is_excluded: false,
          is_deleted: false,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      vi.mocked(embeddedDocumentsApi.getDocuments).mockResolvedValueOnce(
        mockDocuments as never
      );

      const store = mockStore();
      await store.dispatch(fetchDocuments({ filter: 'all' }));

      const state = store.getState().embeddedDocuments;
      expect(state.documents).toEqual(mockDocuments);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should handle fetchDocuments error', async () => {
      vi.mocked(embeddedDocumentsApi.getDocuments).mockRejectedValueOnce(
        new Error('Failed to fetch')
      );

      const store = mockStore();
      await store.dispatch(fetchDocuments({ filter: 'all' }));

      const state = store.getState().embeddedDocuments;
      expect(state.documents).toEqual([]);
      expect(state.loading).toBe(false);
      expect(state.error).toBe('Failed to fetch');
    });
  });

  describe('Async Thunks - fetchDocumentStats', () => {
    it('should fetch stats successfully', async () => {
      const mockStats = {
        total: 10,
        business: 7,
        excluded: 2,
      };

      vi.mocked(embeddedDocumentsApi.getStats).mockResolvedValueOnce(
        mockStats as never
      );

      const store = mockStore();
      await store.dispatch(fetchDocumentStats());

      const state = store.getState().embeddedDocuments;
      expect(state.stats).toEqual(mockStats);
      expect(state.error).toBeNull();
    });

    it('should handle fetchDocumentStats error', async () => {
      vi.mocked(embeddedDocumentsApi.getStats).mockRejectedValueOnce(
        new Error('Failed to fetch stats')
      );

      const store = mockStore();
      await store.dispatch(fetchDocumentStats());

      const state = store.getState().embeddedDocuments;
      expect(state.stats).toBeNull();
      expect(state.error).toBe('Failed to fetch stats');
    });
  });

  describe('Async Thunks - fetchDocumentPreview', () => {
    it('should fetch preview successfully', async () => {
      const mockPreview = 'Test preview content';

      vi.mocked(embeddedDocumentsApi.getPreview).mockResolvedValueOnce(
        mockPreview as never
      );

      const store = mockStore();
      await store.dispatch(fetchDocumentPreview('doc-1'));

      const state = store.getState().embeddedDocuments;
      expect(state.preview).toBe(mockPreview);
      expect(state.error).toBeNull();
    });

    it('should handle fetchDocumentPreview error', async () => {
      vi.mocked(embeddedDocumentsApi.getPreview).mockRejectedValueOnce(
        new Error('Failed to fetch preview')
      );

      const store = mockStore();
      await store.dispatch(fetchDocumentPreview('doc-1'));

      const state = store.getState().embeddedDocuments;
      expect(state.preview).toBeNull();
      expect(state.error).toBe('Failed to fetch preview');
    });
  });

  describe('Async Thunks - updateDocument', () => {
    it('should update document successfully', async () => {
      const mockDocument = {
        id: 'doc-1',
        file_name: 'test.pdf',
        file_type: 'pdf' as const,
        size: 1024,
        is_business_document: false,
        is_excluded: false,
        is_deleted: false,
        created_at: new Date(),
        updated_at: new Date(),
      };

      vi.mocked(embeddedDocumentsApi.updateDocument).mockResolvedValueOnce(
        mockDocument as never
      );

      const store = mockStore();
      store.dispatch({
        type: 'any',
        payload: { documents: [{ ...mockDocument, is_business_document: true }] },
      } as any);

      await store.dispatch(
        updateDocument({
          documentId: 'doc-1',
          updates: { is_business_document: false },
        })
      );

      const state = store.getState().embeddedDocuments;
      expect(state.updating).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should handle updateDocument error', async () => {
      vi.mocked(embeddedDocumentsApi.updateDocument).mockRejectedValueOnce(
        new Error('Failed to update')
      );

      const store = mockStore();
      await store.dispatch(
        updateDocument({
          documentId: 'doc-1',
          updates: { is_business_document: false },
        })
      );

      const state = store.getState().embeddedDocuments;
      expect(state.updating).toBe(false);
      expect(state.error).toBe('Failed to update');
    });
  });

  describe('Selectors', () => {
    it('should select documents', () => {
      const store = mockStore();
      const documents = selectDocuments(store.getState() as never);
      expect(documents).toEqual([]);
    });

    it('should select stats', () => {
      const store = mockStore();
      const stats = selectStats(store.getState() as never);
      expect(stats).toBeNull();
    });

    it('should select selected document', () => {
      const store = mockStore();
      const selectedDocument = selectSelectedDocument(store.getState() as never);
      expect(selectedDocument).toBeNull();
    });

    it('should select preview', () => {
      const store = mockStore();
      const preview = selectPreview(store.getState() as never);
      expect(preview).toBeNull();
    });

    it('should select loading state', () => {
      const store = mockStore();
      const loading = selectDocumentsLoading(store.getState() as never);
      expect(loading).toBe(false);
    });

    it('should select updating state', () => {
      const store = mockStore();
      const updating = selectDocumentsUpdating(store.getState() as never);
      expect(updating).toBe(false);
    });

    it('should select error', () => {
      const store = mockStore();
      const error = selectDocumentsError(store.getState() as never);
      expect(error).toBeNull();
    });

    it('should select filter', () => {
      const store = mockStore();
      const filter = selectFilter(store.getState() as never);
      expect(filter).toBe('all');
    });

    it('should select search', () => {
      const store = mockStore();
      const search = selectSearch(store.getState() as never);
      expect(search).toBe('');
    });
  });
});
