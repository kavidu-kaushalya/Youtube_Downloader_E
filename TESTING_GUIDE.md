# 🧪 Testing Guide

## Test Your YouTube Downloader Extension

### 1. 📦 Load Extension in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (top right toggle)
3. Click "Load unpacked"
4. Select the `Youtube_Downloader_E` folder
5. ✅ Extension should appear with green "Active" status

### 2. 🌐 Test Server Connection

1. Open: https://web-production-7d830.up.railway.app/
2. ✅ Should see: `{"status": "YouTube Downloader Server is running!"}`
3. ✅ Look for FFmpeg status in response

### 3. 📹 Test Video Download

1. **Go to any YouTube video** (example: https://www.youtube.com/watch?v=dQw4w9WgXcQ)
2. **Look for download button** next to Like/Dislike buttons
3. **Click download button** → quality selection popup should appear
4. **Select quality** (720p, 480p, 360p, or Audio Only)
5. **Click Download** → video should download

### 4. 🔍 Debug Issues

#### Extension Not Visible:
```
1. Check chrome://extensions/ for errors
2. Reload extension
3. Refresh YouTube page
```

#### Download Button Missing:
```
1. Open Developer Tools (F12)
2. Check Console for errors
3. Verify content.js is injected
4. Check if server URL is correct in config.js
```

#### Download Fails:
```
1. Test server URL directly in browser
2. Check Network tab in Developer Tools
3. Verify CORS headers in server response
4. Test with different video (some may be restricted)
```

### 5. 📊 Quality Testing

**Test different qualities:**
- 720p (High quality)
- 480p (Medium)
- 360p (Standard)
- Audio Only (MP3)

**Expected behavior:**
- With FFmpeg: Better quality, merged streams
- Without FFmpeg: Good quality, single streams
- All formats should work regardless

### 6. 🚀 Production Testing

**Test URLs:**
- Primary: https://web-production-7d830.up.railway.app/
- Backup: https://web-production-53e76.up.railway.app/

**Test endpoints:**
```
GET /                    → Server status
POST /video-info         → Video metadata
POST /download           → Download video
```

### 7. 📱 Mobile Testing (Optional)

1. Install Kiwi Browser (Chrome-based Android browser)
2. Load extension same way as desktop
3. Test on mobile YouTube

### 🎯 Success Criteria:

✅ Extension loads without errors
✅ Download button appears on YouTube videos
✅ Quality selection popup works
✅ Downloads complete successfully
✅ Multiple formats work (video + audio)

### 🐛 Common Issues & Solutions:

| Issue | Solution |
|-------|----------|
| CORS Error | Update manifest.json permissions |
| FFmpeg Error | Server automatically handles fallback |
| Bot Detection | Server implements anti-bot measures |
| Rate Limiting | Built-in rate limiting prevents blocks |

### 📋 Test Checklist:

- [ ] Extension installed and active
- [ ] Server responds to health check
- [ ] Download button visible on YouTube
- [ ] Quality popup opens and closes
- [ ] 720p download works
- [ ] Audio-only download works
- [ ] Files save to Downloads folder
- [ ] No console errors
- [ ] Works on different YouTube videos
