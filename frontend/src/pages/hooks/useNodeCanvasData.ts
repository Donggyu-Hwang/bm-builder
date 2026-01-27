/**
 * Hook for loading and parsing document data for NodeCanvas
 */

import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { generatedDocumentsApi, GeneratedDocument } from '../../api/generatedDocumentsApi';
import { toast } from 'react-toastify';
import api from '../../api/axios';

export interface Slide {
  id: string;
  title: string;
  content: string;
  order: number;
  status?: string;
  wordCount?: number;
  ai_generated?: boolean;
  ai_provider?: string;
  updated_at?: string;
}

export const useNodeCanvasData = () => {
  const { documentId } = useParams<{ documentId: string }>();
  const navigate = useNavigate();
  const [document, setDocument] = useState<GeneratedDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [slides, setSlides] = useState<Slide[]>([]);

  // Load document data
  useEffect(() => {
    const loadDocument = async () => {
      if (!documentId) return;

      try {
        const doc = await generatedDocumentsApi.getDocument(documentId);
        setDocument(doc);

        // If it's a pitch deck, load slides
        if (doc.template_type === 'pitch_deck') {
          await loadSlides(documentId);
        }
      } catch (error) {
        console.error('Failed to load document:', error);
        toast.error('문서를 불러오는데 실패했습니다.');
        navigate('/documents');
      } finally {
        setLoading(false);
      }
    };

    loadDocument();
  }, [documentId]);

  const loadSlides = async (docId: string) => {
    try {
      const response = await api.get(`/documents/${docId}/slides`);
      setSlides(response.data.data || []);
    } catch (error) {
      console.error('Failed to load slides:', error);
      toast.error('슬라이드를 불러오는데 실패했습니다.');
    }
  };

  // Parse document content into sections
  const parseSections = useMemo(() => {
    if (!document) return [];

    const sections: Slide[] = [];
    const content = document.content || '';

    // Parse markdown headers as sections
    const lines = content.split('\n');
    let currentSection: Slide | null = null;

    lines.forEach((line) => {
      // Match markdown headers (## or ###)
      const headerMatch = line.match(/^(#{2,3})\s+(.+)$/);

      if (headerMatch) {
        // Save previous section
        if (currentSection) {
          sections.push(currentSection);
        }

        // Start new section
        currentSection = {
          id: `section-${sections.length + 1}`,
          title: headerMatch[2].trim(),
          content: '',
          order: sections.length + 1,
          status: document.status === 'completed' ? '완료' : '진행중',
          wordCount: 0,
          ai_generated: document.ai_provider ? true : false,
          ai_provider: document.ai_provider,
          updated_at: document.updated_at,
        };
      } else if (currentSection) {
        currentSection.content += line + '\n';
        currentSection.wordCount = currentSection.content.length;
      }
    });

    // Add last section
    if (currentSection) {
      sections.push(currentSection);
    }

    // If no sections found, create a default section
    if (sections.length === 0 && content.trim()) {
      sections.push({
        id: 'section-1',
        title: document.title || '문서 내용',
        content: content,
        order: 1,
        status: document.status === 'completed' ? '완료' : '진행중',
        wordCount: content.length,
        ai_generated: document.ai_provider ? true : false,
        ai_provider: document.ai_provider,
        updated_at: document.updated_at,
      });
    }

    return sections;
  }, [document]);

  // Use slides if available, otherwise use parsed sections
  const sections: Slide[] = slides.length > 0 ? slides : parseSections;

  return {
    documentId,
    document,
    loading,
    sections,
    setDocument,
  };
};
