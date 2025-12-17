# Firebase Authentication Setup Guide

## Overview

This guide will walk you through setting up Firebase Authentication for Pathfinder Enhanced.

---

## Step 1: Create Firebase Project (15 mins)

### 1.1 Go to Firebase Console
1. Visit https://console.firebase.google.com/
2. Sign in with your Google account
3. Click "Add project" or "Create a project"

### 1.2 Configure Project
1. **Project name:** `pathfinder-enhanced`
2. **Google Analytics:** Disable (not needed for MVP)
3. Click "Create project"
4. Wait for project creation (~30 seconds)
5. Click "Continue"

---

## Step 2: Enable Email/Password Authentication (10 mins)

### 2.1 Navigate to Authentication
1. In Firebase Console, click "Authentication" in left sidebar
2. Click "Get started" button

### 2.2 Enable Email/Password Provider
1. Go to "Sign-in method" tab
2. Click on "Email/Password" provider
3. Toggle "Enable" switch to ON
4. Click "Save"

### 2.3 (Optional) Add Test User
1. Go to "Users" tab
2. Click "Add user"
3. Email: `test@example.com`
4. Password: `password123`
5. Click "Add user"

---

## Step 3: Get Backend Credentials (15 mins)

### 3.1 Generate Service Account Key
1. Click the gear icon ⚙️ next to "Project Overview"
2. Select "Project settings"
3. Go to "Service accounts" tab
4. Click "Generate new private key"
5. Click "Generate key" in the confirmation dialog
6. A JSON file will download

### 3.2 Configure Backend
1. Rename the downloaded file to `firebase-service-account.json`
2. Move it to `backend/` folder
3. **IMPORTANT:** Verify it's in `.gitignore`

```bash
# Verify the file is ignored
cd backend
git status
# Should NOT show firebase-service-account.json
```

---

## Step 4: Get Frontend Credentials (10 mins)

### 4.1 Register Web App
1. In Firebase Console → Project Settings → General
2. Scroll down to "Your apps" section
3. Click the web icon `</>`
4. App nickname: `Pathfinder Enhanced Web`
5. **Don't** check "Firebase Hosting"
6. Click "Register app"

### 4.2 Copy Configuration
You'll see a `firebaseConfig` object like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "pathfinder-enhanced.firebaseapp.com",
  projectId: "pathfinder-enhanced",
  storageBucket: "pathfinder-enhanced.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

### 4.3 Update Frontend Environment
1. Open `frontend/.env`
2. Replace the placeholder values:

```env
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=pathfinder-enhanced.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=pathfinder-enhanced
VITE_FIREBASE_STORAGE_BUCKET=pathfinder-enhanced.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
VITE_API_URL=http://localhost:5000
```

3. Save the file

---

## Step 5: Test the Setup (20 mins)

### 5.1 Start Backend Server
```bash
cd backend
npm run dev
```

Expected output:
```
🚀 Server running on port 5000
📍 http://localhost:5000
✅ Firebase Admin SDK initialized with service account
✅ Database connected successfully
```

### 5.2 Start Frontend Server
```bash
cd frontend
npm run dev
```

Expected output:
```
VITE v5.x.x  ready in xxx ms
➜  Local:   http://localhost:5173/
✅ Firebase initialized successfully
```

### 5.3 Test Authentication Flow

1. **Open browser:** http://localhost:5173/
2. **Sign Up Test:**
   - Enter email: `test2@example.com`
   - Enter password: `password123`
   - Click "Sign Up"
   - Should see: ✅ Signup successful!

3. **Verify in Firebase Console:**
   - Go to Authentication → Users
   - Should see `test2@example.com` in the list

4. **Test Protected Route:**
   - Click "Test Protected Route" button
   - Should see: ✅ Protected route success!
   - Check browser console for token

5. **Logout Test:**
   - Click "Logout"
   - Should see: ✅ Logged out successfully

6. **Sign In Test:**
   - Enter same email/password
   - Click "Sign In"
   - Should see: ✅ Sign in successful!

---

## Verification Checklist

Before moving to Day 4, verify:

