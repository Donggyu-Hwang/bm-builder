import pool from '../utils/db';
import fs from 'fs';
import path from 'path';

async function runMigration016() {
  console.log('🔄 Running migration 016: Create audit tables...');

  const migrationSQL = fs.readFileSync(
    path.join(__dirname, '../migrations/016_create_audit_tables.sql'),
    'utf-8'
  );

  try {
    await pool.query(migrationSQL);
    console.log('✅ Migration 016 completed successfully!');
    console.log('   - Created audit_logs table');
    console.log('   - Created system_logs table');
  } catch (error: any) {
    if (error.code === '42P07') {
      console.log('✅ Migration 016 already applied (tables exist)');
    } else {
      console.error('❌ Migration 016 failed:', error.message);
      throw error;
    }
  }
}

async function runMigration018() {
  console.log('🔄 Running migration 018: Add UNIQUE constraint to daily_priorities...');

  const migrationSQL = fs.readFileSync(
    path.join(__dirname, '../migrations/018_add_unique_constraint_to_daily_priorities.sql'),
    'utf-8'
  );

  try {
    await pool.query(migrationSQL);
    console.log('✅ Migration 018 completed successfully!');
    console.log('   - Added UNIQUE constraint on daily_priorities.user_id');
  } catch (error: any) {
    if (error.code === '42P07' || error.code === '42P16') {
      console.log('✅ Migration 018 already applied (constraint exists)');
    } else {
      console.error('❌ Migration 018 failed:', error.message);
      throw error;
    }
  }
}

async function runAllPendingMigrations() {
  console.log('🚀 Running all pending migrations...\n');

  try {
    await runMigration016();
    console.log();
    await runMigration018();

    console.log('\n✅ All pending migrations completed successfully!');
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run migrations if called directly
if (require.main === module) {
  runAllPendingMigrations()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export default runAllPendingMigrations;
