/**
 * Migration Runner Script
 * Executes SQL migration files
 */

import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function runMigration(migrationFile: string) {
  const migrationPath = path.join(__dirname, '../supabase/migrations', migrationFile);

  console.log(`\n📄 Reading migration: ${migrationFile}`);
  const sql = fs.readFileSync(migrationPath, 'utf8');

  console.log('🔌 Connecting to database...');
  const client = await pool.connect();

  try {
    console.log('⚡ Executing migration...\n');
    await client.query(sql);

    console.log('✅ Migration completed successfully!\n');

    // Verify table creation
    const result = await client.query(`
      SELECT table_name, column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'lean_startup_canvases'
      ORDER BY ordinal_position;
    `);

    console.log('📊 Table structure verified:');
    console.log('============================');
    result.rows.forEach((row) => {
      console.log(`  ${row.column_name}: ${row.data_type}`);
    });
    console.log('============================\n');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the migration
runMigration('20250128000001_create_lean_startup_canvases.sql')
  .then(() => {
    console.log('🎉 All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error:', error.message);
    process.exit(1);
  });
