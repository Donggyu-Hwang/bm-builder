-- Create shared_workflows table for storing shareable workflow links
-- This table stores information about shared node canvas workflows

CREATE TABLE IF NOT EXISTS shared_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  share_id UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  access_control VARCHAR(20) NOT NULL DEFAULT 'anyone' CHECK (access_control IN ('anyone', 'password')),
  password VARCHAR(255),
  expires_at TIMESTAMP,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  last_accessed_at TIMESTAMP,

  -- Ensure password is provided if access_control is 'password'
  CONSTRAINT password_required CHECK (
    (access_control = 'password' AND password IS NOT NULL) OR
    (access_control = 'anyone')
  )
);

-- Create indexes for faster lookups
CREATE INDEX idx_shared_workflows_share_id ON shared_workflows(share_id);
CREATE INDEX idx_shared_workflows_document_id ON shared_workflows(document_id);
CREATE INDEX idx_shared_workflows_created_by ON shared_workflows(created_by);
CREATE INDEX idx_shared_workflows_expires_at ON shared_workflows(expires_at) WHERE expires_at IS NOT NULL;

-- Add comments for documentation
COMMENT ON TABLE shared_workflows IS 'Stores shareable links for node canvas workflows';
COMMENT ON COLUMN shared_workflows.id IS 'Primary key';
COMMENT ON COLUMN shared_workflows.share_id IS 'Unique identifier for the share link (UUID)';
COMMENT ON COLUMN shared_workflows.document_id IS 'Reference to the document being shared';
COMMENT ON COLUMN shared_workflows.access_control IS 'Access control type: anyone or password';
COMMENT ON COLUMN shared_workflows.password IS 'Optional password for password-protected shares';
COMMENT ON COLUMN shared_workflows.expires_at IS 'Optional expiration date for the share link';
COMMENT ON COLUMN shared_workflows.created_by IS 'User who created the share link';
COMMENT ON COLUMN shared_workflows.created_at IS 'Timestamp when the share link was created';
COMMENT ON COLUMN shared_workflows.last_accessed_at IS 'Timestamp of last access to the shared workflow';
