import 'dotenv/config';
import pool from './db';
import * as fs from 'fs/promises';
import * as path from 'path';

async function initPrioritiesDb() {
  const client = await pool.connect();

  try {
    console.log('🔧 Creating daily_priorities table...');

    // Read and execute the schema
    const schemaPath = path.join(__dirname, 'prioritiesSchema.sql');
    const schema = await fs.readFile(schemaPath, 'utf-8');

    await client.query(schema);

    console.log('✅ daily_priorities table created successfully');
  } catch (error) {
    console.error('❌ Error creating daily_priorities table:', error);
    throw error;
  } finally {
    client.release();
    pool.end(); // Close the pool when done
  }
}

// Run the initialization
if (require.main === module) {
  initPrioritiesDb()
    .then(() => {
      console.log('✅ Database initialization completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Database initialization failed:', error);
      process.exit(1);
    });
}

export default initPrioritiesDb;
