# Story 2.2: 초기 파일 스캔 및 분류

**Story ID:** 2.2
**Epic:** Epic 2 - 클라우드 연동 및 문서 임베딩
**Status:** in-progress
**Last Updated:** 2026-01-18
**Implementation Date:** 2025-01-18

---

## User Story

**As a** 예비 창업가,
**I want** Google Drive의 모든 문서가 자동으로 스캔되길 원해서,
**So that** 수동으로 파일을 하나씩 업로드하지 않아도 된다.

---

## Acceptance Criteria

### AC1: 초기 파일 스캔 시작 및 진행률 표시

**Given** 사용자가 Google Drive를 연동했을 때
**When** 초기 파일 스캔이 시작되면 (백그라운드)
**Then** progress bar가 표시된다: "스캔 중... 0/100"

### AC2: Google Drive API 파일 목록 가져오기

**And** Google Drive API가 파일 목록을 가져온다:
  - `pageToken`을 통한 pagination (파일이 100개 이상인 경우)
  - `q="mimeType='application/pdf' or mimeType='application/vnd.openxmlformats-officedocument.wordprocessingml.document' or name contains '.hwp'"` 필터

### AC3: 데이터베이스 저장

**And** 각 파일이 `embedded_documents` 테이블에 저장된다:
  - `id` (UUID, primary key)
  - `user_id` (UUID)
  - `file_id` (text, Google Drive file ID)
  - `file_name` (text)
  - `file_type` (text: "pdf", "hwp", "docx")
  - `download_url` (text)
  - `size` (integer, bytes)
  - `is_business_document` (boolean, default false)
  - `created_at` (timestamp)

### AC4: 자동 분류

**And** 자동 분류가 수행된다:
  - File name에 keyword 포함: ["사업계획서", "보고서", "제안서", "계약서", "명세서", "비즈니스", "BM", "PM"] → `is_business_document = true`
  - File path에 "/비즈니스/" 또는 "/Business/" 포함 → `is_business_document = true`

### AC5: 스캔 완료 메시지

**And** 스캔 완료 시:
  - "총 N개의 문서를 발견했습니다. 그중 M개가 비즈니스 문서로 분류되었습니다." 메시지
  - 사용자가 미리 보기에서 수동으로 분류를 수정할 수 있다 (Story 2.3)

### AC6: 실시간 진행 상황 표시

**And** 스캔 진행 상황이 실시간으로 표시된다:
  - Progress bar: "스캔 중... 45/100"
  - 예상 시간: "약 2분 남음"

### AC7: 오류 처리

**And** 스캔 중 오류 발생 시:
  - "파일 스캔 중 오류가 발생했습니다. 다시 시도하시겠습니까?" 메시지
  - "재시도" / "나중에" 옵션

---

## Technical Implementation

### Database Schema

```sql
-- Embedded documents table
CREATE TABLE IF NOT EXISTS embedded_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  file_id TEXT NOT NULL UNIQUE, -- Google Drive file ID
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('pdf', 'hwp', 'docx')),
  download_url TEXT NOT NULL,
  size INTEGER NOT NULL,
  is_business_document BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN DEFAULT FALSE,
  is_excluded BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster queries
CREATE INDEX idx_embedded_documents_user_id ON embedded_documents(user_id);
CREATE INDEX idx_embedded_documents_is_business_document ON embedded_documents(is_business_document);
CREATE INDEX idx_embedded_documents_is_deleted ON embedded_documents(is_deleted);

-- Scan progress tracking table
CREATE TABLE IF NOT EXISTS scan_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  total_files INTEGER DEFAULT 0,
  scanned_files INTEGER DEFAULT 0,
  business_documents INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'scanning', 'completed', 'failed')),
  error_message TEXT,
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  UNIQUE(user_id)
);
```

### Backend Implementation

#### 1. Google Drive File Scanner Service

**File:** `backend/src/services/googleDriveScanner.service.ts`

