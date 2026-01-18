import { google } from 'googleapis';
import pool from '../utils/db';
import { googleOAuthService } from './googleOAuth.service';
import { documentClassifierService } from './documentClassifier.service';

/**
 * Scan progress interface
 */
export interface ScanProgress {
  total: number;
  scanned: number;
  business: number;
  status: 'pending' | 'scanning' | 'completed' | 'failed';
  error?: string;
}

/**
 * Google Drive file metadata interface
 */
interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  webViewLink?: string;
  parents?: string[];
  modifiedTime?: string;
}

/**
 * Google Drive Scanner Service
 * Scans and classifies files from Google Drive
 */
export class GoogleDriveScannerService {
  /**
   * Get user's access token (with auto-refresh if needed)
   */
  private async getAccessToken(userId: string): Promise<string> {
    return await googleOAuthService.getValidAccessToken(userId);
  }

  /**
   * Initialize scan progress in database
   */
  async initializeScan(userId: string): Promise<void> {
    await pool.query(
      `INSERT INTO scan_progress (user_id, status, total_files, scanned_files, business_documents)
       VALUES ($1, 'scanning', 0, 0, 0)
       ON CONFLICT (user_id)
       DO UPDATE SET
         status = 'scanning',
         total_files = 0,
         scanned_files = 0,
         business_documents = 0,
         error_message = NULL,
         started_at = CURRENT_TIMESTAMP,
         completed_at = NULL`,
      [userId]
    );
  }

