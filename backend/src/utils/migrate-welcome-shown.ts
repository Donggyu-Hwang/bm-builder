import 'dotenv/config';
import pool from './db';

async function migrateWelcomeShown() {
  const client = await pool.connect();

  try {
    console.log('🔄 Starting migration: Add welcome_shown column...');

    // Add welcome_shown column
    await client.query(`
      ALTER TABLE public.profiles
      ADD COLUMN IF NOT EXISTS welcome_shown BOOLEAN DEFAULT FALSE;
    `);
    console.log('✅ Added welcome_shown column');

    // Create index
    await client.query(`
      CREATE INDEX IF NOT EXISTS profiles_welcome_shown_idx
      ON public.profiles(welcome_shown);
    `);
    console.log('✅ Created index on welcome_shown');

    // Add comment
    await client.query(`
      COMMENT ON COLUMN public.profiles.welcome_shown
      IS 'Tracks whether the user has seen the welcome message modal';
    `);
    console.log('✅ Added column comment');

    console.log('✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
    pool.end(); // Close connection pool
  }
}

// Run migration if called directly
if (require.main === module) {
  migrateWelcomeShown()
    .then(() => {
      console.log('🎉 All done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Migration failed:', error);
      process.exit(1);
    });
}

export default migrateWelcomeShown;
