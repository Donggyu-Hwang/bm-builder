-- Story 2.4: Connection Management
-- Creates table for storing node connections

CREATE TABLE IF NOT EXISTS connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_node_id UUID NOT NULL,
  target_node_id UUID NOT NULL,
  source_anchor VARCHAR(10) NOT NULL CHECK (source_anchor IN ('top', 'bottom', 'left', 'right')),
  target_anchor VARCHAR(10) NOT NULL CHECK (target_anchor IN ('top', 'bottom', 'left', 'right')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  -- Prevent duplicate connections
  CONSTRAINT unique_connection UNIQUE (source_node_id, target_node_id),

  -- Prevent self-loops
  CONSTRAINT no_self_loop CHECK (source_node_id != target_node_id)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_connections_source ON connections(source_node_id);
CREATE INDEX IF NOT EXISTS idx_connections_target ON connections(target_node_id);

-- Cascade delete: when a node is deleted, remove its connections
-- Note: This assumes a nodes table exists with UUID id column
-- ALTER TABLE connections
--   ADD CONSTRAINT fk_connections_source
--   FOREIGN KEY (source_node_id) REFERENCES nodes(id) ON DELETE CASCADE;

-- ALTER TABLE connections
--   ADD CONSTRAINT fk_connections_target
--   FOREIGN KEY (target_node_id) REFERENCES nodes(id) ON DELETE CASCADE;
