#!/bin/bash

echo "🚀 Railway Build Script for YouTube Downloader"

# Update package lists
echo "📦 Updating package lists..."
apt-get update

# Install ffmpeg and other dependencies
echo "🎬 Installing ffmpeg and dependencies..."
apt-get install -y \
    ffmpeg \
    curl \
    wget \
    ca-certificates

# Verify ffmpeg installation
echo "✅ Verifying ffmpeg installation..."
ffmpeg -version | head -3

# Install Python dependencies
echo "🐍 Installing Python dependencies..."
pip install --no-cache-dir -r requirements.txt

# Create required directories
echo "📁 Creating required directories..."
mkdir -p /tmp/yt_downloader
chmod 755 /tmp/yt_downloader

echo "✅ Build completed successfully!"
