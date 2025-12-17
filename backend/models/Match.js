const pool = require('../config/database');
const BaseModel = require('./BaseModel');

class Match extends BaseModel {
  constructor() {
    super('matches');
  }

  /**
   * Create a new match
   * @param {Object} matchData - Match data
   * @returns {Promise<Object>} Created match
   */
  async create(matchData) {
    const {
      tournament_id,
      round_number,
      match_number,
      player1_id = null,
      player2_id = null,
      scheduled_time = null
    } = matchData;

    const query = `
      INSERT INTO matches (
        tournament_id,
        round_number,
        match_number,
        player1_id,
        player2_id,
        scheduled_time
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const result = await pool.query(query, [
      tournament_id,
      round_number,
      match_number,
      player1_id,
      player2_id,
      scheduled_time
    ]);

    return result.rows[0];
  }

  /**
   * Get all matches for a tournament
   * @param {string} tournamentId - Tournament ID
   * @returns {Promise<Array>} List of matches with player details
   */
  async findByTournament(tournamentId) {
    const query = `
      SELECT 
        m.*,
        p1.full_name as player1_name,
        p1.skill_level as player1_skill,
        p2.full_name as player2_name,
        p2.skill_level as player2_skill,
        w.full_name as winner_name
      FROM matches m
      LEFT JOIN users p1 ON m.player1_id = p1.user_id
      LEFT JOIN users p2 ON m.player2_id = p2.user_id
      LEFT JOIN users w ON m.winner_id = w.user_id
      WHERE m.tournament_id = $1
      ORDER BY m.round_number ASC, m.match_number ASC
    `;

    const result = await pool.query(query, [tournamentId]);
    return result.rows;
  }

  /**
   * Get matches by round
   * @param {string} tournamentId - Tournament ID
   * @param {number} roundNumber - Round number
   * @returns {Promise<Array>} List of matches in the round
   */
  async findByRound(tournamentId, roundNumber) {
    const query = `
      SELECT 
        m.*,
        p1.full_name as player1_name,
        p1.skill_level as player1_skill,
        p2.full_name as player2_name,
        p2.skill_level as player2_skill,
        w.full_name as winner_name
      FROM matches m
      LEFT JOIN users p1 ON m.player1_id = p1.user_id
      LEFT JOIN users p2 ON m.player2_id = p2.user_id
      LEFT JOIN users w ON m.winner_id = w.user_id
      WHERE m.tournament_id = $1 AND m.round_number = $2
      ORDER BY m.match_number ASC
    `;

    const result = await pool.query(query, [tournamentId, roundNumber]);
    return result.rows;
  }

  /**
   * Update match score and winner
   * @param {string} matchId - Match ID
   * @param {Object} scoreData - Score data
   * @returns {Promise<Object>} Updated match
   */
  async updateScore(matchId, scoreData) {
    const {
      player1_score,
      player2_score,
      winner_id
    } = scoreData;

    const query = `
      UPDATE matches
      SET 
        player1_score = $1,
        player2_score = $2,
        winner_id = $3,
        status = 'completed',
        updated_at = CURRENT_TIMESTAMP
      WHERE match_id = $4
      RETURNING *
    `;

    const result = await pool.query(query, [
      player1_score,
      player2_score,
      winner_id,
      matchId
    ]);

    return result.rows[0];
  }

  /**
   * Get match by ID with player details
   * @param {string} matchId - Match ID
   * @returns {Promise<Object>} Match with player details
   */
  async findByIdWithDetails(matchId) {
    const query = `
      SELECT 
        m.*,
        p1.full_name as player1_name,
        p1.email as player1_email,
        p1.skill_level as player1_skill,
        p2.full_name as player2_name,
        p2.email as player2_email,
        p2.skill_level as player2_skill,
        w.full_name as winner_name,
        t.tournament_name,
        t.format
      FROM matches m
      LEFT JOIN users p1 ON m.player1_id = p1.user_id
      LEFT JOIN users p2 ON m.player2_id = p2.user_id
      LEFT JOIN users w ON m.winner_id = w.user_id
      JOIN tournaments t ON m.tournament_id = t.tournament_id
      WHERE m.match_id = $1
    `;

    const result = await pool.query(query, [matchId]);
    return result.rows[0];
  }

  /**
   * Delete all matches for a tournament
   * @param {string} tournamentId - Tournament ID
   * @returns {Promise<number>} Number of deleted matches
   */
  async deleteByTournament(tournamentId) {
    const query = `
      DELETE FROM matches
      WHERE tournament_id = $1
    `;

    const result = await pool.query(query, [tournamentId]);
    return result.rowCount;
  }

  /**
   * Check if all matches in a round are completed
   * @param {string} tournamentId - Tournament ID
   * @param {number} roundNumber - Round number
   * @returns {Promise<boolean>} True if all matches completed
   */
  async isRoundCompleted(tournamentId, roundNumber) {
    const query = `
      SELECT COUNT(*) as total,
             COUNT(winner_id) as completed
      FROM matches
      WHERE tournament_id = $1 AND round_number = $2
    `;

    const result = await pool.query(query, [tournamentId, roundNumber]);
    const { total, completed } = result.rows[0];
    
    return parseInt(total) > 0 && parseInt(total) === parseInt(completed);
  }

  /**
   * Get winners from a round (for knockout advancement)
   * @param {string} tournamentId - Tournament ID
   * @param {number} roundNumber - Round number
   * @returns {Promise<Array>} List of winner IDs
   */
  async getRoundWinners(tournamentId, roundNumber) {
    const query = `
      SELECT winner_id, match_number
      FROM matches
      WHERE tournament_id = $1 
        AND round_number = $2 
        AND winner_id IS NOT NULL
      ORDER BY match_number ASC
    `;

    const result = await pool.query(query, [tournamentId, roundNumber]);
    return result.rows.map(row => row.winner_id);
  }
}

module.exports = new Match();
