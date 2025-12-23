# 🚀 Quick Cloud Database Setup (No Local PostgreSQL Needed)

**Time:** 5 minutes  
**Cost:** FREE

---

## Option 1: Supabase (Recommended - Easiest)

### Step 1: Create Account
1. Go to: https://supabase.com
2. Click "Start your project"
3. Sign up with GitHub (fastest)

### Step 2: Create Project
1. Click "New Project"
2. Name: `matchify`
3. Database Password: Create a strong password (save it!)
4. Region: Choose closest to you
5. Click "Create new project"
6. Wait 2 minutes for setup

### Step 3: Get Connection String
1. Click "Settings" (gear icon)
2. Click "Database"
3. Scroll to "Connection string"
4. Copy the "URI" format
5. It looks like: `postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres`

### Step 4: Update Your .env
```bash
# Open backend/.env
# Replace DATABASE_URL with your Supabase URL:
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres
```

### Step 5: Run Migrations
```bash
cd backend
node run_migration.js
```

### Step 6: Start App
```bash
START_MATCHIFY.bat
```

**Done!** 🎉

---

## Option 2: Neon (Alternative)

### Step 1: Create Account
1. Go to: https://neon.tech
2. Sign up with GitHub

### Step 2: Create Project
1. Click "Create Project"
2. Name: `matchify`
3. Region: Choose closest
4. Click "Create"

### Step 3: Get Connection String
1. Copy the connection string shown
2. Format: `postgresql://user:pass@host/database`

### Step 4: Update .env and Run
```bash
# Update backend/.env with Neon URL
# Run migrations
cd backend
node run_migration.js

# Start app
START_MATCHIFY.bat
```

---

## Option 3: Railway (Alternative)

### Step 1: Create Account
1. Go to: https://railway.app
2. Sign up with GitHub

### Step 2: Create Database
1. Click "New Project"
2. Click "Provision PostgreSQL"
3. Wait for setup

### Step 3: Get Connection String
1. Click on PostgreSQL service
2. Go to "Connect" tab
3. Copy "Postgres Connection URL"

### Step 4: Update .env and Run
```bash
# Update backend/.env
# Run migrations and start
cd backend
node run_migration.js
START_MATCHIFY.bat
```

---

## ✅ Verify It Works

After setup:
1. Backend should start without errors
2. Open: http://localhost:5000/health
3. Should see: `{"status":"healthy","database":"connected"}`
4. Open: http://localhost:3000
5. Test signup and login

---

**Recommended:** Use Supabase - it's the easiest and has a great free tier!
