# Pathfinder Enhanced - Complete Setup Guide

## Day 2: Database Setup

This guide will help you set up PostgreSQL database for Pathfinder Enhanced.

## Choose Your Database Option

### Option 1: Railway (Recommended for Production)

**Pros:** Easy setup, automatic backups, $5/month free credit
**Best for:** Production deployment, team collaboration

#### Steps:
1. Go to https://railway.app/
2. Sign up with GitHub
3. Click "New Project" → "Provision PostgreSQL"
4. Wait 30 seconds for provisioning
5. Click on PostgreSQL service → "Connect" tab
6. Copy the "Postgres Connection URL"
7. Paste into `backend/.env` as `DATABASE_URL`

```env
DATABASE_URL=postgresql://postgres:password@containers-us-west-123.railway.app:5432/railway
```

8. Run migrations:
```bash
cd backend
node scripts/runMigrations.js
```

---

### Option 2: Supabase (Alternative Cloud)

**Pros:** Free 500MB, includes auth, real-time features
**Best for:** MVP development, quick prototyping

#### Steps:
1. Go to https://supabase.com/
2. Sign up and create new project
3. Set project name: `pathfinder-enhanced`
4. Generate strong database password
5. Choose region (closest to you)
6. Wait 2 minutes for initialization
7. Go to Project Settings → Database
8. Copy "Connection string" (URI mode)
9. Replace `[YOUR-PASSWORD]` with your password
10. Paste into `backend/.env` as `DATABASE_URL`

```env
DATABASE_URL=postgresql://postgres:your_password@db.abc123.supabase.co:5432/postgres
```

11. Run migrations via Supabase SQL Editor:
    - Go to SQL Editor
    - Click "New Query"
    - Copy content from `backend/migrations/001_initial_schema.sql`
    - Click "Run"

---

### Option 3: Local PostgreSQL (Development)

**Pros:** Full control, no internet required, free
**Best for:** Local development, learning

#### Installation:

**Mac (Homebrew):**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Windows:**
1. Download from https://www.postgresql.org/download/windows/
2. Run installer
3. Remember the password you set for postgres user
4. Add PostgreSQL bin to PATH

#### Setup Database:
```bash
# Login as postgres user
psql postgres

# Create database
CREATE DATABASE pathfinder_enhanced;

# Create user
CREATE USER pathfinder_user WITH PASSWORD 'your_secure_password';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE pathfinder_enhanced TO pathfinder_user;

# Exit
\q
```

#### Configure Environment:
```env
DATABASE_URL=postgresql://pathfinder_user:your_secure_password@localhost:5432/pathfinder_enhanced
```

#### Run Migrations:
```bash
cd backend
node scripts/runMigrations.js
```

---

## Verify Setup

### Test Connection
```bash
cd backend
node scripts/testConnection.js
```

**Expected Output:**
```
🔄 Testing database connection...
✅ Database connected successfully!
⏰ Current database time: 2024-12-17T10:30:45.123Z

📋 Tables created:
  - matches
  - participants
  - tournaments
  - users

👥 Test users created: 5

✅ All checks passed! Database is ready.
```

### Check Tables
```bash
# Connect to database
psql $DATABASE_URL

# List tables
\dt

# Describe users table
\d users

# View test data
SELECT * FROM users;

# Exit
\q
```

---

## Common Issues & Solutions

### Issue: "connection refused"
**Solution:** 
- Check if PostgreSQL is running: `brew services list` (Mac) or `sudo systemctl status postgresql` (Linux)
- Verify DATABASE_URL is correct
- Check firewall settings

### Issue: "password authentication failed"
**Solution:**
- Double-check password in DATABASE_URL
- Ensure no special characters need URL encoding
- Try resetting password

### Issue: "relation already exists"
**Solution:**
Drop all tables and re-run migration:
```sql
DROP TABLE IF EXISTS matches CASCADE;
DROP TABLE IF EXISTS participants CASCADE;
DROP TABLE IF EXISTS tournaments CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS skill_level CASCADE;
DROP TYPE IF EXISTS match_type CASCADE;
DROP TYPE IF EXISTS tournament_format CASCADE;
DROP TYPE IF EXISTS tournament_status CASCADE;
DROP TYPE IF EXISTS match_status CASCADE;
```

### Issue: SSL connection error (Railway/Supabase)
**Solution:**
Ensure SSL is configured in `config/database.js`:
```javascript
ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
```

---

## Next Steps

Once database is verified:
- [x] Database created and accessible
- [x] All 4 tables created
- [x] Foreign keys working
- [x] Test data inserted
- [x] Connection test passes

**Ready for Day 3: Firebase Authentication Setup**

---

## Useful Commands

```bash
# Connect to database
psql $DATABASE_URL

# List all tables
\dt

# Describe table structure
\d users

# View enum types
\dT

# Count records
SELECT COUNT(*) FROM users;

# Exit psql
\q

# Backup database
pg_dump $DATABASE_URL > backup.sql

# Restore database
psql $DATABASE_URL < backup.sql
```

---

## Database Schema Summary

### Tables (4)
- **users** - Player and organizer accounts
- **tournaments** - Tournament information
- **participants** - Tournament registrations
- **matches** - Match records

### Enums (6)
- user_role, skill_level, match_type
- tournament_format, tournament_status, match_status

### Indexes (15+)
Optimized for fast queries on foreign keys and search fields

### Triggers (2)
- Validate organizer role on tournament creation
- Validate player role on tournament join

---

## Support

If you encounter issues:
1. Check the error message carefully
2. Verify DATABASE_URL format
3. Ensure PostgreSQL version is 14+
4. Review `/docs/DATABASE.md` for schema details
5. Check Railway/Supabase dashboard for connection issues

---

**Day 2 Complete! 🎉**

Time spent: ~2 hours
Next: Day 3 - Firebase Authentication
