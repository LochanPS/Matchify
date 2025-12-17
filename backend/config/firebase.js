const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Check if service account file exists
const serviceAccountPath = path.join(__dirname, '../firebase-service-account.json');

if (fs.existsSync(serviceAccountPath)) {
  const serviceAccount = require(serviceAccountPath);
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  
  console.log('✅ Firebase Admin SDK initialized with service account');
} else {
  console.warn('⚠️  firebase-service-account.json not found');
  console.warn('📝 To enable Firebase Auth:');
  console.warn('   1. Go to Firebase Console → Project Settings → Service Accounts');
  console.warn('   2. Click "Generate new private key"');
  console.warn('   3. Save as firebase-service-account.json in backend folder');
  console.warn('   4. Restart the server');
}

// Export Firebase Auth instance
const auth = admin.auth();

// Helper function to verify ID token
async function verifyIdToken(idToken) {
  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    return {
      success: true,
      uid: decodedToken.uid,
      email: decodedToken.email,
      decodedToken
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// Helper function to get user by UID
async function getUserByUID(uid) {
  try {
    const userRecord = await auth.getUser(uid);
    return userRecord;
  } catch (error) {
    throw new Error(`Error fetching user: ${error.message}`);
  }
}

// Helper function to create user
async function createUser(email, password, displayName) {
  try {
    const userRecord = await auth.createUser({
      email,
      password,
      displayName
    });
    return userRecord;
  } catch (error) {
    throw new Error(`Error creating user: ${error.message}`);
  }
}

// Helper function to delete user
async function deleteUser(uid) {
  try {
    await auth.deleteUser(uid);
    return { success: true };
  } catch (error) {
    throw new Error(`Error deleting user: ${error.message}`);
  }
}

module.exports = {
  admin,
  auth,
  verifyIdToken,
  getUserByUID,
  createUser,
  deleteUser
};
