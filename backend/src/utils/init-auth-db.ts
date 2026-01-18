import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables first - specify path
const envPath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath });

import pool from './db';

async function initializeAuthSchema() {
  const client = await pool.connect();

  try {
    const schemaPath = path.join(__dirname, 'authSchema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    await client.query(schema);
    console.log('✅ Auth schema initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing auth schema:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run if called directly
if (require.main === module) {
  initializeAuthSchema()
    .then(() => {
      console.log('Auth schema initialization complete');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Auth schema initialization failed:', error);
      process.exit(1);
    });
}

export { initializeAuthSchema };
