/**
 * Migration: Create file scan tables
 * Date: 2025-01-18
 * Description: Creates embedded_documents and scan_progress tables for Google Drive file scanning
 */

import fs from 'fs';
import path from 'path';
import pool from '../utils/db';

export async function up(): Promise<void> {
  const schemaPath = path.join(__dirname, '../utils/fileScanSchema.sql');

  try {
    console.log('📄 Reading file scan schema...');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('🔧 Creating embedded_documents and scan_progress tables...');
    await pool.query(schema);

    console.log('✅ File scan migration completed successfully!');
  } catch (error) {
    console.error('❌ Error running file scan migration:', error);
    throw error;
  }
}

export async function down(): Promise<void> {
  try {
    console.log('🔧 Dropping file scan tables...');

    await pool.query('DROP TABLE IF EXISTS scan_progress CASCADE');
    await pool.query('DROP TABLE IF EXISTS embedded_documents CASCADE');

    console.log('✅ File scan rollback completed successfully!');
  } catch (error) {
    console.error('❌ Error rolling back file scan migration:', error);
    throw error;
  }
}

// Run if executed directly
if (require.main === module) {
  const command = process.argv[2];

  if (command === 'up') {
    up()
      .then(() => {
        console.log('🎉 Migration up complete!');
        process.exit(0);
      })
      .catch((error) => {
        console.error('💥 Migration up failed:', error);
        process.exit(1);
      });
  } else if (command === 'down') {
    down()
      .then(() => {
        console.log('🎉 Migration down complete!');
        process.exit(0);
      })
      .catch((error) => {
        console.error('💥 Migration down failed:', error);
        process.exit(1);
      });
  } else {
    console.log('Usage: ts-node 2025-01-18-file-scan-tables.ts [up|down]');
    process.exit(1);
  }
}
