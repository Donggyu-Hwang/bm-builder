import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { DocumentList } from './DocumentList';
import embeddedDocumentsReducer from '../../store/slices/embeddedDocumentsSlice';

// Mock the API
vi.mock('../../api/embeddedDocumentsApi', () => ({
  embeddedDocumentsApi: {
    getDocuments: vi.fn(),
  },
}));

const mockStore = () =>
  configureStore({
    reducer: {
      embeddedDocuments: embeddedDocumentsReducer,
    },
  });

const renderWithProvider = (component: React.ReactElement) => {
  return render(<Provider store={mockStore()}>{component}</Provider>);
};

describe('DocumentList Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state', () => {
    const store = configureStore({
      reducer: {
        embeddedDocuments: () => ({
          documents: [],
          stats: null,
          selectedDocument: null,
          preview: null,
          loading: true,
          updating: false,
          error: null,
          filter: 'all',
          search: '',
        }),
      },
    });

    render(
      <Provider store={store}>
        <DocumentList />
      </Provider>
    );

    expect(screen.getByText(/로딩 중/)).toBeInTheDocument();
  });

  it('should render document list', async () => {
    const store = configureStore({
      reducer: {
        embeddedDocuments: () => ({
          documents: [
            {
              id: 'doc-1',
              file_name: 'test.pdf',
              file_type: 'pdf' as const,
              size: 1024000,
              is_business_document: true,
              is_excluded: false,
              is_deleted: false,
              created_at: new Date('2024-01-01'),
              updated_at: new Date('2024-01-01'),
            },
          ],
          stats: null,
          selectedDocument: null,
          preview: null,
          loading: false,
          updating: false,
          error: null,
          filter: 'all',
          search: '',
        }),
      },
    });

    render(
      <Provider store={store}>
        <DocumentList />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('test.pdf')).toBeInTheDocument();
      expect(screen.getByText(/비즈니스/)).toBeInTheDocument();
    });
  });

  it('should render empty state when no documents', () => {
    const store = configureStore({
      reducer: {
        embeddedDocuments: () => ({
          documents: [],
          stats: null,
          selectedDocument: null,
          preview: null,
          loading: false,
          updating: false,
          error: null,
          filter: 'all',
          search: '',
        }),
      },
    });

    render(
      <Provider store={store}>
        <DocumentList />
      </Provider>
    );

    expect(screen.getByText(/표시할 문서가 없습니다/)).toBeInTheDocument();
  });

  it('should render filter buttons', () => {
    const store = configureStore({
      reducer: {
        embeddedDocuments: () => ({
          documents: [],
          stats: null,
          selectedDocument: null,
          preview: null,
          loading: false,
          updating: false,
          error: null,
          filter: 'all',
          search: '',
        }),
      },
    });

    render(
      <Provider store={store}>
        <DocumentList />
      </Provider>
    );

    expect(screen.getByText('전체 보기')).toBeInTheDocument();
    expect(screen.getByText('비즈니스 문서만')).toBeInTheDocument();
    expect(screen.getByText('제외된 문서만')).toBeInTheDocument();
  });

  it('should render search input', () => {
    const store = configureStore({
      reducer: {
        embeddedDocuments: () => ({
          documents: [],
          stats: null,
          selectedDocument: null,
          preview: null,
          loading: false,
          updating: false,
          error: null,
          filter: 'all',
          search: '',
        }),
      },
    });

    render(
      <Provider store={store}>
        <DocumentList />
      </Provider>
    );

    const searchInput = screen.getByPlaceholderText('파일명으로 검색...');
    expect(searchInput).toBeInTheDocument();
  });

  it('should update search on input change', async () => {
    const store = configureStore({
      reducer: {
        embeddedDocuments: () => ({
          documents: [],
          stats: null,
          selectedDocument: null,
          preview: null,
          loading: false,
          updating: false,
          error: null,
          filter: 'all',
          search: '',
        }),
      },
    });

    render(
      <Provider store={store}>
        <DocumentList />
      </Provider>
    );

    const searchInput = screen.getByPlaceholderText('파일명으로 검색...');
    fireEvent.change(searchInput, { target: { value: 'test search' } });

    await waitFor(() => {
      expect(searchInput).toHaveValue('test search');
    });
  });

  it('should render error message when error exists', () => {
    const store = configureStore({
      reducer: {
        embeddedDocuments: () => ({
          documents: [],
          stats: null,
          selectedDocument: null,
          preview: null,
          loading: false,
          updating: false,
          error: 'Failed to fetch documents',
          filter: 'all',
          search: '',
        }),
      },
    });

    render(
      <Provider store={store}>
        <DocumentList />
      </Provider>
    );

    expect(screen.getByText('Failed to fetch documents')).toBeInTheDocument();
  });

  it('should display document count', () => {
    const store = configureStore({
      reducer: {
        embeddedDocuments: () => ({
          documents: [
            {
              id: 'doc-1',
              file_name: 'test.pdf',
              file_type: 'pdf' as const,
              size: 1024000,
              is_business_document: true,
              is_excluded: false,
              is_deleted: false,
              created_at: new Date('2024-01-01'),
              updated_at: new Date('2024-01-01'),
            },
            {
              id: 'doc-2',
              file_name: 'test2.pdf',
              file_type: 'pdf' as const,
              size: 1024000,
              is_business_document: true,
              is_excluded: false,
              is_deleted: false,
              created_at: new Date('2024-01-01'),
              updated_at: new Date('2024-01-01'),
            },
          ],
          stats: null,
          selectedDocument: null,
          preview: null,
          loading: false,
          updating: false,
          error: null,
          filter: 'all',
          search: '',
        }),
      },
    });

    render(
      <Provider store={store}>
        <DocumentList />
      </Provider>
    );

    expect(screen.getByText('2개의 문서')).toBeInTheDocument();
  });
});
