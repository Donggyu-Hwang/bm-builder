# Story 2.2 Setup Guide

## Quick Start

### 1. Database Setup

Run the migration to create the required tables:

```bash
cd backend
npx ts-node src/migrations/2025-01-18-file-scan-tables.ts up
```

Or use the standalone script:

```bash
npx ts-node src/utils/init-file-scan-db.ts
```

**Expected output:**
```
📄 Reading file scan schema...
🔧 Creating embedded_documents and scan_progress tables...
✅ File scan database tables initialized successfully!
```

### 2. Verify Tables

Connect to PostgreSQL and verify:

```sql
-- Check if tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('embedded_documents', 'scan_progress');

-- Should return:
-- embedded_documents
-- scan_progress
```

### 3. Start Backend

```bash
cd backend
npm run dev
```

**Expected output:**
```
🚀 Server running on http://localhost:3000
📚 Health check: http://localhost:3000/health
```

### 4. Start Frontend

```bash
cd frontend
npm run dev
```

**Expected output:**
```
  VITE v5.1.0  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

---

## Testing the Implementation

### 1. Run Backend Tests

```bash
cd backend
npm test -- documentClassifier.service.test.ts
npm test -- googleDriveScanner.service.test.ts
```

**Expected:** All 27 tests should pass

### 2. Run Frontend Tests

```bash
cd frontend
npm test -- fileScanSlice.test.ts
```

**Expected:** All 15 tests should pass

---

## Manual Testing Workflow

### Step 1: Connect Google Drive

1. Navigate to Dashboard
2. Click "Connect Google Drive" button
3. Complete OAuth flow
4. **Expected:** Success message with "파일 스캔을 자동으로 시작합니다."

### Step 2: Observe Scan Progress

1. After OAuth, dashboard should show `ScanProgress` component
2. **Expected states:**
   - **Initial:** "파일 스캔 대기 중..."
   - **Scanning:** Progress bar with "파일 스캔 중... X/Y"
   - **Completed:** "스캔 완료! 🎉 총 N개의 문서를 발견했습니다..."

### Step 3: Verify Database Records

```sql
-- Check scan progress
SELECT * FROM scan_progress WHERE user_id = '<your-user-id>';

-- Check embedded documents
SELECT
  file_name,
  file_type,
  is_business_document,
  size
FROM embedded_documents
WHERE user_id = '<your-user-id>'
ORDER BY created_at DESC;
```

### Step 4: Test Error Handling

1. Disconnect Google Drive
2. Reconnect with invalid credentials (or revoke access)
3. **Expected:** Error message with "재시도" button

---

## API Testing with cURL

### Start Scan

```bash
curl -X POST http://localhost:3000/api/v1/file-scan/start \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json"
```

**Expected response:**
```json
{
  "success": true,
  "data": {
    "message": "파일 스캔을 시작했습니다",
    "status": "started"
  }
}
```

### Get Progress

```bash
curl -X GET http://localhost:3000/api/v1/file-scan/progress \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json"
```

**Expected response (while scanning):**
```json
{
  "success": true,
  "data": {
    "total": 100,
    "scanned": 45,
    "business": 10,
    "status": "scanning",
    "estimatedTimeRemaining": "1분 6초"
  }
}
```

**Expected response (completed):**
```json
{
  "success": true,
  "data": {
    "total": 100,
    "scanned": 100,
    "business": 15,
    "status": "completed"
  }
}
```

### Retry Failed Scan

```bash
curl -X POST http://localhost:3000/api/v1/file-scan/retry \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json"
```

---

## Troubleshooting

### Issue: "Google Drive not connected"

**Solution:**
1. Verify OAuth tokens in database:
   ```sql
   SELECT * FROM google_tokens WHERE user_id = '<your-user-id>';
   ```
2. If missing, complete OAuth flow again
3. Check `ENCRYPTION_KEY` is set in `.env`

### Issue: "Scan stuck at 0/0"

**Solution:**
1. Check scan progress table:
   ```sql
   SELECT * FROM scan_progress WHERE user_id = '<your-user-id>';
   ```
2. If status is 'scanning' but no progress, check backend logs
3. Verify Google Drive API access token is valid

### Issue: "Classification not working"

**Solution:**
1. Test classifier manually:
   ```bash
   cd backend
   npm test -- documentClassifier.service.test.ts
   ```
2. Check file names contain business keywords
3. Verify case sensitivity (should be case-insensitive)

### Issue: "Progress not updating in UI"

**Solution:**
1. Check Redux DevTools for state updates
2. Verify polling is active:
   ```typescript
   // In Redux DevTools, check:
   // fileScan.polling should be true during scan
   ```
3. Check browser console for errors

---

## Performance Tuning

### Adjust Polling Interval

If 2-second polling is too frequent:

**File:** `frontend/src/components/fileScan/ScanProgress.tsx`

```typescript
// Change from 2000 to higher value (e.g., 5000 for 5 seconds)
const interval = setInterval(() => {
  dispatch(fetchScanProgress());
}, 5000); // Changed from 2000
```

### Adjust Page Size for Google Drive API

**File:** `backend/src/services/googleDriveScanner.service.ts`

```typescript
const response = await drive.files.list({
  q: query,
  fields: 'nextPageToken, files(...)',
  pageSize: 100, // Can increase to 1000 for faster scanning
  pageToken
});
```

---

## Migration Rollback

If you need to rollback the migration:

```bash
cd backend
npx ts-node src/migrations/2025-01-18-file-scan-tables.ts down
```

**Warning:** This will delete all scan data and embedded documents!

---

## Next Steps

After verifying the implementation works:

1. **Story 2.3:** Implement document preview and verification UI
2. **Story 2.4:** Add file change detection with webhooks
3. **Performance:** Consider WebSocket for real-time updates (Post-MVP)

---

## Support

For issues or questions:

1. Check implementation summary: `2-2-implementation-summary.md`
2. Review story file: `2-2-initial-file-scan-and-classification.md`
3. Check logs in `backend/src/services/googleDriveScanner.service.ts`

---

**Status:** ✅ Ready for Testing
**Date:** 2025-01-18
