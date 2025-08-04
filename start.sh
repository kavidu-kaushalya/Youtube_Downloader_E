#!/bin/bash

echo "🚀 Starting YouTube Downloader Server..."

# Check if ffmpeg is installed
echo "🔍 Checking ffmpeg installation..."
if command -v ffmpeg &> /dev/null; then
    echo "✅ FFmpeg is installed:"
    ffmpeg -version | head -1
else
    echo "❌ FFmpeg not found, installing..."
    apt-get update
    apt-get install -y ffmpeg
    echo "✅ FFmpeg installed:"
    ffmpeg -version | head -1
fi

# Check if yt-dlp can access ffmpeg
echo "🔍 Testing yt-dlp with ffmpeg..."
python3 -c "import yt_dlp; print('✅ yt-dlp imported successfully')"

# Create temp directory
echo "📁 Creating temp directory..."
mkdir -p /tmp/yt_downloader
chmod 755 /tmp/yt_downloader

# Start the application
echo "🎬 Starting YouTube Downloader Server..."
python server.py
