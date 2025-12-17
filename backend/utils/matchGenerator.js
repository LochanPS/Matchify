/**
 * Match Generation Utilities
 * Handles knockout bracket and league round-robin generation
 */

/**
 * Shuffle array using Fisher-Yates algorithm
 * @param {Array} array - Array to shuffle
 * @returns {Array} Shuffled array
 */
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Generate knockout bracket matches
 * @param {Array} participants - List of participant user IDs
 * @param {string} tournamentId - Tournament ID
 * @returns {Array} Array of match objects
 */
function generateKnockoutBracket(participants, tournamentId) {
  const matches = [];
  const playerCount = participants.length;
  
  // Shuffle participants for random matchups
  const shuffledParticipants = shuffleArray(participants);
  
  // Calculate number of rounds needed
  const totalRounds = Math.log2(playerCount);
  
  // Generate first round matches
  const matchesPerRound = playerCount / 2;
  
  for (let i = 0; i < matchesPerRound; i++) {
    matches.push({
      tournament_id: tournamentId,
      round_number: 1,
      match_number: i + 1,
      player1_id: shuffledParticipants[i * 2],
      player2_id: shuffledParticipants[i * 2 + 1],
      scheduled_time: null
    });
  }
  
  // Generate placeholder matches for subsequent rounds
  let currentMatchNumber = 1;
  for (let round = 2; round <= totalRounds; round++) {
    const matchesInRound = Math.pow(2, totalRounds - round);
    
    for (let i = 0; i < matchesInRound; i++) {
      matches.push({
        tournament_id: tournamentId,
        round_number: round,
        match_number: currentMatchNumber++,
        player1_id: null, // Will be filled after previous round completes
        player2_id: null,
        scheduled_time: null
      });
    }
  }
  
  return matches;
}

/**
 * Generate league round-robin matches
 * @param {Array} participants - List of participant user IDs
 * @param {string} tournamentId - Tournament ID
 * @returns {Array} Array of match objects
 */
function generateLeagueMatches(participants, tournamentId) {
  const matches = [];
  const playerCount = participants.length;
  
  // Shuffle participants for variety
  const shuffledParticipants = shuffleArray(participants);
  
  let matchNumber = 1;
  
  // Generate all possible pairings (round-robin)
  for (let i = 0; i < playerCount; i++) {
    for (let j = i + 1; j < playerCount; j++) {
      matches.push({
        tournament_id: tournamentId,
        round_number: 1, // League format uses single round
        match_number: matchNumber++,
        player1_id: shuffledParticipants[i],
        player2_id: shuffledParticipants[j],
        scheduled_time: null
      });
    }
  }
  
  return matches;
}

/**
 * Calculate round names for knockout tournaments
 * @param {number} totalRounds - Total number of rounds
 * @param {number} currentRound - Current round number
 * @returns {string} Round name (e.g., "Quarter Finals", "Semi Finals", "Finals")
 */
function getRoundName(totalRounds, currentRound) {
  const roundsFromEnd = totalRounds - currentRound;
  
  if (roundsFromEnd === 0) return 'Finals';
  if (roundsFromEnd === 1) return 'Semi Finals';
  if (roundsFromEnd === 2) return 'Quarter Finals';
  if (roundsFromEnd === 3) return 'Round of 16';
  
  return `Round ${currentRound}`;
}

/**
 * Validate participant count for tournament format
 * @param {number} participantCount - Number of participants
 * @param {string} format - Tournament format (knockout or league)
 * @returns {Object} Validation result with isValid and message
 */
function validateParticipantCount(participantCount, format) {
  if (format === 'knockout') {
    // Knockout requires power of 2 participants
    const isPowerOfTwo = (participantCount & (participantCount - 1)) === 0 && participantCount > 0;
    
    if (!isPowerOfTwo) {
      return {
        isValid: false,
        message: `Knockout format requires a power of 2 participants (8, 16, 32). Current: ${participantCount}`
      };
    }
    
    if (participantCount < 4) {
      return {
        isValid: false,
        message: 'Knockout format requires at least 4 participants'
      };
    }
  }
  
  if (format === 'league') {
    if (participantCount < 3) {
      return {
        isValid: false,
        message: 'League format requires at least 3 participants'
      };
    }
    
    if (participantCount > 16) {
      return {
        isValid: false,
        message: 'League format supports maximum 16 participants'
      };
    }
  }
  
  return {
    isValid: true,
    message: 'Participant count is valid'
  };
}

/**
 * Calculate total matches for a tournament
 * @param {number} participantCount - Number of participants
 * @param {string} format - Tournament format
 * @returns {number} Total number of matches
 */
function calculateTotalMatches(participantCount, format) {
  if (format === 'knockout') {
    // Knockout: n-1 matches (each match eliminates one player)
    return participantCount - 1;
  }
  
  if (format === 'league') {
    // League: n*(n-1)/2 matches (round-robin)
    return (participantCount * (participantCount - 1)) / 2;
  }
  
  return 0;
}

module.exports = {
  shuffleArray,
  generateKnockoutBracket,
  generateLeagueMatches,
  getRoundName,
  validateParticipantCount,
  calculateTotalMatches
};
