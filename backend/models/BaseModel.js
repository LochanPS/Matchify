const db = require('../config/database');

class BaseModel {
  constructor(tableName) {
    this.tableName = tableName;
  }

  // Find all records
  async findAll(conditions = {}, orderBy = 'created_at DESC') {
    const where = Object.keys(conditions).length > 0
      ? 'WHERE ' + Object.keys(conditions).map((key, i) => `${key} = $${i + 1}`).join(' AND ')
      : '';
    
    const values = Object.values(conditions);
    const query = `SELECT * FROM ${this.tableName} ${where} ORDER BY ${orderBy}`;
    
    const result = await db.query(query, values);
    return result.rows;
  }

  // Find one record by ID
  async findById(id, idColumn = `${this.tableName.slice(0, -1)}_id`) {
    const query = `SELECT * FROM ${this.tableName} WHERE ${idColumn} = $1`;
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  // Create new record
  async create(data) {
    const columns = Object.keys(data);
    const values = Object.values(data);
    const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
    
    const query = `
      INSERT INTO ${this.tableName} (${columns.join(', ')})
      VALUES (${placeholders})
      RETURNING *
    `;
    
    const result = await db.query(query, values);
    return result.rows[0];
  }

  // Update record
  async update(id, data, idColumn = `${this.tableName.slice(0, -1)}_id`) {
    const columns = Object.keys(data);
    const values = Object.values(data);
    const setClause = columns.map((col, i) => `${col} = $${i + 1}`).join(', ');
    
    const query = `
      UPDATE ${this.tableName}
      SET ${setClause}
      WHERE ${idColumn} = $${values.length + 1}
      RETURNING *
    `;
    
    const result = await db.query(query, [...values, id]);
    return result.rows[0];
  }

  // Delete record
  async delete(id, idColumn = `${this.tableName.slice(0, -1)}_id`) {
    const query = `DELETE FROM ${this.tableName} WHERE ${idColumn} = $1 RETURNING *`;
    const result = await db.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = BaseModel;
