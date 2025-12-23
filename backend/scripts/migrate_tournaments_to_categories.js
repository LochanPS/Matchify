const { query } = require('../config/database');

/**
 * Migration script to convert existing tournaments to category-based system
 * This script should be run after the database schema migration
 */

async function migrateTournamentsToCategories() {
  console.log('Starting tournament to category migration...');

  try {
    // Step 1: Get all existing tournaments
    const tournamentsResult = await query(`
      SELECT tournament_id, name, match_type, entry_fee, prize_money, max_players, current_players
      FROM tournaments
      WHERE tournament_id NOT IN (
        SELECT DISTINCT tournament_id FROM categories
      )
    `);

    const tournaments = tournamentsResult.rows;
    console.log(`Found ${tournaments.length} tournaments to migrate`);

    for (const tournament of tournaments) {
      console.log(`Migrating tournament: ${tournament.name}`);

      // Step 2: Create a default category for each tournament
      const categoryName = getCategoryName(tournament.match_type);
      
      const categoryResult = await query(`
        INSERT INTO categories (
          tournament_id,
          category_name,
          match_type,
          entry_fee,
          prize_money_winner,
          prize_money_runner_up,
          max_participants,
          current_participants,
          format
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING category_id
      `, [
        tournament.tournament_id,
        categoryName,
        tournament.match_type || 'singles',
        tournament.entry_fee || 0,
        tournament.prize_money || 0,
        Math.floor((tournament.prize_money || 0) * 0.5), // Runner-up gets 50%
        tournament.max_players || 16,
        tournament.current_players || 0,
        'knockout' // Default format
      ]);

      const categoryId = categoryResult.rows[0].category_id;
      console.log(`Created category: ${categoryName} (${categoryId})`);

      // Step 3: Migrate existing participants to category_participants
      const participantsResult = await query(`
        SELECT player_id, joined_at
        FROM participants
        WHERE tournament_id = $1
      `, [tournament.tournament_id]);

      const participants = participantsResult.rows;
      console.log(`Migrating ${participants.length} participants`);

      for (const participant of participants) {
        await query(`
          INSERT INTO category_participants (
            category_id,
            player_id,
            payment_status,
            registration_status,
            registered_at
          ) VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (category_id, player_id) DO NOTHING
        `, [
          categoryId,
          participant.player_id,
          'paid', // Assume existing participants have paid
          'confirmed',
          participant.joined_at
        ]);
      }

      // Step 4: Update matches to reference the category
      await query(`
        UPDATE matches 
        SET category_id = $1
        WHERE tournament_id = $2 AND category_id IS NULL
      `, [categoryId, tournament.tournament_id]);

      console.log(`Migrated tournament: ${tournament.name} ✓`);
    }

    console.log('Tournament migration completed successfully!');

  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

/**
 * Generate category name based on match type
 */
function getCategoryName(matchType) {
  switch (matchType) {
    case 'singles':
      return 'Open Singles';
    case 'doubles':
      return 'Open Doubles';
    case 'mixed_doubles':
      return 'Mixed Doubles';
    default:
      return 'Open Category';
  }
}

/**
 * Calculate user statistics from match history
 */
async function calculateUserStats() {
  console.log('Calculating user statistics...');

  try {
    // Get all users
    const usersResult = await query('SELECT user_id FROM users');
    const users = usersResult.rows;

    for (const user of users) {
      const userId = user.user_id;

      // Calculate tournament participation
      const tournamentsResult = await query(`
        SELECT COUNT(DISTINCT tournament_id) as count
        FROM matches
        WHERE player1_id = $1 OR player2_id = $1
      `, [userId]);

      const tournamentsParticipated = tournamentsResult.rows[0].count || 0;

      // Calculate tournaments won (where user won final match)
      const tournamentsWonResult = await query(`
        SELECT COUNT(*) as count
        FROM matches m1
        WHERE m1.winner_id = $1
        AND m1.round = (
          SELECT MAX(m2.round)
          FROM matches m2
          WHERE m2.tournament_id = m1.tournament_id
        )
      `, [userId]);

      const tournamentsWon = tournamentsWonResult.rows[0].count || 0;

      // Calculate current streak (consecutive wins from most recent matches)
      const recentMatchesResult = await query(`
        SELECT winner_id
        FROM matches
        WHERE (player1_id = $1 OR player2_id = $1)
        AND winner_id IS NOT NULL
        ORDER BY created_at DESC
        LIMIT 20
      `, [userId]);

      const recentMatches = recentMatchesResult.rows;
      let currentStreak = 0;
      
      for (const match of recentMatches) {
        if (match.winner_id === userId) {
          currentStreak++;
        } else {
          break;
        }
      }

      // Calculate best streak (longest consecutive wins ever)
      const allMatchesResult = await query(`
        SELECT winner_id
        FROM matches
        WHERE (player1_id = $1 OR player2_id = $1)
        AND winner_id IS NOT NULL
        ORDER BY created_at ASC
      `, [userId]);

      const allMatches = allMatchesResult.rows;
      let bestStreak = 0;
      let tempStreak = 0;

      for (const match of allMatches) {
        if (match.winner_id === userId) {
          tempStreak++;
          bestStreak = Math.max(bestStreak, tempStreak);
        } else {
          tempStreak = 0;
        }
      }

      // Get first tournament date
      const firstTournamentResult = await query(`
        SELECT MIN(created_at) as first_date
        FROM matches
        WHERE player1_id = $1 OR player2_id = $1
      `, [userId]);

      const firstTournamentDate = firstTournamentResult.rows[0].first_date;

      // Update user stats
      await query(`
        UPDATE users SET
          tournaments_participated = $1,
          tournaments_won = $2,
          current_streak = $3,
          best_streak = $4,
          first_tournament_date = $5,
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $6
      `, [
        tournamentsParticipated,
        tournamentsWon,
        currentStreak,
        bestStreak,
        firstTournamentDate,
        userId
      ]);
    }

    console.log(`Updated statistics for ${users.length} users ✓`);

  } catch (error) {
    console.error('Stats calculation failed:', error);
    throw error;
  }
}

/**
 * Main migration function
 */
async function runMigration() {
  try {
    console.log('='.repeat(50));
    console.log('TOURNAMENT TO CATEGORY MIGRATION');
    console.log('='.repeat(50));

    await migrateTournamentsToCategories();
    await calculateUserStats();

    console.log('='.repeat(50));
    console.log('MIGRATION COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(50));

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run migration if called directly
if (require.main === module) {
  runMigration();
}

module.exports = {
  migrateTournamentsToCategories,
  calculateUserStats,
  runMigration
};