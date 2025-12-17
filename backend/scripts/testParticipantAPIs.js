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

async function testParticipantAPIs() {
  console.log(`${colors.blue}\n🧪 Testing Participant API Endpoints\n${colors.reset}`);

  try {
    // Test 1: Get participants for a tournament (Public)
    console.log('Test 1: Get Tournament Participants (Public)');
    try {
      // First, get a tournament ID
      const tournamentsRes = await axios.get(`${BASE_URL}/tournaments?limit=1`);
      
      if (tournamentsRes.data.tournaments && tournamentsRes.data.tournaments.length > 0) {
        const tournamentId = tournamentsRes.data.tournaments[0].tournament_id;
        
        const response = await axios.get(`${BASE_URL}/tournaments/${tournamentId}/participants`);
        
        if (response.status === 200 && response.data.success) {
          logSuccess('Get participants passed');
          logInfo(`Found ${response.data.count} participants`);
          logInfo(`Tournament: ${response.data.tournament.tournament_name}`);
        } else {
          logError('Get participants failed - unexpected response');
        }
      } else {
        logWarning('No tournaments found to test participants');
      }
    } catch (error) {
      if (error.response?.status === 404) {
        logWarning('Tournament not found (expected if no tournaments exist)');
      } else {
        logError(`Get participants failed: ${error.message}`);
      }
    }

    // Test 2: Get participants for non-existent tournament
    console.log('\nTest 2: Get Participants for Non-existent Tournament');
    try {
      await axios.get(`${BASE_URL}/tournaments/00000000-0000-0000-0000-000000000000/participants`);
      logError('Should have returned 404 for non-existent tournament');
    } catch (error) {
      if (error.response?.status === 404) {
        logSuccess('Correctly returned 404 for non-existent tournament');
      } else {
        logError(`Unexpected error: ${error.message}`);
      }
    }

    // Test 3: Join tournament without authentication
    console.log('\nTest 3: Join Tournament Without Authentication');
    try {
      const tournamentsRes = await axios.get(`${BASE_URL}/tournaments?limit=1`);
      
      if (tournamentsRes.data.tournaments && tournamentsRes.data.tournaments.length > 0) {
        const tournamentId = tournamentsRes.data.tournaments[0].tournament_id;
        
        await axios.post(`${BASE_URL}/tournaments/${tournamentId}/join`);
        logError('Should have required authentication');
      } else {
        logWarning('No tournaments found to test join');
      }
    } catch (error) {
      if (error.response?.status === 401) {
        logSuccess('Correctly required authentication');
      } else {
        logError(`Unexpected error: ${error.message}`);
      }
    }

    // Test 4: Leave tournament without authentication
    console.log('\nTest 4: Leave Tournament Without Authentication');
    try {
      const tournamentsRes = await axios.get(`${BASE_URL}/tournaments?limit=1`);
      
      if (tournamentsRes.data.tournaments && tournamentsRes.data.tournaments.length > 0) {
        const tournamentId = tournamentsRes.data.tournaments[0].tournament_id;
        
        await axios.delete(`${BASE_URL}/tournaments/${tournamentId}/leave`);
        logError('Should have required authentication');
      } else {
        logWarning('No tournaments found to test leave');
      }
    } catch (error) {
      if (error.response?.status === 401) {
        logSuccess('Correctly required authentication');
      } else {
        logError(`Unexpected error: ${error.message}`);
      }
    }

    // Test 5: Check participation without authentication
    console.log('\nTest 5: Check Participation Without Authentication');
    try {
      const tournamentsRes = await axios.get(`${BASE_URL}/tournaments?limit=1`);
      
      if (tournamentsRes.data.tournaments && tournamentsRes.data.tournaments.length > 0) {
        const tournamentId = tournamentsRes.data.tournaments[0].tournament_id;
        
        await axios.get(`${BASE_URL}/tournaments/${tournamentId}/check-participation`);
        logError('Should have required authentication');
      } else {
        logWarning('No tournaments found to test check participation');
      }
    } catch (error) {
      if (error.response?.status === 401) {
        logSuccess('Correctly required authentication');
      } else {
        logError(`Unexpected error: ${error.message}`);
      }
    }

    // Test 6: Get user tournaments without authentication
    console.log('\nTest 6: Get User Tournaments Without Authentication');
    try {
      await axios.get(`${BASE_URL}/users/test-user-id/tournaments`);
      logError('Should have required authentication');
    } catch (error) {
      if (error.response?.status === 401) {
        logSuccess('Correctly required authentication');
      } else {
        logError(`Unexpected error: ${error.message}`);
      }
    }

    // Test 7: Filter user tournaments by status
    console.log('\nTest 7: Filter User Tournaments by Status');
    logWarning('Requires authentication token - test manually with real token');
    logInfo('Example: GET /users/{user_id}/tournaments?status=upcoming');

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
    console.log(`${colors.cyan}To fully test participant endpoints, you need Firebase authentication tokens:${colors.reset}\n`);
    
    console.log(`${colors.cyan}1. Join Tournament (Player):${colors.reset}`);
    console.log(`   POST ${BASE_URL}/tournaments/{tournament_id}/join`);
    console.log(`   Authorization: Bearer {firebase_token}`);
    console.log(`   (User must be a player)\n`);
    
    console.log(`${colors.cyan}2. Leave Tournament (Player):${colors.reset}`);
    console.log(`   DELETE ${BASE_URL}/tournaments/{tournament_id}/leave`);
    console.log(`   Authorization: Bearer {firebase_token}`);
    console.log(`   (User must be a participant)\n`);
    
    console.log(`${colors.cyan}3. Check Participation:${colors.reset}`);
    console.log(`   GET ${BASE_URL}/tournaments/{tournament_id}/check-participation`);
    console.log(`   Authorization: Bearer {firebase_token}\n`);
    
    console.log(`${colors.cyan}4. Get User's Tournaments:${colors.reset}`);
    console.log(`   GET ${BASE_URL}/users/{user_id}/tournaments?status=upcoming`);
    console.log(`   Authorization: Bearer {firebase_token}`);
    console.log(`   (Can only view own tournaments)\n`);

  } catch (error) {
    console.error(`${colors.red}Test suite error: ${error.message}${colors.reset}`);
  }
}

// Run tests
testParticipantAPIs();