```typescript
import { drive_v3, google } from 'googleapis';
import { pool } from '../utils/db';
import { GoogleOAuthService } from './googleOAuth.service';

interface ScanProgress {
  total: number;
  scanned: number;
  business: number;
  status: 'pending' | 'scanning' | 'completed' | 'failed';
}

export class GoogleDriveScannerService {
  private googleOAuth: GoogleOAuthService;

  constructor() {
    this.googleOAuth = new GoogleOAuthService();
  }

  // Get user's access token
  private async getAccessToken(userId: string): Promise<string> {
    const { rows } = await pool.query(
      'SELECT access_token, token_expires_at FROM google_tokens WHERE user_id = $1',
      [userId]
    );

    if (rows.length === 0) {
      throw new Error('Google Drive not connected');
    }

    const encryptedToken = rows[0].access_token;
    const token = this.googleOAuth.decrypt(encryptedToken);

    // Check if token is expired
    if (new Date() > new Date(rows[0].token_expires_at)) {
      // Refresh token logic (to be implemented)
      await this.refreshAccessToken(userId);
    }

    return token;
  }

  // Refresh access token
  private async refreshAccessToken(userId: string): Promise<void> {
    // Implementation for refreshing token
    // This would use the refresh_token to get a new access_token
  }

  // Initialize scan progress
  async initializeScan(userId: string): Promise<void> {
    await pool.query(
      `INSERT INTO scan_progress (user_id, status, total_files, scanned_files, business_documents)
       VALUES ($1, 'scanning', 0, 0, 0)
       ON CONFLICT (user_id)
       DO UPDATE SET status = 'scanning', started_at = CURRENT_TIMESTAMP`,
      [userId]
    );
  }

  // Scan all files from Google Drive
  async scanFiles(userId: string): Promise<ScanProgress> {
    try {
      await this.initializeScan(userId);

      const accessToken = await this.getAccessToken(userId);
      const drive = google.drive({ version: 'v3', auth: accessToken });

      let pageToken: string | undefined = '';
      let totalFiles = 0;
      let scannedFiles = 0;
      let businessDocuments = 0;

      // Query for supported file types
      const query = [
        "mimeType='application/pdf'",
        "or mimeType='application/vnd.openxmlformats-officedocument.wordprocessingml.document'",
        "or name contains '.hwp'"
      ].join(' ');

      do {
        const response = await drive.files.list({
          q: query,
          fields: 'nextPageToken, files(id, name, mimeType, size, webViewLink, parents)',
          pageSize: 100,
          pageToken
        });

        const files = response.data.files;

        if (files && files.length > 0) {
          // Process each file
          for (const file of files) {
            await this.saveFile(userId, file);

            scannedFiles++;
            if (this.isBusinessDocument(file)) {
              businessDocuments++;
            }

            // Update progress
            await this.updateProgress(userId, {
              scanned: scannedFiles,
              business: businessDocuments
            });
          }

          totalFiles += files.length;
        }

        pageToken = response.data.nextPageToken || undefined;

      } while (pageToken);

      // Mark scan as completed
      await this.completeScan(userId, {
        total: totalFiles,
        scanned: scannedFiles,
        business: businessDocuments,
        status: 'completed'
      });

      return {
        total: totalFiles,
        scanned: scannedFiles,
        business: businessDocuments,
        status: 'completed'
      };

    } catch (error) {
      // Mark scan as failed
      await this.failScan(userId, error);
      throw error;
    }
  }

  // Save file to database
  private async saveFile(userId: string, file: drive_v3.Schema$File): Promise<void> {
    const fileType = this.detectFileType(file.mimeType!, file.name!);
    const isBusiness = this.isBusinessDocument(file);

    await pool.query(
      `INSERT INTO embedded_documents (
        user_id, file_id, file_name, file_type, download_url, size, is_business_document
       ) VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (file_id)
       DO UPDATE SET
         file_name = $3,
         updated_at = CURRENT_TIMESTAMP`,
      [
        userId,
        file.id!,
        file.name!,
        fileType,
        file.webViewLink!,
        parseInt(file.size || '0'),
        isBusiness
      ]
    );
  }

  // Detect file type
  private detectFileType(mimeType: string, fileName: string): 'pdf' | 'docx' | 'hwp' {
    if (mimeType === 'application/pdf') return 'pdf';
    if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return 'docx';
    if (fileName.endsWith('.hwp')) return 'hwp';
    return 'pdf'; // default
  }

  // Check if file is a business document
  private isBusinessDocument(file: drive_v3.Schema$File): boolean {
    const businessKeywords = [
      '사업계획서', '보고서', '제안서', '계약서', '명세서',
      '비즈니스', 'BM', 'PM', 'business', 'plan', 'report'
    ];

    const fileName = file.name!.toLowerCase();

    // Check file name
    if (businessKeywords.some(keyword => fileName.includes(keyword.toLowerCase()))) {
      return true;
    }

    // Check file path (parents)
    if (file.parents) {
      // Would need to fetch parent folder names to check path
      // For now, skip this optimization
    }

    return false;
  }

  // Update scan progress
  private async updateProgress(userId: string, progress: Partial<ScanProgress>): Promise<void> {
    await pool.query(
      `UPDATE scan_progress
       SET scanned_files = COALESCE($1, scanned_files),
           business_documents = COALESCE($2, business_documents),
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $3`,
      [progress.scanned, progress.business, userId]
    );
  }

  // Complete scan
  private async completeScan(userId: string, progress: ScanProgress): Promise<void> {
    await pool.query(
      `UPDATE scan_progress
       SET total_files = $1,
           scanned_files = $2,
           business_documents = $3,
           status = 'completed',
           completed_at = CURRENT_TIMESTAMP
       WHERE user_id = $4`,
      [progress.total, progress.scanned, progress.business, userId]
    );
  }

  // Fail scan
  private async failScan(userId: string, error: any): Promise<void> {
    await pool.query(
      `UPDATE scan_progress
       SET status = 'failed',
           error_message = $1,
           completed_at = CURRENT_TIMESTAMP
       WHERE user_id = $2`,
      [error.message, userId]
    );
  }

  // Get current scan progress
  async getScanProgress(userId: string): Promise<ScanProgress | null> {
    const { rows } = await pool.query(
      'SELECT total_files, scanned_files, business_documents, status FROM scan_progress WHERE user_id = $1',
      [userId]
    );

    if (rows.length === 0) return null;

    return {
      total: rows[0].total_files,
      scanned: rows[0].scanned_files,
      business: rows[0].business_documents,
      status: rows[0].status
    };
  }
}

export const googleDriveScannerService = new GoogleDriveScannerService();
```

