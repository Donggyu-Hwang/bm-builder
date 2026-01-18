import fs from 'fs';
import path from 'path';
import pool from './db';

/**
 * Initialize file scan database tables
 */
async function initFileScanDB(): Promise<void> {
  const schemaPath = path.join(__dirname, 'fileScanSchema.sql');

  try {
    console.log('📄 Reading file scan schema...');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('🔧 Creating embedded_documents and scan_progress tables...');
    await pool.query(schema);

    console.log('✅ File scan database tables initialized successfully!');
  } catch (error) {
    console.error('❌ Error initializing file scan database:', error);
    throw error;
  }
}

// Run if executed directly
if (require.main === module) {
  initFileScanDB()
    .then(() => {
      console.log('🎉 File scan database setup complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Setup failed:', error);
      process.exit(1);
    });
}

export { initFileScanDB };
