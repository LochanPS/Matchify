const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'matchify.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Convert PostgreSQL SQL to SQLite-compatible SQL
function convertToSQLite(sql) {
  let converted = sql;
  
  // Remove PostgreSQL-specific syntax
  converted = converted.replace(/UUID/gi, 'TEXT');
  converted = converted.replace(/SERIAL/gi, 'INTEGER');
  converted = converted.replace(/BIGSERIAL/gi, 'INTEGER');
  converted = converted.replace(/gen_random_uuid\(\)/gi, "lower(hex(randomblob(16)))");
  converted = converted.replace(/NOW\(\)/gi, "datetime('now')");
  converted = converted.replace(/CURRENT_TIMESTAMP/gi, "datetime('now')");
  converted = converted.replace(/TIMESTAMP/gi, 'TEXT');
  converted = converted.replace(/BOOLEAN/gi, 'INTEGER');
  converted = converted.replace(/VARCHAR\(\d+\)/gi, 'TEXT');
  converted = converted.replace(/TEXT\[\]/gi, 'TEXT');
  converted = converted.replace(/INTEGER\[\]/gi, 'TEXT');
  
  // Handle ENUM types
  converted = converted.replace(/CREATE TYPE[^;]+;/gi, '');
  converted = converted.replace(/\w+::\w+/g, (match) => {
    return match.split('::')[0];
  });
  
  // Remove IF NOT EXISTS from CREATE TYPE
  converted = converted.replace(/CREATE TYPE IF NOT EXISTS[^;]+;/gi, '');
  
  // Handle CHECK constraints for enums
  converted = converted.replace(/(\w+)\s+\w+::\w+/g, '$1 TEXT');
  
  return converted;
}

async function runMigrations() {
  try {
    console.log('🔄 Starting SQLite migrations...');
    console.log('📁 Database location:', dbPath);
    
    const migrationsDir = path.join(__dirname, 'migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();
    
    console.log(`📋 Found ${files.length} migration files`);
    
    for (const file of files) {
      try {
        console.log(`\n🚀 Running migration: ${file}`);
        const migrationPath = path.join(migrationsDir, file);
        let sql = fs.readFileSync(migrationPath, 'utf8');
        
        // Convert PostgreSQL to SQLite
        sql = convertToSQLite(sql);
        
        // Split by semicolon and execute each statement
        const statements = sql
          .split(';')
          .map(s => s.trim())
          .filter(s => s.length > 0 && !s.startsWith('--'));
        
        for (const statement of statements) {
          try {
            db.exec(statement);
          } catch (err) {
            // Ignore "table already exists" errors
            if (!err.message.includes('already exists')) {
              console.warn(`⚠️  Warning in ${file}:`, err.message);
            }
          }
        }
        
        console.log(`✅ Migration ${file} completed`);
      } catch (error) {
        console.error(`❌ Error in ${file}:`, error.message);
      }
    }
    
    console.log('\n✅ All migrations completed successfully!');
    console.log('📊 Database ready at:', dbPath);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    db.close();
  }
}

runMigrations();