const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function runMigrations() {
  try {
    console.log('🚀 Starting database migrations...\n');
    
    // Read migration file
    const migrationPath = path.join(__dirname, '../migrations/001_initial_schema.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    // Execute migration
    await pool.query(sql);
    
    console.log('\n✅ All migrations completed successfully!');
    
    // Verify tables were created
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);
    
    console.log('\n📊 Tables in database:');
    result.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error(error);
    await pool.end();
    process.exit(1);
  }
}

runMigrations();
