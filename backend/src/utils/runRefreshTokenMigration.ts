import pool from '../utils/db';

async function runMigration() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Create refresh_tokens table
    await client.query(`
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        token TEXT NOT NULL,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id)
      )
    `);

    // Create indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS refresh_tokens_user_id_idx ON refresh_tokens(user_id)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS refresh_tokens_token_idx ON refresh_tokens(token)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS refresh_tokens_expires_at_idx ON refresh_tokens(expires_at)
    `);

    // Create trigger for updated_at
    await client.query(`
      DROP TRIGGER IF EXISTS update_refresh_tokens_updated_at ON refresh_tokens
    `);
    await client.query(`
      CREATE TRIGGER update_refresh_tokens_updated_at BEFORE UPDATE ON refresh_tokens
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
    `);

    await client.query('COMMIT');
    console.log('✅ Migration completed successfully: refresh_tokens table created');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end(); // Close the pool
  }
}

runMigration()
  .then(() => {
    console.log('Migration script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration script failed:', error);
    process.exit(1);
  });
