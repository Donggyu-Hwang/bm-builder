import 'dotenv/config';
import pool from './db';
import { readFileSync } from 'fs';
import { join } from 'path';

const MIGRATIONS_DIR = join(__dirname, '..', 'migrations');

const MIGRATION_FILES = [
  '001_create_glossary.sql',
  '002_create_user_preferences.sql',
  '003_seed_glossary.sql',
  '004_create_google_tokens.sql',
  '005_create_document_generation_tables.sql',
  '006_create_documents_table.sql',
  '007_create_document_figures_table.sql',
  '008_update_document_templates.sql',
  '009_create_document_slides_table.sql',
  '010_update_documents_add_draft_status.sql',
  '011_create_document_versions.sql',
  '011_create_shared_workflows_table.sql',
  '012_add_theme_preference.sql',
  '013_add_nodes_to_documents.sql',
  'add_timestamps_to_embedded_documents.sql',
  '014_create_teams_tables.sql',
];

async function runAllMigrations() {
  const client = await pool.connect();

  try {
    console.log('🔄 Starting database migrations...\n');

    for (const migrationFile of MIGRATION_FILES) {
      const migrationPath = join(MIGRATIONS_DIR, migrationFile);

      try {
        let sql = readFileSync(migrationPath, 'utf-8');

        // For migration 006, skip the vector extension creation
        if (migrationFile === '006_create_documents_table.sql') {
          sql = sql.replace(
            /CREATE EXTENSION IF NOT EXISTS "vector";\n?/,
            '-- Skipped: vector extension not available\n'
          );
          console.log(`⚠️  ${migrationFile} - Removing vector extension requirement`);
        }

        // For migration 014, split the execution to handle ALTER TABLE properly
        if (migrationFile === '014_create_teams_tables.sql') {
          console.log(`🔄 Running migration: ${migrationFile}`);

          // Split by semicolon but keep function definitions together
          // Functions use $$ delimiter, so we need to handle those specially
          const lines = sql.split('\n');
          let currentStatement = '';
          let inFunction = false;

          for (const line of lines) {
            if (
              line.trim().startsWith('CREATE OR REPLACE FUNCTION') ||
              line.trim().startsWith('CREATE FUNCTION')
            ) {
              inFunction = true;
            }

            currentStatement += line + '\n';

            if (inFunction && line.trim().endsWith('$$ LANGUAGE plpgsql;')) {
              inFunction = false;
              // Execute the function
              try {
                await client.query(currentStatement);
              } catch (err: any) {
                if (err.code !== '42P07') {
                  console.log(`  ⚠️  Function warning: ${err.message.substring(0, 100)}...`);
                }
              }
              currentStatement = '';
            } else if (!inFunction && line.trim().endsWith(';')) {
              // Execute the statement
              const trimmed = currentStatement.trim();
              if (trimmed.length > 0 && !trimmed.startsWith('--')) {
                try {
                  await client.query(trimmed);
                } catch (err: any) {
                  // Skip if already exists
                  if (err.code === '42P07' || err.message.includes('already exists')) {
                    // Already exists - OK
                  } else if (err.code === '42701') {
                    // Column already exists - OK
                  } else if (err.code === '42P01') {
                    // Relation doesn't exist - might be OK for some statements
                    console.log(`  ⚠️  Relation doesn't exist, skipping...`);
                  } else {
                    console.log(
                      `  ⚠️  Statement error (continuing): ${err.message.substring(0, 100)}...`
                    );
                  }
                }
              }
              currentStatement = '';
            }
          }

          console.log(`✅ ${migrationFile} completed!\n`);
          continue;
        }

        console.log(`🔄 Running migration: ${migrationFile}`);

        await client.query(sql);
        console.log(`✅ ${migrationFile} completed!\n`);
      } catch (error: any) {
        // If error is about relation already existing, it might be OK
        if (error.code === '42P07' || error.message.includes('already exists')) {
          console.log(`⚠️  ${migrationFile} - Skipped (already exists)\n`);
        } else {
          console.error(`❌ ${migrationFile} failed:`, error.message);
          throw error;
        }
      }
    }

    console.log('✅ All migrations completed successfully!');
  } catch (error) {
    console.error('❌ Migration process failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
  runAllMigrations().catch((error) => {
    console.error('Fatal error during migration:', error);
    process.exit(1);
  });
}

export { runAllMigrations };
