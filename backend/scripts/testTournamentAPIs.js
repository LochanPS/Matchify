require('dotenv').config();
const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:5000';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testTournamentAPIs() {
  log('\n🧪 Testing Tournament API Endpoints\n', 'blue');
  
  let testsPassed = 0;
  let testsFailed = 0;

  try {
    // Test 1: List tournaments (public endpoint)
    log('Test 1: List Tournaments (Public)', 'yellow');
    try {
      const response = await axios.get(`${API_URL}/tournaments`);
      if (response.data.success && Array.isArray(response.data.tournaments)) {
        log('✅ List tournaments passed', 'green');
        log(`   Found ${response.data.count} tournaments`, 'reset');
        testsPassed++;
      } else {
        log('❌ List tournaments failed', 'red');
        testsFailed++;
      }
    } catch (error) {
      log(`❌ List tournaments error: ${error.message}`, 'red');
      testsFailed++;
    }
    log('');

    // Test 2: Filter tournaments by status
    log('Test 2: Filter by Status', 'yellow');
    try {
      const response = await axios.get(`${API_URL}/tournaments?status=upcoming`);
      if (response.data.success) {
        log('✅ Filter by status passed', 'green');
        log(`   Found ${response.data.count} upcoming tournaments`, 'reset');
        testsPassed++;
      } else {
        log('❌ Filter by status failed', 'red');
        testsFailed++;
      }
    } catch (error) {
      log(`❌ Filter error: ${error.message}`, 'red');
      testsFailed++;
    }
    log('');

    // Test 3: Filter by match type
    log('Test 3: Filter by Match Type', 'yellow');
    try {
      const response = await axios.get(`${API_URL}/tournaments?match_type=singles`);
      if (response.data.success) {
        log('✅ Filter by match type passed', 'green');
        log(`   Found ${response.data.count} singles tournaments`, 'reset');
        testsPassed++;
      } else {
        log('❌ Filter by match type failed', 'red');
        testsFailed++;
      }
    } catch (error) {
      log(`❌ Filter error: ${error.message}`, 'red');
      testsFailed++;
    }
    log('');

    // Test 4: Get non-existent tournament
    log('Test 4: Get Non-existent Tournament', 'yellow');
    try {
      await axios.get(`${API_URL}/tournaments/00000000-0000-0000-0000-000000000000`);
      log('❌ Should have returned 404', 'red');
      testsFailed++;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        log('✅ Correctly returned 404 for non-existent tournament', 'green');
        testsPassed++;
      } else {
        log(`❌ Unexpected error: ${error.message}`, 'red');
        testsFailed++;
      }
    }
    log('');

    // Test 5: Create tournament without authentication
    log('Test 5: Create Tournament Without Auth', 'yellow');
    try {
      await axios.post(`${API_URL}/tournaments`, {
        tournament_name: 'Test Tournament',
        venue: 'Test Venue',
        tournament_date: '2025-12-31',
        match_type: 'singles',
        format: 'knockout',
        max_players: 16
      });
      log('❌ Should have required authentication', 'red');
      testsFailed++;
    } catch (error) {
      if (error.response && error.response.status === 401) {
        log('✅ Correctly required authentication', 'green');
        testsPassed++;
      } else {
        log(`❌ Unexpected error: ${error.message}`, 'red');
        testsFailed++;
      }
    }
    log('');

    // Test 6: Validation - invalid max_players
    log('Test 6: Validation - Invalid Max Players', 'yellow');
    try {
      await axios.post(`${API_URL}/tournaments`, {
        tournament_name: 'Test Tournament',
        venue: 'Test Venue',
        tournament_date: '2025-12-31',
        match_type: 'singles',
        format: 'knockout',
        max_players: 10 // Invalid - must be 8, 16, or 32
      });
      log('❌ Should have rejected invalid max_players', 'red');
      testsFailed++;
    } catch (error) {
      if (error.response && (error.response.status === 400 || error.response.status === 401)) {
        log('✅ Correctly rejected invalid max_players', 'green');
        testsPassed++;
      } else {
        log(`❌ Unexpected error: ${error.message}`, 'red');
        testsFailed++;
      }
    }
    log('');

    // Test 7: Filter by city
    log('Test 7: Filter by City', 'yellow');
    try {
      const response = await axios.get(`${API_URL}/tournaments?city=Bangalore`);
      if (response.data.success) {
        log('✅ Filter by city passed', 'green');
        log(`   Found ${response.data.count} tournaments in Bangalore`, 'reset');
        testsPassed++;
      } else {
        log('❌ Filter by city failed', 'red');
        testsFailed++;
      }
    } catch (error) {
      log(`❌ Filter error: ${error.message}`, 'red');
      testsFailed++;
    }
    log('');

    // Summary
    log('\n📊 Test Summary', 'blue');
    log(`✅ Passed: ${testsPassed}`, 'green');
    log(`❌ Failed: ${testsFailed}`, 'red');
    log(`📈 Total: ${testsPassed + testsFailed}\n`);

    if (testsFailed === 0) {
      log('🎉 All tests passed!', 'green');
      log('\n💡 Note: Full CRUD tests require Firebase authentication', 'yellow');
      log('   See /docs/FIREBASE_SETUP.md for instructions\n');
    }

    process.exit(testsFailed === 0 ? 0 : 1);
  } catch (error) {
    log(`\n❌ Test suite error: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Check if server is running
axios.get(`${API_URL}/health`)
  .then(() => {
    testTournamentAPIs();
  })
  .catch(() => {
    log('\n❌ Server is not running!', 'red');
    log('Please start the server first:', 'yellow');
    log('  cd backend && npm run dev\n', 'blue');
    process.exit(1);
  });