  /**
   * Scan all files from Google Drive
   */
  async scanFiles(userId: string): Promise<ScanProgress> {
    try {
      await this.initializeScan(userId);

      const accessToken = await this.getAccessToken(userId);
      const drive = google.drive({ version: 'v3', auth: accessToken }) as any;

      let pageToken: string | undefined = '';
      let scannedFiles = 0;
      let businessDocuments = 0;

      // Query for supported file types
      const query = [
        "mimeType='application/pdf'",
        "or mimeType='application/vnd.openxmlformats-officedocument.wordprocessingml.document'",
        "or name contains '.hwp'"
      ].join(' ');

      // First pass: count total files
      let totalFiles = 0;
      do {
        const response: any = await drive.files.list({
          q: query,
          fields: 'nextPageToken',
          pageSize: 100,
          pageToken
        });

        // Approximate total: we can't get exact count without fetching all files
        // For now, we'll update total as we discover files
        pageToken = response.data.nextPageToken || undefined;
      } while (pageToken);

      // Reset pageToken for actual scanning
      pageToken = undefined;

      do {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const response: any = await drive.files.list({
          q: query,
          fields: 'nextPageToken, files(id, name, mimeType, size, webViewLink, parents)',
          pageSize: 100,
          pageToken
        });

        const files = response.data.files as DriveFile[] | undefined;

        if (files && files.length > 0) {
          // Update total count (accumulate as we fetch pages)
          totalFiles += files.length;
          await pool.query(
            `UPDATE scan_progress
             SET total_files = $1
             WHERE user_id = $2`,
            [totalFiles, userId]
          );

          // Process each file
          for (const file of files) {
            await this.saveFile(userId, file);

            scannedFiles++;
            if (documentClassifierService.isBusinessDocument(file)) {
              businessDocuments++;
            }

            // Update progress
            await this.updateProgress(userId, {
              scanned: scannedFiles,
              business: businessDocuments
            });
          }
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
      await this.failScan(userId, error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Scan files incrementally (only new or modified files since last sync)
   */
  async scanFilesIncremental(userId: string): Promise<ScanProgress> {
    try {
      await this.initializeScan(userId);

      const accessToken = await this.getAccessToken(userId);
      const drive = google.drive({ version: 'v3', auth: accessToken });

      // Get the last sync timestamp from the most recently synced document
      const { rows: lastSyncRows } = await pool.query(
        `SELECT MAX(google_modified_at) as last_sync
         FROM embedded_documents
         WHERE user_id = $1 AND google_modified_at IS NOT NULL`,
        [userId]
      );

      const lastSyncTime = lastSyncRows[0]?.last_sync
        ? new Date(lastSyncRows[0].last_sync)
        : new Date(0); // Epoch if no previous sync

      let pageToken: string | undefined = '';
      let totalFiles = 0;
      let scannedFiles = 0;
      let businessDocuments = 0;

      // Query for supported file types modified after last sync
      const query = [
        "mimeType='application/pdf'",
        "or mimeType='application/vnd.openxmlformats-officedocument.wordprocessingml.document'",
        "or name contains '.hwp'"
      ].join(' ');

      do {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const response: any = await (drive.files as any).list({
          q: query,
          fields: 'nextPageToken, files(id, name, mimeType, size, webViewLink, parents, modifiedTime)',
          pageSize: 100,
          pageToken
        });

        const files = response.data.files as DriveFile[] | undefined;

        if (files && files.length > 0) {
          // Filter files that are new or modified since last sync
          const changedFiles = files.filter((file) => {
            if (!file.modifiedTime) return true; // Include if no modifiedTime
            const fileModifiedTime = new Date(file.modifiedTime);
            return fileModifiedTime > lastSyncTime;
          });

          // Update total count (accumulate changed files)
          totalFiles += changedFiles.length;
          await pool.query(
            `UPDATE scan_progress
             SET total_files = $1
             WHERE user_id = $2`,
            [totalFiles, userId]
          );

          // Process each changed file
          for (const file of changedFiles) {
            await this.saveFileWithTimestamp(userId, file);

            scannedFiles++;
            if (documentClassifierService.isBusinessDocument(file)) {
              businessDocuments++;
            }

            // Update progress
            await this.updateProgress(userId, {
              scanned: scannedFiles,
              business: businessDocuments
            });
          }
        }

        pageToken = response.data.nextPageToken as string | undefined;
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
      await this.failScan(userId, error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Save file to database
   */
  private async saveFile(userId: string, file: DriveFile): Promise<void> {
    const fileType = documentClassifierService.detectFileType(
      file.mimeType,
      file.name
    );
    const isBusiness = documentClassifierService.isBusinessDocument(file);
    const fileSize = documentClassifierService.extractFileSize(file.size);
    const downloadUrl = file.webViewLink || `https://drive.google.com/file/d/${file.id}/view`;

    await pool.query(
      `INSERT INTO embedded_documents (
        user_id, file_id, file_name, file_type, download_url, size, is_business_document, google_modified_at, last_synced_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
       ON CONFLICT (file_id)
       DO UPDATE SET
         file_name = $3,
         file_type = $4,
         download_url = $5,
         size = $6,
         is_business_document = $7,
         google_modified_at = $8,
         last_synced_at = CURRENT_TIMESTAMP,
         updated_at = CURRENT_TIMESTAMP`,
      [
        userId,
        file.id,
        file.name,
        fileType,
        downloadUrl,
        fileSize,
        isBusiness,
        file.modifiedTime ? new Date(file.modifiedTime) : null
      ]
    );
  }

  /**
   * Save file to database with Google Drive timestamp
   */
  private async saveFileWithTimestamp(userId: string, file: DriveFile): Promise<void> {
    const fileType = documentClassifierService.detectFileType(
      file.mimeType,
      file.name
    );
    const isBusiness = documentClassifierService.isBusinessDocument(file);
    const fileSize = documentClassifierService.extractFileSize(file.size);
    const downloadUrl = file.webViewLink || `https://drive.google.com/file/d/${file.id}/view`;

    await pool.query(
      `INSERT INTO embedded_documents (
        user_id, file_id, file_name, file_type, download_url, size, is_business_document, google_modified_at, last_synced_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
       ON CONFLICT (file_id)
       DO UPDATE SET
         file_name = $3,
         file_type = $4,
         download_url = $5,
         size = $6,
         is_business_document = $7,
         google_modified_at = $8,
         last_synced_at = CURRENT_TIMESTAMP,
         updated_at = CURRENT_TIMESTAMP`,
      [
        userId,
        file.id,
        file.name,
        fileType,
        downloadUrl,
        fileSize,
        isBusiness,
        file.modifiedTime ? new Date(file.modifiedTime) : null
      ]
    );
  }

  /**
   * Update scan progress
   */
  private async updateProgress(
    userId: string,
    progress: Partial<Pick<ScanProgress, 'scanned' | 'business'>>
  ): Promise<void> {
    await pool.query(
      `UPDATE scan_progress
       SET scanned_files = COALESCE($1, scanned_files),
           business_documents = COALESCE($2, business_documents)
       WHERE user_id = $3`,
      [progress.scanned, progress.business, userId]
    );
  }

  /**
   * Complete scan
   */
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

  /**
   * Fail scan
   */
  private async failScan(userId: string, error: Error): Promise<void> {
    await pool.query(
      `UPDATE scan_progress
       SET status = 'failed',
           error_message = $1,
           completed_at = CURRENT_TIMESTAMP
       WHERE user_id = $2`,
      [error.message, userId]
    );
  }

  /**
   * Get current scan progress
   */
  async getScanProgress(userId: string): Promise<ScanProgress | null> {
    const { rows } = await pool.query(
      'SELECT total_files, scanned_files, business_documents, status, error_message FROM scan_progress WHERE user_id = $1',
      [userId]
    );

    if (rows.length === 0) {
      return null;
    }

    return {
      total: rows[0].total_files,
      scanned: rows[0].scanned_files,
      business: rows[0].business_documents,
      status: rows[0].status,
      error: rows[0].error_message
    };
  }

  /**
   * Calculate estimated time remaining (in seconds)
   */
  calculateEstimatedTime(progress: ScanProgress): number {
    if (progress.status !== 'scanning' || progress.scanned === 0) {
      return 0;
    }

    // Assume 1.2 seconds per file on average
    const timePerFile = 1.2;
    const remainingFiles = progress.total - progress.scanned;

    return Math.round(remainingFiles * timePerFile);
  }
}

// Export singleton instance
export const googleDriveScannerService = new GoogleDriveScannerService();
