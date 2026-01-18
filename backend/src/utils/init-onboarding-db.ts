import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath });

import pool from './db';

async function initializeOnboardingSchema() {
  const client = await pool.connect();

  try {
    const schemaPath = path.join(__dirname, 'onboardingSchema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    await client.query(schema);
    console.log('✅ Onboarding schema initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing onboarding schema:', error);
    throw error;
  } finally {
    client.release();
  }
}

if (require.main === module) {
  initializeOnboardingSchema()
    .then(() => {
      console.log('Onboarding schema initialization complete');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Onboarding schema initialization failed:', error);
      process.exit(1);
    });
}

export { initializeOnboardingSchema };
