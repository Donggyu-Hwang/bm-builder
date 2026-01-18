import pool from './db';
import { readFileSync } from 'fs';
import { join } from 'path';

async function runMigration(filename: string) {
  try {
    const migrationPath = join(__dirname, '..', 'migrations', filename);
    const sql = readFileSync(migrationPath, 'utf-8');

    console.log(`\n🔄 Running migration: ${filename}`);
    await pool.query(sql);
    console.log(`✅ Migration completed: ${filename}`);
  } catch (error) {
    console.error(`❌ Migration failed: ${filename}`, error);
    throw error;
  }
}

async function runAllMigrations() {
  console.log('🚀 Starting database migrations...\n');

  const migrations = [
    '001_create_glossary.sql',
    '002_create_user_preferences.sql',
    '003_seed_glossary.sql',
  ];

  for (const migration of migrations) {
    await runMigration(migration);
  }

  console.log('\n✨ All migrations completed successfully!');
  await pool.end();
}

// Run migrations if this file is executed directly
if (require.main === module) {
  runAllMigrations().catch((error) => {
    console.error('Fatal error during migrations:', error);
    process.exit(1);
  });
}

export { runMigration, runAllMigrations };
