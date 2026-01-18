import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables first - specify path
const envPath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath });

import pool from './db';

async function initializeDatabase() {
  const client = await pool.connect();

  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    await client.query(schema);
    console.log('✅ Database schema initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run if called directly
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('Database initialization complete');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Database initialization failed:', error);
      process.exit(1);
    });
}

export { initializeDatabase };
