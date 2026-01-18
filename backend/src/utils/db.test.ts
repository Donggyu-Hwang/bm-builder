import pool from './db';

describe('Database Connection', () => {
  afterAll(async () => {
    // Close pool after all tests
    await pool.end();
  });

  it('should successfully connect to PostgreSQL', async () => {
    const client = await pool.connect();
    expect(client).toBeDefined();

    // Test basic query
    const result = await client.query('SELECT NOW() as current_time');
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0]).toHaveProperty('current_time');

    client.release();
  });

  it('should have profiles table with correct schema', async () => {
    const client = await pool.connect();

    // Check if profiles table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'profiles'
      );
    `);
    expect(tableCheck.rows[0].exists).toBe(true);

    // Check table structure
    const columns = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'profiles'
      ORDER BY ordinal_position;
    `);

    const columnNames = columns.rows.map((row) => row.column_name);
    expect(columnNames).toContain('id');
    expect(columnNames).toContain('email');
    expect(columnNames).toContain('full_name');
    expect(columnNames).toContain('avatar_url');
    expect(columnNames).toContain('onboarding_completed');
    expect(columnNames).toContain('created_at');
    expect(columnNames).toContain('updated_at');

    client.release();
  });

  it('should have indexes on email, google_id, and onboarding_completed', async () => {
    const client = await pool.connect();

    const indexes = await client.query(`
      SELECT indexname
      FROM pg_indexes
      WHERE tablename = 'profiles'
      AND indexname LIKE '%profiles_%_idx';
    `);

    const indexNames = indexes.rows.map((row) => row.indexname);
    expect(indexNames).toContain('profiles_email_idx');
    expect(indexNames).toContain('profiles_google_id_idx');
    expect(indexNames).toContain('profiles_onboarding_completed_idx');

    client.release();
  });

  it('should have updated_at trigger', async () => {
    const client = await pool.connect();

    const trigger = await client.query(`
      SELECT EXISTS (
        SELECT FROM pg_trigger
        WHERE tgname = 'update_profiles_updated_at'
      );
    `);

    expect(trigger.rows[0].exists).toBe(true);

    client.release();
  });
});
