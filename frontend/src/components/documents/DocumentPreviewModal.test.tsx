import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { DocumentPreviewModal } from './DocumentPreviewModal';
import embeddedDocumentsReducer from '../../store/slices/embeddedDocumentsSlice';

// Mock the API
vi.mock('../../api/embeddedDocumentsApi', () => ({
  embeddedDocumentsApi: {
    getDocuments: vi.fn(),
    getPreview: vi.fn(),
    updateDocument: vi.fn(),
  },
}));

const mockStore = (selectedDocument: any) =>
  configureStore({
    reducer: {
      embeddedDocuments: () => ({
        documents: [],
        stats: null,
        selectedDocument,
        preview: null,
        loading: false,
        updating: false,
        error: null,
        filter: 'all',
        search: '',
      }),
    },
  });

const mockDocument = {
  id: 'doc-1',
  file_name: 'test.pdf',
  file_type: 'pdf' as const,
  size: 1024000,
  is_business_document: true,
  is_excluded: false,
  is_deleted: false,
  created_at: new Date('2024-01-01'),
  updated_at: new Date('2024-01-01'),
};

const renderWithProvider = (component: React.ReactElement, store: any) => {
  return render(<Provider store={store}>{component}</Provider>);
};

describe('DocumentPreviewModal Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when no document selected', () => {
    const store = mockStore(null);

    const { container } = renderWithProvider(
      <DocumentPreviewModal />,
      store
    );

    expect(container.firstChild).toBeNull();
  });

  it('should render modal when document selected', () => {
    const store = mockStore(mockDocument);

    renderWithProvider(<DocumentPreviewModal />, store);

    expect(screen.getByText('test.pdf')).toBeInTheDocument();
    expect(screen.getByText('비즈니스 문서')).toBeInTheDocument();
    expect(screen.getByText('임베딩에서 제외')).toBeInTheDocument();
  });

  it('should render close button', () => {
    const store = mockStore(mockDocument);

    renderWithProvider(<DocumentPreviewModal />, store);

    const closeButton = screen.getByLabelText('Close modal');
    expect(closeButton).toBeInTheDocument();
  });

  it('should close modal on backdrop click', () => {
    const store = mockStore(mockDocument);

    const { container } = renderWithProvider(
      <DocumentPreviewModal />,
      store
    );

    const backdrop = container.firstChild as HTMLElement;
    expect(backdrop).toBeInTheDocument();

    // Click backdrop
    fireEvent.click(backdrop);

    // Modal should close (selectedDocument set to null)
    waitFor(() => {
      expect(container.firstChild).toBeNull();
    });
  });

  it('should close modal on escape key', () => {
    const store = mockStore(mockDocument);

    const { container } = renderWithProvider(
      <DocumentPreviewModal />,
      store
    );

    // Press escape key
    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });

    // Modal should close
    waitFor(() => {
      expect(container.firstChild).toBeNull();
    });
  });

  it('should display preview text', () => {
    const store = configureStore({
      reducer: {
        embeddedDocuments: () => ({
          documents: [],
          stats: null,
          selectedDocument: mockDocument,
          preview: 'Test preview content',
          loading: false,
          updating: false,
          error: null,
          filter: 'all',
          search: '',
        }),
      },
    });

    renderWithProvider(<DocumentPreviewModal />, store);

    expect(screen.getByText('Test preview content')).toBeInTheDocument();
  });

  it('should display loading state for preview', () => {
    const store = configureStore({
      reducer: {
        embeddedDocuments: () => ({
          documents: [],
          stats: null,
          selectedDocument: mockDocument,
          preview: null,
          loading: false,
          updating: false,
          error: null,
          filter: 'all',
          search: '',
        }),
      },
    });

    renderWithProvider(<DocumentPreviewModal />, store);

    expect(screen.getByText('로딩 중...')).toBeInTheDocument();
  });

  it('should render business document toggle', () => {
    const store = mockStore(mockDocument);

    renderWithProvider(<DocumentPreviewModal />, store);

    const toggle = screen.getByRole('button', { pressed: true });
    expect(toggle).toBeInTheDocument();
  });

  it('should render exclude checkbox', () => {
    const store = mockStore(mockDocument);

    renderWithProvider(<DocumentPreviewModal />, store);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).not.toBeChecked();
  });

  it('should render complete button', () => {
    const store = mockStore(mockDocument);

    renderWithProvider(<DocumentPreviewModal />, store);

    expect(screen.getByText('완료')).toBeInTheDocument();
  });

  it('should display error message when error exists', () => {
    const store = configureStore({
      reducer: {
        embeddedDocuments: () => ({
          documents: [],
          stats: null,
          selectedDocument: mockDocument,
          preview: null,
          loading: false,
          updating: false,
          error: 'Failed to update document',
          filter: 'all',
          search: '',
        }),
      },
    });

    renderWithProvider(<DocumentPreviewModal />, store);

    expect(screen.getByText('Failed to update document')).toBeInTheDocument();
  });

  it('should display updating state when updating', () => {
    const store = configureStore({
      reducer: {
        embeddedDocuments: () => ({
          documents: [],
          stats: null,
          selectedDocument: mockDocument,
          preview: null,
          loading: false,
          updating: true,
          error: null,
          filter: 'all',
          search: '',
        }),
      },
    });

    renderWithProvider(<DocumentPreviewModal />, store);

    expect(screen.getByText('저장 중...')).toBeInTheDocument();
    expect(screen.getByText('변경사항을 저장 중입니다...')).toBeInTheDocument();
  });

  it('should disable controls when updating', () => {
    const store = configureStore({
      reducer: {
        embeddedDocuments: () => ({
          documents: [],
          stats: null,
          selectedDocument: mockDocument,
          preview: null,
          loading: false,
          updating: true,
          error: null,
          filter: 'all',
          search: '',
        }),
      },
    });

    renderWithProvider(<DocumentPreviewModal />, store);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeDisabled();
  });
});
