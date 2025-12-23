const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: false } 
    : false,
});

async function runMigrations() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Starting PostgreSQL migrations...');
    console.log('🔗 Database URL:', process.env.DATABASE_URL ? 'Connected' : 'Not configured');
    
    const migrationsDir = path.join(__dirname, 'migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();
    
    console.log(`📋 Found ${files.length} migration files`);
    
    // Create migrations tracking table
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version VARCHAR(255) PRIMARY KEY,
        applied_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    for (const file of files) {
      try {
        // Check if migration already applied
        const version = file.replace('.sql', '');
        const { rows } = await client.query(
          'SELECT version FROM schema_migrations WHERE version = $1',
          [version]
        );
        
        if (rows.length > 0) {
          console.log(`⏭️  Skipping ${file} (already applied)`);
          continue;
        }
        
        console.log(`\n🚀 Running migration: ${file}`);
        const migrationPath = path.join(migrationsDir, file);
        const sql = fs.readFileSync(migrationPath, 'utf8');
        
        // Execute migration in a transaction
        await client.query('BEGIN');
        
        try {
          // Split by semicolon and execute each statement
          const statements = sql
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--'));
          
          for (const statement of statements) {
            if (statement.trim()) {
              await client.query(statement);
            }
          }
          
          // Record migration as applied
          await client.query(
            'INSERT INTO schema_migrations (version) VALUES ($1)',
            [version]
          );
          
          await client.query('COMMIT');
          console.log(`✅ Migration ${file} completed`);
          
        } catch (error) {
          await client.query('ROLLBACK');
          throw error;
        }
        
      } catch (error) {
        console.error(`❌ Error in ${file}:`, error.message);
        throw error;
      }
    }
    
    console.log('\n✅ All migrations completed successfully!');
    console.log('🎉 PostgreSQL database is ready!');
    
    // Test connection
    const result = await client.query('SELECT NOW() as current_time');
    console.log('🕒 Database time:', result.rows[0].current_time);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run migrations if called directly
if (require.main === module) {
  runMigrations();
}

module.exports = { runMigrations };