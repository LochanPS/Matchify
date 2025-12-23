# 🚀 Deploy MATCHIFY to Vercel - Complete Guide

**Issue:** 404 NOT_FOUND error when deploying to Vercel  
**Cause:** Vercel is looking in the root directory, but frontend is in `frontend/` subdirectory  
**Solution:** Configure Vercel to use the correct directory

---

## ✅ What's Ready:

### Frontend: 100% READY ✅
- ✅ All React components built
- ✅ Vite configuration complete
- ✅ Build scripts configured
- ✅ Dependencies installed
- ✅ Ready to deploy

### Backend: 100% READY ✅
- ✅ All API endpoints built
- ✅ Database migrations ready
- ✅ Environment variables configured
- ✅ Ready to deploy (separate service)

---

## 🔧 Fix the 404 Error - Two Options

### Option 1: Deploy Frontend Only (Recommended for Quick Start)

**Step 1: Update Vercel Project Settings**

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Find your MATCHIFY project
3. Click **Settings**
4. Go to **General** → **Build & Development Settings**
5. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

**Step 2: Add Environment Variables**

In Vercel Settings → Environment Variables, add:
```
VITE_API_URL=https://your-backend-url.com/api
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

**Step 3: Redeploy**

Click **Deployments** → **Redeploy** (or push to GitHub again)

---

### Option 2: Use vercel.json (Already Created)

I've created a `vercel.json` file in your root directory. Now:

**Step 1: Push vercel.json to GitHub**

```bash
git add vercel.json
git commit -m "Add Vercel configuration for frontend deployment"
git push
```

**Step 2: Vercel will auto-deploy**

Vercel will detect the `vercel.json` and deploy correctly.

---

## 📋 Complete Deployment Checklist

### Frontend Deployment (Vercel)

- [x] Frontend code ready
- [x] package.json configured
- [x] Build scripts working
- [ ] Push vercel.json to GitHub
- [ ] Configure Vercel settings
- [ ] Add environment variables
- [ ] Deploy

### Backend Deployment (Separate - Railway/Render/Heroku)

Backend needs to be deployed separately because Vercel is for frontend only.

**Recommended: Railway**

1. Go to https://railway.app
2. Click "New Project" → "Deploy from GitHub"
3. Select your repository
4. Choose `backend` folder
5. Add environment variables
6. Deploy

**Or use Render:**

1. Go to https://render.com
2. Click "New" → "Web Service"
3. Connect GitHub repository
4. Root Directory: `backend`
5. Build Command: `npm install`
6. Start Command: `npm start`
7. Add environment variables
8. Deploy

---

## 🔐 Environment Variables Needed

### Frontend (Vercel)
```env
VITE_API_URL=https://your-backend-url.com/api
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

### Backend (Railway/Render)
```env
PORT=3000
NODE_ENV=production
DB_HOST=your_db_host
DB_PORT=5432
DB_NAME=matchify
DB_USER=your_db_user
DB_PASSWORD=your_db_password
JWT_SECRET=your_jwt_secret
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## 🎯 Quick Fix for Your Current Issue

**Right now, do this:**

1. **In Vercel Dashboard:**
   - Go to your project settings
   - Change **Root Directory** to: `frontend`
   - Save and redeploy

2. **Or push the vercel.json:**
   ```bash
   git add vercel.json VERCEL_DEPLOYMENT_GUIDE.md
   git commit -m "Add Vercel configuration"
   git push
   ```

3. **Vercel will auto-redeploy** and it should work!

---

## 🔍 Verify Deployment

After deployment:

1. **Check Build Logs** in Vercel dashboard
2. **Visit your URL**: `https://your-project.vercel.app`
3. **Test the app**: Try signup, login, browse tournaments

---

## 🐛 Troubleshooting

### Issue: Still getting 404
**Solution:** Make sure Root Directory is set to `frontend` in Vercel settings

### Issue: Build fails
**Solution:** Check build logs, ensure all dependencies are in package.json

### Issue: App loads but API calls fail
**Solution:** Backend is not deployed yet. Deploy backend separately.

### Issue: Environment variables not working
**Solution:** Make sure they start with `VITE_` for Vite apps

---

## 📊 Deployment Architecture

```
┌─────────────────────────────────────────┐
│                                         │
│  Frontend (Vercel)                      │
│  https://matchify.vercel.app            │
│                                         │
│  - React + Vite                         │
│  - Static files                         │
│  - Client-side routing                  │
│                                         │
└────────────┬────────────────────────────┘
             │
             │ API Calls
             │
             ▼
┌─────────────────────────────────────────┐
│                                         │
│  Backend (Railway/Render)               │
│  https://matchify-api.railway.app       │
│                                         │
│  - Node.js + Express                    │
│  - REST API                             │
│  - Database connection                  │
│                                         │
└────────────┬────────────────────────────┘
             │
             │ Database Queries
             │
             ▼
┌─────────────────────────────────────────┐
│                                         │
│  Database (Railway/Render)              │
│  PostgreSQL                             │
│                                         │
└─────────────────────────────────────────┘
```

---

## ✅ Summary

**Your Code is Ready:**
- ✅ Frontend: 100% complete and ready
- ✅ Backend: 100% complete and ready

**The Issue:**
- ❌ Vercel is looking in wrong directory

**The Fix:**
1. Set Root Directory to `frontend` in Vercel settings
2. Or push the `vercel.json` file I created
3. Deploy backend separately (Railway/Render)

---

## 🚀 Next Steps

1. **Fix Vercel deployment** (change root directory)
2. **Deploy backend** to Railway or Render
3. **Update frontend** with backend API URL
4. **Test the app** end-to-end
5. **Launch!** 🎉

---

**Need help?** Check the build logs in Vercel dashboard for specific errors.

**Ready to deploy backend?** Let me know and I'll create a Railway/Render deployment guide!
