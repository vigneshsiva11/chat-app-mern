# Deployment Guide: Render + Vercel (FREE)

## 📦 Architecture
- **Backend**: Render (Node.js + Socket.io) - 100% FREE
- **Frontend**: Vercel (React + Vite) - 100% FREE
- **Database**: MongoDB Atlas - FREE Tier

---

## 🎨 Part 1: Deploy Backend to Render (FREE)

### Step 1: Create Render Account
1. Go to [render.com](https://render.com)
2. Click **"Get Started"**
3. Sign up with **GitHub** (recommended)

### Step 2: Create New Web Service
1. Click **"New +"** → **"Web Service"**
2. Click **"Connect GitHub"** and authorize Render
3. Find and select your **`chat-app`** repository
4. Click **"Connect"**

### Step 3: Configure Web Service

**Basic Settings:**
- **Name**: `chat-app-backend` (or any name you prefer)
- **Region**: Choose closest to you (e.g., Oregon, Frankfurt, Singapore)
- **Branch**: `main`
- **Root Directory**: `server`
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `node server.js`

**Instance Type:**
- Select **"Free"** (This is important! ✅)

### Step 4: Add Environment Variables
Scroll down to **"Environment Variables"** section and click **"Add Environment Variable"**

Add each of these one by one:

```
MONGODB_URI = mongodb+srv://vigneshse23_db_user:vignesh123@cluster0.xwnuqjm.mongodb.net

JWT_SECRET = vs#secret

PORT = 5000

NODE_ENV = production

CLOUDINARY_CLOUD_NAME = ded9ub7cr

CLOUDINARY_API_KEY = 944865746549945

CLOUDINARY_API_SECRET = O_McPovVAmNddvnpXLDlNt1tlZo

GEMINI_API_KEY = AIzaSyByA14X_zEcx6ZZLvNj1oqUgkYUJK79D7c

GEMINI_MODEL = gemini-flash-latest

AI_RATE_LIMIT_ENABLED = true

AI_CACHE_TTL = 86400

MODERATION_ENABLED = false

FRONTEND_URL = https://your-app.vercel.app
```

**Note**: You'll update `FRONTEND_URL` after deploying frontend (Part 2)

### Step 5: Deploy!
1. Click **"Create Web Service"** at the bottom
2. Render will start building and deploying your backend
3. Wait 3-5 minutes for the first deployment
4. You'll see logs in real-time

### Step 6: Get Your Render URL
1. After successful deployment, you'll see: **"Your service is live 🎉"**
2. Your backend URL will be: `https://chat-app-backend.onrender.com`
3. **Copy this URL** - you'll need it for the frontend!

### Step 7: Test Your Backend
Visit: `https://chat-app-backend.onrender.com/api/status`

Should return: `"Server is running"` ✅

---

## ▲ Part 2: Deploy Frontend to Vercel

### Step 1: Update Frontend Environment Variable
1. Open `client/.env`
2. Replace with your **Render backend URL**:
   ```
   VITE_BACKEND_URL=https://chat-app-backend.onrender.com
   ```
3. Commit and push:
   ```bash
   git add .
   git commit -m "Update backend URL for Render deployment"
   git push origin main
   ```

### Step 2: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign in with **GitHub**
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
   VITE_BACKEND_URL = https://chat-app-backend.onrender.com
   ```
   *(Use your actual Render URL)*
3. Click **"Save"**
4. Click **"Redeploy"** to apply changes

### Step 4: Update Render FRONTEND_URL
1. Go back to **Render dashboard**
2. Select your `chat-app-backend` service
3. Go to **"Environment"** tab
4. Update the `FRONTEND_URL` variable with your **Vercel URL**:
   ```
   FRONTEND_URL = https://your-app.vercel.app
   ```
5. Click **"Save Changes"**
6. Render will auto-redeploy (takes 2-3 minutes)

---

## ✅ Verification

### Test Backend
Visit: `https://chat-app-backend.onrender.com/api/status`

Should return: `"Server is running"` ✅

### Test Frontend
1. Visit your Vercel URL: `https://your-app.vercel.app`
2. Try to **sign up/login**
3. Send messages
4. Real-time features should work! ✨

---

## ⚠️ Important: Render Free Tier Notes

**Render Free Services:**
- ✅ Completely FREE forever
- ✅ 750 hours/month (enough for 1 service running 24/7)
- ⚠️ **Spins down after 15 minutes of inactivity**
- ⏱️ Takes 30-60 seconds to wake up on first request

**What this means:**
- If no one uses your app for 15 minutes, the backend "sleeps"
- First request after sleep will be slow (30-60s)
- Subsequent requests will be fast
- This is normal for Render's free tier!

**Solutions:**
1. **Accept the delay** (simplest, free)
2. **Keep-alive service** (ping your backend every 14 minutes)
3. **Upgrade to paid** ($7/month for always-on service)

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

### Issue: Backend is sleeping / First request is slow
**Symptom**: App takes 30-60 seconds to load initially
- **Solution**: This is normal for Render free tier! The backend wakes up after first request
- **Tip**: Refresh the page after 1 minute and it will be fast

### Issue: CORS Error
**Symptom**: Browser console shows "CORS policy blocked"
- Make sure `FRONTEND_URL` in Render matches your Vercel URL exactly (including https://)
- Check Render logs for CORS errors
- Verify no trailing slash in URLs

### Issue: Socket.io not connecting
**Symptom**: Real-time messaging doesn't work
- Verify Render backend URL in frontend `.env`
- Check browser console for WebSocket errors
- Make sure backend is awake (visit `/api/status` first)
- Check Render logs for connection errors

### Issue: 500 Errors
**Symptom**: API requests fail with 500 status
- Check **Render logs**: Dashboard → Select Service → **Logs** tab
- Verify all environment variables are set correctly
- Check MongoDB connection string is correct
- Look for specific error messages in logs

### Issue: Build Failed on Render
**Symptom**: Deployment shows "Build failed"
- Check **Render logs** for specific error
- Verify `Root Directory` is set to `server`
- Make sure all dependencies are in `package.json`
- Try manual redeploy: **Manual Deploy** → **Deploy latest commit**

### Issue: MongoDB Connection Error
**Symptom**: Backend logs show "MongoDB connection failed"
- Verify MongoDB URI is correct
- Check MongoDB Atlas firewall: Allow access from **0.0.0.0/0** (all IPs)
- Make sure database user has correct permissions

### Issue: Environment Variables Not Working
**Symptom**: App can't find API keys or config
- Go to Render → **Environment** tab
- Check all variables are spelled correctly (case-sensitive)
- No quotes around values in Render dashboard
- Click **Save Changes** after editing
- **Manual Deploy** to apply changes

---

## 📊 Free Tier Comparison

### Render Free Tier (Recommended ✅):
- ✅ **100% FREE forever**
- ✅ 750 hours/month runtime
- ✅ Custom domains
- ✅ Automatic HTTPS
- ✅ Socket.io support
- ⚠️ Spins down after 15 min inactivity
- ⚠️ 512 MB RAM

### Vercel Free Tier:
- ✅ **100% FREE forever**
- ✅ Unlimited deployments
- ✅ 100GB bandwidth/month
- ✅ Global CDN
- ✅ Automatic HTTPS
- ✅ Perfect for frontend

### MongoDB Atlas Free Tier:
- ✅ **100% FREE forever**
- ✅ 512 MB storage
- ✅ Shared cluster
- ✅ Great for learning/small projects

---

## 🎉 You're Done!

Your app is now deployed with:
- ✅ Real-time messaging (Socket.io)
- ✅ AI features (Google Gemini)
- ✅ Image uploads (Cloudinary)
- ✅ Global CDN (Vercel)
- ✅ Always-accessible backend (Render)
- ✅ **100% FREE hosting!**

**Live URLs:**
- Frontend: `https://your-app.vercel.app`
- Backend: `https://chat-app-backend.onrender.com`

---

## 🚀 Optional: Keep Backend Awake

If you want to avoid the 30-60s wake-up delay, you can use a free service to ping your backend every 14 minutes:

### Option 1: UptimeRobot (Recommended)
1. Go to [uptimerobot.com](https://uptimerobot.com)
2. Sign up for free
3. Create new monitor:
   - **Type**: HTTP(s)
   - **URL**: `https://chat-app-backend.onrender.com/api/status`
   - **Monitoring Interval**: 5 minutes
4. Done! Your backend will never sleep ✅

### Option 2: Cron-Job.org
1. Go to [cron-job.org](https://cron-job.org)
2. Sign up for free
3. Create new cron job:
   - **URL**: `https://chat-app-backend.onrender.com/api/status`
   - **Interval**: Every 14 minutes
4. Enable the job

**Note**: This keeps your backend responsive 24/7 on the free tier!

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
