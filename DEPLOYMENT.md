# Deployment Guide: Railway + Vercel

## 📦 Architecture
- **Backend**: Railway (Node.js + Socket.io)
- **Frontend**: Vercel (React + Vite)
- **Database**: MongoDB Atlas

---

## 🚂 Part 1: Deploy Backend to Railway

### Step 1: Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub

### Step 2: Deploy Backend
1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose your `chat-app` repository
4. Railway will auto-detect it's a Node.js project

### Step 3: Configure Root Directory
1. In Railway dashboard, go to **Settings**
2. Under **"Build & Deploy"**
3. Set **Root Directory**: `server`
4. Set **Start Command**: `node server.js`

### Step 4: Add Environment Variables
Go to **Variables** tab and add:

```
MONGODB_URI=mongodb+srv://vigneshse23_db_user:vignesh123@cluster0.xwnuqjm.mongodb.net
JWT_SECRET=vs#secret
PORT=5000
NODE_ENV=production

CLOUDINARY_CLOUD_NAME=ded9ub7cr
CLOUDINARY_API_KEY=944865746549945
CLOUDINARY_API_SECRET=O_McPovVAmNddvnpXLDlNt1tlZo

GEMINI_API_KEY=AIzaSyByA14X_zEcx6ZZLvNj1oqUgkYUJK79D7c
GEMINI_MODEL=gemini-flash-latest

AI_RATE_LIMIT_ENABLED=true
AI_CACHE_TTL=86400
MODERATION_ENABLED=false

FRONTEND_URL=https://your-app.vercel.app
```

**Note**: Update `FRONTEND_URL` after deploying frontend (Step 2)

### Step 5: Get Your Railway URL
1. After deployment, Railway will give you a URL like:
   - `https://your-app-production.up.railway.app`
2. **Copy this URL** - you'll need it for frontend!

### Step 6: Enable Public Networking
1. Go to **Settings** → **Networking**
2. Click **"Generate Domain"**
3. Your backend is now live! ✅

---

## ▲ Part 2: Deploy Frontend to Vercel

### Step 1: Update Frontend Environment Variable
1. Open `client/.env`
2. Replace with your **Railway backend URL**:
   ```
   VITE_BACKEND_URL=https://your-app-production.up.railway.app
   ```
3. Commit and push:
   ```bash
   git add .
   git commit -m "Update backend URL for production"
   git push origin main
   ```

### Step 2: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click **"Add New Project"**
4. Import your `chat-app` repository
5. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### Step 3: Add Environment Variable in Vercel
1. In Vercel project settings → **Environment Variables**
2. Add:
   ```
   VITE_BACKEND_URL = https://your-app-production.up.railway.app
   ```
3. Click **"Save"**
4. **Redeploy** the project

### Step 4: Update Railway FRONTEND_URL
1. Go back to Railway dashboard
2. Update the `FRONTEND_URL` variable with your **Vercel URL**:
   ```
   FRONTEND_URL=https://your-app.vercel.app
   ```
3. Railway will auto-redeploy

---

## ✅ Verification

### Test Backend
Visit: `https://your-app-production.up.railway.app/api/status`

Should return: `"Server is running"`

### Test Frontend
1. Visit your Vercel URL
2. Try to sign up/login
3. Send messages
4. Real-time features should work! ✨

---

## 🔧 Local Development

For local development, use:

**Frontend** (`client/.env.local`):
```
VITE_BACKEND_URL=http://localhost:5000
```

**Backend** (`server/.env`):
```
FRONTEND_URL=http://localhost:5173
```

Then run:
```bash
# Terminal 1 - Backend
cd server
npm run server

# Terminal 2 - Frontend  
cd client
npm run dev
```

---

## 🐛 Troubleshooting

### Issue: CORS Error
- Make sure `FRONTEND_URL` in Railway matches your Vercel URL exactly
- Check Railway logs for CORS errors

### Issue: Socket.io not connecting
- Verify Railway backend URL in frontend `.env`
- Check browser console for WebSocket errors
- Ensure Railway app is running (not sleeping)

### Issue: 500 Errors
- Check Railway logs: Dashboard → **Deployments** → **View Logs**
- Verify all environment variables are set correctly
- Check MongoDB connection string

---

## 📊 Free Tier Limits

**Railway Free Tier:**
- $5 free credit per month
- ~500 hours runtime
- No credit card required initially

**Vercel Free Tier:**
- Unlimited deployments
- 100GB bandwidth/month
- Automatic HTTPS

---

## 🎉 You're Done!

Your app is now deployed with:
- ✅ Real-time messaging (Socket.io)
- ✅ AI features (Google Gemini)
- ✅ Image uploads (Cloudinary)
- ✅ Global CDN (Vercel)
- ✅ Always-on backend (Railway)

**Live URLs:**
- Frontend: `https://your-app.vercel.app`
- Backend: `https://your-app-production.up.railway.app`
