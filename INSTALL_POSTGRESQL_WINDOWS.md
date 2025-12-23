# 🐘 Install PostgreSQL on Windows - Step by Step

**Time Required:** 10-15 minutes  
**Difficulty:** Easy  
**Cost:** FREE

---

## 📥 STEP 1: Download PostgreSQL

### Option A: Official Installer (Recommended)

1. **Open your browser**
2. **Go to:** https://www.postgresql.org/download/windows/
3. **Click:** "Download the installer"
4. **Choose:** PostgreSQL 16.x (latest stable version)
5. **Select:** Windows x86-64
6. **Download:** The .exe file (about 300MB)

### Option B: Direct Link

Download directly: https://www.enterprisedb.com/downloads/postgres-postgresql-downloads

Choose: **PostgreSQL 16.x - Windows x86-64**

---

## 🔧 STEP 2: Install PostgreSQL

### Run the Installer

1. **Double-click** the downloaded .exe file
2. **Click** "Yes" if Windows asks for permission

### Installation Wizard

**Screen 1: Welcome**
- Click "Next"

**Screen 2: Installation Directory**
- Keep default: `C:\Program Files\PostgreSQL\16`
- Click "Next"

**Screen 3: Select Components**
- ✅ PostgreSQL Server (checked)
- ✅ pgAdmin 4 (checked) - GUI tool
- ✅ Stack Builder (optional)
- ✅ Command Line Tools (checked) - IMPORTANT!
- Click "Next"

**Screen 4: Data Directory**
- Keep default: `C:\Program Files\PostgreSQL\16\data`
- Click "Next"

**Screen 5: Password**
- **IMPORTANT:** Set password for superuser (postgres)
- **Use:** `postgres` (to match your .env file)
- **Confirm:** `postgres`
- **Remember this password!**
- Click "Next"

**Screen 6: Port**
- Keep default: `5432`
- Click "Next"

**Screen 7: Locale**
- Keep default: `[Default locale]`
- Click "Next"

**Screen 8: Summary**
- Review settings
- Click "Next"

**Screen 9: Installation**
- Wait 5-10 minutes for installation
- Click "Next" when done

**Screen 10: Finish**
- Uncheck "Launch Stack Builder" (not needed now)
- Click "Finish"

---

## ✅ STEP 3: Verify Installation

### Check if PostgreSQL is Running

**Option A: Using Services**
```
1. Press Win + R
2. Type: services.msc
3. Press Enter
4. Look for: "postgresql-x64-16"
5. Status should be: "Running"
```

**Option B: Using Command Line**
```bash
# Open Command Prompt (Win + R, type cmd)
# Check version
psql --version

# Should show: psql (PostgreSQL) 16.x
```

If you see an error "psql is not recognized":
1. Close and reopen Command Prompt
2. Or restart your computer
3. PostgreSQL should be in PATH automatically

---

## 🗄️ STEP 4: Create Matchify Database

### Open Command Prompt

```bash
# Press Win + R
# Type: cmd
# Press Enter
```

### Connect to PostgreSQL

```bash
# Login as postgres user
psql -U postgres

# Enter password when prompted: postgres
```

You should see:
```
postgres=#
```

### Create Database

```sql
-- Create the matchify database
CREATE DATABASE matchify;

-- Verify it was created
\l

-- You should see "matchify" in the list

-- Exit psql
\q
```

---

## 🚀 STEP 5: Run Matchify Migrations

### Navigate to Backend Folder

```bash
# In Command Prompt
cd C:\Users\pokka\AI Agent Suite\pathfinder-enhanced\backend
```

### Run Migrations

```bash
node run_migration.js
```

**Expected Output:**
```
🔄 Starting database migrations...
✅ Migration 001_initial_schema.sql completed
✅ Migration 007_referral_system.sql completed
✅ Migration 008_community_building.sql completed
... (more migrations)
✅ All migrations completed successfully!
```

If you see errors:
- Check database connection
- Verify password is correct in backend/.env
- Make sure PostgreSQL service is running

---

## 🎉 STEP 6: Start Matchify

### Option A: Use Batch File (Easiest)

```bash
# Double-click START_MATCHIFY.bat
# Or from Command Prompt:
START_MATCHIFY.bat
```

### Option B: Manual Start

**Terminal 1 (Backend):**
```bash
cd backend
npm start
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm start
```

---

## ✅ STEP 7: Verify Everything Works

### Check Backend

1. **Open browser:** http://localhost:5000/health

**Expected Response:**
```json
{
  "status": "healthy",
  "database": "connected",
  "uptime": 5
}
```

### Check Frontend

1. **Open browser:** http://localhost:3000
2. **You should see:** Matchify homepage
3. **Press F12:** Check console for errors (should be none)

### Test Signup

