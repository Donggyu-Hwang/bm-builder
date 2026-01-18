-- Migration: Add last_synced_at and google_modified_at to embedded_documents
-- Story: 2.4 File Change Detection and Auto-Update

-- Add last_synced_at column to track when we last synced this file
ALTER TABLE embedded_documents
ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Add google_modified_at column to track Google Drive's modifiedTime
ALTER TABLE embedded_documents
ADD COLUMN IF NOT EXISTS google_modified_at TIMESTAMP;

-- Create index on google_modified_at for efficient incremental scan queries
CREATE INDEX IF NOT EXISTS idx_embedded_documents_google_modified_at
ON embedded_documents(google_modified_at);

-- Create index on last_synced_at for tracking sync history
CREATE INDEX IF NOT EXISTS idx_embedded_documents_last_synced_at
ON embedded_documents(last_synced_at);

-- Add comment for documentation
COMMENT ON COLUMN embedded_documents.last_synced_at IS 'Timestamp when we last synced this file from Google Drive';
COMMENT ON COLUMN embedded_documents.google_modified_at IS 'Timestamp from Google Drive API indicating when the file was last modified';
