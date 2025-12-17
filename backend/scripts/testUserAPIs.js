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

async function testUserAPIs() {
  log('\n🧪 Testing User API Endpoints\n', 'blue');
  
  let testsPassed = 0;
  let testsFailed = 0;

  try {
    // Test 1: Health Check
    log('Test 1: Health Check', 'yellow');
    try {
      const health = await axios.get(`${API_URL}/health`);
      if (health.data.status === 'healthy') {
        log('✅ Health check passed', 'green');
        testsPassed++;
      } else {
        log('❌ Health check failed', 'red');
        testsFailed++;
      }
    } catch (error) {
      log(`❌ Health check error: ${error.message}`, 'red');
      testsFailed++;
    }
    log('');

    // Test 2: API Info
    log('Test 2: API Info', 'yellow');
    try {
      const info = await axios.get(`${API_URL}/`);
      if (info.data.message === 'Pathfinder Enhanced API') {
        log('✅ API info passed', 'green');
        testsPassed++;
      } else {
        log('❌ API info failed', 'red');
        testsFailed++;
      }
    } catch (error) {
      log(`❌ API info error: ${error.message}`, 'red');
      testsFailed++;
    }
    log('');

    // Test 3: Signup validation (should fail without required fields)
    log('Test 3: Signup Validation', 'yellow');
    try {
      await axios.post(`${API_URL}/auth/signup`, {
        name: 'T', // Too short
        city: 'Bangalore',
        role: 'player'
      });
      log('❌ Validation should have failed', 'red');
      testsFailed++;
    } catch (error) {
      if (error.response && error.response.status === 400) {
        log('✅ Validation correctly rejected invalid input', 'green');
        testsPassed++;
      } else {
        log(`❌ Unexpected error: ${error.message}`, 'red');
        testsFailed++;
      }
    }
    log('');

    // Test 4: Login without token (should fail)
    log('Test 4: Login Without Token', 'yellow');
    try {
      await axios.post(`${API_URL}/auth/login`, {});
      log('❌ Should have failed without token', 'red');
      testsFailed++;
    } catch (error) {
      if (error.response && error.response.status === 400) {
        log('✅ Correctly rejected login without token', 'green');
        testsPassed++;
      } else {
        log(`❌ Unexpected error: ${error.message}`, 'red');
        testsFailed++;
      }
    }
    log('');

    // Test 5: Get non-existent user profile
    log('Test 5: Get Non-existent Profile', 'yellow');
    try {
      await axios.get(`${API_URL}/users/00000000-0000-0000-0000-000000000000/profile`);
      log('❌ Should have returned 404', 'red');
      testsFailed++;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        log('✅ Correctly returned 404 for non-existent user', 'green');
        testsPassed++;
      } else {
        log(`❌ Unexpected error: ${error.message}`, 'red');
        testsFailed++;
      }
    }
    log('');

    // Test 6: Update profile without authentication
    log('Test 6: Update Profile Without Auth', 'yellow');
    try {
      await axios.patch(`${API_URL}/users/00000000-0000-0000-0000-000000000000/profile`, {
        name: 'New Name'
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

    // Summary
    log('\n📊 Test Summary', 'blue');
    log(`✅ Passed: ${testsPassed}`, 'green');
    log(`❌ Failed: ${testsFailed}`, 'red');
    log(`📈 Total: ${testsPassed + testsFailed}\n`);

    if (testsFailed === 0) {
      log('🎉 All tests passed!', 'green');
      log('\n💡 Note: Full authentication tests require Firebase setup', 'yellow');
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
    testUserAPIs();
  })
  .catch(() => {
    log('\n❌ Server is not running!', 'red');
    log('Please start the server first:', 'yellow');
    log('  cd backend && npm run dev\n', 'blue');
    process.exit(1);
  });
