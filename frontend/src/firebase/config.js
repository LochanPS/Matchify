import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Firebase configuration
// Replace these values with your actual Firebase project credentials
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "demo-api-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "demo.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "demo-project",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "demo.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:abcdef"
};

// Initialize Firebase
let app;
let auth;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  console.log('✅ Firebase initialized successfully');
} catch (error) {
  console.error('❌ Firebase initialization error:', error);
  console.warn('📝 To enable Firebase:');
  console.warn('   1. Create a Firebase project at https://console.firebase.google.com');
  console.warn('   2. Add a web app to your project');
  console.warn('   3. Copy the config values to frontend/.env');
  console.warn('   4. Restart the dev server');
}

export { auth, app };
export default app;
