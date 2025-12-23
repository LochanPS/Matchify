const Database = require('better-sqlite3');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

// Create SQLite database
const dbPath = path.join(__dirname, '..', 'matchify.db');
const db = new Database(dbPath, { verbose: console.log });

console.log('✅ SQLite database initialized at:', dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Query helper function (PostgreSQL-compatible interface)
const query = async (text, params = []) => {
  const start = Date.now();
  try {
    // Convert PostgreSQL $1, $2 syntax to ? syntax
    let sqliteQuery = text.replace(/\$(\d+)/g, '?');
    
    // Handle RETURNING clause (SQLite doesn't support it the same way)
    const hasReturning = /RETURNING/i.test(sqliteQuery);
    if (hasReturning) {
      sqliteQuery = sqliteQuery.replace(/RETURNING\s+\*/i, '');
    }
    
    // Determine if it's a SELECT query
    const isSelect = /^\s*SELECT/i.test(sqliteQuery);
    
    let result;
    if (isSelect) {
      const stmt = db.prepare(sqliteQuery);
      const rows = stmt.all(...params);
      result = { rows, rowCount: rows.length };
    } else {
      const stmt = db.prepare(sqliteQuery);
      const info = stmt.run(...params);
      
      // If RETURNING was requested, fetch the inserted/updated row
      if (hasReturning && info.lastInsertRowid) {
        const tableName = sqliteQuery.match(/INSERT\s+INTO\s+(\w+)/i)?.[1];
        if (tableName) {
          const row = db.prepare(`SELECT * FROM ${tableName} WHERE rowid = ?`).get(info.lastInsertRowid);
          result = { rows: [row], rowCount: 1 };
        } else {
          result = { rows: [], rowCount: info.changes };
        }
      } else {
        result = { rows: [], rowCount: info.changes };
      }
    }
    
    const duration = Date.now() - start;
    console.log('Executed query', { text: sqliteQuery.substring(0, 50), duration, rows: result.rowCount });
    return result;
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
};

// Get a client (for compatibility)
const getClient = async () => {
  return {
    query: async (text, params) => query(text, params),
    release: () => {}
  };
};

// Pool object for compatibility
const pool = {
  query: (text, params) => query(text, params),
  connect: getClient,
  end: () => db.close()
};

module.exports = {
  query,
  getClient,
  pool,
  db
};
