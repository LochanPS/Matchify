const db = require('../config/database');
const BaseModel = require('./BaseModel');

class User extends BaseModel {
  constructor() {
    super('users');
  }

  /**
   * Create a new user
   */
  async create({ firebase_uid, name, email, city, role, organizer_contact }) {
    const query = `
      INSERT INTO users (firebase_uid, name, email, city, role, organizer_contact)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const values = [firebase_uid, name, email, city, role, organizer_contact];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  /**
   * Find user by Firebase UID
   */
  async findByFirebaseUid(firebase_uid) {
    const query = 'SELECT * FROM users WHERE firebase_uid = $1';
    const result = await db.query(query, [firebase_uid]);
    return result.rows[0];
  }

  /**
   * Find user by email
   */
  async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await db.query(query, [email]);
    return result.rows[0];
  }

  /**
   * Find user by ID
   */
  async findById(user_id) {
    const query = 'SELECT * FROM users WHERE user_id = $1';
    const result = await db.query(query, [user_id]);
    return result.rows[0];
  }

  /**
   * Update user profile
   */
  async updateProfile(user_id, updates) {
    const allowedFields = ['name', 'city', 'organizer_contact'];
    const filteredUpdates = {};
    
    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key) && updates[key] !== undefined) {
        filteredUpdates[key] = updates[key];
      }
    });

    if (Object.keys(filteredUpdates).length === 0) {
      throw new Error('No valid fields to update');
    }

    const fields = Object.keys(filteredUpdates).map((key, i) => `${key} = $${i + 2}`).join(', ');
    const query = `UPDATE users SET ${fields} WHERE user_id = $1 RETURNING *`;
    const values = [user_id, ...Object.values(filteredUpdates)];
    
    const result = await db.query(query, values);
    return result.rows[0];
  }

  /**
   * Get player statistics
   */
  async getPlayerStats(user_id) {
    const query = `
      SELECT 
        user_id,
        name,
        email,
        city,
        matches_played,
        wins,
        losses,
        total_tournaments,
        tournaments_won,
        current_streak,
        best_streak,
        first_tournament_date,
        last_active_date,
        activity_streak,
        CASE 
          WHEN matches_played > 0 THEN ROUND((wins::numeric / matches_played::numeric) * 100, 2)
          ELSE 0
        END as win_rate,
        -- Experience level based on objective data
        CASE 
          WHEN matches_played = 0 THEN 'New to tournaments'
          WHEN matches_played < 5 THEN 'Getting started'
          WHEN matches_played < 20 THEN 'Active player'
          WHEN matches_played < 50 THEN 'Tournament regular'
          ELSE 'Veteran player'
        END as experience_level,
        -- Activity status
        CASE 
          WHEN last_active_date IS NULL THEN 'Never played'
          WHEN last_active_date >= CURRENT_DATE - INTERVAL '30 days' THEN 'Recently active'
          WHEN last_active_date >= CURRENT_DATE - INTERVAL '90 days' THEN 'Moderately active'
          ELSE 'Inactive'
        END as activity_status
      FROM users
      WHERE user_id = $1 AND role = 'player'
    `;
    
    const result = await db.query(query, [user_id]);
    return result.rows[0];
  }

  /**
   * Get tournament history for player
   */
  async getTournamentHistory(user_id) {
    const query = `
      SELECT 
        t.tournament_id,
        t.tournament_name,
        t.tournament_date,
        t.venue,
        t.status,
        p.joined_at
      FROM tournaments t
      INNER JOIN participants p ON t.tournament_id = p.tournament_id
      WHERE p.player_id = $1
      ORDER BY t.tournament_date DESC
    `;
    
    const result = await db.query(query, [user_id]);
    return result.rows;
  }

  /**
   * Update player statistics
   */
  async updateStats(user_id, { matches_played_increment = 0, wins_increment = 0 }) {
    const query = `
      UPDATE users 
      SET 
        matches_played = matches_played + $2,
        wins = wins + $3
      WHERE user_id = $1
      RETURNING *
    `;
    
    const result = await db.query(query, [user_id, matches_played_increment, wins_increment]);
    return result.rows[0];
  }
}

module.exports = new User();
