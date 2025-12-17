require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function testConnection() {
  try {
    console.log('🔄 Testing database connection...\n');
    
    const client = await pool.connect();
    console.log('✅ Database connected successfully!');
    
    // Test query
    const result = await client.query('SELECT NOW()');
    console.log('⏰ Current database time:', result.rows[0].now);
    
    // Check tables
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('\n📋 Tables created:');
    tables.rows.forEach(row => console.log('  -', row.table_name));
    
    // Check seed data
    const users = await client.query('SELECT COUNT(*) FROM users');
    console.log(`\n👥 Test users created: ${users.rows[0].count}`);
    
    client.release();
    await pool.end();
    
    console.log('\n✅ All checks passed! Database is ready.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    console.error('\nTroubleshooting:');
    console.error('1. Check your DATABASE_URL in .env file');
    console.error('2. Ensure PostgreSQL is running');
    console.error('3. Verify migration ran successfully');
    process.exit(1);
  }
}

testConnection();