- [ ] Firebase project created
- [ ] Email/Password authentication enabled
- [ ] Service account JSON downloaded and placed in backend/
- [ ] Frontend .env configured with Firebase credentials
- [ ] Backend server starts without errors
- [ ] Frontend server starts without errors
- [ ] Can create new user via frontend
- [ ] User appears in Firebase Console
- [ ] Can sign in with created user
- [ ] Protected route returns user data
- [ ] Can logout successfully
- [ ] firebase-service-account.json is in .gitignore
- [ ] frontend/.env is in .gitignore

---

## Common Issues & Solutions

### Issue: "Firebase: Error (auth/invalid-api-key)"
**Solution:**
- Double-check API key in `frontend/.env`
- Ensure no extra spaces or quotes
- Restart Vite dev server: `Ctrl+C` then `npm run dev`

### Issue: "Invalid token" in backend
**Solution:**
- Verify `firebase-service-account.json` is in `backend/` folder
- Check file is valid JSON (open in text editor)
- Restart backend server

### Issue: "User not found in database"
**Solution:**
- This is expected! We haven't created the signup endpoint yet
- This will be fixed on Day 4 when we create user registration
- For now, you can manually insert a test user in PostgreSQL:

```sql
INSERT INTO users (firebase_uid, name, email, city, role, skill_level)
VALUES ('FIREBASE_UID_HERE', 'Test User', 'test@example.com', 'Bangalore', 'player', 'intermediate');
```

### Issue: CORS error
**Solution:**
- Verify backend has `cors()` middleware enabled
- Check frontend is calling `http://localhost:5000` (not https)
- Restart both servers

### Issue: "Cannot find module 'firebase-admin'"
**Solution:**
```bash
cd backend
npm install firebase-admin
```

### Issue: Frontend shows "Firebase initialization error"
**Solution:**
- Check browser console for specific error
- Verify all VITE_ environment variables are set
- Restart frontend dev server

---

## Security Best Practices

### ✅ DO:
- Keep `firebase-service-account.json` in `.gitignore`
- Keep `.env` files in `.gitignore`
- Use environment variables for all credentials
- Rotate service account keys periodically
- Enable Firebase App Check (post-MVP)

### ❌ DON'T:
- Commit service account JSON to Git
- Share service account keys publicly
- Use production credentials in development
- Hardcode credentials in source code

---

## Firebase Console Quick Links

- **Authentication Users:** https://console.firebase.google.com/project/YOUR_PROJECT/authentication/users
- **Project Settings:** https://console.firebase.google.com/project/YOUR_PROJECT/settings/general
- **Service Accounts:** https://console.firebase.google.com/project/YOUR_PROJECT/settings/serviceaccounts

---

## Testing with Postman/Thunder Client

### Get ID Token
1. Sign in via frontend
2. Copy the ID token from the textarea
3. Use in API requests

### Test Protected Endpoint
```
GET http://localhost:5000/api/test-auth
Headers:
  Authorization: Bearer YOUR_ID_TOKEN_HERE
```

Expected Response:
```json
{
  "success": true,
  "message": "Authentication successful!",
  "user": {
    "user_id": "uuid",
    "name": "Test User",
    "email": "test@example.com",
    "role": "player",
    "city": "Bangalore"
  }
}
```

---

## Next Steps (Day 4)

Tomorrow we'll build on this authentication foundation:

1. **User Signup Endpoint** - Create user in PostgreSQL after Firebase auth
2. **User Login Endpoint** - Return user data from database
3. **Profile Endpoints** - GET and PATCH user profile
4. **Input Validation** - Validate all user inputs
5. **Error Handling** - Comprehensive error messages

---

## Troubleshooting Commands

```bash
# Check if Firebase is configured
cd backend
node -e "require('./config/firebase'); console.log('Firebase OK')"

# Test database connection
node scripts/testConnection.js

# Check environment variables (frontend)
cd frontend
npm run dev
# Open browser console and type: import.meta.env

# View Firebase users
# Go to Firebase Console → Authentication → Users
```

---

## Resources

- [Firebase Authentication Docs](https://firebase.google.com/docs/auth)
- [Firebase Admin SDK Docs](https://firebase.google.com/docs/admin/setup)
- [Firebase Web SDK Docs](https://firebase.google.com/docs/web/setup)

---

**Day 3 Complete! 🎉**

Firebase Authentication is now fully configured and ready for API development on Day 4!
