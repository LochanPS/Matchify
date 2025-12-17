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

async function testMatchAPIs() {
  console.log(`${colors.blue}\n🧪 Testing Match API Endpoints\n${colors.reset}`);

  try {
    // Test 1: Get matches for a tournament (Public)
    console.log('Test 1: Get Tournament Matches (Public)');
    try {
      // First, get a tournament ID
      const tournamentsRes = await axios.get(`${BASE_URL}/tournaments?limit=1`);
      
      if (tournamentsRes.data.tournaments && tournamentsRes.data.tournaments.length > 0) {
        const tournamentId = tournamentsRes.data.tournaments[0].tournament_id;
        
        const response = await axios.get(`${BASE_URL}/tournaments/${tournamentId}/matches`);
        
        if (response.status === 200 && response.data.success) {
          logSuccess('Get tournament matches passed');
          logInfo(`Found ${response.data.total_matches} matches`);
          logInfo(`Tournament: ${response.data.tournament.tournament_name}`);
          logInfo(`Format: ${response.data.tournament.format}`);
        } else {
          logError('Get tournament matches failed - unexpected response');
        }
      } else {
        logWarning('No tournaments found to test matches');
      }
    } catch (error) {
      if (error.response?.status === 404) {
        logWarning('Tournament not found (expected if no tournaments exist)');
      } else {
        logError(`Get tournament matches failed: ${error.message}`);
      }
    }

    // Test 2: Get matches for non-existent tournament
    console.log('\nTest 2: Get Matches for Non-existent Tournament');
    try {
      await axios.get(`${BASE_URL}/tournaments/00000000-0000-0000-0000-000000000000/matches`);
      logError('Should have returned 404 for non-existent tournament');
    } catch (error) {
      if (error.response?.status === 404) {
        logSuccess('Correctly returned 404 for non-existent tournament');
      } else {
        logError(`Unexpected error: ${error.message}`);
      }
    }

    // Test 3: Generate matches without authentication
    console.log('\nTest 3: Generate Matches Without Authentication');
    try {
      const tournamentsRes = await axios.get(`${BASE_URL}/tournaments?limit=1`);
      
      if (tournamentsRes.data.tournaments && tournamentsRes.data.tournaments.length > 0) {
        const tournamentId = tournamentsRes.data.tournaments[0].tournament_id;
        
        await axios.post(`${BASE_URL}/tournaments/${tournamentId}/generate-matches`);
        logError('Should have required authentication');
      } else {
        logWarning('No tournaments found to test generate matches');
      }
    } catch (error) {
      if (error.response?.status === 401) {
        logSuccess('Correctly required authentication');
      } else {
        logError(`Unexpected error: ${error.message}`);
      }
    }

    // Test 4: Delete matches without authentication
    console.log('\nTest 4: Delete Matches Without Authentication');
    try {
      const tournamentsRes = await axios.get(`${BASE_URL}/tournaments?limit=1`);
      
      if (tournamentsRes.data.tournaments && tournamentsRes.data.tournaments.length > 0) {
        const tournamentId = tournamentsRes.data.tournaments[0].tournament_id;
        
        await axios.delete(`${BASE_URL}/tournaments/${tournamentId}/matches`);
        logError('Should have required authentication');
      } else {
        logWarning('No tournaments found to test delete matches');
      }
    } catch (error) {
      if (error.response?.status === 401) {
        logSuccess('Correctly required authentication');
      } else {
        logError(`Unexpected error: ${error.message}`);
      }
    }

    // Test 5: Get match by ID
    console.log('\nTest 5: Get Match by ID');
    logWarning('Requires existing match - test manually after generating matches');
    logInfo('Example: GET /matches/{match_id}');

    // Test 6: Filter matches by round
    console.log('\nTest 6: Filter Matches by Round');
    logWarning('Requires existing matches - test manually after generating matches');
    logInfo('Example: GET /tournaments/{tournament_id}/matches?round=1');

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
    console.log(`${colors.cyan}To fully test match endpoints, you need Firebase authentication tokens:${colors.reset}\n`);
    
    console.log(`${colors.cyan}1. Generate Matches (Organizer):${colors.reset}`);
    console.log(`   POST ${BASE_URL}/tournaments/{tournament_id}/generate-matches`);
    console.log(`   Authorization: Bearer {firebase_token}`);
    console.log(`   (User must be the tournament organizer)`);
    console.log(`   (Tournament must have correct number of participants)`);
    console.log(`   (Knockout: 8, 16, or 32 players | League: 3-16 players)\n`);
    
    console.log(`${colors.cyan}2. Get Tournament Matches:${colors.reset}`);
    console.log(`   GET ${BASE_URL}/tournaments/{tournament_id}/matches`);
    console.log(`   GET ${BASE_URL}/tournaments/{tournament_id}/matches?round=1\n`);
    
    console.log(`${colors.cyan}3. Get Match Details:${colors.reset}`);
    console.log(`   GET ${BASE_URL}/matches/{match_id}\n`);
    
    console.log(`${colors.cyan}4. Delete Matches (Organizer):${colors.reset}`);
    console.log(`   DELETE ${BASE_URL}/tournaments/{tournament_id}/matches`);
    console.log(`   Authorization: Bearer {firebase_token}`);
    console.log(`   (User must be the tournament organizer)\n`);

    console.log(`${colors.yellow}📋 Match Generation Requirements:${colors.reset}`);
    console.log(`${colors.cyan}Knockout Format:${colors.reset}`);
    console.log(`   - Requires power of 2 participants (8, 16, 32)`);
    console.log(`   - Generates bracket with multiple rounds`);
    console.log(`   - Round names: Round 1, Quarter Finals, Semi Finals, Finals\n`);
    
    console.log(`${colors.cyan}League Format:${colors.reset}`);
    console.log(`   - Requires 3-16 participants`);
    console.log(`   - Generates round-robin (everyone plays everyone)`);
    console.log(`   - Single round with all matchups\n`);

  } catch (error) {
    console.error(`${colors.red}Test suite error: ${error.message}${colors.reset}`);
  }
}

// Run tests
testMatchAPIs();
