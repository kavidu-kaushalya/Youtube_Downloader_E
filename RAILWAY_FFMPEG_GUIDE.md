# Railway FFmpeg Installation Guide

## 🚀 Automatic FFmpeg Installation on Railway

This project is configured to automatically install FFmpeg on Railway using Docker.

### 📋 How it Works:

1. **Dockerfile Method** (Primary):
   ```dockerfile
   FROM python:3.11-slim
   RUN apt-get update && apt-get install -y ffmpeg
   ```

2. **Build Script** (Fallback):
   ```bash
   apt-get install -y ffmpeg curl wget
   ```

3. **Runtime Detection**:
   - Server automatically detects if ffmpeg is available
   - Uses high-quality merged formats if ffmpeg is present
   - Falls back to single formats if ffmpeg is missing

### 🎯 Quality Selection Logic:

**With FFmpeg (Better Quality):**
- `720p`: `bestvideo[height<=720]+bestaudio` (Merged)
- Result: Higher quality with separate video/audio streams

**Without FFmpeg (Fallback):**
- `720p`: `best[height<=720][ext=mp4]` (Single file)
- Result: Good quality but single stream

### 🔧 Railway Configuration:

1. **railway.json**:
   ```json
   {
     "build": { "builder": "DOCKERFILE" },
     "deploy": { "restartPolicyType": "ON_FAILURE" }
   }
   ```

2. **Environment Variables** (Optional):
   ```
   FFMPEG_BINARY=/usr/bin/ffmpeg
   FFPROBE_BINARY=/usr/bin/ffprobe
   ```

### 🛠️ Manual Railway Setup (If Needed):

If automatic installation fails:

1. **Railway Dashboard** → Your Project → Settings
2. **Add Environment Variables**:
   ```
   NIXPACKS_BUILD_CMD=apt-get update && apt-get install -y ffmpeg && pip install -r requirements.txt
   ```

3. **Or use Build Command**:
   ```
   bash build.sh
   ```

### ✅ Verification:

Check Railway logs for:
```
✅ FFmpeg is available and working
   Version: ffmpeg version 4.4.2
```

### 🔍 Troubleshooting:

**Problem**: FFmpeg not found
**Solution**: 
1. Check Railway build logs
2. Verify Dockerfile is being used
3. Add manual build command in Railway settings

**Problem**: Merge errors
**Solution**: 
- Server automatically falls back to single format
- No user intervention needed

### 📱 Client Impact:

- **Extension works the same** regardless of ffmpeg status
- **Higher quality** downloads when ffmpeg is available
- **Automatic fallback** ensures downloads always work

The system is designed to be resilient and work in both scenarios!
