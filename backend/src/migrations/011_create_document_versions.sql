-- Document versions table
-- Stores version history for document edits
CREATE TABLE IF NOT EXISTS document_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  UNIQUE(document_id, version_number)
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_document_versions_document_id ON document_versions(document_id);
CREATE INDEX IF NOT EXISTS idx_document_versions_created_at ON document_versions(created_at DESC);

-- Trigger to maintain max 10 versions per document
CREATE OR REPLACE FUNCTION maintain_version_limit()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete versions older than the 10 most recent when a new version is created
  DELETE FROM document_versions
  WHERE document_id = NEW.document_id
    AND id NOT IN (
      SELECT id FROM document_versions
      WHERE document_id = NEW.document_id
      ORDER BY created_at DESC
      LIMIT 10
    );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_maintain_version_limit
AFTER INSERT ON document_versions
FOR EACH ROW
EXECUTE FUNCTION maintain_version_limit();

-- Add comments
COMMENT ON TABLE document_versions IS 'Version history for documents';
COMMENT ON COLUMN document_versions.version_number IS 'Version number (starts at 1, auto-increments)';
COMMENT ON COLUMN document_versions.created_by IS 'User who created this version';
