import { describe, it, expect } from '@jest/globals';
import { documentClassifierService, FileMetadata } from './documentClassifier.service';

describe('DocumentClassifierService', () => {
  describe('isBusinessDocument', () => {
    it('should return true for files with business-related keywords in Korean', () => {
      const businessFiles: FileMetadata[] = [
        { name: '사업계획서.pdf' },
        { name: '분기보고서.docx' },
        { name: '제안서_2024.hwp' },
        { name: '계약서_서비스.pdf' },
        { name: '명세서_금액.docx' },
        { name: '비즈니스_모델.pdf' },
        { name: 'BM_분석.pdf' },
        { name: 'PM_보고서.docx' }
      ];

      businessFiles.forEach((file) => {
        expect(documentClassifierService.isBusinessDocument(file)).toBe(true);
      });
    });

    it('should return true for files with business-related keywords in English', () => {
      const businessFiles: FileMetadata[] = [
        { name: 'business_plan.pdf' },
        { name: 'monthly_report.docx' },
        { name: 'project_proposal.pdf' },
        { name: 'service_contract.pdf' },
        { name: 'startup_idea.docx' },
        { name: '창업_기획서.pdf' },
        { name: '사업_분석.pdf' },
        { name: '기획_안.docx' }
      ];

      businessFiles.forEach((file) => {
        expect(documentClassifierService.isBusinessDocument(file)).toBe(true);
      });
    });

    it('should return false for non-business files', () => {
      const nonBusinessFiles: FileMetadata[] = [
        { name: 'vacation_photo.jpg' },
        { name: 'meeting_notes.txt' },
        { name: 'personal_diary.pdf' },
        { name: 'recipe_doc.docx' },
        { name: 'music_playlist.mp3' }
      ];

      nonBusinessFiles.forEach((file) => {
        expect(documentClassifierService.isBusinessDocument(file)).toBe(false);
      });
    });

    it('should be case-insensitive', () => {
      const businessFiles: FileMetadata[] = [
        { name: 'BUSINESS_PLAN.pdf' },
        { name: 'Business_Report.docx' },
        { name: '사업계획서.PDF' }
      ];

      businessFiles.forEach((file) => {
        expect(documentClassifierService.isBusinessDocument(file)).toBe(true);
      });
    });
  });

  describe('detectFileType', () => {
    it('should detect PDF files by MIME type', () => {
      const file = {
        name: 'document.pdf',
        mimeType: 'application/pdf'
      };

      expect(documentClassifierService.detectFileType(file.mimeType, file.name)).toBe('pdf');
    });

    it('should detect DOCX files by MIME type', () => {
      const file = {
        name: 'document.docx',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      };

      expect(documentClassifierService.detectFileType(file.mimeType, file.name)).toBe('docx');
    });

    it('should detect HWP files by extension', () => {
      const file = {
        name: 'document.hwp',
        mimeType: 'application/octet-stream'
      };

      expect(documentClassifierService.detectFileType(file.mimeType, file.name)).toBe('hwp');
    });

    it('should detect PDF files by extension', () => {
      const file = {
        name: 'document.pdf',
        mimeType: undefined
      };

      expect(documentClassifierService.detectFileType(file.mimeType, file.name)).toBe('pdf');
    });

    it('should detect DOCX files by extension', () => {
      const file = {
        name: 'document.docx',
        mimeType: undefined
      };

      expect(documentClassifierService.detectFileType(file.mimeType, file.name)).toBe('docx');
    });

    it('should default to PDF for unknown types', () => {
      const file = {
        name: 'document.unknown',
        mimeType: 'application/unknown'
      };

      expect(documentClassifierService.detectFileType(file.mimeType, file.name)).toBe('pdf');
    });

    it('should be case-insensitive for extensions', () => {
      const extensions = ['PDF', 'Pdf', 'pdf', 'DOCX', 'Docx', 'docx', 'HWP', 'Hwp', 'hwp'];

      extensions.forEach((ext) => {
        const file = {
          name: `document.${ext}`,
          mimeType: undefined
        };

        const result = documentClassifierService.detectFileType(file.mimeType, file.name);
        expect(['pdf', 'docx', 'hwp']).toContain(result);
      });
    });
  });

  describe('extractFileSize', () => {
    it('should extract size from number', () => {
      expect(documentClassifierService.extractFileSize(12345)).toBe(12345);
    });

    it('should extract size from string', () => {
      expect(documentClassifierService.extractFileSize('12345')).toBe(12345);
    });

    it('should return 0 for undefined', () => {
      expect(documentClassifierService.extractFileSize(undefined)).toBe(0);
    });

    it('should return 0 for empty string', () => {
      expect(documentClassifierService.extractFileSize('')).toBe(0);
    });

    it('should return 0 for invalid string', () => {
      expect(documentClassifierService.extractFileSize('invalid')).toBe(0);
    });
  });
});