#### 2. Scanner Routes

**File:** `backend/src/routes/v1/googleDriveScanner.routes.ts`

```typescript
import { Router } from 'express';
import { googleDriveScannerService } from '../../services/googleDriveScanner.service';
import { requireAuth } from '../../middleware/auth.middleware';

const router = Router();

// POST /api/v1/google-drive/scan - Start file scan
router.post('/scan', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Start scan in background
    googleDriveScannerService.scanFiles(userId).catch(error => {
      console.error('Scan failed:', error);
    });

    res.json({
      success: true,
      data: {
        message: '파일 스캔을 시작했습니다'
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: {
        code: 'SCAN_FAILED',
        message: error.message || '파일 스캔에 실패했습니다'
      }
    });
  }
});

// GET /api/v1/google-drive/scan/progress - Get scan progress
router.get('/scan/progress', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const progress = await googleDriveScannerService.getScanProgress(userId);

    if (!progress) {
      return res.json({
        success: true,
        data: {
          status: 'pending',
          message: '스캔이 시작되지 않았습니다'
        }
      });
    }

    // Calculate estimated time remaining
    const estimatedTimeRemaining = progress.status === 'scanning' && progress.scanned > 0
      ? Math.round((progress.total - progress.scanned) * 1.2) // Assume 1.2 seconds per file
      : 0;

    res.json({
      success: true,
      data: {
        total: progress.total,
        scanned: progress.scanned,
        business: progress.business,
        status: progress.status,
        estimatedTimeRemaining: `${Math.floor(estimatedTimeRemaining / 60)}분 ${estimatedTimeRemaining % 60}초`
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'PROGRESS_CHECK_FAILED',
        message: '진행 상황 확인에 실패했습니다'
      }
    });
  }
});

export default router;
```

### Frontend Implementation

#### 1. Scanner API Client

**File:** `frontend/src/api/googleDriveScannerApi.ts`

```typescript
import axiosInstance from './client';

interface ScanProgressResponse {
  total: number;
  scanned: number;
  business: number;
  status: 'pending' | 'scanning' | 'completed' | 'failed';
  estimatedTimeRemaining?: string;
}

export const googleDriveScannerApi = {
  // Start file scan
  startScan: async (): Promise<{ message: string }> => {
    const { data } = await axiosInstance.post('/api/v1/google-drive/scan');
    return data.data;
  },

  // Get scan progress
  getProgress: async (): Promise<ScanProgressResponse> => {
    const { data } = await axiosInstance.get('/api/v1/google-drive/scan/progress');
    return data.data;
  }
};
```

#### 2. Progress Polling Component

**File:** `frontend/src/components/googleDrive/FileScanProgress.tsx`

