/**
 * Migration Runner: Create Audit Tables
 */

import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

const pool = new Pool({
  host: '15.164.103.114',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'Entbe0421*',
});

async function runMigration() {
  const client = await pool.connect();
  try {
    console.log('Starting migration: 016_create_audit_tables.sql');

    const migrationPath = path.join(__dirname, '../migrations/016_create_audit_tables.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

    await client.query('BEGIN');
    await client.query(migrationSQL);
    await client.query('COMMIT');

    console.log('✅ Migration 016 completed successfully!');
    console.log('Created tables: audit_logs, system_logs');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration().catch(console.error);
