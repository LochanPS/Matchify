const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

let passed = 0;
let failed = 0;
let warnings = 0;

function logSuccess(message) {
  console.log(`${colors.green}✅ ${message}${colors.reset}`);
  passed++;
}

function logError(message) {
  console.log(`${colors.red}❌ ${message}${colors.reset}`);
  failed++;
}

function logWarning(message) {
  console.log(`${colors.yellow}⚠️  ${message}${colors.reset}`);
  warnings++;
}

function logInfo(message) {
  console.log(`${colors.cyan}   ${message}${colors.reset}`);
}

function logSection(message) {
  console.log(`\n${colors.magenta}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.magenta}${message}${colors.reset}`);
  console.log(`${colors.magenta}${'='.repeat(60)}${colors.reset}\n`);
}

async function comprehensiveTest() {
  console.log(`${colors.blue}\n🧪 MATCHIFY - Comprehensive API Test Suite\n${colors.reset}`);

  try {
    // Test 1: Health Check
    logSection('1. HEALTH & STATUS CHECKS');
    
    console.log('Test 1.1: Root endpoint');
    try {
      const response = await axios.get(`${BASE_URL}/`);
      if (response.status === 200 && response.data.message) {
        logSuccess('Root endpoint responding');
        logInfo(`Version: ${response.data.version}`);
      } else {
        logError('Root endpoint returned unexpected response');
      }
    } catch (error) {
      logError(`Root endpoint failed: ${error.message}`);
    }

    console.log('\nTest 1.2: Health check endpoint');
    try {
      const response = await axios.get(`${BASE_URL}/health`);
      if (response.status === 200 && response.data.status === 'healthy') {
        logSuccess('Health check passed');
        logInfo(`Database: ${response.data.database}`);
        logInfo(`Firebase: ${response.data.firebase}`);
      } else {
        logError('Health check failed');
      }
    } catch (error) {
      logError(`Health check failed: ${error.message}`);
    }

    // Test 2: Authentication Endpoints
    logSection('2. AUTHENTICATION ENDPOINTS');

    console.log('Test 2.1: Signup without token');
    try {
      await axios.post(`${BASE_URL}/auth/signup`, {
        name: 'Test User',
        city: 'Test City',
        role: 'player'
      });
      logError('Should have required Firebase token');
    } catch (error) {
      if (error.response?.status === 400 || error.response?.status === 401) {
        logSuccess('Correctly requires Firebase token');
      } else {
        logError(`Unexpected error: ${error.message}`);
      }
    }

    console.log('\nTest 2.2: Login without token');
    try {
      await axios.post(`${BASE_URL}/auth/login`, {});
      logError('Should have required Firebase token');
    } catch (error) {
      if (error.response?.status === 400 || error.response?.status === 401) {
        logSuccess('Correctly requires Firebase token');
      } else {
        logError(`Unexpected error: ${error.message}`);
      }
    }

    // Test 3: Tournament Endpoints
    logSection('3. TOURNAMENT ENDPOINTS');

    console.log('Test 3.1: List tournaments (public)');
    try {
      const response = await axios.get(`${BASE_URL}/tournaments`);
      if (response.status === 200 && response.data.success) {
        logSuccess('List tournaments working');
        logInfo(`Found ${response.data.count} tournaments`);
      } else {
        logError('List tournaments failed');
      }
    } catch (error) {
      logError(`List tournaments failed: ${error.message}`);
    }

    console.log('\nTest 3.2: Filter tournaments by status');
    try {
      const response = await axios.get(`${BASE_URL}/tournaments?status=upcoming`);
      if (response.status === 200 && response.data.success) {
        logSuccess('Tournament filtering working');
        logInfo(`Found ${response.data.count} upcoming tournaments`);
      } else {
        logError('Tournament filtering failed');
      }
    } catch (error) {
      logError(`Tournament filtering failed: ${error.message}`);
    }

    console.log('\nTest 3.3: Create tournament without auth');
    try {
      await axios.post(`${BASE_URL}/tournaments`, {
        tournament_name: 'Test Tournament',
        venue: 'Test Venue',
        tournament_date: '2025-01-15',
        match_type: 'singles',
        format: 'knockout',
        max_players: 16
      });
      logError('Should have required authentication');
    } catch (error) {
      if (error.response?.status === 401) {
        logSuccess('Correctly requires authentication');
      } else {
        logError(`Unexpected error: ${error.message}`);
      }
    }

    // Test 4: Participant Endpoints
    logSection('4. PARTICIPANT ENDPOINTS');

    console.log('Test 4.1: Get participants (public)');
    try {
      const tournamentsRes = await axios.get(`${BASE_URL}/tournaments?limit=1`);
      if (tournamentsRes.data.tournaments && tournamentsRes.data.tournaments.length > 0) {
        const tournamentId = tournamentsRes.data.tournaments[0].tournament_id;
        const response = await axios.get(`${BASE_URL}/tournaments/${tournamentId}/participants`);
        
        if (response.status === 200 && response.data.success) {
          logSuccess('Get participants working');
          logInfo(`Found ${response.data.count} participants`);
        } else {
          logError('Get participants failed');
        }
      } else {
        logWarning('No tournaments found to test participants');
      }
    } catch (error) {
      if (error.response?.status === 404) {
        logWarning('No tournaments available');
      } else {
        logError(`Get participants failed: ${error.message}`);
      }
    }

    console.log('\nTest 4.2: Join tournament without auth');
    try {
      await axios.post(`${BASE_URL}/tournaments/test-id/join`);
      logError('Should have required authentication');
    } catch (error) {
      if (error.response?.status === 401) {
        logSuccess('Correctly requires authentication');
      } else {
        logError(`Unexpected error: ${error.message}`);
      }
    }

    // Test 5: Match Endpoints
    logSection('5. MATCH ENDPOINTS');

    console.log('Test 5.1: Get tournament matches (public)');
    try {
      const tournamentsRes = await axios.get(`${BASE_URL}/tournaments?status=live&limit=1`);
      if (tournamentsRes.data.tournaments && tournamentsRes.data.tournaments.length > 0) {
        const tournamentId = tournamentsRes.data.tournaments[0].tournament_id;
        const response = await axios.get(`${BASE_URL}/tournaments/${tournamentId}/matches`);
        
        if (response.status === 200 && response.data.success) {
          logSuccess('Get matches working');
          logInfo(`Found ${response.data.total_matches} matches`);
        } else {
          logError('Get matches failed');
        }
      } else {
        logWarning('No live tournaments found to test matches');
      }
    } catch (error) {
      if (error.response?.status === 404) {
        logWarning('No tournaments available');
      } else {
        logError(`Get matches failed: ${error.message}`);
      }
    }

    console.log('\nTest 5.2: Generate matches without auth');
    try {
      await axios.post(`${BASE_URL}/tournaments/test-id/generate-matches`);
      logError('Should have required authentication');
    } catch (error) {
      if (error.response?.status === 401) {
        logSuccess('Correctly requires authentication');
      } else {
        logError(`Unexpected error: ${error.message}`);
      }
    }

    // Test 6: Score Endpoints
    logSection('6. SCORE SUBMISSION ENDPOINTS');

    console.log('Test 6.1: Submit score without auth');
    try {
      await axios.post(`${BASE_URL}/matches/test-id/score`, {
        player1_score: 21,
        player2_score: 15
      });
      logError('Should have required authentication');
    } catch (error) {
      if (error.response?.status === 401) {
        logSuccess('Correctly requires authentication');
      } else {
        logError(`Unexpected error: ${error.message}`);
      }
    }

    console.log('\nTest 6.2: Get leaderboard (public)');
    try {
      const tournamentsRes = await axios.get(`${BASE_URL}/tournaments?format=league&limit=1`);
      if (tournamentsRes.data.tournaments && tournamentsRes.data.tournaments.length > 0) {
        const tournamentId = tournamentsRes.data.tournaments[0].tournament_id;
        const response = await axios.get(`${BASE_URL}/tournaments/${tournamentId}/leaderboard`);
        
        if (response.status === 200 && response.data.success) {
          logSuccess('Get leaderboard working');
          logInfo(`Found ${response.data.leaderboard.length} players`);
        } else {
          logError('Get leaderboard failed');
        }
      } else {
        logWarning('No league tournaments found to test leaderboard');
      }
    } catch (error) {
      if (error.response?.status === 400) {
        logWarning('Tournament is not league format');
      } else if (error.response?.status === 404) {
        logWarning('No tournaments available');
      } else {
        logError(`Get leaderboard failed: ${error.message}`);
      }
    }

    // Test 7: Error Handling
    logSection('7. ERROR HANDLING');

    console.log('Test 7.1: Non-existent tournament');
    try {
      await axios.get(`${BASE_URL}/tournaments/00000000-0000-0000-0000-000000000000`);
      logError('Should have returned 404');
    } catch (error) {
      if (error.response?.status === 404) {
        logSuccess('Correctly returns 404 for non-existent tournament');
      } else {
        logError(`Unexpected error: ${error.message}`);
      }
    }

    console.log('\nTest 7.2: Invalid route');
    try {
      await axios.get(`${BASE_URL}/invalid-route`);
      logError('Should have returned 404');
    } catch (error) {
      if (error.response?.status === 404) {
        logSuccess('Correctly returns 404 for invalid route');
      } else {
        logError(`Unexpected error: ${error.message}`);
      }
    }

    // Test 8: Data Validation
    logSection('8. DATA VALIDATION');

    console.log('Test 8.1: Invalid tournament date (past)');
    logWarning('Requires authentication - test manually');

    console.log('\nTest 8.2: Invalid max_players');
    logWarning('Requires authentication - test manually');

    console.log('\nTest 8.3: Invalid match type');
    logWarning('Requires authentication - test manually');

    // Summary
    logSection('TEST SUMMARY');
    
    console.log(`${colors.green}✅ Passed: ${passed}${colors.reset}`);
    console.log(`${colors.red}❌ Failed: ${failed}${colors.reset}`);
    console.log(`${colors.yellow}⚠️  Warnings: ${warnings}${colors.reset}`);
    console.log(`${colors.cyan}📈 Total: ${passed + failed + warnings}${colors.reset}\n`);

    const successRate = ((passed / (passed + failed)) * 100).toFixed(1);
    console.log(`${colors.cyan}Success Rate: ${successRate}%${colors.reset}\n`);

    if (failed === 0) {
      console.log(`${colors.green}🎉 All automated tests passed!${colors.reset}\n`);
    } else {
      console.log(`${colors.red}⚠️  Some tests failed. Please review the errors above.${colors.reset}\n`);
    }

    // Manual Testing Guide
    logSection('MANUAL TESTING GUIDE');
    
    console.log(`${colors.cyan}The following tests require Firebase authentication:${colors.reset}\n`);
    
    console.log(`${colors.yellow}1. User Registration & Login${colors.reset}`);
    console.log(`   - Create player account`);
    console.log(`   - Create organizer account`);
    console.log(`   - Login with both accounts\n`);
    
    console.log(`${colors.yellow}2. Tournament Creation${colors.reset}`);
    console.log(`   - Create knockout tournament (8, 16, 32 players)`);
    console.log(`   - Create league tournament (3-16 players)`);
    console.log(`   - Update tournament details`);
    console.log(`   - Delete tournament\n`);
    
    console.log(`${colors.yellow}3. Participant Management${colors.reset}`);
    console.log(`   - Join tournament as player`);
    console.log(`   - Leave tournament`);
    console.log(`   - Try joining full tournament`);
    console.log(`   - Try joining as organizer (should fail)\n`);
    
    console.log(`${colors.yellow}4. Match Generation${colors.reset}`);
    console.log(`   - Generate knockout bracket`);
    console.log(`   - Generate league matches`);
    console.log(`   - Verify correct number of matches`);
    console.log(`   - Verify no duplicate pairings\n`);
    
    console.log(`${colors.yellow}5. Score Submission${colors.reset}`);
    console.log(`   - Submit scores for matches`);
    console.log(`   - Verify player stats update`);
    console.log(`   - Verify knockout advancement`);
    console.log(`   - Verify leaderboard updates`);
    console.log(`   - Complete tournament\n`);

    console.log(`${colors.cyan}For detailed testing instructions, see:${colors.reset}`);
    console.log(`   - docs/API.md - Complete API documentation`);
    console.log(`   - docs/DAY*_COMPLETE.md - Daily completion guides\n`);

  } catch (error) {
    console.error(`${colors.red}Test suite error: ${error.message}${colors.reset}`);
  }
}

// Run tests
comprehensiveTest();
