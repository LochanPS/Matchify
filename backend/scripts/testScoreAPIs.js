const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Test results tracking
let passed = 0;
let failed = 0;

function logSuccess(message) {
  console.log(`${colors.green}✅ ${message}${colors.reset}`);
  passed++;
}

function logError(message) {
  console.log(`${colors.red}❌ ${message}${colors.reset}`);
  failed++;
}

function logInfo(message) {
  console.log(`${colors.cyan}   ${message}${colors.reset}`);
}

function logWarning(message) {
  console.log(`${colors.yellow}⚠️  ${message}${colors.reset}`);
}

async function testScoreAPIs() {
  console.log(`${colors.blue}\n🧪 Testing Score Submission API Endpoints\n${colors.reset}`);

  try {
    // Test 1: Submit score without authentication
    console.log('Test 1: Submit Score Without Authentication');
    try {
      await axios.post(`${BASE_URL}/matches/test-match-id/score`, {
        player1_score: 21,
        player2_score: 15
      });
      logError('Should have required authentication');
    } catch (error) {
      if (error.response?.status === 401) {
        logSuccess('Correctly required authentication');
      } else {
        logError(`Unexpected error: ${error.message}`);
      }
    }

    // Test 2: Get leaderboard for non-existent tournament
    console.log('\nTest 2: Get Leaderboard for Non-existent Tournament');
    try {
      await axios.get(`${BASE_URL}/tournaments/00000000-0000-0000-0000-000000000000/leaderboard`);
      logError('Should have returned 404 for non-existent tournament');
    } catch (error) {
      if (error.response?.status === 404) {
        logSuccess('Correctly returned 404 for non-existent tournament');
      } else {
        logError(`Unexpected error: ${error.message}`);
      }
    }

    // Test 3: Get leaderboard for existing tournament
    console.log('\nTest 3: Get Leaderboard for Tournament');
    try {
      const tournamentsRes = await axios.get(`${BASE_URL}/tournaments?format=league&limit=1`);
      
      if (tournamentsRes.data.tournaments && tournamentsRes.data.tournaments.length > 0) {
        const tournamentId = tournamentsRes.data.tournaments[0].tournament_id;
        
        const response = await axios.get(`${BASE_URL}/tournaments/${tournamentId}/leaderboard`);
        
        if (response.status === 200 && response.data.success) {
          logSuccess('Get leaderboard passed');
          logInfo(`Tournament: ${response.data.tournament.tournament_name}`);
          logInfo(`Players: ${response.data.leaderboard.length}`);
        } else {
          logError('Get leaderboard failed - unexpected response');
        }
      } else {
        logWarning('No league tournaments found to test leaderboard');
      }
    } catch (error) {
      if (error.response?.status === 400) {
        logWarning('Tournament is not league format (expected)');
      } else {
        logError(`Get leaderboard failed: ${error.message}`);
      }
    }

    // Summary
    console.log(`\n${colors.blue}📊 Test Summary${colors.reset}`);
    console.log(`${colors.green}✅ Passed: ${passed}${colors.reset}`);
    console.log(`${colors.red}❌ Failed: ${failed}${colors.reset}`);
    console.log(`${colors.cyan}📈 Total: ${passed + failed}${colors.reset}\n`);

    if (failed === 0) {
      console.log(`${colors.green}🎉 All tests passed!${colors.reset}\n`);
    } else {
      console.log(`${colors.red}⚠️  Some tests failed. Please review the errors above.${colors.reset}\n`);
    }

    // Manual testing instructions
    console.log(`${colors.yellow}📝 Manual Testing Required:${colors.reset}`);
    console.log(`${colors.cyan}To fully test score submission, you need Firebase authentication tokens:${colors.reset}\n`);
    
    console.log(`${colors.cyan}1. Submit Match Score (Organizer):${colors.reset}`);
    console.log(`   POST ${BASE_URL}/matches/{match_id}/score`);
    console.log(`   Authorization: Bearer {firebase_token}`);
    console.log(`   Content-Type: application/json`);
    console.log(`   Body: {`);
    console.log(`     "player1_score": 21,`);
    console.log(`     "player2_score": 15`);
    console.log(`   }`);
    console.log(`   (User must be the tournament organizer)`);
    console.log(`   (Match must have both players assigned)\n`);
    
    console.log(`${colors.cyan}2. Get Tournament Leaderboard (League):${colors.reset}`);
    console.log(`   GET ${BASE_URL}/tournaments/{tournament_id}/leaderboard`);
    console.log(`   (Only works for league format tournaments)\n`);

    console.log(`${colors.yellow}📋 Score Submission Rules:${colors.reset}`);
    console.log(`${colors.cyan}Validation:${colors.reset}`);
    console.log(`   - Both scores required`);
    console.log(`   - Scores must be non-negative integers`);
    console.log(`   - No ties allowed (must have a winner)`);
    console.log(`   - Match must have both players assigned`);
    console.log(`   - Match cannot already be completed\n`);
    
    console.log(`${colors.cyan}Effects:${colors.reset}`);
    console.log(`   - Updates match with scores and winner`);
    console.log(`   - Updates both players' statistics`);
    console.log(`   - Winner: matches_played +1, matches_won +1`);
    console.log(`   - Loser: matches_played +1`);
    console.log(`   - Knockout: Winner advances to next round`);
    console.log(`   - Checks if tournament is complete\n`);

    console.log(`${colors.cyan}Leaderboard (League Format):${colors.reset}`);
    console.log(`   - Sorted by: Points (3 per win) → Wins → Total Score`);
    console.log(`   - Shows: Rank, Name, Matches, Wins, Losses, Points, Score\n`);

    console.log(`${colors.yellow}🎯 Testing Workflow:${colors.reset}`);
    console.log(`${colors.cyan}1. Create tournament and generate matches${colors.reset}`);
    console.log(`2. Submit scores for first round matches`);
    console.log(`3. Verify player stats updated`);
    console.log(`4. For knockout: Verify winners advanced to next round`);
    console.log(`5. For league: Check leaderboard updates`);
    console.log(`6. Complete all matches`);
    console.log(`7. Verify tournament status changes to "completed"\n`);

  } catch (error) {
    console.error(`${colors.red}Test suite error: ${error.message}${colors.reset}`);
  }
}

// Run tests
testScoreAPIs();
