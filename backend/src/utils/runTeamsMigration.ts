import 'dotenv/config';
import pool from './db';
import { readFileSync } from 'fs';
import { join } from 'path';

async function runTeamsMigration() {
  try {
    const migrationPath = join(__dirname, '..', 'migrations', '014_create_teams_tables.sql');
    const sql = readFileSync(migrationPath, 'utf-8');

    console.log('🔄 Running migration: 014_create_teams_tables.sql');
    await pool.query(sql);
    console.log('✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  runTeamsMigration().catch((error) => {
    console.error('Fatal error during migration:', error);
    process.exit(1);
  });
}

export { runTeamsMigration };
