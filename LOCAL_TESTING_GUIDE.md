# 🚀 MATCHIFY - Local Testing Guide

**Date:** December 22, 2025  
**Time Required:** 10-15 minutes  
**Status:** Ready to Test Locally

---

## ⚡ QUICK START (3 Options)

### **OPTION 1: Quick Test WITHOUT Database (Fastest - 2 minutes)**

If you don't have PostgreSQL installed, you can still test the frontend:

```bash
# 1. Start frontend only
cd frontend
npm install
npm start

# Frontend will open at: http://localhost:3000
# Note: Some features won't work without backend, but you can see the UI
```

---

### **OPTION 2: Full Local Setup WITH Database (15 minutes)**

#### Step 1: Install PostgreSQL (if not installed)

**Download PostgreSQL:**
1. Go to: https://www.postgresql.org/download/windows/
2. Download PostgreSQL 14 or higher
3. Run installer
4. Remember the password you set for 'postgres' user
5. Keep default port: 5432

**Verify Installation:**
```bash
# Open new terminal after installation
psql --version
# Should show: psql (PostgreSQL) 14.x
```

#### Step 2: Create Database

```bash
# Open Command Prompt or PowerShell
# Login to PostgreSQL (enter password when prompted)
psql -U postgres

# In PostgreSQL prompt:
CREATE DATABASE matchify;
\q
```

#### Step 3: Configure Backend

```bash
# Navigate to backend folder
cd backend

# Create .env file (if not exists)
copy .env.example .env

# Edit .env file with Notepad
notepad .env
```

**Update these lines in .env:**
```env
PORT=5000
NODE_ENV=development

# Update this with your PostgreSQL password
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/matchify

# Leave these empty for local testing (optional features)
FIREBASE_PROJECT_ID=
RAZORPAY_KEY_ID=
CLOUDINARY_CLOUD_NAME=
```

#### Step 4: Run Database Migrations

```bash
# Still in backend folder
npm install
node run_migration.js

# Should see: "All migrations completed successfully!"
```

#### Step 5: Start Backend

```bash
# In backend folder
npm start

# Should see: "Server running on port 5000"
# Keep this terminal open
```

#### Step 6: Start Frontend

```bash
# Open NEW terminal
cd frontend
npm install
npm start

# Browser will open automatically at: http://localhost:3000
```

---

### **OPTION 3: Use START_MATCHIFY.bat (Automated - 5 minutes)**

**Prerequisites:**
- PostgreSQL installed and running
- Database created (see Step 2 above)
- .env file configured (see Step 3 above)
- Migrations run (see Step 4 above)

**Then simply:**
```bash
# Double-click START_MATCHIFY.bat
# Or run from terminal:
START_MATCHIFY.bat
```

This will:
1. Install backend dependencies
2. Start backend server
3. Install frontend dependencies
4. Start frontend
5. Open browser automatically

---

## ✅ VERIFY IT'S WORKING

### 1. Check Backend Health

Open browser: http://localhost:5000/health

**Expected Response:**
```json
{
  "status": "healthy",
  "database": "connected"
}
```

### 2. Check Frontend

Open browser: http://localhost:3000

**You should see:**
- ✅ MATCHIFY homepage
- ✅ "Get Started" button
- ✅ Navigation menu
- ✅ No console errors (press F12 to check)

### 3. Test User Signup

1. Click "Get Started"
2. Choose "Player" or "Organizer"
3. Fill in email and password
4. Click "Next"
5. Fill in name and city
6. Click "Complete Registration"

**Expected:**
- ✅ Redirects to dashboard
- ✅ Shows welcome message
- ✅ No errors

### 4. Test Tournament List

1. Click "Tournaments" in menu
2. Should see tournament list (empty at first)
3. Try filters: All, Singles, Doubles
4. No errors

---

## 🔧 TROUBLESHOOTING

### Problem: "Cannot connect to database"

**Solution:**
```bash
# 1. Check if PostgreSQL is running
# Windows: Open Services (Win + R, type services.msc)
# Find "postgresql-x64-14" and start it

# 2. Check database exists
psql -U postgres -l
# Should list "matchify" database

# 3. Check .env file
# Make sure DATABASE_URL has correct password
```

### Problem: "Port 5000 already in use"

**Solution:**
```bash
# Find what's using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID with actual number)
taskkill /PID <PID> /F

# Or change port in backend/.env
PORT=5001
```

### Problem: "Port 3000 already in use"

**Solution:**
```bash
# Frontend will ask: "Would you like to run on another port?"
# Press Y for Yes
# It will use port 3001 instead
```

### Problem: "npm: command not found"

**Solution:**
```bash
# Install Node.js
# Download from: https://nodejs.org/
# Choose LTS version (18.x or higher)
# Restart terminal after installation
```

### Problem: Frontend loads but can't connect to backend

**Solution:**
```bash
# 1. Check backend is running
# Open: http://localhost:5000/health

# 2. Check frontend .env
cd frontend
notepad .env

# Should have:
REACT_APP_API_URL=http://localhost:5000/api

# 3. Restart frontend
npm start
```

