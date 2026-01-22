-- Update documents table to add draft status and retry tracking
-- This migration adds support for saving partial documents and retry tracking

-- Add draft status to the check constraint
ALTER TABLE documents
DROP CONSTRAINT documents_status_check;

ALTER TABLE documents
ADD CONSTRAINT documents_status_check
CHECK (status IN ('generating', 'completed', 'failed', 'draft'));

-- Add column for tracking retry attempts
ALTER TABLE documents
ADD COLUMN IF NOT EXISTS retry_attempts INTEGER DEFAULT 0;

-- Add column for last error details
ALTER TABLE documents
ADD COLUMN IF NOT EXISTS last_error_code TEXT;

-- Add column for tracking which AI provider was used
ALTER TABLE documents
ADD COLUMN IF NOT EXISTS ai_provider TEXT DEFAULT 'claude';

-- Add index for finding draft documents
CREATE INDEX IF NOT EXISTS idx_documents_status_draft
ON documents(status, user_id)
WHERE status = 'draft';

-- Add comments for documentation
COMMENT ON COLUMN documents.status IS 'Document generation status: generating, completed, failed, draft';
COMMENT ON COLUMN documents.retry_attempts IS 'Number of retry attempts for this document';
COMMENT ON COLUMN documents.last_error_code IS 'Last error code from AI provider';
COMMENT ON COLUMN documents.ai_provider IS 'AI provider used: claude, glm, fallback';
