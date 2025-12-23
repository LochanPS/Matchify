/**
 * Tournament Recommendation Engine
 * Recommends tournaments based on objective metrics (no skill levels)
 * 
 * Algorithm considers:
 * - Geographic proximity (city/venue distance)
 * - Match history similarity (players with similar stats)
 * - Tournament type familiarity (singles vs doubles preference)
 * - Participation frequency (active vs casual players)
 */

/**
 * Calculate similarity score between two players
 * Based on: matches played, win rate, tournament count, activity level
 */
const calculatePlayerSimilarity = (player1, player2) => {
  if (!player1 || !player2) return 0;

  let similarityScore = 0;
  let factors = 0;

  // Factor 1: Matches played similarity (±20% tolerance)
  const matchesDiff = Math.abs(player1.matches_played - player2.matches_played);
  const avgMatches = (player1.matches_played + player2.matches_played) / 2;
  if (avgMatches > 0) {
    const matchesSimilarity = Math.max(0, 1 - matchesDiff / (avgMatches * 0.4));
    similarityScore += matchesSimilarity * 25;
    factors++;
  }

  // Factor 2: Win rate similarity (±15% tolerance)
  const player1WinRate = player1.matches_played > 0
    ? (player1.wins / player1.matches_played) * 100
    : 0;
  const player2WinRate = player2.matches_played > 0
    ? (player2.wins / player2.matches_played) * 100
    : 0;
  const winRateDiff = Math.abs(player1WinRate - player2WinRate);
  const winRateSimilarity = Math.max(0, 1 - winRateDiff / 30);
  similarityScore += winRateSimilarity * 25;
  factors++;

  // Factor 3: Tournament count similarity
  const tournamentDiff = Math.abs(player1.total_tournaments - player2.total_tournaments);
  const avgTournaments = (player1.total_tournaments + player2.total_tournaments) / 2;
  if (avgTournaments > 0) {
    const tournamentSimilarity = Math.max(0, 1 - tournamentDiff / (avgTournaments * 0.4));
    similarityScore += tournamentSimilarity * 25;
    factors++;
  }

  // Factor 4: Activity level similarity
  const player1Activity = player1.active_streak || 0;
  const player2Activity = player2.active_streak || 0;
  const activityDiff = Math.abs(player1Activity - player2Activity);
  const avgActivity = (player1Activity + player2Activity) / 2;
  const activitySimilarity = avgActivity > 0
    ? Math.max(0, 1 - activityDiff / (avgActivity * 0.5))
    : 0.5;
  similarityScore += activitySimilarity * 25;
  factors++;

  return factors > 0 ? similarityScore / factors : 0;
};

/**
 * Calculate geographic proximity score
 * Prefers tournaments in same city, then nearby cities
 */
const calculateProximityScore = (playerCity, tournamentCity, tournamentVenue) => {
  if (!playerCity || !tournamentCity) return 0;

  // Same city = 100 points
  if (playerCity.toLowerCase() === tournamentCity.toLowerCase()) {
    return 100;
  }

  // Different city = 50 points (still relevant)
  return 50;
};

/**
 * Calculate tournament type familiarity
 * Based on player's historical participation in similar formats
 */
const calculateFormatFamiliarity = (player, tournament, playerHistory) => {
  if (!tournament.format) return 50; // Default if no format specified

  // Count how many tournaments of this format player has participated in
  const similarFormatCount = playerHistory.filter(
    t => t.format === tournament.format
  ).length;

  // Normalize to 0-100 scale
  const maxHistoryCount = Math.max(1, playerHistory.length);
  return (similarFormatCount / maxHistoryCount) * 100;
};

/**
 * Calculate participation frequency compatibility
 * Matches active players with active tournaments and casual players with casual tournaments
 */
const calculateFrequencyCompatibility = (player, tournament) => {
  const playerActivityLevel = player.active_streak || 0;
  const tournamentFrequency = tournament.frequency || 'monthly'; // monthly, weekly, etc.

  // Map frequency to activity level (0-12 months)
  const frequencyActivityMap = {
    'weekly': 12,
    'biweekly': 8,
    'monthly': 4,
    'quarterly': 2,
    'annual': 1
  };

  const tournamentActivityLevel = frequencyActivityMap[tournamentFrequency] || 4;
  const activityDiff = Math.abs(playerActivityLevel - tournamentActivityLevel);

  // Score: 100 if perfect match, decreases with difference
  return Math.max(0, 100 - (activityDiff * 10));
};

/**
 * Main recommendation function
 * Returns tournaments sorted by recommendation score
 */
export const recommendTournaments = (player, allTournaments, playerHistory = []) => {
  if (!player || !allTournaments || allTournaments.length === 0) {
    return [];
  }

  // Score each tournament
  const scoredTournaments = allTournaments
    .filter(t => {
      // Filter out: tournaments player already registered for
      return !t.isPlayerRegistered;
    })
    .map(tournament => {
      let score = 0;

      // 1. Geographic proximity (30% weight)
      const proximityScore = calculateProximityScore(
        player.city,
        tournament.city,
        tournament.venue
      );
      score += proximityScore * 0.3;

      // 2. Participant similarity (30% weight)
      // Calculate average similarity with existing participants
      let totalSimilarity = 0;
      let participantCount = 0;

      if (tournament.participants && tournament.participants.length > 0) {
        tournament.participants.forEach(participant => {
          totalSimilarity += calculatePlayerSimilarity(player, participant);
          participantCount++;
        });
      }

      const avgParticipantSimilarity = participantCount > 0
        ? totalSimilarity / participantCount
        : 50; // Default if no participants yet

      score += avgParticipantSimilarity * 0.3;

      // 3. Format familiarity (20% weight)
      const formatScore = calculateFormatFamiliarity(player, tournament, playerHistory);
      score += formatScore * 0.2;

      // 4. Frequency compatibility (10% weight)
      const frequencyScore = calculateFrequencyCompatibility(player, tournament);
      score += frequencyScore * 0.1;

      // 5. Availability bonus (10% weight)
      const availabilityBonus = tournament.availableSlots > 0 ? 100 : 0;
      score += availabilityBonus * 0.1;

      return {
        ...tournament,
        recommendationScore: Math.round(score),
        scoringBreakdown: {
          proximity: Math.round(proximityScore * 0.3),
          participantSimilarity: Math.round(avgParticipantSimilarity * 0.3),
          formatFamiliarity: Math.round(formatScore * 0.2),
          frequencyCompatibility: Math.round(frequencyScore * 0.1),
          availability: Math.round(availabilityBonus * 0.1)
        }
      };
    })
    // Sort by recommendation score (highest first)
    .sort((a, b) => b.recommendationScore - a.recommendationScore);

  return scoredTournaments;
};

