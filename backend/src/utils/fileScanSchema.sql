-- Embedded documents table
-- Stores metadata of files scanned from Google Drive
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

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_embedded_documents_user_id ON embedded_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_embedded_documents_is_business_document ON embedded_documents(is_business_document);
CREATE INDEX IF NOT EXISTS idx_embedded_documents_is_deleted ON embedded_documents(is_deleted);

-- Scan progress tracking table
-- Tracks the progress of Google Drive file scanning
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

-- Index for scan progress lookups
CREATE INDEX IF NOT EXISTS idx_scan_progress_user_id ON scan_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_scan_progress_status ON scan_progress(status);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
CREATE TRIGGER update_embedded_documents_updated_at
  BEFORE UPDATE ON embedded_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
