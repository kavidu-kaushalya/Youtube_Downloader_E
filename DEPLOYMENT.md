# Railway Deployment Guide

## Step 1: Initialize Git Repository
```bash
git init
git add .
git commit -m "Initial commit - YouTube Downloader"
```

## Step 2: Create GitHub Repository
1. Go to https://github.com
2. Create new repository: "Youtube_Downloader_E"
3. Push code:
```bash
git remote add origin https://github.com/YOUR_USERNAME/Youtube_Downloader_E.git
git branch -M main
git push -u origin main
```

## Step 3: Deploy to Railway
1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose your "Youtube_Downloader_E" repository
6. Railway will auto-deploy!

## Step 4: Get Your URL
- Railway will give you a URL like: `https://your-app-name.railway.app`
- Copy this URL

## Step 5: Update Extension Config
1. Open `config.js`
2. Replace `'https://your-railway-app-name.railway.app'` with your actual Railway URL
3. Change `return 'development';` to `return 'production';`
4. Reload extension in Chrome

## Done! 🚀
Your YouTube downloader is now available globally!