/**
 * Get tournaments for a specific player
 * Applies filters and recommendations
 */
export const getTournamentsForPlayer = (
  player,
  allTournaments,
  filters = {},
  playerHistory = []
) => {
  if (!player || !allTournaments) return [];

  let filtered = [...allTournaments];

  // Apply filters
  if (filters.city) {
    filtered = filtered.filter(t => t.city === filters.city);
  }

  if (filters.format) {
    filtered = filtered.filter(t => t.format === filters.format);
  }

  if (filters.maxEntryFee) {
    filtered = filtered.filter(t => t.entry_fee <= filters.maxEntryFee);
  }

  if (filters.availableOnly) {
    filtered = filtered.filter(t => t.availableSlots > 0);
  }

  if (filters.thisWeekOnly) {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    filtered = filtered.filter(t => {
      const tournamentDate = new Date(t.date);
      return tournamentDate >= today && tournamentDate <= nextWeek;
    });
  }

  // Get recommendations
  return recommendTournaments(player, filtered, playerHistory);
};

/**
 * Get tournament diversity metrics
 * Shows mix of experience levels in a tournament
 */
export const getTournamentDiversity = (tournament) => {
  if (!tournament.participants || tournament.participants.length === 0) {
    return {
      newPlayers: 0,
      activePlayers: 0,
      veteranPlayers: 0,
      diversityScore: 0
    };
  }

  const participants = tournament.participants;
  let newPlayers = 0;
  let activePlayers = 0;
  let veteranPlayers = 0;

  participants.forEach(p => {
    if (!p.first_tournament_date) {
      newPlayers++;
    } else {
      const monthsSince = Math.floor(
        (new Date() - new Date(p.first_tournament_date)) / (1000 * 60 * 60 * 24 * 30)
      );
      if (monthsSince < 3) newPlayers++;
      else if (monthsSince < 12) activePlayers++;
      else veteranPlayers++;
    }
  });

  // Diversity score: 0-100, higher is more diverse
  const total = participants.length;
  const diversity = (
    Math.min(newPlayers, total / 3) +
    Math.min(activePlayers, total / 3) +
    Math.min(veteranPlayers, total / 3)
  ) / (total / 3) * 100;

  return {
    newPlayers,
    activePlayers,
    veteranPlayers,
    diversityScore: Math.round(diversity),
    description: `${newPlayers} new, ${activePlayers} active, ${veteranPlayers} veteran`
  };
};

/**
 * Get player comparison with tournament average
 * Shows how player compares to typical tournament participant
 */
export const getPlayerTournamentComparison = (player, tournament) => {
  if (!tournament.participants || tournament.participants.length === 0) {
    return null;
  }

  const participants = tournament.participants;

  // Calculate averages
  const avgMatches = participants.reduce((sum, p) => sum + (p.matches_played || 0), 0) / participants.length;
  const avgWins = participants.reduce((sum, p) => sum + (p.wins || 0), 0) / participants.length;
  const avgWinRate = participants.reduce((sum, p) => {
    const rate = p.matches_played > 0 ? (p.wins / p.matches_played) * 100 : 0;
    return sum + rate;
  }, 0) / participants.length;
  const avgTournaments = participants.reduce((sum, p) => sum + (p.total_tournaments || 0), 0) / participants.length;

  // Calculate player's metrics
  const playerWinRate = player.matches_played > 0
    ? (player.wins / player.matches_played) * 100
    : 0;

  return {
    player: {
      matches: player.matches_played,
      wins: player.wins,
      winRate: playerWinRate.toFixed(1),
      tournaments: player.total_tournaments
    },
    tournament: {
      avgMatches: Math.round(avgMatches),
      avgWins: Math.round(avgWins),
      avgWinRate: avgWinRate.toFixed(1),
      avgTournaments: Math.round(avgTournaments)
    },
    comparison: {
      matchesAboveAvg: player.matches_played > avgMatches,
      winRateAboveAvg: playerWinRate > avgWinRate,
      tournamentsAboveAvg: player.total_tournaments > avgTournaments,
      overallAboveAvg: (
        (player.matches_played > avgMatches ? 1 : 0) +
        (playerWinRate > avgWinRate ? 1 : 0) +
        (player.total_tournaments > avgTournaments ? 1 : 0)
      ) >= 2
    }
  };
};

export default {
  recommendTournaments,
  getTournamentsForPlayer,
  getTournamentDiversity,
  getPlayerTournamentComparison,
  calculatePlayerSimilarity,
  calculateProximityScore,
  calculateFormatFamiliarity,
  calculateFrequencyCompatibility
};
