# Database Migration Guide - Story 6.2

## Migration: Add Nodes Column to Documents Table

### Overview
This migration adds a `nodes` JSONB column to the `documents` table to support the Node Canvas feature (Story 6.2: Node Drag-and-Drop and Editing).

### Migration File
`backend/src/migrations/013_add_nodes_to_documents.sql`

### Steps to Apply Migration

#### Option 1: Using psql command line
```bash
# Set your database connection
export DATABASE_URL="postgres://user:password@localhost:5432/bm_builder"

# Run the migration
psql $DATABASE_URL -f backend/src/migrations/013_add_nodes_to_documents.sql
```

#### Option 2: Using Node.js script
Create a temporary script `run-migration.js`:
```javascript
const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function runMigration() {
  const sql = fs.readFileSync('./backend/src/migrations/013_add_nodes_to_documents.sql', 'utf8');
  await pool.query(sql);
  console.log('Migration completed successfully!');
  await pool.end();
}

runMigration().catch(console.error);
```

Run it:
```bash
node run-migration.js
```

#### Option 3: Manual SQL execution
Connect to your database and run:
```sql
-- Add nodes column as JSONB to store node UI positions and metadata
ALTER TABLE documents
ADD COLUMN IF NOT EXISTS nodes JSONB DEFAULT '[]';

-- Add index for efficient queries on documents with nodes
CREATE INDEX IF NOT EXISTS idx_documents_nodes ON documents USING GIN (nodes);

-- Add comment for documentation
COMMENT ON COLUMN documents.nodes IS 'Node UI data for visual workflow management (positions, colors, icons, connections)';
```

### Verification
After running the migration, verify it was successful:
```sql
\d documents
```

You should see the `nodes` column listed with type `jsonb`.

### Rollback (if needed)
```sql
DROP INDEX IF EXISTS idx_documents_nodes;
ALTER TABLE documents DROP COLUMN IF EXISTS nodes;
```

### What Gets Stored
The `nodes` column stores an array of node objects:
```json
[
  {
    "id": "node-1",
    "type": "section",
    "position": { "x": 100, "y": 200 },
    "data": {
      "label": "프로젝트 개요",
      "color": "#4CAF50",
      "icon": "file-text",
      "notes": "Initial project overview",
      "status": "completed",
      "wordCount": 2500
    }
  }
]
```

### Next Steps
After applying the migration, the backend API will automatically start persisting node positions when users drag nodes in the canvas.
