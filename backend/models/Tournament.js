const db = require('../config/database');
const BaseModel = require('./BaseModel');

class Tournament extends BaseModel {
  constructor() {
    super('tournaments');
  }

  /**
   * Create a new tournament
   */
  async create(tournamentData) {
    const {
      organizer_id,
      tournament_name,
      venue,
      tournament_date,
      match_type,
      format,
      entry_fee,
      prize_money,
      max_players
    } = tournamentData;

    const query = `
      INSERT INTO tournaments (
        organizer_id, tournament_name, venue, tournament_date,
        match_type, format, entry_fee, prize_money, max_players
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const values = [
      organizer_id,
      tournament_name,
      venue,
      tournament_date,
      match_type,
      format,
      entry_fee || 0,
      prize_money || 0,
      max_players
    ];

    const result = await db.query(query, values);
    return result.rows[0];
  }

  /**
   * Find tournament by ID with organizer details
   */
  async findById(tournamentId) {
    const query = `
      SELECT 
        t.*,
        u.name as organizer_name,
        u.email as organizer_email,
        u.organizer_contact,
        COUNT(DISTINCT p.participant_id) as current_players_count
      FROM tournaments t
      LEFT JOIN users u ON t.organizer_id = u.user_id
      LEFT JOIN participants p ON t.tournament_id = p.tournament_id
      WHERE t.tournament_id = $1
      GROUP BY t.tournament_id, u.name, u.email, u.organizer_contact
    `;

    const result = await db.query(query, [tournamentId]);
    return result.rows[0];
  }

  /**
   * Find all tournaments with filters
   */
  async findAll(filters = {}, limit = 20, offset = 0) {
    let query = `
      SELECT 
        t.*,
        u.name as organizer_name,
        COUNT(DISTINCT p.participant_id) as current_players_count
      FROM tournaments t
      LEFT JOIN users u ON t.organizer_id = u.user_id
      LEFT JOIN participants p ON t.tournament_id = p.tournament_id
      WHERE 1=1
    `;

    const values = [];
    let paramCount = 1;

    // Filter by status
    if (filters.status) {
      query += ` AND t.status = $${paramCount}`;
      values.push(filters.status);
      paramCount++;
    }

    // Filter by city (search in venue)
    if (filters.city) {
      query += ` AND t.venue ILIKE $${paramCount}`;
      values.push(`%${filters.city}%`);
      paramCount++;
    }

    // Filter by match type
    if (filters.match_type) {
      query += ` AND t.match_type = $${paramCount}`;
      values.push(filters.match_type);
      paramCount++;
    }

    // Filter by format
    if (filters.format) {
      query += ` AND t.format = $${paramCount}`;
      values.push(filters.format);
      paramCount++;
    }

    // Filter by date range
    if (filters.date_from) {
      query += ` AND t.tournament_date >= $${paramCount}`;
      values.push(filters.date_from);
      paramCount++;
    }

    if (filters.date_to) {
      query += ` AND t.tournament_date <= $${paramCount}`;
      values.push(filters.date_to);
      paramCount++;
    }

    query += `
      GROUP BY t.tournament_id, u.name
      ORDER BY t.tournament_date ASC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;

    values.push(limit, offset);

    const result = await db.query(query, values);
    return result.rows;
  }

  /**
   * Get tournaments by organizer
   */
  async findByOrganizer(organizerId, status = null) {
    let query = `
      SELECT 
        t.*,
        COUNT(DISTINCT p.participant_id) as current_players_count,
        COUNT(DISTINCT m.match_id) as total_matches
      FROM tournaments t
      LEFT JOIN participants p ON t.tournament_id = p.tournament_id
      LEFT JOIN matches m ON t.tournament_id = m.tournament_id
      WHERE t.organizer_id = $1
    `;

    const values = [organizerId];

    if (status) {
      query += ` AND t.status = $2`;
      values.push(status);
    }

    query += `
      GROUP BY t.tournament_id
      ORDER BY t.tournament_date DESC
    `;

    const result = await db.query(query, values);
    return result.rows;
  }

  /**
   * Update tournament
   */
  async update(tournamentId, updates) {
    const allowedFields = [
      'tournament_name', 'venue', 'tournament_date',
      'match_type', 'format', 'entry_fee', 'prize_money',
      'max_players', 'status'
    ];

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
    const query = `
      UPDATE tournaments
      SET ${fields}
      WHERE tournament_id = $1
      RETURNING *
    `;

    const values = [tournamentId, ...Object.values(filteredUpdates)];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  /**
   * Delete tournament
   */
  async delete(tournamentId) {
    const query = 'DELETE FROM tournaments WHERE tournament_id = $1 RETURNING *';
    const result = await db.query(query, [tournamentId]);
    return result.rows[0];
  }

  /**
   * Check if user can edit tournament
   */
  async canEdit(tournamentId, userId) {
    const query = `
      SELECT organizer_id, status 
      FROM tournaments 
      WHERE tournament_id = $1
    `;
    const result = await db.query(query, [tournamentId]);

    if (!result.rows[0]) return false;

    const tournament = result.rows[0];
    return tournament.organizer_id === userId && tournament.status === 'upcoming';
  }

  /**
   * Get participant count
   */
  async getParticipantCount(tournamentId) {
    const query = `
      SELECT COUNT(*) as count
      FROM participants
      WHERE tournament_id = $1
    `;
    const result = await db.query(query, [tournamentId]);
    return parseInt(result.rows[0].count);
  }

  /**
   * Check if tournament is full
   */
  async isFull(tournamentId) {
    const query = `
      SELECT max_players, current_players
      FROM tournaments
      WHERE tournament_id = $1
    `;
    const result = await db.query(query, [tournamentId]);
    
    if (!result.rows[0]) return true;
    
    const { max_players, current_players } = result.rows[0];
    return current_players >= max_players;
  }
}

module.exports = new Tournament();
