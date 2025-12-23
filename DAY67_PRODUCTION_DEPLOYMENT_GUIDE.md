# Day 67 - Production Deployment Guide

**Date:** December 23, 2025  
**Status:** 🚀 PRODUCTION DEPLOYMENT READY  
**Architecture:** Frontend (Vercel) + Backend (Railway) + Database (PostgreSQL)

---

## 🏗️ Final Architecture

```
Frontend (React/Vite) → Vercel
Backend (Node/Express) → Railway  
Database (PostgreSQL) → Railway Plugin
```

---

## 🟣 STEP 1: Deploy Backend to Railway

### 1.1 Create Railway Project
1. Go to [railway.app](https://railway.app)
2. Sign up/Login with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose your `Matchify` repository

### 1.2 Add PostgreSQL Database
1. In your Railway project dashboard
2. Click "New" → "Database" → "PostgreSQL"
3. Railway automatically generates:
   - `DATABASE_URL`
   - `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`

### 1.3 Configure Backend Service
1. Click on your backend service
2. Go to "Settings" → "Environment"
3. Add these variables:
   ```
   NODE_ENV=production
   PORT=5000
   FRONTEND_URL=https://matchify.vercel.app
   ```
4. Railway automatically injects `DATABASE_URL`

### 1.4 Deploy Backend
1. Railway automatically deploys from your GitHub repo
2. Check "Deployments" tab for build status
3. Once deployed, note your backend URL: `https://your-backend.railway.app`

---

## 🟢 STEP 2: Run Database Migrations

### 2.1 Connect to Railway Database
1. In Railway dashboard, click on PostgreSQL service
2. Go to "Connect" tab
3. Copy the `DATABASE_URL`

### 2.2 Run Migrations Locally
```bash
# Set DATABASE_URL in your local .env
echo "DATABASE_URL=your_railway_database_url" > backend/.env

# Run PostgreSQL migrations
cd backend
npm run migrate:postgresql
```

### 2.3 Or Run Migrations on Railway
1. Go to Railway dashboard
2. Click on backend service
3. Go to "Settings" → "Environment"
4. Add temporary variable: `RUN_MIGRATIONS=true`
5. Redeploy the service
6. Remove the variable after migration completes

---

## 🔵 STEP 3: Deploy Frontend to Vercel

### 3.1 Create Vercel Project
1. Go to [vercel.com](https://vercel.com)
2. Sign up/Login with GitHub
3. Click "New Project"
4. Import your `Matchify` repository

### 3.2 Configure Build Settings
**Option A: Use vercel.json (Recommended)**
- Vercel will auto-detect the `vercel.json` file in your repo
- No manual configuration needed

**Option B: Manual Configuration**
1. Framework Preset: `Vite`
2. Root Directory: `frontend`
3. Build Command: `npm run build`
4. Output Directory: `dist`

### 3.3 Set Environment Variables
1. In Vercel dashboard → Project → Settings → Environment Variables
2. Add these variables:
   ```
   VITE_API_URL=https://your-backend.railway.app
   VITE_FIREBASE_API_KEY=your_firebase_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_RAZORPAY_KEY_ID=your_razorpay_key
   ```

### 3.4 Deploy Frontend
1. Click "Deploy"
2. Vercel builds and deploys automatically
3. Note your frontend URL: `https://matchify.vercel.app`

---

## 🔧 STEP 4: Update CORS Configuration

### 4.1 Update Backend CORS
The backend is already configured to accept requests from:
- `https://matchify.vercel.app`
- `https://matchify-frontend.vercel.app`

### 4.2 If You Have Different Vercel URL
1. Update `backend/middleware/security.js`
2. Add your Vercel URL to `allowedOrigins` array
3. Push changes to GitHub
4. Railway will auto-deploy

---

## ✅ STEP 5: Test Production Deployment

### 5.1 Test Backend
```bash
# Health check
curl https://your-backend.railway.app/health

# API test
curl https://your-backend.railway.app/
```

### 5.2 Test Frontend
1. Open `https://matchify.vercel.app`
2. Try user signup/login
3. Create a tournament
4. Join a tournament
5. Test all major features

### 5.3 Test Database
1. Create a user account
2. Create a tournament
3. Check if data persists
4. Test match generation

---

## 📊 STEP 6: Monitor and Optimize

### 6.1 Railway Monitoring
1. Check "Metrics" tab for performance
2. Monitor "Logs" for errors
3. Set up alerts if needed

### 6.2 Vercel Analytics
1. Enable Vercel Analytics
2. Monitor page load times
3. Check for build errors

### 6.3 Database Monitoring
1. Monitor PostgreSQL metrics in Railway
2. Check connection pool usage
3. Monitor query performance

---

## 🚨 Troubleshooting

### Backend Issues
```bash
# Check Railway logs
railway logs

# Test database connection
node -e "
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query('SELECT NOW()').then(r => console.log(r.rows[0]));
"
```

### Frontend Issues
```bash
# Check build logs in Vercel dashboard
# Test API connection
curl https://your-backend.railway.app/health
```

### CORS Issues
```bash
# Test CORS
curl -H "Origin: https://matchify.vercel.app" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS \
     https://your-backend.railway.app/
```

---

## 📋 Deployment Checklist

### Pre-Deployment
- [ ] Code pushed to GitHub
- [ ] Environment variables configured
- [ ] Database migrations ready
- [ ] CORS configured correctly

### Railway Backend
- [ ] Project created
- [ ] PostgreSQL database added
- [ ] Environment variables set
- [ ] Backend deployed successfully
- [ ] Health check passing

### Vercel Frontend
- [ ] Project created
- [ ] Build settings configured
- [ ] Environment variables set
- [ ] Frontend deployed successfully
- [ ] Can access the app

### Post-Deployment
- [ ] Database migrations run
- [ ] User signup/login works
- [ ] Tournament creation works
- [ ] API calls successful
- [ ] No CORS errors
- [ ] Performance acceptable

---

## 🎯 Production URLs

After deployment, you'll have:

- **Frontend:** `https://matchify.vercel.app`
- **Backend:** `https://your-backend.railway.app`
- **Database:** Managed by Railway PostgreSQL

---

## 🔄 Continuous Deployment

### Automatic Deployments
- **Railway:** Auto-deploys on every push to `main` branch
- **Vercel:** Auto-deploys on every push to `main` branch

### Manual Deployments
- **Railway:** Click "Deploy" in dashboard
- **Vercel:** Click "Redeploy" in dashboard

---

## 📈 Next Steps

### Immediate
1. Test all features in production
2. Monitor for errors
3. Optimize performance
4. Set up monitoring alerts

### Short Term
1. Add custom domain
2. Set up SSL certificates
3. Configure CDN
4. Add error tracking (Sentry)

### Long Term
1. Scale database if needed
2. Add caching (Redis)
3. Implement CI/CD pipeline
4. Add automated testing

---

## 🎉 Success!

Your MATCHIFY platform is now live in production with:

- ✅ Scalable architecture
- ✅ Production database
- ✅ Secure CORS configuration
- ✅ Automatic deployments
- ✅ Monitoring and logs
- ✅ SSL certificates
- ✅ CDN distribution

**Ready for users!** 🚀

---

**Made with ❤️ by the MATCHIFY Team**

*Production deployment made simple!*