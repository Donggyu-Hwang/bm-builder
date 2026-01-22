-- Add nodes column to documents table for storing node UI positions and metadata
-- This supports the Node Canvas feature (Story 6.2)

-- Add nodes column as JSONB to store node positions, colors, icons, and custom data
ALTER TABLE documents
ADD COLUMN IF NOT EXISTS nodes JSONB DEFAULT '[]';

-- Add index for efficient queries on documents with nodes
CREATE INDEX IF NOT EXISTS idx_documents_nodes ON documents USING GIN (nodes);

-- Add comment for documentation
COMMENT ON COLUMN documents.nodes IS 'Node UI data for visual workflow management (positions, colors, icons, connections)';
