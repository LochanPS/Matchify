# MATCHIFY Deployment Guide

**Version:** 1.0  
**Last Updated:** December 20, 2025  
**Status:** Production Ready

---

## 🚀 Quick Start Deployment

### Prerequisites

- Node.js 18+
- PostgreSQL 12+
- Git
- Vercel CLI (for frontend)
- Railway CLI (for backend)

### Environment Setup

1. **Clone Repository**
```bash
git clone https://github.com/matchify/matchify.git
cd matchify
```

2. **Backend Setup**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with production values
```

3. **Frontend Setup**
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with production values
```

---

## 📦 Backend Deployment (Railway)

### Step 1: Connect Repository

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Create new project
railway init
```

### Step 2: Configure Environment

```bash
# Set environment variables
railway variables set NODE_ENV=production
railway variables set DATABASE_URL=postgresql://...
railway variables set FIREBASE_PROJECT_ID=...
railway variables set RAZORPAY_KEY_ID=...
railway variables set RAZORPAY_KEY_SECRET=...
railway variables set CLOUDINARY_CLOUD_NAME=...
railway variables set CLOUDINARY_API_KEY=...
railway variables set CLOUDINARY_API_SECRET=...
railway variables set JWT_SECRET=...
railway variables set SMTP_HOST=...
railway variables set SMTP_USER=...
railway variables set SMTP_PASSWORD=...
```

### Step 3: Deploy

```bash
# Deploy backend
railway up

# View logs
railway logs

# Get deployment URL
railway status
```

### Step 4: Verify Deployment

```bash
# Test health endpoint
curl https://api.matchify.app/health

# Expected response:
# {
#   "status": "healthy",
#   "database": "connected",
#   "uptime": 3600
# }
```

---

## 🎨 Frontend Deployment (Vercel)

### Step 1: Connect Repository

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
cd frontend
vercel
```

### Step 2: Configure Environment

In Vercel Dashboard:
1. Go to Settings → Environment Variables
2. Add:
   - `VITE_API_URL`: https://api.matchify.app
   - `VITE_FIREBASE_API_KEY`: [your key]
   - `VITE_FIREBASE_PROJECT_ID`: [your project]

### Step 3: Configure Domain

1. Go to Settings → Domains
2. Add custom domain: matchify.app
3. Update DNS records
4. Wait for SSL certificate

### Step 4: Verify Deployment

```bash
# Test homepage
curl https://matchify.app

# Check build status
vercel status
```

---

## 🗄️ Database Setup

### Step 1: Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE matchify_prod;

# Create user
CREATE USER matchify WITH PASSWORD 'strong_password_here';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE matchify_prod TO matchify;
```

### Step 2: Run Migrations

```bash
# Connect to database
psql -U matchify -d matchify_prod

# Run all migrations (in order)
\i backend/migrations/001_initial_schema.sql
\i backend/migrations/007_referral_system.sql
\i backend/migrations/008_community_building.sql
\i backend/migrations/034_remove_skill_levels.sql
\i backend/migrations/037_remove_skill_levels_complete.sql
\i backend/migrations/041_feedback_system.sql
\i backend/migrations/049_finalize_skill_removal.sql
\i backend/migrations/052_payments.sql
\i backend/migrations/052_tournament_posters.sql
\i backend/migrations/053_notifications.sql
\i backend/migrations/054_tournament_templates.sql
\i backend/migrations/055_analytics_dashboard.sql
```

### Step 3: Verify Database

```bash
# Check tables
\dt

# Check indexes
\di

# Verify data
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM tournaments;
```

---

## 🔐 Security Configuration

### SSL/TLS Certificate

```bash
# Vercel handles SSL automatically
# Railway handles SSL automatically
# Verify:
curl -I https://matchify.app
curl -I https://api.matchify.app
```

### Environment Variables

**Backend (.env)**
```
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://matchify:password@host:5432/matchify_prod
FIREBASE_PROJECT_ID=matchify-prod
FIREBASE_API_KEY=...
RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
JWT_SECRET=very_long_random_string_here
SMTP_HOST=smtp.gmail.com
SMTP_USER=noreply@matchify.app
SMTP_PASSWORD=...
SENTRY_DSN=...
```

**Frontend (.env)**
```
VITE_API_URL=https://api.matchify.app
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_PROJECT_ID=matchify-prod
```

### CORS Configuration

```javascript
// backend/middleware/security.js
const corsOptions = {
  origin: [
    'https://matchify.app',
    'https://www.matchify.app',
    'https://app.matchify.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
```

---

## 📊 Monitoring Setup

### Sentry Error Tracking

```bash
# Install Sentry
npm install @sentry/node

# Configure in backend
# backend/config/sentry.js
const Sentry = require("@sentry/node");
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: 'production',
  tracesSampleRate: 1.0
});
```

### Health Check Monitoring

```bash
# Set up monitoring service to check:
# GET https://api.matchify.app/health
# Every 5 minutes

# Alert if:
# - Status != "healthy"
# - Response time > 1000ms
# - Error rate > 5%
```

### Performance Monitoring

```bash
# Monitor key metrics:
# - API response time (p50, p95, p99)
# - Database query time
# - Error rate
# - Memory usage
# - CPU usage
# - Disk usage
```

---

## 🔄 Backup & Recovery

### Database Backup

```bash
# Daily backup
pg_dump -U matchify -d matchify_prod > backup_$(date +%Y%m%d).sql

# Store in S3
aws s3 cp backup_*.sql s3://matchify-backups/

# Retention: 30 days
```

### Restore from Backup

```bash
# Create new database
createdb matchify_restore

# Restore backup
psql -U matchify -d matchify_restore < backup_20251220.sql

# Verify
psql -U matchify -d matchify_restore -c "SELECT COUNT(*) FROM users;"
```

---

## 🚨 Rollback Procedure

### If Deployment Fails

```bash
# Backend Rollback (Railway)
railway rollback

# Frontend Rollback (Vercel)
vercel rollback

# Verify rollback
curl https://api.matchify.app/health
curl https://matchify.app
```

### Database Rollback

```bash
# If migration fails:
# 1. Restore from backup
psql -U matchify -d matchify_prod < backup_before_migration.sql

# 2. Verify data integrity
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM tournaments;

# 3. Notify team
```

---

## ✅ Post-Deployment Checklist

- [ ] Backend health check passing
- [ ] Frontend loading correctly
- [ ] Database connected
- [ ] All API endpoints responding
- [ ] Authentication working
- [ ] Payment gateway connected
- [ ] Email service working
- [ ] SMS service working
- [ ] Monitoring active
- [ ] Alerts configured
- [ ] Backups running
- [ ] SSL certificates valid
- [ ] CORS configured
- [ ] Rate limiting active
- [ ] Error tracking active

---

## 📞 Support

### Deployment Issues

**Backend Issues:**
- Check Railway logs: `railway logs`
- Check environment variables: `railway variables`
- Restart service: `railway restart`

**Frontend Issues:**
- Check Vercel logs: `vercel logs`
- Check build: `vercel build`
- Redeploy: `vercel --prod`

**Database Issues:**
- Check connection: `psql -U matchify -d matchify_prod -c "SELECT 1;"`
- Check migrations: `\dt` in psql
- Restore from backup if needed

### Emergency Contacts

- Engineering Lead: [contact]
- DevOps Lead: [contact]
- Database Admin: [contact]

---

## 📝 Deployment Log

| Date | Version | Status | Notes |
|------|---------|--------|-------|
| 2025-12-20 | 1.0.0 | Deployed | Soft launch |
| | | | |

---

**Status:** ✅ Ready for Production Deployment