1. Click "Get Started"
2. Choose "Player"
3. Enter email: test@example.com
4. Enter password: Test123!
5. Click "Next"
6. Enter name: Test User
7. Enter city: Bangalore
8. Click "Complete Registration"
9. Should redirect to dashboard ✅

---

## 🔧 TROUBLESHOOTING

### Problem: "psql: command not found"

**Solution:**
```bash
# Add PostgreSQL to PATH manually
# 1. Press Win + R
# 2. Type: sysdm.cpl
# 3. Go to "Advanced" tab
# 4. Click "Environment Variables"
# 5. Under "System variables", find "Path"
# 6. Click "Edit"
# 7. Click "New"
# 8. Add: C:\Program Files\PostgreSQL\16\bin
# 9. Click OK
# 10. Restart Command Prompt
```

### Problem: "Connection refused"

**Solution:**
```bash
# Check if PostgreSQL is running
# Win + R → services.msc
# Find "postgresql-x64-16"
# Right-click → Start

# Or restart the service
net stop postgresql-x64-16
net start postgresql-x64-16
```

### Problem: "Password authentication failed"

**Solution:**
```bash
# Update backend/.env with correct password
# Open: backend\.env
# Change: DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/matchify
```

### Problem: "Database does not exist"

**Solution:**
```bash
# Create database again
psql -U postgres
CREATE DATABASE matchify;
\q
```

### Problem: "Port 5432 already in use"

**Solution:**
```bash
# Check what's using the port
netstat -ano | findstr :5432

# Kill the process (replace PID)
taskkill /PID <PID> /F

# Or change port in PostgreSQL config
```

### Problem: Migration fails

**Solution:**
```bash
# Drop and recreate database
psql -U postgres
DROP DATABASE matchify;
CREATE DATABASE matchify;
\q

# Run migrations again
cd backend
node run_migration.js
```

---

## 📊 USEFUL POSTGRESQL COMMANDS

### Connect to Database
```bash
# Connect to matchify database
psql -U postgres -d matchify
```

### View Tables
```sql
-- List all tables
\dt

-- Describe a table
\d users

-- View data
SELECT * FROM users;
SELECT * FROM tournaments;
```

### Database Management
```sql
-- List all databases
\l

-- Switch database
\c matchify

-- Drop database (careful!)
DROP DATABASE matchify;

-- Create database
CREATE DATABASE matchify;

-- Exit
\q
```

### Backup & Restore
```bash
# Backup database
pg_dump -U postgres matchify > backup.sql

# Restore database
psql -U postgres matchify < backup.sql
```

---

## 🎯 QUICK REFERENCE

### Start PostgreSQL Service
```bash
net start postgresql-x64-16
```

### Stop PostgreSQL Service
```bash
net stop postgresql-x64-16
```

### Restart PostgreSQL Service
```bash
net stop postgresql-x64-16
net start postgresql-x64-16
```

### Check PostgreSQL Status
```bash
sc query postgresql-x64-16
```

---

## 📱 NEXT STEPS

After PostgreSQL is installed and working:

1. ✅ **Test Matchify locally**
   - Run START_MATCHIFY.bat
   - Test all features
   - Create sample tournaments

2. ✅ **Add sample data** (optional)
   - See LOCAL_TESTING_GUIDE.md
   - Insert test tournaments
   - Create test users

3. ✅ **Configure external services** (optional)
   - Add Razorpay keys for payments
   - Add Cloudinary keys for images
   - Test payment flow

4. ✅ **Deploy to production**
   - Follow LAUNCH_NOW.md
   - Deploy to Heroku/Vercel
   - Go live!

---

## 🆘 STILL HAVING ISSUES?

### Check These:

1. **PostgreSQL installed?**
   ```bash
   psql --version
   ```

2. **Service running?**
   ```bash
   sc query postgresql-x64-16
   ```

3. **Database created?**
   ```bash
   psql -U postgres -l
   ```

4. **Migrations run?**
   ```bash
   psql -U postgres -d matchify
   \dt
   ```

5. **Backend .env correct?**
   ```bash
   type backend\.env
   ```

---

## ✅ INSTALLATION CHECKLIST

- [ ] PostgreSQL downloaded
- [ ] PostgreSQL installed
- [ ] Password set to: `postgres`
- [ ] Service running
- [ ] psql command works
- [ ] Database `matchify` created
- [ ] Migrations completed
- [ ] Backend starts without errors
- [ ] Frontend loads
- [ ] Can signup/login
- [ ] No console errors

---

**You're ready to run Matchify locally!** 🎉

**After installation, run:**
```bash
START_MATCHIFY.bat
```

**Then open:** http://localhost:3000

---

**Made with ❤️ by the MATCHIFY Team**

*Local development made easy!*