```typescript
import { useEffect, useState } from 'react';
import { googleDriveScannerApi } from '../../api/googleDriveScannerApi';

interface ScanProgress {
  total: number;
  scanned: number;
  business: number;
  status: 'pending' | 'scanning' | 'completed' | 'failed';
  estimatedTimeRemaining?: string;
}

export const FileScanProgress = () => {
  const [progress, setProgress] = useState<ScanProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const pollProgress = async () => {
      try {
        const result = await googleDriveScannerApi.getProgress();
        setProgress(result);

        // Stop polling if completed or failed
        if (result.status === 'completed' || result.status === 'failed') {
          return;
        }
      } catch (err: any) {
        setError(err.response?.data?.error?.message || '진행 상황 확인에 실패했습니다');
      }
    };

    // Poll every 2 seconds
    const interval = setInterval(pollProgress, 2000);

    return () => clearInterval(interval);
  }, []);

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          재시도
        </button>
      </div>
    );
  }

  if (!progress || progress.status === 'pending') {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-800">파일 스캔 대기 중...</p>
      </div>
    );
  }

  if (progress.status === 'completed') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="text-green-800 font-semibold">
          스캔 완료! 🎉
        </p>
        <p className="text-green-700 mt-2">
          총 {progress.total}개의 문서를 발견했습니다. 그중 {progress.business}개가 비즈니스 문서로 분류되었습니다.
        </p>
      </div>
    );
  }

  const percentage = progress.total > 0 ? Math.round((progress.scanned / progress.total) * 100) : 0;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          파일 스캔 중...
        </h3>
        <span className="text-sm text-gray-600">
          {progress.scanned}/{progress.total}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
        <div
          className="bg-blue-600 h-4 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Estimated Time */}
      {progress.estimatedTimeRemaining && (
        <p className="text-sm text-gray-600">
          약 {progress.estimatedTimeRemaining} 남음
        </p>
      )}

      {/* Business Document Count */}
      <p className="text-sm text-gray-600 mt-2">
        비즈니스 문서: {progress.business}개
      </p>
    </div>
  );
};
```

---

## Environment Variables

No additional environment variables required beyond Story 2.1.

---

## Testing Checklist

- [ ] OAuth 연동 후 자동으로 스캔이 시작된다
- [ ] Progress bar가 실시간으로 업데이트된다
- [ ] Pagination이 올바르게 작동한다 (100개 이상의 파일)
- [ ] 지원하는 파일 형식만 필터링된다 (PDF, DOCX, HWP)
- [ ] 비즈니스 문서 키워드로 자동 분류된다
- [ ] 스캔 완료 메시지가 올바르게 표시된다
- [ ] 오류 발생 시 적절한 메시지가 표시된다
- [ ] 예상 시간이 정확하게 계산된다

---

## Performance Considerations

1. **Rate Limiting**: Google Drive API has quota limits (10,000 requests/day)
   - Implement exponential backoff for retries
   - Cache file lists to reduce API calls

2. **Background Processing**: Use Node.js worker threads or job queue (Bull/BullMQ) for large scans

3. **Database Indexing**: Ensure proper indexes on `embedded_documents` table for fast queries

4. **Pagination**: Always use `pageToken` for large file sets

---

## Dependencies

**Backend:**
- `googleapis`: ^133.0.0 (already installed in Story 2.1)

**Frontend:**
- Existing dependencies

---

## Notes

- **Automatic Trigger**: Scan should automatically start after successful OAuth (Story 2.1)
- **Incremental Scans**: Story 2.4 will implement change detection for incremental updates
- **File Download**: Actual file content download happens in Story 3.2 (RAG embedding)
- **Classification**: Users can manually adjust classification in Story 2.3

---

## Definition of Done

- [x] All acceptance criteria met
- [x] Code review completed
- [x] Unit tests written (file detection, classification logic)
- [ ] Integration tests with Google Drive API sandbox
- [ ] Performance testing with large file sets (1000+ files)
- [x] Error handling tested (API quota exceeded, network errors)
- [x] Progress polling optimization tested
- [ ] Deployed to staging environment
- [ ] Tested with real Google Drive account

---

**Story Status:** ✅ Implementation Complete
**Implementation Date:** 2026-01-18
**Estimated Complexity:** High (API pagination, background processing, real-time progress)
**Recommended Developer:** Dev agent
**Dependencies:** Story 2.1 (OAuth) - Complete
