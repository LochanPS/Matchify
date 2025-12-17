const pool = require('../config/database');
const BaseModel = require('./BaseModel');

class Participant extends BaseModel {
  constructor() {
    super('participants');
  }

  /**
   * Join a tournament
   * @param {string} tournamentId - Tournament ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Created participant record
   */
  async join(tournamentId, userId) {
    const query = `
      INSERT INTO participants (tournament_id, user_id)
      VALUES ($1, $2)
      RETURNING 
        participant_id,
        tournament_id,
        user_id,
        joined_at,
        status
    `;
    
    const result = await pool.query(query, [tournamentId, userId]);
    return result.rows[0];
  }

  /**
   * Leave a tournament
   * @param {string} tournamentId - Tournament ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Deleted participant record
   */
  async leave(tournamentId, userId) {
    const query = `
      DELETE FROM participants
      WHERE tournament_id = $1 AND user_id = $2
      RETURNING 
        participant_id,
        tournament_id,
        user_id,
        joined_at,
        status
    `;
    
    const result = await pool.query(query, [tournamentId, userId]);
    return result.rows[0];
  }

  /**
   * Check if user is already a participant
   * @param {string} tournamentId - Tournament ID
   * @param {string} userId - User ID
   * @returns {Promise<boolean>} True if already joined
   */
  async isParticipant(tournamentId, userId) {
    const query = `
      SELECT participant_id
      FROM participants
      WHERE tournament_id = $1 AND user_id = $2
    `;
    
    const result = await pool.query(query, [tournamentId, userId]);
    return result.rows.length > 0;
  }

  /**
   * Get all participants for a tournament
   * @param {string} tournamentId - Tournament ID
   * @returns {Promise<Array>} List of participants with user details
   */
  async findByTournament(tournamentId) {
    const query = `
      SELECT 
        p.participant_id,
        p.tournament_id,
        p.user_id,
        p.joined_at,
        p.status,
        u.full_name,
        u.email,
        u.contact_number,
        u.city,
        u.skill_level,
        u.matches_played,
        u.matches_won,
        CASE 
          WHEN u.matches_played > 0 
          THEN ROUND((u.matches_won::numeric / u.matches_played::numeric) * 100, 2)
          ELSE 0
        END as win_rate
      FROM participants p
      JOIN users u ON p.user_id = u.user_id
      WHERE p.tournament_id = $1
      ORDER BY p.joined_at ASC
    `;
    
    const result = await pool.query(query, [tournamentId]);
    return result.rows;
  }

  /**
   * Get participant count for a tournament
   * @param {string} tournamentId - Tournament ID
   * @returns {Promise<number>} Number of participants
   */
  async getCount(tournamentId) {
    const query = `
      SELECT COUNT(*) as count
      FROM participants
      WHERE tournament_id = $1
    `;
    
    const result = await pool.query(query, [tournamentId]);
    return parseInt(result.rows[0].count);
  }

  /**
   * Get all tournaments a user has joined
   * @param {string} userId - User ID
   * @param {string} status - Optional status filter
   * @returns {Promise<Array>} List of tournaments
   */
  async findByUser(userId, status = null) {
    let query = `
      SELECT 
        t.tournament_id,
        t.tournament_name,
        t.venue,
        t.tournament_date,
        t.match_type,
        t.format,
        t.entry_fee,
        t.prize_money,
        t.max_players,
        t.current_players,
        t.status as tournament_status,
        p.participant_id,
        p.joined_at,
        p.status as participant_status,
        u.full_name as organizer_name,
        (SELECT COUNT(*) FROM participants WHERE tournament_id = t.tournament_id) as current_players_count
      FROM participants p
      JOIN tournaments t ON p.tournament_id = t.tournament_id
      JOIN users u ON t.organizer_id = u.user_id
      WHERE p.user_id = $1
    `;
    
    const params = [userId];
    
    if (status) {
      query += ` AND t.status = $2`;
      params.push(status);
    }
    
    query += ` ORDER BY t.tournament_date ASC`;
    
    const result = await pool.query(query, params);
    return result.rows;
  }

  /**
   * Check if tournament has space for more participants
   * @param {string} tournamentId - Tournament ID
   * @returns {Promise<boolean>} True if tournament has space
   */
  async hasSpace(tournamentId) {
    const query = `
      SELECT 
        t.max_players,
        COUNT(p.participant_id) as current_count
      FROM tournaments t
      LEFT JOIN participants p ON t.tournament_id = p.tournament_id
      WHERE t.tournament_id = $1
      GROUP BY t.tournament_id, t.max_players
    `;
    
    const result = await pool.query(query, [tournamentId]);
    
    if (result.rows.length === 0) {
      return false;
    }
    
    const { max_players, current_count } = result.rows[0];
    return parseInt(current_count) < parseInt(max_players);
  }
}

module.exports = new Participant();
