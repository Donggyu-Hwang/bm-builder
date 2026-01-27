import pool from '../utils/db';
import fs from 'fs';
import path from 'path';

async function runMigration() {
  console.log('🔄 Running migration 018: Add UNIQUE constraint to daily_priorities...');

  const migrationSQL = fs.readFileSync(
    path.join(__dirname, '../migrations/018_add_unique_constraint_to_daily_priorities.sql'),
    'utf-8'
  );

  try {
    await pool.query(migrationSQL);
    console.log('✅ Migration 018 completed successfully!');
    console.log('   - Added UNIQUE constraint on daily_priorities.user_id');
    console.log('   - This enables ON CONFLICT clauses for priorities routes');
  } catch (error: any) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run migration if called directly
if (require.main === module) {
  runMigration()
    .then(() => {
      console.log('\n✅ All migrations completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Migration failed:', error);
      process.exit(1);
    });
}

export default runMigration;
