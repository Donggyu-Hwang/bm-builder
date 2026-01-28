/**
 * Migration Runner Script (JavaScript)
 * Executes SQL migration files
 */

// Load environment variables
require('dotenv').config();

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Debug: Print env vars (without password)
console.log('Database configuration:');
console.log('  Host:', process.env.DB_HOST || 'localhost');
console.log('  Port:', process.env.DB_PORT || '5432');
console.log('  Database:', process.env.DB_NAME || 'postgres');
console.log('  User:', process.env.DB_USER || 'postgres');
console.log('  Password:', process.env.DB_PASSWORD ? '***SET***' : 'NOT SET');
console.log('');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'postgres',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
});

async function runMigration(migrationFile) {
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
    result.rows.forEach(row => {
      console.log(`  ${row.column_name}: ${row.data_type}`);
    });
    console.log('============================\n');

    // Check indexes
    const indexes = await client.query(`
      SELECT indexname, indexdef
      FROM pg_indexes
      WHERE tablename = 'lean_startup_canvases'
      ORDER BY indexname;
    `);

    console.log('📇 Indexes created:');
    console.log('============================');
    indexes.rows.forEach(row => {
      console.log(`  ${row.indexname}`);
    });
    console.log('============================\n');

  } catch (error) {
    console.error('❌ Migration failed:');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('Error detail:', error.detail);
    console.error('Full error:', error);
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
