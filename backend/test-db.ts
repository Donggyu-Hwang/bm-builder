import { Pool } from 'pg';

async function testConnection() {
  console.log('🔍 Testing PostgreSQL connection...\n');

  const pool = new Pool({
    host: '15.164.103.114',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: 'Entbe0421*',
    connectionTimeoutMillis: 5000,
  });

  try {
    console.log('📡 Connecting to:', {
      host: '15.164.103.114',
      port: 5432,
      database: 'postgres',
      user: 'postgres',
    });

    const client = await pool.connect();
    console.log('✅ Successfully connected to PostgreSQL!\n');

    // Test query
    const result = await client.query('SELECT version();');
    console.log('📊 PostgreSQL Version:', result.rows[0].version);

    // Test current database
    const dbResult = await client.query('SELECT current_database();');
    console.log('📁 Current Database:', dbResult.rows[0].current_database);

    // List all tables
    const tablesResult = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    console.log('\n📋 Tables in public schema:');
    if (tablesResult.rows.length === 0) {
      console.log('   (No tables found)');
    } else {
      tablesResult.rows.forEach((row, i) => {
        console.log(`   ${i + 1}. ${row.table_name}`);
      });
    }

    client.release();
    console.log('\n✅ All tests passed!');

  } catch (error: any) {
    console.error('\n❌ Connection failed!');
    console.error('Error:', error.message);

    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Possible solutions:');
      console.error('   1. Check if PostgreSQL server is running');
      console.error('   2. Verify firewall allows connection on port 5432');
      console.error('   3. Check pg_hba.conf allows remote connections');
    } else if (error.code === '3D000') {
      console.error('\n💡 Database "postgres" does not exist');
    } else if (error.code === '28P01') {
      console.error('\n💡 Authentication failed - check password');
    }

    process.exit(1);
  } finally {
    await pool.end();
    console.log('\n🔌 Connection pool closed');
  }
}

testConnection();
