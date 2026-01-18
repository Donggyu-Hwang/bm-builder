/**
 * Test setup for googleDriveScanner service tests
 * This file ensures the database tables exist before running tests
 */

import pool from '../utils/db';

export async function setupTestDatabase(): Promise<void> {
  try {
    // Drop existing tables first to remove foreign key constraints
    await pool.query('DROP TABLE IF EXISTS embedded_documents CASCADE');
    await pool.query('DROP TABLE IF EXISTS scan_progress CASCADE');

    // Create embedded_documents table (without foreign key for testing)
    await pool.query(`
      CREATE TABLE embedded_documents (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        file_id TEXT NOT NULL UNIQUE,
        file_name TEXT NOT NULL,
        file_type TEXT NOT NULL CHECK (file_type IN ('pdf', 'hwp', 'docx')),
        download_url TEXT NOT NULL,
        size INTEGER NOT NULL,
        is_business_document BOOLEAN DEFAULT FALSE,
        is_deleted BOOLEAN DEFAULT FALSE,
        is_excluded BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes
    await pool.query(`
      CREATE INDEX idx_embedded_documents_user_id
      ON embedded_documents(user_id)
    `);
    await pool.query(`
      CREATE INDEX idx_embedded_documents_is_business_document
      ON embedded_documents(is_business_document)
    `);
    await pool.query(`
      CREATE INDEX idx_embedded_documents_is_deleted
      ON embedded_documents(is_deleted)
    `);

    // Create scan_progress table (without foreign key for testing)
    await pool.query(`
      CREATE TABLE scan_progress (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        total_files INTEGER DEFAULT 0,
        scanned_files INTEGER DEFAULT 0,
        business_documents INTEGER DEFAULT 0,
        status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'scanning', 'completed', 'failed')),
        error_message TEXT,
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP,
        UNIQUE(user_id)
      )
    `);

    // Create indexes
    await pool.query(`
      CREATE INDEX idx_scan_progress_user_id
      ON scan_progress(user_id)
    `);
    await pool.query(`
      CREATE INDEX idx_scan_progress_status
      ON scan_progress(status)
    `);

    // Create trigger function for updated_at
    await pool.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $body$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $body$ language 'plpgsql'
    `);

    // Create trigger
    await pool.query(`
      DROP TRIGGER IF EXISTS update_embedded_documents_updated_at
      ON embedded_documents
    `);
    await pool.query(`
      CREATE TRIGGER update_embedded_documents_updated_at
        BEFORE UPDATE ON embedded_documents
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column()
    `);

    console.log('✅ Test database setup complete');
  } catch (error) {
    console.error('❌ Test database setup failed:', error);
    throw error;
  }
}

// Auto-setup if run directly
if (require.main === module) {
  setupTestDatabase()
    .then(() => {
      console.log('🎉 Setup complete, you can now run tests');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Setup failed:', error);
      process.exit(1);
    });
}