### Problem: "Migration failed"

**Solution:**
```bash
# 1. Drop and recreate database
psql -U postgres
DROP DATABASE matchify;
CREATE DATABASE matchify;
\q

# 2. Run migrations again
cd backend
node run_migration.js
```

---

## 📱 WHAT YOU CAN TEST LOCALLY

### ✅ Working Features (No external services needed):

- **Authentication:**
  - ✅ Signup (player/organizer)
  - ✅ Login
  - ✅ Logout
  - ✅ Profile view

- **Tournaments:**
  - ✅ View tournament list
  - ✅ Filter tournaments
  - ✅ Search tournaments
  - ✅ View tournament details
  - ✅ Create tournament (organizer)
  - ✅ Edit tournament (organizer)

- **Matches:**
  - ✅ View matches
  - ✅ Update match scores (organizer)
  - ✅ View match history

- **Dashboard:**
  - ✅ Player dashboard
  - ✅ Organizer dashboard
  - ✅ Statistics

### ⚠️ Limited Features (Need external services):

- **Payments:** Need Razorpay keys (can add later)
- **Image Uploads:** Need Cloudinary keys (can add later)
- **Email Notifications:** Need SMTP config (can add later)

---

## 🎯 TESTING CHECKLIST

After starting the app, test these flows:

### Player Flow:
- [ ] Signup as player
- [ ] View tournament list
- [ ] Click on a tournament
- [ ] View tournament details
- [ ] View profile
- [ ] Logout

### Organizer Flow:
- [ ] Signup as organizer
- [ ] Go to organizer dashboard
- [ ] Click "Create Tournament"
- [ ] Fill in tournament details
- [ ] Submit tournament
- [ ] View created tournament
- [ ] Edit tournament
- [ ] View registered players (if any)

### General:
- [ ] Navigation works
- [ ] No console errors
- [ ] Pages load quickly
- [ ] Forms validate properly
- [ ] Error messages show correctly

---

## 📊 SAMPLE DATA (Optional)

Want to test with sample data? Run this in PostgreSQL:

```sql
-- Connect to database
psql -U postgres -d matchify

-- Insert sample tournament
INSERT INTO tournaments (
  tournament_id, 
  organizer_id, 
  name, 
  sport, 
  match_type, 
  max_players, 
  entry_fee, 
  prize_money, 
  start_date, 
  venue, 
  city, 
  status
) VALUES (
  gen_random_uuid(),
  (SELECT user_id FROM users WHERE role = 'organizer' LIMIT 1),
  'Weekend Singles Championship',
  'Badminton',
  'singles',
  16,
  500,
  5000,
  CURRENT_DATE + INTERVAL '7 days',
  'Sports Arena',
  'Bangalore',
  'upcoming'
);
```

---

## 🚀 NEXT STEPS

Once local testing works:

1. **Test all features** - Make sure everything works
2. **Fix any bugs** - Note issues and fix them
3. **Add sample data** - Create test tournaments
4. **Test with friends** - Get feedback
5. **Ready for production** - Follow LAUNCH_NOW.md

---

## 💡 TIPS

### Development Tips:
- Keep backend and frontend terminals open
- Check console for errors (F12 in browser)
- Use React DevTools for debugging
- Check Network tab for API calls

### Performance Tips:
- Backend should respond in <100ms
- Frontend should load in <2s
- No memory leaks (check Task Manager)

### Database Tips:
- Backup before testing: `pg_dump matchify > backup.sql`
- Reset if needed: Drop and recreate database
- Check data: `psql -U postgres -d matchify`

---

## 📞 NEED HELP?

### Check These Files:
- **QUICK_START_GUIDE.md** - Detailed setup guide
- **README.md** - Project overview
- **backend/README.md** - Backend documentation
- **frontend/README.md** - Frontend documentation

### Common Commands:

```bash
# Check if services are running
netstat -ano | findstr :5000  # Backend
netstat -ano | findstr :3000  # Frontend

# Restart services
# Ctrl + C in terminal, then npm start again

# Check logs
# Backend: Shows in terminal
# Frontend: Check browser console (F12)

# Database queries
psql -U postgres -d matchify
\dt  # List tables
\d users  # Describe users table
SELECT * FROM users;  # View users
```

---

## ✅ SUCCESS CRITERIA

Your local setup is working if:

- ✅ Backend responds at http://localhost:5000/health
- ✅ Frontend loads at http://localhost:3000
- ✅ You can signup/login
- ✅ You can view tournaments
- ✅ You can create tournaments (as organizer)
- ✅ No console errors
- ✅ Database queries work

---

**You're ready to test MATCHIFY locally!** 🎉

**Choose your option:**
- **Quick UI Test:** Option 1 (no database needed)
- **Full Test:** Option 2 (complete setup)
- **Automated:** Option 3 (use batch file)

---

**Made with ❤️ by the MATCHIFY Team**

*Test locally, launch globally!*
